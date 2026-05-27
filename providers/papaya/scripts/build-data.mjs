#!/usr/bin/env node
// Build script: turn providers/papaya/data/*.json into a typed TS const.
//
// Usage: node providers/papaya/scripts/build-data.mjs

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..", "..");
const DATA_DIR = join(REPO_ROOT, "providers", "papaya", "data");
const OUT_FILE = join(REPO_ROOT, "src", "data", "papaya", "data.ts");

/**
 * Validate the basic shape of a parsed Papaya source entry.
 * Returns { ok: true } or { ok: false, reason: string }.
 */
function validateEntry(entry, filename) {
  if (entry == null || typeof entry !== "object") {
    return { ok: false, reason: "not an object" };
  }
  if (
    typeof entry.country_code !== "string" ||
    !/^[A-Z]{2}$/.test(entry.country_code)
  ) {
    return {
      ok: false,
      reason: `country_code must be a 2-letter uppercase string, got ${JSON.stringify(entry.country_code)}`,
    };
  }
  if (typeof entry.currency !== "string" || entry.currency.length === 0) {
    return {
      ok: false,
      reason: `currency must be a non-empty string, got ${JSON.stringify(entry.currency)}`,
    };
  }
  if (!Array.isArray(entry.employer_costs)) {
    return { ok: false, reason: "employer_costs must be an array" };
  }
  if (
    entry.vat_standard_percent !== null &&
    typeof entry.vat_standard_percent !== "number"
  ) {
    return {
      ok: false,
      reason: `vat_standard_percent must be number or null, got ${JSON.stringify(entry.vat_standard_percent)}`,
    };
  }
  return { ok: true };
}

/**
 * Strip out fields we don't ship — currently just employee_deductions.
 * Returns a new object so the source is untouched.
 */
function projectEntry(raw) {
  // Pull out only the keys we care about, in a stable order.
  const projected = {
    country: raw.country,
    country_code: raw.country_code,
    state: raw.state ?? null,
    state_code: raw.state_code ?? null,
    currency: raw.currency,
    employer_costs: raw.employer_costs,
    vat_standard_percent: raw.vat_standard_percent ?? null,
  };
  if (typeof raw._note === "string") {
    projected._note = raw._note;
  }
  return projected;
}

/**
 * Sort a country's entries: country-level (state_code === null) first,
 * then sub-national alphabetically by state_code.
 */
function sortEntries(entries) {
  return entries.slice().sort((a, b) => {
    if (a.state_code === null && b.state_code === null) return 0;
    if (a.state_code === null) return -1;
    if (b.state_code === null) return 1;
    return a.state_code.localeCompare(b.state_code);
  });
}

async function main() {
  const files = (await readdir(DATA_DIR))
    .filter((f) => f.endsWith(".json"))
    .sort();

  /** @type {Record<string, object[]>} */
  const grouped = {};
  /** @type {{ file: string, reason: string }[]} */
  const failures = [];

  for (const file of files) {
    const fullPath = join(DATA_DIR, file);
    let raw;
    try {
      const text = await readFile(fullPath, "utf8");
      raw = JSON.parse(text);
    } catch (err) {
      failures.push({ file, reason: `parse error: ${err.message}` });
      continue;
    }
    const result = validateEntry(raw, file);
    if (!result.ok) {
      failures.push({ file, reason: result.reason });
      continue;
    }
    const projected = projectEntry(raw);
    const cc = projected.country_code.toUpperCase();
    if (!grouped[cc]) grouped[cc] = [];
    grouped[cc].push(projected);
  }

  // Sort countries alphabetically by code; sort entries within each country.
  const countryCodes = Object.keys(grouped).sort();
  const totalCountries = countryCodes.length;
  let totalEntries = 0;

  const bodyParts = [];
  for (const cc of countryCodes) {
    const entries = sortEntries(grouped[cc]);
    totalEntries += entries.length;
    const entryLiterals = entries
      .map((e) => JSON.stringify(e, null, 2))
      // Indent each entry by 4 spaces so it nests cleanly inside the array.
      .map((s) =>
        s
          .split("\n")
          .map((line) => "    " + line)
          .join("\n"),
      )
      .join(",\n");
    bodyParts.push(`  ${cc}: [\n${entryLiterals}\n  ],`);
  }

  const out = `// GENERATED FILE — do not edit by hand.
// Source: providers/papaya/data/*.json (${files.length} files)
// Regenerate via: node providers/papaya/scripts/build-data.mjs

import type { PapayaCountryEntry } from "./types";

export const PAPAYA_DATA: Readonly<Record<string, readonly PapayaCountryEntry[]>> = {
${bodyParts.join("\n")}
} as const;
`;

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, out, "utf8");

  // --- Summary ---
  console.log(`Read ${files.length} source files from ${DATA_DIR}`);
  console.log(`Grouped into ${totalCountries} countries`);
  console.log(`Total entries (incl. sub-national): ${totalEntries}`);
  if (failures.length > 0) {
    console.log(`\nValidation failures (${failures.length}):`);
    for (const f of failures) {
      console.log(`  ${f.file}: ${f.reason}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`No validation failures.`);
  }
  console.log(`\nWrote ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
