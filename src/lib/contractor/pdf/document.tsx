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
export interface ICPdfRateInfo {
  payRateHourly: string;
  payRateMonthly: string;
  billRateHourly: string;
  billRateMonthly: string;
  agencyFeeHourly: string;
  agencyFeeMonthly: string;
  markupPercentage: string;
  workedHours: number;
}

export interface ICPdfCostItem {
  label: string;
  value: string;
  description?: string;
}

export interface ICPdfData {
  contractorName: string;
  country: string;
  currency: string;
  showUSD: boolean;
  rateInfo: ICPdfRateInfo;
  costBreakdown: ICPdfCostItem[];
  totalClientCost: string;
  monthlyMarkup: string;
  contractDuration: string;
  paymentFrequency: string;
  logoSrc: string;
}

// Caller may also pass optional slug hints used by the export helper to derive
// a filename. They're not consumed by the renderer.
export interface ContractorPdfProps {
  data: ICPdfData;
  contractorSlug?: string;
  countrySlug?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: BRAND.text,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 150,
    height: 62,
    objectFit: "contain",
  },
  header: {
    marginBottom: 12,
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: BRAND.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: BRAND.textSecondary,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: BRAND.text,
    marginBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: BRAND.border,
    paddingBottom: 3,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  infoItem: {
    width: "48%",
  },
  infoLabel: {
    fontSize: 8,
    color: BRAND.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: BRAND.text,
  },
  rateCards: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  rateCard: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  rateCardPrimary: {
    backgroundColor: BRAND.bgContainer,
    borderColor: BRAND.primary,
  },
  rateCardSecondary: {
    backgroundColor: BRAND.primarySoft,
    borderColor: BRAND.primary,
  },
  rateCardLabel: {
    fontSize: 7,
    color: BRAND.textSecondary,
    marginBottom: 3,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  rateCardValue: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  rateCardValuePrimary: {
    color: BRAND.primary,
  },
  rateCardValueSecondary: {
    color: BRAND.primaryHover,
  },
  rateCardSecondaryValue: {
    fontSize: 8,
    color: BRAND.textSecondary,
  },
  formulaBox: {
    backgroundColor: BRAND.bgSubtle,
    padding: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  formulaText: {
    fontSize: 8,
    color: BRAND.textSecondary,
    textAlign: "center",
  },
  costTable: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  costRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  costRowLast: {
    borderBottomWidth: 0,
  },
  costRowHighlight: {
    backgroundColor: BRAND.bgSubtle,
  },
  costRowTotal: {
    backgroundColor: BRAND.text,
  },
  costLabel: {
    flex: 2,
    fontSize: 9,
  },
  costLabelWhite: {
    color: "#ffffff",
  },
  costDescription: {
    fontSize: 7,
    color: BRAND.textMuted,
    marginTop: 1,
  },
  costValue: {
    flex: 1,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "right",
  },
  costValueWhite: {
    color: "#ffffff",
    fontSize: 10,
  },
  summaryBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: BRAND.primarySoft,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 9,
    color: BRAND.primaryHover,
    fontWeight: "bold",
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: BRAND.primary,
  },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 24,
    right: 24,
    textAlign: "center",
    fontSize: 7,
    color: BRAND.textMuted,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingTop: 6,
  },
});

export function ContractorPdfDocument(
  props: ContractorPdfProps,
): React.ReactElement {
  const { data } = props;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image src={data.logoSrc} style={styles.logo} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Independent Contractor Quote Breakdown
          </Text>
          <Text style={styles.subtitle}>
            {data.contractorName} • {data.country}
          </Text>
        </View>

        {/* Rate Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate Overview</Text>

          <View style={styles.rateCards}>
            <View style={[styles.rateCard, styles.rateCardPrimary]}>
              <Text style={styles.rateCardLabel}>Pay Rate (Contractor)</Text>
              <Text style={[styles.rateCardValue, styles.rateCardValuePrimary]}>
                {data.rateInfo.payRateHourly}/hr
              </Text>
              <Text style={styles.rateCardSecondaryValue}>
                {data.rateInfo.payRateMonthly}/month
              </Text>
            </View>

            <View style={[styles.rateCard, styles.rateCardPrimary]}>
              <Text style={styles.rateCardLabel}>Bill Rate (Client)</Text>
              <Text style={[styles.rateCardValue, styles.rateCardValuePrimary]}>
                {data.rateInfo.billRateHourly}/hr
              </Text>
              <Text style={styles.rateCardSecondaryValue}>
                {data.rateInfo.billRateMonthly}/month
              </Text>
            </View>

            <View style={[styles.rateCard, styles.rateCardSecondary]}>
              <Text style={styles.rateCardLabel}>Agency Fee (Markup)</Text>
              <Text
                style={[styles.rateCardValue, styles.rateCardValueSecondary]}
              >
                {data.rateInfo.agencyFeeHourly}/hr
              </Text>
              <Text style={styles.rateCardSecondaryValue}>
                {data.rateInfo.agencyFeeMonthly}/month
              </Text>
            </View>
          </View>

          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>
              Bill Rate = Pay Rate × (1 + {data.rateInfo.markupPercentage}%
              markup) | Monthly conversions assume {data.rateInfo.workedHours}{" "}
              hours per month
            </Text>
          </View>
        </View>

        {/* Monthly Cost Breakdown Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Cost Breakdown</Text>

          <View style={styles.costTable}>
            {data.costBreakdown.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.costRow,
                  index % 2 === 1 ? styles.costRowHighlight : {},
                  index === data.costBreakdown.length - 1
                    ? styles.costRowLast
                    : {},
                ]}
              >
                <View style={styles.costLabel}>
                  <Text>{item.label}</Text>
                  {item.description && (
                    <Text style={styles.costDescription}>
                      {item.description}
                    </Text>
                  )}
                </View>
                <Text style={styles.costValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.costTable, { marginTop: 8 }]}>
            <View style={[styles.costRow, styles.costRowTotal, styles.costRowLast]}>
              <Text style={[styles.costLabel, styles.costLabelWhite]}>
                Total Client Cost per Month
              </Text>
              <Text style={[styles.costValue, styles.costValueWhite]}>
                {data.totalClientCost}
              </Text>
            </View>
          </View>

          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monthly Markup</Text>
              <Text style={styles.summaryValue}>{data.monthlyMarkup}</Text>
            </View>
          </View>
        </View>

        {/* Contract Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contract Details</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Contract Duration</Text>
              <Text style={styles.infoValue}>{data.contractDuration}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Payment Frequency</Text>
              <Text style={styles.infoValue}>{data.paymentFrequency}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Currency</Text>
              <Text style={styles.infoValue}>{data.currency}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated by GraceMark • {new Date().toLocaleDateString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
