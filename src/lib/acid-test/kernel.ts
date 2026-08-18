// Pure Acid Test compose kernel. Produces breakdown + summary numbers in
// local currency from already-resolved monthly inputs. No FX, no I/O, no
// React, no rounding — caller resolves currencies, runs Promise.all on
// convertCurrency, and stitches USD fields into the final result.

import { GRACEMARK_FEE_PERCENTAGE, PROVIDER_FEE_RATIO } from "./constants"
import type {
  AcidTestComposeInput,
  AcidTestComposeOutput,
  RecurringMonthlyInput,
} from "./types"

/**
 * Compute the Acid Test breakdown / bill-rate composition / summary from
 * already-resolved local-currency monthly inputs. Pure and deterministic.
 *
 * The caller is responsible for FX-converting the relevant fields to USD
 * and for layering the `MIN_PROFIT_THRESHOLD_USD` minimum check on top —
 * those concerns are intentionally outside the kernel.
 */
export function composeAcidTest(input: AcidTestComposeInput): AcidTestComposeOutput {
  const {
    baseSalaryMonthly,
    statutoryMonthly,
    allowancesMonthly,
    terminationMonthly,
    overheadMonthly,
    onboardingTotal,
    oneTimeTotal,
    billRate,
    duration,
    isAllInclusive,
    feePercentage,
    providerFeeMonthly: providerFeeMonthlyOverride,
  } = input

  // Component totals for full assignment (breakdown display).
  const salaryTotal = baseSalaryMonthly * duration
  const statutoryTotal = statutoryMonthly * duration
  const allowancesTotal = allowancesMonthly * duration
  const overheadTotal = overheadMonthly * duration
  // Only include termination cost when the quote is all-inclusive.
  const terminationTotal = isAllInclusive ? terminationMonthly * duration : 0
  const nonPassThroughOneTimeLocal = Math.max(0, oneTimeTotal - onboardingTotal)

  // Recurring monthly cost from categorized components.
  const recurringMonthly = computeRecurringMonthly({
    baseSalaryMonthly,
    statutoryMonthly,
    allowancesMonthly,
    terminationMonthly,
    overheadMonthly,
    isAllInclusive,
  })

  // Target Gracemark fee (policy) and expected bill rate.
  const appliedFeePercentage = Number.isFinite(feePercentage)
    ? (feePercentage as number)
    : GRACEMARK_FEE_PERCENTAGE
  const targetGracemarkFeeMonthly = recurringMonthly * appliedFeePercentage
  const expectedBillRateMonthly = recurringMonthly + targetGracemarkFeeMonthly

  // Actual Gracemark fee based on the current bill rate.
  const actualGracemarkFeeMonthly = billRate - recurringMonthly
  const actualGracemarkFeePercentage =
    recurringMonthly !== 0 ? actualGracemarkFeeMonthly / recurringMonthly : 0

  // Use a provider-specific fixed fee when supplied. Other providers retain
  // the existing percentage-based fallback.
  const providerFeeMonthly =
    Number.isFinite(providerFeeMonthlyOverride)
      ? Math.max(providerFeeMonthlyOverride as number, 0)
      : computeProviderFeeMonthly(actualGracemarkFeeMonthly)
  const providerFeeTotal = providerFeeMonthly * duration

  // Cash-flow totals.
  const recurringTotal = recurringMonthly * duration
  const totalCostsGracemark = recurringTotal + providerFeeTotal + oneTimeTotal
  const actualRevenueTotal = billRate * duration + onboardingTotal
  const rateDiscrepancy = billRate - expectedBillRateMonthly
  const profitLocal = actualRevenueTotal - totalCostsGracemark

  const marginMonthly = actualGracemarkFeeMonthly - providerFeeMonthly
  const marginTotal = marginMonthly * duration - nonPassThroughOneTimeLocal

  const meetsPositive = profitLocal > 0

  return {
    breakdown: Object.freeze({
      salaryTotal,
      statutoryTotal,
      allowancesTotal,
      terminationTotal,
      overheadTotal,
      oneTimeTotal,
      onboardingTotal,
      recurringMonthly,
      recurringTotal,
      providerFeeTotal,
      totalMonthlyCost: recurringMonthly + providerFeeMonthly,
    }),
    billRateComposition: Object.freeze({
      salaryMonthly: baseSalaryMonthly,
      statutoryMonthly,
      terminationMonthly: isAllInclusive ? terminationMonthly : 0,
      allowancesMonthly,
      overheadMonthly,
      gracemarkFeeMonthly: actualGracemarkFeeMonthly,
      providerFeeMonthly,
      expectedBillRate: expectedBillRateMonthly,
      actualBillRate: billRate,
      rateDiscrepancy,
      gracemarkFeePercentage: actualGracemarkFeePercentage,
      targetGracemarkFeeMonthly,
      targetGracemarkFeePercentage: appliedFeePercentage,
    }),
    summary: Object.freeze({
      billRateMonthly: billRate,
      durationMonths: duration,
      revenueTotal: actualRevenueTotal,
      totalCost: totalCostsGracemark,
      profitLocal,
      marginMonthly,
      marginTotal,
      meetsPositive,
    }),
    nonPassThroughOneTimeLocal,
    appliedFeePercentage,
  }
}

/**
 * Complete recurring employer cost = base salary + statutory + allowances +
 * local-office overhead/VAT, plus termination when all-inclusive.
 */
export function computeRecurringMonthly(input: RecurringMonthlyInput): number {
  return (
    input.baseSalaryMonthly +
    input.statutoryMonthly +
    input.allowancesMonthly +
    input.overheadMonthly +
    (input.isAllInclusive ? input.terminationMonthly : 0)
  )
}

/**
 * Provider fee = `PROVIDER_FEE_RATIO * max(actualGracemarkFeeMonthly, 0)`.
 * Negative GraceMark fees (bill rate below recurring cost) clamp to 0.
 */
export function computeProviderFeeMonthly(actualGracemarkFeeMonthly: number): number {
  return Math.max(actualGracemarkFeeMonthly, 0) * PROVIDER_FEE_RATIO
}
