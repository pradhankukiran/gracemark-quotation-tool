/**
 * Payoneer (Skuad) Workforce Management EOR pricing adapter.
 *
 * The calculator is an unauthenticated endpoint hosted on
 * `cost-calculator.skuad.io` (Payoneer acquired Skuad; the calculator
 * still lives at the original domain). It returns pre-computed monthly
 * and yearly breakdowns for a single (country, currency, annual_salary).
 *
 * Country codes are ISO 3166-1 alpha-3. We convert from our canonical
 * alpha-2 input via `alpha2ToAlpha3` from the Remote country lookup.
 *
 * Skuad surfaces its own platform fee as `skuadFee` and a discount as
 * `skuadFeeDiscount`. Both are dropped here — Gracemark applies its own
 * markup, and including the platform fee would dwarf statutory costs and
 * break the apples-to-apples comparison. `monthly.total` is reconstructed
 * from the line items we keep.
 *
 * Severance from `employerSeveranceAccrualsEstCost` plus
 * `employerAdditionalSeveranceAccrualsEstCost` is tracked separately in
 * `monthly.severance_accrual` (NOT in cost_lines), matching the convention
 * `assertQuoteInvariants` enforces.
 */

import { countries } from "@/data/deel/lookups";
import { alpha2ToAlpha3 } from "@/data/remote/lookups";
import { inferBucket } from "@/providers/_core/buckets";
import { ProviderError } from "@/providers/_core/errors";
import { assertQuoteInvariants } from "@/providers/_core/invariants";
import type {
  CostLine,
  Country,
  NormalizedQuote,
  QuoteProvider,
  QuoteRequest,
} from "@/providers/_core/types";

import { PayoneerClient } from "./client";
import { getPayoneerConfig } from "./config";
import type { PayoneerCostBreakup, PayoneerPeriodBreakdown } from "./types";

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

function toLines(
  breakup: PayoneerCostBreakup[] | undefined,
  category: CostLine["category"]
): CostLine[] {
  if (!breakup || breakup.length === 0) return [];
  const result: CostLine[] = [];
  for (const [name, amount] of breakup) {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric === 0) continue;
    result.push({
      name,
      amount: numeric,
      frequency: "monthly",
      category,
      bucket: inferBucket(category),
    });
  }
  return result;
}

const config = getPayoneerConfig();
const client = new PayoneerClient({ base_url: config.base_url });

export const payoneerProvider: QuoteProvider = {
  id: "payoneer",
  display_name: "Payoneer",

  async listCountries(): Promise<Country[]> {
    // Payoneer/Skuad does not expose a country list endpoint. Reuse the Deel
    // canonical alpha-2 lookup and let unsupported combinations surface via
    // `quote()` outcomes (alpha-3 miss or upstream error).
    return mapCountries();
  },

  async quote(input: QuoteRequest): Promise<NormalizedQuote> {
    const alpha3 = alpha2ToAlpha3(input.country_code);
    if (!alpha3) {
      throw new ProviderError({
        kind: "unsupported",
        message: `Payoneer doesn't have data for ${input.country_code}`,
      });
    }

    const currency = input.currency.toUpperCase();
    const response = await client.getCostCalculator({
      country_alpha3: alpha3,
      currency,
      annual_salary: input.annual_salary,
    });

    const monthly: PayoneerPeriodBreakdown | undefined = response.data?.monthly;
    if (!monthly) {
      throw new ProviderError({
        kind: "unsupported",
        cause: response,
        message: `Payoneer response missing data.monthly for ${input.country_code} / ${currency}`,
      });
    }

    const grossSalary = Number(monthly.grossSalary ?? 0);
    if (!Number.isFinite(grossSalary) || grossSalary === 0) {
      throw new ProviderError({
        kind: "unsupported",
        cause: { country: input.country_code, currency: input.currency },
        message: `Payoneer returned no calculation for ${input.country_code} / ${input.currency}`,
      });
    }

    const baseSalaryLine: CostLine = {
      name: "Base salary",
      amount: round2(grossSalary),
      frequency: "monthly",
      category: "base_salary",
      bucket: "base_salary",
    };

    const statutoryLines: CostLine[] = [
      ...toLines(monthly.employerEstTaxBreakup, "statutory"),
      ...toLines(monthly.employerEstAdditionalContributionCostBreakup, "statutory"),
      ...toLines(monthly.employerEstTaxVatCostBreakup, "statutory"),
      ...toLines(monthly.employerEstAdditionalVatCostBreakup, "statutory"),
    ];

    const accrualLines: CostLine[] = [
      ...toLines(monthly.employerMandatoryAccrualsEstCostBreakup, "accruals"),
      ...toLines(monthly.employerAdditionalMandatoryAccrualsEstCostBreakup, "accruals"),
    ];

    const costLines: CostLine[] = [baseSalaryLine, ...statutoryLines, ...accrualLines];

    const severanceAccrual = round2(
      Number(monthly.employerSeveranceAccrualsEstCost ?? 0) +
        Number(monthly.employerAdditionalSeveranceAccrualsEstCost ?? 0)
    );

    const monthlyTotal = round2(
      costLines.reduce((sum, line) => sum + line.amount, 0) + severanceAccrual
    );

    const quote: NormalizedQuote = {
      provider: "payoneer",
      request: input,
      currency,
      monthly: {
        severance_accrual: severanceAccrual,
        total: monthlyTotal,
      },
      cost_lines: costLines,
      raw: response,
    };

    assertQuoteInvariants(quote);
    return quote;
  },
};
