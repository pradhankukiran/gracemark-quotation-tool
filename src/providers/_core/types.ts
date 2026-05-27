/**
 * Provider-agnostic contracts that every EOR provider (Deel, Remote, etc.)
 * must implement. The UI and comparison layer code against these types only.
 */

export type ProviderId = string;

export type EmploymentType = "Full-time" | "Part-time";

export interface Country {
  code: string;
  name: string;
  default_currency: string;
  state_type: string | null;
  states: { code: string; name: string }[];
  eor_support: boolean;
  visa_support: boolean;
}

export interface ValidationRules {
  currency: string;
  salary: { min: number | null; max: number | null; frequency: "monthly" | "annual" };
  vacation_days_min: number | null;
  sick_days: { min: number | null; max: number | null };
  probation_days: { min: number | null; max: number | null };
  work_schedule: {
    days: { min: number; max: number };
    hours: { min: number; max: number };
  };
  definite_contract_allowed: boolean;
  start_date_buffer_days: number;
  raw?: unknown;
}

export interface QuoteRequest {
  country_code: string;
  currency: string;
  annual_salary: number;
  state?: string | null;
  employment_type?: EmploymentType;
  work_hours_per_week?: number;
  work_visa?: boolean;
}

/**
 * A single cost line for the unified results display.
 *
 * Two production sources:
 * 1. Provider adapters (`src/providers/<id>/adapter.ts`) emit these from the vendor
 *    response. Always `frequency: "monthly" | "annual"` and `category` is one of the
 *    vendor-meaningful values (`base_salary`, `statutory`, `accruals`, etc.).
 * 2. `mergeQuoteCostLines` (`src/lib/cost-merge.ts`) synthesizes additional lines for
 *    Gracemark overhead, VAT, custom user-added costs, and one-time hire costs.
 *    These never reach `assertQuoteInvariants` — that invariant only runs against
 *    provider-emitted lines.
 *
 * `category` describes WHAT the line is (display label/tag color). The optional
 * `bucket` describes HOW it counts in the recurring/termination/one-time math
 * (see `CostBucket`). Consumers fall back to `inferBucket(category)` when
 * `bucket` is absent.
 */
export type CostLineCategory =
  | "base_salary"
  | "statutory"
  | "accruals"
  | "severance"
  | "bonuses"
  | "allowances"
  | "contractor_rate"
  | "markup"
  | "one_time";

/**
 * Acid-test bucketization (orthogonal to `category`).
 *
 * - `category` describes WHAT the line is (display label/tag color).
 * - `bucket` describes HOW it counts in the recurring/termination/one-time math.
 *
 * A single line carries both. `bucket` is optional during rollout; consumers
 * MUST fall back to `inferBucket(category)` (see `_core/buckets.ts`) when
 * the field is absent.
 */
export type CostBucket =
  | "base_salary"            // monthly salary
  | "statutory_mandatory"    // recurring statutory + accruals (13th, vacation)
  | "allowances_benefits"    // recurring perks (meal voucher, transport, WFH)
  | "termination_costs"      // paid on termination (severance, notice pay)
  | "one_time_costs"         // paid at hire (medical, drug test, BG check)
  | "gracemark_overhead";    // GraceMark recurring (local office, VAT, future vendor fees)

export interface CostLine {
  name: string;
  amount: number;
  frequency: "monthly" | "annual" | "one_time";
  category: CostLineCategory;
  bucket?: CostBucket;
}

/**
 * Per-quote FX snapshot. Captured once at quote-submit time and locked into
 * the SavedEorQuote so all line amounts and the provenance line stay reproducible
 * forever. `null` on a quote means "quote currency is USD, no conversion needed".
 */
export interface FxSnapshot {
  /** Where the rate came from. */
  source: "papayaglobal";
  /** ISO timestamp of when WE fetched the rate (not Papaya's update time — that's unknown). */
  fetched_at: string;
  /** The currency the quote is denominated in. */
  base_currency: string;
  /** The currency we converted to. Always "USD" for v1. */
  target_currency: string;
  /** Multiplier: `amount_in_target = amount_in_base × rate`. */
  rate: number;
}

export interface NormalizedQuote {
  provider: ProviderId;
  request: QuoteRequest;
  currency: string;
  monthly: {
    severance_accrual: number;
    total: number;
  };
  cost_lines: CostLine[];
  raw: unknown;
}

export interface ContractorQuoteRequest {
  country_code: string;
  currency: string;
  rate_basis: "hourly" | "monthly";
  pay_rate: number;
  markup_percentage: number;
  total_monthly_hours: number;
  contract_duration: number;
  contract_duration_unit: "months" | "years";
  payment_frequency: "weekly" | "biweekly" | "monthly";
  msp_percentage: number | null;
  background_check_required: boolean;
}

/**
 * Provider-normalized contractor quote output.
 * Shape will be refined as providers implement IC; for now mirrors EOR's
 * cost-line pattern (reuses CostLine) plus IC-specific monthly summary.
 */
export interface NormalizedContractorQuote {
  provider: ProviderId;
  request: ContractorQuoteRequest;
  currency: string;
  cost_lines: CostLine[];
  monthly: {
    pay_rate: number;
    markup_amount: number;
    msp_fee: number;
    platform_fee: number;
    total: number;
  };
  notes: string[];
  raw: unknown;
}

export interface QuoteProvider {
  id: ProviderId;
  display_name: string;
  listCountries(): Promise<Country[]>;
  getValidations?: (country_code: string) => Promise<ValidationRules>;
  quote(input: QuoteRequest): Promise<NormalizedQuote>;
  /**
   * Optional: contractor (IC) quote. Providers that don't support IC omit this.
   * Adapters opt-in incrementally — the contractor request/response contracts
   * are stable but only adapters that have implemented IC declare this method.
   */
  quoteContractor?: (
    input: ContractorQuoteRequest
  ) => Promise<NormalizedContractorQuote>;
}

/**
 * Outcome of asking a single provider for a quote. Cases:
 * - `loading`       — quote is in-flight (client-side fan-out state only)
 * - `ok`            — quote computed successfully (`quote` is present)
 * - `unsupported`   — provider doesn't operate in the requested country
 * - `invalid_input` — provider rejected the request (e.g., salary out of range)
 * - `error`         — upstream / network failure
 */
export type ProviderOutcome =
  | "loading"
  | "ok"
  | "unsupported"
  | "invalid_input"
  | "error";

export interface ProviderQuoteResult {
  provider_id: ProviderId;
  display_name: string;
  outcome: ProviderOutcome;
  quote?: NormalizedQuote | null;
  error?: { message: string; status?: number } | null;
}

/**
 * Multi-country quote request. `countries` holds 1 entry when comparison
 * mode is off, 2 entries when on. Each entry is a fully-formed single-country
 * `QuoteRequest` — adapters still consume one at a time.
 */
export interface QuoteRequestMulti {
  countries: QuoteRequest[]; // length 1 (no comparison) or 2 (comparison on)
}

/**
 * One country's slice of a multi-country fan-out. `results` is one entry per
 * provider (in registration order) for this country's `request`.
 */
export interface CountryQuoteBlock {
  request: QuoteRequest;
  results: ProviderQuoteResult[]; // one per provider, same order as listProviders()
}

/**
 * Fan-out result from asking every registered provider for a quote, across
 * one or two countries. `countries` mirrors the order in the request.
 */
export interface MultiProviderQuote {
  request: QuoteRequestMulti;
  generated_at: string;
  countries: CountryQuoteBlock[];
}
