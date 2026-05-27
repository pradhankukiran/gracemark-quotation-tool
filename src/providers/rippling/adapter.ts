/**
 * Rippling `QuoteProvider` implementation. Translates between our normalized
 * provider-agnostic contracts and Rippling's `get_employer_cost_breakdown`
 * REST endpoint.
 *
 * Notes on Rippling's API that shape this adapter:
 *
 * - The endpoint is unauthenticated and lives at the website host
 *   (`app.rippling.com`), not a dedicated API gateway.
 * - Money values come back as decimal strings (e.g. "34722.08"), like Deel.
 * - Each item in `costs[]` carries both a `monthly_value` and `yearly_value`;
 *   we use `monthly_value` so every employer-cost line is emitted as a
 *   monthly cost_line.
 * - Rippling does not surface a severance accrual field, so
 *   `monthly.severance_accrual` is always 0 here; the merge layer can pad it
 *   in from Papaya if available.
 * - Category is inferred from the `title` regex, matching the DRY pattern
 *   Remote uses; `inferBucket(category)` then resolves the bucket.
 */

import { countries } from "@/data/deel/lookups";
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

import { RipplingClient } from "./client";
import { getRipplingConfig } from "./config";
import type {
  RipplingCostBreakdownRequest,
  RipplingCostBreakdownResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Rippling returns money values as decimal strings (e.g. "12500.00"). Convert
 * to a finite `number`. `null` / `undefined` become `0`.
 */
function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

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

/**
 * Classify a Rippling cost line by its `title`. Order matters — the more
 * specific severance / accrual patterns are checked before the broader
 * allowance pattern. The family-allowance guard sits ABOVE the broader
 * allowance regex because "Family Allowance Fund Contribution" (Argentina's
 * `asignaciones familiares` employer contribution) is a STATUTORY payroll tax,
 * not an employee perk — without the guard the `/allowance/i` branch would
 * mis-tag it as `allowances`.
 */
function categorizeRipplingLine(name: string): CostLine["category"] {
  if (/13th|14th|aguinaldo|tredicesima|christmas\s*bonus|holiday\s*bonus|vacation\s*bonus/i.test(name)) {
    return "accruals";
  }
  if (/severance|fgts|indemnity|gratuity|notice/i.test(name)) {
    return "severance";
  }
  if (/family\s*allowance|asignaciones\s*familiares/i.test(name)) {
    return "statutory";
  }
  if (/allowance|telework|wfh|remote|home\s*office|transport|meal|food|stipend|reimburs/i.test(name)) {
    return "allowances";
  }
  return "statutory";
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapQuote(
  input: QuoteRequest,
  response: RipplingCostBreakdownResponse
): NormalizedQuote {
  const monthlySalary = toNumber(response.gross_salary?.monthly_value);

  // Degenerate zero quote: Rippling responded with no useful data. Treat as
  // unsupported rather than silently surfacing a salary-only result.
  const employerCost = toNumber(response.employer_cost?.monthly_value);
  if (monthlySalary === 0 && employerCost === 0) {
    throw new ProviderError({ kind: "unsupported" });
  }

  // Base salary line — sits at the top of the breakdown so the table reads
  // from the employee's gross pay down through statutory additions.
  const salaryLine: CostLine = {
    name: "Base salary",
    amount: monthlySalary,
    frequency: "monthly",
    category: "base_salary",
    bucket: "base_salary",
  };

  // Employer cost lines from Rippling's `costs[]`. All values are emitted as
  // monthly using `monthly_value`; the `yearly_value` field is ignored to keep
  // a single frequency invariant. Category + bucket are inferred from `title`.
  const employerCostLines: CostLine[] = (response.costs ?? []).map((c) => {
    const category = categorizeRipplingLine(c.title);
    return {
      name: c.title,
      amount: toNumber(c.monthly_value),
      frequency: "monthly" as const,
      category,
      bucket: inferBucket(category),
    };
  });

  const costLines: CostLine[] = [salaryLine, ...employerCostLines];

  const monthlyTotal = round2(
    costLines.reduce((sum, line) => sum + line.amount, 0)
  );

  return {
    provider: "rippling",
    request: input,
    currency: input.currency,
    monthly: {
      severance_accrual: 0,
      total: monthlyTotal,
    },
    cost_lines: costLines,
    raw: response,
  };
}

// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------

const config = getRipplingConfig();
const client = new RipplingClient({
  base_url: config.base_url,
  endpoint: config.endpoint,
});

export const ripplingProvider: QuoteProvider = {
  id: "rippling",
  display_name: "Rippling",

  async listCountries(): Promise<Country[]> {
    // Rippling does not expose a country list endpoint; reuse the Deel
    // canonical alpha-2 lookup and let unsupported combinations surface via
    // `quote()` outcomes.
    return mapCountries();
  },

  async quote(input: QuoteRequest): Promise<NormalizedQuote> {
    const body: RipplingCostBreakdownRequest = {
      locale_country: "en-US",
      role_data: {
        country_code: input.country_code.toUpperCase(),
        currency: input.currency.toUpperCase(),
        state: input.state ?? null,
        yearly_salary: input.annual_salary,
      },
    };
    const response = await client.post<RipplingCostBreakdownResponse>(body);
    const quote = mapQuote(input, response);
    assertQuoteInvariants(quote);
    return quote;
  },
};
