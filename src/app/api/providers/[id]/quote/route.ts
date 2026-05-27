import { NextResponse } from "next/server";
import { z } from "zod";
import { ProviderError } from "@/providers/_core/errors";
import "@/providers/_core/register-all";
import { getProvider } from "@/providers/_core/registry";
import type {
  ProviderOutcome,
  ProviderQuoteResult,
} from "@/providers/_core/types";

const QuoteRequestSchema = z.object({
  country_code: z
    .string()
    .regex(/^[A-Z]{2}$/, "country_code must be 2 uppercase letters"),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, "currency must be a 3-letter ISO code"),
  annual_salary: z.number().positive(),
  state: z.string().optional().nullable(),
  employment_type: z.enum(["Full-time", "Part-time"]).optional(),
  work_hours_per_week: z.number().min(1).max(168).optional(),
  work_visa: z.boolean().optional(),
});

/**
 * Classify a rejected provider error into a `ProviderOutcome`. Prefers the
 * structured `ProviderError.kind`; falls back to regex parsing for legacy
 * non-ProviderError throws.
 */
function classifyError(err: unknown): Exclude<ProviderOutcome, "ok" | "loading"> {
  if (err instanceof ProviderError) {
    if (err.kind === "unsupported") return "unsupported";
    if (err.kind === "invalid_input") return "invalid_input";
    return "error";
  }
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "Unknown error";
  if (/not supported|unsupported|no eor/i.test(message)) {
    return "unsupported";
  }
  if (/below|above|minimum|maximum|range|invalid input|400/i.test(message)) {
    return "invalid_input";
  }
  return "error";
}

function extractStatus(err: unknown): number | undefined {
  if (err instanceof ProviderError) {
    return err.status;
  }
  if (typeof err === "object" && err !== null && "status" in err) {
    const status = (err as { status: unknown }).status;
    if (typeof status === "number") {
      return status;
    }
  }
  return undefined;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Request body must be valid JSON" } },
      { status: 400 }
    );
  }

  const parsed = QuoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          message: "Invalid request body",
          issues: parsed.error.issues,
        },
      },
      { status: 400 }
    );
  }

  let provider;
  try {
    provider = getProvider(id);
  } catch {
    return NextResponse.json(
      { error: { message: `Provider "${id}" is not registered` } },
      { status: 404 }
    );
  }

  let result: ProviderQuoteResult;
  try {
    const quote = await provider.quote(parsed.data);
    result = {
      provider_id: provider.id,
      display_name: provider.display_name,
      outcome: "ok",
      quote,
      error: null,
    };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Unknown error";
    const outcome = classifyError(err);
    const status = extractStatus(err);
    result = {
      provider_id: provider.id,
      display_name: provider.display_name,
      outcome,
      quote: null,
      error: status === undefined ? { message } : { message, status },
    };
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
