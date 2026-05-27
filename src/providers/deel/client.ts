/**
 * Typed HTTP wrapper for the Deel REST API.
 *
 * The client deliberately resolves the bearer token lazily — inside each
 * method, not at construction — so that importing this module never throws
 * when `DEEL_ORGANIZATION_TOKEN` is missing (e.g. in unit tests that mock
 * the network layer). Base URL and token are sourced from `getDeelConfig()`
 * unless the constructor was given explicit overrides.
 */

import { ProviderError } from "@/providers/_core/errors";

import { getDeelConfig } from "./config";

export interface DeelClientOptions {
  baseUrl?: string;
  token?: string;
}

type QueryValue = string | number | boolean;

function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue | undefined>
): string {
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  const trimmedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${trimmedBase}${trimmedPath}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export class DeelClient {
  private readonly baseUrlOverride: string | undefined;
  private readonly tokenOverride: string | undefined;

  constructor(opts: DeelClientOptions = {}) {
    this.baseUrlOverride = opts.baseUrl;
    this.tokenOverride = opts.token;
  }

  private resolve(): { baseUrl: string; token: string } {
    // Fast path: both overrides supplied — avoid touching env at all.
    if (this.baseUrlOverride !== undefined && this.tokenOverride !== undefined) {
      return { baseUrl: this.baseUrlOverride, token: this.tokenOverride };
    }
    const config = getDeelConfig();
    return {
      baseUrl: this.baseUrlOverride ?? config.apiBaseUrl,
      token: this.tokenOverride ?? config.token,
    };
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    init: { query?: Record<string, QueryValue | undefined>; body?: unknown }
  ): Promise<T> {
    const { baseUrl, token } = this.resolve();
    const url = buildUrl(baseUrl, path, init.query);
    const headers: Record<string, string> = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
    const requestInit: RequestInit = { method, headers };
    if (init.body !== undefined) {
      headers["Content-Type"] = "application/json";
      requestInit.body = JSON.stringify(init.body);
    }

    requestInit.signal = AbortSignal.timeout(30_000);

    let response: Response;
    try {
      response = await fetch(url, requestInit);
    } catch (err) {
      throw new ProviderError({
        kind: "upstream",
        status: 504,
        cause: err,
        message: `Deel API request to ${path} failed`,
      });
    }
    const text = await response.text();
    if (!response.ok) {
      const detail = text || response.statusText;
      throw new ProviderError({
        kind:
          response.status >= 400 && response.status < 500
            ? "invalid_input"
            : "upstream",
        status: response.status,
        cause: detail,
        message: `Deel API ${response.status} ${path}: ${detail}`,
      });
    }

    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  }

  async get<T>(
    path: string,
    query?: Record<string, QueryValue | undefined>
  ): Promise<T> {
    return this.request<T>("GET", path, { query });
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("POST", path, { body });
  }
}
