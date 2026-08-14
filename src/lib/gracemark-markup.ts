import type { CostLine } from "@/providers/_core/types";
import {
  DEFAULT_GRACEMARK_MARKUP,
  type GraceMarkMarkupConfig,
} from "@/lib/quote-state";

export interface GraceMarkMarkupResult {
  line: CostLine | null;
  monthlyAmount: number;
  /** True when a positive fixed-USD markup cannot be converted to quote currency. */
  fxUnavailable: boolean;
}

function effectiveConfig(
  config: GraceMarkMarkupConfig | null | undefined,
): GraceMarkMarkupConfig {
  return config ?? DEFAULT_GRACEMARK_MARKUP;
}

/**
 * Calculate the monthly GraceMark markup after the complete recurring
 * employer cost is known. One-time onboarding costs never enter the base.
 *
 * `quoteToUsdRate` means: 1 unit of quote currency equals this many USD.
 * A fixed USD markup is divided by that rate to produce a quote-currency row.
 */
export function calculateGraceMarkMarkup(args: {
  employerCostMonthly: number;
  config: GraceMarkMarkupConfig | null | undefined;
  quoteCurrency: string;
  quoteToUsdRate?: number | null;
}): GraceMarkMarkupResult {
  const config = effectiveConfig(args.config);
  const quoteCurrency = args.quoteCurrency.toUpperCase();

  let monthlyAmount = 0;
  let name = "GraceMark markup";

  if (config.mode === "fixed_usd") {
    const fixedUsd = Number.isFinite(config.fixed_usd)
      ? Math.max(0, config.fixed_usd)
      : 0;
    if (fixedUsd === 0) {
      return { line: null, monthlyAmount: 0, fxUnavailable: false };
    }

    const quoteToUsdRate =
      quoteCurrency === "USD" ? 1 : args.quoteToUsdRate;
    if (
      quoteToUsdRate == null ||
      !Number.isFinite(quoteToUsdRate) ||
      quoteToUsdRate <= 0
    ) {
      return { line: null, monthlyAmount: 0, fxUnavailable: true };
    }

    monthlyAmount = fixedUsd / quoteToUsdRate;
    name = `GraceMark markup (fixed ${fixedUsd} USD)`;
  } else {
    const percentage = Number.isFinite(config.percentage)
      ? Math.max(0, config.percentage)
      : 0;
    monthlyAmount = Math.max(0, args.employerCostMonthly) * (percentage / 100);
    name = `GraceMark markup (${percentage}%)`;
  }

  if (monthlyAmount <= 0) {
    return { line: null, monthlyAmount: 0, fxUnavailable: false };
  }

  return {
    line: {
      name,
      amount: monthlyAmount,
      frequency: "monthly",
      category: "markup",
      bucket: "gracemark_overhead",
    },
    monthlyAmount,
    fxUnavailable: false,
  };
}
