import type {
  ProviderQuoteResult,
  QuoteRequest,
  ValidationRules,
  FxSnapshot,
} from "@/providers/_core/types";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body?.error?.message || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function fetchValidations(
  code: string
): Promise<ValidationRules> {
  const res = await fetch(
    `/api/providers/deel/validations/${encodeURIComponent(code)}`,
    { method: "GET" }
  );
  return handle<ValidationRules>(res);
}

/**
 * Submit a quote for ONE provider × ONE country. The client fans these out in
 * parallel (N providers × M countries) so the Tabs strip can render with
 * per-tab spinners and individual results land as they complete.
 */
export async function submitProviderQuote(
  providerId: string,
  country: QuoteRequest
): Promise<ProviderQuoteResult> {
  const res = await fetch(
    `/api/providers/${encodeURIComponent(providerId)}/quote`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(country),
    }
  );
  return handle<ProviderQuoteResult>(res);
}

/**
 * Fetch a single FX snapshot for converting `from` → `to`. Returns null when
 * the two currencies are equal (no conversion needed). Throws on FX provider
 * errors — callers can degrade gracefully.
 */
export async function fetchFxRate(
  from: string,
  to: string = "USD"
): Promise<FxSnapshot | null> {
  const qs = new URLSearchParams({ from, to });
  const res = await fetch(`/api/fx/rate?${qs.toString()}`, { method: "GET" });
  const body = await handle<{ fx: FxSnapshot | null }>(res);
  return body.fx;
}
