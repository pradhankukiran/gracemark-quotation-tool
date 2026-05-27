/**
 * Pebl-specific response shape for the country_calculator results endpoint
 * (`/api/country_calculator/results/{country}/{currencyIn}/{currencyOut}/{annualSalary}`).
 *
 * The endpoint follows the JSON:API convention with a doubly-nested
 * `data.attributes.data.attributes` payload. All money values are returned as
 * plain `number` in the surrounding currency's major units (e.g. ARS, not
 * centavos), at ANNUAL frequency.
 */

export interface PeblMeta {
  locationCode: string;
  timePeriod: string;
  currencyCode: string;
  currencyCodeOut: string;
}

export interface PeblLineItem {
  name: string;
  slug: string;
  description: string;
  amount: number;
  percent: number;
}

export interface PeblRemunerationItem {
  name: string;
  slug: string;
  description: string;
  amount: number;
}

export interface PeblRemuneration {
  baseSalary: number;
  totalSalary: number;
  remunerationItems: PeblRemunerationItem[];
}

export interface PeblVat {
  value: string;
  description: string;
}

export interface PeblExchangeRate {
  in: unknown;
  out: unknown;
}

export interface PeblInnerAttributes {
  amount: number;
  percent: number;
  lineItems: PeblLineItem[];
  vat: PeblVat;
  iem: unknown[];
  note: string;
  costOverBaseSalary: unknown;
  remuneration: PeblRemuneration;
  total: number;
  exchangeRate: PeblExchangeRate | null;
}

export interface PeblInnerData {
  attributes: PeblInnerAttributes;
}

export interface PeblOuterAttributes {
  meta: PeblMeta;
  data: PeblInnerData;
}

export interface PeblOuterData {
  attributes: PeblOuterAttributes;
}

export interface PeblCountryCalculatorResponse {
  data: PeblOuterData;
}
