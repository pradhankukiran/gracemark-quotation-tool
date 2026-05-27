"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearContractorResult,
  readContractorQuote,
  setContractorResult,
  type ContractorFormSnapshot,
  type SavedContractorQuote,
} from "@/lib/quote-state";
import type { ICQuoteResult as ContractorQuoteResult } from "@/lib/contractor";
import type { FxSnapshot } from "@/providers/_core/types";

const STALE_QUERY_MS = 5 * 60 * 1000;

/**
 * Snake_case "quote" payload returned by `POST /api/contractor/quote`.
 * Mirrors the response body literally so consumers can index it directly.
 */
export interface ContractorApiQuote {
  contractor_name: string;
  country_code: string;
  currency: string;
  rate_basis: "hourly" | "monthly";

  pay_rate: number;
  bill_rate: number;
  agency_fee: number;

  monthly_pay_rate: number;
  monthly_bill_rate: number;
  monthly_agency_fee: number;

  msp_fee: number;
  transaction_cost: number;
  transaction_cost_per_tx: number;
  transactions_per_month: number;
  background_check_monthly_fee: number;
  total_monthly_costs: number;
  monthly_markup: number;
  /** Margin expressed in USD. `null` when local→USD FX failed. */
  net_margin_usd: number | null;

  worked_hours: number;
  /** Applied markup percentage after kernel fallback (e.g. 40 when omitted). */
  markup_percentage: number;
  /** Applied MSP percentage after kernel fallback (0 when omitted). */
  msp_percentage: number;
}

export interface ContractorQuoteApiResponse {
  quote: ContractorApiQuote;
  fx: {
    usd_to_local: FxSnapshot | null;
    local_to_usd: FxSnapshot | null;
  };
  generated_at: string;
}

export interface UseContractorQuoteQueryResult {
  saved: SavedContractorQuote | null;
  query: {
    data: ContractorQuoteApiResponse | undefined;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
  };
  refresh: () => void;
}

/**
 * Convert the saved form snapshot into the API request body.
 *
 * When `display_in_usd === true`, the form has already FX-converted
 * `pay_rate` into USD in `handleCurrencyToggle` — so we send
 * `currency: "USD"` (overriding the snapshot's local `currency`) and the
 * server computes everything natively in USD without re-FX'ing.
 *
 * Mirrors the legacy contract: `app/ic-calculator/page.tsx` passes
 * `currency: displayCurrency` to `/api/ic-cost`, where `displayCurrency`
 * is `"USD"` when the toggle is on. The new API's schema already accepts
 * any 3-letter code, so no server change is needed — the `currency ===
 * "USD"` branch short-circuits FX (`getFxSnapshot("USD", "USD")` → null,
 * rate = 1) and bg-check / tx-cost are emitted directly in USD.
 */
function serializeContractorRequestFromForm(
  form: ContractorFormSnapshot
): Record<string, unknown> {
  const apiCurrency =
    form.display_in_usd && form.currency !== "USD" ? "USD" : form.currency;
  return {
    contractor_name: form.contractor_name,
    country_code: form.country_code,
    currency: apiCurrency,
    rate_basis: form.rate_basis,
    pay_rate: form.pay_rate,
    markup_percentage: form.markup_percentage,
    total_monthly_hours: form.total_monthly_hours,
    msp_percentage: form.msp_percentage,
    contract_duration: form.contract_duration,
    contract_duration_unit: form.contract_duration_unit,
    payment_frequency: form.payment_frequency,
    background_check_required: form.background_check_required,
    display_in_usd: form.display_in_usd,
  };
}

/**
 * Map the camelCase `ContractorQuoteResult` (the shape persisted to localStorage)
 * back into the snake_case API response shape so a cached saved result can seed
 * `initialData` and the page renders instantly without a network round-trip.
 *
 * Fields that aren't represented in `ContractorQuoteResult` (FX snapshots,
 * `generated_at`, `markup_percentage`, `msp_percentage`, `transaction_cost_per_tx`)
 * are reconstructed where possible; FX is left `null` because we never persist
 * provenance with the saved kernel result. The query layer will revalidate
 * shortly after mount and the real FX provenance will appear.
 */
function wrapSavedAsApiResponse(
  saved: ContractorQuoteResult,
  form: ContractorFormSnapshot
): ContractorQuoteApiResponse {
  const markupPct =
    Number.isFinite(form.markup_percentage) && form.markup_percentage > 0
      ? form.markup_percentage
      : 40;
  const mspPct =
    form.msp_percentage != null &&
    Number.isFinite(form.msp_percentage) &&
    form.msp_percentage > 0
      ? form.msp_percentage
      : 0;
  const txPerMonth = saved.transactionsPerMonth || 1;
  // The persisted `result` was computed in whatever currency the API saw at
  // submit time — USD when `display_in_usd === true`, local otherwise. The
  // form snapshot retains `currency` as local for ?edit= round-tripping, so
  // derive the post-toggle "working currency" the same way the serializer
  // does (and the API saw).
  const apiCurrency =
    form.display_in_usd && form.currency !== "USD" ? "USD" : form.currency;
  return {
    quote: {
      contractor_name: form.contractor_name ?? "",
      country_code: form.country_code,
      currency: apiCurrency,
      rate_basis: form.rate_basis,

      pay_rate: saved.payRate,
      bill_rate: saved.billRate,
      agency_fee: saved.agencyFee,

      monthly_pay_rate: saved.monthlyPayRate,
      monthly_bill_rate: saved.monthlyBillRate,
      monthly_agency_fee: saved.monthlyAgencyFee,

      msp_fee: saved.mspFee,
      transaction_cost: saved.transactionCost,
      transaction_cost_per_tx:
        txPerMonth > 0 ? saved.transactionCost / txPerMonth : 0,
      transactions_per_month: txPerMonth,
      background_check_monthly_fee: saved.backgroundCheckMonthlyFee,
      total_monthly_costs:
        saved.monthlyPayRate +
        saved.transactionCost +
        saved.backgroundCheckMonthlyFee +
        saved.mspFee,
      monthly_markup: saved.monthlyMarkup,
      net_margin_usd: Number.isFinite(saved.netMargin) ? saved.netMargin : null,

      worked_hours: saved.workedHours,
      markup_percentage: markupPct,
      msp_percentage: mspPct,
    },
    fx: { usd_to_local: null, local_to_usd: null },
    generated_at: new Date(0).toISOString(),
  };
}

/**
 * Convert the snake_case API quote into the camelCase `ContractorQuoteResult`
 * shape used by `setContractorResult` / localStorage. Drops API-only fields
 * that the persisted shape doesn't carry (FX snapshots, applied percentages,
 * generated_at — those are recomputable / re-fetchable on the next visit).
 */
function apiQuoteToSavedResult(
  quote: ContractorApiQuote
): ContractorQuoteResult {
  return {
    payRate: quote.pay_rate,
    billRate: quote.bill_rate,
    monthlyPayRate: quote.monthly_pay_rate,
    monthlyBillRate: quote.monthly_bill_rate,
    agencyFee: quote.agency_fee,
    monthlyAgencyFee: quote.monthly_agency_fee,
    transactionCost: quote.transaction_cost,
    mspFee: quote.msp_fee,
    backgroundCheckMonthlyFee: quote.background_check_monthly_fee,
    platformFee: 0,
    monthlyMarkup: quote.monthly_markup,
    netMargin: quote.net_margin_usd ?? 0,
    workedHours: quote.worked_hours,
    transactionsPerMonth: quote.transactions_per_month,
  };
}

/**
 * Fetch + cache the contractor quote keyed by the saved-quote id. Mirrors
 * `useQuoteQuery` (EOR) but degenerates to a single network call because the
 * contractor API computes everything server-side.
 *
 * - Reads the saved form snapshot from localStorage on mount.
 * - Seeds `initialData` from `saved.result` so revisits paint instantly.
 * - Persists the successful response back to localStorage on next idle.
 * - `refresh()` drops the persisted cache and invalidates the query.
 */
export function useContractorQuoteQuery(
  id: string
): UseContractorQuoteQueryResult {
  const queryClient = useQueryClient();
  // Read once on mount; this hook owns no UI for the not-found branch — the
  // caller handles `saved === null` itself.
  const [saved] = useState<SavedContractorQuote | null>(() =>
    readContractorQuote(id)
  );

  const query = useQuery<ContractorQuoteApiResponse, Error>({
    queryKey: ["contractor-quote", id],
    queryFn: async () => {
      if (!saved) throw new Error("Quote not found");
      const body = serializeContractorRequestFromForm(saved.form);
      const res = await fetch("/api/contractor/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
      }
      return (await res.json()) as ContractorQuoteApiResponse;
    },
    enabled: !!saved,
    staleTime: STALE_QUERY_MS,
    initialData:
      saved?.result != null
        ? wrapSavedAsApiResponse(saved.result, saved.form)
        : undefined,
  });

  // Persist the successful response to localStorage once it lands. Same idle-
  // window pattern as `useQuoteQuery` so we don't compete with paint work.
  useEffect(() => {
    if (!saved || saved.result) return;
    if (!query.data || query.isFetching) return;
    // Don't persist the placeholder initialData (epoch generated_at).
    if (query.data.generated_at === new Date(0).toISOString()) return;
    const persist = () =>
      setContractorResult(id, apiQuoteToSavedResult(query.data.quote));
    if (
      typeof window !== "undefined" &&
      "requestIdleCallback" in window
    ) {
      window.requestIdleCallback(persist, { timeout: 2000 });
    } else {
      setTimeout(persist, 0);
    }
  }, [query.data, query.isFetching, id, saved]);

  const refresh = useCallback(() => {
    clearContractorResult(id);
    queryClient.invalidateQueries({ queryKey: ["contractor-quote", id] });
  }, [id, queryClient]);

  return {
    saved,
    query: {
      data: query.data,
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
      error: (query.error as Error | null) ?? null,
    },
    refresh,
  };
}
