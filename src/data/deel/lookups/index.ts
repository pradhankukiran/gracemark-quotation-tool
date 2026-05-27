import countriesRaw from "./countries.json";
import currenciesRaw from "./currencies.json";

export interface DeelState {
  code: string;
  name: string;
}

export interface DeelCountry {
  code: string;
  name: string;
  visa_support: boolean;
  eor_support: boolean;
  state_type: string | null;
  states: DeelState[];
  default_currency: string;
}

interface DeelCurrency {
  code: string;
  name: string;
}

export const countries: DeelCountry[] = countriesRaw.data as DeelCountry[];
export const currencies: DeelCurrency[] = currenciesRaw.data as DeelCurrency[];

export function getCountryByCode(code: string): DeelCountry | undefined {
  return countries.find((c) => c.code === code);
}
