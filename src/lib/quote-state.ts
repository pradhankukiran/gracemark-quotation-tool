"use client";

import type {
  MultiProviderQuote,
  QuoteRequest,
  QuoteRequestMulti,
} from "@/providers/_core/types";
import type { ICQuoteResult as ContractorQuoteResult } from "@/lib/contractor";

const LAST_FORM_KEY = "gracemark.last-form.v1";
const QUOTES_KEY = "gracemark.quotes.v1";
const STORAGE_VERSION = 3;

export type LocalOfficeCadence = "monthly" | "one_time";

export interface LocalOfficeCustomLine {
  name: string;
  amount: number;
  cadence: LocalOfficeCadence;
}

export type GraceMarkMarkupMode = "percentage" | "fixed_usd";

export interface GraceMarkMarkupConfig {
  mode: GraceMarkMarkupMode;
  /** Percentage value as entered by the user (e.g. 45 means 45%). */
  percentage: number;
  /** Fixed monthly markup in USD. */
  fixed_usd: number;
}

export const DEFAULT_GRACEMARK_MARKUP: GraceMarkMarkupConfig = {
  mode: "percentage",
  percentage: 45,
  fixed_usd: 0,
};

export interface LocalOfficeFormState {
  values: {
    meal_voucher?: number;
    transportation?: number;
    wfh?: number;
    health_insurance?: number;
    local_office?: number;
    /** VAT rate as a percentage value (e.g. 21 means 21%). Divide by 100 to apply as a multiplier. */
    vat?: number;
    pre_employment_med?: number;
    drug_test?: number;
    background_check?: number;
  };
  /** GraceMark fee applied after the complete recurring employer cost is known. */
  markup?: GraceMarkMarkupConfig;
  custom_lines: LocalOfficeCustomLine[];
}

export interface QuoteFormCountryInputs {
  country_code: string | null;
  state: string | null;
  currency: string | null;
  annual_salary: number | null;
  local_office?: LocalOfficeFormState;
}

/**
 * EOR-side bucket-model display mode (Stage 6 of the bucket-model rollout).
 *
 * - `"recurring_only"` — the recurring monthly total excludes termination
 *   buckets (severance, notice pay) and one-time costs. The default.
 * - `"all_inclusive"` — termination costs are amortized into the monthly
 *   total; one-time costs are still excluded.
 *
 * Note: this is distinct from `QuoteType` below (which discriminates the
 * saved-quotes bucket between EOR and contractor flows).
 */
export type EorQuoteType = "recurring_only" | "all_inclusive";

/**
 * Cost-basis the reconciliation algorithm was run against. Re-stated here
 * (rather than reusing `EorQuoteType`) because reconciliation locks this
 * value at the start of a run — separately from the live form toggle.
 */
export type RecommendationCostBasis = "recurring_only" | "all_inclusive";

/**
 * Persistent recommendation slot on a saved EOR quote. Written by the
 * reconciliation flow (Deel-anchored variance picker — see
 * `src/providers/_core/reconciliation.ts`) and reread by downstream features
 * (e.g. the Acid Test) so the picked provider survives refreshes.
 *
 * `is_override === true` means the user manually chose a different provider
 * than the algorithm's winner. The algorithm's original winner is NOT stored
 * — it's recomputable from the saved `result` + `view`.
 */
export interface RecommendationState {
  /** Provider id selected as the recommendation (winner OR user override). */
  provider_id: string;
  /** True iff this differs from the algorithm's winner — i.e., user overrode. */
  is_override: boolean;
  /** Cost basis the reconciliation was computed against. */
  view: RecommendationCostBasis;
  /** ISO timestamp of when this recommendation was set. */
  computed_at: string;
}

/**
 * Persistent Acid Test inputs slot on a saved EOR quote. Only the user-typed
 * inputs are persisted — derived results (totals, margin, breakeven) are
 * recomputed on hydration from these three values so we never have to
 * version-migrate a stale calculation.
 */
export interface AcidTestState {
  /** Monthly bill rate, expressed in the quote's currency. */
  billRate: number;
  /** Duration in months. */
  duration: number;
  /** Gracemark fee as a fraction (e.g. 0.45 for 45%). */
  gracemarkFeePct: number;
  /** Pricing model version. Missing means the saved inputs predate complete-cost logic. */
  pricingVersion?: 2;
  /** Cost basis used when these inputs were last calculated. */
  costBasis?: EorQuoteType;
  /** ISO timestamp of when this state was written. */
  computedAt: string;
}

export interface EorFormSnapshot {
  primary: QuoteFormCountryInputs;
  comparison: QuoteFormCountryInputs | null;
  employment_type?: "Full-time" | "Part-time";
  work_hours_per_week?: number | null;
  work_visa?: boolean;
  /**
   * Bucket-model display mode for the results page. Legacy snapshots without
   * this field hydrate as `"recurring_only"` (see `resolveEorFormHydration`).
   */
  quote_type: EorQuoteType;
}

export type QuoteType = "eor" | "contractor";

export interface SavedEorQuote {
  id: string;
  /**
   * Discriminator for the saved-quotes bucket — `"eor"` for entries produced
   * by the EOR flow. Used to route the user back to `/eor` on edit/refresh,
   * and to discriminate the `SavedQuote` union at read time.
   */
  type: "eor";
  form: EorFormSnapshot;
  /**
   * Multi-provider fan-out result. `null` means the API call hasn't completed
   * yet (or the entry was just created by the form on submit).
   */
  result: MultiProviderQuote | null;
  /**
   * Persisted reconciliation pick (Deel-anchored variance winner OR user
   * override). `null` or absent means reconciliation has not been run yet.
   * Optional so legacy saved quotes (written before this field existed)
   * deserialize cleanly with `recommendation === undefined`.
   */
  recommendation?: RecommendationState | null;
  /**
   * Persisted Acid Test inputs (bill rate, duration, gracemark fee). Optional
   * so pre-Acid-Test saved quotes (written before this field existed) and
   * quotes the user hasn't run the Acid Test on yet deserialize cleanly with
   * `acidTest === undefined`. Results are recomputed on hydration.
   */
  acidTest?: AcidTestState;
  created_at: string;
}

/**
 * Public union of all entries that can live in the saved-quotes bucket.
 * Callers reading the shared bucket without filtering see this shape and
 * narrow via `entry.type === "eor"` / `"contractor"`.
 */
export type SavedQuote = SavedEorQuote | SavedContractorQuote;

interface LastFormPayload {
  v: number;
  form: EorFormSnapshot;
}

interface QuotesPayload {
  v: number;
  quotes: Record<string, SavedQuote>;
}

// ---------- Independent Contractor (IC) types ----------

export interface ContractorFormSnapshot {
  contractor_name: string;
  country_code: string;
  currency: string;
  rate_basis: "hourly" | "monthly";
  pay_rate: number;
  markup_percentage: number;
  total_monthly_hours: number;
  contract_duration: number;
  contract_duration_unit: "months" | "years";
  payment_frequency: "weekly" | "biweekly" | "monthly";
  msp_percentage: number | null;
  background_check_required: boolean;
  /**
   * When true, the result page should display all monetary values converted
   * to USD instead of the local `currency`. Only meaningful when
   * `currency !== "USD"`. The form persists the flag only; FX conversion is
   * deferred to the result page (no FX work happens at form-submit time).
   */
  display_in_usd: boolean;
}

export interface SavedContractorQuote {
  id: string;
  type: "contractor";
  form: ContractorFormSnapshot;
  /**
   * Cached IC kernel result. Optional so legacy contractor entries (written
   * before this field existed) and entries whose kernel hasn't been run yet
   * deserialize cleanly with `result === undefined`. Pure additive — no
   * storage-version bump required.
   */
  result?: ContractorQuoteResult;
  created_at: string;
}

// ---------- ID generation ----------

const ID_ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomAlphanum(length: number): string {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    // Fallback: Math.random — not used in supported runtimes
    let out = "";
    for (let i = 0; i < length; i++) {
      out += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
    }
    return out;
  }
  // Rejection-sample bytes uniformly into the 62-char alphabet. 248 is the
  // greatest multiple of 62 ≤ 256, so any byte ≥ 248 would skew the
  // distribution and is discarded.
  const REJECTION_THRESHOLD = 248;
  let out = "";
  const buf = new Uint8Array(length);
  while (out.length < length) {
    crypto.getRandomValues(buf);
    for (let i = 0; i < length && out.length < length; i++) {
      const byte = buf[i];
      if (byte < REJECTION_THRESHOLD) {
        out += ID_ALPHABET[byte % ID_ALPHABET.length];
      }
    }
  }
  return out;
}

/**
 * Stable, URL-safe quote identifier. Format: `gmk-<COUNTRY>-<base62(10)>`.
 * Example: `gmk-BR-Vh7Kp9X2aR`.
 */
export function generateQuoteId(country_code: string): string {
  const cc = country_code.toUpperCase();
  return `gmk-${cc}-${randomAlphanum(10)}`;
}

/** Validates the on-disk shape of a quote ID (cheap regex). */
export function isQuoteId(value: string): boolean {
  return /^gmk-[A-Z]{2,3}-[A-Za-z0-9]{10}$/.test(value);
}

// ---------- snapshot → API request ----------

/**
 * Whether a single country-input slice is fully populated and quotable.
 * `state` is optional (null is allowed); the other three are required.
 */
function isCountryInputComplete(c: QuoteFormCountryInputs): boolean {
  return (
    Boolean(c.country_code) &&
    Boolean(c.currency) &&
    c.annual_salary != null &&
    c.annual_salary > 0
  );
}

function countryInputsToQuoteRequest(
  c: QuoteFormCountryInputs,
  shared: {
    employment_type?: "Full-time" | "Part-time";
    work_hours_per_week?: number | null;
    work_visa?: boolean;
  }
): QuoteRequest {
  return {
    country_code: c.country_code!,
    currency: c.currency!,
    annual_salary: c.annual_salary!,
    state: c.state ?? null,
    employment_type: shared.employment_type,
    work_hours_per_week: shared.work_hours_per_week ?? undefined,
    work_visa: shared.work_visa,
  };
}

/**
 * Build a `QuoteRequestMulti` from an EOR form snapshot. Returns null if
 * primary is incomplete or (when comparison is set) comparison is incomplete.
 */
export function eorSnapshotToRequestMulti(
  s: EorFormSnapshot
): QuoteRequestMulti | null {
  if (!hasRequiredForQuote(s)) return null;
  const shared = {
    employment_type: s.employment_type,
    work_hours_per_week: s.work_hours_per_week,
    work_visa: s.work_visa,
  };
  const countries: QuoteRequest[] = [
    countryInputsToQuoteRequest(s.primary, shared),
  ];
  if (s.comparison) {
    countries.push(countryInputsToQuoteRequest(s.comparison, shared));
  }
  return { countries };
}

export function hasRequiredForQuote(s: EorFormSnapshot): boolean {
  if (!s.primary || !isCountryInputComplete(s.primary)) return false;
  if (s.comparison && !isCountryInputComplete(s.comparison)) return false;
  return true;
}

// ---------- last-form (form page hydration) ----------

export function isLocalOfficeFormStateShape(
  value: unknown
): value is LocalOfficeFormState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as {
    values?: unknown;
    markup?: unknown;
    custom_lines?: unknown;
  };
  if (typeof v.values !== "object" || v.values === null) return false;
  if (!Array.isArray(v.custom_lines)) return false;
  if (v.markup !== undefined) {
    if (typeof v.markup !== "object" || v.markup === null) return false;
    const markup = v.markup as {
      mode?: unknown;
      percentage?: unknown;
      fixed_usd?: unknown;
    };
    if (markup.mode !== "percentage" && markup.mode !== "fixed_usd") {
      return false;
    }
    if (
      typeof markup.percentage !== "number" ||
      !Number.isFinite(markup.percentage) ||
      typeof markup.fixed_usd !== "number" ||
      !Number.isFinite(markup.fixed_usd)
    ) {
      return false;
    }
  }
  // Any extra fields on the loaded shape (e.g. legacy `dedup_overrides` from
  // earlier saved-quote versions) are accepted and ignored — we only validate
  // the fields we care about.
  return true;
}

function isEorFormSnapshotShape(value: unknown): value is EorFormSnapshot {
  if (typeof value !== "object" || value === null) return false;
  const v = value as {
    primary?: { local_office?: unknown };
    comparison?: { local_office?: unknown } | null;
    quote_type?: unknown;
  };
  if (typeof v.primary !== "object" || v.primary === null) return false;
  // comparison may be null (toggle off) or an object; anything else → bad shape.
  if (
    v.comparison !== null &&
    v.comparison !== undefined &&
    typeof v.comparison !== "object"
  ) {
    return false;
  }
  // If `local_office` is present on either slot, it must be well-shaped or
  // we treat the saved snapshot as corrupt and skip hydration.
  if (
    v.primary.local_office !== undefined &&
    !isLocalOfficeFormStateShape(v.primary.local_office)
  ) {
    return false;
  }
  if (
    v.comparison &&
    v.comparison.local_office !== undefined &&
    !isLocalOfficeFormStateShape(v.comparison.local_office)
  ) {
    return false;
  }
  // `quote_type` is optional on disk (legacy snapshots predate it); when
  // present it must be one of the two literals — anything else is corruption.
  // Hydration normalizes the absent case to `"recurring_only"`.
  if (
    v.quote_type !== undefined &&
    v.quote_type !== "recurring_only" &&
    v.quote_type !== "all_inclusive"
  ) {
    return false;
  }
  return true;
}

/**
 * Coerce a snapshot loaded from storage into a fully-typed `EorFormSnapshot`
 * by defaulting any optional fields that may be absent on legacy entries.
 * Currently normalizes `quote_type` to `"recurring_only"` when missing.
 */
function normalizeLoadedSnapshot(snap: EorFormSnapshot): EorFormSnapshot {
  if (snap.quote_type === "recurring_only" || snap.quote_type === "all_inclusive") {
    return snap;
  }
  return { ...snap, quote_type: "recurring_only" };
}

function readLastForm(): EorFormSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_FORM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastFormPayload;
    // v2 → v3 is a pure schema bump on `SavedEorQuote.acidTest`, not on the
    // last-form payload. Accept v2 last-form snapshots as-is (they have no
    // acidTest field to migrate); the next `saveLastEorForm` will rewrite at
    // STORAGE_VERSION.
    if (parsed?.v !== STORAGE_VERSION && parsed?.v !== 2) return null;
    if (!isEorFormSnapshotShape(parsed.form)) return null;
    return normalizeLoadedSnapshot(parsed.form);
  } catch {
    return null;
  }
}

export function saveLastEorForm(form: EorFormSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    const payload: LastFormPayload = { v: STORAGE_VERSION, form };
    window.localStorage.setItem(LAST_FORM_KEY, JSON.stringify(payload));
  } catch {
    // quota exceeded or storage disabled — fail silent
  }
}

// ---------- saved quotes archive ----------

function readQuotes(): Record<string, SavedQuote> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(QUOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as QuotesPayload;
    if (parsed?.v === STORAGE_VERSION) return parsed.quotes ?? {};
    // v2 → v3: the only schema change is the addition of the optional
    // `acidTest` field on `SavedEorQuote`. Existing v2 entries are valid v3
    // entries with `acidTest === undefined`; pass them through and let the
    // next write upgrade the on-disk version stamp.
    if (parsed?.v === 2) return parsed.quotes ?? {};
    // Anything older (v1 or missing): drop. (No fallback recovery path
    // existed before; preserve the pre-existing behavior.)
    return {};
  } catch {
    return {};
  }
}

function isQuotaError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "QuotaExceededError";
}

function evictOldestHalf(
  quotes: Record<string, SavedQuote>
): Record<string, SavedQuote> {
  const entries = Object.values(quotes).sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );
  const keep = entries.slice(Math.ceil(entries.length / 2));
  const next: Record<string, SavedQuote> = {};
  for (const entry of keep) next[entry.id] = entry;
  return next;
}

function writeQuotes(quotes: Record<string, SavedQuote>): boolean {
  if (typeof window === "undefined") return false;
  const payload: QuotesPayload = { v: STORAGE_VERSION, quotes };
  try {
    window.localStorage.setItem(QUOTES_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    if (!isQuotaError(e)) return false;
    // Quota exceeded — evict oldest 50% and retry once.
    const trimmed = evictOldestHalf(quotes);
    try {
      const retryPayload: QuotesPayload = {
        v: STORAGE_VERSION,
        quotes: trimmed,
      };
      window.localStorage.setItem(QUOTES_KEY, JSON.stringify(retryPayload));
      return true;
    } catch {
      console.warn(
        "[quote-state] localStorage quota exceeded; quote not saved."
      );
      return false;
    }
  }
}

/** Persists a new EOR quote with auto-generated id and `result: null`. Returns the id. */
export function saveEorQuote(form: EorFormSnapshot): string {
  const primaryCountry = form.primary?.country_code;
  if (!primaryCountry) {
    throw new Error("Cannot save a quote without a primary country_code.");
  }
  const id = generateQuoteId(primaryCountry);
  const entry: SavedEorQuote = {
    id,
    type: "eor",
    form,
    result: null,
    created_at: new Date().toISOString(),
  };
  const all = readQuotes();
  all[id] = entry;
  writeQuotes(all);
  return id;
}

export function readEorQuote(id: string): SavedEorQuote | null {
  if (!isQuoteId(id)) return null;
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return null;
  // Legacy entries (written before the `type` discriminator existed) had no
  // `type` field and were always EOR. The static union doesn't admit a
  // missing `type`, so peek through a relaxed view to detect and coerce.
  const maybeLegacy = entry as { type?: QuoteType };
  if (maybeLegacy.type == null) {
    const legacy = entry as unknown as Omit<SavedEorQuote, "type">;
    return {
      id: legacy.id,
      type: "eor",
      form: normalizeLoadedSnapshot(legacy.form),
      result: legacy.result,
      // `recommendation` is optional and added post-launch; preserve it when
      // present on a legacy entry, otherwise leave undefined.
      recommendation: legacy.recommendation,
      created_at: legacy.created_at,
    };
  }
  if (entry.type !== "eor") return null;
  // Normalize `quote_type` (and any future optional field) on the way out so
  // every caller sees a fully-populated snapshot, regardless of when the
  // entry was written.
  return { ...entry, form: normalizeLoadedSnapshot(entry.form) };
}

/**
 * Caches the multi-provider fan-out result on a previously saved entry.
 * Returns `true` on success, `false` if no entry exists or the write failed
 * (e.g. localStorage quota exhausted).
 */
export function updateQuoteResult(
  id: string,
  result: MultiProviderQuote
): boolean {
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return false;
  // Contractor entries have no `result` slot — only EOR carries quote results.
  if (entry.type !== "eor") return false;
  entry.result = result;
  all[id] = entry;
  return writeQuotes(all);
}

/**
 * Resets the cached `result` on a saved quote back to `null` so the next read
 * triggers a fresh fan-out (used by the "Refresh" action on stale quotes).
 */
export function clearQuoteResult(id: string): boolean {
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return false;
  if (entry.type !== "eor") return false;
  entry.result = null;
  all[id] = entry;
  return writeQuotes(all);
}

/**
 * Overwrites the form snapshot on an existing EOR quote entry, preserving its
 * `created_at` and clearing the cached `result` so the next read refetches.
 * Returns `false` when no entry exists for `id`, or the entry isn't EOR.
 */
export function overwriteEorQuote(
  id: string,
  snapshot: EorFormSnapshot
): boolean {
  if (!isQuoteId(id)) return false;
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return false;
  if (entry.type !== "eor") return false;
  all[id] = {
    id: entry.id,
    type: "eor",
    form: snapshot,
    result: null,
    created_at: entry.created_at,
  };
  writeQuotes(all);
  return true;
}

/**
 * Persist a reconciliation recommendation onto a saved EOR quote. Pass
 * `null` to clear an existing recommendation (e.g. when the user wipes
 * the picker).
 *
 * Silently no-ops when:
 *   - the id is malformed,
 *   - no entry exists for the id, or
 *   - the entry exists but isn't an EOR entry (contractor).
 *
 * Storage version is NOT bumped because `recommendation` is optional —
 * older saved quotes deserialize cleanly with `recommendation === undefined`.
 */
export function setEorRecommendation(
  id: string,
  recommendation: RecommendationState | null
): void {
  if (!isQuoteId(id)) return;
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return;
  if (entry.type !== "eor") return;
  // If the user is overriding to a different provider than what was previously
  // recommended, the previously-persisted Acid Test inputs are seeded from the
  // old provider's bill-rate and would hydrate stale on the next visit. Drop
  // the acidTest slot so the Acid Test re-seeds from the new provider.
  if (
    recommendation &&
    entry.recommendation?.provider_id &&
    entry.recommendation.provider_id !== recommendation.provider_id
  ) {
    const { acidTest: _drop, ...rest } = entry;
    void _drop;
    all[id] = { ...rest, recommendation };
  } else {
    all[id] = { ...entry, recommendation };
  }
  writeQuotes(all);
}

// ---------- acid test ----------

/**
 * Persist Acid Test inputs onto a saved EOR quote. Only the user-typed inputs
 * are stored; derived results are recomputed on hydration so we never have to
 * version-migrate a stale calculation.
 *
 * Silently no-ops when:
 *   - the id is malformed,
 *   - no entry exists for the id, or
 *   - the entry exists but isn't an EOR entry (contractor quotes don't carry
 *     an Acid Test slot).
 *
 * Uses the same quota-recovery path as `writeQuotes` — on `QuotaExceededError`
 * the oldest 50% of quotes is evicted and the write is retried once.
 */
export function setAcidTest(id: string, state: AcidTestState): void {
  if (!isQuoteId(id)) return;
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return;
  if (entry.type !== "eor") {
    console.warn(
      "[quote-state] setAcidTest called with a non-EOR quote id; ignoring."
    );
    return;
  }
  all[id] = { ...entry, acidTest: state };
  writeQuotes(all);
}

/**
 * Reads the persisted Acid Test inputs for a saved EOR quote. Returns `null`
 * when the id is malformed, no entry exists, the entry is not EOR, or the
 * Acid Test has never been run on this quote.
 */
export function readAcidTest(id: string): AcidTestState | null {
  if (!isQuoteId(id)) return null;
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return null;
  if (entry.type !== "eor") return null;
  return entry.acidTest ?? null;
}

/**
 * Clears the persisted Acid Test inputs on a saved EOR quote. Silently no-ops
 * on malformed id, missing entry, or non-EOR entry. Safe to call when no Acid
 * Test was ever written.
 */
export function clearAcidTest(id: string): void {
  if (!isQuoteId(id)) return;
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return;
  if (entry.type !== "eor") {
    console.warn(
      "[quote-state] clearAcidTest called with a non-EOR quote id; ignoring."
    );
    return;
  }
  const { acidTest: _drop, ...rest } = entry;
  void _drop;
  all[id] = rest;
  writeQuotes(all);
}

// ---------- contractor (IC) quotes ----------

/**
 * Stable, URL-safe contractor quote identifier. Same format as EOR
 * (`gmk-<COUNTRY>-<base62(10)>`) — the generator is provider-agnostic.
 */
export function generateContractorQuoteId(country_code: string): string {
  return generateQuoteId(country_code);
}

/**
 * Persists a new contractor quote with auto-generated id. Writes to the same
 * `gracemark.quotes.v1` bucket as EOR entries, discriminated by `type`.
 * Returns the id.
 */
export function saveContractorQuote(form: ContractorFormSnapshot): string {
  if (!form.country_code) {
    throw new Error(
      "Cannot save a contractor quote without a country_code."
    );
  }
  const id = generateContractorQuoteId(form.country_code);
  const entry: SavedContractorQuote = {
    id,
    type: "contractor",
    form,
    created_at: new Date().toISOString(),
  };
  const all = readQuotes();
  all[id] = entry;
  writeQuotes(all);
  return id;
}

/**
 * Reads a contractor quote from the shared bucket. Returns `null` when the
 * id is malformed, no entry exists, or the entry is for a different flow
 * (e.g. EOR).
 *
 * Legacy entries (written before `display_in_usd` was added to
 * `ContractorFormSnapshot`) are normalized on read so callers always see a
 * fully-populated snapshot. No storage version bump required — the missing
 * field defaults to `false`, the same as a fresh non-USD submission.
 */
export function readContractorQuote(id: string): SavedContractorQuote | null {
  if (!isQuoteId(id)) return null;
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return null;
  if (entry.type !== "contractor") return null;
  const maybeLegacy = entry.form as Partial<ContractorFormSnapshot>;
  if (typeof maybeLegacy.display_in_usd !== "boolean") {
    return {
      ...entry,
      form: { ...entry.form, display_in_usd: false },
    };
  }
  return entry;
}

/**
 * Overwrites the form snapshot on an existing contractor entry, preserving
 * its `created_at`. Returns `false` when no entry exists for `id` or the
 * entry is not a contractor entry.
 */
export function overwriteContractorQuote(
  id: string,
  form: ContractorFormSnapshot
): boolean {
  if (!isQuoteId(id)) return false;
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return false;
  if (entry.type !== "contractor") return false;
  all[id] = {
    id: entry.id,
    type: "contractor",
    form,
    created_at: entry.created_at,
  };
  writeQuotes(all);
  return true;
}

/**
 * Persist a kernel result onto a saved contractor quote. Only the result is
 * stored; callers are responsible for invoking the kernel and passing the
 * computed value here.
 *
 * Silently no-ops when:
 *   - the id is malformed,
 *   - no entry exists for the id, or
 *   - the entry exists but isn't a contractor entry (EOR).
 *
 * Uses the same quota-recovery path as `writeQuotes` — on `QuotaExceededError`
 * the oldest 50% of quotes is evicted and the write is retried once.
 */
export function setContractorResult(
  id: string,
  result: ContractorQuoteResult
): void {
  if (!isQuoteId(id)) return;
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return;
  if (entry.type !== "contractor") {
    console.warn(
      "[quote-state] setContractorResult called with a non-contractor quote id; ignoring."
    );
    return;
  }
  all[id] = { ...entry, result };
  writeQuotes(all);
}

/**
 * Reads the persisted kernel result for a saved contractor quote. Returns
 * `null` when the id is malformed, no entry exists, the entry is not a
 * contractor entry, or the kernel has never been run on this quote.
 */
export function readContractorResult(
  id: string
): ContractorQuoteResult | null {
  if (!isQuoteId(id)) return null;
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return null;
  if (entry.type !== "contractor") return null;
  return entry.result ?? null;
}

/**
 * Clears the persisted kernel result on a saved contractor quote. Silently
 * no-ops on malformed id, missing entry, or non-contractor entry. Safe to
 * call when no result was ever written. Destructures the field out so the
 * key is fully removed (not left as `undefined`).
 */
export function clearContractorResult(id: string): void {
  if (!isQuoteId(id)) return;
  const all = readQuotes();
  const entry = all[id];
  if (!entry) return;
  if (entry.type !== "contractor") {
    console.warn(
      "[quote-state] clearContractorResult called with a non-contractor quote id; ignoring."
    );
    return;
  }
  const { result: _drop, ...rest } = entry;
  void _drop;
  all[id] = rest;
  writeQuotes(all);
}

// ---------- form hydration source resolution ----------

export type FormHydrationSource = "edit" | "last-form" | "none";

export interface EorFormHydration {
  form: EorFormSnapshot | null;
  source: FormHydrationSource;
  /** If hydrated from `?edit=<id>`, the source quote id. */
  edit_id: string | null;
}

/**
 * Decide what (if anything) to pre-fill the EOR form with. Reads URL
 * `?edit=<id>` first (canonical), then falls back to the most recent
 * submitted form. Call inside useEffect — touches window.
 */
export function resolveEorFormHydration(): EorFormHydration {
  if (typeof window === "undefined") {
    return { form: null, source: "none", edit_id: null };
  }
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("edit");
  if (editId && isQuoteId(editId)) {
    const saved = readEorQuote(editId);
    if (saved) {
      return { form: saved.form, source: "edit", edit_id: editId };
    }
  }
  const last = readLastForm();
  if (last) {
    return { form: last, source: "last-form", edit_id: null };
  }
  return { form: null, source: "none", edit_id: null };
}

// ---------- cleanup ----------

/**
 * Clears the "last form" hydration source and removes the URL search string.
 * Does NOT delete the saved quotes archive — those are durable until explicit
 * removal (no UI for that yet).
 */
export function clearPersisted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LAST_FORM_KEY);
    window.history.replaceState(null, "", window.location.pathname);
  } catch {
    // ignore
  }
}
