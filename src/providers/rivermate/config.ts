/**
 * Single source of Rivermate runtime configuration.
 *
 * Values are resolved lazily inside `getRivermateConfig()` so importing this
 * module is side-effect free. Rivermate's employment-costs calculator is
 * unauthenticated (calculator-endpoint style, like Oyster/Rippling/Pebl) —
 * only the base URL is configurable (override via `RIVERMATE_API_BASE_URL`).
 */

export interface RivermateConfig {
  base_url: string;
}

const DEFAULTS = {
  base_url: "https://api.rivermate.com",
} as const;

export function getRivermateConfig(): RivermateConfig {
  return {
    base_url: process.env.RIVERMATE_API_BASE_URL ?? DEFAULTS.base_url,
  };
}
