import type { CostBucket, CostLineCategory } from "./types";

/**
 * Default mapping from category → bucket. Used as a fallback when a line
 * doesn't carry an explicit `bucket`. New lines being synthesized (e.g. in
 * `cost-merge.ts`) SHOULD set `bucket` explicitly; this helper bridges the
 * gap during the rollout of bucket tagging across adapters.
 *
 * Mappings:
 * - base_salary       → "base_salary"
 * - statutory         → "statutory_mandatory"
 * - accruals          → "statutory_mandatory"  (13th, vacation; they accrue every month)
 * - bonuses           → "statutory_mandatory"
 * - severance         → "termination_costs"
 * - allowances        → "allowances_benefits"
 * - markup            → "gracemark_overhead"
 * - one_time          → "one_time_costs"
 * - contractor_rate   → "base_salary"  (IC flow; unused in EOR — map sensibly)
 */
export function inferBucket(category: CostLineCategory): CostBucket {
  switch (category) {
    case "base_salary":
      return "base_salary";
    case "statutory":
      return "statutory_mandatory";
    case "accruals":
      return "statutory_mandatory";
    case "bonuses":
      return "statutory_mandatory";
    case "severance":
      return "termination_costs";
    case "allowances":
      return "allowances_benefits";
    case "markup":
      return "gracemark_overhead";
    case "one_time":
      return "one_time_costs";
    case "contractor_rate":
      return "base_salary";
  }
}
