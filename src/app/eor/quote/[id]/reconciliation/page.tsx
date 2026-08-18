"use client";

import { Suspense, use, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Skeleton, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { QuoteNotFound } from "@/components/QuoteNotFound";
import {
  isQuoteId,
  readEorQuote,
  setEorRecommendation,
  type RecommendationState,
  type SavedEorQuote,
} from "@/lib/quote-state";
import { useQuoteQuery } from "@/lib/use-quote-query";
import { usePapayaCosts } from "@/lib/use-papaya-costs";
import { fetchFxRate } from "@/lib/api";
import { computeMergedMonthlyTotal } from "@/lib/merged-total";
import {
  selectVarianceWinner,
  type AnalyzedProvider,
} from "@/providers/_core/reconciliation";
import { getProviderMeta } from "@/providers/_meta";
import { getCountryByCode } from "@/data/deel/lookups";
import { ContextStrip } from "@/components/reconciliation/ContextStrip";
import { VarianceScale } from "@/components/reconciliation/VarianceScale";
import { RecommendedProviderCard } from "@/components/reconciliation/RecommendedProviderCard";
import { ProviderComparisonTable } from "@/components/reconciliation/ProviderComparisonTable";
import { OverrideModal } from "@/components/reconciliation/OverrideModal";
import type { ProviderQuoteResult } from "@/providers/_core/types";

type CostBasis = "recurring_only" | "all_inclusive";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReconciliationPage({ params }: PageProps) {
  // Next 15: params is a Promise — unwrap on the client (matches the
  // existing quote page).
  const { id } = use(params);
  return (
    <Suspense fallback={<PageShell title="Recommended Provider">{null}</PageShell>}>
      <ReconciliationInner id={id} />
    </Suspense>
  );
}

function ReconciliationInner({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pull `view` from the URL; reject anything that isn't one of the two
  // canonical literals and fall back to "recurring_only" (the default cost
  // basis used elsewhere in the app).
  const rawView = searchParams.get("view");
  const view: CostBasis =
    rawView === "all_inclusive" ? "all_inclusive" : "recurring_only";

  // Hydration guard — match the existing quote page's pattern so the first
  // server-rendered shell matches the first client render. localStorage
  // reads happen after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Saved entry from localStorage. Read inside an effect (mounted gate) so
  // SSR doesn't disagree about what's persisted.
  const [saved, setSaved] = useState<SavedEorQuote | null>(null);
  useEffect(() => {
    if (!mounted) return;
    setSaved(readEorQuote(id));
  }, [mounted, id]);

  // Local recommendation state, seeded from the saved quote. Mutations to
  // this state are mirrored to localStorage via `setEorRecommendation`.
  const [recommendation, setRecommendation] =
    useState<RecommendationState | null>(null);
  useEffect(() => {
    setRecommendation(saved?.recommendation ?? null);
  }, [saved?.recommendation]);

  // Override picker modal visibility. Opens from the Recommended card's
  // "Override Recommendation" button.
  const [overrideOpen, setOverrideOpen] = useState(false);

  // Live multi-provider query (runs in parallel with FX). This is the same
  // hook the quote page uses — it dedupes across pages via React Query.
  const { query } = useQuoteQuery(id);
  const result = query.data;

  // Primary country block + form slot, sourced from the SAVED FORM (not the
  // live result) so Papaya costs can fire as soon as the form is hydrated.
  const primaryCountryCode = saved?.form.primary.country_code ?? undefined;
  const primaryCurrency = saved?.form.primary.currency ?? undefined;
  const primaryStateCode = saved?.form.primary.state ?? null;
  const primaryAnnualSalary = saved?.form.primary.annual_salary ?? undefined;
  const primaryLocalOffice = saved?.form.primary.local_office ?? null;
  const workHoursPerWeek = saved?.form.work_hours_per_week ?? undefined;

  const upperPrimaryCurrency = primaryCurrency?.toUpperCase();
  const needsMarkupFx =
    !!upperPrimaryCurrency && upperPrimaryCurrency !== "USD";
  const markupFxQuery = useQuery({
    queryKey: ["fx", upperPrimaryCurrency, "USD"] as const,
    queryFn: () => fetchFxRate(upperPrimaryCurrency!, "USD"),
    enabled: needsMarkupFx,
    staleTime: 5 * 60 * 1000,
  });
  const quoteToUsdRate =
    upperPrimaryCurrency === "USD"
      ? 1
      : markupFxQuery.data?.rate ?? null;

  const papayaResult = usePapayaCosts({
    countryCode: primaryCountryCode,
    stateCode: primaryStateCode,
    annualSalary: primaryAnnualSalary,
    quoteCurrency: primaryCurrency,
    workHoursPerWeek,
  });

  // Primary country block from the live query. Reconciliation is single-
  // country-aware: we always anchor on countries[0] (the primary slot).
  const primaryBlock = result?.countries?.[0] ?? null;

  // Build the priced-provider list for the variance picker. One entry per
  // provider with outcome === "ok", priced by `computeMergedMonthlyTotal`.
  // The result is memoized on the inputs the math actually depends on.
  const { analyzed, deelPrice, lowerBound, upperBound, winner, okProviderCount } =
    useMemo(() => {
      if (!primaryBlock) {
        return {
          analyzed: [] as AnalyzedProvider[],
          deelPrice: null as number | null,
          lowerBound: 0,
          upperBound: 0,
          winner: null as AnalyzedProvider | null,
          okProviderCount: 0,
        };
      }
      const okResults: ProviderQuoteResult[] = primaryBlock.results.filter(
        (r): r is ProviderQuoteResult & { quote: NonNullable<ProviderQuoteResult["quote"]> } =>
          r.outcome === "ok" && r.quote != null
      );
      const prices = okResults.map((r) => {
        const merged = computeMergedMonthlyTotal({
          quote: r.quote!,
          localOffice: primaryLocalOffice,
          papayaLines: papayaResult.lines,
          quoteType: view,
          quoteToUsdRate,
        });
        return { provider: r.provider_id, price: merged.monthlyTotal };
      });
      const deelEntry = prices.find((p) => p.provider === "deel");
      if (!deelEntry) {
        return {
          analyzed: [] as AnalyzedProvider[],
          deelPrice: null as number | null,
          lowerBound: 0,
          upperBound: 0,
          winner: null as AnalyzedProvider | null,
          okProviderCount: okResults.length,
        };
      }
      const variance = selectVarianceWinner(prices, deelEntry.price);
      return {
        analyzed: variance.analyzed,
        deelPrice: deelEntry.price,
        lowerBound: variance.lowerBound,
        upperBound: variance.upperBound,
        winner: variance.winner,
        okProviderCount: okResults.length,
      };
    }, [
      primaryBlock,
      primaryLocalOffice,
      papayaResult.lines,
      view,
      quoteToUsdRate,
    ]);

  // Number of providers still loading in the primary block — drives the
  // "still waiting" alert below the table.
  const stillLoadingCount = useMemo(() => {
    if (!primaryBlock) return 0;
    return primaryBlock.results.filter((r) => r.outcome === "loading").length;
  }, [primaryBlock]);

  // Override handler — called by the OverrideModal's Apply. Wired through to
  // the persistence helper AND to local state so the UI rerenders immediately
  // (without waiting for a re-read of localStorage). `isOverride` is computed
  // inside the modal (picked != algorithmic winner) so the page just persists
  // whatever the modal decided.
  const handleOverrideApply = (providerId: string, isOverride: boolean) => {
    const next: RecommendationState = {
      provider_id: providerId,
      is_override: isOverride,
      view,
      computed_at: new Date().toISOString(),
    };
    setEorRecommendation(id, next);
    setRecommendation(next);
    setOverrideOpen(false);
  };

  // Auto-save the algorithmic winner the first time the page sees one and
  // no recommendation is yet persisted. This guarantees the saved quote
  // always carries a stable pick once reconciliation has run.
  //
  // Guarded on: mounted (saved is non-null only post-mount), saved loaded,
  // no existing recommendation, and a winner exists. Re-runs intentionally
  // when the winner changes (e.g., new providers landing) so the saved pick
  // stays correct until the user overrides.
  useEffect(() => {
    if (!mounted || !saved) return;
    if (recommendation != null) return;
    if (!winner) return;
    const next: RecommendationState = {
      provider_id: winner.provider,
      is_override: false,
      view,
      computed_at: new Date().toISOString(),
    };
    setEorRecommendation(id, next);
    setRecommendation(next);
    // `view` is a URL-derived constant for the lifetime of this page, but we
    // depend on it so the auto-save uses the locked basis.
  }, [mounted, saved, recommendation, winner, id, view]);

  // Selection — the persisted override (if any) wins; otherwise the
  // algorithmic winner; otherwise null.
  const selectedProviderId =
    recommendation?.provider_id ?? winner?.provider ?? null;
  const algorithmicWinnerId = winner?.provider ?? null;

  // ---- render ----

  // Pre-hydration: stable empty shell to avoid mismatch.
  if (!mounted) {
    return <PageShell title="Recommended Provider">{null}</PageShell>;
  }

  // No saved quote — surface the same not-found body the quote page uses.
  if (!saved) {
    return (
      <PageShell title="Recommended Provider">
        <QuoteNotFound formUrl="/eor" idIsValid={isQuoteId(id)} />
      </PageShell>
    );
  }

  const backButton = (
    <Button
      size="large"
      icon={<ArrowLeftOutlined />}
      onClick={() => router.push(`/eor/quote/${id}`)}
    >
      Back to Quote
    </Button>
  );

  // Page-level loading: the live result hasn't returned ANY block yet. We
  // show the context strip (built from the saved form) plus skeletons so
  // the user knows we're working — and switch in real components as data
  // lands. We don't gate on Papaya: its lines just get folded in when ready.
  const isPageLoading = result == null;

  const countryName =
    getCountryByCode(saved.form.primary.country_code ?? "")?.name ??
    saved.form.primary.country_code ??
    "—";

  const contextStrip = (
    <ContextStrip
      countryCode={saved.form.primary.country_code ?? ""}
      countryName={countryName}
      currency={saved.form.primary.currency ?? ""}
      annualSalary={saved.form.primary.annual_salary ?? 0}
      costBasis={view}
      providerCount={okProviderCount}
    />
  );

  if (isPageLoading) {
    return (
      <PageShell title="Recommended Provider" actions={backButton}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {contextStrip}
          <Skeleton active paragraph={{ rows: 2 }} />
          <Skeleton active paragraph={{ rows: 3 }} />
          <Skeleton active paragraph={{ rows: 6 }} />
        </Space>
      </PageShell>
    );
  }

  // Deel missing as the anchor — the hero card surfaces the warning and
  // the table is suppressed (no useful comparison without an anchor).
  if (deelPrice == null) {
    return (
      <PageShell title="Recommended Provider" actions={backButton}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {contextStrip}
          <RecommendedProviderCard
            providerId=""
            providerDisplayName=""
            monthlyTotal={0}
            currency={saved.form.primary.currency ?? "USD"}
            deelPrice={0}
            isOverride={false}
            costBasis={view}
            empty={{ reason: "deel_missing" }}
            quoteId={id}
          />
        </Space>
      </PageShell>
    );
  }

  // The selected/displayed provider for the hero card — either the user's
  // override OR the algorithmic winner. If neither exists (band empty),
  // render the "no_in_band" empty state and let the table do the talking.
  const heroProvider = (() => {
    if (!selectedProviderId) return null;
    const meta = getProviderMeta(selectedProviderId);
    const displayName = meta?.display_name ?? selectedProviderId;
    const priceEntry = analyzed.find((a) => a.provider === selectedProviderId);
    const price = priceEntry?.price ?? null;
    if (price == null) return null;
    return { providerId: selectedProviderId, displayName, price };
  })();

  const currency = saved.form.primary.currency ?? "USD";

  return (
    <PageShell title="Recommended Provider" actions={backButton}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {contextStrip}
        {heroProvider ? (
          <RecommendedProviderCard
            providerId={heroProvider.providerId}
            providerDisplayName={heroProvider.displayName}
            monthlyTotal={heroProvider.price}
            currency={currency}
            deelPrice={deelPrice}
            isOverride={recommendation?.is_override ?? false}
            costBasis={view}
            onOverride={() => setOverrideOpen(true)}
            onAcidTest={() =>
              router.push(`/eor/quote/${id}/acid-test?view=${view}`)
            }
            acidTestComputedAt={saved.acidTest?.computedAt}
          />
        ) : (
          <RecommendedProviderCard
            providerId=""
            providerDisplayName=""
            monthlyTotal={0}
            currency={currency}
            deelPrice={deelPrice}
            isOverride={false}
            costBasis={view}
            empty={{ reason: "no_in_band" }}
          />
        )}
        {analyzed.length > 0 ? (
          <VarianceScale
            analyzed={analyzed}
            deelPrice={deelPrice}
            lowerBound={lowerBound}
            upperBound={upperBound}
            currency={currency}
            winnerProviderId={winner?.provider ?? null}
          />
        ) : null}
        <ProviderComparisonTable
          analyzed={analyzed}
          deelPrice={deelPrice}
          currency={currency}
          selectedProviderId={selectedProviderId}
          algorithmicWinnerId={algorithmicWinnerId}
        />
        {stillLoadingCount > 0 ? (
          <Alert
            type="info"
            showIcon
            message={`Still waiting on ${stillLoadingCount} provider${stillLoadingCount === 1 ? "" : "s"} — recommendation will update when they finish.`}
          />
        ) : null}
      </Space>
      <OverrideModal
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        analyzed={analyzed}
        currentSelectionId={selectedProviderId}
        algorithmicWinnerId={algorithmicWinnerId}
        deelPrice={deelPrice}
        currency={currency}
        onApply={handleOverrideApply}
      />
    </PageShell>
  );
}
