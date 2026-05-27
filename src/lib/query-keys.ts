/**
 * Query key for a single (quote × provider × country) cell in the per-provider
 * fan-out. The id partitions queries by saved-quote so two open tabs on
 * different quote pages don't collide; provider + country_code uniquely
 * identifies the cell within one quote.
 */
export const providerQuoteQueryKey = (
  id: string,
  providerId: string,
  countryCode: string
) => ["provider-quote", id, providerId, countryCode] as const;
