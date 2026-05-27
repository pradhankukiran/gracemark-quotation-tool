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
    // Sort by price descending so the most expensive provider is at the top.
    const sorted = [...analyzed].sort((a, b) => b.price - a.price);
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
        <Space size="small" align="center">
          <ProviderLogo
            providerId={row.providerId}
            fallback={row.displayName}
            height={24}
          />
        </Space>
      ),
    },
    {
      title: "Monthly",
      dataIndex: "monthlyTotal",
      key: "monthly",
      align: "right",
      width: 160,
      render: (value: number) => formatMoney(value, currency),
      sorter: (a, b) => a.monthlyTotal - b.monthlyTotal,
    },
    {
      title: "Δ vs Deel",
      key: "variance",
      align: "right",
      width: 140,
      render: (_: unknown, row) => {
        if (row.providerId === "deel")
          return <Typography.Text type="secondary">—</Typography.Text>;
        const pct = ((row.monthlyTotal - deelPrice) / deelPrice) * 100;
        const inRange = row.inRange;
        return (
          <Typography.Text
            style={{
              color: inRange ? BRAND.text : "#dc2626",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatSignedPct(pct)}
          </Typography.Text>
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
    <Card title="All Providers" styles={{ body: { padding: 0 } }}>
      {/*
       * One-off global style for the selected-row highlight. Scoped by the
       * `provider-comparison-selected-row` class we apply via `rowClassName`
       * so it doesn't leak into other tables. We use the `!important` flag
       * because antd's row-hover background otherwise wins the cascade.
       */}
      <style jsx global>{`
        .provider-comparison-selected-row > td {
          background: ${BRAND.bgSubtle} !important;
        }
      `}</style>
      <Table<TableRow>
        columns={columns}
        dataSource={rows}
        pagination={false}
        size="large"
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
      return <Tag>Anchor</Tag>;
    case "recommended":
      return (
        <Tag
          color="green"
          style={{
            backgroundColor: BRAND.primarySoft,
            color: BRAND.primary,
            borderColor: BRAND.primary,
            fontWeight: 600,
          }}
        >
          Recommended
        </Tag>
      );
    case "your_pick":
      return (
        <Tag
          color="green"
          style={{
            backgroundColor: BRAND.primary,
            color: "#ffffff",
            borderColor: BRAND.primary,
            fontWeight: 600,
          }}
        >
          Your pick
        </Tag>
      );
    case "in_band":
      return <Tag color="success">In band</Tag>;
    case "out_of_band":
      return <Tag color="error">Out of band</Tag>;
  }
}
