/**
 * Remote `QuoteProvider` implementation. Translates between our normalized
 * provider-agnostic contracts and Remote's `gateway.remote.com/v1` REST API.
 *
 * Notes on Remote's API that shape this adapter:
 *
 * - All money values in `/v1/cost-calculator/estimation` (both directions)
 *   are **integer cents**, despite the schema description claiming
 *   "Annual gross salary in BRL" — verified empirically.
 */

import {
  getCostCalcCountryByAlpha2,
  getCurrencySlug,
  getRegionSlug,
  countries as remoteCountries,
} from "@/data/remote/lookups";
import { getFxSnapshot } from "@/lib/fx";
import { inferBucket } from "@/providers/_core/buckets";
import { ProviderError } from "@/providers/_core/errors";
import { assertQuoteInvariants } from "@/providers/_core/invariants";
import type {
  CostLine,
  Country,
  FxSnapshot,
  NormalizedQuote,
  QuoteProvider,
  QuoteRequest,
} from "@/providers/_core/types";

import { RemoteClient } from "./client";
import type {
  RemoteBreakdownLine,
  RemoteEstimationRequest,
  RemoteEstimationResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert integer cents → major units. Treats nullish / non-finite as `0`. */
function fromCents(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) return 0;
  return Math.round(value) / 100;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapCountries(): Country[] {
  return remoteCountries.map((c) => {
    const costCalc = getCostCalcCountryByAlpha2(c.alpha_2_code);
    const subdivisions = c.country_subdivisions ?? [];
    // Country may have multiple subdivision types (e.g. Brazil has both
    // "State" and "Federal district"). Use the most common one as the label;
    // fall back to the first when nothing else is available.
    const subdivisionTypes = subdivisions.map((s) => s.subdivision_type);
    const stateType = subdivisionTypes[0] ?? null;
    return {
      code: c.alpha_2_code,
      name: c.name,
      default_currency: costCalc?.currency.code ?? "",
      state_type: subdivisions.length > 0 ? stateType : null,
      states: subdivisions.map((s) => ({ code: s.code, name: s.name })),
      eor_support: c.eor_onboarding,
      // Remote's countries lookup does not expose visa data on this endpoint.
      visa_support: false,
    };
  });
}

/**
 * Classify a Remote breakdown line by name. Remote groups payroll
 * contributions in `monthly_contributions_breakdown` (statutory taxes)
 * and lump-sum extras in `extra_statutory_payments_breakdown` (13th, etc.).
 * Name-based override catches allowances and severance lines wherever
 * Remote chooses to place them.
 *
 * The family-allowance guard sits ABOVE the broader allowance regex because
 * "Family Allowance Fund Contribution" (Argentina's `asignaciones familiares`
 * employer contribution) is a STATUTORY payroll tax, not an employee perk —
 * without the guard the `/allowance/i` branch would mis-tag it as `allowances`.
 */
function categorizeRemoteLine(
  name: string,
  bucket: "monthly_contributions" | "extra_statutory"
): CostLine["category"] {
  if (/severance/i.test(name)) return "severance";
  if (/family\s*allowance|asignaciones\s*familiares/i.test(name)) {
    return "statutory";
  }
  if (/allowance|reimburs|wfh|transit|stipend/i.test(name)) return "allowances";
  if (/13th|14th|vacation\s*(bonus|allowance|pay)|holiday\s*bonus|christmas\s*bonus/i.test(name)) {
    return "accruals";
  }
  return bucket === "extra_statutory" ? "accruals" : "statutory";
}

function breakdownToCostLines(
  lines: RemoteBreakdownLine[] | undefined,
  frequency: "monthly" | "annual",
  bucket: "monthly_contributions" | "extra_statutory"
): CostLine[] {
  return (lines ?? []).map((line) => {
    const category = categorizeRemoteLine(line.name, bucket);
    return {
      name: line.name,
      amount: fromCents(line.amount),
      frequency,
      category,
      bucket: inferBucket(category),
    };
  });
}

function mapQuote(
  input: QuoteRequest,
  response: RemoteEstimationResponse
): NormalizedQuote {
  const employment = response.data.employments[0];
  if (!employment) {
    throw new ProviderError({
      kind: "upstream",
      message: "Remote API returned no employment results.",
    });
  }

  // Quote is rendered in the user-picked (employer) currency.
  const costs = employment.employer_currency_costs;

  const monthlySalary = fromCents(costs.monthly_gross_salary);
  const severanceAccrual = 0; // Deferred — handled by a separate library.

  // Remote's `monthly_management_fee` is intentionally excluded — this app
  // tracks labor cost only.
  const statutoryMonthly = breakdownToCostLines(
    costs.monthly_contributions_breakdown,
    "monthly",
    "monthly_contributions"
  );
  const statutoryAnnual = breakdownToCostLines(
    costs.extra_statutory_payments_breakdown,
    "annual",
    "extra_statutory"
  );

  // Base salary line — sits at the top of the breakdown so the table reads
  // from the employee's gross pay down through statutory additions.
  const salaryLine: CostLine = {
    name: "Base salary",
    amount: monthlySalary,
    frequency: "monthly",
    category: "base_salary",
    bucket: inferBucket("base_salary"),
  };

  const costLines: CostLine[] = [
    salaryLine,
    ...statutoryMonthly,
    ...statutoryAnnual,
  ];

  const monthlyLineSum = costLines
    .filter((line) => line.frequency === "monthly")
    .reduce((sum, line) => sum + line.amount, 0);
  const annualLineSum = costLines
    .filter((line) => line.frequency === "annual")
    .reduce((sum, line) => sum + line.amount, 0);
  const monthlyTotal = round2(
    monthlyLineSum + annualLineSum / 12 + severanceAccrual
  );

  return {
    provider: "remote",
    request: input,
    currency: costs.currency.code || input.currency,
    monthly: {
      severance_accrual: severanceAccrual,
      total: monthlyTotal,
    },
    cost_lines: costLines,
    raw: response,
  };
}

// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------

const client = new RemoteClient();

export const remoteProvider: QuoteProvider = {
  id: "remote",
  display_name: "Remote",

  async listCountries(): Promise<Country[]> {
    // Static data; no API call.
    return mapCountries();
  },

  async quote(input: QuoteRequest): Promise<NormalizedQuote> {
    const regionSlug = getRegionSlug(input.country_code);
    if (!regionSlug) {
      throw new ProviderError({
        kind: "unsupported",
        cause: input.country_code,
        message: "Remote does not support EOR in this country",
      });
    }
    const currencySlug = getCurrencySlug(input.currency);
    if (!currencySlug) {
      throw new ProviderError({
        kind: "invalid_input",
        cause: input.currency,
        message: `Remote does not recognise currency code "${input.currency}".`,
      });
    }

    const costCalc = getCostCalcCountryByAlpha2(input.country_code);
    const regionalCurrency = costCalc?.currency.code?.toUpperCase() ?? "";
    const userCurrency = input.currency.toUpperCase();

    const employerSalaryCents = Math.round(input.annual_salary * 100);
    let regionalSalaryCents = employerSalaryCents;
    let exchangeRate = "1.0";

    if (regionalCurrency && regionalCurrency !== userCurrency) {
      let fx: FxSnapshot | null;
      try {
        // rate = how many `userCurrency` (employer) units per 1 `regionalCurrency` unit.
        fx = await getFxSnapshot(regionalCurrency, userCurrency);
      } catch (err) {
        throw new ProviderError({
          kind: "upstream",
          cause: err,
          message: `Remote: FX conversion ${regionalCurrency}→${userCurrency} failed`,
        });
      }
      if (!fx || !Number.isFinite(fx.rate) || fx.rate <= 0) {
        throw new ProviderError({
          kind: "upstream",
          message: `Remote: no usable FX rate ${regionalCurrency}→${userCurrency}`,
        });
      }
      regionalSalaryCents = Math.round(input.annual_salary / fx.rate * 100);
      exchangeRate = String(fx.rate);
    }

    const body: RemoteEstimationRequest = {
      employer_currency_slug: currencySlug,
      include_benefits: false,
      include_cost_breakdowns: true,
      include_management_fee: true,
      include_premium_benefits: false,
      employments: [
        {
          region_slug: regionSlug,
          annual_gross_salary: regionalSalaryCents,
          annual_gross_salary_in_employer_currency: employerSalaryCents,
          regional_to_employer_exchange_rate: exchangeRate,
          employment_term: "indefinite",
          title: "EOR Quote",
          age: 30,
        },
      ],
    };

    const response = await client.post<RemoteEstimationResponse>(
      "/v1/cost-calculator/estimation",
      body
    );
    const quote = mapQuote(input, response);
    assertQuoteInvariants(quote);
    return quote;
  },
};
