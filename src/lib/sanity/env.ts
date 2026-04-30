/**
 * Sanity environment configuration.
 * Set these in `.env.local` (see `.env.example` for the canonical list).
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

/**
 * Token used for authenticated mutations / drafts. NEVER ship to the client.
 * Reserved for server-side operations (revalidation webhooks, etc.).
 */
export const readToken = process.env.SANITY_API_READ_TOKEN ?? "";
