import { getCountryByCode } from "@/data/deel/lookups";
import type { LocalOfficeFormState } from "@/lib/quote-state";
import { getLocalOfficeCosts } from "./data";

const AMOUNT_CCY_RE = /^([\d.,]+)\s+([A-Z]{3})$/;

/** Parse a CSV cell like "200000 COP" → { amount, currency }, else null. */
export function parseAmountCurrency(
  raw: string
): { amount: number; currency: string } | null {
  const m = AMOUNT_CCY_RE.exec(raw);
  if (!m) return null;
  const amount = Number(m[1].replace(/,/g, ""));
  if (!Number.isFinite(amount)) return null;
  return { amount, currency: m[2] };
}

/**
 * Lenient variant: returns `{ amount: 0, currency: null }` for "N/A"/"No"/
 * unparseable cells so callers can iterate every monetary field without
 * branching on parse-failure.
 */
export function parseAmountAndCurrency(
  raw: string
): { amount: number; currency: string | null } {
  if (raw === "N/A" || raw === "No") return { amount: 0, currency: null };
  const parsed = parseAmountCurrency(raw);
  if (!parsed) return { amount: 0, currency: null };
  return parsed;
}

/** Extract the numeric amount from a CSV cell; "N/A"/"No" → 0 so the field is always populated. */
export function parseAmount(raw: string): number {
  if (raw === "N/A" || raw === "No") return 0;
  const parsed = parseAmountCurrency(raw);
  return parsed?.amount ?? 0;
}

/** Currency from a CSV cell with `<amount> <CCY>`; else falls back to country default. */
export function resolveCurrency(raw: string, countryCode: string): string {
  const parsed = parseAmountCurrency(raw);
  if (parsed) return parsed.currency;
  const country = getCountryByCode(countryCode);
  return country?.default_currency ?? "USD";
}

/** Parse a VAT cell like "21%" → 21; null / "N/A" / unparseable → 0 so the field is always populated. */
export function parseVat(raw: string | null): number {
  if (raw == null) return 0;
  if (raw === "N/A") return 0;
  const m = /^([\d.,]+)\s*%?$/.exec(raw.trim());
  if (!m) return 0;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Initial `LocalOfficeFormState` derived from the CSV-tracked rates for the
 * given country, or fallback rates if the country isn't tracked.
 */
export function computeDefaults(countryCode: string): LocalOfficeFormState {
  const costs = getLocalOfficeCosts(countryCode);
  return {
    values: {
      meal_voucher: parseAmount(costs.monthly.meal_voucher),
      transportation: parseAmount(costs.monthly.transportation),
      wfh: parseAmount(costs.monthly.wfh),
      health_insurance: parseAmount(costs.monthly.health_insurance),
      local_office: parseAmount(costs.monthly.local_office),
      vat: parseVat(costs.vat),
      pre_employment_med: parseAmount(costs.one_time.pre_employment_med),
      drug_test: parseAmount(costs.one_time.drug_test),
      background_check: parseAmount(costs.one_time.background_check),
    },
    custom_lines: [],
  };
}
