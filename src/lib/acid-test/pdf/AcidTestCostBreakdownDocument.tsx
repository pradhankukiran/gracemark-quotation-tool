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
import { registerPdfFonts } from "@/lib/pdf-fonts";

// Ensure local Inter fonts are registered
registerPdfFonts();

// Local prop types — keep this document self-contained.
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

export interface AcidTestPdfProps {
  data: AcidTestPdfData;
  providerSlug?: string;
  countrySlug?: string;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 44,
    paddingHorizontal: 32,
    fontFamily: "Inter",
    fontSize: 9,
    color: BRAND.text,
    backgroundColor: "#ffffff",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: BRAND.border,
    marginBottom: 16,
  },
  logo: {
    width: 140,
    height: 52,
    objectFit: "contain",
  },
  headerMeta: {
    textAlign: "right",
  },
  headerDocTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: BRAND.text,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  headerDocSubtitle: {
    fontSize: 8,
    color: BRAND.textSecondary,
    marginTop: 3,
  },
  overviewStrip: {
    flexDirection: "row",
    backgroundColor: BRAND.bgContainer,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    justifyContent: "space-between",
  },
  overviewItem: {
    flex: 1,
  },
  overviewLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: BRAND.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  overviewValue: {
    fontSize: 9,
    fontWeight: 600,
    color: BRAND.text,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    color: BRAND.text,
    letterSpacing: -0.1,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 6,
    overflow: "hidden",
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
    fontWeight: 700,
    color: BRAND.textSecondary,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  headerLabel: {
    flex: 2.2,
  },
  headerAmount: {
    flex: 1,
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0ede6",
  },
  categoryRow: {
    backgroundColor: BRAND.bgContainer,
    borderBottomColor: BRAND.border,
    borderTopWidth: 0.5,
    borderTopColor: BRAND.border,
  },
  cell: {
    paddingVertical: 5.5,
    paddingHorizontal: 10,
    fontSize: 8.5,
  },
  labelCell: {
    flex: 2.2,
    color: BRAND.text,
  },
  categoryLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: BRAND.text,
  },
  itemLabel: {
    marginLeft: 12,
    color: BRAND.textSecondary,
    fontSize: 8,
  },
  amountCell: {
    flex: 1,
    textAlign: "right",
    color: BRAND.text,
  },
  amountBold: {
    fontWeight: 700,
  },
  amountMuted: {
    color: BRAND.textSecondary,
  },
  billRateCard: {
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.bgContainer,
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: BRAND.primary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  billRateLabel: {
    fontSize: 8.5,
    fontWeight: 700,
    color: BRAND.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  billRateAmount: {
    fontSize: 26,
    fontWeight: 700,
    color: BRAND.primary,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  billRateUsd: {
    fontSize: 10.5,
    color: BRAND.textSecondary,
    fontWeight: 600,
    marginBottom: 8,
  },
  billRateMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  billRateMetaPill: {
    fontSize: 8,
    color: BRAND.primary,
    backgroundColor: BRAND.primarySoft,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontWeight: 700,
  },
  billRateMetaText: {
    fontSize: 8,
    color: BRAND.textSecondary,
  },
  totalRow: {
    backgroundColor: BRAND.primarySoft,
    borderBottomColor: BRAND.primarySoft,
  },
  totalLabel: {
    fontWeight: 700,
    color: BRAND.primary,
    fontSize: 9,
  },
  totalAmount: {
    fontWeight: 700,
    color: BRAND.primary,
    fontSize: 9,
  },
  altRow: {
    backgroundColor: "#faf9f6",
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 7.5,
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
        <View style={styles.headerBar}>
          <Image src={data.logoSrc} style={styles.logo} />
          <View style={styles.headerMeta}>
            <Text style={styles.headerDocTitle}>
              EOR Cost Breakdown & Acid Test
            </Text>
            <Text style={styles.headerDocSubtitle}>
              {data.monthlyCard.description || "Executive Quotation Summary"}
            </Text>
          </View>
        </View>

        {/* Overview Strip */}
        <View style={styles.overviewStrip}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Currency</Text>
            <Text style={styles.overviewValue}>{data.currency}</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Contract Term</Text>
            <Text style={styles.overviewValue}>{data.monthlyCard.duration}</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>USD Conversion</Text>
            <Text style={styles.overviewValue}>
              {showUSD ? "Included" : "Local Currency"}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Itemized Cost Breakdown</Text>
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
                    {category.usdTotal ?? "-"}
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
                    <Text
                      style={[
                        styles.cell,
                        styles.amountCell,
                        styles.amountMuted,
                      ]}
                    >
                      {item.usd ?? "-"}
                    </Text>
                  )}
                </View>
              ))}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text>Confidential • Prepared by GraceMark</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* Page 2: Monthly Bill Rate & Financial Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <Image src={data.logoSrc} style={styles.logo} />
          <View style={styles.headerMeta}>
            <Text style={styles.headerDocTitle}>
              Assignment Financial Summary
            </Text>
            <Text style={styles.headerDocSubtitle}>
              Profitability & Bill Rate Structure
            </Text>
          </View>
        </View>

        {/* Hero Card: Monthly Bill Rate */}
        <View style={styles.billRateCard}>
          <View style={styles.accentBar} />
          <Text style={styles.billRateLabel}>{data.monthlyCard.title}</Text>
          <Text style={styles.billRateAmount}>{data.monthlyCard.localValue}</Text>
          {data.monthlyCard.usdValue ? (
            <Text style={styles.billRateUsd}>
              USD: {data.monthlyCard.usdValue} / month
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
          <Text style={styles.sectionTitle}>Financial Performance Metrics</Text>
        </View>

        {/* Financial Summary Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.headerLabel]}>
              Metric / Component
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
                      isTotalRow ? styles.totalAmount : styles.amountMuted,
                    ]}
                  >
                    {item.usd ?? "-"}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.footer} fixed>
          <Text>Confidential • Prepared by GraceMark</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
