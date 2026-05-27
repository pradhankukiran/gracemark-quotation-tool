/**
 * Rivermate `QuoteProvider` implementation. Translates between our normalized
 * provider-agnostic contracts and Rivermate's `employment-costs` REST endpoint.
 *
 * Notes on Rivermate's API that shape this adapter:
 *
 * - The endpoint is unauthenticated and lives at `api.rivermate.com`
 *   (calculator-endpoint style, like Oyster/Rippling/Pebl).
 * - Rivermate is the FIRST provider in this app that keys countries by ISO
 *   alpha-3 (e.g. "USA", "ARG", "BRA"). All other adapters use alpha-2, so the
 *   adapter relies on `alpha2ToAlpha3` (in `@/data/remote/lookups`) to convert.
 *   When the input alpha-2 isn't present in Remote's country list, the adapter
 *   surfaces `unsupported` — Remote's coverage is comprehensive but not
 *   universal, and a dedicated iso2→iso3 table can be added later if a future
 *   provider exposes countries Remote doesn't.
 * - Money values are returned as plain `number`s in major units. Employer
 *   cost lines are MONTHLY (no division needed); accruals carry both
 *   `monthly_provision` and `annual_amount`, and we emit `monthly_provision`.
 * - `total_employment_cost.monthly` includes `management_fee`; the adapter
 *   excludes the management fee from cost_lines (vendor platform fee policy,
 *   matching Pebl/Oyster/Rippling).
 * - `employee_deductions` is NOT modelled — it's the employee's side, not
 *   employer cost.
 * - Rivermate does not surface a severance accrual figure separately;
 *   `monthly.severance_accrual` is always 0 here and Papaya can gap-fill.
 * - Category is inferred from each item's `name` via regex, matching the DRY
 *   pattern used by Rippling/Remote; `inferBucket(category)` then resolves
 *   the bucket.
 */

import { countries } from "@/data/deel/lookups";
import { alpha2ToAlpha3 } from "@/data/remote/lookups";
import { inferBucket } from "@/providers/_core/buckets";
import { ProviderError } from "@/providers/_core/errors";
import { prepareLocalCurrencyFx } from "@/providers/_core/fx";
import type { LocalCurrencyFxContext } from "@/providers/_core/fx";
import { assertQuoteInvariants } from "@/providers/_core/invariants";
import type {
  CostLine,
  Country,
  NormalizedQuote,
  QuoteProvider,
  QuoteRequest,
} from "@/providers/_core/types";

import { RivermateClient } from "./client";
import { getRivermateConfig } from "./config";
import type { RivermateEmploymentCostsResponse } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
 * Classify a Rivermate cost line by its `name`. Order matters — more specific
 * severance / accrual / allowance patterns are checked before falling back to
 * `statutory`. Mirrors Rippling's classifier so cross-provider colors stay
 * consistent.
 *
 * The family-allowance guard sits ABOVE the broader allowance regex because
 * "Family Allowance Fund Contribution" (Argentina's `asignaciones familiares`
 * employer contribution) is a STATUTORY payroll tax, not an employee perk —
 * without the guard the `/allowance/i` branch would mis-tag it as `allowances`.
 */
function categorizeRivermateLine(name: string): CostLine["category"] {
  if (/severance|fgts|indemnity|gratuity|notice/i.test(name)) {
    return "severance";
  }
  if (/family\s*allowance|asignaciones\s*familiares/i.test(name)) {
    return "statutory";
  }
  if (
    /allowance|telework|wfh|remote|home\s*office|transport|meal|stipend|reimburs/i.test(
      name
    )
  ) {
    return "allowances";
  }
  if (
    /13th|14th|aguinaldo|christmas\s*bonus|vacation\s*bonus/i.test(name)
  ) {
    return "accruals";
  }
  return "statutory";
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapQuote(
  input: QuoteRequest,
  response: RivermateEmploymentCostsResponse,
  fxContext: LocalCurrencyFxContext
): NormalizedQuote {
  const { userCurrency, userMonthlySalary, localToUserRate } = fxContext;
  const localMonthlySalary = Number(response.employer_costs?.gross_salary ?? 0);

  // Degenerate empty quote: Rivermate responded with no useful data. Treat as
  // unsupported rather than silently surfacing a salary-only result.
  if (
    !Number.isFinite(localMonthlySalary) ||
    (localMonthlySalary === 0 &&
      (response.employer_costs?.subtotal_taxes ?? 0) === 0 &&
      Object.keys(response.accruals?.items ?? {}).length === 0)
  ) {
    throw new ProviderError({
      kind: "unsupported",
      cause: { country: input.country_code, currency: input.currency },
      message: `Rivermate returned no calculation for ${input.country_code} / ${input.currency}`,
    });
  }

  // Base salary — computed in the user's currency directly from the user's
  // monthly salary; no FX hop needed for this line.
  const salaryLine: CostLine = {
    name: "Base salary",
    amount: round2(userMonthlySalary),
    frequency: "monthly",
    category: "base_salary",
    bucket: "base_salary",
  };

  // Employer statutory contributions from `tax_items` (object keyed by tax id;
  // iterate values). All amounts are MONTHLY (in local currency — multiplied
  // by `localToUserRate` to land in the user's currency).
  const taxLines: CostLine[] = Object.values(
    response.employer_costs?.tax_items ?? {}
  ).map((item) => {
    const category = categorizeRivermateLine(item.name);
    return {
      name: item.name,
      amount: Number(item.amount ?? 0) * localToUserRate,
      frequency: "monthly" as const,
      category,
      bucket: inferBucket(category),
    };
  });

  // Accruals from `accruals.items` (object keyed by accrual slug; iterate
  // values). Each accrual carries `monthly_provision` (what we surface) and
  // `annual_amount` (which we ignore — `monthly_provision = annual_amount/12`
  // in Rivermate's data). The per-item `employer_contribution` is also
  // intentionally ignored: it represents the statutory burden ON TOP of the
  // accrual principal, but the corresponding line items aren't itemized in
  // `tax_items` (confirmed empty for these slugs in US/AR/BR samples). The
  // existing `subtotal_taxes` already reflects taxes paid on the principal
  // salary; surfacing `employer_contribution` here would double-count.
  const accrualLines: CostLine[] = Object.values(
    response.accruals?.items ?? {}
  ).map((item) => {
    const category = "accruals" as const;
    return {
      name: item.name,
      amount: Number(item.monthly_provision ?? 0) * localToUserRate,
      frequency: "monthly" as const,
      category,
      bucket: inferBucket(category),
    };
  });

  const costLines: CostLine[] = [salaryLine, ...taxLines, ...accrualLines];

  const monthlyTotal = round2(
    costLines.reduce((sum, line) => sum + line.amount, 0)
  );

  return {
    provider: "rivermate",
    request: input,
    currency: userCurrency,
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

const config = getRivermateConfig();
const client = new RivermateClient({ base_url: config.base_url });

export const rivermateProvider: QuoteProvider = {
  id: "rivermate",
  display_name: "Rivermate",

  async listCountries(): Promise<Country[]> {
    // Rivermate does not expose a country list endpoint. Reuse the Deel
    // canonical alpha-2 lookup and let unsupported combinations surface via
    // `quote()` outcomes (either via the alpha-3 lookup miss or via a 404 from
    // the API itself).
    return mapCountries();
  },

  async quote(input: QuoteRequest): Promise<NormalizedQuote> {
    const alpha3 = alpha2ToAlpha3(input.country_code);
    if (!alpha3) {
      throw new ProviderError({
        kind: "unsupported",
        message: `Rivermate doesn't have data for ${input.country_code}`,
      });
    }

    const fxCtx = await prepareLocalCurrencyFx(input, "Rivermate");

    const response = await client.getEmploymentCosts({
      country_alpha3: alpha3,
      annual_salary: fxCtx.localAnnualSalary,
      currency: fxCtx.localCurrency,
    });

    const quote = mapQuote(input, response, fxCtx);
    assertQuoteInvariants(quote);
    return quote;
  },
};
