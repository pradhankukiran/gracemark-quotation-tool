"use client";

import { useRouter } from "next/navigation";
import { Button, Card, Tag, Typography } from "antd";
import { ArrowRightOutlined, EditOutlined } from "@ant-design/icons";
import { BRAND } from "@/lib/theme";
import { ProviderLogo } from "@/components/ProviderLogo";

type CostBasis = "recurring_only" | "all_inclusive";

export interface RecommendedProviderCardProps {
  providerId: string;
  providerDisplayName: string;
  monthlyTotal: number;
  currency: string;
  deelPrice: number;
  isOverride: boolean;
  /** Used in the reasoning blurb. */
  costBasis: CostBasis;
  /** When set, replaces the card content with a styled empty state. */
  empty?: { reason: "no_in_band" | "deel_missing" };
  /** Quote id — used by the deel_missing back button. */
  quoteId?: string;
  /** Opens the override modal. Only rendered on the happy-path card. */
  onOverride?: () => void;
  /** Advances to the Acid Test step. Required to enable the CTA. */
  onAcidTest?: () => void;
  /**
   * ISO timestamp of the most recent Acid Test computation for this quote, if
   * any. When present, the card surfaces a small "✓ Acid Test computed" badge
   * with relative time so the user knows downstream work is still in scope.
   */
  acidTestComputedAt?: string;
}

/**
 * Tiny relative-time formatter for the "✓ Acid Test computed" badge. Uses
 * `Intl.RelativeTimeFormat` when available; falls back to a coarse English
 * string otherwise. We keep this local because it's the only place this is
 * needed, and the shape of the output is opinionated for the badge.
 */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "recently";
  const diffMs = Date.now() - then;
  // Future timestamps clamp to "just now" — clock skew shouldn't read as weird.
  const diffSec = Math.max(0, Math.round(diffMs / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) {
    try {
      return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
        -diffMin,
        "minute",
      );
    } catch {
      return `${diffMin}m ago`;
    }
  }
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) {
    try {
      return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
        -diffHr,
        "hour",
      );
    } catch {
      return `${diffHr}h ago`;
    }
  }
  const diffDay = Math.round(diffHr / 24);
  try {
    return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
      -diffDay,
      "day",
    );
  } catch {
    return `${diffDay}d ago`;
  }
}

function formatMoneyWhole(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString()} ${currency}`;
  }
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

function formatSignedPct(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : rounded < 0 ? "-" : "";
  return `${sign}${Math.abs(rounded).toFixed(1)}%`;
}

/**
 * Thin emerald-to-transparent accent bar that sits at the very top of the
 * hero card body. Replaces the previous 4px left-border accent — same "this
 * is special" cue, more integrated with the warm cream surface.
 */
function AccentBar() {
  return (
    <div
      style={{
        height: 3,
        marginInline: -32,
        marginTop: -32,
        marginBottom: 24,
        background: `linear-gradient(90deg, ${BRAND.primary} 0%, transparent 100%)`,
        borderRadius: "12px 12px 0 0",
      }}
    />
  );
}

/**
 * The hero card on the reconciliation page. Renders one of three states:
 *   1. A recommendation (algorithm winner or user override) — logo tile +
 *      provider name + big monthly total + one-line reasoning blurb.
 *   2. Empty `no_in_band` — same card shell, neutral tag, no CTA.
 *   3. Empty `deel_missing` — same card shell, warm warning tag, Back-to-Quote.
 */
export function RecommendedProviderCard({
  providerId,
  providerDisplayName,
  monthlyTotal,
  currency,
  deelPrice,
  isOverride,
  costBasis,
  empty,
  quoteId,
  onOverride,
  onAcidTest,
  acidTestComputedAt,
}: RecommendedProviderCardProps) {
  const router = useRouter();

  if (empty?.reason === "deel_missing") {
    return (
      <Card styles={{ body: { padding: 32 } }}>
        <AccentBar />
        <Tag
          style={{
            background: "#fef3c7",
            color: "#92400e",
            borderColor: "#fef3c7",
            marginBottom: 16,
          }}
        >
          Deel Unavailable
        </Tag>
        <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
          Reconciliation requires Deel
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          Reconciliation uses Deel as the anchor. Deel returned no data for
          this country. Refresh the quote or pick a provider manually below.
        </Typography.Text>
        {quoteId ? (
          <div style={{ marginTop: 24 }}>
            <Button
              type="default"
              onClick={() => router.push(`/eor/quote/${quoteId}`)}
            >
              Back to Quote
            </Button>
          </div>
        ) : null}
      </Card>
    );
  }

  if (empty?.reason === "no_in_band") {
    return (
      <Card styles={{ body: { padding: 32 } }}>
        <AccentBar />
        <Tag
          style={{
            background: BRAND.bgSubtle,
            color: BRAND.textSecondary,
            borderColor: BRAND.bgSubtle,
            marginBottom: 16,
          }}
        >
          No Recommendation
        </Tag>
        <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 8 }}>
          No providers within &plusmn;4% of Deel
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          All providers fell outside Deel&rsquo;s variance band. Review the
          comparison below to make a manual selection.
        </Typography.Text>
      </Card>
    );
  }

  const isDeel = providerId === "deel";
  const variancePct = ((monthlyTotal - deelPrice) / deelPrice) * 100;
  const basisLabel = costBasis === "all_inclusive" ? "All-inclusive" : "Statutory";

  const reasonLine = isDeel
    ? `Deel is the anchor — no provider beats it within the ±4% band. Cost basis: ${basisLabel}.`
    : `${formatSignedPct(variancePct)} vs Deel (${formatMoney(deelPrice, currency)}) · Cost basis: ${basisLabel}`;

  return (
    <Card styles={{ body: { padding: 32 } }}>
      <AccentBar />
      {isOverride ? (
        <Tag
          style={{
            background: BRAND.primarySoft,
            color: BRAND.primary,
            border: "none",
            marginBottom: 16,
          }}
        >
          Your pick (override)
        </Tag>
      ) : (
        <Tag
          style={{
            background: BRAND.primarySoft,
            color: BRAND.primary,
            border: "none",
            marginBottom: 16,
          }}
        >
          Recommended
        </Tag>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            padding: 16,
            background: "#fff",
            border: `1px solid ${BRAND.border}`,
            borderRadius: 12,
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ProviderLogo
            providerId={providerId}
            fallback={providerDisplayName}
            height={64}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: BRAND.text,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {formatMoneyWhole(monthlyTotal, currency)}
            </span>
            <span
              style={{
                fontSize: 14,
                color: BRAND.textSecondary,
                marginBottom: 4,
              }}
            >
              /month
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {reasonLine}
            </Typography.Text>
          </div>
          {acidTestComputedAt ? (
            <div style={{ marginTop: 12 }}>
              <Tag
                style={{
                  background: BRAND.primarySoft,
                  color: BRAND.primary,
                  borderColor: BRAND.primary,
                  fontSize: 12,
                  borderRadius: 999,
                  paddingInline: 10,
                }}
              >
                {`✓ Acid Test computed · ${relativeTime(acidTestComputedAt)}`}
              </Tag>
            </div>
          ) : null}
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 260,
            maxWidth: 260,
          }}
        >
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={onOverride}
            block
          >
            {isOverride ? "Change Override" : "Override Recommendation"}
          </Button>
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={onAcidTest}
            block
          >
            Continue to Acid Test
          </Button>
        </div>
      </div>
    </Card>
  );
}
