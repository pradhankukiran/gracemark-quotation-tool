import type { CostLine, CostLineCategory } from "@/providers/_core/types";

/**
 * The four local-office benefit fields that may overlap with provider-quoted
 * line items. When a provider already includes one of these (e.g. Deel quotes
 * a "vale refeição" line), naively adding the local-office value would
 * double-count.
 */
export type LocalOfficeBenefitKey =
  | "meal_voucher"
  | "transportation"
  | "wfh"
  | "health_insurance";

/**
 * Provider line-name synonyms (multilingual, diacritic-tolerant) used to detect
 * whether a provider quote already covers a given local-office benefit.
 * Statutory items (Obra Social, INSS, IMSS, EPS, Fonasa, PAMI) are intentionally
 * excluded from health_insurance — those are mandatory contributions, not
 * optional private coverage.
 */
export const SYNONYMS: Record<LocalOfficeBenefitKey, string[]> = {
  wfh: [
    "wfh",
    "work from home",
    "remote work",
    "home office",
    "home office allowance",
    "remote work allowance",
    "wfh allowance",
    "teletrabajo",
    "trabajo remoto",
    "trabajo a distancia",
    "trabajo en casa",
    "auxilio teletrabajo",
    "auxílio home office",
    "auxilio home office",
    "trabalho remoto",
    "auxílio teletrabalho",
    "auxilio teletrabalho",
    "telework",
    "telework allowance",
    "telework allowance for connectivity",
    "telework allowance for equipment",
  ],
  meal_voucher: [
    "meal voucher",
    "meal allowance",
    "food allowance",
    "food voucher",
    "lunch voucher",
    "vale de comida",
    "vale alimentación",
    "vale alimentacion",
    "vale alimentos",
    "bono de alimentación",
    "bono de alimentacion",
    "ticket restaurante",
    "asignación de colación",
    "asignacion de colacion",
    "vale de despensa",
    "grocery voucher",
    "vale refeição",
    "vale refeicao",
    "vale alimentação",
    "vale alimentacao",
    "vr",
    "va",
    "auxílio alimentação",
    "auxilio alimentacao",
  ],
  transportation: [
    "transportation",
    "transport allowance",
    "transit allowance",
    "commute allowance",
    "travel allowance",
    "vale de transporte",
    "bono de transporte",
    "auxilio de transporte",
    "subsidio de transporte",
    "vale transporte",
    "vt",
    "auxílio transporte",
    "auxilio transporte",
  ],
  health_insurance: [
    "health insurance",
    "medical insurance",
    "private healthcare",
    "private health insurance",
    "health plan",
    "medical plan",
    "seguro médico",
    "seguro medico",
    "plan de salud",
    "plan médico",
    "plan medico",
    "seguro de salud",
    "seguro de gastos médicos",
    "seguro de gastos medicos",
    "seguro de gastos médicos mayores",
    "sgmm",
    "medicina prepagada",
    "prepagada",
    "isapre",
    "plano de saúde",
    "plano de saude",
    "assistência médica",
    "assistencia medica",
    "convênio médico",
    "convenio medico",
    "auxílio saúde",
    "auxilio saude",
  ],
};

/**
 * Normalize a line name for synonym matching:
 * - lowercase
 * - NFD-strip diacritics
 * - strip non-alphanumeric except spaces
 * - collapse whitespace
 * - trim
 */
export function normalizeLineName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Check whether an already-normalized provider line name contains any synonym
 * for the given benefit key. Uses word-boundary matching to avoid spurious
 * matches like "vr" inside "vrn".
 */
export function matchesBenefit(
  normalizedProviderName: string,
  key: LocalOfficeBenefitKey
): boolean {
  const synonyms = SYNONYMS[key];
  for (const synonym of synonyms) {
    const normalizedSynonym = normalizeLineName(synonym);
    if (!normalizedSynonym) continue;
    const re = new RegExp(`\\b${escapeRegex(normalizedSynonym)}\\b`, "i");
    if (re.test(normalizedProviderName)) return true;
  }
  return false;
}

export interface DedupMatch {
  key: LocalOfficeBenefitKey;
  /** Original (non-normalized) provider line name that triggered the match. */
  provider_line_name: string;
  /** Provider line amount converted to monthly (annual amounts divided by 12). */
  provider_line_monthly_amount: number;
  provider_line_frequency: "monthly" | "annual";
  /** Unmodified local-office value for this benefit key (may be 0 if unset). */
  local_office_amount: number;
  /** True iff `dedup_overrides[key] === true` (provider wins instead of local). */
  override_active: boolean;
}

export interface DedupResult {
  /**
   * Local-office values to use in the additional-cost subtotal.
   * Default (Y wins): the unmodified local-office value is kept.
   * Override active (X wins): the value is zeroed so the provider's line isn't doubled.
   */
  effective_local_office_values: Record<LocalOfficeBenefitKey, number>;
  /**
   * Provider line names to EXCLUDE from the provider's monthly total in the
   * combined view. Populated only for matches where the default (Y wins)
   * applies — i.e. when the override is NOT active.
   */
  excluded_provider_line_names: Set<string>;
  /**
   * Sum (in monthly currency units) to SUBTRACT from `provider.monthly.total`
   * when computing the combined monthly total. Equal to the sum of
   * `provider_line_monthly_amount` for every match where the override is off.
   */
  provider_monthly_exclusion_total: number;
  /** All detected matches (regardless of override state) — for display. */
  matches: DedupMatch[];
}

/**
 * For each of the four benefit keys, find a matching provider allowance line
 * (if any) and decide which side "wins" in the combined view.
 *
 * Semantics (new):
 * - Default (no override): local-office Y wins. The provider's matching line X
 *   is excluded from the combined total (so we don't double-count).
 * - Override (`dedup_overrides[key] === true`): provider X wins. The
 *   local-office Y is zeroed so the user sees the provider's amount only.
 *
 * @remarks
 * Only provider lines with category === "allowances" are considered for
 * matching. Statutory lines describe mandatory government contributions
 * (e.g. Argentina's "Medical Insurance" / Obra Social payroll tax) and never
 * overlap conceptually with the optional employee benefits the local-office
 * table tracks, even when names collide.
 */
export function dedupeBenefits(
  providerLines: CostLine[],
  localOfficeValues: {
    meal_voucher?: number;
    transportation?: number;
    wfh?: number;
    health_insurance?: number;
  },
  dedup_overrides?: Partial<Record<LocalOfficeBenefitKey, boolean>>
): DedupResult {
  const keys: LocalOfficeBenefitKey[] = [
    "meal_voucher",
    "transportation",
    "wfh",
    "health_insurance",
  ];
  const effective_local_office_values: Record<LocalOfficeBenefitKey, number> = {
    meal_voucher: 0,
    transportation: 0,
    wfh: 0,
    health_insurance: 0,
  };
  const excluded_provider_line_names = new Set<string>();
  const matches: DedupMatch[] = [];
  let provider_monthly_exclusion_total = 0;

  // Pre-normalize every provider allowance line name once. Statutory and other
  // categories are excluded — see @remarks above. One-time lines are also
  // skipped: provider adapters never emit them, and dedup is only meaningful
  // for recurring (monthly/annual) benefits.
  const normalizedLines = providerLines
    .filter(
      (line): line is CostLine & { frequency: "monthly" | "annual" } =>
        line.category === "allowances" &&
        (line.frequency === "monthly" || line.frequency === "annual")
    )
    .map((line) => ({
      original: line.name,
      normalized: normalizeLineName(line.name),
      amount: line.amount,
      frequency: line.frequency,
    }));

  for (const key of keys) {
    const localValue = localOfficeValues[key] ?? 0;
    const overrideOn = dedup_overrides?.[key] === true;

    // Collect ALL provider lines that match this benefit key. Some providers
    // split a single conceptual benefit into multiple line items (e.g.
    // Rippling AR "Telework Allowance for Connectivity" + "Telework Allowance
    // for Equipment"). Every match contributes to the exclusion total so the
    // combined view doesn't double-count the provider's portion.
    const keyMatches: {
      provider_line_name: string;
      amount: number;
      frequency: "monthly" | "annual";
    }[] = [];
    for (const line of normalizedLines) {
      if (!line.normalized) continue;
      if (matchesBenefit(line.normalized, key)) {
        keyMatches.push({
          provider_line_name: line.original,
          amount: line.amount,
          frequency: line.frequency,
        });
      }
    }

    if (keyMatches.length > 0) {
      for (const match of keyMatches) {
        const monthly_amount =
          match.frequency === "annual" ? match.amount / 12 : match.amount;
        matches.push({
          key,
          provider_line_name: match.provider_line_name,
          provider_line_monthly_amount: monthly_amount,
          provider_line_frequency: match.frequency,
          local_office_amount: localValue,
          override_active: overrideOn,
        });

        if (overrideOn) {
          // Provider X wins: zero the local-office value (set once; idempotent
          // across multiple matches for the same key).
          effective_local_office_values[key] = 0;
        } else {
          // Local-office Y wins: keep the local value, exclude EVERY matching
          // provider line from the combined total so we don't double-count.
          effective_local_office_values[key] = localValue;
          excluded_provider_line_names.add(match.provider_line_name);
          provider_monthly_exclusion_total += monthly_amount;
        }
      }
    } else {
      effective_local_office_values[key] = localValue;
    }
  }

  return {
    effective_local_office_values,
    excluded_provider_line_names,
    provider_monthly_exclusion_total,
    matches,
  };
}

// ---------------------------------------------------------------------------
// Statutory synonyms — used to dedup Papaya-calculated statutory/accrual/
// termination-liability lines against provider-emitted lines that may already
// cover the same legal obligation under a different (and often multilingual)
// name. This map is INDEPENDENT of the 4-key BENEFIT `SYNONYMS` above:
// statutory items describe mandatory government contributions, not optional
// employee benefits, and the lumped synonyms (e.g. "social security charges")
// are intentionally absent from BENEFIT matching.
// ---------------------------------------------------------------------------

export type StatutorySynonymKey =
  | "pension_retirement"
  | "unemployment_insurance"
  | "workers_compensation"
  | "statutory_health"
  | "statutory_life_insurance"
  | "family_allowance"
  | "thirteenth_salary"
  | "fourteenth_salary"
  | "vacation_accrual"
  | "severance_reserve"
  | "notice_pay"
  | "training_levy"
  | "housing_fund"
  | "solidarity_tax"
  | "payroll_tax"
  | "disability_insurance"
  | "wage_guarantee"
  | "long_term_care"
  | "statutory_bonus";

// Lumped umbrella terms used by providers that bundle multiple statutory items
// (BR INSS, FR URSSAF, Oyster "Social Security Charges", etc.). Pasted into
// multiple keys where the umbrella commonly absorbs that item per country.
const LUMPED_SS_TERMS = [
  "social security",
  "social security charges",
  "social security contribution",
  "social security contribution unified",
  "social security uncapped",
  "company social security contribution",
  "social tax",
] as const;

export const STATUTORY_SYNONYMS: Record<StatutorySynonymKey, readonly string[]> = {
  pension_retirement: [
    // English
    "pension", "pension fund", "pension fund tier 2", "pension fund cpp2",
    "pension fund qpp2", "complementary pension fund",
    "collective capitalization pillar", "survivors pension", "reserve fund",
    "retirement", "parental insurance",
    // Provident-fund variants (effectively retirement schemes)
    "epf", "cpf", "provident fund", "employees provident fund",
    "central provident fund", "employees' provident fund",
    // Acronyms
    "cpp", "cpp2", "qpp", "qpp2", "afp", "nssf",
    "sipa", "sipa (pension fund)",
    // Latin / Iberian
    "previdencia", "previdência", "jubilacion", "jubilación",
    // Lumped
    ...LUMPED_SS_TERMS,
  ],

  unemployment_insurance: [
    "unemployment", "unemployment insurance",
    "unemployment insurance (federal)", "unemployment insurance (state)",
    "unemployment fund", "national employment fund",
    "federal unemployment tax", "futa",
    "state unemployment tax", "suta",
    "emergency relief fund",
    "seguro de cesantia", "seguro de cesantía",
    "fne", "fondo nacional",
    // Lumped
    ...LUMPED_SS_TERMS,
  ],

  workers_compensation: [
    "workers comp", "workers compensation",
    "work accident", "work accident insurance",
    "mandatory work accident", "mandatory work accident insurance",
    "accident insurance", "art",
    "occupational hazard", "occupational risk",
    "workers benefit fund", "job development fund",
    "seguro de accidentes", "seguranca do trabalho", "segurança do trabalho",
    // Rivermate's "Work Risk Insurance" and Pebl's "ART (Worker Risk Insurer)"
    "work risk", "work risk insurance",
    "worker risk", "worker risk insurer",
    // Lumped — BR INSS, FR URSSAF case
    ...LUMPED_SS_TERMS,
  ],

  statutory_health: [
    "health insurance", "medical insurance",
    "social health", "social health fund", "mandatory health check",
    "national health", "obra social", "law 19032", "pami",
    "ssm", "eps", "fonasa", "nhif",
    "saude", "saúde",
    "health insurance supplementary premium",
    "mutual health benefit", "occupational medicine",
    "supplementary insurance", "health in benefit",
    "employer medical assistance contribution", "emac",
    "death insurance",
    "os", "os (medical care)", "obra",
    // Lumped
    ...LUMPED_SS_TERMS,
  ],

  statutory_life_insurance: [
    "life insurance", "group life", "mandatory life insurance",
    "deposit linked insurance", "edli",
    "seguro de vida obligatorio", "seguro de vida",
    // Lumped — some SS schemes include death/life
    ...LUMPED_SS_TERMS,
  ],

  family_allowance: [
    "family allowance", "family allowance fund",
    "family fund", "family assignment",
    "family welfare", "icbf",
    "childcare support contribution", "child-rearing contribution",
    "maternity leave fund",
    "asignacion familiar", "asignación familiar",
    // Lumped
    ...LUMPED_SS_TERMS,
  ],

  thirteenth_salary: [
    "13th salary", "thirteenth salary", "13 salary",
    "13th month pay", "13 month pay", "thirteenth month pay",
    "aguinaldo", "christmas bonus",
    "13o salario", "13o salário",
    "decimo tercer salario", "décimo tercer salario",
    "natale", "tredicesima",
    "treizième mois", "treizieme mois",
    "bonificacion anual", "bonificación anual",
    "13th month salary",
    "13 month salary",
    "thirteenth month salary",
    "13th month",
    "sac", "sac accrual", "sueldo anual complementario",
  ],

  fourteenth_salary: [
    "14th salary", "fourteenth salary", "14 salary", "14th month pay",
    "decimo cuarto salario", "décimo cuarto salario",
    "quattordicesima",
    "quatorzième mois", "quatorzieme mois",
  ],

  vacation_accrual: [
    "vacation bonus", "vacation pay", "vacation accrual",
    "holiday bonus", "holiday allowance",
    "vacations",
    "adicional vacacional", "additional vacacional",
    "future expenses vacations",
    "feriado", "vacaciones",
  ],

  severance_reserve: [
    "severance", "severance liability", "severance fund",
    "severance reserve", "severance interest",
    "fgts", "fgts contribution", "fgts termination penalty",
    "indemnity", "termination indemnity",
    "gratuity",
    "tfr", "trattamento di fine rapporto",
    "indemnizacion", "indemnización", "indemnización por despido",
    "cesantias", "cesantías",
  ],

  notice_pay: [
    "notice pay", "notice pay-in-lieu", "notice in lieu",
    "preaviso", "pré-aviso", "preavis", "préavis",
  ],

  training_levy: [
    "training fund", "training levy",
    "apprenticeship levy", "workforce training fund",
    "terceiros",
  ],

  housing_fund: [
    "housing fund", "housing levy",
    "labor capitalization fund",
  ],

  solidarity_tax: [
    "solidarity tax", "solidarity contribution",
    "solidarity reserve fund",
    "social cohesion fund",
  ],

  payroll_tax: [
    "payroll tax", "state payroll tax", "general payroll tax",
    "education tax", "military tax",
    "labor standards",
    "natural disasters fund", "water fund",
    "banco popular contribution", "banco popular employer fee",
    "war victims", "workers recreational institute",
    "nationalization fee",
    "trade union fee",
    "umlage",
  ],

  disability_insurance: [
    "disability fund", "disability insurance",
    "pfron", "whk", "work resumption fund",
  ],

  wage_guarantee: [
    "guarantee insurance", "guaranteed employee benefits fund",
    "salary guarantee fund", "wage guarantee fund", "wage guarantee insurance",
    "labor credit guarantee fund", "employees trust fund",
    "ags", "fogasa", "fgs", "fgsp", "etf",
  ],

  long_term_care: [
    "long-term care insurance", "long term care insurance",
    "nursing care insurance",
    "pflegeversicherung",
  ],

  statutory_bonus: [
    "statutory bonus",
    "cost of living allowance", "cola",
    "bonus de navidad",
  ],
};

/**
 * Determine the statutory synonym key (if any) for a given Papaya line name.
 * Walks every key's synonym list and returns the first that matches via
 * whole-word containment in the normalized name. Returns null when the name
 * doesn't match any statutory synonym (e.g. payroll-tax, withholding-tax —
 * Papaya line names we don't currently dedup against provider lines).
 */
export function classifyStatutoryName(
  rawName: string
): StatutorySynonymKey | null {
  const normalized = normalizeLineName(rawName);
  if (!normalized) return null;
  const keys = Object.keys(STATUTORY_SYNONYMS) as StatutorySynonymKey[];
  for (const key of keys) {
    for (const synonym of STATUTORY_SYNONYMS[key]) {
      const normalizedSynonym = normalizeLineName(synonym);
      if (!normalizedSynonym) continue;
      const re = new RegExp(`\\b${escapeRegex(normalizedSynonym)}\\b`, "i");
      if (re.test(normalized)) return key;
    }
  }
  return null;
}

/**
 * Whether any provider line (filtered to `allowedCategories`) matches the
 * given Papaya line name via the statutory synonym map.
 *
 * The Papaya name is first classified into a `StatutorySynonymKey`; if it
 * doesn't match any key (e.g. a Papaya-specific item with no provider analog),
 * returns false — the caller should append the Papaya line as-is.
 *
 * `allowedCategories` is set by the caller per Papaya type:
 *   - statutory → ["statutory"]
 *   - accrual → ["accruals", "statutory"]
 *   - termination_liability → ["severance"]
 *   - mandatory_allowance → ["allowances"]
 *
 * One-time provider lines are never considered — statutory/accrual lines are
 * recurring by definition.
 */
export function papayaLineMatchesProvider(
  papayaLineName: string,
  providerLines: CostLine[],
  allowedCategories: CostLineCategory[]
): boolean {
  const key = classifyStatutoryName(papayaLineName);
  if (key === null) return false;

  const synonyms = STATUTORY_SYNONYMS[key];
  const allowed = new Set<CostLineCategory>(allowedCategories);

  for (const line of providerLines) {
    if (!allowed.has(line.category)) continue;
    const normalizedProvider = normalizeLineName(line.name);
    if (!normalizedProvider) continue;
    for (const synonym of synonyms) {
      const normalizedSynonym = normalizeLineName(synonym);
      if (!normalizedSynonym) continue;
      const re = new RegExp(`\\b${escapeRegex(normalizedSynonym)}\\b`, "i");
      if (re.test(normalizedProvider)) return true;
    }
  }
  return false;
}
