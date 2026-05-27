import type { CostLine, CostLineCategory } from "@/providers/_core/types";
import { inferBucket } from "@/providers/_core/buckets";
import type { LocalOfficeFormState } from "@/lib/quote-state";
import type { CalculatedPapayaLine } from "@/lib/papaya-calc";
import type { PapayaCostType } from "@/data/papaya/types";
import {
  dedupeBenefits,
  matchesBenefit,
  normalizeLineName,
  papayaLineMatchesProvider,
  type LocalOfficeBenefitKey,
} from "@/lib/cost-dedup";

/**
 * Fill in `bucket` on a provider line when missing, using `inferBucket` as
 * the fallback. Backward-compat shim for adapters that haven't migrated yet.
 * Only used on provider-emitted lines; synthesized rows set `bucket` directly.
 */
function withBucket(line: CostLine): CostLine {
  if (line.bucket) return line;
  return { ...line, bucket: inferBucket(line.category) };
}

const BENEFIT_LABELS: Record<LocalOfficeBenefitKey, string> = {
  meal_voucher: "Meal Voucher",
  transportation: "Transportation",
  wfh: "WFH",
  health_insurance: "Health Insurance",
};

const BENEFIT_KEYS: LocalOfficeBenefitKey[] = [
  "meal_voucher",
  "transportation",
  "wfh",
  "health_insurance",
];

/**
 * Map a Papaya cost type to its corresponding `CostLine.category`. The merge
 * pipeline uses this when appending Papaya lines that aren't already covered
 * by a provider or local-office source.
 */
function papayaTypeToCategory(t: PapayaCostType): CostLineCategory {
  switch (t) {
    case "statutory":
      return "statutory";
    case "accrual":
      return "accruals";
    case "termination_liability":
      return "severance";
    case "mandatory_allowance":
      return "allowances";
  }
}

/**
 * For a Papaya `mandatory_allowance`, check whether the local-office defaults
 * already include this allowance via the BENEFIT synonym map. Returns true if
 * any of the 4 benefit keys (meal_voucher, transportation, wfh,
 * health_insurance) has a non-zero local-office value AND its synonyms match
 * the Papaya line name. This prevents double-counting cases where the
 * local-office form already supplies (say) a "Meal Voucher" amount and Papaya
 * also lists a mandatory meal allowance for the same country.
 */
function papayaAllowanceMatchesLocalBenefit(
  papayaName: string,
  localOfficeValues: {
    meal_voucher?: number;
    transportation?: number;
    wfh?: number;
    health_insurance?: number;
  }
): boolean {
  const normalized = normalizeLineName(papayaName);
  if (!normalized) return false;
  for (const key of BENEFIT_KEYS) {
    const value = localOfficeValues[key] ?? 0;
    if (value === 0) continue;
    if (matchesBenefit(normalized, key)) return true;
  }
  return false;
}

/**
 * Merge provider-quoted cost lines with the local-office form state AND
 * Papaya-calculated employer cost lines into a single unified list of
 * monthly CostLines.
 *
 * Merge order:
 *   1. Provider lines (with matched ones replaced IN PLACE by the local-office
 *      Y value — same name, same category, new amount).
 *   2. Local-office benefits with NO provider match (appended as `allowances`).
 *   3. Gracemark local-office overhead (one row, `markup`).
 *   4. VAT (one row, `markup`).
 *   5. Custom monthly lines from `localOffice.custom_lines` (`allowances`).
 *   6. Papaya lines (gap-fill only — see below).
 *   7. One-time costs (provider doesn't emit these; sourced from local-office).
 *
 * Papaya gap-fill semantics (step 6):
 *   - `mandatory_allowance`: dedup against BENEFIT synonyms (local-office
 *     defaults) AND provider `allowances`. Append only if neither side
 *     already covers it.
 *   - `statutory`: dedup against provider `statutory` lines (with lumped
 *     synonyms like "social security charges" matching multiple Papaya items).
 *   - `accrual`: dedup against provider `accruals` AND `statutory` lines.
 *   - `termination_liability`: when the provider supplies a non-zero
 *     `monthly.severance_accrual` OR a `severance`-categorized line that
 *     matches the Papaya item's name, skip; otherwise gap-fill.
 *
 * Skips Papaya lines where `monthly_amount === 0`.
 *
 * When `localOffice` is undefined and there are no Papaya lines, returns
 * `providerLines` unchanged for backwards compatibility.
 */
export function mergeQuoteCostLines(args: {
  providerLines: CostLine[];
  localOffice: LocalOfficeFormState | undefined;
  papayaCosts: CalculatedPapayaLine[];
  /**
   * Provider's `monthly.severance_accrual`. When > 0, Papaya
   * `termination_liability` items are skipped wholesale (the provider is
   * already covering severance via this aggregate number rather than
   * itemized lines). Defaults to 0 when omitted.
   */
  providerMonthlySeveranceAccrual?: number;
}): CostLine[] {
  const { providerLines, localOffice, papayaCosts } = args;
  const providerMonthlySeveranceAccrual =
    args.providerMonthlySeveranceAccrual ?? 0;

  if (!localOffice) {
    // No local-office state: still need to apply Papaya gap-fill against the
    // provider lines so the Papaya integration works for legacy/no-localOffice
    // quotes too. Reuse the same Papaya pipeline on top of providerLines and
    // an empty benefits map (no local-office allowance values to match).
    if (papayaCosts.length === 0) return providerLines.map(withBucket);
    const merged = providerLines.map(withBucket);
    appendPapayaLines(merged, papayaCosts, {}, providerMonthlySeveranceAccrual);
    return merged;
  }

  const values = localOffice.values ?? {};
  const dedup = dedupeBenefits(
    providerLines,
    {
      meal_voucher: values.meal_voucher,
      transportation: values.transportation,
      wfh: values.wfh,
      health_insurance: values.health_insurance,
    },
    undefined
  );

  // Map provider-line-name -> matched benefit key (default Y wins — no overrides).
  const providerNameToKey = new Map<string, LocalOfficeBenefitKey>();
  for (const m of dedup.matches) {
    providerNameToKey.set(m.provider_line_name, m.key);
  }

  // Track which benefit keys have been consumed via a provider match (so we
  // don't also append them as standalone allowance rows).
  const consumedKeys = new Set<LocalOfficeBenefitKey>();
  // Track which benefit keys have already had the Y-swap row emitted into
  // `merged`. When a provider splits one benefit across multiple lines (e.g.
  // Rippling AR telework Connectivity + Equipment), only the FIRST line gets
  // the local-office Y value; subsequent matched lines for the same key are
  // omitted entirely to avoid showing duplicate Y-valued rows.
  const swappedKeys = new Set<LocalOfficeBenefitKey>();

  const merged: CostLine[] = [];

  // 1. Provider lines — replace matched amounts with local-office Y value.
  for (const line of providerLines) {
    const matchedKey = providerNameToKey.get(line.name);
    if (matchedKey) {
      consumedKeys.add(matchedKey);
      if (swappedKeys.has(matchedKey)) {
        // A previous provider line for this key already received the Y-swap;
        // drop this duplicate line entirely.
        continue;
      }
      swappedKeys.add(matchedKey);
      merged.push(
        withBucket({
          name: line.name,
          amount: dedup.effective_local_office_values[matchedKey],
          frequency: line.frequency,
          category: line.category,
          bucket: line.bucket,
        })
      );
    } else {
      merged.push(withBucket(line));
    }
  }

  // 2. Local-office benefits with no provider match — append as new allowances.
  for (const key of BENEFIT_KEYS) {
    if (consumedKeys.has(key)) continue;
    const amount = dedup.effective_local_office_values[key];
    if (!amount || amount === 0) continue;
    merged.push({
      name: BENEFIT_LABELS[key],
      amount,
      frequency: "monthly",
      category: "allowances",
      bucket: "allowances_benefits",
    });
  }

  // 3. Gracemark local-office overhead.
  const localOfficeOverhead = values.local_office ?? 0;
  if (localOfficeOverhead > 0) {
    merged.push({
      name: "Local office overhead",
      amount: localOfficeOverhead,
      frequency: "monthly",
      category: "markup",
      bucket: "gracemark_overhead",
    });
  }

  // 4. VAT (only when there's both a rate and an overhead base).
  const vatRate = values.vat ?? 0;
  if (vatRate > 0 && localOfficeOverhead > 0) {
    merged.push({
      name: `VAT (${vatRate}%)`,
      amount: (vatRate / 100) * localOfficeOverhead,
      frequency: "monthly",
      category: "markup",
      bucket: "gracemark_overhead",
    });
  }

  // 5. Custom monthly lines.
  for (const line of localOffice.custom_lines ?? []) {
    if (line.cadence !== "monthly") continue;
    if (!line.name || !line.name.trim()) continue;
    const amount = line.amount || 0;
    if (amount === 0) continue;
    merged.push({
      name: line.name,
      amount,
      frequency: "monthly",
      category: "allowances",
      bucket: "allowances_benefits",
    });
  }

  // 6. Papaya gap-fill lines. Dedup decisions are made against:
  //    - `merged` so far (provider + local-office mutations are visible);
  //    - the local-office benefit values for BENEFIT synonym matching.
  appendPapayaLines(
    merged,
    papayaCosts,
    {
      meal_voucher: values.meal_voucher,
      transportation: values.transportation,
      wfh: values.wfh,
      health_insurance: values.health_insurance,
    },
    providerMonthlySeveranceAccrual
  );

  // 7. One-time lines (tagged `one_time`; totals logic excludes by category).
  const preMed = values.pre_employment_med ?? 0;
  if (preMed > 0) {
    merged.push({
      name: "Pre-Employment Medical",
      amount: preMed,
      frequency: "one_time",
      category: "one_time",
      bucket: "one_time_costs",
    });
  }

  const drugTest = values.drug_test ?? 0;
  if (drugTest > 0) {
    merged.push({
      name: "Drug Test",
      amount: drugTest,
      frequency: "one_time",
      category: "one_time",
      bucket: "one_time_costs",
    });
  }

  const backgroundCheck = values.background_check ?? 0;
  if (backgroundCheck > 0) {
    merged.push({
      name: "Background Check (via Deel)",
      amount: backgroundCheck,
      frequency: "one_time",
      category: "one_time",
      bucket: "one_time_costs",
    });
  }

  for (const line of localOffice.custom_lines ?? []) {
    if (line.cadence !== "one_time") continue;
    if (!line.name || !line.name.trim()) continue;
    const amount = line.amount || 0;
    if (amount === 0) continue;
    merged.push({
      name: line.name,
      amount,
      frequency: "one_time",
      category: "one_time",
      bucket: "one_time_costs",
    });
  }

  return merged;
}

/**
 * Append Papaya-calculated lines onto `merged`, applying per-type dedup against
 * (a) provider-emitted lines already in `merged` and (b) local-office benefit
 * defaults supplied via `localOfficeBenefitValues`.
 *
 * Mutates `merged` in place. Lines with `monthly_amount === 0` are skipped.
 * Dedup is evaluated per Papaya line — when one Papaya item matches, only
 * THAT item is skipped; other items of the same type are still considered.
 *
 * `providerMonthlySeveranceAccrual` is the provider's aggregate severance
 * number. When > 0 we assume the provider's quote already covers severance
 * (even without itemized lines) and skip ALL Papaya `termination_liability`
 * items. When 0/absent, individual Papaya termination lines are still
 * dedup-checked against provider `severance` lines by name.
 */
function appendPapayaLines(
  merged: CostLine[],
  papayaCosts: CalculatedPapayaLine[],
  localOfficeBenefitValues: {
    meal_voucher?: number;
    transportation?: number;
    wfh?: number;
    health_insurance?: number;
  },
  providerMonthlySeveranceAccrual: number
): void {
  for (const line of papayaCosts) {
    if (line.monthly_amount === 0) continue;

    let skip = false;
    switch (line.type) {
      case "mandatory_allowance": {
        // Dedup against local-office BENEFIT defaults AND provider allowances.
        if (
          papayaAllowanceMatchesLocalBenefit(line.name, localOfficeBenefitValues)
        ) {
          skip = true;
        } else if (papayaLineMatchesProvider(line.name, merged, ["allowances"])) {
          skip = true;
        }
        break;
      }
      case "statutory": {
        if (papayaLineMatchesProvider(line.name, merged, ["statutory"])) {
          skip = true;
        }
        break;
      }
      case "accrual": {
        if (
          papayaLineMatchesProvider(line.name, merged, ["accruals", "statutory"])
        ) {
          skip = true;
        }
        break;
      }
      case "termination_liability": {
        if (providerMonthlySeveranceAccrual > 0) {
          skip = true;
        } else if (papayaLineMatchesProvider(line.name, merged, ["severance"])) {
          skip = true;
        }
        break;
      }
    }
    if (skip) continue;

    merged.push({
      name: line.name,
      amount: line.monthly_amount,
      frequency: "monthly",
      category: papayaTypeToCategory(line.type),
      bucket: line.bucket,
    });
  }
}
