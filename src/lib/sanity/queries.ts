/**
 * GROQ query strings — all CMS reads happen via these named exports.
 * Per CLAUDE.md §6, never inline GROQ in components.
 *
 * Each query has a matching TypeScript return type in `src/types/sanity.ts`.
 * Skeleton — full projections will be filled in as modules consume them.
 */

/** All published team members, ordered by display order. */
export const teamMembersQuery = /* groq */ `
  *[_type == "teamMember" && status == "published"] | order(order asc) {
    _id,
    full_name,
    role,
    department,
    photo,
    short_bio,
    long_bio,
    social_links,
    is_featured
  }
`;

/**
 * Testimonials shown on the public site. Editors gate visibility with
 * `is_featured` (visibility toggle) and arrange the list with `order`.
 * Non-featured published entries are hidden entirely — the home section
 * shows the first 3 by default, with "View All Reviews" expanding to the
 * rest of the featured list.
 */
export const allTestimonialsQuery = /* groq */ `
  *[_type == "testimonial" && status == "published" && is_featured == true] | order(order asc) {
    _id,
    customer_name,
    company,
    logo,
    photo,
    quote,
    rating,
    service_tag
  }
`;

/** All milestones, newest year first (display order). */
export const milestonesQuery = /* groq */ `
  *[_type == "milestone"] | order(year desc, order desc) {
    _id,
    year,
    headline,
    description,
    image
  }
`;

/**
 * Quote form configuration (singleton). PDF §4.2's 6 spec fields + `form_mode`
 * toggle. Dead fields (transport_modes, helicopter_models, transaction_types,
 * step_titles) were removed 2026-05-13 — the frontend uses hardcoded constants.
 */
export const quoteFormConfigQuery = /* groq */ `
  *[_type == "quoteFormConfig"][0]{
    form_mode,
    hero_headline,
    hero_image,
    recipient_email,
    success_message,
    form_enabled,
    form_embed_code
  }
`;

/** Site stats (singleton with repeater). */
export const siteStatsQuery = /* groq */ `
  *[_type == "siteStats"][0]{
    "stats": stats[] | order(order asc) {
      value,
      label,
      icon { ..., asset->{ url, mimeType } },
      order
    }
  }
`;

/**
 * Showcase gallery images for a specific item, matched by slug.
 * Returns null when no document exists for the given slug (galleries are optional).
 */
export const showcaseGalleryQuery = /* groq */ `
  *[_type == "showcaseItem" && slug == $slug][0]{
    slug,
    "gallery_images": gallery_images[] {
      image,
      caption
    }
  }
`;

/**
 * All showcase gallery images, keyed by slug. Returns an array of
 * `{ slug, gallery_images }` entries — the caller maps to a Record.
 */
export const allShowcaseGalleriesQuery = /* groq */ `
  *[_type == "showcaseItem" && defined(gallery_images) && count(gallery_images) > 0]{
    slug,
    "gallery_images": gallery_images[] {
      image,
      caption
    }
  }
`;

/**
 * All showcase tiles, fully CMS-managed (2026-07). Ordered by `order`.
 * When this returns an empty array the frontend falls back to the
 * hardcoded SHOWCASE_TILES in constants.ts.
 */
export const allShowcaseItemsQuery = /* groq */ `
  *[_type == "showcaseItem" && defined(image) && defined(modal_title)] | order(order asc) {
    slug,
    order,
    image,
    alt,
    label,
    has_play_icon,
    shape,
    desktop_column,
    mobile_column,
    related_services,
    modal_title,
    modal_subtitle,
    aircraft,
    modal_description,
    transport_mode,
    media_photos,
    video_url,
    "gallery_images": gallery_images[] {
      image,
      caption
    }
  }
`;
