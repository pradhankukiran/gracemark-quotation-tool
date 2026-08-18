"use client";

import { Suspense, use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Skeleton,
  Space,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useQueries } from "@tanstack/react-query";
import { PageShell } from "@/components/PageShell";
import { QuoteNotFound } from "@/components/QuoteNotFound";
import { ContextStrip } from "@/components/reconciliation/ContextStrip";
import { CostBreakdownAccordion } from "@/components/acid-test/CostBreakdownAccordion";
import { BillRateCompositionCard } from "@/components/acid-test/BillRateCompositionCard";
import { AcidTestInputs } from "@/components/acid-test/AcidTestInputs";
import { KpiTiles } from "@/components/acid-test/KpiTiles";
import {
  AcidTestResultHero,
  type AcidTestTier,
} from "@/components/acid-test/AcidTestResultHero";
import {
  isQuoteId,
  readAcidTest,
  setAcidTest,
  DEFAULT_GRACEMARK_MARKUP,
  type AcidTestState,
} from "@/lib/quote-state";
import { useQuoteQuery } from "@/lib/use-quote-query";
import { usePapayaCosts } from "@/lib/use-papaya-costs";
import { mergeQuoteCostLines } from "@/lib/cost-merge";
import { calculateGraceMarkSeveranceLine } from "@/lib/gracemark-severance";
import { calculateGraceMarkMarkup } from "@/lib/gracemark-markup";
import {
  composeAcidTest,
  DEEL_PROVIDER_FEE_USD,
  GRACEMARK_FEE_PERCENTAGE,
  MIN_PROFIT_THRESHOLD_USD,
} from "@/lib/acid-test";
import { exportAcidTestPdf } from "@/lib/acid-test/pdf/export";
import type {
  AcidTestPdfCategory,
  AcidTestPdfData,
  AcidTestPdfProps,
} from "@/lib/acid-test/pdf/AcidTestCostBreakdownDocument";
import { fetchFxRate } from "@/lib/api";
import { inferBucket } from "@/providers/_core/buckets";
import { getProviderMeta } from "@/providers/_meta";
import { getCountryByCode } from "@/data/deel/lookups";
import { BRAND, SPACING } from "@/lib/theme";
import type {
  CostBucket,
  CostLine,
  FxSnapshot,
} from "@/providers/_core/types";

const FX_STALE_MS = 5 * 60 * 1000;
const PERSIST_DEBOUNCE_MS = 500;

type CostBasis = "recurring_only" | "all_inclusive";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AcidTestPage({ params }: PageProps) {
  // Next 15 dynamic params: `params` is a Promise — unwrap on the client to
  // stay consistent with the sibling quote / reconciliation pages.
  const { id } = use(params);
  return (
    <Suspense fallback={<PageShell title="Acid Test">{null}</PageShell>}>
      <AcidTestInner id={id} />
    </Suspense>
  );
}

function AcidTestInner({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL view → cost basis. Reject anything that isn't one of the two
  // canonical literals and fall back to "recurring_only" (the default).
  const rawView = searchParams.get("view");
  const view: CostBasis =
    rawView === "all_inclusive" ? "all_inclusive" : "recurring_only";

  // Hydration guard — match the reconciliation page's pattern. localStorage
  // reads happen after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { saved, query } = useQuoteQuery(id);

  // ----- Country / form context (sourced from the saved form) -----

  const primaryCountryCode = saved?.form.primary.country_code ?? undefined;
  const primaryCurrency = saved?.form.primary.currency ?? undefined;
  const primaryStateCode = saved?.form.primary.state ?? null;
  const primaryAnnualSalary = saved?.form.primary.annual_salary ?? undefined;
  const primaryLocalOffice = saved?.form.primary.local_office ?? null;
  const workHoursPerWeek = saved?.form.work_hours_per_week ?? undefined;

  // ----- Statutory (Papaya) lines for merge -----

  const papayaResult = usePapayaCosts({
    countryCode: primaryCountryCode,
    stateCode: primaryStateCode,
    annualSalary: primaryAnnualSalary,
    quoteCurrency: primaryCurrency,
    workHoursPerWeek,
  });

  // ----- FX rate for quote currency → USD (single query) -----

  const upperQuoteCurrency = primaryCurrency?.toUpperCase();
  const needsFx =
    !!upperQuoteCurrency && upperQuoteCurrency !== "USD";

  // Use `useQueries` (per build brief) even though it's a single query — so
  // we share the cache shape and stale-time semantics with the existing FX
  // hooks elsewhere in the app. Building from a `currencies` array keeps the
  // tuple-inference well-behaved (TanStack widens `Array<...>` rather than
  // collapsing a ternary into a never-tuple).
  const fxCurrencies = useMemo(
    () => (needsFx ? [upperQuoteCurrency!] : []),
    [needsFx, upperQuoteCurrency],
  );

  const fxQueries = useQueries({
    queries: fxCurrencies.map((cur) => ({
      queryKey: ["fx", cur, "USD"] as const,
      queryFn: () => fetchFxRate(cur, "USD"),
      staleTime: FX_STALE_MS,
    })),
  });

  const fxQuery = fxQueries[0] ?? null;
  const fxSnapshot: FxSnapshot | null = useMemo(() => {
    if (!needsFx) return null;
    return (fxQuery?.data as FxSnapshot | null | undefined) ?? null;
  }, [needsFx, fxQuery?.data]);
  const fxError = !!fxQuery?.isError;
  const fxLoading =
    needsFx && !fxError && fxSnapshot == null;

  // USD column visibility: hidden entirely when FX permanently unavailable
  // OR when the quote is already in USD. We expose it as `undefined` in the
  // hidden case so child components can drop the column; otherwise it's the
  // (possibly null while loading) rate.
  const fxRateForChildren: number | null | undefined = !needsFx
    ? undefined
    : fxError
      ? undefined
      : fxSnapshot?.rate ?? null;

  // ----- Find the recommended provider's quote -----

  // The reconciliation page persists the picked provider id (winner OR user
  // override) onto `saved.recommendation`. Look up by id so this page never
  // depends on server-side provider registration order.

  const block = query.data?.countries?.[0] ?? null;
  const providerResult = useMemo(() => {
    if (!block || !saved?.recommendation) return null;
    return (
      block.results.find(
        (r) => r.provider_id === saved.recommendation!.provider_id,
      ) ?? null
    );
  }, [block, saved?.recommendation]);

  const providerMeta = saved?.recommendation
    ? getProviderMeta(saved.recommendation.provider_id)
    : undefined;

  // ----- Build merged cost lines (provider + local-office + Papaya) -----

  const mergedLines: CostLine[] = useMemo(() => {
    if (
      !providerResult ||
      providerResult.outcome !== "ok" ||
      !providerResult.quote
    ) {
      return [];
    }
    return mergeQuoteCostLines({
      countryCode: providerResult.quote.request.country_code,
      providerLines: providerResult.quote.cost_lines,
      localOffice: primaryLocalOffice ?? undefined,
      papayaCosts: papayaResult.lines,
      providerMonthlySeveranceAccrual:
        providerResult.quote.monthly.severance_accrual,
      graceMarkSeverance: calculateGraceMarkSeveranceLine({
        countryCode: providerResult.quote.request.country_code,
        annualSalary: providerResult.quote.request.annual_salary,
      }),
    });
  }, [providerResult, primaryLocalOffice, papayaResult.lines]);

  // ----- Group lines by bucket; compute monthly totals per bucket -----

  const { bucketTotals, breakdownPanels, oneTimeTotal } = useMemo(
    () => deriveBuckets(mergedLines),
    [mergedLines],
  );

  // Match the main quote's complete employer-cost basis. Local-office
  // overhead and VAT are real costs. Termination is included only for the
  // All-Inclusive view. One-time onboarding remains outside this monthly base.
  const employerCostMonthly =
    bucketTotals.base_salary +
    bucketTotals.statutory_mandatory +
    bucketTotals.allowances_benefits +
    bucketTotals.gracemark_overhead +
    (view === "all_inclusive" ? bucketTotals.termination_costs : 0);

  const markupConfig =
    primaryLocalOffice?.markup ?? DEFAULT_GRACEMARK_MARKUP;
  const quoteToUsdRate =
    upperQuoteCurrency === "USD" ? 1 : fxSnapshot?.rate ?? null;
  const configuredMarkup = useMemo(
    () =>
      calculateGraceMarkMarkup({
        employerCostMonthly,
        config: markupConfig,
        quoteCurrency: upperQuoteCurrency ?? "USD",
        quoteToUsdRate,
      }),
    [employerCostMonthly, markupConfig, quoteToUsdRate, upperQuoteCurrency],
  );
  const configuredFeePct =
    employerCostMonthly > 0
      ? configuredMarkup.monthlyAmount / employerCostMonthly
      : 0;
  const configuredBillRate =
    employerCostMonthly + configuredMarkup.monthlyAmount;
  const isDeelProvider = providerResult?.provider_id === "deel";
  const providerFeeMonthlyOverride = isDeelProvider
    ? quoteToUsdRate != null && quoteToUsdRate > 0
      ? DEEL_PROVIDER_FEE_USD / quoteToUsdRate
      : 0
    : undefined;

  // ----- Onboarding total (from the saved local-office form values) -----
  //
  // Must come from the SAME source `cost-merge.ts` uses to emit the three
  // onboarding rows (saved.form.primary.local_office.values), so
  // `onboardingTotal` and `oneTimeTotal` can never drift. The kernel's
  // `nonPassThroughOneTimeLocal = max(0, oneTimeTotal − onboardingTotal)`
  // invariant depends on this.
  const onboardingTotal = useMemo(() => {
    const lo = saved?.form.primary.local_office?.values;
    if (!lo) return 0;
    return (
      (Number.isFinite(lo.pre_employment_med) ? Number(lo.pre_employment_med) : 0) +
      (Number.isFinite(lo.drug_test) ? Number(lo.drug_test) : 0) +
      (Number.isFinite(lo.background_check) ? Number(lo.background_check) : 0)
    );
  }, [saved]);

  // ----- Input state (seeded from persisted Acid Test slot) -----

  // We can't seed initial state from `saved` because `saved` is read after
  // mount in `useQuoteQuery` (state hooks fire before effects). The pattern
  // below seeds on mount and falls back to `null` until then; persistence is
  // gated on `mounted` so an SSR-side seed never accidentally overwrites
  // localStorage.
  const [billRate, setBillRate] = useState<number>(0);
  const [duration, setDuration] = useState<number>(12);
  const [feePct, setFeePct] = useState<number>(GRACEMARK_FEE_PERCENTAGE);
  const [hydratedInputs, setHydratedInputs] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    if (hydratedInputs) return;
    if (papayaResult.isLoading) return;
    const persisted = readAcidTest(id);
    if (persisted?.pricingVersion === 2 && persisted.costBasis === view) {
      setBillRate(persisted.billRate);
      setDuration(persisted.duration);
      setFeePct(persisted.gracemarkFeePct);
      setHydratedInputs(true);
      return;
    }
    // Legacy Acid Test inputs used an incomplete employer-cost basis. Keep
    // only their duration and reseed pricing from the current quote markup.
    if (persisted) {
      setDuration(persisted.duration);
    }
    if (employerCostMonthly > 0 && !configuredMarkup.fxUnavailable) {
      setBillRate(configuredBillRate);
      setFeePct(configuredFeePct);
      setHydratedInputs(true);
      return;
    }
    // A fixed USD markup cannot be converted after an FX failure. Keep the
    // complete employer cost visible and let the warning explain the missing
    // markup instead of silently applying an invented rate.
    if (employerCostMonthly > 0 && configuredMarkup.fxUnavailable && fxError) {
      setBillRate(employerCostMonthly);
      setFeePct(0);
      setHydratedInputs(true);
    }
  }, [
    mounted,
    hydratedInputs,
    papayaResult.isLoading,
    id,
    view,
    employerCostMonthly,
    configuredMarkup.fxUnavailable,
    configuredBillRate,
    configuredFeePct,
    fxError,
  ]);

  // ----- Debounced persistence -----

  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!mounted || !hydratedInputs) return;
    if (persistTimer.current) {
      clearTimeout(persistTimer.current);
    }
    persistTimer.current = setTimeout(() => {
      const state: AcidTestState = {
        billRate,
        duration,
        gracemarkFeePct: feePct,
        pricingVersion: 2,
        costBasis: view,
        computedAt: new Date().toISOString(),
      };
      setAcidTest(id, state);
    }, PERSIST_DEBOUNCE_MS);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [mounted, hydratedInputs, id, billRate, duration, feePct, view]);

  // ----- Run the kernel -----

  const result = useMemo(
    () =>
      composeAcidTest({
        baseSalaryMonthly: bucketTotals.base_salary,
        statutoryMonthly: bucketTotals.statutory_mandatory,
        allowancesMonthly: bucketTotals.allowances_benefits,
        terminationMonthly: bucketTotals.termination_costs,
        overheadMonthly: bucketTotals.gracemark_overhead,
        onboardingTotal,
        oneTimeTotal,
        billRate,
        duration,
        isAllInclusive: view === "all_inclusive",
        feePercentage: feePct,
        providerFeeMonthly: providerFeeMonthlyOverride,
      }),
    [
      bucketTotals,
      onboardingTotal,
      oneTimeTotal,
      billRate,
      duration,
      view,
      feePct,
      providerFeeMonthlyOverride,
    ],
  );

  const panelsWithProviderFee = useMemo(() => {
    const panels = breakdownPanels(primaryLocalOffice);
    const providerFee = result.billRateComposition.providerFeeMonthly;
    return panels.map((panel) => {
      if (panel.bucket !== "gracemark_overhead") return panel;
      return {
        ...panel,
        label: "GraceMark Costs",
        rows:
          providerFee > 0
            ? [
                ...panel.rows,
                {
                  key: "provider-fee",
                  name: "Provider fee",
                  monthly: providerFee,
                  annual: providerFee * 12,
                },
              ]
            : panel.rows,
        monthlyTotal: panel.monthlyTotal + providerFee,
      };
    });
  }, [
    breakdownPanels,
    primaryLocalOffice,
    result.billRateComposition.providerFeeMonthly,
  ]);

  const handleFeePctChange = (nextFeePct: number) => {
    setFeePct(nextFeePct);
    setBillRate(employerCostMonthly * (1 + nextFeePct));
  };

  const markupDescription =
    markupConfig.mode === "fixed_usd"
      ? `Quote markup starts from the fixed ${markupConfig.fixed_usd} USD monthly amount. The equivalent percentage is shown above.`
      : `Quote markup starts from ${markupConfig.percentage}%. Changing this value updates the bill rate.`;

  // ----- USD-side derivations -----

  const fxRateForCompute = fxSnapshot?.rate ?? null;
  const effectiveUsdRate = needsFx ? fxRateForCompute : 1;
  const monthlyProfitUsd =
    effectiveUsdRate != null
      ? result.summary.marginMonthly * effectiveUsdRate
      : null;
  const meetsMinimum =
    monthlyProfitUsd != null &&
    monthlyProfitUsd >= MIN_PROFIT_THRESHOLD_USD;
  const minimumShortfallUsd =
    monthlyProfitUsd != null
      ? Math.max(0, MIN_PROFIT_THRESHOLD_USD - monthlyProfitUsd)
      : 0;

  // ----- Hero verdict tier + copy -----

  const heroTier: AcidTestTier = (() => {
    if (needsFx && effectiveUsdRate == null) {
      // FX permanently unavailable — fall back to local-only positivity check.
      return result.summary.meetsPositive ? "warning" : "fail";
    }
    if (!result.summary.meetsPositive) return "fail";
    if (meetsMinimum) return "pass";
    return "warning";
  })();

  const heroHeadline = (() => {
    if (needsFx && effectiveUsdRate == null) {
      return result.summary.meetsPositive
        ? "USD threshold check skipped (FX unavailable)"
        : "Fail — Project is not profitable";
    }
    if (!result.summary.meetsPositive) {
      return "Fail — Project is not profitable";
    }
    if (meetsMinimum) {
      return "Pass — Monthly profit clears the USD 1,000 minimum";
    }
    return "Warning — Monthly profit below the USD 1,000 minimum";
  })();

  const heroSubline = (() => {
    if (needsFx && effectiveUsdRate == null) {
      return "USD threshold check skipped — showing local-currency profitability only.";
    }
    if (heroTier === "warning" && minimumShortfallUsd > 0) {
      return `Needs ${formatUsdSubline(minimumShortfallUsd)} more monthly profit to reach the USD 1,000 minimum.`;
    }
    return null;
  })();

  // ----- PDF export state -----

  // Export-PDF is gated behind the happy-path render: it only runs after the
  // kernel has produced a usable `result` and we have a `currency`. While the
  // page is still loading (or the provider failed) the Export PDF button is
  // disabled — see `actionsDisabled` vs the bottom-of-render handler.
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // ----- Render -----

  const backToReconciliation = `/eor/quote/${id}/reconciliation?view=${view}`;

  // Disabled-export action bar used by loading + provider-failed states. The
  // happy-path return below builds its own action bar with the working PDF
  // handler.
  const actionsDisabled = (
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
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push(backToReconciliation)}
      >
        Back to Reconciliation
      </Button>
      <Button
        size="large"
        type="primary"
        icon={<DownloadOutlined />}
        disabled
        title="Export PDF — waiting for data"
      >
        Export PDF
      </Button>
    </div>
  );

  // Pre-hydration: stable empty shell to avoid SSR/CSR mismatch.
  if (!mounted) {
    return <PageShell title="Acid Test">{null}</PageShell>;
  }

  if (saved === null) {
    return (
      <PageShell title="Acid Test">
        <QuoteNotFound formUrl="/eor" idIsValid={isQuoteId(id)} />
      </PageShell>
    );
  }

  // No reconciliation yet → bounce back. Render nothing while the navigation
  // is in flight to avoid a flash of the empty body.
  if (!saved.recommendation) {
    router.replace(`/eor/quote/${id}/reconciliation`);
    return <PageShell title="Acid Test">{null}</PageShell>;
  }

  // Loading state — providers are still fanning out (or FX is still in
  // flight). We render the context strip from the saved form (which is
  // already available) plus skeletons so the layout doesn't jump.
  const hasUsableProviderQuote =
    providerResult?.outcome === "ok" && providerResult.quote != null;
  const isPageLoading =
    query.isLoading ||
    providerResult == null ||
    (hasUsableProviderQuote &&
      (!hydratedInputs ||
        papayaResult.isLoading ||
        ((markupConfig.mode === "fixed_usd" || isDeelProvider) &&
          needsFx &&
          fxLoading)));

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
      providerCount={
        block?.results.filter((r) => r.outcome === "ok").length ?? 0
      }
      recommendedProviderId={saved.recommendation.provider_id}
      recommendedProviderName={
        providerMeta?.display_name ?? saved.recommendation.provider_id
      }
      isOverride={saved.recommendation.is_override}
    />
  );

  if (isPageLoading) {
    return (
      <PageShell title="Acid Test" wide actions={actionsDisabled}>
        <Space direction="vertical" size={SPACING.lg} style={{ width: "100%" }}>
          {contextStrip}
          <Skeleton active paragraph={{ rows: 2 }} />
          <Skeleton active paragraph={{ rows: 4 }} />
          <Skeleton active paragraph={{ rows: 6 }} />
        </Space>
      </PageShell>
    );
  }

  // Recommended provider failed → the page can't run the Acid Test.
  if (providerResult.outcome !== "ok" || !providerResult.quote) {
    return (
      <PageShell title="Acid Test" wide actions={actionsDisabled}>
        <Space direction="vertical" size={SPACING.lg} style={{ width: "100%" }}>
          {contextStrip}
          <Card>
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              Recommended provider failed — cannot run Acid Test
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              The recommended provider for this quote returned no usable data.
              Go back to reconciliation, pick a different provider, and retry.
            </Typography.Paragraph>
          </Card>
        </Space>
      </PageShell>
    );
  }

  const currency = saved.form.primary.currency ?? "USD";

  // Tile inputs derived from the kernel result.
  const totalAssignmentCosts = result.summary.totalCost;
  const billRateAllIn = result.summary.revenueTotal;

  // PDF export — only wired on the happy path, where the kernel has produced
  // a usable `result` and we have a `currency`. The categories array mirrors
  // the on-screen accordion (Base Salary, Statutory & Mandatory, Allowances &
  // Benefits, Onboarding Fees, Termination Costs) so the PDF and the page
  // stay in lock-step.
  const panelsForPdf = panelsWithProviderFee;
  const showUsdForPdf = fxRateForChildren !== undefined && fxRateForCompute != null;
  const fxRateForPdf = fxRateForCompute;

  const handleExportPdf = async () => {
    setExportError(null);
    setIsExporting(true);
    try {
      const fmtLocal = (n: number) => formatPdfCurrency(n, currency);
      const fmtUsd = (n: number) => formatPdfCurrency(n, "USD");

      const categories: AcidTestPdfCategory[] = panelsForPdf.map((panel) => ({
        title: panel.label,
        localTotal: fmtLocal(panel.monthlyTotal),
        usdTotal:
          showUsdForPdf && fxRateForPdf != null
            ? fmtUsd(panel.monthlyTotal * fxRateForPdf)
            : undefined,
        items: panel.rows.map((row) => ({
          label: row.name,
          local: fmtLocal(row.monthly),
          usd:
            showUsdForPdf && fxRateForPdf != null
              ? fmtUsd(row.monthly * fxRateForPdf)
              : undefined,
        })),
      }));

      const providerName =
        providerMeta?.display_name
        ?? saved.recommendation?.provider_id
        ?? "provider";

      const data: AcidTestPdfData = {
        currency,
        showUSD: showUsdForPdf,
        categories,
        logoSrc: "/gmk-logo.png",
        monthlyCard: {
          title: "Monthly Bill Rate",
          localValue: fmtLocal(billRate),
          usdValue:
            showUsdForPdf && fxRateForPdf != null
              ? fmtUsd(billRate * fxRateForPdf)
              : undefined,
          duration: `${duration} months`,
          description: `${providerName} · ${countryName}`,
        },
        summaryItems: [
          {
            label: "Complete employer cost (monthly)",
            amount: result.breakdown.recurringMonthly,
          },
          {
            label: "Provider fee (monthly)",
            amount: result.billRateComposition.providerFeeMonthly,
          },
          {
            label: "Total monthly cost",
            amount: result.breakdown.totalMonthlyCost,
          },
          {
            label: "GraceMark markup (monthly)",
            amount: result.billRateComposition.gracemarkFeeMonthly,
          },
          {
            label: "Profit after provider fee (monthly)",
            amount: result.summary.marginMonthly,
          },
          {
            label: "Total assignment cost",
            amount: result.summary.totalCost,
          },
          {
            label: "Total profit",
            amount: result.summary.profitLocal,
          },
        ].map(({ label, amount }) => ({
          label,
          local: fmtLocal(amount),
          usd:
            showUsdForPdf && fxRateForPdf != null
              ? fmtUsd(amount * fxRateForPdf)
              : undefined,
        })),
      };

      const pdfProps: AcidTestPdfProps = {
        data,
        providerSlug: slugify(providerName),
        countrySlug: slugify(countryName),
      };

      await exportAcidTestPdf(pdfProps);
    } catch (err) {
      console.error("Failed to export Acid Test PDF", err);
      setExportError(
        err instanceof Error
          ? err.message
          : "Failed to generate PDF. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const actionsReady = (
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
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push(backToReconciliation)}
      >
        Back to Reconciliation
      </Button>
      <Button
        size="large"
        type="primary"
        icon={<DownloadOutlined />}
        loading={isExporting}
        onClick={handleExportPdf}
      >
        Export PDF
      </Button>
    </div>
  );

  return (
    <PageShell title="Acid Test" wide actions={actionsReady}>
      <Space direction="vertical" size={SPACING.lg} style={{ width: "100%" }}>
        {contextStrip}
        <AcidTestResultHero
          tier={heroTier}
          headline={heroHeadline}
          subline={heroSubline}
        />
        {fxRateForChildren === undefined && needsFx ? (
          <Alert
            type="info"
            showIcon
            message="USD conversion unavailable — showing local currency only"
          />
        ) : null}
        {configuredMarkup.fxUnavailable && fxError ? (
          <Alert
            type="warning"
            showIcon
            message="Fixed USD markup could not be applied because FX is unavailable"
          />
        ) : null}
        {isDeelProvider && needsFx && fxError ? (
          <Alert
            type="warning"
            showIcon
            message="Deel's $450 monthly provider fee could not be converted because FX is unavailable"
          />
        ) : null}
        {exportError ? (
          <Alert
            type="error"
            showIcon
            closable
            onClose={() => setExportError(null)}
            message="Failed to export PDF"
            description={exportError}
          />
        ) : null}
        <KpiTiles
          currency={currency}
          fxRate={fxRateForChildren}
          fxLoading={fxLoading}
          totalAssignmentCosts={totalAssignmentCosts}
          totalMonthlyCost={result.breakdown.totalMonthlyCost}
          billRateAllIn={billRateAllIn}
          monthlyBillRate={result.summary.billRateMonthly}
          totalProfit={result.summary.profitLocal}
          monthlyMarkupFee={result.billRateComposition.gracemarkFeeMonthly}
          monthlyProfitUsd={monthlyProfitUsd}
        />
        <BillRateCompositionCard
          recurringMonthly={result.breakdown.recurringMonthly}
          targetGracemarkFee={
            result.billRateComposition.targetGracemarkFeeMonthly
          }
          expectedBillRate={result.billRateComposition.expectedBillRate}
          actualGracemarkFee={result.billRateComposition.gracemarkFeeMonthly}
          providerFee={result.billRateComposition.providerFeeMonthly}
          currency={currency}
          fxRate={fxRateForChildren}
          fxLoading={fxLoading}
          fxSnapshot={fxSnapshot}
        />
        <AcidTestInputs
          billRate={billRate}
          onBillRateChange={setBillRate}
          duration={duration}
          onDurationChange={setDuration}
          feePct={feePct}
          onFeePctChange={handleFeePctChange}
          currency={currency}
          markupDescription={markupDescription}
        />
        <CostBreakdownAccordion
          panels={panelsWithProviderFee}
          currency={currency}
          fxRate={fxRateForChildren}
          fxLoading={fxLoading}
        />
      </Space>
    </PageShell>
  );
}

// ----- helpers -----

interface BucketDerivation {
  bucketTotals: Record<CostBucket, number>;
  /**
   * Build the 6 collapse panels. Onboarding rows are sourced from the SAME
   * `local_office.values` that `cost-merge.ts` reads when emitting the three
   * one-time onboarding lines into the merged stream — so the panel display
   * and the kernel's `oneTimeTotal` can never drift.
   *
   * The function is curried so the deriving step (per-bucket sums) can be
   * memoized over `mergedLines` while the panel rows still pick up the
   * latest `localOfficeFormState` snapshot.
   */
  breakdownPanels: (
    localOfficeFormState: import("@/lib/quote-state").LocalOfficeFormState | null,
  ) => Array<{
    bucket: CostBucket;
    label: string;
    rows: Array<{ key: string; name: string; monthly: number; annual: number }>;
    monthlyTotal: number;
    emptyMessage?: string;
  }>;
  oneTimeTotal: number;
}

/**
 * Compute per-bucket monthly totals + the `oneTimeTotal` and produce a
 * curried factory for the breakdown panels (so the panel rendering picks up
 * the latest onboarding-defaults snapshot without re-running the bucket
 * grouping).
 *
 * Monthly amount per line:
 *   - `monthly`  → amount as-is
 *   - `annual`   → amount / 12
 *   - `one_time` → 0 (one-time costs aren't in the recurring math; they're
 *                  collected into `oneTimeTotal` separately)
 */
function deriveBuckets(mergedLines: CostLine[]): BucketDerivation {
  const totals: Record<CostBucket, number> = {
    base_salary: 0,
    statutory_mandatory: 0,
    allowances_benefits: 0,
    termination_costs: 0,
    one_time_costs: 0,
    gracemark_overhead: 0,
  };

  const monthlyByBucket: Record<
    CostBucket,
    Array<{ name: string; monthly: number; annual: number }>
  > = {
    base_salary: [],
    statutory_mandatory: [],
    allowances_benefits: [],
    termination_costs: [],
    one_time_costs: [],
    gracemark_overhead: [],
  };

  let oneTimeTotal = 0;

  for (const line of mergedLines) {
    const bucket = line.bucket ?? inferBucket(line.category);
    if (line.frequency === "monthly") {
      totals[bucket] += line.amount;
      monthlyByBucket[bucket].push({
        name: line.name,
        monthly: line.amount,
        annual: line.amount * 12,
      });
    } else if (line.frequency === "annual") {
      totals[bucket] += line.amount / 12;
      monthlyByBucket[bucket].push({
        name: line.name,
        monthly: line.amount / 12,
        annual: line.amount,
      });
    } else {
      // one_time
      oneTimeTotal += line.amount;
    }
  }

  const breakdownPanels: BucketDerivation["breakdownPanels"] = (
    localOfficeFormState,
  ) => {
    // Onboarding rows come from the SAME source `cost-merge.ts` uses to push
    // the three one-time onboarding lines into the merged stream (see
    // `mergeQuoteCostLines` step 8). That guarantees the panel display and
    // the kernel's `oneTimeTotal` cannot drift.
    const values = localOfficeFormState?.values ?? {};
    const onboardingRows: Array<{ key: string; name: string; monthly: number; annual: number }> = [];
    const preMed = values.pre_employment_med ?? 0;
    if (preMed > 0) {
      onboardingRows.push({
        key: "onboarding-premed",
        name: "Pre-Employment Medical",
        monthly: preMed,
        annual: preMed,
      });
    }
    const drugTest = values.drug_test ?? 0;
    if (drugTest > 0) {
      onboardingRows.push({
        key: "onboarding-drugtest",
        name: "Drug Test",
        monthly: drugTest,
        annual: drugTest,
      });
    }
    const backgroundCheck = values.background_check ?? 0;
    if (backgroundCheck > 0) {
      onboardingRows.push({
        key: "onboarding-bg",
        name: "Background Check (via Deel)",
        monthly: backgroundCheck,
        annual: backgroundCheck,
      });
    }

    const onboardingTotal =
      onboardingRows.reduce((sum, r) => sum + r.monthly, 0);

    const toRows = (
      arr: Array<{ name: string; monthly: number; annual: number }>,
    ) =>
      arr.map((row, idx) => ({
        key: `${row.name}-${idx}`,
        ...row,
      }));

    return [
      {
        bucket: "base_salary" as const,
        label: "Base Salary",
        rows: toRows(monthlyByBucket.base_salary),
        monthlyTotal: totals.base_salary,
      },
      {
        bucket: "statutory_mandatory" as const,
        label: "Statutory & Mandatory",
        rows: toRows(monthlyByBucket.statutory_mandatory),
        monthlyTotal: totals.statutory_mandatory,
      },
      {
        bucket: "allowances_benefits" as const,
        label: "Allowances & Benefits",
        rows: toRows(monthlyByBucket.allowances_benefits),
        monthlyTotal: totals.allowances_benefits,
      },
      {
        bucket: "one_time_costs" as const,
        label: "Onboarding Fees",
        rows: onboardingRows,
        monthlyTotal: onboardingTotal,
        emptyMessage: "No onboarding fees configured for this country",
      },
      {
        bucket: "termination_costs" as const,
        label: "Termination Costs",
        rows: toRows(monthlyByBucket.termination_costs),
        monthlyTotal: totals.termination_costs,
      },
      // Local-office overhead and VAT are recurring employer costs. The
      // provider-fee row is appended from the kernel result before display so
      // the page and PDF show the complete Acid Test cost basis.
      {
        bucket: "gracemark_overhead" as const,
        label: "GraceMark Costs",
        rows: toRows(monthlyByBucket.gracemark_overhead),
        monthlyTotal: totals.gracemark_overhead,
        emptyMessage: "No GraceMark costs",
      },
    ];
  };

  return {
    bucketTotals: totals,
    breakdownPanels,
    oneTimeTotal,
  };
}

function formatUsdSubline(amount: number): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * Currency formatter used for PDF rendering. Mirrors the on-screen accordion
 * (2 decimal places, locale-aware) so the PDF and the page stay visually
 * consistent.
 */
function formatPdfCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

/**
 * Slug helper for PDF filenames (lowercased, alphanumerics-and-hyphens only).
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
