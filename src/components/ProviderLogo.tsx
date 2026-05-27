"use client";

import { getProviderMeta } from "@/providers/_meta";

interface ProviderLogoProps {
  providerId: string;
  fallback: string;
  height?: number;
}

export function ProviderLogo({
  providerId,
  fallback,
  height = 24,
}: ProviderLogoProps) {
  const meta = getProviderMeta(providerId);
  if (!meta) {
    return <span>{fallback}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={meta.logo_src}
      alt={meta.display_name}
      style={{ height, width: "auto", display: "inline-block", verticalAlign: "middle" }}
    />
  );
}
