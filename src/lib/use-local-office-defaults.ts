"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  FALLBACK_LOCAL_OFFICE_COSTS,
  getLocalOfficeCosts,
  type LocalOfficeCosts,
} from "@/data/local-office/data";
import {
  parseAmountAndCurrency,
  parseVat,
} from "@/data/local-office/defaults";
import { fetchFxRate } from "@/lib/api";
import type { LocalOfficeFormState } from "@/lib/quote-state";
import type { FxSnapshot } from "@/providers/_core/types";

const FX_STALE_MS = 5 * 60 * 1000;

type MonetaryField =
  | "meal_voucher"
  | "transportation"
  | "wfh"
  | "health_insurance"
  | "local_office"
  | "pre_employment_med"
  | "drug_test"
  | "background_check";

const MONTHLY_FIELDS: MonetaryField[] = [
  "meal_voucher",
  "transportation",
  "wfh",
  "health_insurance",
  "local_office",
];

const ONE_TIME_FIELDS: MonetaryField[] = [
  "pre_employment_med",
  "drug_test",
  "background_check",
];

function csvCellFor(costs: LocalOfficeCosts, field: MonetaryField): string {
  if (MONTHLY_FIELDS.includes(field)) {
    return costs.monthly[field as keyof LocalOfficeCosts["monthly"]];
  }
  return costs.one_time[field as keyof LocalOfficeCosts["one_time"]];
}

export interface UseLocalOfficeDefaultsResult {
  /** Computed defaults in quote currency; zeros while loading. */
  values: LocalOfficeFormState["values"];
  /**
   * Per-row badge currency (quote currency on success, original CSV currency
   * on per-pair FX error). VAT is special: `perRowCurrency.vat === "%"`.
   */
  perRowCurrency: Record<keyof LocalOfficeFormState["values"], string>;
  isLoading: boolean;
  hasError: boolean;
  /** True when `countryCode` is missing from `LOCAL_OFFICE_COSTS`. */
  isFallback: boolean;
}

const EMPTY_VALUES: LocalOfficeFormState["values"] = {
  meal_voucher: 0,
  transportation: 0,
  wfh: 0,
  health_insurance: 0,
  local_office: 0,
  vat: 0,
  pre_employment_med: 0,
  drug_test: 0,
  background_check: 0,
};

function makeBadgeMap(
  fallback: string,
): Record<keyof LocalOfficeFormState["values"], string> {
  return {
    meal_voucher: fallback,
    transportation: fallback,
    wfh: fallback,
    health_insurance: fallback,
    local_office: fallback,
    vat: "%",
    pre_employment_med: fallback,
    drug_test: fallback,
    background_check: fallback,
  };
}

/**
 * FX-aware local-office defaults. Owns the FX `useQueries` fan-out; consumers
 * only read the resolved `values` + `perRowCurrency` badges. Returns
 * zero-filled `values` while loading or when args are undefined.
 */
export function useLocalOfficeDefaults(
  countryCode: string | undefined,
  quoteCurrency: string | undefined,
): UseLocalOfficeDefaultsResult {
  const upperQuote = quoteCurrency?.toUpperCase();
  const enabled = !!countryCode && !!upperQuote;

  // Stable per-field parsed { amount, currency } from CSV (loading-safe: when
  // disabled we still return a sensible fallback to keep hook order stable).
  const { costs, parsedByField, isFallback } = useMemo(() => {
    if (!countryCode) {
      const empty = new Map<
        MonetaryField,
        { amount: number; currency: string | null }
      >();
      for (const f of [...MONTHLY_FIELDS, ...ONE_TIME_FIELDS]) {
        empty.set(f, { amount: 0, currency: null });
      }
      return {
        costs: FALLBACK_LOCAL_OFFICE_COSTS,
        parsedByField: empty,
        isFallback: true,
      };
    }
    const c = getLocalOfficeCosts(countryCode);
    const map = new Map<
      MonetaryField,
      { amount: number; currency: string | null }
    >();
    for (const f of [...MONTHLY_FIELDS, ...ONE_TIME_FIELDS]) {
      map.set(f, parseAmountAndCurrency(csvCellFor(c, f)));
    }
    return {
      costs: c,
      parsedByField: map,
      isFallback: c.country_code === FALLBACK_LOCAL_OFFICE_COSTS.country_code,
    };
  }, [countryCode]);

  const sourceCurrencies = useMemo(() => {
    if (!upperQuote) return [] as string[];
    const set = new Set<string>();
    for (const { currency } of parsedByField.values()) {
      if (currency && currency !== upperQuote) set.add(currency);
    }
    return Array.from(set);
  }, [parsedByField, upperQuote]);

  const fxQueries = useQueries({
    queries: sourceCurrencies.map((src) => ({
      queryKey: ["fx", src, upperQuote] as const,
      queryFn: () => fetchFxRate(src, upperQuote!),
      enabled,
      staleTime: FX_STALE_MS,
    })),
  });

  const fxBySource = useMemo(() => {
    const map = new Map<
      string,
      { rate: number | null; loading: boolean; error: boolean }
    >();
    sourceCurrencies.forEach((src, idx) => {
      const q = fxQueries[idx];
      const snap = (q?.data as FxSnapshot | null | undefined) ?? null;
      const error = !!q?.isError;
      const loading = !error && snap == null && !!q?.isLoading;
      map.set(src, { rate: snap?.rate ?? null, loading, error });
    });
    return map;
  }, [sourceCurrencies, fxQueries]);

  const anyFxLoading = Array.from(fxBySource.values()).some((v) => v.loading);
  const allFxSettled =
    enabled &&
    sourceCurrencies.every((src) => {
      const e = fxBySource.get(src);
      return e && !e.loading;
    });

  const hasError = Array.from(fxBySource.values()).some((v) => v.error);

  const { values, perRowCurrency } = useMemo(() => {
    if (!enabled || !allFxSettled) {
      return {
        values: { ...EMPTY_VALUES },
        perRowCurrency: makeBadgeMap(upperQuote ?? "—"),
      };
    }
    const v: LocalOfficeFormState["values"] = {};
    const badge = makeBadgeMap(upperQuote!);
    for (const field of [...MONTHLY_FIELDS, ...ONE_TIME_FIELDS]) {
      const parsed = parsedByField.get(field)!;
      if (!parsed.currency || parsed.amount === 0) {
        v[field] = 0;
        continue;
      }
      if (parsed.currency === upperQuote) {
        v[field] = parsed.amount;
        continue;
      }
      const fx = fxBySource.get(parsed.currency);
      if (!fx || fx.error || fx.rate == null) {
        // Graceful degradation: keep CSV amount, badge shows source currency.
        v[field] = parsed.amount;
        badge[field] = parsed.currency;
        continue;
      }
      v[field] = Number((parsed.amount * fx.rate).toFixed(2));
    }
    v.vat = parseVat(costs.vat);
    return { values: v, perRowCurrency: badge };
  }, [enabled, allFxSettled, parsedByField, fxBySource, upperQuote, costs.vat]);

  return {
    values,
    perRowCurrency,
    isLoading: enabled && !allFxSettled && anyFxLoading,
    hasError,
    isFallback,
  };
}
