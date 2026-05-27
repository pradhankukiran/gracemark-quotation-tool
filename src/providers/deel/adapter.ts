/**
 * Deel `QuoteProvider` implementation. Translates between our normalized
 * provider-agnostic contracts and Deel's REST API.
 */

import { countries, getCountryByCode } from "@/data/deel/lookups";
import { ProviderError } from "@/providers/_core/errors";
import { assertQuoteInvariants } from "@/providers/_core/invariants";
import type {
  CostBucket,
  CostLine,
  Country,
  NormalizedQuote,
  QuoteProvider,
  QuoteRequest,
  ValidationRules,
} from "@/providers/_core/types";

import { DeelClient } from "./client";
import type {
  DeelEmploymentCostRequestBody,
  DeelEmploymentCostResponse,
  DeelValidationsResponse,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Deel returns money values as decimal strings (e.g. "12500.00"). Convert
 * to a finite `number`. `null` / `undefined` become `0` for sums and the
 * caller decides whether to coerce; for nullable validation fields a
 * separate helper preserves `null`.
 */
function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toNullableNumber(
  value: string | number | null | undefined
): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function lookupCountryName(countryCode: string): string {
  const country = getCountryByCode(countryCode);
  if (!country) {
    throw new ProviderError({ kind: "unsupported", cause: countryCode });
  }
  return country.name;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

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

function mapValidations(payload: DeelValidationsResponse): ValidationRules {
  const d = payload.data;
  return {
    currency: d.currency,
    salary: {
      min: toNullableNumber(d.salary.min),
      max: toNullableNumber(d.salary.max),
      frequency: d.salary.frequency,
    },
    vacation_days_min: toNullableNumber(d.holiday?.min),
    sick_days: {
      min: toNullableNumber(d.sick_days?.min),
      max: toNullableNumber(d.sick_days?.max),
    },
    probation_days: {
      min: toNullableNumber(d.probation?.min),
      max: toNullableNumber(d.probation?.max),
    },
    work_schedule: {
      days: {
        min: toNumber(d.work_schedule.days.min),
        max: toNumber(d.work_schedule.days.max),
      },
      hours: {
        min: toNumber(d.work_schedule.hours.min),
        max: toNumber(d.work_schedule.hours.max),
      },
    },
    definite_contract_allowed: d.definite_contract?.type !== "NOT_ALLOWED",
    start_date_buffer_days: toNumber(d.start_date_buffer),
    raw: payload,
  };
}

function mapQuote(
  input: QuoteRequest,
  response: DeelEmploymentCostResponse
): NormalizedQuote {
  // Monthly figures: Deel returns the monthly salary in `salary` even though
  // the request body uses the annual figure.
  const monthlySalary = toNumber(response.salary);
  const employerCosts = toNumber(response.employer_costs);
  // Note Deel's misspelling: "accural" in their schema.
  const severanceAccrual = toNumber(response.severance_accural);

  // Degenerate zero quote: Deel responded but reported no costs at all.
  // Treat as unsupported rather than silently surfacing a salary-only result.
  const deelTotal = toNumber(response.total_costs);
  if (deelTotal === 0 && employerCosts === 0) {
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

  // Statutory / cost lines from Deel's `costs[]`. "13th salary" is an
  // annual accrual, not a statutory contribution. Deel's `deel_fee` is
  // intentionally excluded — this app tracks labor cost only.
  const statutoryLines: CostLine[] = (response.costs ?? []).map((c) => {
    const category = /13th/i.test(c.name) ? "accruals" : "statutory";
    // Both `statutory` and `accruals` (13th salary) are recurring employer
    // contributions that map to the same bucket. Deel does not surface
    // termination-only penalties (e.g. FGTS termination fine) as cost lines
    // — those flow through `severance_accural` and never reach `costs[]`.
    const bucket: CostBucket = "statutory_mandatory";
    return {
      name: c.name,
      amount: toNumber(c.amount),
      frequency: c.frequency === "Annual" ? "annual" : "monthly",
      category,
      bucket,
    };
  });

  const costLines: CostLine[] = [salaryLine, ...statutoryLines];

  // Monthly + annualized cost-line sum, plus severance (which is intentionally
  // not represented as a cost_line).
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
    provider: "deel",
    request: input,
    currency: response.currency || input.currency,
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

const client = new DeelClient();

export const deelProvider: QuoteProvider = {
  id: "deel",
  display_name: "Deel",

  async listCountries(): Promise<Country[]> {
    // Static data; no API call.
    return mapCountries();
  },

  async getValidations(country_code: string): Promise<ValidationRules> {
    const payload = await client.get<DeelValidationsResponse>(
      `/eor/validations/${encodeURIComponent(country_code)}`
    );
    return mapValidations(payload);
  },

  async quote(input: QuoteRequest): Promise<NormalizedQuote> {
    const body: DeelEmploymentCostRequestBody = {
      data: {
        salary: input.annual_salary,
        country: lookupCountryName(input.country_code),
        country_code: input.country_code,
        currency: input.currency,
        ...(input.state ? { state: input.state } : {}),
      },
    };
    const response = await client.post<DeelEmploymentCostResponse>(
      "/eor/employment_cost",
      body
    );
    const quote = mapQuote(input, response);
    assertQuoteInvariants(quote);
    return quote;
  },
};
