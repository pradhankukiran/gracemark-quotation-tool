/**
 * Playroll cost-estimator request/response types.
 *
 * Endpoint: POST /calculator/estimate at api-eor-public.dev.playroll.com.
 * Country code is ISO 3166-1 alpha-2. Salary is submitted as a monthly
 * `inputs[0]` entry with `id: "grossSalary"`.
 */

export type PlayrollFrequency = "monthly" | "annual";

export interface PlayrollInput {
  id: "grossSalary";
  frequency: PlayrollFrequency;
  amount: number;
  currencyCode: string;
}

export interface PlayrollOutput {
  id: string;
  label: string;
  amount: number;
  category?: string;
  currencyCode: string;
  frequency?: PlayrollFrequency;
}

export interface PlayrollEstimateRequest {
  countryCode: string;
  region: string;
  inputs: PlayrollInput[];
  outputs: PlayrollOutput[];
  options: Record<string, unknown>;
}

export interface PlayrollEstimateResponse {
  countryCode: string;
  region?: string;
  inputs?: PlayrollInput[];
  outputs?: PlayrollOutput[];
}

export interface PlayrollEstimateParams {
  country_code: string;
  region: string;
  currency: string;
  monthly_salary: number;
}
