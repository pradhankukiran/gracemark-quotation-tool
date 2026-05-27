/**
 * Single source of Pebl runtime configuration.
 *
 * Values are resolved lazily inside `getPeblConfig()` so that importing this
 * module is side-effect free. Pebl's country_calculator endpoint is
 * unauthenticated, so there is no token to source — only the base URL is
 * configurable (override via `PEBL_API_BASE_URL`).
 */

export interface PeblConfig {
  base_url: string;
}

const DEFAULTS = {
  base_url: "https://hellopebl.com",
} as const;

export function getPeblConfig(): PeblConfig {
  return {
    base_url: process.env.PEBL_API_BASE_URL ?? DEFAULTS.base_url,
  };
}
