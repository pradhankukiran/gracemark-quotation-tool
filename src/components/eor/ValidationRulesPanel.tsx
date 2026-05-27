"use client";

import { Alert, Descriptions, Skeleton, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { fetchFxRate, fetchValidations } from "@/lib/api";
import type { FxSnapshot, ValidationRules } from "@/providers/_core/types";

interface ValidationRulesPanelProps {
  countryCode: string | null;
  currency: string | null;
  annualSalary: number | null;
  /** Heading label rendered above the panel (e.g. "Primary", "Comparison"). */
  label?: string;
}

function formatRange(min: number | null, max: number | null, suffix = ""): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `${min} – ${max}${suffix}`;
  if (min != null) return `${min}+${suffix}`;
  return `up to ${max}${suffix}`;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

export function ValidationRulesPanel({
  countryCode,
  currency,
  annualSalary,
  label,
}: ValidationRulesPanelProps) {
  const { data, isLoading, isError, error } = useQuery<ValidationRules, Error>({
    queryKey: ["validations", countryCode],
    queryFn: () => fetchValidations(countryCode!),
    enabled: !!countryCode,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const validationCurrency = data?.currency?.toUpperCase();
  const userCurrency = (currency ?? "").toUpperCase();
  const userCurrencyValid = /^[A-Z]{3}$/.test(userCurrency);
  const needsFx =
    data != null && userCurrencyValid && validationCurrency !== userCurrency;

  const fxQuery = useQuery<FxSnapshot | null, Error>({
    queryKey: ["fx", validationCurrency, userCurrency],
    queryFn: () => fetchFxRate(validationCurrency!, userCurrency),
    enabled: needsFx,
    staleTime: 5 * 60 * 1000,
  });

  if (!countryCode) return null;

  const heading = label ? (
    <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 12 }}>
      {label}
    </Typography.Title>
  ) : null;

  if (isLoading) {
    return (
      <div>
        {heading}
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {heading}
        <Alert
          type="error"
          showIcon
          message="Couldn't load hiring rules"
          description={error?.message ?? "Unknown error"}
        />
      </div>
    );
  }

  if (!data) return null;

  // What's the salary minimum/maximum, in the USER's currency?
  let minInUserCurrency: number | null = null;
  let maxInUserCurrency: number | null = null;
  if (!needsFx) {
    // Currencies match (or user currency missing/invalid — degrade to local compare)
    minInUserCurrency = data.salary.min;
    maxInUserCurrency = data.salary.max;
  } else if (fxQuery.data) {
    // FX loaded — convert local → user
    minInUserCurrency =
      data.salary.min != null ? data.salary.min * fxQuery.data.rate : null;
    maxInUserCurrency =
      data.salary.max != null ? data.salary.max * fxQuery.data.rate : null;
  }
  // else: FX still loading or errored — leave nulls; suppress warning

  // Convert user's salary into the comparison frequency
  const userMonthlySalary = annualSalary != null ? annualSalary / 12 : null;
  const userAnnualSalary = annualSalary;
  const comparisonUserSalary =
    data.salary.frequency === "monthly" ? userMonthlySalary : userAnnualSalary;

  const salaryBelowMin =
    minInUserCurrency != null &&
    comparisonUserSalary != null &&
    comparisonUserSalary > 0 &&
    comparisonUserSalary < minInUserCurrency;

  const salaryAboveMax =
    maxInUserCurrency != null &&
    comparisonUserSalary != null &&
    comparisonUserSalary > maxInUserCurrency;

  const salaryFrequencyLabel =
    data.salary.frequency === "monthly" ? "monthly" : "annual";

  const hasSalary = annualSalary != null && annualSalary > 0;
  const fxFailed = needsFx && fxQuery.isError;
  const fxLoading = needsFx && fxQuery.isLoading;
  const showSalaryWarnings = hasSalary && !fxLoading && !fxFailed;
  const showFxFailedNotice = hasSalary && fxFailed;

  return (
    <div>
      {heading}
      {showFxFailedNotice ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Salary validation skipped"
          description={`Couldn't load FX rate for ${userCurrency} ↔ ${data.currency}. Other hiring rules are still shown below.`}
        />
      ) : null}

      {showSalaryWarnings && salaryBelowMin && data.salary.min != null ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Salary below Deel's minimum"
          description={
            needsFx && fxQuery.data
              ? `Your salary is below Deel's minimum for this country (${formatCurrency(
                  minInUserCurrency!,
                  userCurrency
                )}/${data.salary.frequency} ≈ ${formatCurrency(
                  data.salary.min,
                  data.currency
                )}/${data.salary.frequency}).`
              : `Your salary is below Deel's minimum for this country (${formatCurrency(
                  data.salary.min,
                  data.currency
                )}/${data.salary.frequency}).`
          }
        />
      ) : null}

      {showSalaryWarnings && salaryAboveMax && data.salary.max != null ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Salary above Deel's maximum"
          description={
            needsFx && fxQuery.data
              ? `Your salary is above Deel's maximum for this country (${formatCurrency(
                  maxInUserCurrency!,
                  userCurrency
                )}/${data.salary.frequency} ≈ ${formatCurrency(
                  data.salary.max,
                  data.currency
                )}/${data.salary.frequency}).`
              : `Your salary is above Deel's maximum for this country (${formatCurrency(
                  data.salary.max,
                  data.currency
                )}/${data.salary.frequency}).`
          }
        />
      ) : null}

      <Descriptions
        bordered
        layout="vertical"
        column={{ xs: 1, sm: 2, md: 3 }}
        size="middle"
        items={[
          {
            key: "salary",
            label: `Salary range (${salaryFrequencyLabel})`,
            children: (
              <Typography.Text>
                {data.salary.min == null && data.salary.max == null
                  ? "—"
                  : data.salary.min != null && data.salary.max != null
                    ? `${formatCurrency(data.salary.min, data.currency)} — ${formatCurrency(data.salary.max, data.currency)}`
                    : data.salary.min != null
                      ? `${formatCurrency(data.salary.min, data.currency)}+`
                      : `up to ${formatCurrency(data.salary.max!, data.currency)}`}
              </Typography.Text>
            ),
          },
          {
            key: "vacation",
            label: "Vacation days",
            children:
              data.vacation_days_min != null
                ? `${data.vacation_days_min}+ days`
                : "—",
          },
          {
            key: "probation",
            label: "Probation",
            children: formatRange(
              data.probation_days.min,
              data.probation_days.max,
              " days"
            ),
          },
          {
            key: "schedule",
            label: "Work schedule",
            children: `${data.work_schedule.days.min}–${data.work_schedule.days.max} days/wk · ${data.work_schedule.hours.min}–${data.work_schedule.hours.max} hrs/day`,
          },
          {
            key: "start",
            label: "Start date buffer",
            children: `${data.start_date_buffer_days} days`,
          },
        ]}
      />
    </div>
  );
}
