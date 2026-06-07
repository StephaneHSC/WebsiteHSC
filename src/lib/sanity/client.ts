import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/**
 * Public CDN-backed Sanity client for read-only queries from Server Components.
 * Per CLAUDE.md §6, all GROQ queries must run server-side using this client.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
