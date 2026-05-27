/**
 * Typed HTTP wrapper for Pebl's country_calculator REST endpoint.
 *
 * The endpoint is unauthenticated and returns a JSON:API payload with a
 * doubly-nested `data.attributes.data.attributes` shape. The client accepts a
 * fully-resolved `base_url` at construction time and does not consult the
 * environment itself.
 */

import { ProviderError } from "@/providers/_core/errors";

import type {
  PeblCountryCalculatorResponse,
  PeblInnerAttributes,
} from "./types";

export interface PeblClientOptions {
  base_url: string;
}

export interface PeblQuoteParams {
  country_code: string;
  currency_in: string;
  currency_out: string;
  annual_salary: number;
}

export class PeblClient {
  private readonly base_url: string;

  constructor(opts: PeblClientOptions) {
    this.base_url = opts.base_url;
  }

  async getCountryCalculator(
    params: PeblQuoteParams
  ): Promise<PeblCountryCalculatorResponse> {
    const trimmedBase = this.base_url.replace(/\/+$/, "");
    const path = `/api/country_calculator/results/${encodeURIComponent(
      params.country_code
    )}/${encodeURIComponent(params.currency_in)}/${encodeURIComponent(
      params.currency_out
    )}/${encodeURIComponent(String(params.annual_salary))}`;
    const url = `${trimmedBase}${path}`;

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
        message: `Pebl API request to ${path} failed`,
      });
    }

    const text = await response.text();

    // 404 (or other 4xx that signals "we don't have this country") → unsupported
    if (response.status === 404) {
      throw new ProviderError({
        kind: "unsupported",
        status: response.status,
        cause: text || response.statusText,
        message: `Pebl API ${response.status} ${path}: ${
          text || response.statusText
        }`,
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
        message: `Pebl API ${response.status} ${path}: ${detail}`,
      });
    }

    if (!text) {
      throw new ProviderError({
        kind: "unsupported",
        message: `Pebl API returned empty body for ${path}`,
      });
    }

    return JSON.parse(text) as PeblCountryCalculatorResponse;
  }
}

/**
 * Drill into the doubly-nested JSON:API payload and return the inner
 * `attributes` block that carries the actual calculator data. Throws
 * `ProviderError({ kind: "unsupported" })` when the expected nesting is
 * missing (e.g. the endpoint returned an empty wrapper for an unsupported
 * country).
 */
export function extractInnerAttributes(
  response: PeblCountryCalculatorResponse
): PeblInnerAttributes {
  const inner = response?.data?.attributes?.data?.attributes;
  if (!inner) {
    throw new ProviderError({
      kind: "unsupported",
      cause: response,
      message: "Pebl response missing data.attributes.data.attributes",
    });
  }
  return inner;
}
