"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  clearQuoteResult,
  eorSnapshotToRequestMulti,
  readEorQuote,
  updateQuoteResult,
  type SavedEorQuote,
} from "@/lib/quote-state";
import { submitProviderQuote } from "@/lib/api";
import { providerQuoteQueryKey } from "@/lib/query-keys";
import { PROVIDERS_META } from "@/providers/_meta";
import type {
  CountryQuoteBlock,
  MultiProviderQuote,
  ProviderQuoteResult,
  QuoteRequest,
} from "@/providers/_core/types";

const STALE_QUERY_MS = 5 * 60 * 1000;

/**
 * Synthesised state for one provider × country cell, derived from a
 * `useQueries` result. Mirrors the subset of TanStack's `UseQueryResult` that
 * the page needs (no generics leakage into consumer types).
 */
export interface ProviderQueryState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
}

export interface UseQuoteQueryResult {
  saved: SavedEorQuote | null;
  query: {
    data: MultiProviderQuote | null;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
  };
  refresh: () => void;
  /** Per-cell states, indexed [countryIndex][providerIndex]. */
  queryStates: ProviderQueryState[][];
}

export function useQuoteQuery(id: string): UseQuoteQueryResult {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState<SavedEorQuote | null>(() => readEorQuote(id));

  const countriesFromForm = useMemo<QuoteRequest[]>(() => {
    if (!saved) return [];
    const req = eorSnapshotToRequestMulti(saved.form);
    return req?.countries ?? [];
  }, [saved]);

  // Flat list of (countryIdx, providerIdx) cells. Order matches the result
  // grid index `ci * PROVIDERS_META.length + pi` used when re-grouping.
  const cells = useMemo(
    () =>
      countriesFromForm.flatMap((country, countryIdx) =>
        PROVIDERS_META.map((meta, providerIdx) => ({
          country,
          countryIdx,
          provider: meta,
          providerIdx,
        }))
      ),
    [countriesFromForm]
  );

  const enabled = saved != null && countriesFromForm.length > 0;

  const queryResults = useQueries({
    queries: cells.map((cell) => ({
      queryKey: providerQuoteQueryKey(
        id,
        cell.provider.id,
        cell.country.country_code
      ),
      queryFn: () => submitProviderQuote(cell.provider.id, cell.country),
      enabled,
      staleTime: STALE_QUERY_MS,
      // Seed from persisted snapshot when present so revisits don't refetch.
      initialData:
        saved?.result?.countries?.[cell.countryIdx]?.results?.[cell.providerIdx],
    })),
  });

  // Pivot the flat array back into per-country blocks so consumers keep the
  // existing `MultiProviderQuote` shape. Loading cells emit synthetic
  // `outcome: "loading"` results; error cells emit `outcome: "error"`.
  const multiQuote = useMemo<MultiProviderQuote | null>(() => {
    if (!enabled || countriesFromForm.length === 0) return null;
    const persistedGenerated = saved?.result?.generated_at;
    const countries: CountryQuoteBlock[] = countriesFromForm.map(
      (country, ci) => ({
        request: country,
        results: PROVIDERS_META.map((meta, pi) => {
          const q = queryResults[ci * PROVIDERS_META.length + pi];
          if (q?.data) {
            return q.data as ProviderQuoteResult;
          }
          if (q?.isError) {
            return {
              provider_id: meta.id,
              display_name: meta.display_name,
              outcome: "error",
              quote: null,
              error: {
                message: q.error instanceof Error ? q.error.message : "Unknown error",
              },
            } satisfies ProviderQuoteResult;
          }
          return {
            provider_id: meta.id,
            display_name: meta.display_name,
            outcome: "loading",
            quote: null,
            error: null,
          } satisfies ProviderQuoteResult;
        }),
      })
    );
    return {
      request: { countries: countriesFromForm },
      generated_at: persistedGenerated ?? new Date().toISOString(),
      countries,
    };
  }, [enabled, countriesFromForm, queryResults, saved?.result?.generated_at]);

  // Per-cell state grid (countries × providers) for consumers that want to
  // render per-cell skeletons without re-deriving from the union.
  const queryStates = useMemo<ProviderQueryState[][]>(() => {
    return countriesFromForm.map((_, ci) =>
      PROVIDERS_META.map((_meta, pi) => {
        const q = queryResults[ci * PROVIDERS_META.length + pi];
        return {
          isLoading: !!q?.isLoading,
          isError: !!q?.isError,
          isSuccess: !!q?.isSuccess,
          errorMessage:
            q?.error instanceof Error ? q.error.message : null,
        };
      })
    );
  }, [countriesFromForm, queryResults]);

  const anyLoading = queryResults.some((q) => q.isLoading);
  const anyFetching = queryResults.some((q) => q.isFetching);
  const allSettled =
    queryResults.length > 0 && queryResults.every((q) => !q.isLoading);
  const allErrored =
    queryResults.length > 0 && queryResults.every((q) => q.isError);
  const firstError =
    queryResults.find((q) => q.isError)?.error instanceof Error
      ? (queryResults.find((q) => q.isError)!.error as Error)
      : null;

  // Persist successful fan-outs so the next visit hydrates from cache. Same
  // guards as before:
  //   - data + saved present, saved.result not yet populated
  //   - ALL queries have settled (no in-flight loaders)
  //   - at least one provider returned ok (don't freeze a transient all-fail)
  //   - country count matches saved form shape
  //   - existing stored result not newer than this one (concurrent-tab safety)
  useEffect(() => {
    if (!multiQuote || !saved || saved.result != null) return;
    if (!allSettled) return;
    const hasOk = multiQuote.countries.some((c) =>
      c.results.some((r) => r.outcome === "ok")
    );
    if (!hasOk) return;
    const expectedCountries = saved.form.comparison ? 2 : 1;
    if (multiQuote.countries.length !== expectedCountries) return;
    const stored = readEorQuote(id);
    if (
      stored?.result != null &&
      stored.result.generated_at >= multiQuote.generated_at
    ) {
      return;
    }
    const writeToStorage = () => {
      const ok = updateQuoteResult(id, multiQuote);
      if (!ok) {
        message.warning("Couldn't save quote locally — storage full");
      }
    };

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(writeToStorage, { timeout: 2000 });
      // No need to cancel on cleanup — if effect re-runs we'll just schedule another write.
    } else {
      setTimeout(writeToStorage, 0);
    }
  }, [multiQuote, saved, id, allSettled]);

  const refresh = useCallback(() => {
    clearQuoteResult(id);
    setSaved((prev) => (prev ? { ...prev, result: null } : prev));
    // Invalidate every provider × country cell for this saved-quote so a fresh
    // fan-out is triggered on the next render.
    PROVIDERS_META.forEach((meta) => {
      countriesFromForm.forEach((country) => {
        queryClient.invalidateQueries({
          queryKey: providerQuoteQueryKey(id, meta.id, country.country_code),
        });
      });
    });
  }, [id, countriesFromForm, queryClient]);

  return {
    saved,
    query: {
      data: multiQuote,
      isLoading: anyLoading,
      isFetching: anyFetching,
      isError: allErrored,
      error: allErrored ? firstError : null,
    },
    refresh,
    queryStates,
  };
}
