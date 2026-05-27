import { ProviderError } from "@/providers/_core/errors";

import type {
  PayoneerCostCalculatorParams,
  PayoneerCostCalculatorResponse,
} from "./types";

export interface PayoneerClientOptions {
  base_url: string;
}

export class PayoneerClient {
  private readonly base_url: string;

  constructor(opts: PayoneerClientOptions) {
    this.base_url = opts.base_url;
  }

  async getCostCalculator(
    params: PayoneerCostCalculatorParams
  ): Promise<PayoneerCostCalculatorResponse> {
    const trimmedBase = this.base_url.replace(/\/+$/, "");
    const query = new URLSearchParams({
      client: "website",
      countryCode: params.country_alpha3,
      currencyCode: params.currency,
      salary: String(params.annual_salary),
    });
    const path = `/cost-calculator/cost?${query.toString()}`;
    const url = `${trimmedBase}${path}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "gracemark-quotation-tool/1.0",
        },
        signal: AbortSignal.timeout(30_000),
      });
    } catch (err) {
      throw new ProviderError({
        kind: "upstream",
        status: 504,
        cause: err,
        message: `Payoneer API request to ${path} failed`,
      });
    }

    const text = await response.text();

    if (response.status === 404) {
      throw new ProviderError({
        kind: "unsupported",
        status: response.status,
        cause: text || response.statusText,
        message: `Payoneer API ${response.status} ${path}: ${text || response.statusText}`,
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
        message: `Payoneer API ${response.status} ${path}: ${detail}`,
      });
    }

    if (!text) {
      throw new ProviderError({
        kind: "unsupported",
        message: `Payoneer API returned empty body for ${path}`,
      });
    }

    let parsed: PayoneerCostCalculatorResponse;
    try {
      parsed = JSON.parse(text) as PayoneerCostCalculatorResponse;
    } catch (err) {
      throw new ProviderError({
        kind: "upstream",
        cause: err,
        message: `Payoneer API returned non-JSON body for ${path}`,
      });
    }

    if (!parsed.success || !parsed.data) {
      throw new ProviderError({
        kind: "unsupported",
        cause: parsed,
        message: `Payoneer API returned success=false for ${path}`,
      });
    }

    return parsed;
  }
}
