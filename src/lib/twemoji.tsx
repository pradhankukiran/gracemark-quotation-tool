"use client";

/**
 * Twemoji helpers — render emoji consistently across Windows / macOS / Linux
 * by serving Twitter's open SVG set instead of relying on the OS font.
 *
 * Source: https://github.com/twitter/twemoji
 * Served via jsDelivr at a pinned version.
 */

import { useState, type CSSProperties } from "react";

const TWEMOJI_VERSION = "14.0.2";
const TWEMOJI_BASE = `https://cdn.jsdelivr.net/gh/twitter/twemoji@${TWEMOJI_VERSION}/assets/svg`;

/**
 * Build the Twemoji SVG URL for a country flag, given an ISO 3166-1 alpha-2
 * code. Returns `null` if the code is malformed.
 *
 * Country flags in Unicode are pairs of Regional Indicator Symbol letters,
 * starting at U+1F1E6 ("A"). "BR" → 1f1e7-1f1f7.svg
 */
function countryFlagUrl(alpha2: string): string | null {
  if (alpha2.length !== 2) return null;
  const A = "A".charCodeAt(0);
  const REGIONAL_INDICATOR_A = 0x1f1e6;
  const cc = alpha2.toUpperCase();
  const a = (REGIONAL_INDICATOR_A + cc.charCodeAt(0) - A).toString(16);
  const b = (REGIONAL_INDICATOR_A + cc.charCodeAt(1) - A).toString(16);
  return `${TWEMOJI_BASE}/${a}-${b}.svg`;
}

interface CountryFlagProps {
  code: string;
  width?: number;
  height?: number;
  alt?: string;
  style?: CSSProperties;
}

/**
 * Renders a country flag from Twemoji's CDN with a graceful text fallback
 * when the network fetch fails (CDN outage, blocked, offline, etc.). The
 * fallback is the uppercase alpha-2 code in a small bordered badge so the
 * layout doesn't collapse.
 */
export function CountryFlag({
  code,
  width = 20,
  height = 20,
  alt,
  style,
}: CountryFlagProps) {
  const [failed, setFailed] = useState(false);
  const url = countryFlagUrl(code);
  const cc = code.toUpperCase();

  if (!url || failed) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width,
          height,
          fontSize: Math.max(8, Math.round(height * 0.5)),
          fontWeight: 600,
          border: "1px solid #d4d4d8",
          borderRadius: 2,
          background: "#f4f4f5",
          color: "#52525b",
          ...style,
        }}
        aria-label={alt ?? `${cc} flag`}
      >
        {cc}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt ?? `${cc} flag`}
      width={width}
      height={height}
      onError={() => setFailed(true)}
      style={style}
    />
  );
}
