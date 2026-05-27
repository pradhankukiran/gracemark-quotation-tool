/**
 * Raw Papaya Global FX matrix scraper. Server-only.
 *
 * Fetches the public Papaya cost-calculator page, extracts the embedded
 * `window.rpReactPluginCC` JSON via regex, and returns the conversion matrix.
 *
 * Throws if the network call fails or the markup changes shape (Papaya could
 * rename their global, change the script structure, etc.). Callers should
 * catch and degrade gracefully (return quotes without USD column).
 */

export interface PapayaFxMatrix {
  /** rates[from][to] = how many "to" units per 1 "from" unit. */
  rates: Record<string, Record<string, number>>;
  /** Our fetch timestamp (Papaya doesn't expose their update time). */
  fetched_at: string;
}

const PAPAYA_URL = "https://www.papayaglobal.com/cost-calculator/";
const ASSIGNMENT_REGEX = /window\.rpReactPluginCC\s*=\s*/;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36";

/**
 * Find the JSON object literal assigned to `window.rpReactPluginCC` and
 * return its source text. Anchored to the assignment variable name (not to
 * `};</script>`) and uses brace-balanced scanning, so unrelated `};</script>`
 * sequences earlier in the document don't confuse extraction.
 */
function extractAssignedObject(html: string): string {
  const match = ASSIGNMENT_REGEX.exec(html);
  if (!match) {
    throw new Error(
      "Papaya FX: `window.rpReactPluginCC` assignment not found in HTML (markup may have changed)"
    );
  }
  const start = html.indexOf("{", match.index + match[0].length);
  if (start === -1) {
    throw new Error(
      "Papaya FX: opening `{` not found after `window.rpReactPluginCC` assignment"
    );
  }
  let depth = 0;
  let inString: '"' | "'" | null = null;
  let escape = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return html.slice(start, i + 1);
      }
    }
  }
  throw new Error(
    "Papaya FX: unbalanced braces in `window.rpReactPluginCC` payload"
  );
}

async function scrapePapayaMatrix(): Promise<PapayaFxMatrix> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s, matches curl --max-time

  try {
    const res = await fetch(PAPAYA_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      // Disable Next.js fetch caching — we explicitly want fresh data every time.
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Papaya FX page returned ${res.status}`);
    }
    const html = await res.text();
    const source = extractAssignedObject(html);
    const parsed = JSON.parse(source) as {
      data?: Record<string, Record<string, number>>;
    };
    if (!("data" in parsed) || parsed.data === undefined || parsed.data === null) {
      throw new Error(
        "Papaya FX: `data` field is missing from `window.rpReactPluginCC` payload"
      );
    }
    if (typeof parsed.data !== "object" || Array.isArray(parsed.data)) {
      throw new Error(
        `Papaya FX: \`data\` field is not an object (got ${Array.isArray(parsed.data) ? "array" : typeof parsed.data})`
      );
    }
    return {
      rates: parsed.data,
      fetched_at: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Module-level in-memory cache. Scoped to the Node process — survives across
 * requests, resets on cold start / HMR. If the scrape throws, we do NOT cache
 * the error, and we do NOT serve stale data; the next call retries fresh.
 */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cached: { matrix: PapayaFxMatrix; cached_at: number } | null = null;

export async function fetchPapayaMatrix(): Promise<PapayaFxMatrix> {
  if (cached && Date.now() - cached.cached_at < CACHE_TTL_MS) {
    return cached.matrix;
  }
  const matrix = await scrapePapayaMatrix();
  cached = { matrix, cached_at: Date.now() };
  return matrix;
}
