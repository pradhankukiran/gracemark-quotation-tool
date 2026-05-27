/**
 * Oyster `QuoteProvider` implementation. Translates between our normalized
 * provider-agnostic contracts and Oyster's `cost-calculator` GraphQL endpoint.
 *
 * Notes on Oyster's API that shape this adapter:
 *
 * - The endpoint is unauthenticated and lives at the website host
 *   (`app.oysterhr.com`), not a dedicated API gateway.
 * - Money values come back as plain numbers in major units (not cents).
 * - Employer contributions are grouped via Oyster's `group` field. Mapping
 *   into the normalized category union:
 *     - "Accrual"        → category: "accruals",   frequency: "annual"
 *     - "Allowance"      → category: "allowances", frequency: "monthly" (/12)
 *     - everything else  → category: "statutory",  frequency: "monthly" (/12)
 * - Accrual lines are emitted as annual cost_lines (preserving Oyster's native
 *   annual amount) rather than rolled into `monthly.severance_accrual`, so
 *   `monthly.severance_accrual` is always 0 here.
 * - Oyster's own `fees.oyster` and `fees.vat` are intentionally ignored —
 *   this app tracks labor cost only, not the provider's service fee.
 */

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

import { OysterClient } from "./client";
import { getOysterConfig } from "./config";
import type {
  OysterBulkSalaryCalculationsData,
  OysterBulkSalaryCalculationsVariables,
  OysterCalculation,
  OysterGraphQLResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Canonical GraphQL document used by Oyster's own UI: a named operation with
// typed variables rather than values inlined into the query string.
const BULK_SALARY_CALCULATIONS_QUERY = `query BulkSalaryCalculations($calculationQueries: [SalaryQueryInput!]!) {
  bulkSalaryCalculations(calculationQueries: $calculationQueries) {
    country { code name liability { tier link } }
    annualGrossSalary
    currency { code name }
    taxes {
      employer { total contributions { name group amount } }
      employee { total contributions { name group amount } }
    }
    fees {
      oyster { feeInEngagementSalaryCurrency { value currencyCode } }
      vat { value rate }
    }
    totals { netSalary employerCosts }
  }
}`;

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapQuote(
  input: QuoteRequest,
  response: OysterGraphQLResponse<OysterBulkSalaryCalculationsData>,
  calc: OysterCalculation
): NormalizedQuote {
  const annualGrossSalary = calc.annualGrossSalary;
  const employerTaxesAnnual = calc.taxes.employer.total;

  const salaryLine: CostLine = {
    name: "Gross salary",
    amount: annualGrossSalary / 12,
    frequency: "monthly",
    category: "base_salary",
    bucket: inferBucket("base_salary"),
  };

  const contributionLines: CostLine[] = calc.taxes.employer.contributions.map(
    (c) => {
      if (c.group === "Accrual") {
        const category = "accruals" as const;
        return {
          name: c.name,
          amount: c.amount,
          frequency: "annual" as const,
          category,
          bucket: inferBucket(category),
        };
      }
      if (c.group === "Allowance") {
        const category = "allowances" as const;
        return {
          name: c.name,
          amount: c.amount / 12,
          frequency: "monthly" as const,
          category,
          bucket: inferBucket(category),
        };
      }
      const category = "statutory" as const;
      return {
        name: c.name,
        amount: c.amount / 12,
        frequency: "monthly" as const,
        category,
        bucket: inferBucket(category),
      };
    }
  );

  const costLines: CostLine[] = [salaryLine, ...contributionLines];

  return {
    provider: "oyster",
    request: input,
    currency: calc.currency.code || input.currency,
    monthly: {
      severance_accrual: 0,
      total: round2((annualGrossSalary + employerTaxesAnnual) / 12),
    },
    cost_lines: costLines,
    raw: response,
  };
}

// ---------------------------------------------------------------------------
// Provider implementation
// ---------------------------------------------------------------------------

const config = getOysterConfig();
const client = new OysterClient({
  base_url: config.base_url,
  endpoint: config.endpoint,
});

export const oysterProvider: QuoteProvider = {
  id: "oyster",
  display_name: "Oyster",

  async listCountries(): Promise<Country[]> {
    // Oyster does not expose a country list endpoint; UI uses Deel-canonical
    // lookups and unsupported combinations surface via `quote()` outcomes.
    return [];
  },

  async quote(input: QuoteRequest): Promise<NormalizedQuote> {
    const variables: OysterBulkSalaryCalculationsVariables = {
      calculationQueries: [
        {
          countryCode: input.country_code.toUpperCase(),
          annualGrossSalary: input.annual_salary,
          currencyCode: input.currency.toUpperCase(),
          vatParameters: {
            salesPercentageToCountry: null,
            salesToCountry: false,
            worksInCountryOfResidence: false,
          },
        },
      ],
    };
    const response = await client.post<
      OysterGraphQLResponse<OysterBulkSalaryCalculationsData>
    >({
      operationName: "BulkSalaryCalculations",
      query: BULK_SALARY_CALCULATIONS_QUERY,
      variables,
    });

    if (response.errors && response.errors.length > 0) {
      throw new ProviderError({
        kind: "unsupported",
        cause: response.errors,
        message: `Oyster GraphQL errors: ${response.errors
          .map((e) => e.message)
          .join("; ")}`,
      });
    }

    const calc = response.data?.bulkSalaryCalculations?.[0];
    if (!calc) {
      throw new ProviderError({
        kind: "unsupported",
        cause: { country: input.country_code, currency: input.currency },
        message: `Oyster returned no calculation for ${input.country_code} / ${input.currency}`,
      });
    }

    const quote = mapQuote(input, response, calc);
    assertQuoteInvariants(quote);
    return quote;
  },
};
