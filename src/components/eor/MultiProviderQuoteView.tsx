"use client";

import { useMemo, useState } from "react";
import { Button, Space, Tabs, Tag, Typography } from "antd";
import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import { BRAND } from "@/lib/theme";
import type {
  CountryQuoteBlock,
  MultiProviderQuote,
  ProviderOutcome,
  ProviderQuoteResult,
} from "@/providers/_core/types";
import { ProviderQuoteCard } from "@/components/eor/ProviderQuoteCard";
import { ProviderLogo } from "@/components/ProviderLogo";
import type { FxGetter } from "@/app/eor/quote/[id]/page";
import type { EorFormSnapshot, EorQuoteType } from "@/lib/quote-state";

interface MultiProviderQuoteViewProps {
  result: MultiProviderQuote;
  onRetry?: () => void;
  getFxForCurrency: FxGetter;
  form: EorFormSnapshot;
  quoteType: EorQuoteType;
  onQuoteTypeChange: (next: EorQuoteType) => void;
}

const outcomeBadge: Record<
  ProviderOutcome,
  { label: string; color: string } | null
> = {
  loading: null,
  ok: null,
  unsupported: { label: "Not supported", color: "default" },
  invalid_input: { label: "Invalid", color: "warning" },
  error: { label: "Error", color: "error" },
};

/**
 * Aggregate outcome for the tab label when a provider exists across multiple
 * countries. Precedence:
 *   1. "ok" if ANY country succeeded
 *   2. "loading" if ANY country is still in-flight (so the spinner stays
 *      visible until the whole tab has settled)
 *   3. otherwise the first non-ok outcome
 */
function aggregateOutcome(
  results: ProviderQuoteResult[]
): ProviderOutcome {
  if (results.some((r) => r.outcome === "ok")) return "ok";
  if (results.some((r) => r.outcome === "loading")) return "loading";
  return results[0]?.outcome ?? "error";
}

function tabLabel(
  providerId: string,
  displayName: string,
  outcome: ProviderOutcome
) {
  const badge = outcomeBadge[outcome];
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <ProviderLogo
        providerId={providerId}
        fallback={displayName}
        height={20}
      />
      {outcome === "loading" ? (
        <LoadingOutlined style={{ fontSize: 14, color: BRAND.primary }} spin />
      ) : badge ? (
        <Tag color={badge.color}>{badge.label}</Tag>
      ) : null}
    </span>
  );
}

interface ProviderTab {
  providerId: string;
  displayName: string;
  outcome: ProviderOutcome;
  perCountry: Array<{
    block: CountryQuoteBlock;
    result: ProviderQuoteResult;
  }>;
}

/**
 * Pivot the country-first shape (countries → each with a results[] per provider)
 * into a provider-first shape (each provider → results across countries) for
 * tabbing. Provider order is taken from the FIRST country block; all blocks
 * are expected to have the same provider order per the API contract.
 */
function buildProviderTabs(countries: CountryQuoteBlock[]): ProviderTab[] {
  if (countries.length === 0) return [];
  const first = countries[0];
  return first.results.map((firstResult, providerIdx) => {
    const perCountry = countries.map((block) => {
      // Prefer index alignment (the API guarantees same provider order across
      // country blocks); fall back to provider_id lookup defensively.
      const byIdx = block.results[providerIdx];
      const result =
        byIdx && byIdx.provider_id === firstResult.provider_id
          ? byIdx
          : block.results.find(
              (r) => r.provider_id === firstResult.provider_id
            ) ?? byIdx;
      return { block, result };
    });
    return {
      providerId: firstResult.provider_id,
      displayName: firstResult.display_name,
      outcome: aggregateOutcome(perCountry.map((p) => p.result)),
      perCountry,
    };
  });
}

export function MultiProviderQuoteView({
  result,
  onRetry,
  getFxForCurrency,
  form,
  quoteType,
  onQuoteTypeChange,
}: MultiProviderQuoteViewProps) {
  const providerTabs = useMemo(
    () => buildProviderTabs(result.countries),
    [result.countries]
  );

  // Global "all failed" — true only when NO country block has any ok result
  // AND no provider is still in-flight (otherwise we'd flash the all-failed
  // empty state while the first results are still landing).
  const anyOkAnywhere = result.countries.some((c) =>
    c.results.some((r) => r.outcome === "ok")
  );
  const anyLoadingAnywhere = result.countries.some((c) =>
    c.results.some((r) => r.outcome === "loading")
  );
  const hasAnyResults = result.countries.some((c) => c.results.length > 0);
  const allFailed = hasAnyResults && !anyOkAnywhere && !anyLoadingAnywhere;

  // Shared view state across all provider tabs — switching to Annual in one
  // tab keeps it Annual when the user moves to another provider.
  const [view, setView] = useState<"monthly" | "annual">("monthly");

  // Default tab: first provider where AT LEAST ONE country succeeded;
  // otherwise the first one still loading (so the user lands on a tab that
  // might still resolve); otherwise the first provider so something is
  // visible.
  const defaultActiveKey =
    providerTabs.find((t) => t.outcome === "ok")?.providerId ??
    providerTabs.find((t) => t.outcome === "loading")?.providerId ??
    providerTabs[0]?.providerId;

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {allFailed ? (
        <div
          style={{
            textAlign: "center",
            padding: "32px 16px",
            background: "white",
            borderRadius: 8,
          }}
        >
          <img
            src="/illustration-providers-failed.svg"
            alt=""
            width={128}
            height={128}
            style={{ marginBottom: 24, display: "inline-block" }}
          />
          <Typography.Title level={4} style={{ marginBottom: 8 }}>
            Couldn&apos;t generate quote
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            style={{ maxWidth: 520, margin: "0 auto 24px" }}
          >
            None of the configured EOR providers could compute a quote for
            these inputs. This usually means the country, currency, or salary
            combination isn&apos;t supported. Try editing the inputs, or retry
            to refetch.
          </Typography.Paragraph>
          {onRetry ? (
            <Button icon={<ReloadOutlined />} onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}
      <Tabs
        defaultActiveKey={defaultActiveKey}
        size="large"
        centered
        items={providerTabs.map((t) => {
          const countryBlocks = t.perCountry.map(({ block, result }, idx) => {
            const currency = block.request.currency;
            const fx = getFxForCurrency(currency);
            // Country index aligns with form slots: 0 → primary, 1 → comparison.
            // (See eorSnapshotToRequestMulti — the request mirrors that order.)
            const countryRole: "primary" | "comparison" =
              idx === 0 ? "primary" : "comparison";
            const slot =
              countryRole === "primary" ? form.primary : form.comparison;
            const localOffice = slot?.local_office ?? null;
            return {
              countryCode: block.request.country_code,
              currency,
              result,
              fxSnapshot: fx.snapshot,
              fxLoading: fx.loading,
              fxError: fx.error,
              countryRole,
              localOffice,
              stateCode: slot?.state ?? null,
              annualSalary: slot?.annual_salary ?? null,
              workHoursPerWeek: form.work_hours_per_week ?? null,
            };
          });
          return {
            key: t.providerId,
            label: tabLabel(t.providerId, t.displayName, t.outcome),
            children: (
              <ProviderQuoteCard
                providerId={t.providerId}
                displayName={t.displayName}
                countryBlocks={countryBlocks}
                view={view}
                onViewChange={setView}
                quoteType={quoteType}
                onQuoteTypeChange={onQuoteTypeChange}
              />
            ),
          };
        })}
      />
    </Space>
  );
}

