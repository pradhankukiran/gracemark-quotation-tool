"use client";

import { Space, Tag, Typography } from "antd";
import { BRAND, FLAG_SIZES } from "@/lib/theme";
import { CountryFlag } from "@/lib/twemoji";
import { ProviderLogo } from "@/components/ProviderLogo";

type CostBasis = "recurring_only" | "all_inclusive";

export interface ContextStripProps {
  countryCode: string;
  countryName: string;
  currency: string;
  annualSalary: number;
  costBasis: CostBasis;
  /** Count of "ok" providers participating in this reconciliation. */
  providerCount: number;
  /**
   * Optional Acid-Test-side extras. When supplied, the strip appends the
   * recommended provider's logo / display name and (when `isOverride`) an
   * "Override" tag. Reconciliation-page callers omit these and get the
   * original behavior unchanged.
   */
  recommendedProviderId?: string;
  recommendedProviderName?: string;
  isOverride?: boolean;
}

function formatCurrency(amount: number, currency: string): string {
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

/**
 * Slim horizontal info bar shown at the top of the reconciliation page.
 * Renders flag, country, currency, annual salary, provider count, and the
 * locked-in cost basis as middle-dot-separated pieces.
 */
export function ContextStrip({
  countryCode,
  countryName,
  currency,
  annualSalary,
  costBasis,
  providerCount,
  recommendedProviderId,
  recommendedProviderName,
  isOverride,
}: ContextStripProps) {
  const basisLabel = costBasis === "all_inclusive" ? "All-inclusive" : "Statutory";
  const hasRecommendedSlot =
    recommendedProviderId != null && recommendedProviderId.length > 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 0,
        padding: "12px 16px",
        background: BRAND.bgContainer,
        border: `1px solid ${BRAND.border}`,
        borderRadius: 10,
      }}
    >
      <Space size="middle" wrap split={<DotSeparator />}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <CountryFlag
            code={countryCode}
            width={FLAG_SIZES.md}
            height={FLAG_SIZES.md}
            alt={`${countryName} flag`}
            style={{ borderRadius: 3 }}
          />
          <Typography.Text strong style={{ fontSize: 16 }}>
            {countryName}
          </Typography.Text>
        </span>
        <Typography.Text style={{ color: BRAND.textSecondary }}>
          {currency}
        </Typography.Text>
        <Typography.Text style={{ color: BRAND.textSecondary }}>
          {formatCurrency(annualSalary, currency)}/yr
        </Typography.Text>
        <Typography.Text style={{ color: BRAND.textSecondary }}>
          {providerCount} provider{providerCount === 1 ? "" : "s"}
        </Typography.Text>
        <Tag
          color="green"
          style={{
            margin: 0,
            background: BRAND.primarySoft,
            color: BRAND.primary,
            borderColor: BRAND.primary,
            fontWeight: 600,
          }}
        >
          {basisLabel}
        </Tag>
        {hasRecommendedSlot ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ProviderLogo
              providerId={recommendedProviderId!}
              fallback={recommendedProviderName ?? recommendedProviderId!}
              height={20}
            />
            <Typography.Text style={{ color: BRAND.textSecondary }}>
              {recommendedProviderName ?? recommendedProviderId}
            </Typography.Text>
            {isOverride ? (
              <Tag
                style={{
                  margin: 0,
                  background: BRAND.primarySoft,
                  color: BRAND.primary,
                  borderColor: BRAND.primary,
                  fontWeight: 600,
                }}
              >
                Override
              </Tag>
            ) : null}
          </span>
        ) : null}
      </Space>
    </div>
  );
}

function DotSeparator() {
  return (
    <span aria-hidden style={{ color: BRAND.textMuted, fontSize: 16 }}>
      ·
    </span>
  );
}
