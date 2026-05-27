export interface PayoneerConfig {
  base_url: string;
}

const DEFAULTS = {
  base_url: "https://cost-calculator.skuad.io",
} as const;

export function getPayoneerConfig(): PayoneerConfig {
  return {
    base_url: process.env.PAYONEER_API_BASE_URL ?? DEFAULTS.base_url,
  };
}
