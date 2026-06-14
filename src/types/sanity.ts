/**
 * TypeScript return types for the GROQ queries in `src/lib/sanity/queries.ts`.
 * Hand-written for now; can swap to sanity-codegen later for auto-generation.
 */

import type { PortableTextBlock } from "next-sanity";

export type SanityImage = {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
};

export type TeamMember = {
  _id: string;
  full_name: string;
  role: string;
  department?: string;
  photo: SanityImage;
  short_bio?: string;
  long_bio?: PortableTextBlock[];
  social_links?: { linkedin?: string; email?: string };
  is_featured?: boolean;
};

export type Testimonial = {
  _id: string;
  customer_name: string;
  company: string;
  logo?: SanityImage;
  photo?: SanityImage;
  quote: string;
  rating: number;
  service_tag?: string;
};

export type Milestone = {
  _id: string;
  year: number;
  headline: string;
  description: string;
  image: SanityImage;
};

/** Quote form configuration — PDF §4.2 spec verbatim + `form_mode` toggle. */
export type QuoteFormConfig = {
  form_mode: "custom" | "embed";
  hero_headline: string;
  hero_image?: SanityImage;
  recipient_email: string;
  success_message: string;
  form_enabled: boolean;
  /** Used only when `form_mode === "embed"`. Raw HTML iframe snippet. */
  form_embed_code?: string;
};

export type SiteStat = {
  value: string;
  label: string;
  icon?: SanityImage;
  order: number;
};

export type SiteStats = {
  stats: SiteStat[];
};

export type ShowcaseGalleryImage = {
  image: SanityImage;
  caption?: string;
};

export type ShowcaseItemGallery = {
  slug: string;
  gallery_images: ShowcaseGalleryImage[];
};
