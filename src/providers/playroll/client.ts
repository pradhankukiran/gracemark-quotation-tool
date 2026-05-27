import { ProviderError } from "@/providers/_core/errors";

import type {
  PlayrollEstimateParams,
  PlayrollEstimateRequest,
  PlayrollEstimateResponse,
} from "./types";

export interface PlayrollClientOptions {
  base_url: string;
}

export class PlayrollClient {
  private readonly base_url: string;

  constructor(opts: PlayrollClientOptions) {
    this.base_url = opts.base_url;
  }

  async getEstimate(
    params: PlayrollEstimateParams
  ): Promise<PlayrollEstimateResponse> {
    const trimmedBase = this.base_url.replace(/\/+$/, "");
    const path = "/calculator/estimate";
    const url = `${trimmedBase}${path}`;

    const body: PlayrollEstimateRequest = {
      countryCode: params.country_code,
      region: params.region,
      inputs: [
        {
          id: "grossSalary",
          frequency: "monthly",
          amount: params.monthly_salary,
          currencyCode: params.currency,
        },
      ],
      outputs: [],
      options: {},
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "gracemark-quotation-tool/1.0",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (err) {
      throw new ProviderError({
        kind: "upstream",
        status: 504,
        cause: err,
        message: `Playroll API request to ${path} failed`,
      });
    }

    const text = await response.text();

    if (response.status === 404) {
      throw new ProviderError({
        kind: "unsupported",
        status: response.status,
        cause: text || response.statusText,
        message: `Playroll API ${response.status} ${path}: ${text || response.statusText}`,
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
        message: `Playroll API ${response.status} ${path}: ${detail}`,
      });
    }

    if (!text) {
      throw new ProviderError({
        kind: "unsupported",
        message: `Playroll API returned empty body for ${path}`,
      });
    }

    try {
      return JSON.parse(text) as PlayrollEstimateResponse;
    } catch (err) {
      throw new ProviderError({
        kind: "upstream",
        cause: err,
        message: `Playroll API returned non-JSON body for ${path}`,
      });
    }
  }
}
