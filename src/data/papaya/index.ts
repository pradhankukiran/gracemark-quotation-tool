import { PAPAYA_DATA } from "./data";
import type { PapayaCountryEntry } from "./types";

export { PAPAYA_DATA } from "./data";
export type {
  PapayaCostType,
  PapayaFrequency,
  PapayaMoney,
  PapayaSalaryBand,
  PapayaEmployerCost,
  PapayaCountryEntry,
} from "./types";

/**
 * Look up Papaya data for a country (+ optional sub-national jurisdiction).
 *
 * Resolution order:
 *   1. Exact match on (countryCode, stateCode) when stateCode is provided
 *   2. National-level entry (state_code === null) for the country
 *   3. null when neither is present
 *
 * For the US specifically: when stateCode is not provided, prefer the
 * "FED" federal entry as the country-level proxy.
 */
export function getPapayaEntry(
  countryCode: string,
  stateCode: string | null = null,
): PapayaCountryEntry | null {
  const cc = countryCode.toUpperCase();
  const entries = PAPAYA_DATA[cc];
  if (!entries || entries.length === 0) return null;

  if (stateCode != null) {
    const sc = stateCode.toUpperCase();
    const match = entries.find((e) => e.state_code === sc);
    if (match) return match;
    // Fall through to country-level fallback when the requested
    // sub-national jurisdiction isn't present.
  }

  // US fallback: prefer the federal entry over the first state.
  if (cc === "US") {
    const fed = entries.find((e) => e.state_code === "FED");
    if (fed) return fed;
  }

  // Generic country-level fallback: state_code === null.
  const national = entries.find((e) => e.state_code === null);
  if (national) return national;

  // No country-level entry and no match — return null.
  return null;
}
