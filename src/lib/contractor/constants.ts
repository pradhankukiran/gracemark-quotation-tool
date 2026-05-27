// IC (Independent Contractor) pricing constants.
// Centralized so business rules live in one place.

// Default IC markup percentage (40%). Applied to pay rate when no override
// is supplied. Stored as a 0–1 ratio (legacy parity with lib/constants.ts).
export const DEFAULT_IC_MARKUP = 0.40

// Default monthly worked hours used when the form does not provide a value.
export const DEFAULT_WORKED_HOURS = 160

// Upper bound on monthly worked hours (full-time cap).
export const MAX_WORKED_HOURS = 160

// Background check fee in USD. Caller resolves to active currency before the kernel.
export const BACKGROUND_CHECK_FEE_USD = 200

// Per-transaction processing cost in USD. Caller resolves to active currency
// before the kernel. Legacy value: $55 USD per transaction (see legacy
// `app/api/ic-cost/route.ts:7` — `TRANSACTION_COST_USD = 55`).
export const TRANSACTION_FEE_USD = 55

// Display target only — not enforced by the kernel. Mirrors the legacy
// `MIN_PROFIT_THRESHOLD_USD = 1000` floor used by EOR pricing UI.
export const NET_MARGIN_TARGET_USD = 1000
