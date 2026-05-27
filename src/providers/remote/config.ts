/**
 * Single source of Remote runtime configuration.
 *
 * Values are resolved lazily inside `getRemoteConfig()` so that importing
 * this module is side-effect free — tests can stub `process.env` before any
 * call, and a missing API token does not blow up at import time.
 */

export interface RemoteConfig {
  apiBaseUrl: string;
  token: string;
}

const DEFAULTS = {
  apiBaseUrl: "https://gateway.remote.com",
} as const;

/**
 * Reads Remote runtime configuration from `process.env` at call time.
 * `REMOTE_API_TOKEN` is required; the base URL falls back to the
 * production gateway when `REMOTE_API_BASE_URL` is not set.
 */
export function getRemoteConfig(): RemoteConfig {
  const token = process.env.REMOTE_API_TOKEN;
  if (!token) {
    throw new Error("REMOTE_API_TOKEN is not set. Add it to .env.local.");
  }
  return {
    apiBaseUrl: process.env.REMOTE_API_BASE_URL ?? DEFAULTS.apiBaseUrl,
    token,
  };
}
