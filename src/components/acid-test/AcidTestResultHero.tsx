"use client";

import { Card, Tag, Typography } from "antd";
import { BRAND } from "@/lib/theme";

/**
 * Pass/Warning/Fail tier — drives the accent bar color, tag color, and
 * headline copy on the Acid Test hero card.
 */
export type AcidTestTier = "pass" | "warning" | "fail";

const TIER_COLORS: Record<AcidTestTier, { bar: string; tag: string; tagBg: string }> = {
  pass: {
    bar: BRAND.primary,
    tag: BRAND.primary,
    tagBg: BRAND.primarySoft,
  },
  warning: {
    bar: "#d97706", // amber-600
    tag: "#92400e", // amber-800 (legible on warm bg)
    tagBg: "#fef3c7", // amber-100
  },
  fail: {
    bar: BRAND.danger,
    tag: BRAND.danger,
    tagBg: BRAND.dangerSoft,
  },
};

const TIER_LABELS: Record<AcidTestTier, string> = {
  pass: "Pass",
  warning: "Warning",
  fail: "Fail",
};

export interface AcidTestResultHeroProps {
  tier: AcidTestTier;
  headline: string;
  /** Optional second line (e.g. shortfall note). */
  subline?: string | null;
}

/**
 * Top-of-page Acid Test verdict hero. Slim accent bar + big status tag + a
 * 32px headline + optional subline. Caller is responsible for picking the
 * tier and headline based on profit vs the USD minimum threshold and FX
 * availability — this is a presentational component only.
 */
export function AcidTestResultHero({
  tier,
  headline,
  subline,
}: AcidTestResultHeroProps) {
  const colors = TIER_COLORS[tier];
  return (
    <Card styles={{ body: { padding: 32 } }}>
      <div
        style={{
          height: 3,
          marginInline: -32,
          marginTop: -32,
          marginBottom: 24,
          background: `linear-gradient(90deg, ${colors.bar} 0%, transparent 100%)`,
          borderRadius: "12px 12px 0 0",
        }}
      />
      <Tag
        style={{
          background: colors.tagBg,
          color: colors.tag,
          borderColor: colors.tagBg,
          fontSize: 13,
          padding: "3px 12px",
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {TIER_LABELS[tier]}
      </Tag>
      <Typography.Title
        level={3}
        style={{
          margin: 0,
          fontSize: 26,
          fontWeight: 700,
          color: BRAND.text,
          letterSpacing: "-0.01em",
        }}
      >
        {headline}
      </Typography.Title>
      {subline ? (
        <Typography.Paragraph
          style={{
            margin: 0,
            marginTop: 6,
            fontSize: 14,
            color: BRAND.textSecondary,
          }}
        >
          {subline}
        </Typography.Paragraph>
      ) : null}
    </Card>
  );
}
