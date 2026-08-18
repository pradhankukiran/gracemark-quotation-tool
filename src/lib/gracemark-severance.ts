import { getGraceMarkSeveranceRate } from "@/data/gracemark/severance";
import type { CostLine } from "@/providers/_core/types";

interface CalculateGraceMarkSeveranceArgs {
  countryCode: string;
  annualSalary: number;
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
