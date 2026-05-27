/**
 * Deel-anchored variance picker for EOR provider reconciliation.
 *
 * Given a set of priced providers and Deel's monthly total as the
 * anchor, build a band of [anchor * lowerBound, anchor * upperBound]
 * (default ±4%) and pick the highest-priced provider whose price falls
 * inside the band. Pure deterministic math, no FX, no LLM.
 */

export const RECONCILIATION_LOWER_BOUND = 0.96;
export const RECONCILIATION_UPPER_BOUND = 1.04;

export interface PricedProvider<P extends string = string> {
  provider: P;
  price: number;
}

export interface AnalyzedProvider<P extends string = string>
  extends PricedProvider<P> {
  inRange: boolean;
}

export interface VarianceResult<P extends string = string> {
  analyzed: AnalyzedProvider<P>[];
  /** Providers whose price falls inside the band (inclusive of bounds). */
  candidates: AnalyzedProvider<P>[];
  /** Highest-priced in-range provider, or null when no providers are in range. */
  winner: AnalyzedProvider<P> | null;
  lowerBound: number;
  upperBound: number;
}

export function selectVarianceWinner<P extends string>(
  prices: PricedProvider<P>[],
  deelPrice: number,
  options?: { lowerBound?: number; upperBound?: number }
): VarianceResult<P> {
  const lower = deelPrice * (options?.lowerBound ?? RECONCILIATION_LOWER_BOUND);
  const upper = deelPrice * (options?.upperBound ?? RECONCILIATION_UPPER_BOUND);
  const analyzed = prices.map((p) => ({
    ...p,
    inRange: p.price >= lower && p.price <= upper,
  }));
  const candidates = analyzed.filter((p) => p.inRange);
  const winner =
    candidates.length === 0
      ? null
      : candidates.reduce(
          (max, current) => (current.price > max.price ? current : max),
          candidates[0]
        );
  return { analyzed, candidates, winner, lowerBound: lower, upperBound: upper };
}
