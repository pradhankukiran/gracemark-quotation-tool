/**
 * Rippling-specific request and response shapes for the
 * `get_employer_cost_breakdown` endpoint. All money values come back as
 * decimal strings in the surrounding currency's major units (e.g. ARS, not
 * centavos), mirroring Deel's pattern.
 */

export interface RipplingRoleData {
  country_code: string;
  currency: string;
  state: string | null;
  yearly_salary: number;
}

export interface RipplingCostBreakdownRequest {
  locale_country: string;
  role_data: RipplingRoleData;
}

export interface RipplingCostItem {
  monthly_value: string;
  yearly_value: string;
  description: string | null;
  title: string;
}

export interface RipplingCostBreakdownResponse {
  costs: RipplingCostItem[];
  gross_salary: RipplingCostItem;
  employer_cost: RipplingCostItem;
  total_cost: RipplingCostItem;
}
