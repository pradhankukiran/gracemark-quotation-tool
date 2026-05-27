import type { FxSnapshot } from "@/providers/_core/types";
import { fetchPapayaMatrix } from "./papaya";

/**
 * Build an FxSnapshot for converting `from` → `target` (default USD).
 *
 * Returns `null` when `from === target` (no conversion needed; caller can
 * treat as "no FX column"). Throws on any other failure — caller decides
 * whether to degrade gracefully or surface the error.
 */
export async function getFxSnapshot(
  from: string,
  target: string = "USD"
): Promise<FxSnapshot | null> {
  const fromUp = from.toUpperCase();
  const targetUp = target.toUpperCase();
  if (fromUp === targetUp) return null;

  const matrix = await fetchPapayaMatrix();
  const fromMap = matrix.rates[fromUp];
  if (!fromMap) {
    throw new Error(`FX matrix has no entry for base currency ${fromUp}`);
  }
  const rate = fromMap[targetUp];
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`FX matrix has no usable ${fromUp} → ${targetUp} rate`);
  }
  return {
    source: "papayaglobal",
    fetched_at: matrix.fetched_at,
    base_currency: fromUp,
    target_currency: targetUp,
    rate,
  };
}
