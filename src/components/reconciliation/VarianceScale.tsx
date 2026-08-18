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
    <Card title="Variance Band Analysis">
      <Typography.Paragraph
        type="secondary"
        style={{ marginTop: -4, marginBottom: 20, fontSize: 13 }}
      >
        Each provider&apos;s monthly cost relative to Deel&apos;s anchor. Providers within the &plusmn;4% band are eligible for recommendation.
      </Typography.Paragraph>

      {/* 3 KPI summary tiles: Lower Bound | Deel Anchor | Upper Bound */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24,
          padding: 16,
          background: BRAND.bgSubtle,
          borderRadius: 8,
          border: `1px solid ${BRAND.border}`,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: BRAND.textSecondary,
              marginBottom: 4,
            }}
          >
            Lower Bound (-4%)
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: BRAND.text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatCurrency(lowerBound, currency)}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: BRAND.textSecondary,
              marginBottom: 4,
            }}
          >
            Deel Anchor (0%)
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: BRAND.primary,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatCurrency(deelPrice, currency)}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: BRAND.textSecondary,
              marginBottom: 4,
            }}
          >
            Upper Bound (+4%)
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: BRAND.text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatCurrency(upperBound, currency)}
          </div>
        </div>
      </div>

      {/* Provider horizontal bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sorted.map((p, idx) => {
          const isDeel = p.provider === "deel";
          const isWinner = !!winnerProviderId && p.provider === winnerProviderId;
          const displayName = getProviderMeta(p.provider)?.display_name ?? p.provider;
          const barPct = Math.min(Math.max(pctOf(p.price), 5), 100);
          const barColor = isDeel
            ? "#475569"
            : p.inRange
              ? BRAND.primary
              : "#e11d48";

          return (
            <div key={p.provider}>
              {/* Header: Provider identity on left, monthly price on right */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ProviderLogo providerId={p.provider} fallback={displayName} height={18} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.text }}>
                    {displayName}
                  </span>
                  {isDeel ? (
                    <Tag style={{ background: BRAND.bgSubtle, color: BRAND.textSecondary, border: "none", fontSize: 11 }}>
                      ANCHOR
                    </Tag>
                  ) : null}
                  {isWinner ? (
                    <Tag
                      style={{ background: BRAND.primarySoft, color: BRAND.primary, border: "none", fontWeight: 600, fontSize: 11 }}
                      icon={<CrownOutlined />}
                    >
                      WINNER
                    </Tag>
                  ) : null}
                  {!isDeel && !p.inRange ? (
                    <Tag style={{ background: "#fef2f2", color: "#dc2626", border: "none", fontWeight: 500, fontSize: 11 }}>
                      OUT OF BAND
                    </Tag>
                  ) : null}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: BRAND.text,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatCurrency(p.price, currency)}
                </div>
              </div>

              {/* Bar track */}
              <div
                style={{
                  position: "relative",
                  height: 22,
                  background: BRAND.bgSubtle,
                  border: `1px solid ${BRAND.border}`,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                {/* ±4% band overlay on all rows */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${bandLeft}%`,
                    width: `${bandWidth}%`,
                    background: "rgba(4, 120, 87, 0.08)",
                    borderLeft: `1px dashed ${BRAND.primary}`,
                    borderRight: `1px dashed ${BRAND.primary}`,
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                />

                {/* Provider's fill bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: `${barPct}%`,
                    background: barColor,
                    borderRadius: "0 4px 4px 0",
                    transition: "width 200ms ease, background-color 200ms ease",
                    zIndex: 1,
                  }}
                />

                {/* Deel anchor baseline indicator */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: `${deelLeftPct}%`,
                    width: 2,
                    background: "#475569",
                    transform: "translateX(-1px)",
                    pointerEvents: "none",
                    zIndex: 3,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
