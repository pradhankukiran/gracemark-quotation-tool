/**
 * Single source of Oyster runtime configuration.
 *
 * Values are resolved lazily inside `getOysterConfig()` so that importing
 * this module is side-effect free. Oyster's cost-calculator GraphQL endpoint
 * is unauthenticated, so there is no token to source — only the base URL and
 * endpoint path are configurable.
 */

export interface OysterConfig {
  base_url: string;
  endpoint: string;
}

const DEFAULTS = {
  base_url: "https://app.oysterhr.com",
  endpoint: "/api/graphql/cost-calculator",
} as const;

export function getOysterConfig(): OysterConfig {
  return {
    base_url: process.env.OYSTER_API_BASE_URL ?? DEFAULTS.base_url,
    endpoint: DEFAULTS.endpoint,
  };
}
