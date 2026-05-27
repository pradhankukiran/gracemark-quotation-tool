import { NextResponse } from "next/server";
import { z } from "zod";
import { getProvider } from "@/providers/_core/registry";
import "@/providers/deel"; // side-effect: registers the provider

const CountryCodeSchema = z
  .string()
  .regex(/^[A-Z]{2}$/, "Country code must be 2 uppercase letters");

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> }
): Promise<NextResponse> {
  const { code } = await context.params;
  const parsed = CountryCodeSchema.safeParse(code);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          message: "Invalid country code",
          issues: parsed.error.issues,
        },
      },
      { status: 400 }
    );
  }

  try {
    const provider = getProvider("deel");
    if (!provider.getValidations) {
      return NextResponse.json(
        { error: { message: "Provider does not expose validations" } },
        { status: 501 }
      );
    }
    const validations = await provider.getValidations(parsed.data);
    return NextResponse.json(validations, {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown provider error";
    const status = /not\s*found|unknown country|no such country/i.test(message)
      ? 404
      : 500;
    return NextResponse.json({ error: { message } }, { status });
  }
}
