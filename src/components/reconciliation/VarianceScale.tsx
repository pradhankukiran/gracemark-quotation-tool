"use client";

import { useMemo } from "react";
import { Card, Space, Tag, Typography } from "antd";
import { CrownOutlined } from "@ant-design/icons";
import type { AnalyzedProvider } from "@/providers/_core/reconciliation";
import { BRAND, SPACING } from "@/lib/theme";
import { ProviderLogo } from "@/components/ProviderLogo";
import { getProviderMeta } from "@/providers/_meta";

export interface VarianceScaleProps {
  analyzed: AnalyzedProvider[];
  deelPrice: number;
  /** Lower bound as an absolute price (already deel * lower). */
  lowerBound: number;
  /** Upper bound as an absolute price (already deel * upper). */
  upperBound: number;
  currency: string;
  /** Algorithm's winning provider id; row gets a crown / WINNER tag. May be null. */
  winnerProviderId?: string | null;
}

// BRAND.primary is the canonical emerald-700 (#047857); primaryHover is the
// darker emerald-800 (#065f46) used as the in-range gradient's right-hand stop.
// 8-char hex alpha append for the ±4% band tint (~12% opacity). Safe because
// BRAND.primary is in 6-char hex form.
const BAND_FILL = `${BRAND.primary}1f`;
function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value).toLocaleString()} ${currency}`;
  }
}

/**
 * Per-provider horizontal bar chart, sorted ascending by price (cheapest on
 * top). Each row shows the provider's monthly cost as a bar inside a fixed-
 * height track, with Deel's price marked as a vertical baseline across every
 * non-Deel row and the ±4% eligible band drawn only on the first row. Axis
 * domain is `[min - 10% range, max + 10% range]` so the outer bars don't kiss
 * the track borders.
 */
export function VarianceScale({
  analyzed,
  deelPrice,
  lowerBound,
  upperBound,
  currency,
  winnerProviderId = null,
}: VarianceScaleProps) {
  const sorted = useMemo(
    () => [...analyzed].sort((a, b) => a.price - b.price),
    [analyzed]
  );

  const { axisMin, axisMax } = useMemo(() => {
    const allPrices = analyzed.map((a) => a.price).concat([lowerBound, upperBound]);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const rawRange = max - min;
    const range = rawRange === 0 ? max * 0.01 || 1 : rawRange;
    const padding = range * 0.1;
    return { axisMin: min - padding, axisMax: max + padding };
  }, [analyzed, lowerBound, upperBound]);

  const pctOf = (price: number): number => {
    const denom = axisMax - axisMin;
    if (denom <= 0) return 50;
    return ((price - axisMin) / denom) * 100;
  };

  const bandLeft = pctOf(lowerBound);
  const bandWidth = pctOf(upperBound) - bandLeft;
  const deelLeftPct = pctOf(deelPrice);

  return (
    <Card title="Variance Band">
      <Typography.Text type="secondary">
        Each provider&apos;s monthly cost relative to Deel&apos;s anchor. The ±4% band marks the eligible range.
      </Typography.Text>
      <div style={{ height: SPACING.md }} />
      <div>
        {sorted.map((p, idx) => {
          const isDeel = p.provider === "deel";
          const isWinner = !!winnerProviderId && p.provider === winnerProviderId;
          const displayName = getProviderMeta(p.provider)?.display_name ?? p.provider;
          const barPct = pctOf(p.price);
          const gradient = isDeel
            ? `linear-gradient(to right, ${BRAND.chart.deelAnchor}, ${BRAND.chart.deelAnchorDark})`
            : p.inRange
              ? `linear-gradient(to right, ${BRAND.chart.inRangeLight}, ${BRAND.primary})`
              : `linear-gradient(to right, ${BRAND.chart.outClay}, ${BRAND.chart.outClayDark})`;
          const isLast = idx === sorted.length - 1;

          return (
            <div key={p.provider} style={{ marginBottom: isLast ? 0 : SPACING.lg }}>
              {/* Header: identity left, price right. */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm }}>
                <Space size="small">
                  <ProviderLogo providerId={p.provider} fallback={displayName} height={22} />
                  {isDeel ? (
                    <Tag style={{ background: BRAND.bgSubtle, color: BRAND.textSecondary }}>ANCHOR</Tag>
                  ) : null}
                  {isWinner ? (
                    <Tag style={{ background: BRAND.primarySoft, color: BRAND.primary, borderColor: BRAND.primary }} icon={<CrownOutlined />}>WINNER</Tag>
                  ) : null}
                  {!isDeel && !p.inRange ? (
                    // Warm clay matches the out-of-range bar fill — keeps the
                    // tag in the same color family as its bar instead of using
                    // antd's saturated "red" preset.
                    <Tag style={{ background: BRAND.dangerSoft, color: BRAND.danger }}>OUT OF BAND</Tag>
                  ) : null}
                </Space>
                <Typography.Text strong>{formatCurrency(p.price, currency)}</Typography.Text>
              </div>

              {/* Bar track. */}
              <div style={{ position: "relative", height: 32, background: BRAND.bgSubtle, border: `1px solid ${BRAND.border}`, borderRadius: 10, overflow: "hidden" }}>
                {/* ±4% band overlay — only on the first (cheapest) row. */}
                {idx === 0 ? (
                  <div
                    style={{
                      position: "absolute", top: 0, bottom: 0,
                      left: `${bandLeft}%`, width: `${bandWidth}%`,
                      background: BAND_FILL,
                      borderLeft: `2px dashed ${BRAND.primary}`,
                      borderRight: `2px dashed ${BRAND.primary}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <span style={{ fontSize: 11, letterSpacing: "0.08em", color: BRAND.primary, fontWeight: 600 }}>
                      ±4%
                    </span>
                  </div>
                ) : null}

                {/* Provider's bar. */}
                <div
                  style={{
                    position: "absolute", top: 0, bottom: 0, left: 0,
                    width: `${barPct}%`, background: gradient,
                    borderTopRightRadius: 10, borderBottomRightRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8,
                    transition: "width 200ms ease, background 200ms ease",
                  }}
                >
                  {barPct > 25 ? (
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(p.price, currency)}
                    </span>
                  ) : null}
                </div>

                {/* Deel baseline marker — only on non-Deel rows. 2px-wide vertical
                    line with diamond caps top and bottom. Uses the same muted
                    teal as the Deel anchor bar so the relationship is obvious. */}
                {!isDeel ? (
                  <div
                    style={{
                      position: "absolute", top: 0, bottom: 0,
                      left: `${deelLeftPct}%`, width: 2,
                      background: BRAND.chart.deelAnchor,
                      transform: "translateX(-1px)",
                      pointerEvents: "none",
                    }}
                  >
                    <div style={{ position: "absolute", top: -3, left: -2, width: 6, height: 6, background: BRAND.chart.deelAnchor, transform: "rotate(45deg)" }} />
                    <div style={{ position: "absolute", bottom: -3, left: -2, width: 6, height: 6, background: BRAND.chart.deelAnchor, transform: "rotate(45deg)" }} />
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
