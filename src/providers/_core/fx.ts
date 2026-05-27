/**
 * Shared FX helpers for provider adapters whose upstream APIs need
 * salary input in the country's local currency, or whose internal FX
 * coverage is patchy.
 *
 * Use these when the upstream provider either (a) ignores the
 * `currencyCode` field and always treats the salary as local
 * (Playroll), or (b) errors on currency pairs not in its internal FX
 * matrix (Rivermate). In those cases we convert to local currency
 * before calling, then convert response amounts back via the
 * reciprocal of the same Papaya rate.
 */

import { countries } from "@/data/deel/lookups";
import { getFxSnapshot } from "@/lib/fx";

import { ProviderError } from "./errors";
import type { FxSnapshot, QuoteRequest } from "./types";

/**
 * Wrap `getFxSnapshot` so that null/non-finite/non-positive rates and
 * thrown errors all surface as a single `ProviderError({kind: "upstream"})`
 * tagged with the calling provider's display name.
 */
export async function fetchFxRateOrThrow(
  from: string,
  to: string,
  providerName: string
): Promise<FxSnapshot> {
  let fx: FxSnapshot | null;
  try {
    fx = await getFxSnapshot(from, to);
  } catch (err) {
    throw new ProviderError({
      kind: "upstream",
      cause: err,
      message: `${providerName}: FX conversion ${from}→${to} failed`,
    });
  }
  if (!fx || !Number.isFinite(fx.rate) || fx.rate <= 0) {
    throw new ProviderError({
      kind: "upstream",
      message: `${providerName}: no usable FX rate ${from}→${to}`,
    });
  }
  return fx;
}

/**
 * Context returned by `prepareLocalCurrencyFx`. The `localToUserRate`
 * is the reciprocal of `userToLocalRate` (Papaya's matrix is
 * mathematically reciprocal so we only fetch one rate).
 */
export interface LocalCurrencyFxContext {
  /** User's requested currency (alpha-3, uppercase). */
  userCurrency: string;
  /** Country's local currency (alpha-3, uppercase). */
  localCurrency: string;
  /** Multiplier for converting a user-currency amount into local currency (1 when same-currency). */
  userToLocalRate: number;
  /** Multiplier for converting a local-currency amount back into the user's currency (1 when same-currency). */
  localToUserRate: number;
  /** User salary expressed monthly, in user currency (= annual / 12). */
  userMonthlySalary: number;
  /** User salary expressed monthly, in local currency (= userMonthlySalary * userToLocalRate). */
  localMonthlySalary: number;
  /** Same value as `localMonthlySalary * 12`, provided for adapters whose upstream wants annual. */
  localAnnualSalary: number;
}

/**
 * Build the FX context for an adapter that needs to submit a quote in
 * the country's local currency. Looks up the local currency from the
 * Deel canonical country list, fetches the user→local rate (skipped
 * when userCurrency === localCurrency), and derives the local→user
 * rate as the reciprocal.
 *
 * Throws `ProviderError({kind: "unsupported"})` if the country has no
 * known local currency, and `ProviderError({kind: "upstream"})` if
 * the FX matrix can't satisfy the conversion.
 */
export async function prepareLocalCurrencyFx(
  input: QuoteRequest,
  providerName: string
): Promise<LocalCurrencyFxContext> {
  const userCurrency = input.currency.toUpperCase();
  const userMonthlySalary = input.annual_salary / 12;
  const countryCode = input.country_code.toUpperCase();

  const countryEntry = countries.find((c) => c.code === countryCode);
  const localCurrency = countryEntry?.default_currency?.toUpperCase();
  if (!localCurrency) {
    throw new ProviderError({
      kind: "unsupported",
      message: `${providerName}: no local currency known for ${countryCode}`,
    });
  }

  let userToLocalRate = 1;
  if (userCurrency !== localCurrency) {
    userToLocalRate = (
      await fetchFxRateOrThrow(userCurrency, localCurrency, providerName)
    ).rate;
  }
  const localToUserRate = userToLocalRate === 1 ? 1 : 1 / userToLocalRate;
  const localMonthlySalary = userMonthlySalary * userToLocalRate;
  const localAnnualSalary = localMonthlySalary * 12;

  return {
    userCurrency,
    localCurrency,
    userToLocalRate,
    localToUserRate,
    userMonthlySalary,
    localMonthlySalary,
    localAnnualSalary,
  };
}
