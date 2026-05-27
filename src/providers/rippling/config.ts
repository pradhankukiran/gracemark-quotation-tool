/**
 * Single source of Rippling runtime configuration.
 *
 * Values are resolved lazily inside `getRipplingConfig()` so that importing
 * this module is side-effect free. Rippling's `get_employer_cost_breakdown`
 * endpoint is unauthenticated, so there is no token to source — only the base
 * URL is configurable.
 */

export interface RipplingConfig {
  base_url: string;
  endpoint: string;
}

const DEFAULTS = {
  base_url: "https://app.rippling.com",
  endpoint: "/api/global_expansion/api/get_employer_cost_breakdown/",
} as const;

export function getRipplingConfig(): RipplingConfig {
  return {
    base_url: process.env.RIPPLING_API_BASE_URL ?? DEFAULTS.base_url,
    endpoint: DEFAULTS.endpoint,
  };
}
