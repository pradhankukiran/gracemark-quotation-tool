"use client";

import { Card, Col, Row } from "antd";
import { BRAND } from "@/lib/theme";
import { UsdSkeleton } from "@/components/UsdSkeleton";

const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

/**
 * Markup-fee profit-tier palette. Local to this component (not promoted to
 * `BRAND.chart`) per the build brief — the tokens are only meaningful in the
 * context of the Acid Test markup tile and aren't expected to be reused.
 */
const PROFIT_TIER_COLORS = {
  pass: BRAND.primary,
  near900: "#65a30d",   // lime-600
  near800: "#d97706",   // amber-600
  near600: "#ea580c",   // orange-600
  fail: BRAND.danger,
} as const;

/**
 * Pick a markup-fee tile color tier from the USD profit value. When FX is
 * unavailable (`profitUsd == null`) we fall back to the neutral text color
 * so the tile is still readable.
 */
function tierColorFor(profitUsd: number | null | undefined): string {
  if (profitUsd == null) return BRAND.text;
  if (profitUsd >= 1000) return PROFIT_TIER_COLORS.pass;
  if (profitUsd >= 900) return PROFIT_TIER_COLORS.near900;
  if (profitUsd >= 800) return PROFIT_TIER_COLORS.near800;
  if (profitUsd >= 600) return PROFIT_TIER_COLORS.near600;
  return PROFIT_TIER_COLORS.fail;
}

export interface KpiTilesProps {
  currency: string;
  /** FX rate; null while loading; undefined when permanently unavailable. */
  fxRate: number | null | undefined;
  fxLoading: boolean;

  /** Tile 1: Total Assignment Costs, including provider and one-time costs. */
  totalAssignmentCosts: number;
  /** Tile 2: Complete monthly employer cost plus provider fee. */
  totalMonthlyCost: number;
  /** Tile 3: Bill Rate All-In (billRate × duration + onboardingTotal). */
  billRateAllIn: number;
  /** Tile 4: Monthly Bill Rate (input echo). */
  monthlyBillRate: number;
  /** Tile 5: Total Profit (profitLocal). */
  totalProfit: number;
  /** Tile 6: Monthly Markup Fee (actualGracemarkFeeMonthly). */
  monthlyMarkupFee: number;

  /** USD-converted profit driving the markup-fee tier color. */
  profitUsd: number | null;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString()} ${currency}`;
  }
}

function formatUsd(amount: number): string {
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

interface TileProps {
  label: string;
  amount: number;
  currency: string;
  fxRate: number | null | undefined;
  fxLoading: boolean;
  /** Optional color override for the big number (used by the Markup Fee tile). */
  numberColor?: string;
}

function Tile({
  label,
  amount,
  currency,
  fxRate,
  fxLoading,
  numberColor,
}: TileProps) {
  const showUsd = fxRate !== undefined;
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
          fontSize: 30,
          fontWeight: 600,
          color: numberColor ?? BRAND.text,
          lineHeight: 1.1,
        }}
      >
        {formatCurrency(amount, currency)}
      </div>
      {showUsd ? (
        <div
          style={{
            ...TABULAR,
            fontSize: 14,
            color: BRAND.textSecondary,
            marginTop: 6,
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
    </Card>
  );
}

/**
 * 2×3 grid of KPI tiles (single column on xs, 2-column on sm, 3-column on lg).
 * The Monthly Markup Fee tile carries a profit-tier color derived from
 * `profitUsd`.
 */
export function KpiTiles({
  currency,
  fxRate,
  fxLoading,
  totalAssignmentCosts,
  totalMonthlyCost,
  billRateAllIn,
  monthlyBillRate,
  totalProfit,
  monthlyMarkupFee,
  profitUsd,
}: KpiTilesProps) {
  const markupTierColor = tierColorFor(profitUsd);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={8}>
        <Tile
          label="Total Assignment Costs"
          amount={totalAssignmentCosts}
          currency={currency}
          fxRate={fxRate}
          fxLoading={fxLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Tile
          label="Total Monthly Cost"
          amount={totalMonthlyCost}
          currency={currency}
          fxRate={fxRate}
          fxLoading={fxLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Tile
          label="Bill Rate All-In"
          amount={billRateAllIn}
          currency={currency}
          fxRate={fxRate}
          fxLoading={fxLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Tile
          label="Monthly Bill Rate"
          amount={monthlyBillRate}
          currency={currency}
          fxRate={fxRate}
          fxLoading={fxLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Tile
          label="Total Profit"
          amount={totalProfit}
          currency={currency}
          fxRate={fxRate}
          fxLoading={fxLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Tile
          label="Monthly Markup Fee"
          amount={monthlyMarkupFee}
          currency={currency}
          fxRate={fxRate}
          fxLoading={fxLoading}
          numberColor={markupTierColor}
        />
      </Col>
    </Row>
  );
}
