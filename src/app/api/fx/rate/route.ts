import { NextResponse } from "next/server";
import { z } from "zod";
import { getFxSnapshot } from "@/lib/fx";

const QuerySchema = z.object({
  from: z
    .string()
    .regex(/^[A-Za-z]{3}$/, "from must be a 3-letter currency code"),
  to: z
    .string()
    .regex(/^[A-Za-z]{3}$/, "to must be a 3-letter currency code")
    .optional()
    .default("USD"),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Invalid query", issues: parsed.error.issues } },
      { status: 400 }
    );
  }
  try {
    const snapshot = await getFxSnapshot(parsed.data.from, parsed.data.to);
    return NextResponse.json(
      { fx: snapshot },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown FX error";
    return NextResponse.json({ error: { message } }, { status: 502 });
  }
}
