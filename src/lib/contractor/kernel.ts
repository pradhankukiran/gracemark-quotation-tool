// Pure IC (Independent Contractor) bill-rate / markup math.
// No I/O, no React, no FX conversion — caller resolves currencies before calling.

import { DEFAULT_IC_MARKUP } from "./constants"
import type { ICKernelInput, ICKernelOutput } from "./types"

/**
 * Compute IC quote core values. Pure: no FX, no rounding (caller rounds at the
 * boundary). Inputs already in the same currency.
 *
 * Mirrors the math in the legacy `app/api/ic-cost/route.ts:78-99`.
 */
export function composeICQuote(input: ICKernelInput): ICKernelOutput {
  const markupRate = Number.isFinite(input.markupPercentage) && (input.markupPercentage as number) > 0
    ? (input.markupPercentage as number) / 100
    : DEFAULT_IC_MARKUP

  const mspRate = Number.isFinite(input.mspPercentage) && (input.mspPercentage as number) > 0
    ? (input.mspPercentage as number) / 100
    : 0

  const payRate = input.rateBasis === "monthly"
    ? input.rateAmount / input.workedHours
    : input.rateAmount

  const agencyFee = payRate * markupRate
  const billRate = payRate + agencyFee

  const monthlyPayRate = payRate * input.workedHours
  const monthlyBillRate = billRate * input.workedHours
  const monthlyAgencyFee = agencyFee * input.workedHours

  const mspFeeHourly = billRate * mspRate
  const mspFee = mspFeeHourly * input.workedHours

  const totalMonthlyCosts =
    monthlyPayRate + input.transactionCost + input.backgroundCheckMonthlyFee + mspFee
  const monthlyMarkup = monthlyBillRate - totalMonthlyCosts

  return {
    payRate,
    billRate,
    agencyFee,
    monthlyPayRate,
    monthlyBillRate,
    monthlyAgencyFee,
    mspFee,
    totalMonthlyCosts,
    monthlyMarkup,
  }
}
