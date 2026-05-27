/**
 * Central side-effect module that registers every available provider on the
 * global registry. Importing this once at the top of an API route is enough
 * to make `listProviders()` return the full set. A failure to register one
 * provider is logged but does not block the others.
 */

async function safeRegister(
  name: string,
  importer: () => Promise<unknown>
): Promise<void> {
  try {
    await importer();
  } catch (e) {
    console.error(`[providers] failed to register ${name}`, e);
  }
}

await safeRegister("deel", () => import("@/providers/deel"));
await safeRegister("remote", () => import("@/providers/remote"));
await safeRegister("oyster", () => import("@/providers/oyster"));
await safeRegister("rippling", () => import("@/providers/rippling"));
await safeRegister("pebl", () => import("@/providers/pebl"));
await safeRegister("rivermate", () => import("@/providers/rivermate"));
await safeRegister("payoneer", () => import("@/providers/payoneer"));
await safeRegister("playroll", () => import("@/providers/playroll"));

export {};
