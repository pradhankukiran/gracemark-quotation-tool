/**
 * Playroll EOR pricing adapter.
 *
 * The cost estimator is an unauthenticated POST endpoint at
 * api-eor-public.dev.playroll.com (note: `.dev.` subdomain). It accepts
 * alpha-2 country codes and a monthly gross salary, and returns a flat
 * list of `outputs` plus a synthetic "Total Cost to Company" aggregator
 * which we drop.
 *
 * Playroll does NOT include base salary in `outputs` — we prepend it
 * ourselves. Severance is itemized as line items (not surfaced as a
 * separate scalar), so it stays inside `cost_lines` with
 * `category: "severance"`; `monthly.severance_accrual` remains 0.
 *
 * Classifier: primarily by `output.id` (SOCIAL_SECURITY/PAYROLL_TAX/etc.),
 * with a label regex carve-out for explicit termination payouts so that
 * Brazil's monthly FGTS deposit is `accruals` while the "FGTS /
 * termination penalty" line is `severance`.
 *
 * Currency: Playroll ignores the input `currencyCode` field and treats
 * the raw `amount` as the country's local currency. We use
 * `prepareLocalCurrencyFx` from `@/providers/_core/fx` to convert the
 * user's salary to local currency before submitting, and convert response
 * line items back to the user's currency using the reciprocal of the
 * same rate. The base salary line is computed in the user's currency
 * directly. `NormalizedQuote.currency` is always the user's requested
 * currency.
 */

import { countries } from "@/data/deel/lookups";
import { inferBucket } from "@/providers/_core/buckets";
import { ProviderError } from "@/providers/_core/errors";
import { prepareLocalCurrencyFx } from "@/providers/_core/fx";
import { assertQuoteInvariants } from "@/providers/_core/invariants";
import type {
  CostLine,
  Country,
  NormalizedQuote,
  QuoteProvider,
  QuoteRequest,
} from "@/providers/_core/types";

import { PlayrollClient } from "./client";
import { getPlayrollConfig } from "./config";
import type { PlayrollOutput } from "./types";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function mapCountries(): Country[] {
  return countries.map((c) => ({
    code: c.code,
    name: c.name,
    default_currency: c.default_currency,
    state_type: c.state_type,
    states: c.states.map((s) => ({ code: s.code, name: s.name })),
    eor_support: c.eor_support,
    visa_support: c.visa_support,
  }));
}

function isTotalLine(output: PlayrollOutput): boolean {
  if (output.id === "Total Cost to Company") return true;
  if (/^total\s+cost/i.test(output.label ?? "")) return true;
  return false;
}

function classifyPlayrollLine(
  id: string,
  label: string
): CostLine["category"] {
  if (/termination|penalty\b|notice\s*period|firing\b/i.test(label)) {
    return "severance";
  }
  if (id === "RECREATIONAL_PAY") return "allowances";
  if (/meal|voucher|transport|wfh|home\s*office|stipend|reimburs/i.test(label)) {
    return "allowances";
  }
  if (id === "LABOUR_STANDARDS") return "accruals";
  if (id === "INCOME_COMPENSATION") return "accruals";
  return "statutory";
}

const config = getPlayrollConfig();
const client = new PlayrollClient({ base_url: config.base_url });

export const playrollProvider: QuoteProvider = {
  id: "playroll",
  display_name: "Playroll",

  async listCountries(): Promise<Country[]> {
    return mapCountries();
  },

  async quote(input: QuoteRequest): Promise<NormalizedQuote> {
    const fxCtx = await prepareLocalCurrencyFx(input, "Playroll");

    const response = await client.getEstimate({
      country_code: input.country_code.toUpperCase(),
      region: input.state ?? "",
      currency: fxCtx.localCurrency,
      monthly_salary: fxCtx.localMonthlySalary,
    });

    const rawOutputs = response.outputs ?? [];
    const lineOutputs = rawOutputs.filter((o) => !isTotalLine(o));
    if (lineOutputs.length === 0) {
      throw new ProviderError({
        kind: "unsupported",
        cause: response,
        message: `Playroll returned no calculation for ${input.country_code} / ${fxCtx.localCurrency}`,
      });
    }

    const outputCurrency = lineOutputs[0]?.currencyCode?.toUpperCase();
    if (outputCurrency && outputCurrency !== fxCtx.localCurrency) {
      throw new ProviderError({
        kind: "upstream",
        cause: { submitted: fxCtx.localCurrency, returned: outputCurrency },
        message: `Playroll returned ${outputCurrency} but ${fxCtx.localCurrency} was submitted`,
      });
    }

    const baseSalaryLine: CostLine = {
      name: "Base salary",
      amount: round2(fxCtx.userMonthlySalary),
      frequency: "monthly",
      category: "base_salary",
      bucket: "base_salary",
    };

    const itemLines: CostLine[] = lineOutputs
      .filter((o) => {
        const amount = Number(o.amount ?? 0);
        return Number.isFinite(amount) && amount !== 0;
      })
      .map((o) => {
        const category = classifyPlayrollLine(o.id ?? "", o.label ?? "");
        const amount = Number(o.amount) * fxCtx.localToUserRate;
        const frequency: CostLine["frequency"] =
          o.frequency === "annual" ? "annual" : "monthly";
        return {
          name: o.label || o.id || "Unknown",
          amount,
          frequency,
          category,
          bucket: inferBucket(category),
        };
      });

    const costLines: CostLine[] = [baseSalaryLine, ...itemLines];

    const monthlyTotal = round2(
      costLines.reduce(
        (sum, line) =>
          sum + (line.frequency === "annual" ? line.amount / 12 : line.amount),
        0
      )
    );

    const quote: NormalizedQuote = {
      provider: "playroll",
      request: input,
      currency: fxCtx.userCurrency,
      monthly: {
        severance_accrual: 0,
        total: monthlyTotal,
      },
      cost_lines: costLines,
      raw: response,
    };

    assertQuoteInvariants(quote);
    return quote;
  },
};
