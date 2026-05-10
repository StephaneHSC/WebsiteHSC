import { client } from "@/lib/sanity/client";

/**
 * Fetches a Sanity GROQ query and falls back to a static placeholder list when
 * the CMS returns nothing. Keeps every section's "real or placeholder" branch
 * in one place. Each section keeps its own type guard for distinguishing the
 * two shapes at render time.
 *
 * Pass `limit` to truncate to the first N entries; the limit is applied to
 * both the CMS path and the fallback path so callers get the same length
 * either way.
 */
export async function fetchWithCmsFallback<R, P>(
  query: string,
  fallback: readonly P[],
  limit?: number,
): Promise<readonly (R | P)[]> {
  const real = await client.fetch<R[]>(query, {}, { next: { revalidate: 60 } });
  const source: readonly (R | P)[] = real.length === 0 ? fallback : real;
  return typeof limit === "number" ? source.slice(0, limit) : source;
}
