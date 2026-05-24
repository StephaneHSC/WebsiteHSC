import type { Metadata } from "next";

type PageMeta = {
  /** Browser tab title — augmented by the root layout template `%s | Heli Skycargo`. */
  title: string;
  description: string;
  /** Absolute path on this site (e.g. `/team`). Used for canonical + OG url. */
  path: string;
};

/**
 * Build a page-level Metadata object with title + description + canonical +
 * matching OpenGraph and Twitter overrides. Without explicit OG/Twitter
 * overrides, those tags inherit from the root layout and don't reflect the
 * specific page, so social-share previews on `/team` (etc.) would show the
 * home-page card.
 */
export function pageMetadata({ title, description, path }: PageMeta): Metadata {
  const fullTitle = `${title} | Heli Skycargo`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
    },
    twitter: {
      title: fullTitle,
      description,
    },
  };
}
