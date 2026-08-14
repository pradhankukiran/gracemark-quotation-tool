// Public type surface for the Acid Test kernel. The canonical names mirror
// the legacy app (AcidTestCompose*); the shorter aliases at the bottom are
// re-exports for callers that prefer the convenience names.

export interface AcidTestComposeInput {
  /** Already-resolved monthly base salary in the local currency. */
  baseSalaryMonthly: number
  /** Already-resolved monthly statutory cost in the local currency. */
  statutoryMonthly: number
  /** Already-resolved monthly allowances in the local currency. */
  allowancesMonthly: number
  /** Already-resolved monthly termination accrual in the local currency. */
  terminationMonthly: number
  /** Monthly local-office overhead and VAT in the local currency. */
  overheadMonthly: number
  /** Total onboarding cost in the local currency (one-time, pass-through). */
  onboardingTotal: number
  /** Total of all one-time costs in the local currency (includes onboarding). */
  oneTimeTotal: number
  /** Monthly bill rate in the local currency. */
  billRate: number
  /** Contract duration in months. */
  duration: number
  /** When true, termination accrual is included in recurring monthly cost. */
  isAllInclusive: boolean
  /** GraceMark target fee as a fraction (e.g. 0.45). Falls back to GRACEMARK_FEE_PERCENTAGE if non-finite. */
  feePercentage?: number
}

export interface AcidTestComposeBreakdown {
  salaryTotal: number
  statutoryTotal: number
  allowancesTotal: number
  /** Zero when `isAllInclusive` is false. */
  terminationTotal: number
  overheadTotal: number
  oneTimeTotal: number
  onboardingTotal: number
  /** Complete recurring employer cost before GraceMark markup and provider fee. */
  recurringMonthly: number
  recurringTotal: number
  providerFeeTotal: number
  /** Complete monthly cost including the provider fee. */
  totalMonthlyCost: number
}

export interface AcidTestComposeBillRateComposition {
  salaryMonthly: number
  statutoryMonthly: number
  /** Zero when `isAllInclusive` is false. */
  terminationMonthly: number
  allowancesMonthly: number
  overheadMonthly: number
  /** Actual GraceMark fee derived from `billRate - recurringMonthly`. */
  gracemarkFeeMonthly: number
  providerFeeMonthly: number
  /** `recurringMonthly + targetGracemarkFeeMonthly`. */
  expectedBillRate: number
  /** Echoes the input `billRate`. */
  actualBillRate: number
  /** `billRate - expectedBillRate`. */
  rateDiscrepancy: number
  /** Actual fee as a fraction of recurringMonthly (0 when recurringMonthly is 0). */
  gracemarkFeePercentage: number
  targetGracemarkFeeMonthly: number
  /** The applied target fee fraction (after the GRACEMARK_FEE_PERCENTAGE fallback). */
  targetGracemarkFeePercentage: number
}

export interface AcidTestComposeSummary {
  billRateMonthly: number
  durationMonths: number
  /** `billRate * duration + onboardingTotal`. */
  revenueTotal: number
  /** `recurringTotal + providerFeeTotal + oneTimeTotal`. */
  totalCost: number
  /** `revenueTotal - totalCost`, in local currency. */
  profitLocal: number
  /** Monthly net margin after the provider fee. */
  marginMonthly: number
  /** `marginMonthly * duration - nonPassThroughOneTimeLocal`. */
  marginTotal: number
  /** `profitLocal > 0`. The USD minimum check is layered on by the wrapper. */
  meetsPositive: boolean
}

export interface AcidTestComposeOutput {
  breakdown: AcidTestComposeBreakdown
  billRateComposition: AcidTestComposeBillRateComposition
  summary: AcidTestComposeSummary
  /** `max(0, oneTimeTotal - onboardingTotal)`. Exposed so the wrapper can reuse it for the USD margin. */
  nonPassThroughOneTimeLocal: number
  /** The fee fraction that was actually applied (after the non-finite fallback). */
  appliedFeePercentage: number
}

/** Input shape for `computeRecurringMonthly`. */
export interface RecurringMonthlyInput {
  baseSalaryMonthly: number
  statutoryMonthly: number
  allowancesMonthly: number
  terminationMonthly: number
  overheadMonthly: number
  isAllInclusive: boolean
}

// Convenience aliases — same shapes, shorter names. Use whichever feels
// more natural in the caller; both refer to the identical interface.
export type AcidTestInput = AcidTestComposeInput
export type AcidTestBreakdown = AcidTestComposeBreakdown
export type BillRateComposition = AcidTestComposeBillRateComposition
export type AcidTestSummary = AcidTestComposeSummary
export type AcidTestResult = AcidTestComposeOutput
