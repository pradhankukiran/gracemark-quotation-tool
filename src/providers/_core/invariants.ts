/**
 * Runtime invariants for normalized provider quotes. Adapters call
 * `assertQuoteInvariants` immediately before returning so arithmetic drift
 * surfaces as a structured `ProviderError` rather than as a silently-wrong UI.
 */

import { ProviderError } from "./errors";
import type { NormalizedQuote } from "./types";

const TOLERANCE = 1;

/**
 * Verify the monthly total reconciles with its components:
 *
 *   sum(cost_lines monthly amounts)
 *   + sum(cost_lines annual amounts) / 12
 *   + monthly.severance_accrual
 *   ≈ monthly.total                    (within ±1 unit)
 *
 * Severance accrual is intentionally excluded from `cost_lines`, so we add
 * it back here.
 */
export function assertQuoteInvariants(quote: NormalizedQuote): void {
  let monthlyLineSum = 0;
  let annualLineSum = 0;
  for (const line of quote.cost_lines) {
    if (line.frequency === "monthly") {
      monthlyLineSum += line.amount;
    } else if (line.frequency === "annual") {
      annualLineSum += line.amount;
    }
  }

  const reconstructed =
    monthlyLineSum +
    annualLineSum / 12 +
    quote.monthly.severance_accrual;
  const diff = Math.abs(reconstructed - quote.monthly.total);

  if (diff > TOLERANCE) {
    throw new ProviderError({
      kind: "unknown",
      cause: {
        quote,
        diagnostic: {
          reconstructed,
          declared_total: quote.monthly.total,
          diff,
          monthly_line_sum: monthlyLineSum,
          annual_line_sum: annualLineSum,
          severance_accrual: quote.monthly.severance_accrual,
        },
      },
      message: `Quote invariant failed for ${quote.provider}: reconstructed ${reconstructed} vs total ${quote.monthly.total} (diff ${diff})`,
    });
  }
}
