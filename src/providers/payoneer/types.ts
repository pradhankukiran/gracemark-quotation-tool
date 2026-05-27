/**
 * Payoneer (Skuad) cost-calculator response types.
 *
 * The calculator endpoint at `cost-calculator.skuad.io/cost-calculator/cost`
 * returns pre-computed monthly and yearly breakdowns. Each breakdown item is
 * a tuple `[name, amount, visible]`.
 */

export type PayoneerCostBreakup = [string, number, boolean];

export interface PayoneerPeriodBreakdown {
  grossSalary: number;
  skuadFee: number;
  skuadFeeDiscount: number;
  totalEmploymentCost: number;
  totalEmployeeSalary: number;
  employerEstTax: number;
  employerEstTaxBreakup: PayoneerCostBreakup[];
  employeeEstTax: number;
  employeeEstTaxBreakup: PayoneerCostBreakup[];
  employerMandatoryAccrualsEstCost: number;
  employerMandatoryAccrualsEstCostBreakup: PayoneerCostBreakup[];
  employerSeveranceAccrualsEstCost: number;
  employerSeveranceAccrualsEstCostBreakup: PayoneerCostBreakup[];
  employerAdditionalMandatoryAccrualsEstCost: number;
  employerAdditionalMandatoryAccrualsEstCostBreakup: PayoneerCostBreakup[];
  employerAdditionalSeveranceAccrualsEstCost: number;
  employerAdditionalSeveranceAccrualsEstCostBreakup: PayoneerCostBreakup[];
  employerEstAdditionalContributionCostBreakup: PayoneerCostBreakup[];
  employerEstTaxVatCost: number;
  employerEstTaxVatCostBreakup: PayoneerCostBreakup[];
  employerEstAdditionalVatCost: number;
  employerEstAdditionalVatCostBreakup: PayoneerCostBreakup[];
}

export interface PayoneerCostCalculatorData {
  currencyCode: string;
  countryCode: string;
  country: string;
  monthly: PayoneerPeriodBreakdown;
  yearly: PayoneerPeriodBreakdown;
}

export interface PayoneerCostCalculatorResponse {
  success: boolean;
  data?: PayoneerCostCalculatorData;
}

export interface PayoneerCostCalculatorParams {
  country_alpha3: string;
  currency: string;
  annual_salary: number;
}
