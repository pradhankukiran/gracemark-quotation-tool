"use client";

import { Card, Collapse, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { CostBucket, CostLine } from "@/providers/_core/types";
import { BRAND } from "@/lib/theme";
import { UsdSkeleton } from "@/components/UsdSkeleton";

const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

interface BreakdownRow {
  key: string;
  name: string;
  monthly: number;
  annual: number;
}

interface BreakdownPanel {
  /** The bucket this panel represents — used for stable keys + grouping. */
  bucket: CostBucket;
  label: string;
  rows: BreakdownRow[];
  monthlyTotal: number;
  /** Optional empty-state message when `rows.length === 0`. */
  emptyMessage?: string;
}

export interface CostBreakdownAccordionProps {
  panels: BreakdownPanel[];
  /** Currency the local amounts are denominated in (drives the column label + Intl formatter). */
  currency: string;
  /** FX rate for the USD column. `null` while loading; `undefined` when permanently unavailable. */
  fxRate: number | null | undefined;
  /** True while FX is loading — toggles `<UsdSkeleton>` rendering in the USD column. */
  fxLoading: boolean;
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

/**
 * Cost-breakdown collapse with 6 panels: Base Salary, Statutory & Mandatory,
 * Allowances & Benefits, Onboarding Fees, Termination Costs, GraceMark
 * Overhead. Each panel header shows the bucket name on the left and the
 * monthly total in the quote currency on the right. Panel body renders a
 * table of items with Monthly, Annual, and USD columns (USD column hidden
 * when `fxRate === undefined`).
 *
 * The GraceMark Costs panel contains local-office overhead, VAT, and the
 * provider fee. These are included in the Acid Test's complete-cost logic.
 *
 * Caller is responsible for grouping merged cost lines into these panels —
 * see the Acid Test page for the grouping logic.
 */
export function CostBreakdownAccordion({
  panels,
  currency,
  fxRate,
  fxLoading,
}: CostBreakdownAccordionProps) {
  const showUsd = fxRate !== undefined;

  const columns: ColumnsType<BreakdownRow> = [
    {
      title: "Item",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <Typography.Text>{value}</Typography.Text>,
    },
    {
      title: "Monthly",
      dataIndex: "monthly",
      key: "monthly",
      align: "right",
      width: 160,
      render: (value: number) => (
        <span style={TABULAR}>{formatCurrency(value, currency)}</span>
      ),
    },
    {
      title: "Annual",
      dataIndex: "annual",
      key: "annual",
      align: "right",
      width: 160,
      render: (value: number) => (
        <span style={TABULAR}>{formatCurrency(value, currency)}</span>
      ),
    },
    ...(showUsd
      ? [
          {
            title: "USD",
            dataIndex: "monthly" as const,
            key: "usd",
            align: "right" as const,
            width: 140,
            render: (value: number) => {
              if (fxLoading) return <UsdSkeleton />;
              if (fxRate == null) {
                return <span style={{ color: BRAND.textMuted }}>—</span>;
              }
              return <span style={TABULAR}>{formatUsd(value * fxRate)}</span>;
            },
          },
        ]
      : []),
  ];

  const items = panels.map((panel) => ({
    key: panel.bucket,
    label: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          width: "100%",
        }}
      >
        <Typography.Text strong>{panel.label}</Typography.Text>
        <Typography.Text strong style={TABULAR}>
          {formatCurrency(panel.monthlyTotal, currency)}/mo
        </Typography.Text>
      </div>
    ),
    children:
      panel.rows.length === 0 ? (
        <Typography.Text
          type="secondary"
          italic
          style={{ display: "block", padding: 16 }}
        >
          {panel.emptyMessage ?? "No entries"}
        </Typography.Text>
      ) : (
        <Table<BreakdownRow>
          columns={columns}
          dataSource={panel.rows}
          pagination={false}
          size="middle"
          rowKey="key"
        />
      ),
  }));

  return (
    <Card title="Cost Breakdown" styles={{ body: { padding: 0 } }}>
      <Collapse
        items={items}
        ghost
        style={{
          background: "transparent",
        }}
      />
    </Card>
  );
}
