/**
 * Oyster-specific request and response shapes for the cost-calculator
 * GraphQL endpoint. All money values are returned as plain `number` in the
 * surrounding currency's major units (e.g. ARS, not centavos).
 */

export interface OysterGraphQLError {
  message: string;
  path?: (string | number)[];
  extensions?: Record<string, unknown>;
}

export interface OysterGraphQLResponse<T> {
  data?: T;
  errors?: OysterGraphQLError[];
}

export interface OysterBulkSalaryCalculationsData {
  bulkSalaryCalculations: OysterCalculation[];
}

export interface OysterCountryLiability {
  tier: string | null;
  link: string | null;
}

export interface OysterCountry {
  code: string;
  name: string;
  liability: OysterCountryLiability | null;
}

export interface OysterCurrency {
  code: string;
  name: string;
}

export interface OysterContribution {
  name: string;
  group: string;
  amount: number;
}

export interface OysterTaxParty {
  total: number;
  contributions: OysterContribution[];
}

export interface OysterTaxes {
  employer: OysterTaxParty;
  employee: OysterTaxParty;
}

export interface OysterFeeAmount {
  value: number;
  currencyCode: string;
}

export interface OysterOysterFee {
  feeInEngagementSalaryCurrency: OysterFeeAmount;
}

export interface OysterVatFee {
  value: number;
  rate: number;
}

export interface OysterFees {
  oyster: OysterOysterFee;
  vat: OysterVatFee;
}

export interface OysterTotals {
  netSalary: number;
  employerCosts: number;
}

export interface OysterCalculation {
  country: OysterCountry;
  annualGrossSalary: number;
  currency: OysterCurrency;
  taxes: OysterTaxes;
  fees: OysterFees;
  totals: OysterTotals;
}

// ---------------------------------------------------------------------------
// Request variables (canonical GraphQL form: operationName + variables)
// ---------------------------------------------------------------------------

export interface OysterVatParameters {
  salesPercentageToCountry: number | null;
  salesToCountry: boolean;
  worksInCountryOfResidence: boolean;
}

export interface OysterSalaryQueryInput {
  countryCode: string;
  annualGrossSalary: number;
  currencyCode: string;
  vatParameters?: OysterVatParameters;
}

export interface OysterBulkSalaryCalculationsVariables {
  calculationQueries: OysterSalaryQueryInput[];
}
