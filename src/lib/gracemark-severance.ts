import { getGraceMarkSeveranceRate } from "@/data/gracemark/severance";
import type { CostLine } from "@/providers/_core/types";

interface CalculateGraceMarkSeveranceArgs {
  countryCode: string;
  annualSalary: number;
}

function normalizeCostName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0131/g, "i")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * The GraceMark document keeps these deferred-salary funds separate from its
 * consolidated termination accrual. They remain recurring costs in both quote
 * modes instead of being replaced by the All-Inclusive termination row.
 */
export type GraceMarkRecurringSeveranceKind = "fund" | "interest";

interface RecurringSeveranceSynonymGroup {
  kind: GraceMarkRecurringSeveranceKind;
  synonyms: readonly string[];
  excludedWords?: readonly string[];
}

/**
 * Provider names for the same recurring severance costs vary considerably.
 * Keep universal aliases and country-specific terms in one list so Papaya
 * gap-fill rows can be skipped when a provider supplied the same cost.
 *
 * Interest groups must come before fund groups. For example, Colombia's
 * "Interest to Unemployment Contribution (Cesantias)" contains "Cesantias"
 * but represents interest, not the underlying fund.
 */
export const RECURRING_SEVERANCE_SYNONYMS: Readonly<
  Record<string, readonly RecurringSeveranceSynonymGroup[]>
> = {
  ALL: [
    {
      kind: "interest",
      synonyms: [
        "severance interest",
        "interest on severance",
        "interest on severance liability",
        "interest on severance fund",
        "termination fund interest",
        "interest on termination fund",
      ],
    },
    {
      kind: "fund",
      synonyms: [
        "severance accrual",
        "severance liability",
        "severance pay",
        "severance pay accrual",
        "severance fund",
        "severance reserve",
        "severance provision",
        "employee severance fund",
        "employee severance reserve",
        "termination benefit fund",
        "termination benefit reserve",
        "termination indemnity accrual",
        "termination indemnity fund",
        "end of service accrual",
        "end of service benefit accrual",
        "end of service benefit fund",
        "end of service provision",
        "end of service reserve",
        "separation pay accrual",
        "separation fund",
      ],
    },
  ],
  BR: [
    {
      kind: "fund",
      synonyms: [
        "fgts",
        "time of service guarantee fund",
        "fund of guarantee for the time in service",
        "employee severance indemnity fund",
        "employees severance indemnity fund",
      ],
      excludedWords: ["penalty", "fine", "termination"],
    },
  ],
  CO: [
    {
      kind: "interest",
      synonyms: [
        "interest on cesantias",
        "cesantias interest",
        "interest to unemployment contribution",
        "interest on unemployment contribution",
      ],
    },
    {
      kind: "fund",
      synonyms: [
        "cesantia",
        "cesantias",
        "unemployment cesantias",
      ],
    },
  ],
  IN: [
    {
      kind: "fund",
      synonyms: [
        "gratuity",
        "gratuity accrual",
        "gratuity provision",
        "gratuity fund",
      ],
    },
  ],
  IL: [
    {
      kind: "fund",
      synonyms: [
        "pitzuim",
        "severance",
      ],
    },
  ],
  IT: [
    {
      kind: "fund",
      synonyms: [
        "tfr",
        "trattamento di fine rapporto",
        "termination severance fund",
        "severance accrual trattamento di fine rapporto",
      ],
    },
  ],
  PE: [
    {
      kind: "fund",
      synonyms: [
        "cts",
        "compensation for time of service",
        "compensacion por tiempo de servicios",
        "monthly cts accrual",
      ],
    },
  ],
  KR: [
    {
      kind: "fund",
      synonyms: [
        "retirement benefit",
        "retirement allowance",
        "retirement pay",
        "retirement allowance provision",
      ],
    },
  ],
  TR: [
    {
      kind: "fund",
      synonyms: [
        "kidem",
      ],
    },
  ],
};

function containsSynonym(name: string, synonym: string): boolean {
  const normalizedSynonym = normalizeCostName(synonym);

  // A bare "severance" alias is useful for Israel, but must not match every
  // longer termination-related label containing that word.
  if (normalizedSynonym === "severance") return name === normalizedSynonym;

  return ` ${name} `.includes(` ${normalizedSynonym} `);
}

export function classifyGraceMarkRecurringSeveranceCost(
  countryCode: string,
  lineName: string,
): GraceMarkRecurringSeveranceKind | null {
  const code = countryCode.toUpperCase();
  const name = normalizeCostName(lineName);
  const countryGroups = RECURRING_SEVERANCE_SYNONYMS[code];

  // Only countries whose GraceMark template identifies a recurring fund use
  // this classification. The ALL aliases are shared by every such country;
  // country groups add local legal and provider terminology.
  if (!countryGroups) return null;

  const groups = [
    ...(RECURRING_SEVERANCE_SYNONYMS.ALL ?? []),
    ...countryGroups,
  ];

  for (const group of groups) {
    if (
      group.excludedWords?.some((word) =>
        containsSynonym(name, word),
      )
    ) {
      continue;
    }
    if (group.synonyms.some((synonym) => containsSynonym(name, synonym))) {
      return group.kind;
    }
  }

  return null;
}

export function isGraceMarkRecurringSeveranceCost(
  countryCode: string,
  lineName: string,
): boolean {
  return classifyGraceMarkRecurringSeveranceCost(countryCode, lineName) !== null;
}

/** Convert GraceMark's country percentage into a monthly quote-currency row. */
export function calculateGraceMarkSeveranceLine({
  countryCode,
  annualSalary,
}: CalculateGraceMarkSeveranceArgs): CostLine | null {
  if (!Number.isFinite(annualSalary) || annualSalary <= 0) return null;

  const ratePercent = getGraceMarkSeveranceRate(countryCode);
  if (ratePercent == null || ratePercent <= 0) return null;

  const monthlyAmount = Math.round(
    ((annualSalary / 12) * (ratePercent / 100) + Number.EPSILON) * 100,
  ) / 100;

  return {
    name: `Severance/Termination Accrual (${ratePercent}%)`,
    amount: monthlyAmount,
    frequency: "monthly",
    category: "severance",
    bucket: "termination_costs",
  };
}
