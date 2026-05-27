/**
 * Typed HTTP wrapper for Oyster's cost-calculator GraphQL endpoint.
 *
 * The endpoint is unauthenticated, so there is no token plumbing. The client
 * accepts a fully-resolved `base_url` and `endpoint` at construction time and
 * does not consult the environment itself.
 */

import { ProviderError } from "@/providers/_core/errors";

export interface OysterClientOptions {
  base_url: string;
  endpoint: string;
}

export class OysterClient {
  private readonly base_url: string;
  private readonly endpoint: string;

  constructor(opts: OysterClientOptions) {
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
      "User-Agent": "gracemark-quotation-tool/1.0 (+https://gracemark.io)",
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20_000),
      });
    } catch (err) {
      throw new ProviderError({
        kind: "upstream",
        status: 504,
        cause: err,
        message: `Oyster API request to ${this.endpoint} failed`,
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
        message: `Oyster API ${response.status} ${this.endpoint}: ${detail}`,
      });
    }

    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  }
}
