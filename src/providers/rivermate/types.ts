/**
 * Rivermate-specific response shape for the employment-costs calculator
 * (`/api/calculator/employment-costs/?country={ALPHA3}&annual_salary={n}&currency={ISO4217}`).
 *
 * All money values are plain `number`s in the surrounding currency's major
 * units. Money fields at the employer-cost layer are MONTHLY; the accruals
 * block also carries an `annual_amount` alongside the monthly provision.
 *
 * Notes:
 * - `country` is keyed by ISO alpha-3 (`iso_code`), unlike every other provider
 *   in this app which uses alpha-2. The adapter handles the conversion.
 * - `tax_items` is an OBJECT keyed by a slugified tax id (e.g. `social_security`,
 *   `fgts`, `pension_fund_cont_16`). Iterate Object.values().
 * - `accruals.items` is also an OBJECT (keyed by slug). Each entry carries
 *   `monthly_provision` (what we surface) and `annual_amount` (the rolled-up
 *   yearly cost).
 * - `total_employment_cost.monthly` = gross_salary + subtotal_taxes +
 *   management_fee + accruals.monthly_provision (confirmed across US/AR/BR
 *   samples). The summary block's `employer_total_monthly` differs in some
 *   countries (e.g. AR) because it adds the per-item `employer_contribution`
 *   from accruals on top — we ignore the summary block and reconstruct from
 *   the line items so the invariants hold.
 * - `employee_deductions` is intentionally NOT modelled here: it's the
 *   employee's side of payroll, not employer cost (consistent with our
 *   provider-wide policy of tracking employer cost only).
 * - `management_fee` is Rivermate's vendor platform fee; the adapter excludes
 *   it from cost_lines, mirroring how other adapters drop vendor fees.
 */

export interface RivermateCountryInfo {
  id: number;
  name: string;
  iso_code: string;
  currency: string;
  management_fee: number;
}

export interface RivermateMoneyBlock {
  annual: number;
  monthly: number;
  currency: string;
}

export interface RivermateTaxItem {
  name: string;
  amount: number;
}

export interface RivermateEmployerCosts {
  gross_salary: number;
  tax_items: Record<string, RivermateTaxItem>;
  management_fee: number;
  subtotal_taxes: number;
  total_before_accruals: number;
}

export interface RivermateAccrualItem {
  name: string;
  annual_amount: number;
  monthly_provision: number;
  employer_contribution: number;
}

export interface RivermateAccruals {
  items: Record<string, RivermateAccrualItem>;
  monthly_provision: number;
  total_annual: number;
}

export interface RivermateNetSalary {
  monthly: number;
  annual: number;
}

export interface RivermateSummary {
  employee_net_monthly: number;
  employer_total_monthly: number;
  effective_tax_rate: number;
}

export interface RivermateCurrencyInfo {
  requested_currency: string;
  local_currency: string;
  exchange_rate: number;
  rate_timestamp: string;
  conversion_applied: boolean;
  rate_provider: string;
}

export interface RivermateEmploymentCostsResponse {
  country: RivermateCountryInfo;
  gross_salary: RivermateMoneyBlock;
  employer_costs: RivermateEmployerCosts;
  employee_deductions?: {
    tax_items: Record<string, RivermateTaxItem>;
    total_deductions: number;
  };
  accruals: RivermateAccruals;
  net_salary: RivermateNetSalary;
  total_monthly_cost: number;
  summary: RivermateSummary;
  currency_info: RivermateCurrencyInfo;
  country_info: {
    name: string;
    iso_code: string;
    currency: string;
  };
  total_employment_cost: RivermateMoneyBlock;
  effective_tax_rate: number;
}
