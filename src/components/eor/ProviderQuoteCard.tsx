"use client";

import {
  Alert,
  Card,
  Col,
  Collapse,
  Divider,
  Row,
  Segmented,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type {
  CostLine,
  FxSnapshot,
  NormalizedQuote,
  ProviderQuoteResult,
} from "@/providers/_core/types";
import { inferBucket } from "@/providers/_core/buckets";
import { getCountryByCode } from "@/data/deel/lookups";
import { CountryFlag } from "@/lib/twemoji";
import { BRAND, FLAG_SIZES } from "@/lib/theme";
import { ProviderLogo } from "@/components/ProviderLogo";
import { UsdSkeleton } from "@/components/UsdSkeleton";
import type { EorQuoteType, LocalOfficeFormState } from "@/lib/quote-state";
import { mergeQuoteCostLines } from "@/lib/cost-merge";
import { usePapayaCosts } from "@/lib/use-papaya-costs";

type CostView = "monthly" | "annual";

interface CountryBlockInput {
  countryCode: string;
  currency: string;
  result: ProviderQuoteResult;
  fxSnapshot: FxSnapshot | null;
  fxLoading: boolean;
  fxError: boolean;
  /** Form-side role for this country slot ("primary" or "comparison"). */
  countryRole: "primary" | "comparison";
  /** Local-office form state for this country slot, if present (legacy quotes may omit). */
  localOffice: LocalOfficeFormState | null;
  /** Country-form state code (sourced from form), used to fetch the right Papaya entry. */
  stateCode: string | null;
  /** Country annual salary; used by Papaya rate-based cost calculations. */
  annualSalary: number | null;
  /** Shared form work-hours-per-week (drives Papaya Hourly/Daily normalization). */
  workHoursPerWeek: number | null;
}

interface ProviderQuoteCardProps {
  providerId: string;
  displayName: string;
  countryBlocks: CountryBlockInput[];
  view?: CostView;
  onViewChange?: (next: CostView) => void;
  /**
   * Bucket-model display mode (Stage 6). Drives whether termination-bucket
   * lines (severance, notice pay) count toward the per-country total. Defaults
   * to `"recurring_only"` when absent so callers from earlier in the flow keep
   * working unchanged.
   */
  quoteType?: EorQuoteType;
  /**
   * Persistence handler for the Statutory/All-inclusive toggle. Wired up from
   * the page level (MultiProviderQuoteView → ProviderQuoteCard) so the header
   * Segmented can call it on change. Optional so older callers keep working.
   */
  onQuoteTypeChange?: (next: EorQuoteType) => void;
}

interface NormalizedCostRow {
  /** Display name (may have an "(amortized)" suffix in monthly view). */
  name: string;
  amount: number;
  category: CostLine["category"];
}

/**
 * Convert a cost_line into the selected view. Annual rows shown in monthly
 * view are amortized (and labeled so the user can see what happened);
 * monthly rows shown in annual view are multiplied by 12. One-time rows
 * are passed through as-is in both views — they don't recur.
 */
function normalizeLine(line: CostLine, view: CostView): NormalizedCostRow {
  if (line.category === "one_time") {
    return { name: line.name, amount: line.amount, category: line.category };
  }
  const baseAmount =
    line.frequency === "annual" && view === "monthly"
      ? line.amount / 12
      : line.frequency === "monthly" && view === "annual"
      ? line.amount * 12
      : line.amount;
  return {
    name:
      line.frequency === "annual" && view === "monthly"
        ? `${line.name} (amortized)`
        : line.name,
    amount: baseAmount,
    category: line.category,
  };
}

function formatCurrency(amount: number, currency: string): string {
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

// Deterministic UTC format so SSR and CSR render identical strings.
const FX_TIMESTAMP_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatFxTimestamp(iso: string): string {
  return `${FX_TIMESTAMP_FMT.format(new Date(iso))} UTC`;
}

const categoryColors: Record<CostLine["category"], string> = {
  base_salary: BRAND.categoryBaseSalary,
  statutory: BRAND.categoryStatutory,
  accruals: BRAND.categoryAccruals,
  severance: BRAND.categorySeverance,
  bonuses: BRAND.categoryBonuses,
  allowances: BRAND.categoryAllowances,
  // IC-only categories — colors borrow from the existing palette and are
  // placeholders until IC has its own rendering surface.
  contractor_rate: BRAND.categoryBaseSalary,
  markup: BRAND.categoryMarkup,
  one_time: BRAND.categoryOneTime,
};

const categoryLabels: Record<CostLine["category"], string> = {
  base_salary: "Base salary",
  statutory: "Statutory",
  accruals: "Accruals",
  severance: "Severance",
  bonuses: "Bonuses",
  allowances: "Allowances",
  contractor_rate: "Contractor rate",
  markup: "Markup",
  one_time: "One-time",
};

/**
 * Header for one country column inside a provider tab. Renders flag + name
 * + currency badge on the left and (when totals are provided) the big
 * recurring-cost total on the right with optional USD subtotal and a note
 * indicating one-time costs are excluded.
 */
function CountryColumnHeader({
  countryCode,
  currency,
  view,
  total,
  totalUsd,
  showUsd,
  hasExcludedRows,
  quoteType,
}: {
  countryCode: string;
  currency: string;
  view?: CostView;
  total?: number;
  totalUsd?: number | null;
  showUsd?: boolean;
  /** True when at least one row exists that the total excludes. Mirrors the
   * legacy "Excludes one-time costs." conditional but now bucket-aware. */
  hasExcludedRows?: boolean;
  /** Bucket-model display mode; selects the wording of the explanatory note. */
  quoteType?: EorQuoteType;
}) {
  const country = getCountryByCode(countryCode);
  const countryLabel = country?.name ?? countryCode;
  const hasTotal = total != null && view != null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <CountryFlag
          code={countryCode}
          width={FLAG_SIZES.md}
          height={FLAG_SIZES.md}
          alt={`${countryLabel} flag`}
          style={{ borderRadius: 3 }}
        />
        <Typography.Title level={4} style={{ margin: 0 }}>
          {countryLabel}
        </Typography.Title>
        <Tag style={{ marginLeft: 4 }}>{currency}</Tag>
      </div>
      {hasTotal ? (
        <div style={{ textAlign: "right" }}>
          <Typography.Title
            level={3}
            style={{ margin: 0, color: BRAND.primary, fontWeight: 700 }}
          >
            {formatCurrency(total, currency)}
            {showUsd ? (
              <>
                {" | "}
                {totalUsd == null ? (
                  <UsdSkeleton />
                ) : (
                  formatCurrency(totalUsd, "USD")
                )}
              </>
            ) : null}
          </Typography.Title>
          {hasExcludedRows ? (
            <div style={{ marginTop: 2 }}>
              <Typography.Text
                type="secondary"
                italic
                style={{ fontSize: 12 }}
              >
                {quoteType === "all_inclusive"
                  ? "All-inclusive monthly · termination amortized · excludes one-time costs."
                  : "Recurring monthly · excludes one-time and termination costs."}
              </Typography.Text>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The cost table + FX provenance line for a single country, when the
 * provider returned a successful quote. The Monthly/Annual toggle is shared
 * across the whole tab so it lives on the parent (Card extra), not here.
 *
 * `mergedLines` already includes provider lines (with any matched amounts
 * silently replaced by local-office values) PLUS appended local-office rows
 * (overhead, VAT, custom monthly). Rendering treats every row identically.
 */
function CountrySuccess({
  quote,
  mergedLines,
  view,
  fxSnapshot,
  fxLoading,
  fxError,
}: {
  quote: NormalizedQuote;
  mergedLines: CostLine[];
  view: CostView;
  fxSnapshot: FxSnapshot | null;
  fxLoading: boolean;
  fxError: boolean;
}) {
  const currency = quote.currency;
  const isNonUsd = currency !== "USD";
  // USD column shows when:
  // - currency is non-USD (otherwise no conversion is meaningful), AND
  // - we either have a snapshot or are still loading one (placeholders).
  // Hide the column entirely when there's an error or no snapshot ever lands —
  // the warning alert above the table tells the user why.
  const showUsd = isNonUsd && (fxSnapshot != null || fxLoading);
  // FX warning: non-USD currency, FX errored or yielded null — drop the column,
  // keep the local-currency table.
  const showFxWarning = isNonUsd && !fxLoading && (fxError || fxSnapshot == null);
  const rate = fxSnapshot?.rate ?? null;

  const columns: ColumnsType<NormalizedCostRow & { key: string }> = [
    {
      title: "Item",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      align: "center",
      width: 140,
      render: (value: CostLine["category"]) => (
        <Tag color={categoryColors[value]}>{categoryLabels[value]}</Tag>
      ),
    },
    {
      title: view === "monthly" ? "Monthly" : "Annual",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 160,
      render: (value: number) => formatCurrency(value, currency),
    },
    ...(showUsd
      ? [
          {
            title: "USD",
            dataIndex: "amount" as const,
            key: "usd_amount",
            align: "right" as const,
            width: 120,
            render: (value: number) => {
              if (rate == null) {
                return <UsdSkeleton />;
              }
              return formatCurrency(value * rate, "USD");
            },
          },
        ]
      : []),
  ];

  const tableData = mergedLines.map((line, idx) => {
    const normalized = normalizeLine(line, view);
    return {
      ...normalized,
      key: `${line.name}-${idx}`,
    };
  });

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {showFxWarning ? (
        <Alert
          type="warning"
          showIcon
          message="USD unavailable — showing local currency only"
        />
      ) : null}
      <Table
        key={view}
        columns={columns}
        dataSource={tableData}
        pagination={false}
        size="middle"
        scroll={{ x: "max-content" }}
      />

      {fxSnapshot ? (
        <Typography.Text
          type="secondary"
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            display: "block",
            marginTop: -8,
          }}
        >
          FX: 1 {fxSnapshot.base_currency} = {fxSnapshot.rate.toFixed(6)}{" "}
          {fxSnapshot.target_currency} · {fxSnapshot.source} (fetched{" "}
          {formatFxTimestamp(fxSnapshot.fetched_at)})
        </Typography.Text>
      ) : null}
    </Space>
  );
}

/**
 * One country column: header (flag/name/currency, plus the prominent total
 * when the quote is available) followed by the cost table or a failure alert.
 */
function CountryColumnBody({
  countryCode,
  currency,
  result,
  view,
  fxSnapshot,
  fxLoading,
  fxError,
  localOffice,
  stateCode,
  annualSalary,
  workHoursPerWeek,
  quoteType,
}: {
  countryCode: string;
  currency: string;
  result: ProviderQuoteResult;
  view: CostView;
  fxSnapshot: FxSnapshot | null;
  fxLoading: boolean;
  fxError: boolean;
  localOffice: LocalOfficeFormState | null;
  stateCode: string | null;
  annualSalary: number | null;
  workHoursPerWeek: number | null;
  quoteType: EorQuoteType;
}) {
  const { outcome, quote, error } = result;
  const errorDescription = error?.message || "";

  // Papaya employer-cost lines for this country. Called unconditionally (hook
  // rules) — the hook short-circuits to `unavailable: true` and empty lines
  // when args are missing or the country has no Papaya entry. We treat
  // `unavailable` and `hasError` as silent degradation (no UI signal) per
  // product direction.
  const papayaResult = usePapayaCosts({
    countryCode,
    stateCode,
    annualSalary: annualSalary ?? undefined,
    quoteCurrency: currency,
    workHoursPerWeek: workHoursPerWeek ?? undefined,
  });

  if (outcome === "loading") {
    // Per-cell skeleton: roughly matches the height of a real cost-line table
    // so the layout doesn't jump when the data lands.
    return (
      <>
        <CountryColumnHeader countryCode={countryCode} currency={currency} />
        <Skeleton active paragraph={{ rows: 6 }} />
      </>
    );
  }

  if (outcome === "ok") {
    if (!quote) {
      // Defensive fallback: outcome says ok but quote payload is missing.
      return (
        <>
          <CountryColumnHeader countryCode={countryCode} currency={currency} />
          <Alert
            type="error"
            showIcon
            message="Couldn't fetch quote from this provider."
            description="Provider reported success but returned no quote data."
          />
        </>
      );
    }
    const mergedLines = mergeQuoteCostLines({
      providerLines: quote.cost_lines,
      localOffice: localOffice ?? undefined,
      papayaCosts: papayaResult.lines,
      providerMonthlySeveranceAccrual: quote.monthly.severance_accrual,
    });
    // Bucket-aware predicate: drop one-time always; drop termination costs
    // unless we're in `all_inclusive` mode (Stage 6 of the bucket-model
    // rollout). Falls back to `inferBucket(category)` for any line that
    // doesn't yet carry an explicit `bucket` tag.
    const isIncludedInTotal = (row: CostLine) => {
      const bucket = row.bucket ?? inferBucket(row.category);
      if (bucket === "one_time_costs") return false;
      if (bucket === "termination_costs" && quoteType !== "all_inclusive") return false;
      return true;
    };
    // Row-visibility predicate for the table. One-time rows STAY VISIBLE in
    // both modes (informational at-hire costs; never in monthly total but
    // always shown). Termination_costs rows are visible only in
    // `all_inclusive` mode.
    const visibleLines = mergedLines.filter((line) => {
      const bucket = line.bucket ?? inferBucket(line.category);
      if (bucket === "termination_costs" && quoteType !== "all_inclusive") return false;
      return true;
    });
    // Per-view total in quote currency, excluding non-included buckets. Annual
    // rows shown monthly are amortized via normalizeLine; monthly rows in
    // annual view get x12 — same math the table uses for its amount column.
    const total = mergedLines
      .filter(isIncludedInTotal)
      .reduce((sum, line) => sum + normalizeLine(line, view).amount, 0);
    const isNonUsd = quote.currency !== "USD";
    const showUsd = isNonUsd && (fxSnapshot != null || fxLoading);
    const rate = fxSnapshot?.rate ?? null;
    const totalUsd = showUsd && rate != null ? total * rate : null;
    const hasExcludedRows = mergedLines.some((l) => !isIncludedInTotal(l));
    return (
      <>
        <CountryColumnHeader
          countryCode={countryCode}
          currency={currency}
          view={view}
          total={total}
          totalUsd={totalUsd}
          showUsd={showUsd}
          hasExcludedRows={hasExcludedRows}
          quoteType={quoteType}
        />
        <CountrySuccess
          quote={quote}
          mergedLines={visibleLines}
          view={view}
          fxSnapshot={fxSnapshot}
          fxLoading={fxLoading}
          fxError={fxError}
        />
      </>
    );
  }

  if (outcome === "unsupported") {
    return (
      <>
        <CountryColumnHeader countryCode={countryCode} currency={currency} />
        <Alert
          type="info"
          showIcon
          message="This provider doesn't operate in this country."
          description={errorDescription}
        />
      </>
    );
  }

  if (outcome === "invalid_input") {
    return (
      <>
        <CountryColumnHeader countryCode={countryCode} currency={currency} />
        <Alert
          type="warning"
          showIcon
          message="This provider rejected the inputs."
          description={errorDescription}
        />
      </>
    );
  }

  return (
    <>
      <CountryColumnHeader countryCode={countryCode} currency={currency} />
      <Alert
        type="error"
        showIcon
        message="Couldn't fetch quote from this provider."
        description={errorDescription}
      />
    </>
  );
}

export function ProviderQuoteCard({
  providerId,
  displayName,
  countryBlocks,
  view,
  onViewChange,
  quoteType,
  onQuoteTypeChange,
}: ProviderQuoteCardProps) {
  const effectiveView: CostView = view ?? "monthly";
  const effectiveQuoteType: EorQuoteType = quoteType ?? "recurring_only";
  const isComparison = countryBlocks.length > 1;
  // Two-up grid on md+, stacked below. Single-country uses a full-width col.
  const colSpan = isComparison ? { xs: 24, md: 12 } : { xs: 24 };
  // First column whose result is successful — used to source the `raw` JSON
  // payload for the per-provider "Raw response" Collapse at the bottom of
  // the card, so the comparison view doesn't double up that section.
  const firstOk = countryBlocks.find(
    (cb) => cb.result.outcome === "ok" && cb.result.quote
  );

  return (
    <Card
      title={
        <ProviderLogo
          providerId={providerId}
          fallback={displayName}
          height={28}
        />
      }
      extra={
        <div style={{ display: "inline-flex", alignItems: "center" }}>
          <Segmented
            size="middle"
            value={effectiveQuoteType}
            onChange={(v) => onQuoteTypeChange?.(v as EorQuoteType)}
            options={[
              { label: "Statutory", value: "recurring_only" },
              { label: "All-inclusive", value: "all_inclusive" },
            ]}
          />
          <Divider type="vertical" style={{ height: "20px", marginInline: 8 }} />
          <Segmented
            size="middle"
            value={effectiveView}
            options={[
              { label: "Monthly", value: "monthly" },
              { label: "Annual", value: "annual" },
            ]}
            onChange={(value) => onViewChange?.(value as CostView)}
          />
        </div>
      }
    >
      <Row gutter={[24, 24]}>
        {countryBlocks.map((cb) => (
          <Col key={cb.countryCode} {...colSpan}>
            <CountryColumnBody
              countryCode={cb.countryCode}
              currency={cb.currency}
              result={cb.result}
              view={effectiveView}
              fxSnapshot={cb.fxSnapshot}
              fxLoading={cb.fxLoading}
              fxError={cb.fxError}
              localOffice={cb.localOffice}
              stateCode={cb.stateCode}
              annualSalary={cb.annualSalary}
              workHoursPerWeek={cb.workHoursPerWeek}
              quoteType={effectiveQuoteType}
            />
          </Col>
        ))}
      </Row>

      {firstOk && firstOk.result.quote ? (
        <div style={{ marginTop: 24 }}>
          <Collapse
            items={[
              {
                key: "raw",
                label: `Raw ${displayName} response${isComparison ? ` (${firstOk.countryCode})` : ""}`,
                children: (
                  <pre
                    style={{
                      margin: 0,
                      maxHeight: 400,
                      overflow: "auto",
                      fontSize: 13,
                      lineHeight: 1.5,
                      background: BRAND.bgSubtle,
                      padding: 16,
                      borderRadius: 8,
                    }}
                  >
                    {JSON.stringify(firstOk.result.quote.raw, null, 2)}
                  </pre>
                ),
              },
            ]}
          />
        </div>
      ) : null}
    </Card>
  );
}
