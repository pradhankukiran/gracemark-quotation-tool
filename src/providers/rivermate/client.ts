/**
 * Typed HTTP wrapper for Rivermate's employment-costs calculator endpoint.
 *
 * The endpoint is unauthenticated and uses query-string parameters with ISO
 * alpha-3 country codes. The client accepts a fully-resolved `base_url` at
 * construction time and does not consult the environment itself.
 */

import { ProviderError } from "@/providers/_core/errors";

import type { RivermateEmploymentCostsResponse } from "./types";

export interface RivermateClientOptions {
  base_url: string;
}

export interface RivermateQuoteParams {
  /** ISO 3166-1 alpha-3 country code (e.g. "USA", "ARG", "BRA"). */
  country_alpha3: string;
  annual_salary: number;
  /** ISO 4217 currency code (e.g. "USD", "ARS", "BRL"). */
  currency: string;
}

export class RivermateClient {
  private readonly base_url: string;

  constructor(opts: RivermateClientOptions) {
    this.base_url = opts.base_url;
  }

  async getEmploymentCosts(
    params: RivermateQuoteParams
  ): Promise<RivermateEmploymentCostsResponse> {
    const trimmedBase = this.base_url.replace(/\/+$/, "");
    const query = new URLSearchParams({
      country: params.country_alpha3.toUpperCase(),
      annual_salary: String(params.annual_salary),
      currency: params.currency.toUpperCase(),
    });
    const url = `${trimmedBase}/api/calculator/employment-costs/?${query.toString()}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "gracemark-quotation-tool/1.0",
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers,
        signal: AbortSignal.timeout(30_000),
      });
    } catch (err) {
      throw new ProviderError({
        kind: "upstream",
        status: 504,
        cause: err,
        message: `Rivermate API request to /api/calculator/employment-costs/ failed`,
      });
    }

    const text = await response.text();

    // 404 → country not in Rivermate's coverage.
    if (response.status === 404) {
      throw new ProviderError({
        kind: "unsupported",
        status: response.status,
        cause: text || response.statusText,
        message: `Rivermate has no data for country=${params.country_alpha3.toUpperCase()}`,
      });
    }

    if (!response.ok) {
      const detail = text || response.statusText;
      throw new ProviderError({
        kind:
          response.status >= 400 && response.status < 500
            ? "invalid_input"
            : "upstream",
        status: response.status,
        cause: detail,
        message: `Rivermate API ${response.status}: ${detail}`,
      });
    }

    if (!text) {
      throw new ProviderError({
        kind: "unsupported",
        message: `Rivermate API returned empty body for country=${params.country_alpha3.toUpperCase()}`,
      });
    }

    return JSON.parse(text) as RivermateEmploymentCostsResponse;
  }
}
