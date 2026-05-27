/**
 * Single source of Deel runtime configuration.
 *
 * Values are resolved lazily inside `getDeelConfig()` so that importing this
 * module is side-effect free — tests can stub `process.env` before any call,
 * and missing env vars do not blow up at import time.
 */

export interface DeelConfig {
  apiBaseUrl: string;
  token: string;
  teamId: string;
  legalEntityId: string;
}

const DEFAULTS = {
  apiBaseUrl: "https://api.letsdeel.com/rest/v2",
  teamId: "d0175e84-456e-4287-ac83-54501dc1e64c",
  legalEntityId: "6646f7e1-7bb1-4e95-b4bf-f94a532f8753",
} as const;

/**
 * Reads Deel runtime configuration from `process.env` at call time.
 * `DEEL_ORGANIZATION_TOKEN` is required; the remaining values fall back to
 * the organization defaults baked in here when their env vars are not set.
 */
export function getDeelConfig(): DeelConfig {
  const token = process.env.DEEL_ORGANIZATION_TOKEN;
  if (!token) {
    throw new Error(
      "DEEL_ORGANIZATION_TOKEN is not set. Add it to .env.local."
    );
  }
  return {
    apiBaseUrl: process.env.DEEL_API_BASE_URL ?? DEFAULTS.apiBaseUrl,
    token,
    teamId: process.env.DEEL_TEAM_ID ?? DEFAULTS.teamId,
    legalEntityId: process.env.DEEL_LEGAL_ENTITY_ID ?? DEFAULTS.legalEntityId,
  };
}
