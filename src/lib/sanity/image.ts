import imageUrlBuilder from "@sanity/image-url";
import { client } from "./client";

const builder = imageUrlBuilder(client);

/** Derive the input type accepted by `builder.image()` straight from the function signature. */
type SanityImageSource = Parameters<typeof builder.image>[0];

/**
 * Build an optimized Sanity CDN image URL.
 * Usage: urlFor(image).width(800).format("webp").quality(80).url()
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
