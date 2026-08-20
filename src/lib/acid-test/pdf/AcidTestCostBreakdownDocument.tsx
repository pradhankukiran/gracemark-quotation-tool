"use client";

import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { BRAND } from "@/lib/theme";

// Local prop types — keep this document self-contained. The caller adapts
// upstream domain models into this shape; the document is a dumb renderer.
export interface AcidTestPdfItem {
  label: string;
  local: string;
  usd?: string;
}

export interface AcidTestPdfCategory {
  title: string;
  localTotal: string;
  usdTotal?: string;
  items: AcidTestPdfItem[];
}

export interface AcidTestPdfMonthlyCard {
  title: string;
  localValue: string;
  usdValue?: string;
  duration: string;
  description?: string;
}

export interface AcidTestPdfSummaryItem {
  label: string;
  local: string;
  usd?: string;
}

export interface AcidTestPdfData {
  currency: string;
  showUSD: boolean;
  categories: AcidTestPdfCategory[];
  logoSrc: string;
  monthlyCard: AcidTestPdfMonthlyCard;
  summaryItems: AcidTestPdfSummaryItem[];
}

// Caller may also pass the optional provider/country slug hints used by the
// export helper to derive a filename. They're not consumed by the renderer.
export interface AcidTestPdfProps {
  data: AcidTestPdfData;
  providerSlug?: string;
  countrySlug?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    paddingBottom: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: BRAND.text,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 14,
  },
  logo: {
    width: 160,
    height: 65,
    objectFit: "contain",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND.bgSubtle,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  headerCell: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontWeight: "bold",
    color: BRAND.text,
    fontSize: 9,
  },
  headerLabel: {
    flex: 2,
  },
  headerAmount: {
    flex: 1,
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  categoryRow: {
    backgroundColor: BRAND.bgSubtle,
  },
  cell: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 9,
  },
  labelCell: {
    flex: 2,
    color: BRAND.text,
  },
  categoryLabel: {
    fontSize: 9.5,
    fontWeight: "bold",
  },
  itemLabel: {
    marginLeft: 10,
    color: BRAND.textSecondary,
  },
  amountCell: {
    flex: 1,
    textAlign: "right",
    color: BRAND.text,
  },
  amountBold: {
    fontWeight: "bold",
  },
  billRateCard: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.bgContainer,
    alignItems: "center",
    marginBottom: 16,
  },
  billRateLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: BRAND.textSecondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  billRateAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: BRAND.text,
    marginBottom: 2,
  },
  billRateUsd: {
    fontSize: 11,
    color: BRAND.textSecondary,
    marginBottom: 6,
  },
  billRateMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  billRateMetaPill: {
    fontSize: 8.5,
    color: BRAND.primary,
    backgroundColor: BRAND.primarySoft,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontWeight: "bold",
  },
  billRateMetaText: {
    fontSize: 8.5,
    color: BRAND.textSecondary,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: BRAND.text,
  },
  totalRow: {
    backgroundColor: BRAND.bgSubtle,
  },
  totalLabel: {
    fontWeight: "bold",
    color: BRAND.text,
  },
  totalAmount: {
    fontWeight: "bold",
    color: BRAND.primary,
  },
  altRow: {
    backgroundColor: "#faf8f5",
  },
  footer: {
    position: "absolute",
    bottom: 14,
    left: 24,
    right: 24,
    textAlign: "center",
    fontSize: 8,
    color: BRAND.textMuted,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingTop: 6,
  },
});

export function AcidTestCostBreakdownDocument(
  props: AcidTestPdfProps,
): React.ReactElement {
  const { data } = props;
  const { showUSD } = data;

  return (
    <Document>
      {/* Page 1: Cost Breakdown */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoContainer}>
          <Image src={data.logoSrc} style={styles.logo} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cost Breakdown by Category</Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.headerLabel]}>
              Category / Item
            </Text>
            <Text style={[styles.headerCell, styles.headerAmount]}>
              Amount ({data.currency})
            </Text>
            {showUSD && (
              <Text style={[styles.headerCell, styles.headerAmount]}>
                Amount (USD)
              </Text>
            )}
          </View>

          {data.categories.map((category) => (
            <React.Fragment key={category.title}>
              <View style={[styles.tableRow, styles.categoryRow]}>
                <Text
                  style={[styles.cell, styles.labelCell, styles.categoryLabel]}
                >
                  {category.title}
                </Text>
                <Text
                  style={[styles.cell, styles.amountCell, styles.amountBold]}
                >
                  {category.localTotal}
                </Text>
                {showUSD && (
                  <Text
                    style={[styles.cell, styles.amountCell, styles.amountBold]}
                  >
                    {category.usdTotal ?? "—"}
                  </Text>
                )}
              </View>
              {category.items.map((item, index) => (
                <View
                  style={styles.tableRow}
                  key={`${category.title}-${index}`}
                >
                  <Text
                    style={[styles.cell, styles.labelCell, styles.itemLabel]}
                  >
                    {item.label}
                  </Text>
                  <Text style={[styles.cell, styles.amountCell]}>
                    {item.local}
                  </Text>
                  {showUSD && (
                    <Text style={[styles.cell, styles.amountCell]}>
                      {item.usd ?? "—"}
                    </Text>
                  )}
                </View>
              ))}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Generated by GraceMark</Text>
        </View>
      </Page>

      {/* Page 2: Monthly Bill Rate & Financial Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.logoContainer}>
          <Image src={data.logoSrc} style={styles.logo} />
        </View>

        {/* Hero Card: Monthly Bill Rate */}
        <View style={styles.billRateCard}>
          <Text style={styles.billRateLabel}>{data.monthlyCard.title}</Text>
          <Text style={styles.billRateAmount}>{data.monthlyCard.localValue}</Text>
          {data.monthlyCard.usdValue ? (
            <Text style={styles.billRateUsd}>
              ≈ {data.monthlyCard.usdValue} USD / month
            </Text>
          ) : null}
          <View style={styles.billRateMetaRow}>
            <Text style={styles.billRateMetaPill}>
              {data.monthlyCard.duration}
            </Text>
            {data.monthlyCard.description ? (
              <Text style={styles.billRateMetaText}>
                {data.monthlyCard.description}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assignment Financial Summary</Text>
        </View>

        {/* Financial Summary Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.headerLabel]}>
              Component
            </Text>
            <Text style={[styles.headerCell, styles.headerAmount]}>
              Amount ({data.currency})
            </Text>
            {showUSD && (
              <Text style={[styles.headerCell, styles.headerAmount]}>
                Amount (USD)
              </Text>
            )}
          </View>

          {data.summaryItems.map((item, index) => {
            const isTotalRow =
              item.label.toLowerCase().includes("total profit") ||
              item.label.toLowerCase().includes("total assignment");
            return (
              <View
                style={[
                  styles.tableRow,
                  isTotalRow
                    ? styles.totalRow
                    : index % 2 === 1
                    ? styles.altRow
                    : {},
                ]}
                key={item.label}
              >
                <Text
                  style={[
                    styles.cell,
                    styles.labelCell,
                    isTotalRow ? styles.totalLabel : {},
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.cell,
                    styles.amountCell,
                    isTotalRow ? styles.totalAmount : {},
                  ]}
                >
                  {item.local}
                </Text>
                {showUSD && (
                  <Text
                    style={[
                      styles.cell,
                      styles.amountCell,
                      isTotalRow ? styles.totalAmount : {},
                    ]}
                  >
                    {item.usd ?? "—"}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text>Generated by GraceMark</Text>
        </View>
      </Page>
    </Document>
  );
}
