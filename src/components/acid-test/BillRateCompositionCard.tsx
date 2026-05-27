"use client";

import { Card, Col, Row, Typography } from "antd";
import type { FxSnapshot } from "@/providers/_core/types";
import { BRAND } from "@/lib/theme";
import { UsdSkeleton } from "@/components/UsdSkeleton";

const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

// Deterministic UTC format so SSR and CSR render identical strings — matches
// the formatting used in `ProviderQuoteCard`.
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

export interface BillRateCompositionCardProps {
  /** Recurring monthly cost from the kernel (local currency). */
  recurringMonthly: number;
  /** Target Gracemark fee in local currency (kernel's `targetGracemarkFeeMonthly`). */
  targetGracemarkFee: number;
  /** Expected bill rate (kernel's `expectedBillRate`). */
  expectedBillRate: number;
  /** Actual Gracemark fee in local currency (kernel's `gracemarkFeeMonthly`). */
  actualGracemarkFee: number;
  currency: string;
  /** FX rate; null when loading; undefined when permanently unavailable. */
  fxRate: number | null | undefined;
  fxLoading: boolean;
  /** FX snapshot for the provenance footer line. Null when no USD column. */
  fxSnapshot: FxSnapshot | null;
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

function formatUsd(amount: number): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

interface StatRowProps {
  label: string;
  amount: number;
  currency: string;
  fxRate: number | null | undefined;
  fxLoading: boolean;
}

function StatRow({ label, amount, currency, fxRate, fxLoading }: StatRowProps) {
  const showUsd = fxRate !== undefined;
  return (
    <Col xs={24} sm={12} lg={6}>
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: BRAND.textMuted,
            marginBottom: 6,
          }}
        >
          {label}
        </div>
        <div
          style={{
            ...TABULAR,
            fontSize: 22,
            fontWeight: 600,
            color: BRAND.text,
            lineHeight: 1.2,
          }}
        >
          {formatCurrency(amount, currency)}
        </div>
        {showUsd ? (
          <div
            style={{
              ...TABULAR,
              fontSize: 13,
              color: BRAND.textSecondary,
              marginTop: 4,
            }}
          >
            {fxLoading ? (
              <UsdSkeleton />
            ) : fxRate == null ? (
              <span style={{ color: BRAND.textMuted }}>—</span>
            ) : (
              formatUsd(amount * fxRate)
            )}
          </div>
        ) : null}
      </div>
    </Col>
  );
}

/**
 * Bill-rate composition stat card. Renders Recurring Monthly, Target Gracemark
 * Fee, Expected Bill Rate, and Actual Gracemark Fee — all in local currency
 * (with USD column when FX is available) and tabular-nums. FX provenance
 * footer matches the format used in `ProviderQuoteCard`.
 */
export function BillRateCompositionCard({
  recurringMonthly,
  targetGracemarkFee,
  expectedBillRate,
  actualGracemarkFee,
  currency,
  fxRate,
  fxLoading,
  fxSnapshot,
}: BillRateCompositionCardProps) {
  return (
    <Card title="Bill Rate Composition">
      <Row gutter={[24, 24]}>
        <StatRow
          label="Recurring Monthly"
          amount={recurringMonthly}
          currency={currency}
          fxRate={fxRate}
          fxLoading={fxLoading}
        />
        <StatRow
          label="Target Gracemark Fee"
          amount={targetGracemarkFee}
          currency={currency}
          fxRate={fxRate}
          fxLoading={fxLoading}
        />
        <StatRow
          label="Expected Bill Rate"
          amount={expectedBillRate}
          currency={currency}
          fxRate={fxRate}
          fxLoading={fxLoading}
        />
        <StatRow
          label="Actual Gracemark Fee"
          amount={actualGracemarkFee}
          currency={currency}
          fxRate={fxRate}
          fxLoading={fxLoading}
        />
      </Row>
      {fxSnapshot ? (
        <Typography.Text
          type="secondary"
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            display: "block",
            marginTop: 24,
          }}
        >
          FX: 1 {fxSnapshot.base_currency} = {fxSnapshot.rate.toFixed(6)}{" "}
          {fxSnapshot.target_currency} · {fxSnapshot.source} · fetched{" "}
          {formatFxTimestamp(fxSnapshot.fetched_at)}
        </Typography.Text>
      ) : null}
    </Card>
  );
}
