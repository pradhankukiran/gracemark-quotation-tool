"use client";

import React from "react";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { BRAND } from "@/lib/theme";

// Register Inter font for crisp, executive typography
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_eeA.woff",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_eeA.woff",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_eeA.woff",
      fontWeight: 700,
    },
  ],
});

// Local prop types — keep this document self-contained.
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

export interface ContractorPdfProps {
  data: ICPdfData;
  contractorSlug?: string;
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    color: BRAND.text,
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  rateCards: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  rateCard: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.bgContainer,
  },
  rateCardHighlight: {
    borderColor: BRAND.primary,
    backgroundColor: BRAND.bgContainer,
  },
  rateCardLabel: {
    fontSize: 7.5,
    color: BRAND.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: 700,
    letterSpacing: 0.4,
  },
  rateCardValue: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 2,
    color: BRAND.text,
  },
  rateCardValuePrimary: {
    color: BRAND.primary,
  },
  rateCardSecondaryValue: {
    fontSize: 8,
    color: BRAND.textSecondary,
  },
  costTable: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  costRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0ede6",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  costRowLast: {
    borderBottomWidth: 0,
  },
  costRowHighlight: {
    backgroundColor: "#faf9f6",
  },
  costLabel: {
    flex: 2,
    fontSize: 8.5,
    color: BRAND.text,
  },
  costDescription: {
    fontSize: 7.5,
    color: BRAND.textMuted,
    marginTop: 1,
  },
  costValue: {
    flex: 1,
    fontSize: 8.5,
    fontWeight: 700,
    textAlign: "right",
    color: BRAND.text,
  },
  totalCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: BRAND.primarySoft,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BRAND.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 9.5,
    color: BRAND.primary,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 700,
    color: BRAND.primary,
  },
  markupRow: {
    marginTop: 8,
    padding: 8,
    backgroundColor: BRAND.bgContainer,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BRAND.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  markupLabel: {
    fontSize: 8.5,
    color: BRAND.textSecondary,
    fontWeight: 600,
  },
  markupValue: {
    fontSize: 9.5,
    fontWeight: 700,
    color: BRAND.text,
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

export function ContractorPdfDocument(
  props: ContractorPdfProps,
): React.ReactElement {
  const { data } = props;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Executive Header */}
        <View style={styles.headerBar}>
          <Image src={data.logoSrc} style={styles.logo} />
          <View style={styles.headerMeta}>
            <Text style={styles.headerDocTitle}>
              Contractor Quotation Breakdown
            </Text>
            <Text style={styles.headerDocSubtitle}>
              {data.contractorName ? `${data.contractorName} • ` : ""}{data.country}
            </Text>
          </View>
        </View>

        {/* Overview Strip */}
        <View style={styles.overviewStrip}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Country / Currency</Text>
            <Text style={styles.overviewValue}>
              {data.country} ({data.currency})
            </Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Duration</Text>
            <Text style={styles.overviewValue}>{data.contractDuration}</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Payment Frequency</Text>
            <Text style={styles.overviewValue}>{data.paymentFrequency}</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Work Hours</Text>
            <Text style={styles.overviewValue}>
              {data.rateInfo.workedHours} hrs/mo
            </Text>
          </View>
        </View>

        {/* Rate Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate Overview</Text>
          <View style={styles.rateCards}>
            <View style={styles.rateCard}>
              <Text style={styles.rateCardLabel}>Pay Rate (Contractor)</Text>
              <Text style={styles.rateCardValue}>
                {data.rateInfo.payRateHourly}/hr
              </Text>
              <Text style={styles.rateCardSecondaryValue}>
                {data.rateInfo.payRateMonthly}/month
              </Text>
            </View>

            <View style={[styles.rateCard, styles.rateCardHighlight]}>
              <Text style={styles.rateCardLabel}>Bill Rate (Client)</Text>
              <Text style={[styles.rateCardValue, styles.rateCardValuePrimary]}>
                {data.rateInfo.billRateHourly}/hr
              </Text>
              <Text style={styles.rateCardSecondaryValue}>
                {data.rateInfo.billRateMonthly}/month
              </Text>
            </View>

            <View style={styles.rateCard}>
              <Text style={styles.rateCardLabel}>
                Agency Fee ({data.rateInfo.markupPercentage}% Markup)
              </Text>
              <Text style={styles.rateCardValue}>
                {data.rateInfo.agencyFeeHourly}/hr
              </Text>
              <Text style={styles.rateCardSecondaryValue}>
                {data.rateInfo.agencyFeeMonthly}/month
              </Text>
            </View>
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

          {/* Total Client Cost Callout */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Client Cost / Month</Text>
            <Text style={styles.totalValue}>{data.totalClientCost}</Text>
          </View>

          {/* Monthly Markup Summary */}
          <View style={styles.markupRow}>
            <Text style={styles.markupLabel}>
              Monthly Markup (Agency Margin)
            </Text>
            <Text style={styles.markupValue}>{data.monthlyMarkup}</Text>
          </View>
        </View>

        {/* Footer */}
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
