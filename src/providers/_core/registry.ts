import "server-only";

import type { ProviderId, QuoteProvider } from "./types";

const providers: Partial<Record<ProviderId, QuoteProvider>> = {};

export function registerProvider(provider: QuoteProvider): void {
  providers[provider.id] = provider;
}

export function getProvider(id: ProviderId): QuoteProvider {
  const provider = providers[id];
  if (!provider) {
    throw new Error(`Provider "${id}" is not registered.`);
  }
  return provider;
}

export function listProviders(): QuoteProvider[] {
  return Object.values(providers).filter(
    (p): p is QuoteProvider => p !== undefined
  );
}
