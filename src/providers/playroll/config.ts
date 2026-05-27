export interface PlayrollConfig {
  base_url: string;
}

const DEFAULTS = {
  base_url: "https://api-eor-public.dev.playroll.com",
} as const;

export function getPlayrollConfig(): PlayrollConfig {
  return {
    base_url: process.env.PLAYROLL_API_BASE_URL ?? DEFAULTS.base_url,
  };
}
