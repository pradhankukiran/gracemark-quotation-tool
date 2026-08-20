import { Font } from "@react-pdf/renderer";

let isFontRegistered = false;

/**
 * Registers local Inter font files hosted in /fonts/ for @react-pdf/renderer.
 * Safe to call multiple times (idempotent).
 */
export function registerPdfFonts(): void {
  if (isFontRegistered) return;

  try {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    Font.register({
      family: "Inter",
      fonts: [
        {
          src: `${baseUrl}/fonts/Inter-Regular.woff`,
          fontWeight: 400,
        },
        {
          src: `${baseUrl}/fonts/Inter-SemiBold.woff`,
          fontWeight: 600,
        },
        {
          src: `${baseUrl}/fonts/Inter-Bold.woff`,
          fontWeight: 700,
        },
      ],
    });
    isFontRegistered = true;
  } catch (err) {
    console.warn("Failed to register PDF fonts, falling back to default:", err);
  }
}
