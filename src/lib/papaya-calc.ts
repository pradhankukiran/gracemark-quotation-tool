import type {
  PapayaCostType,
  PapayaCountryEntry,
  PapayaEmployerCost,
  PapayaFrequency,
  PapayaMoney,
} from "@/data/papaya/types";
import type { CostBucket } from "@/providers/_core/types";

export interface CalculatedPapayaLine {
  name: string;
  /** Monthly amount in `quote_currency`. */
  monthly_amount: number;
  type: PapayaCostType;
  /** Original frequency from Papaya, preserved for traceability. */
  source_frequency: PapayaFrequency;
  /** Acid-test bucket (derived from `type`). */
  bucket: CostBucket;
}

/**
 * Map a Papaya cost type to its acid-test bucket. Kept alongside the
 * Papaya calculator so the bucket is set at construction time.
 */
function papayaTypeToBucket(type: PapayaCostType): CostBucket {
  switch (type) {
    case "statutory":
      return "statutory_mandatory";
    case "accrual":
      return "statutory_mandatory";
    case "termination_liability":
      return "termination_costs";
    case "mandatory_allowance":
      return "allowances_benefits";
  }
}

export interface CalculatePapayaArgs {
  entry: PapayaCountryEntry | null;
  /** In `salary_currency`. */
  annual_salary: number;
  salary_currency: string;
  /** Quote currency for this country (identical to `salary_currency` in V1). */
  quote_currency: string;
  /**
   * FX rates keyed by source currency, all targeting `quote_currency`.
   * Identity conversions (source === quote) are not present.
   */
  fx_rates: Record<string, number>;
  /** Defaults to 40 when unspecified. */
  work_hours_per_week?: number;
}

const WORKING_DAYS_PER_MONTH = 22;
const WEEKS_PER_MONTH = 52 / 12;

/** Normalize a `PapayaMoney` node's value to a monthly basis (currency preserved). */
function toMonthly(value: number, freq: PapayaFrequency | undefined, hoursPerWeek: number): number {
  switch (freq ?? "Monthly") {
    case "Monthly":
      return value;
    case "Annual":
      return value / 12;
    case "Daily":
      return value * WORKING_DAYS_PER_MONTH;
    case "Hourly":
      return value * hoursPerWeek * WEEKS_PER_MONTH;
  }
}

/**
 * Convert `amount` from `from` to `to` using `fx_rates`. Returns null when a
 * non-identity conversion is required and no rate is available.
 */
function convert(
  amount: number,
  from: string,
  to: string,
  fx_rates: Record<string, number>,
): number | null {
  if (from === to) return amount;
  const rate = fx_rates[from];
  if (rate == null || !Number.isFinite(rate) || rate <= 0) return null;
  return amount * rate;
}

/** Normalize a `PapayaMoney` to a monthly amount expressed in `to_currency`. */
function moneyToMonthlyInCurrency(
  money: PapayaMoney,
  to_currency: string,
  fx_rates: Record<string, number>,
  hoursPerWeek: number,
): number | null {
  const monthly = toMonthly(money.value, money.frequency, hoursPerWeek);
  return convert(monthly, money.currency, to_currency, fx_rates);
}

/**
 * Compute the applicable monthly salary (in `entry_currency`) for a rate-based
 * employer cost, applying any `salary_band` / `salary_cap`. Returns null when
 * an FX conversion is needed but unavailable, or when the employee's salary
 * falls below the band's `min` (line should be skipped).
 */
function applicableMonthlySalary(
  monthly_salary_in_entry_currency: number,
  cost: PapayaEmployerCost,
  entry_currency: string,
  fx_rates: Record<string, number>,
  hoursPerWeek: number,
): number | null {
  let salary = monthly_salary_in_entry_currency;

  if (cost.salary_band?.min) {
    const min = moneyToMonthlyInCurrency(
      cost.salary_band.min,
      entry_currency,
      fx_rates,
      hoursPerWeek,
    );
    if (min == null) return null;
    if (salary < min) return null;
  }

  if (cost.salary_band?.max) {
    const max = moneyToMonthlyInCurrency(
      cost.salary_band.max,
      entry_currency,
      fx_rates,
      hoursPerWeek,
    );
    if (max == null) return null;
    if (salary > max) salary = max;
  }

  if (cost.salary_cap) {
    const cap = moneyToMonthlyInCurrency(
      cost.salary_cap,
      entry_currency,
      fx_rates,
      hoursPerWeek,
    );
    if (cap == null) return null;
    if (salary > cap) salary = cap;
  }

  return salary;
}

/** Apply the line-level frequency normalization to a monthly base figure. */
function normalizeLineFrequency(
  base_amount: number,
  freq: PapayaFrequency,
  hoursPerWeek: number,
): number {
  return toMonthly(base_amount, freq, hoursPerWeek);
}

/**
 * Turn an entry's `employer_costs` into concrete monthly amounts in
 * `quote_currency`. Lines without a computable value (no rate or fixed amount,
 * missing FX, below band, or zero/negative result) are silently dropped.
 */
export function calculatePapayaCosts(args: CalculatePapayaArgs): CalculatedPapayaLine[] {
  const { entry, annual_salary, salary_currency, quote_currency, fx_rates } = args;
  if (!entry) return [];
  if (!entry.employer_costs || entry.employer_costs.length === 0) return [];

  const hoursPerWeek = args.work_hours_per_week ?? 40;
  const monthly_salary_in_salary_currency = annual_salary / 12;

  const monthly_salary_in_entry_currency = convert(
    monthly_salary_in_salary_currency,
    salary_currency,
    entry.currency,
    fx_rates,
  );

  const lines: CalculatedPapayaLine[] = [];

  for (const cost of entry.employer_costs) {
    if (cost.rate_percent == null && cost.fixed_amount == null) continue;

    let base_amount: number;
    let base_currency: string;

    if (cost.rate_percent != null) {
      if (monthly_salary_in_entry_currency == null) continue;
      const applicable = applicableMonthlySalary(
        monthly_salary_in_entry_currency,
        cost,
        entry.currency,
        fx_rates,
        hoursPerWeek,
      );
      if (applicable == null) continue;
      base_amount = applicable * (cost.rate_percent / 100);
      base_currency = entry.currency;
    } else {
      const fa = cost.fixed_amount!;
      base_amount = toMonthly(fa.value, fa.frequency, hoursPerWeek);
      base_currency = fa.currency;
    }

    const monthly_in_source = normalizeLineFrequency(base_amount, cost.frequency, hoursPerWeek);

    const monthly_in_quote = convert(monthly_in_source, base_currency, quote_currency, fx_rates);
    if (monthly_in_quote == null) continue;
    if (monthly_in_quote <= 0) continue;

    lines.push({
      name: cost.name,
      monthly_amount: monthly_in_quote,
      type: cost.type,
      source_frequency: cost.frequency,
      bucket: papayaTypeToBucket(cost.type),
    });
  }

  return lines;
}
