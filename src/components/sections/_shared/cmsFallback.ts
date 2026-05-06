import { client } from "@/lib/sanity/client";

/**
 * Fetches a Sanity GROQ query and falls back to a static placeholder list when
 * the CMS returns nothing. Keeps every section's "real or placeholder" branch
 * in one place. Each section keeps its own type guard for distinguishing the
 * two shapes at render time.
 *
 * Pass `limit` to truncate the real result; omit it to return the full list.
 */
export async function fetchWithCmsFallback<R, P>(
  query: string,
  fallback: readonly P[],
  limit?: number,
): Promise<readonly (R | P)[]> {
  const real = await client.fetch<R[]>(query, {}, { next: { revalidate: 60 } });
  if (real.length === 0) return fallback;
  return typeof limit === "number" ? real.slice(0, limit) : real;
}
