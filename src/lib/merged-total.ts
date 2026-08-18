/**
 * Pure, hook-free computation of the merged monthly total that
 * `ProviderQuoteCard` displays for a single provider × country cell.
 *
 * Lifted verbatim from `CountryColumnBody` in
 * `src/components/eor/ProviderQuoteCard.tsx` so the reconciliation flow can
 * compute the same headline number for every provider in a loop, without
 * mounting a React component or calling any hooks.
 *
 * The merge pipeline (`mergeQuoteCostLines`) already encodes the provider,
 * local-office, Papaya, and GraceMark fallback logic; this helper layers on:
 *   - the bucket-aware `isIncludedInTotal` predicate (drops `one_time_costs`
 *     always; drops `termination_costs` unless `quoteType === "all_inclusive"`)
 *   - the monthly-view normalization that amortizes annual rows to /12 and
 *     leaves monthly rows untouched (one-time rows are excluded from totals).
 *
 * Callers MUST supply the same `papayaLines` they would otherwise get from
 * `usePapayaCosts(...)` — i.e. the FX-resolved `CalculatedPapayaLine[]`. Pass
 * `[]` when Papaya is unavailable or still loading; the result will reflect
 * that gap (totals lower until Papaya lands), which matches how the card
 * renders during the same loading window.
 */

import type { CostLine, NormalizedQuote } from "@/providers/_core/types";
import { inferBucket } from "@/providers/_core/buckets";
import type { LocalOfficeFormState } from "@/lib/quote-state";
import { mergeQuoteCostLines } from "@/lib/cost-merge";
import { calculateGraceMarkMarkup } from "@/lib/gracemark-markup";
import { calculateGraceMarkSeveranceLine } from "@/lib/gracemark-severance";
import type { CalculatedPapayaLine } from "@/lib/papaya-calc";

/**
 * Cost-basis mode for the reconciliation run. Mirrors `EorQuoteType` from
 * `quote-state.ts` but re-exported here under a domain-specific name so
 * call sites in the reconciliation flow read naturally.
 *
 * - `"recurring_only"` — recurring monthly total; termination costs are
 *   EXCLUDED. Matches the card's "Statutory" toggle position.
 * - `"all_inclusive"` — termination costs (severance, notice pay) are
 *   amortized into the monthly total. Matches the "All-inclusive" toggle.
 *
 * One-time costs (pre-employment medical, drug test, BG check) are always
 * excluded from the monthly total in both modes — they're hire-time costs.
 */
export type QuoteCostBasis = "recurring_only" | "all_inclusive";

export interface ComputeMergedTotalArgs {
  /** The provider's normalized quote (cost lines, monthly summary). */
  quote: NormalizedQuote;
  /**
   * Local-office form state for this country slot. `null`/`undefined` when
   * the saved quote predates local-office support (legacy) — `mergeQuoteCostLines`
   * handles the undefined case by skipping the local-office synthesis pass.
   */
  localOffice: LocalOfficeFormState | null | undefined;
  /**
   * FX-resolved Papaya employer-cost lines for this country, exactly as
   * returned by `usePapayaCosts(...).lines`. Pass `[]` when unavailable, still
   * loading, or for countries that have no Papaya entry — `mergeQuoteCostLines`
   * is a no-op for the Papaya step in that case.
   */
  papayaLines: CalculatedPapayaLine[];
  /** Bucket-model display mode (drives termination-cost inclusion). */
  quoteType: QuoteCostBasis;
  /** FX rate where 1 unit of quote currency equals this many USD. */
  quoteToUsdRate?: number | null;
}

export interface ComputeMergedTotalResult {
  /**
   * The merged monthly total in the quote's currency. Equals exactly the
   * number rendered by the card's `CountryColumnHeader` when `view="monthly"`.
   */
  monthlyTotal: number;
  /** The same recurring total expressed for a 12-month annual view. */
  annualTotal: number;
  /**
   * Lines visible in the table for this `quoteType`. Mirrors the card's
   * `visibleLines` filter: keeps one-time rows (informational at-hire costs);
   * drops `termination_costs` rows unless `quoteType === "all_inclusive"`.
   */
  visibleLines: CostLine[];
  /** Lines which contribute to the recurring total. */
  includedLines: CostLine[];
  /** All merged lines BEFORE the bucket filter (for debugging / drill-down). */
  allLines: CostLine[];
  /** True when a positive fixed-USD markup is waiting on FX conversion. */
  markupFxUnavailable: boolean;
  /** True when at least one displayed line is excluded from the total. */
  hasExcludedLines: boolean;
}

/**
 * Same predicate the card uses inline to decide whether a row contributes
 * to the monthly total. Drops `one_time_costs` always; drops
 * `termination_costs` unless we're in `all_inclusive` mode.
 *
 * Falls back to `inferBucket(category)` when a line lacks an explicit
 * `bucket` tag (legacy adapters during the bucket rollout).
 */
function isIncludedInTotal(row: CostLine, quoteType: QuoteCostBasis): boolean {
  const bucket = row.bucket ?? inferBucket(row.category);
  if (bucket === "one_time_costs") return false;
  if (bucket === "termination_costs" && quoteType !== "all_inclusive") return false;
  return true;
}

/**
 * Row-visibility predicate (separate from `isIncludedInTotal`): one-time rows
 * stay VISIBLE in the table even though they're excluded from the total;
 * termination rows are hidden unless `all_inclusive`. Mirrors the card.
 */
function isVisibleInTable(row: CostLine, quoteType: QuoteCostBasis): boolean {
  const bucket = row.bucket ?? inferBucket(row.category);
  if (bucket === "termination_costs" && quoteType !== "all_inclusive") return false;
  return true;
}

/**
 * Per-line monthly amount, matching the card's `normalizeLine(_, "monthly")`
 * branch. One-time rows would normally pass through unchanged, but they're
 * filtered out upstream by `isIncludedInTotal` before this is called for the
 * total math — included here purely for completeness.
 */
function monthlyAmount(line: CostLine): number {
  if (line.category === "one_time") return line.amount;
  if (line.frequency === "annual") return line.amount / 12;
  return line.amount;
}

export function computeMergedMonthlyTotal(
  args: ComputeMergedTotalArgs
): ComputeMergedTotalResult {
  const { quote, localOffice, papayaLines, quoteType, quoteToUsdRate } = args;

  const employerCostLines = mergeQuoteCostLines({
    providerLines: quote.cost_lines,
    localOffice: localOffice ?? undefined,
    papayaCosts: papayaLines,
    providerMonthlySeveranceAccrual: quote.monthly.severance_accrual,
    graceMarkSeveranceFallback: calculateGraceMarkSeveranceLine({
      countryCode: quote.request.country_code,
      annualSalary: quote.request.annual_salary,
    }),
  });

  const employerCostMonthly = employerCostLines
    .filter((line) => isIncludedInTotal(line, quoteType))
    .reduce((sum, line) => sum + monthlyAmount(line), 0);

  const markup = calculateGraceMarkMarkup({
    employerCostMonthly,
    config: localOffice?.markup,
    quoteCurrency: quote.currency,
    quoteToUsdRate,
  });

  const allLines = markup.line
    ? [...employerCostLines, markup.line]
    : employerCostLines;
  const includedLines = allLines.filter((line) =>
    isIncludedInTotal(line, quoteType),
  );
  const visibleLines = allLines.filter((line) =>
    isVisibleInTable(line, quoteType),
  );

  const monthlyTotal = includedLines
    .reduce((sum, line) => sum + monthlyAmount(line), 0);

  return {
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    visibleLines,
    includedLines,
    allLines,
    markupFxUnavailable: markup.fxUnavailable,
    hasExcludedLines: allLines.some(
      (line) => !isIncludedInTotal(line, quoteType),
    ),
  };
}
