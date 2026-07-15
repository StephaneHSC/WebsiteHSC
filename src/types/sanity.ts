/**
 * TypeScript return types for the GROQ queries in `src/lib/sanity/queries.ts`.
 * Hand-written for now; can swap to sanity-codegen later for auto-generation.
 */

import type { PortableTextBlock } from "next-sanity";

export type SanityImage = {
  _type: "image";
  asset: { _ref: string; _type: "reference"; url?: string; mimeType?: string };
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

/**
 * Gallery strip item — image or video. Discriminate by the presence of
 * `url` (video) vs `image` (image); `_type` is "galleryImage"/"galleryVideo"
 * for new documents but may be a legacy anonymous object type for docs
 * created before videos were supported.
 */
export type ShowcaseGalleryImage = {
  _type?: string;
  image?: SanityImage;
  caption?: string;
  /** Video-only: direct MP4 URL (fallback). */
  url?: string;
  /** Video-only: resolved URL of the uploaded Sanity file asset. */
  fileUrl?: string;
  /** Video-only: optional poster still. */
  poster?: SanityImage;
};

export type ShowcaseItemGallery = {
  slug: string;
  gallery_images: ShowcaseGalleryImage[];
};

/** Full CMS-managed showcase tile (2026-07) — see sanity/schemas/showcaseItem.ts. */
export type ShowcaseItemDoc = {
  slug: string;
  order: number;
  image: SanityImage;
  alt: string;
  /** Resolved URL of the uploaded tile video (modal slide 1 when set). */
  tile_video_file?: string;
  /** Fallback direct MP4 URL for the tile video. */
  tile_video_url?: string;
  label?: string[];
  has_play_icon?: boolean;
  shape: "tall" | "medium" | "short" | "extra-short";
  desktop_column: number;
  mobile_column: number;
  related_services?: string[];
  modal_title: string;
  modal_subtitle?: string;
  aircraft?: string;
  modal_description: string[];
  transport_mode?: string;
  /** Mixed slideshow: images + video slides, editor-ordered. */
  modal_media?: Array<
    | (SanityImage & { _type: "image" })
    | {
        _type: "videoSlide";
        /** Fallback direct MP4 URL. */
        url?: string;
        /** Resolved URL of the uploaded Sanity file asset (preferred). */
        fileUrl?: string;
        poster?: SanityImage;
      }
  >;
  /** @deprecated Legacy fields — superseded by modal_media, still rendered. */
  media_photos?: SanityImage[];
  video_url?: string;
  gallery_images?: ShowcaseGalleryImage[];
};
