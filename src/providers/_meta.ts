/**
 * Static, client-safe provider metadata.
 *
 * This module exists so the client (UI components, the quote page) can know
 * which providers exist, what to call them, and which logo to render — WITHOUT
 * importing any provider adapter module. Adapter modules pull in HTTP clients,
 * GraphQL query strings, and mapping logic; none of that needs to ship to the
 * client for it to render a logo or count skeleton cards.
 *
 * Adding a new provider = one entry here + the adapter folder + a registration
 * line in `_core/register-all.ts`. UI stays metadata-driven.
 *
 * Only a *type* is imported from `_core/types` (ProviderId) so this module
 * remains free of runtime cycles with the registry.
 */

import type { ProviderId } from "@/providers/_core/types";

export interface ProviderMeta {
  id: ProviderId;
  display_name: string;
  logo_src: string;
}

export const PROVIDERS_META: readonly ProviderMeta[] = [
  { id: "deel", display_name: "Deel", logo_src: "/deel-logo.svg" },
  { id: "remote", display_name: "Remote", logo_src: "/remote-logo.svg" },
  { id: "oyster", display_name: "Oyster", logo_src: "/oyster-logo.svg" },
  { id: "rippling", display_name: "Rippling", logo_src: "/rippling-logo.svg" },
  { id: "pebl", display_name: "Pebl", logo_src: "/pebl-logo.svg" },
  { id: "rivermate", display_name: "Rivermate", logo_src: "/rivermate-logo.svg" },
  { id: "payoneer", display_name: "Payoneer", logo_src: "/payoneer-logo.svg" },
  { id: "playroll", display_name: "Playroll", logo_src: "/playroll-logo.svg" },
];

export function getProviderMeta(id: string): ProviderMeta | undefined {
  return PROVIDERS_META.find((p) => p.id === id);
}
