"use client";

import { useMemo } from "react";
import { Card, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { AnalyzedProvider } from "@/providers/_core/reconciliation";
import { getProviderMeta } from "@/providers/_meta";
import { ProviderLogo } from "@/components/ProviderLogo";
import { BRAND } from "@/lib/theme";

export interface ProviderComparisonTableProps {
  analyzed: AnalyzedProvider[];
  deelPrice: number;
  currency: string;
  /** Current selection — the algorithmic winner OR an override. May be null when no winner exists. */
  selectedProviderId: string | null;
  /** Algorithm's winner provider id (so we can mark "Recommended" even when there's an override). */
  algorithmicWinnerId: string | null;
}

interface TableRow {
  key: string;
  providerId: string;
  displayName: string;
  monthlyTotal: number;
  inRange: boolean;
  /** Cached status descriptor for the Status column tag. */
  statusKind: "anchor" | "recommended" | "your_pick" | "in_band" | "out_of_band";
  /** Whether this row IS the current selection (drives row highlight). */
  isCurrentSelection: boolean;
}

function formatMoney(amount: number, currency: string): string {
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

function formatSignedPct(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : rounded < 0 ? "" : "";
  return `${sign}${rounded.toFixed(1)}%`;
}

/**
 * Informational comparison table of every analyzed provider. After the
 * override UX moved to an explicit modal triggered from the Recommended
 * card, this table no longer accepts clicks or surfaces a popconfirm — it
 * just shows the prices, deltas, and status pills, with a subtle highlight
 * on the currently-selected row.
 */
export function ProviderComparisonTable({
  analyzed,
  deelPrice,
  currency,
  selectedProviderId,
  algorithmicWinnerId,
}: ProviderComparisonTableProps) {
  const rows = useMemo<TableRow[]>(() => {
    // Sort by price ascending to match the VarianceScale chart above it.
    const sorted = [...analyzed].sort((a, b) => a.price - b.price);
    const overrideActive =
      selectedProviderId != null &&
      algorithmicWinnerId != null &&
      selectedProviderId !== algorithmicWinnerId;
    return sorted.map<TableRow>((p) => {
      const meta = getProviderMeta(p.provider);
      const displayName = meta?.display_name ?? p.provider;
      const isDeel = p.provider === "deel";
      const isCurrentSelection = selectedProviderId === p.provider;
      const isAlgorithmWinner = algorithmicWinnerId === p.provider;

      let statusKind: TableRow["statusKind"];
      if (isDeel) {
        statusKind = "anchor";
      } else if (overrideActive && isCurrentSelection) {
        statusKind = "your_pick";
      } else if (isAlgorithmWinner && !overrideActive) {
        statusKind = "recommended";
      } else if (p.inRange) {
        statusKind = "in_band";
      } else {
        statusKind = "out_of_band";
      }

      return {
        key: p.provider,
        providerId: p.provider,
        displayName,
        monthlyTotal: p.price,
        inRange: p.inRange,
        statusKind,
        isCurrentSelection,
      };
    });
  }, [analyzed, selectedProviderId, algorithmicWinnerId]);

  const columns: ColumnsType<TableRow> = [
    {
      title: "Provider",
      dataIndex: "displayName",
      key: "provider",
      render: (_: unknown, row) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <ProviderLogo
            providerId={row.providerId}
            fallback={row.displayName}
            height={20}
          />
        </div>
      ),
    },
    {
      title: "Monthly Total",
      dataIndex: "monthlyTotal",
      key: "monthly",
      align: "right",
      width: 170,
      render: (value: number) => (
        <span style={{ fontWeight: 700, fontSize: 14, color: BRAND.text, fontVariantNumeric: "tabular-nums" }}>
          {formatMoney(value, currency)}
        </span>
      ),
      sorter: (a, b) => a.monthlyTotal - b.monthlyTotal,
    },
    {
      title: "Δ vs Deel",
      key: "variance",
      align: "right",
      width: 150,
      render: (_: unknown, row) => {
        if (row.providerId === "deel") {
          return <span style={{ color: BRAND.textMuted, fontSize: 13 }}>0.0% (Anchor)</span>;
        }
        const pct = ((row.monthlyTotal - deelPrice) / deelPrice) * 100;
        const inRange = row.inRange;
        return (
          <span
            style={{
              color: inRange ? BRAND.primary : BRAND.danger,
              fontWeight: 600,
              fontSize: 13,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatSignedPct(pct)}
          </span>
        );
      },
      sorter: (a, b) => a.monthlyTotal - b.monthlyTotal,
    },
    {
      title: "Status",
      key: "status",
      align: "center",
      width: 160,
      render: (_: unknown, row) => <StatusTag kind={row.statusKind} />,
    },
  ];

  return (
    <Card title="All Providers Comparison">
      <Typography.Paragraph
        type="secondary"
        style={{ marginTop: -4, marginBottom: 20, fontSize: 13 }}
      >
        Detailed cost and variance breakdown for every analyzed provider relative to Deel.
      </Typography.Paragraph>
      {/*
       * One-off global style for the selected-row highlight. Scoped by the
       * `provider-comparison-selected-row` class we apply via `rowClassName`
       * so it doesn't leak into other tables.
       */}
      <style jsx global>{`
        .provider-comparison-selected-row > td {
          background: rgba(4, 120, 87, 0.08) !important;
        }
      `}</style>
      <Table<TableRow>
        columns={columns}
        dataSource={rows}
        pagination={false}
        size="middle"
        rowKey="key"
        rowClassName={(row) =>
          row.isCurrentSelection ? "provider-comparison-selected-row" : ""
        }
      />
    </Card>
  );
}

function StatusTag({ kind }: { kind: TableRow["statusKind"] }) {
  switch (kind) {
    case "anchor":
      return (
        <Tag
          style={{
            backgroundColor: BRAND.bgSubtle,
            color: BRAND.textSecondary,
            border: "none",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          ANCHOR
        </Tag>
      );
    case "recommended":
      return (
        <Tag
          style={{
            backgroundColor: BRAND.primarySoft,
            color: BRAND.primary,
            border: "none",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          RECOMMENDED
        </Tag>
      );
    case "your_pick":
      return (
        <Tag
          style={{
            backgroundColor: BRAND.primarySoft,
            color: BRAND.primary,
            border: `1px solid ${BRAND.primary}`,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          YOUR PICK
        </Tag>
      );
    case "in_band":
      return (
        <Tag
          style={{
            backgroundColor: BRAND.bgSubtle,
            color: BRAND.textSecondary,
            border: "none",
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          IN BAND
        </Tag>
      );
    case "out_of_band":
      return (
        <Tag
          style={{
            backgroundColor: BRAND.dangerSoft,
            color: BRAND.danger,
            border: "none",
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          OUT OF BAND
        </Tag>
      );
  }
}
