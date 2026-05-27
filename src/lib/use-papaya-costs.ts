"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getPapayaEntry } from "@/data/papaya";
import { fetchFxRate } from "@/lib/api";
import {
  calculatePapayaCosts,
  type CalculatedPapayaLine,
} from "@/lib/papaya-calc";
import type { FxSnapshot } from "@/providers/_core/types";

const FX_STALE_MS = 5 * 60 * 1000;

export interface UsePapayaCostsResult {
  lines: CalculatedPapayaLine[];
  isLoading: boolean;
  hasError: boolean;
  /** True when no Papaya entry exists for the country, or the entry has no employer costs. */
  unavailable: boolean;
}

export interface UsePapayaCostsArgs {
  countryCode: string | undefined;
  stateCode: string | null | undefined;
  annualSalary: number | undefined;
  quoteCurrency: string | undefined;
  workHoursPerWeek?: number;
}

/**
 * FX-aware Papaya employer-cost lines. Owns the FX `useQueries` fan-out and
 * returns calculated monthly amounts in `quoteCurrency`. Returns
 * `unavailable: true` when the country (or state) has no Papaya entry, or
 * when the entry has no employer costs (e.g. sparse-data sentinels).
 */
export function usePapayaCosts(args: UsePapayaCostsArgs): UsePapayaCostsResult {
  const { countryCode, stateCode, annualSalary, quoteCurrency, workHoursPerWeek } = args;
  const upperQuote = quoteCurrency?.toUpperCase();

  const entry = useMemo(() => {
    if (!countryCode) return null;
    return getPapayaEntry(countryCode, stateCode ?? null);
  }, [countryCode, stateCode]);

  const unavailable = entry == null || entry.employer_costs.length === 0;

  const sourceCurrencies = useMemo(() => {
    if (!entry || unavailable || !upperQuote) return [] as string[];
    const set = new Set<string>();
    if (entry.currency !== upperQuote) set.add(entry.currency);
    for (const cost of entry.employer_costs) {
      const fa = cost.fixed_amount;
      if (fa && fa.currency !== upperQuote) set.add(fa.currency);
    }
    return Array.from(set);
  }, [entry, unavailable, upperQuote]);

  const enabled =
    !unavailable && !!upperQuote && annualSalary != null && annualSalary > 0;

  const fxQueries = useQueries({
    queries: sourceCurrencies.map((src) => ({
      queryKey: ["fx", src, upperQuote] as const,
      queryFn: () => fetchFxRate(src, upperQuote!),
      enabled,
      staleTime: FX_STALE_MS,
    })),
  });

  const fxState = useMemo(() => {
    const rates: Record<string, number> = {};
    let anyLoading = false;
    let anyError = false;
    let allSettled = true;
    sourceCurrencies.forEach((src, idx) => {
      const q = fxQueries[idx];
      const snap = (q?.data as FxSnapshot | null | undefined) ?? null;
      if (q?.isError) {
        anyError = true;
        allSettled = false;
        return;
      }
      if (q?.isLoading && snap == null) {
        anyLoading = true;
        allSettled = false;
        return;
      }
      if (snap?.rate != null) rates[src] = snap.rate;
    });
    return { rates, anyLoading, anyError, allSettled };
  }, [sourceCurrencies, fxQueries]);

  const lines = useMemo<CalculatedPapayaLine[]>(() => {
    if (unavailable) return [];
    if (!enabled || !fxState.allSettled) return [];
    return calculatePapayaCosts({
      entry,
      annual_salary: annualSalary!,
      salary_currency: upperQuote!,
      quote_currency: upperQuote!,
      fx_rates: fxState.rates,
      work_hours_per_week: workHoursPerWeek,
    });
  }, [
    entry,
    unavailable,
    enabled,
    fxState.allSettled,
    fxState.rates,
    annualSalary,
    upperQuote,
    workHoursPerWeek,
  ]);

  return {
    lines,
    isLoading: enabled && fxState.anyLoading,
    hasError: fxState.anyError,
    unavailable,
  };
}
