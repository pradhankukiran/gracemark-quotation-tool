export type PapayaCostType =
  | "statutory"
  | "accrual"
  | "termination_liability"
  | "mandatory_allowance";

export type PapayaFrequency = "Monthly" | "Annual" | "Daily" | "Hourly";

export interface PapayaMoney {
  value: number;
  currency: string;
  frequency?: PapayaFrequency;
}

export interface PapayaSalaryBand {
  min?: PapayaMoney;
  max?: PapayaMoney;
}

export interface PapayaEmployerCost {
  name: string;
  rate_percent?: number;
  fixed_amount?: PapayaMoney;
  frequency: PapayaFrequency;
  salary_cap?: PapayaMoney;
  salary_band?: PapayaSalaryBand;
  type: PapayaCostType;
}

export interface PapayaCountryEntry {
  country: string;
  country_code: string;
  state: string | null;
  state_code: string | null;
  currency: string;
  employer_costs: PapayaEmployerCost[];
  /** Standard VAT or sales-tax percentage. Null when unknown or N/A. */
  vat_standard_percent: number | null;
  /** Optional sentinel for known-incomplete entries (e.g. "sparse source data"). */
  _note?: string;
}
