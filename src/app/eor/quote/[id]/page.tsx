"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Button } from "antd";
import {
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQueries } from "@tanstack/react-query";
import {
  clearPersisted,
  isQuoteId,
  overwriteEorQuote,
  type EorQuoteType,
} from "@/lib/quote-state";
import { fetchFxRate } from "@/lib/api";
import { useQuoteQuery } from "@/lib/use-quote-query";
import { MultiProviderQuoteView } from "@/components/eor/MultiProviderQuoteView";
import { ReconciliationStartButton } from "@/components/eor/ReconciliationStartButton";
import { PageShell } from "@/components/PageShell";
import { QuoteNotFound } from "@/components/QuoteNotFound";
import type { FxSnapshot } from "@/providers/_core/types";

const STALE_QUOTE_MS = 24 * 60 * 60 * 1000;

export interface FxLookup {
  snapshot: FxSnapshot | null;
  loading: boolean;
  error: boolean;
}

export type FxGetter = (currency: string | null | undefined) => FxLookup;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function QuoteByIdPage({ params }: PageProps) {
  // Next 15: params is a Promise — use React.use() to unwrap on the client.
  const { id } = use(params);
  return <QuoteByIdInner id={id} />;
}

function QuoteByIdInner({ id }: { id: string }) {
  const router = useRouter();
  const { saved, query, refresh } = useQuoteQuery(id);

  // `useQuoteQuery` reads localStorage synchronously, so `saved` is null on
  // the server and may be non-null on the client's first render. To keep
  // SSR and the first client render in agreement (no React hydration warning
  // and no flash of the not-found body), gate any saved-dependent branches
  // on a post-mount flag. The PageShell title stays "Quote" in every state.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Local controlled state for the bucket-model display mode. Seeded from the
  // saved snapshot (legacy entries default to `"recurring_only"` via
  // `normalizeLoadedSnapshot`); toggling on the results page is persisted via
  // `overwriteEorQuote` so a refresh comes back to the same view.
  const [quoteType, setQuoteType] = useState<EorQuoteType>(
    saved?.form.quote_type ?? "recurring_only"
  );

  const handleQuoteTypeChange = (next: EorQuoteType) => {
    setQuoteType(next);
    if (saved) {
      overwriteEorQuote(id, { ...saved.form, quote_type: next });
    }
  };

  // Unique non-USD currencies from the SAVED FORM so FX queries fire in
  // parallel with the quote fetch (not after). Using `query.data` here would
  // delay FX until providers return — which makes the header show "USD
  // unavailable" during the initial fetch window.
  const uniqueNonUsdCurrencies = useMemo(() => {
    if (!saved) return [] as string[];
    const set = new Set<string>();
    const primaryCur = saved.form.primary.currency?.toUpperCase();
    if (primaryCur && primaryCur !== "USD") set.add(primaryCur);
    const comparisonCur = saved.form.comparison?.currency?.toUpperCase();
    if (comparisonCur && comparisonCur !== "USD") set.add(comparisonCur);
    return Array.from(set);
  }, [saved]);

  const fxQueries = useQueries({
    queries: uniqueNonUsdCurrencies.map((cur) => ({
      queryKey: ["fx", cur, "USD"],
      queryFn: () => fetchFxRate(cur, "USD"),
      staleTime: 5 * 60 * 1000,
    })),
  });

  // Build a per-currency FX lookup. Loading uses the robust `!data && !error`
  // detection so the brief race between query-enable and query-isLoading
  // doesn't flash an "unavailable" tag.
  const fxByCurrency = useMemo(() => {
    const map = new Map<string, FxLookup>();
    uniqueNonUsdCurrencies.forEach((cur, idx) => {
      const q = fxQueries[idx];
      const snapshot = (q?.data as FxSnapshot | null | undefined) ?? null;
      const error = !!q?.isError;
      const loading = snapshot == null && !error;
      map.set(cur, { snapshot, loading, error });
    });
    return map;
  }, [uniqueNonUsdCurrencies, fxQueries]);

  const getFxForCurrency: FxGetter = (currency) => {
    if (!currency) return { snapshot: null, loading: false, error: false };
    const cur = currency.toUpperCase();
    if (cur === "USD") return { snapshot: null, loading: false, error: false };
    return (
      fxByCurrency.get(cur) ?? { snapshot: null, loading: false, error: false }
    );
  };

  const editHref = `/eor?edit=${id}`;

  const onNewQuote = () => {
    clearPersisted();
    router.push("/eor");
  };

  // -- Render states --

  // Pre-hydration (SSR + first client render): emit the same stable shell
  // both sides will agree on. We deliberately avoid rendering the not-found
  // body here so users with a real saved quote don't see a flash.
  if (!mounted) {
    return <PageShell title="Quote">{null}</PageShell>;
  }

  // Bad id or no entry in localStorage. Keep the title "Quote" so server and
  // client agree on the H1; only the body switches to the not-found content.
  if (!saved) {
    return (
      <PageShell title="Quote">
        <QuoteNotFound formUrl="/eor" idIsValid={isQuoteId(id)} />
      </PageShell>
    );
  }

  // Reconciliation availability: enabled only when the PRIMARY country block
  // has a Deel `ok` outcome AND at least one OTHER provider `ok`. While the
  // live query is still booting (no data yet), the button stays disabled with
  // the "Waiting for quotes to finish" tooltip.
  const primaryBlock = query.data?.countries?.[0] ?? null;
  const primaryDeelOk =
    primaryBlock?.results.some(
      (r) => r.provider_id === "deel" && r.outcome === "ok"
    ) ?? false;
  const primaryOtherOk =
    primaryBlock?.results.some(
      (r) => r.provider_id !== "deel" && r.outcome === "ok"
    ) ?? false;
  const reconciliationDisabled =
    !query.data || !primaryDeelOk || !primaryOtherOk;

  // From here on, `saved` is guaranteed non-null. The view always renders —
  // per-tab spinners and per-cell skeletons live inside MultiProviderQuoteView
  // and ProviderQuoteCard, so we don't need a page-level loading state.
  const actions = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <Button
        size="large"
        icon={<PlusOutlined />}
        onClick={onNewQuote}
      >
        New quote
      </Button>
      <Link href={editHref}>
        <Button type="primary" size="large" icon={<EditOutlined />}>
          Edit inputs
        </Button>
      </Link>
      <ReconciliationStartButton
        quoteId={id}
        currentView={quoteType}
        disabled={reconciliationDisabled}
      />
    </div>
  );

  const generatedAt = query.data?.generated_at ?? null;
  const ageMs = generatedAt
    ? Date.now() - new Date(generatedAt).getTime()
    : null;
  const isStale = ageMs != null && ageMs > STALE_QUOTE_MS;
  const ageDays = ageMs != null ? Math.floor(ageMs / (24 * 60 * 60 * 1000)) : 0;
  const staleBanner =
    isStale && !query.isFetching ? (
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message={`Computed ${ageDays === 0 ? "today" : `${ageDays} day${ageDays === 1 ? "" : "s"} ago`}`}
        description="Rates and statutory amounts may have changed since this quote was generated."
        action={
          <Button
            icon={<ReloadOutlined />}
            onClick={refresh}
          >
            Refresh
          </Button>
        }
      />
    ) : null;

  // Total-failure banner: only when every provider × country cell errored at
  // the transport layer (i.e., not a structured provider outcome — the per-
  // tab UI handles unsupported / invalid_input / error itself). When some
  // cells are still loading we show the live view (which renders spinners).
  let body: React.ReactNode;
  if (query.isError && !query.data) {
    body = (
      <Alert
        type="error"
        showIcon
        message="Couldn't generate quote"
        description={query.error?.message || "An unexpected error occurred."}
        action={
          <Link href={editHref}>
            <Button icon={<EditOutlined />}>Edit inputs</Button>
          </Link>
        }
      />
    );
  } else if (query.data) {
    body = (
      <MultiProviderQuoteView
        result={query.data}
        onRetry={refresh}
        getFxForCurrency={getFxForCurrency}
        form={saved.form}
        quoteType={quoteType}
        onQuoteTypeChange={handleQuoteTypeChange}
      />
    );
  } else {
    body = null;
  }

  return (
    <PageShell
      title="Quote"
      actions={actions}
      wide
    >
      {staleBanner}
      {body}
    </PageShell>
  );
}
