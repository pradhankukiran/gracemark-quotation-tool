import { getGraceMarkSeveranceRate } from "@/data/gracemark/severance";
import type { CostLine } from "@/providers/_core/types";

interface CalculateGraceMarkSeveranceArgs {
  countryCode: string;
  annualSalary: number;
}

function normalizeCostName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * The GraceMark document keeps these deferred-salary funds separate from its
 * consolidated termination accrual. They remain recurring costs in both quote
 * modes instead of being replaced by the All-Inclusive termination row.
 */
export type GraceMarkRecurringSeveranceKind = "fund" | "interest";

export function classifyGraceMarkRecurringSeveranceCost(
  countryCode: string,
  lineName: string,
): GraceMarkRecurringSeveranceKind | null {
  const code = countryCode.toUpperCase();
  const name = normalizeCostName(lineName);

  switch (code) {
    case "BR":
      return (
        /\bfgts\b/.test(name) &&
        !/penalty|fine|termination/.test(name)
      )
        ? "fund"
        : null;
    case "CO":
      if (/\bseverance interest\b|\binterest on severance\b/.test(name)) {
        return "interest";
      }
      return /cesant|\bseverance (liability|fund)\b/.test(name)
        ? "fund"
        : null;
    case "IN":
      return /\bgratuity\b/.test(name) ? "fund" : null;
    case "IL":
      return (
        /\bpitzuim\b/.test(name) ||
        /\bseverance (liability|fund)\b/.test(name)
      )
        ? "fund"
        : null;
    case "IT":
      return /\btfr\b|trattamento di fine rapporto/.test(name)
        ? "fund"
        : null;
    case "PE":
      return /\bcts\b|\bseverance (liability|fund)\b/.test(name)
        ? "fund"
        : null;
    case "KR":
      return (
        /\bseverance (liability|pay|fund)\b/.test(name) ||
        /\bretirement (benefit|allowance|pay)\b/.test(name)
      )
        ? "fund"
        : null;
    case "TR":
      return (
        /\bkidem\b/.test(name) ||
        /\bseverance (liability|pay|fund)\b/.test(name)
      )
        ? "fund"
        : null;
    default:
      return null;
  }
}

export function isGraceMarkRecurringSeveranceCost(
  countryCode: string,
  lineName: string,
): boolean {
  return classifyGraceMarkRecurringSeveranceCost(countryCode, lineName) !== null;
}

/** Convert GraceMark's country percentage into a monthly quote-currency row. */
export function calculateGraceMarkSeveranceLine({
  countryCode,
  annualSalary,
}: CalculateGraceMarkSeveranceArgs): CostLine | null {
  if (!Number.isFinite(annualSalary) || annualSalary <= 0) return null;

  const ratePercent = getGraceMarkSeveranceRate(countryCode);
  if (ratePercent == null || ratePercent <= 0) return null;

  const monthlyAmount = Math.round(
    ((annualSalary / 12) * (ratePercent / 100) + Number.EPSILON) * 100,
  ) / 100;

  return {
    name: `Severance/Termination Accrual (${ratePercent}%)`,
    amount: monthlyAmount,
    frequency: "monthly",
    category: "severance",
    bucket: "termination_costs",
  };
}
