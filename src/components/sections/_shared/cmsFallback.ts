import { client } from "@/lib/sanity/client";

/**
 * Fetches a Sanity GROQ query and falls back to a static placeholder list when
 * the CMS returns nothing. Keeps every section's "real or placeholder" branch
 * in one place. Each section keeps its own type guard for distinguishing the
 * two shapes at render time.
 */
export async function fetchWithCmsFallback<R, P>(
  query: string,
  fallback: readonly P[],
  limit: number,
): Promise<readonly (R | P)[]> {
  const real = await client.fetch<R[]>(query, {}, { next: { revalidate: 60 } });
  return real.length > 0 ? real.slice(0, limit) : fallback;
}
