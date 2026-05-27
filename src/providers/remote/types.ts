/**
 * Remote-specific request and response shapes.
 *
 * These mirror the wire format of `gateway.remote.com/v1` endpoints that
 * the adapter consumes. Money fields in the cost-calculator are integer
 * **cents** in both directions; field-level units are documented inline
 * where they deviate from this convention.
 */

// ---------------------------------------------------------------------------
// POST /v1/cost-calculator/estimation
// ---------------------------------------------------------------------------

export interface RemoteEstimationRequest {
  employer_currency_slug: string;
  include_benefits?: boolean;
  include_cost_breakdowns?: boolean;
  include_management_fee?: boolean;
  include_premium_benefits?: boolean;
  employments: RemoteEstimationEmployment[];
}

export interface RemoteEstimationEmployment {
  region_slug: string;
  /** Integer cents in the regional currency. */
  annual_gross_salary: number;
  /** Integer cents in the employer currency. */
  annual_gross_salary_in_employer_currency: number;
  /** Decimal string, e.g. "1.0". */
  regional_to_employer_exchange_rate: string;
  employment_term: "fixed" | "indefinite";
  title: string;
  age: number;
}

export interface RemoteCurrencyRef {
  code: string;
  slug: string;
  name: string;
  symbol?: string;
}

export interface RemoteCountryRef {
  code: string;
  name: string;
  slug?: string;
  alpha_2_code: string;
  currency?: RemoteCurrencyRef;
}

export interface RemoteRegionRef {
  code: string;
  name: string;
  status: string;
  slug?: string;
  country?: RemoteCountryRef;
  child_regions?: unknown[];
  parent_region?: unknown;
}

export interface RemoteEstimationResponse {
  data: {
    employments: RemoteEstimationEmploymentResult[];
  };
}

export interface RemoteEstimationEmploymentResult {
  country: RemoteCountryRef;
  region: RemoteRegionRef;
  /** Weeks until onboarding can complete. */
  minimum_onboarding_time?: number;
  has_extra_statutory_payment?: boolean;
  country_benefits_details_url?: string;
  country_guide_url?: string;
  employer_currency_costs: RemoteCurrencyCosts;
  regional_currency_costs: RemoteCurrencyCosts;
}

/**
 * All numeric money fields below are integer **cents**.
 */
export interface RemoteCurrencyCosts {
  currency: RemoteCurrencyRef;
  annual_gross_salary: number;
  monthly_gross_salary: number;
  annual_contributions_total: number;
  monthly_contributions_total: number;
  annual_management_fee?: number;
  monthly_management_fee?: number;
  annual_benefits_total?: number | null;
  monthly_benefits_total?: number | null;
  annual_indirect_tax?: number | null;
  monthly_indirect_tax?: number | null;
  extra_statutory_payments_total: number;
  monthly_tce: number;
  monthly_total: number;
  annual_total: number;
  annual_contributions_breakdown?: RemoteBreakdownLine[];
  monthly_contributions_breakdown?: RemoteBreakdownLine[];
  extra_statutory_payments_breakdown?: RemoteBreakdownLine[];
  annual_benefits_breakdown?: RemoteBreakdownLine[];
  monthly_benefits_breakdown?: RemoteBreakdownLine[];
}

export interface RemoteBreakdownLine {
  name: string;
  description?: string;
  /** Integer cents in the surrounding currency-cost block. */
  amount: number;
  zendesk_article_id?: string | null;
  zendesk_article_url?: string | null;
}
