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

export interface AcidTestPdfData {
  currency: string;
  showUSD: boolean;
  categories: AcidTestPdfCategory[];
  logoSrc: string;
  monthlyCard: AcidTestPdfMonthlyCard;
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
    fontFamily: "Helvetica",
    fontSize: 10,
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
    marginBottom: 18,
  },
  logo: {
    width: 200,
    height: 82,
    objectFit: "contain",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND.bgSubtle,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  headerCell: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontWeight: "bold",
    color: BRAND.text,
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
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  labelCell: {
    flex: 2,
    color: BRAND.text,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "bold",
  },
  itemLabel: {
    marginLeft: 12,
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
  secondPage: {
    padding: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  monthlyCard: {
    width: "75%",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.bgContainer,
    alignItems: "center",
    textAlign: "center",
  },
  monthlyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND.text,
    marginBottom: 12,
  },
  monthlyLocal: {
    fontSize: 28,
    fontWeight: "bold",
    color: BRAND.primary,
  },
  monthlyUSD: {
    fontSize: 14,
    color: BRAND.text,
    marginTop: 6,
  },
  monthlyDuration: {
    fontSize: 12,
    color: BRAND.textSecondary,
    marginTop: 12,
  },
  monthlyDescription: {
    fontSize: 10,
    color: BRAND.textSecondary,
    marginTop: 8,
  },
});

export function AcidTestCostBreakdownDocument(
  props: AcidTestPdfProps,
): React.ReactElement {
  const { data } = props;
  const { showUSD } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.logoContainer}>
          <Image src={data.logoSrc} style={styles.logo} />
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
      </Page>
      <Page size="A4" style={styles.secondPage}>
        <View style={styles.monthlyCard}>
          <Text style={styles.monthlyTitle}>{data.monthlyCard.title}</Text>
          <Text style={styles.monthlyLocal}>{data.monthlyCard.localValue}</Text>
          {data.monthlyCard.usdValue ? (
            <Text style={styles.monthlyUSD}>
              USD: {data.monthlyCard.usdValue}
            </Text>
          ) : null}
          <Text style={styles.monthlyDuration}>
            {data.monthlyCard.duration}
          </Text>
          {data.monthlyCard.description ? (
            <Text style={styles.monthlyDescription}>
              {data.monthlyCard.description}
            </Text>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}
