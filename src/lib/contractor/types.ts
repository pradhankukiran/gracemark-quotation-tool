// IC (Independent Contractor) types — ported verbatim from legacy
// `lib/shared/types/index.ts`. Legacy names are the canonical exports so
// kernel signatures match byte-for-byte; `Contractor*` aliases provided for
// new code that prefers the longer names.

// IC (Independent Contractor) Form Data Interface
export interface ICFormData {
  contractorName: string
  country: string
  state: string
  currency: string
  displayInUSD: boolean // Toggle to display amounts in USD instead of local currency
  rateBasis: "hourly" | "monthly"
  rateAmount: string
  totalMonthlyHours: string // Total hours worked per month (defaults to 160)
  markupPercentage: string // Agency markup percentage applied to pay rate
  paymentFrequency: string
  contractDuration: string
  contractDurationUnit: "months" | "years"
  complianceLevel: string // Kept for backward compatibility with stored data
  backgroundCheckRequired: boolean
  mspPercentage: string // MSP fee percentage applied to the bill rate
  backgroundCheckMonthlyFee: string // Amortized background check fee in local currency
  transactionCostPerTransaction: string // Local currency transaction cost per payment
  transactionCostMonthly: string // Local currency transaction cost per month
}

// IC Quote Result Interface
export interface ICQuoteResult {
  payRate: number // Hourly pay rate
  billRate: number // Hourly bill rate
  monthlyPayRate: number // Monthly pay amount (pay rate × hours)
  monthlyBillRate: number // Monthly bill amount (bill rate × hours)
  agencyFee: number // Hourly agency/markup fee
  monthlyAgencyFee: number // Monthly agency/markup fee
  transactionCost: number // $55 × number of transactions per month
  mspFee: number // Monthly MSP fee (derived from bill rate × MSP %)
  backgroundCheckMonthlyFee: number // Amortized background check fee in local currency
  platformFee: number // Additional platform cost (if any)
  monthlyMarkup: number // Bill rate minus total monthly costs
  netMargin: number // Net margin expressed in USD
  workedHours: number // Hours assumed per month (defaults to 160)
  transactionsPerMonth: number // Based on payment frequency
}

// IC Validation Errors
export interface ICValidationErrors {
  contractorName: string | null
  country: string | null
  rateAmount: string | null
  contractDuration: string | null
  complianceLevel: string | null
}

// IC API Request/Response
export interface ICQuoteRequest {
  formData: ICFormData
  currency: string
}

export interface ICQuoteResponse {
  success: boolean
  data?: ICQuoteResult
  error?: string
}

// Kernel input — all monetary values already resolved to the active currency
// by the caller. The kernel performs no FX conversion.
export interface ICKernelInput {
  /** Pay rate in the active currency. Hourly OR monthly. */
  rateAmount: number
  /** "hourly" or "monthly" — determines whether `rateAmount` is divided by `workedHours`. */
  rateBasis: "hourly" | "monthly"
  /** Hours worked per month. Use 160 for a full-time default. */
  workedHours: number
  /** 0–100 (e.g. 40 for 40% markup). Falls back to `DEFAULT_IC_MARKUP` if missing/invalid. */
  markupPercentage?: number
  /** 0–50 (e.g. 5 for 5% MSP). Defaults to 0 when missing/invalid. */
  mspPercentage?: number
  /** Already-resolved monthly transaction cost in the active currency. */
  transactionCost: number
  /** Already-resolved monthly background-check amortization in the active currency. */
  backgroundCheckMonthlyFee: number
}

// Kernel output — bare math, no rounding (caller rounds at the boundary).
export interface ICKernelOutput {
  payRate: number
  billRate: number
  agencyFee: number
  monthlyPayRate: number
  monthlyBillRate: number
  monthlyAgencyFee: number
  mspFee: number
  totalMonthlyCosts: number
  monthlyMarkup: number
}

// Optional `Contractor*` aliases for code that prefers the longer names.
export type ContractorFormData = ICFormData
export type ContractorQuoteResult = ICQuoteResult
export type ContractorQuoteRequest = ICQuoteRequest
export type ContractorQuoteResponse = ICQuoteResponse
export type ContractorValidationErrors = ICValidationErrors
export type ContractorKernelInput = ICKernelInput
export type ContractorKernelOutput = ICKernelOutput
