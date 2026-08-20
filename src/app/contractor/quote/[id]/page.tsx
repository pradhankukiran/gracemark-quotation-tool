"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { PageShell } from "@/components/PageShell";
import { QuoteNotFound } from "@/components/QuoteNotFound";
import { clearContractorResult, isQuoteId } from "@/lib/quote-state";
import { getCountryByCode } from "@/data/deel/lookups";
import { CountryFlag } from "@/lib/twemoji";
import { BRAND, FLAG_SIZES, SPACING } from "@/lib/theme";
import {
  useContractorQuoteQuery,
  type ContractorApiQuote,
  type ContractorQuoteApiResponse,
} from "@/lib/use-contractor-quote-query";
import { exportContractorPdf } from "@/lib/contractor/pdf/export";
import type { ICPdfData } from "@/lib/contractor/pdf/document";
import type { FxSnapshot } from "@/providers/_core/types";

/**
 * URL-safe slug helper for PDF filenames. Lowercases, collapses any
 * non-alphanumeric run to a single hyphen, and trims leading/trailing hyphens.
 * Mirrors the helper in `src/app/eor/quote/[id]/acid-test/page.tsx`.
 */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

// Deterministic UTC format so SSR and CSR render the same string for the FX
// provenance line (matches `ProviderQuoteCard`).
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

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

function formatUsd(amount: number): string {
  return formatMoney(amount, "USD");
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContractorQuoteByIdPage({ params }: PageProps) {
  // Next 15: params is a Promise — unwrap on the client.
  const { id } = use(params);
  return <ContractorQuoteByIdInner id={id} />;
}

function ContractorQuoteByIdInner({ id }: { id: string }) {
  const router = useRouter();
  const { saved, query, refresh } = useContractorQuoteQuery(id);

  // SSR / hydration parity: `useContractorQuoteQuery` reads localStorage
  // synchronously, so `saved` is null on the server and may be non-null on
  // the client's first render. Gate any saved-dependent branches on a
  // post-mount flag to avoid hydration mismatch and a flash of not-found.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // PDF export state. Mirrors the acid-test page (`handleExportPdf`): the
  // button shows a spinner while the worker generates, and surfaces any error
  // via a closable alert near the top of the body.
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const onNewQuote = () => {
    clearContractorResult(id);
    router.push("/contractor");
  };

  // -- Render states --

  if (!mounted) {
    return <PageShell title="Quote">{null}</PageShell>;
  }

  if (!saved) {
    return (
      <PageShell title="Quote">
        <QuoteNotFound formUrl="/contractor" idIsValid={isQuoteId(id)} />
      </PageShell>
    );
  }

  const editHref = `/contractor?edit=${id}`;

  // Compose the PDF payload from the resolved quote + saved form snapshot.
  // Only enabled once `query.data` is present (button is disabled otherwise).
  const handleExportPdf = async () => {
    if (!query.data) return;
    const quote = query.data.quote;
    const form = saved.form;
    const currency = quote.currency;
    const workedHours = quote.worked_hours;
    const isHourly = quote.rate_basis === "hourly";

    // Hourly values: prefer the API's hourly fields when the input was hourly;
    // for monthly inputs derive `hourly = monthly / workedHours` (guarding the
    // zero-hours edge case).
    const safeHours = workedHours > 0 ? workedHours : 1;
    const payRateHourly = isHourly
      ? quote.pay_rate
      : quote.monthly_pay_rate / safeHours;
    const billRateHourly = isHourly
      ? quote.bill_rate
      : quote.monthly_bill_rate / safeHours;
    const agencyFeeHourly = isHourly
      ? quote.agency_fee
      : quote.monthly_agency_fee / safeHours;

    const durationMonths =
      form.contract_duration_unit === "years"
        ? form.contract_duration * 12
        : form.contract_duration;

    const countryName =
      getCountryByCode(form.country_code)?.name ?? form.country_code;

    const totalClientCost =
      quote.monthly_bill_rate +
      quote.transaction_cost +
      quote.background_check_monthly_fee +
      quote.msp_fee;

    const pdfData: ICPdfData = {
      contractorName: form.contractor_name,
      country: countryName,
      currency,
      showUSD: form.display_in_usd,
      rateInfo: {
        payRateHourly: formatMoney(payRateHourly, currency),
        payRateMonthly: formatMoney(quote.monthly_pay_rate, currency),
        billRateHourly: formatMoney(billRateHourly, currency),
        billRateMonthly: formatMoney(quote.monthly_bill_rate, currency),
        agencyFeeHourly: formatMoney(agencyFeeHourly, currency),
        agencyFeeMonthly: formatMoney(quote.monthly_agency_fee, currency),
        markupPercentage: `${quote.markup_percentage.toFixed(2)}%`,
        workedHours,
      },
      costBreakdown: [
        {
          label: "Contractor Pay Rate",
          value: formatMoney(quote.monthly_pay_rate, currency),
        },
        {
          label: "Agency Fee",
          value: formatMoney(quote.monthly_agency_fee, currency),
          description: `${quote.markup_percentage.toFixed(2)}% markup on pay rate`,
        },
        {
          label: "Platform Fee",
          value: formatMoney(quote.transaction_cost, currency),
          description: `${quote.transactions_per_month} × $55 USD per transaction`,
        },
        ...(quote.msp_fee > 0
          ? [
              {
                label: "MSP Fee",
                value: formatMoney(quote.msp_fee, currency),
                description: `${quote.msp_percentage.toFixed(2)}% of bill rate`,
              },
            ]
          : []),
        ...(quote.background_check_monthly_fee > 0
          ? [
              {
                label: "Background Check Fee",
                value: formatMoney(
                  quote.background_check_monthly_fee,
                  currency,
                ),
                description: `$200 USD amortized over ${durationMonths} months`,
              },
            ]
          : []),
      ],
      totalClientCost: formatMoney(totalClientCost, currency),
      monthlyMarkup: formatMoney(quote.monthly_markup, currency),
      contractDuration: `${form.contract_duration} ${form.contract_duration_unit}`,
      paymentFrequency: form.payment_frequency,
      logoSrc: "/gmk-logo.png",
    };

    const contractorSlug = slugify(form.contractor_name || "");
    const countrySlug = slugify(countryName || form.country_code);

    try {
      setIsExporting(true);
      setExportError(null);
      await exportContractorPdf({ data: pdfData, contractorSlug, countrySlug });
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Failed to export PDF",
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Export-PDF is only meaningful once the API has returned a quote. While
  // loading / errored we keep the button disabled so the user can't click into
  // an empty-state PDF.
  const canExport = !!query.data && !query.isError;

  const actions = (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button size="large" icon={<PlusOutlined />} onClick={onNewQuote}>
        New quote
      </Button>
      <Link href={editHref}>
        <Button size="large" icon={<EditOutlined />}>
          Edit inputs
        </Button>
      </Link>
      <Button
        type="primary"
        size="large"
        icon={<DownloadOutlined />}
        loading={isExporting}
        disabled={!canExport}
        onClick={handleExportPdf}
      >
        Export PDF
      </Button>
    </div>
  );

  // Body branching: loading skeleton, error alert, or the full quote view.
  let body: React.ReactNode;
  if (query.isError && !query.data) {
    body = (
      <Alert
        type="error"
        showIcon
        message="Couldn't generate quote"
        description={query.error?.message || "An unexpected error occurred."}
        action={
          <Button icon={<ReloadOutlined />} onClick={refresh}>
            Retry
          </Button>
        }
      />
    );
  } else if (query.isLoading || !query.data) {
    body = <ContractorQuoteSkeleton />;
  } else {
    body = (
      <ContractorQuoteBody
        form={saved.form}
        response={query.data}
      />
    );
  }

  return (
    <PageShell title="Quote" actions={actions}>
      <Space direction="vertical" size={SPACING.lg} style={{ width: "100%" }}>
        {exportError ? (
          <Alert
            type="error"
            showIcon
            closable
            message="Failed to export PDF"
            description={exportError}
            onClose={() => setExportError(null)}
          />
        ) : null}
        {body}
      </Space>
    </PageShell>
  );
}

/** Body skeleton used while the initial network call is in flight. */
function ContractorQuoteSkeleton() {
  return (
    <Space direction="vertical" size={SPACING.lg} style={{ width: "100%" }}>
      <Skeleton.Input active block style={{ height: 32 }} />
      <Row gutter={[16, 16]}>
        {[0, 1, 2].map((i) => (
          <Col key={i} xs={24} md={8}>
            <Card>
              <Skeleton active paragraph={{ rows: 2 }} title={false} />
            </Card>
          </Col>
        ))}
      </Row>
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    </Space>
  );
}

/**
 * Resolved (post-fetch) quote body. Pulled out into a sibling component so the
 * outer page handles the loading / not-found / error branches and this stays
 * focused on the layout once `quote` is known.
 */
function ContractorQuoteBody({
  form,
  response,
}: {
  form: import("@/lib/quote-state").ContractorFormSnapshot;
  response: ContractorQuoteApiResponse;
}) {
  const quote = response.quote;
  const country = getCountryByCode(form.country_code);
  const countryLabel = country?.name ?? form.country_code;
  const currency = quote.currency;
  const workedHours = quote.worked_hours;
  const isHourly = quote.rate_basis === "hourly";

  // Per-card primary/secondary rate values. The "primary" unit matches the
  // user's input basis; the "secondary" derives from it via `workedHours`.
  const primaryUnit = isHourly ? "/hr" : "/month";
  const secondaryUnit = isHourly ? "/month" : "/hr";

  const payRatePrimary = isHourly ? quote.pay_rate : quote.monthly_pay_rate;
  const payRateSecondary = isHourly ? quote.monthly_pay_rate : quote.pay_rate;
  const billRatePrimary = isHourly ? quote.bill_rate : quote.monthly_bill_rate;
  const billRateSecondary = isHourly
    ? quote.monthly_bill_rate
    : quote.bill_rate;
  const agencyFeePrimary = isHourly
    ? quote.agency_fee
    : quote.monthly_agency_fee;
  const agencyFeeSecondary = isHourly
    ? quote.monthly_agency_fee
    : quote.agency_fee;

  // Total client cost per month = monthly bill rate + pass-through costs.
  // Mirrors the legacy `total_monthly_costs + agency_fee` reformulation, which
  // equals `monthly_bill_rate + transaction_cost + bg_check + msp`.
  const totalClientCost =
    quote.monthly_bill_rate +
    quote.transaction_cost +
    quote.background_check_monthly_fee +
    quote.msp_fee;

  const fxUsdToLocal = response.fx.usd_to_local;
  const fxLocalToUsd = response.fx.local_to_usd;

  // USD display logic. Three cases:
  //   - currency === "USD": toggle is irrelevant; local IS USD, no extra column.
  //   - display_in_usd === false: show local only.
  //   - display_in_usd === true && fxLocalToUsd: render USD alongside local.
  // When the user asked for USD but FX failed (`display_in_usd === true` and
  // `fxLocalToUsd === null`), we surface an info alert and fall back to local.
  const isUsdQuote = currency === "USD";
  const usdRequested = form.display_in_usd === true;
  const showUsdColumn = !isUsdQuote && usdRequested && fxLocalToUsd !== null;
  const showUsdUnavailableAlert =
    !isUsdQuote && usdRequested && fxLocalToUsd === null;
  const usdRate = fxLocalToUsd?.rate ?? null;
  const toUsd = (local: number): number =>
    usdRate !== null ? local * usdRate : 0;

  return (
    <Space direction="vertical" size={SPACING.lg} style={{ width: "100%" }}>
      {showUsdUnavailableAlert ? (
        <Alert
          type="info"
          showIcon
          message="USD conversion unavailable — showing local currency only"
        />
      ) : null}
      {/* Context strip: flag · country · currency · contractor */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          padding: "12px 16px",
          background: BRAND.bgContainer,
          border: `1px solid ${BRAND.border}`,
          borderRadius: 10,
        }}
      >
        <Space size="middle" wrap split={<span style={{ color: BRAND.textMuted }}>·</span>}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <CountryFlag
              code={form.country_code}
              width={FLAG_SIZES.md}
              height={FLAG_SIZES.md}
              alt={`${countryLabel} flag`}
              style={{ borderRadius: 3 }}
            />
            <Typography.Text strong style={{ fontSize: 16 }}>
              {countryLabel}
            </Typography.Text>
          </span>
          <Typography.Text style={{ color: BRAND.textSecondary }}>
            {currency}
          </Typography.Text>
          {form.contractor_name ? (
            <Typography.Text strong style={{ color: BRAND.text }}>
              {form.contractor_name}
            </Typography.Text>
          ) : null}
          <Typography.Text style={{ color: BRAND.textSecondary }}>
            {quote.rate_basis === "hourly" ? "Hourly rate" : "Monthly rate"} · {workedHours} hrs/mo
          </Typography.Text>
        </Space>
      </div>

      {/* KPI cards: Pay Rate · Bill Rate · Agency Fee */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <RateKpiCard
            label="Pay Rate"
            primary={payRatePrimary}
            primaryUnit={primaryUnit}
            secondary={payRateSecondary}
            secondaryUnit={secondaryUnit}
            currency={currency}
            usdPrimary={showUsdColumn ? toUsd(payRatePrimary) : undefined}
            usdSecondary={showUsdColumn ? toUsd(payRateSecondary) : undefined}
          />
        </Col>
        <Col xs={24} md={8}>
          <RateKpiCard
            label="Bill Rate"
            primary={billRatePrimary}
            primaryUnit={primaryUnit}
            secondary={billRateSecondary}
            secondaryUnit={secondaryUnit}
            currency={currency}
            usdPrimary={showUsdColumn ? toUsd(billRatePrimary) : undefined}
            usdSecondary={showUsdColumn ? toUsd(billRateSecondary) : undefined}
          />
        </Col>
        <Col xs={24} md={8}>
          <RateKpiCard
            label="Agency Fee"
            primary={agencyFeePrimary}
            primaryUnit={primaryUnit}
            secondary={agencyFeeSecondary}
            secondaryUnit={secondaryUnit}
            currency={currency}
            usdPrimary={showUsdColumn ? toUsd(agencyFeePrimary) : undefined}
            usdSecondary={showUsdColumn ? toUsd(agencyFeeSecondary) : undefined}
          />
        </Col>
      </Row>

      {/* Monthly Cost Breakdown */}
      <Card title="Monthly Cost Breakdown">
        <Space direction="vertical" size={SPACING.md} style={{ width: "100%" }}>
          <SubheadRow label="Included in Bill Rate" />
          <BreakdownRow
            label="Contractor Pay Rate"
            amount={quote.monthly_pay_rate}
            currency={currency}
            usdAmount={
              showUsdColumn ? toUsd(quote.monthly_pay_rate) : undefined
            }
          />
          <BreakdownRow
            label="Agency Fee (Markup)"
            caption={`${formatMoney(quote.monthly_pay_rate, currency)} × ${quote.markup_percentage.toFixed(2)}%`}
            amount={quote.monthly_agency_fee}
            currency={currency}
            usdAmount={
              showUsdColumn ? toUsd(quote.monthly_agency_fee) : undefined
            }
          />

          <SubheadRow label="Pass-Through Costs" />
          <BreakdownRow
            label="Platform Fee (Transaction)"
            caption={`${quote.transactions_per_month} × $55 USD = ${formatMoney(
              quote.transaction_cost,
              currency
            )}`}
            amount={quote.transaction_cost}
            currency={currency}
            usdAmount={
              showUsdColumn ? toUsd(quote.transaction_cost) : undefined
            }
          />
          {quote.msp_fee > 0 ? (
            <BreakdownRow
              label="MSP Fee"
              caption={`${quote.msp_percentage.toFixed(2)}% of monthly bill rate`}
              amount={quote.msp_fee}
              currency={currency}
              usdAmount={showUsdColumn ? toUsd(quote.msp_fee) : undefined}
            />
          ) : null}
          {quote.background_check_monthly_fee > 0 ? (
            <BreakdownRow
              label="Background Check Fee (Amortized)"
              amount={quote.background_check_monthly_fee}
              currency={currency}
              usdAmount={
                showUsdColumn
                  ? toUsd(quote.background_check_monthly_fee)
                  : undefined
              }
            />
          ) : null}
        </Space>
      </Card>

      {/* Monthly Bill Rate & Markup Summary */}
      <Card styles={{ body: { padding: 32 } }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={12}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: BRAND.textSecondary,
                marginBottom: 6,
              }}
            >
              Monthly Bill Rate
            </div>
            <div
              style={{
                ...TABULAR,
                fontSize: 32,
                fontWeight: 700,
                color: BRAND.text,
                lineHeight: 1.1,
              }}
            >
              {formatMoney(quote.monthly_bill_rate, currency)}
            </div>
            {showUsdColumn && fxLocalToUsd ? (
              <div
                style={{
                  ...TABULAR,
                  fontSize: 15,
                  fontWeight: 500,
                  color: BRAND.textSecondary,
                  marginTop: 4,
                }}
              >
                ≈ {formatUsd(toUsd(quote.monthly_bill_rate))} USD
              </div>
            ) : null}
          </Col>
          <Col xs={24} sm={12}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: BRAND.textSecondary,
                marginBottom: 6,
              }}
            >
              Monthly Markup
            </div>
            <div
              style={{
                ...TABULAR,
                fontSize: 32,
                fontWeight: 700,
                color: BRAND.primary,
                lineHeight: 1.1,
              }}
            >
              {formatMoney(quote.monthly_markup, currency)}
            </div>
            {showUsdColumn && quote.net_margin_usd !== null ? (
              <div
                style={{
                  ...TABULAR,
                  fontSize: 15,
                  fontWeight: 500,
                  color: BRAND.textSecondary,
                  marginTop: 4,
                }}
              >
                ≈ {formatUsd(quote.net_margin_usd)} USD
              </div>
            ) : null}
          </Col>
        </Row>
      </Card>

      {/* Total Client Cost footer — warm EOR highlight card */}
      <Card
        styles={{
          body: {
            padding: 32,
            background: BRAND.bgSubtle,
            borderRadius: 10,
          },
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: BRAND.textSecondary,
            }}
          >
            Total Client Cost / Month
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                ...TABULAR,
                fontSize: 32,
                fontWeight: 700,
                color: BRAND.text,
                lineHeight: 1.1,
              }}
            >
              {formatMoney(totalClientCost, currency)}
            </div>
            {showUsdColumn ? (
              <div
                style={{
                  ...TABULAR,
                  fontSize: 15,
                  fontWeight: 500,
                  color: BRAND.textSecondary,
                  marginTop: 4,
                }}
              >
                ≈ {formatUsd(toUsd(totalClientCost))} USD
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      {/* FX provenance — USD→local is always relevant when present (used for
          pass-through cost math); local→USD only matters when we actually
          display USD figures alongside local. */}
      {fxUsdToLocal || (showUsdColumn && fxLocalToUsd) ? (
        <Typography.Text
          type="secondary"
          style={{
            fontSize: 12,
            lineHeight: 1.6,
            display: "block",
            marginTop: -8,
          }}
        >
          {fxUsdToLocal ? (
            <span style={{ display: "block" }}>
              FX (USD → {fxUsdToLocal.target_currency}): 1{" "}
              {fxUsdToLocal.base_currency} = {fxUsdToLocal.rate.toFixed(6)}{" "}
              {fxUsdToLocal.target_currency} · {fxUsdToLocal.source} (fetched{" "}
              {formatFxTimestamp(fxUsdToLocal.fetched_at)})
            </span>
          ) : null}
          {showUsdColumn && fxLocalToUsd ? (
            <span style={{ display: "block" }}>
              FX ({fxLocalToUsd.base_currency} → USD): 1{" "}
              {fxLocalToUsd.base_currency} = {fxLocalToUsd.rate.toFixed(6)}{" "}
              {fxLocalToUsd.target_currency} · {fxLocalToUsd.source} (fetched{" "}
              {formatFxTimestamp(fxLocalToUsd.fetched_at)})
            </span>
          ) : null}
        </Typography.Text>
      ) : null}
    </Space>
  );
}

/** Single KPI card with a primary value, a secondary echo, and optional caption.
 *
 * When `usdPrimary` / `usdSecondary` are provided, they're rendered beneath the
 * local-currency values as muted USD echos. Pass `undefined` to suppress the
 * USD row entirely (used when the "Show in USD" toggle is off, FX is missing,
 * or the quote is already in USD).
 */
function RateKpiCard({
  label,
  primary,
  primaryUnit,
  secondary,
  secondaryUnit,
  currency,
  caption,
  usdPrimary,
  usdSecondary,
}: {
  label: string;
  primary: number;
  primaryUnit: string;
  secondary: number;
  secondaryUnit: string;
  currency: string;
  caption?: string;
  usdPrimary?: number;
  usdSecondary?: number;
}) {
  const showUsd = usdPrimary !== undefined;
  return (
    <Card size="small" styles={{ body: { padding: 20 } }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: BRAND.textMuted,
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          ...TABULAR,
          fontSize: 28,
          fontWeight: 600,
          color: BRAND.text,
          lineHeight: 1.1,
        }}
      >
        {formatMoney(primary, currency)}{" "}
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: BRAND.textSecondary,
          }}
        >
          {primaryUnit}
        </span>
      </div>
      {showUsd ? (
        <div
          style={{
            ...TABULAR,
            fontSize: 14,
            fontWeight: 500,
            color: BRAND.textSecondary,
            marginTop: 4,
          }}
        >
          {formatUsd(usdPrimary)} USD {primaryUnit}
        </div>
      ) : null}
      <div
        style={{
          ...TABULAR,
          fontSize: 14,
          color: BRAND.textSecondary,
          marginTop: 6,
        }}
      >
        {formatMoney(secondary, currency)} {secondaryUnit}
      </div>
      {showUsd && usdSecondary !== undefined ? (
        <div
          style={{
            ...TABULAR,
            fontSize: 13,
            color: BRAND.textMuted,
            marginTop: 2,
          }}
        >
          {formatUsd(usdSecondary)} USD {secondaryUnit}
        </div>
      ) : null}
      {caption ? (
        <div
          style={{
            fontSize: 12,
            color: BRAND.textMuted,
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          {caption}
        </div>
      ) : null}
    </Card>
  );
}

/** Section subheader used inside the Monthly Cost Breakdown card. */
function SubheadRow({ label }: { label: string }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: BRAND.textSecondary,
        marginTop: 4,
      }}
    >
      {label}
    </div>
  );
}

/** Single row inside the Monthly Cost Breakdown card. When `usdAmount` is
 *  provided, a muted USD echo is rendered below the local-currency amount. */
function BreakdownRow({
  label,
  caption,
  amount,
  currency,
  usdAmount,
}: {
  label: string;
  caption?: string;
  amount: number;
  currency: string;
  usdAmount?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 16px",
        background: BRAND.bgSubtle,
        borderRadius: 8,
      }}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, color: BRAND.text }}>
          {label}
        </div>
        {caption ? (
          <div
            style={{
              fontSize: 12,
              color: BRAND.textMuted,
              marginTop: 2,
            }}
          >
            {caption}
          </div>
        ) : null}
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            ...TABULAR,
            fontSize: 16,
            fontWeight: 600,
            color: BRAND.text,
          }}
        >
          {formatMoney(amount, currency)}
        </div>
        {usdAmount !== undefined ? (
          <div
            style={{
              ...TABULAR,
              fontSize: 13,
              fontWeight: 500,
              color: BRAND.textSecondary,
              marginTop: 2,
            }}
          >
            {formatUsd(usdAmount)} USD
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** USD equivalent line shown next to the Monthly Bill Rate when FX is present. */
function UsdEquivalent({
  amountLocal,
  fx,
}: {
  amountLocal: number;
  fx: FxSnapshot;
}) {
  return (
    <div style={{ textAlign: "right" }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: BRAND.textSecondary,
          marginBottom: 4,
        }}
      >
        USD
      </div>
      <div
        style={{
          ...TABULAR,
          fontSize: 20,
          fontWeight: 600,
          color: BRAND.textSecondary,
        }}
      >
        {formatUsd(amountLocal * fx.rate)}
      </div>
    </div>
  );
}

/** Single stat tile inside the Monthly Markup summary card. */
function MarkupStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: BRAND.textMuted,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          ...TABULAR,
          fontSize: 26,
          fontWeight: 600,
          color,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// Re-export the API quote type so other tasks (PDF export, downstream
// consumers) can import it from this module without depending on the hook.
export type { ContractorApiQuote };
