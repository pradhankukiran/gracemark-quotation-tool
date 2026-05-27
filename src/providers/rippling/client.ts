/**
 * Typed HTTP wrapper for Rippling's `get_employer_cost_breakdown` endpoint.
 *
 * The endpoint is unauthenticated, so there is no token plumbing. The client
 * accepts a fully-resolved `base_url` and `endpoint` at construction time and
 * does not consult the environment itself.
 */

import { ProviderError } from "@/providers/_core/errors";

export interface RipplingClientOptions {
  base_url: string;
  endpoint: string;
}

export class RipplingClient {
  private readonly base_url: string;
  private readonly endpoint: string;

  constructor(opts: RipplingClientOptions) {
    this.base_url = opts.base_url;
    this.endpoint = opts.endpoint;
  }

  async post<T>(body: object): Promise<T> {
    const trimmedBase = this.base_url.replace(/\/+$/, "");
    const trimmedPath = this.endpoint.startsWith("/")
      ? this.endpoint
      : `/${this.endpoint}`;
    const url = `${trimmedBase}${trimmedPath}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "gracemark-quotation-tool/1.0",
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (err) {
      throw new ProviderError({
        kind: "upstream",
        status: 504,
        cause: err,
        message: `Rippling API request to ${this.endpoint} failed`,
      });
    }

    const text = await response.text();
    if (!response.ok) {
      const detail = text || response.statusText;

      // Rippling's `get_employer_cost_breakdown` returns HTTP 400 with the
      // body `{"error":"Exception occurred while getting PayrollCountryHelper
      // for country XX: "}` whenever it has no payroll module for the
      // requested country (observed for US, GB, CA, AU, IN, FR, ...). This is
      // a country-coverage gap, not a malformed request, so surface it as
      // `unsupported` with a human-readable message instead of leaking the
      // cryptic upstream text as `invalid_input`.
      const payrollHelperMatch = detail.match(
        /PayrollCountryHelper for country\s+([A-Z]{2})/i
      );
      if (payrollHelperMatch) {
        const code = payrollHelperMatch[1].toUpperCase();
        throw new ProviderError({
          kind: "unsupported",
          status: response.status,
          cause: detail,
          message: `Rippling does not support employer cost calculation for ${code}.`,
        });
      }

      throw new ProviderError({
        kind:
          response.status >= 400 && response.status < 500
            ? "invalid_input"
            : "upstream",
        status: response.status,
        cause: detail,
        message: `Rippling API ${response.status} ${this.endpoint}: ${detail}`,
      });
    }

    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  }
}
