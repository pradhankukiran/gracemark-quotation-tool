import { NextResponse } from "next/server";
import { z } from "zod";
import {
  BACKGROUND_CHECK_FEE_USD,
  MAX_WORKED_HOURS,
  TRANSACTION_FEE_USD,
  composeICQuote,
} from "@/lib/contractor";
import { getFxSnapshot } from "@/lib/fx";
import type { FxSnapshot } from "@/providers/_core/types";

/**
 * Request body schema. Field names mirror `ContractorFormSnapshot` in
 * `src/lib/quote-state.ts` so the form snapshot can be POSTed directly.
 */
const RequestSchema = z.object({
  contractor_name: z.string().optional(),
  country_code: z
    .string()
    .regex(/^[A-Z]{2}$/, "country_code must be 2 uppercase letters"),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, "currency must be a 3-letter ISO code"),
  rate_basis: z.enum(["hourly", "monthly"]),
  pay_rate: z.number().positive(),
  markup_percentage: z.number().min(0).max(100).nullable().optional(),
  total_monthly_hours: z
    .number()
    .int()
    .min(1)
    .max(MAX_WORKED_HOURS)
    .optional(),
  msp_percentage: z.number().min(0).max(100).nullable().optional(),
  contract_duration: z.number().positive(),
  contract_duration_unit: z.enum(["months", "years"]),
  payment_frequency: z.enum(["weekly", "biweekly", "monthly"]),
  background_check_required: z.boolean(),
  display_in_usd: z.boolean().optional().default(false),
});

const TX_PER_MONTH: Record<"weekly" | "biweekly" | "monthly", number> = {
  weekly: 4,
  biweekly: 2,
  monthly: 1,
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Request body must be valid JSON" } },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          message: "Invalid request body",
          issues: parsed.error.issues,
        },
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const input = parsed.data;
  const currency = input.currency.toUpperCase();
  const txPerMonth = TX_PER_MONTH[input.payment_frequency];
  const durationMonths =
    input.contract_duration_unit === "years"
      ? input.contract_duration * 12
      : input.contract_duration;

  // ---- USD → local FX (required for bg-check + transaction passthrough) ----
  let usdToLocal: FxSnapshot | null = null;
  try {
    usdToLocal = await getFxSnapshot("USD", currency);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown FX provider error";
    return NextResponse.json(
      { error: { message } },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }

  // identity (currency === USD) → null snapshot; rate = 1
  const usdRate = usdToLocal ? usdToLocal.rate : 1;

  const transactionCostPerTransaction = TRANSACTION_FEE_USD * usdRate;
  const transactionCostMonthly = transactionCostPerTransaction * txPerMonth;

  const backgroundCheckMonthlyFee =
    input.background_check_required && durationMonths > 0
      ? (BACKGROUND_CHECK_FEE_USD * usdRate) / durationMonths
      : 0;

  // ---- Pure kernel: local-currency math ----
  const workedHours = input.total_monthly_hours ?? MAX_WORKED_HOURS;
  const markupPercentage =
    input.markup_percentage == null ? undefined : input.markup_percentage;
  const mspPercentage =
    input.msp_percentage == null ? undefined : input.msp_percentage;

  const kernel = composeICQuote({
    rateAmount: input.pay_rate,
    rateBasis: input.rate_basis,
    workedHours,
    markupPercentage,
    mspPercentage,
    transactionCost: transactionCostMonthly,
    backgroundCheckMonthlyFee,
  });

  // ---- local → USD FX (margin display; auxiliary — degrade gracefully) ----
  let localToUsd: FxSnapshot | null = null;
  let netMarginUsd: number | null = null;
  try {
    localToUsd = await getFxSnapshot(currency, "USD");
    // null snapshot ⇒ currency === USD; margin already in USD
    const usdMarginRate = localToUsd ? localToUsd.rate : 1;
    netMarginUsd = kernel.monthlyMarkup * usdMarginRate;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown FX provider error";
    console.warn(
      `[contractor/quote] local-to-USD FX failed for ${currency}: ${message}`
    );
    localToUsd = null;
    netMarginUsd = null;
  }

  // Applied percentages — what the kernel actually used after fallbacks.
  const appliedMarkupPercentage =
    markupPercentage !== undefined &&
    Number.isFinite(markupPercentage) &&
    markupPercentage > 0
      ? markupPercentage
      : 40; // DEFAULT_IC_MARKUP = 0.40 → 40%
  const appliedMspPercentage =
    mspPercentage !== undefined &&
    Number.isFinite(mspPercentage) &&
    mspPercentage > 0
      ? mspPercentage
      : 0;

  return NextResponse.json(
    {
      quote: {
        contractor_name: input.contractor_name ?? "",
        country_code: input.country_code,
        currency,
        rate_basis: input.rate_basis,

        pay_rate: round2(kernel.payRate),
        bill_rate: round2(kernel.billRate),
        agency_fee: round2(kernel.agencyFee),

        monthly_pay_rate: round2(kernel.monthlyPayRate),
        monthly_bill_rate: round2(kernel.monthlyBillRate),
        monthly_agency_fee: round2(kernel.monthlyAgencyFee),

        msp_fee: round2(kernel.mspFee),
        transaction_cost: round2(transactionCostMonthly),
        transaction_cost_per_tx: round2(transactionCostPerTransaction),
        transactions_per_month: txPerMonth,
        background_check_monthly_fee: round2(backgroundCheckMonthlyFee),
        total_monthly_costs: round2(kernel.totalMonthlyCosts),
        monthly_markup: round2(kernel.monthlyMarkup),
        net_margin_usd: netMarginUsd === null ? null : round2(netMarginUsd),

        worked_hours: workedHours,
        markup_percentage: appliedMarkupPercentage,
        msp_percentage: appliedMspPercentage,
      },
      fx: {
        usd_to_local: usdToLocal,
        local_to_usd: localToUsd,
      },
      generated_at: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
