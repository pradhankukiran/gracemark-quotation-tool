/**
 * Pebl `QuoteProvider` implementation. Translates between our normalized
 * provider-agnostic contracts and Pebl's `country_calculator/results` REST
 * endpoint.
 *
 * Notes on Pebl's API that shape this adapter:
 *
 * - The endpoint is unauthenticated and lives at the website host
 *   (`hellopebl.com`), not a dedicated API gateway.
 * - Money values come back as plain `number`s in major units, at ANNUAL
 *   frequency. The adapter divides by 12 to emit monthly cost_lines.
 * - The payload is wrapped in a JSON:API envelope with TWO layers of
 *   `data.attributes` nesting; `client.extractInnerAttributes` drills in.
 * - `currency_in` and `currency_out` are intentionally set to the same
 *   currency (`input.currency`) so Pebl returns native amounts without
 *   server-side FX conversion.
 * - `lineItems` whose `slug === "IOC"` or `description === "Markup"`
 *   represent Pebl's own platform fee (Indirect Employment Cost). They are
 *   skipped — same policy as other adapters that drop vendor fees so this
 *   app tracks labor cost only.
 * - `remunerationItems` carry SAC accrual (and similar) lines; they are
 *   surfaced as `category: "accruals"`.
 * - Pebl does not surface a severance accrual figure, so
 *   `monthly.severance_accrual` is always 0 here; the merge layer can pad
 *   it in from Papaya if available.
 *
 * KNOWN DATA-QUALITY CAVEATS (flagged, NOT fixed by this adapter):
 *
 *  1. SAC social-security burden is NOT in `lineItems`. Pebl's own `note`
 *     reads: "SAC Social Security burden and Vacation Bonus payments will
 *     be billed separately when the payout to the employees is processed."
 *     We surface the SAC principal (~baseSalary/12) from
 *     `remunerationItems`, but the employer-side statutory contributions
 *     on that SAC are missing from the response and we have no source for
 *     them. Pebl's reported `total` therefore understates real cost.
 *
 *  2. Pebl treats the user-supplied `annual_salary` as `totalSalary`
 *     (i.e. salary INCLUDING the 13th-month SAC accrual). Other providers
 *     treat the input as base salary. As a result, for the same user
 *     input Pebl's `baseSalary` is ~12/13 of other providers' base salary.
 *     This is a semantic mismatch that surfaces in cross-provider
 *     comparisons. The adapter intentionally uses Pebl's own `baseSalary`
 *     (not `input.annual_salary / 12`) so the line items remain internally
 *     consistent with Pebl's own `total` arithmetic.
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

import { PeblClient, extractInnerAttributes } from "./client";
import { getPeblConfig } from "./config";
import type { PeblLineItem } from "./types";

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
 * Pebl encodes its own platform fee as a `lineItem`. Drop it so we never
 * surface a vendor markup as a statutory cost.
 */
function isPlatformFeeLineItem(item: PeblLineItem): boolean {
  if (item.slug === "IOC") return true;
  if (item.description === "Markup") return true;
  return false;
}

// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------

const config = getPeblConfig();
const client = new PeblClient({ base_url: config.base_url });

export const peblProvider: QuoteProvider = {
  id: "pebl",
  display_name: "Pebl",

  async listCountries(): Promise<Country[]> {
    // Pebl does not expose a country list endpoint; reuse the Deel canonical
    // alpha-2 lookup and let unsupported combinations surface via `quote()`
    // outcomes.
    return mapCountries();
  },

  async quote(input: QuoteRequest): Promise<NormalizedQuote> {
    const currency = input.currency.toUpperCase();
    const response = await client.getCountryCalculator({
      country_code: input.country_code.toUpperCase(),
      currency_in: currency,
      currency_out: currency,
      annual_salary: input.annual_salary,
    });

    const inner = extractInnerAttributes(response);

    // Degenerate empty quote: Pebl returned no employer cost AND no base
    // salary. Treat as unsupported rather than silently surfacing a zero
    // result.
    const baseSalaryAnnual = Number(inner.remuneration?.baseSalary ?? 0);
    if (
      (!Number.isFinite(baseSalaryAnnual) || baseSalaryAnnual === 0) &&
      (!inner.lineItems || inner.lineItems.length === 0)
    ) {
      throw new ProviderError({
        kind: "unsupported",
        cause: { country: input.country_code, currency: input.currency },
        message: `Pebl returned no calculation for ${input.country_code} / ${input.currency}`,
      });
    }

    // Base salary — use Pebl's own `baseSalary` (annual), not
    // `input.annual_salary / 12`. Pebl treats the user's input as
    // `totalSalary` and derives `baseSalary` as a 12/13 fraction so SAC
    // accrual can be surfaced separately. Using Pebl's value keeps the
    // internal arithmetic consistent with their reported `total`.
    const baseSalaryLine: CostLine = {
      name: "Base salary",
      amount: baseSalaryAnnual / 12,
      frequency: "monthly",
      category: "base_salary",
      bucket: "base_salary",
    };

    // Employer statutory contributions from `lineItems` (annual amounts).
    // Drop Pebl's own platform fee.
    const statutoryLines: CostLine[] = (inner.lineItems ?? [])
      .filter((item) => !isPlatformFeeLineItem(item))
      .map((item) => {
        const category = "statutory" as const;
        return {
          name: item.name,
          amount: Number(item.amount ?? 0) / 12,
          frequency: "monthly" as const,
          category,
          bucket: inferBucket(category),
        };
      });

    // Accruals from `remunerationItems` (annual amounts). SAC and similar
    // 13th-month payments live here.
    const accrualLines: CostLine[] = (
      inner.remuneration?.remunerationItems ?? []
    ).map((item) => {
      const category = "accruals" as const;
      return {
        name: item.name,
        amount: Number(item.amount ?? 0) / 12,
        frequency: "monthly" as const,
        category,
        bucket: inferBucket(category),
      };
    });

    const costLines: CostLine[] = [
      baseSalaryLine,
      ...statutoryLines,
      ...accrualLines,
    ];

    const monthlyTotal = round2(
      costLines.reduce((sum, line) => sum + line.amount, 0)
    );

    const quote: NormalizedQuote = {
      provider: "pebl",
      request: input,
      currency,
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
