import countriesRaw from "./countries.json";
import costCalcCountriesRaw from "./cost-calc-countries.json";

export interface RemoteCountrySubdivision {
  name: string;
  code: string;
  subdivision_type: string;
}

/**
 * Top-level country reference from `GET /v1/countries`.
 *
 * `code` is ISO 3166-1 alpha-3 (Remote's primary key in the cost-calculator).
 * `alpha_2_code` is ISO 3166-1 alpha-2 (what the rest of the app uses).
 */
export interface RemoteCountry {
  name: string;
  code: string;
  alpha_2_code: string;
  eor_onboarding: boolean;
  country_subdivisions?: RemoteCountrySubdivision[] | null;
  region?: string;
  subregion?: string;
  contractor_products_available?: string[];
  locked_benefits?: string;
  supported_json_schemas?: string[];
}

interface RemoteCurrency {
  code: string;
  slug: string;
  name: string;
  symbol?: string;
}

interface RemoteChildRegion {
  code: string;
  name: string;
  slug: string;
  status?: string;
}

/**
 * Cost-calculator country from `GET /v1/cost-calculator/countries`.
 *
 * Carries the UUID slugs (`region_slug`, `currency.slug`) that Remote's cost
 * calculator requires as input — these cannot be derived from ISO codes.
 */
export interface RemoteCostCalcCountry {
  name: string;
  code: string;
  region_slug: string;
  availability: "active" | "coming_soon";
  currency: RemoteCurrency;
  child_regions?: RemoteChildRegion[];
  has_additional_fields?: boolean;
  original_country_slug?: string;
}

export const countries: RemoteCountry[] = countriesRaw.data as RemoteCountry[];
export const costCalcCountries: RemoteCostCalcCountry[] =
  costCalcCountriesRaw.data as RemoteCostCalcCountry[];

/** Find a country by ISO alpha-2 (the public form used across the app). */
function getCountryByAlpha2(alpha2: string): RemoteCountry | undefined {
  const target = alpha2.toUpperCase();
  return countries.find((c) => c.alpha_2_code === target);
}

/**
 * ISO 3166-1 alpha-2 → alpha-3 code conversion.
 *
 * Resolves via the Remote country list (which carries both codes per entry).
 * Returns `null` when the alpha-2 isn't present in Remote's coverage — callers
 * should treat this as "unsupported by alpha-3-keyed providers (e.g. Rivermate)".
 *
 * The Remote list is comprehensive but NOT a universal ISO table; in particular
 * any country Remote doesn't surface will return null here even if the alpha-3
 * code exists in ISO. Acceptable for current adapters; a dedicated iso2→iso3
 * table can be added later if a future provider exposes more countries.
 */
export function alpha2ToAlpha3(alpha2: string): string | null {
  return getCountryByAlpha2(alpha2)?.code ?? null;
}

/**
 * Find the cost-calc entry for an ISO alpha-2 country.
 *
 * The cost-calc endpoint keys by ISO alpha-3, so we resolve via the general
 * countries list first (alpha-2 → alpha-3) and then look up the cost-calc record.
 */
export function getCostCalcCountryByAlpha2(
  alpha2: string,
): RemoteCostCalcCountry | undefined {
  const general = getCountryByAlpha2(alpha2);
  if (!general) return undefined;
  return costCalcCountries.find((c) => c.code === general.code);
}

/** ISO alpha-2 → Remote region UUID, or `null` if the country isn't cost-calc supported. */
export function getRegionSlug(alpha2: string): string | null {
  return getCostCalcCountryByAlpha2(alpha2)?.region_slug ?? null;
}

/**
 * ISO 4217 currency code → Remote currency UUID, or `null` if not available.
 *
 * Remote currencies appear nested inside cost-calc country entries; we scan
 * the flattened list and return the first matching slug.
 */
export function getCurrencySlug(iso4217: string): string | null {
  const target = iso4217.toUpperCase();
  for (const c of costCalcCountries) {
    if (c.currency.code === target) {
      return c.currency.slug;
    }
  }
  return null;
}
