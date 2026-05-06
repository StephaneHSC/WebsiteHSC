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

/** Featured testimonials for the home page customers section. */
export const featuredTestimonialsQuery = /* groq */ `
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
 * Quote form configuration (singleton).
 * Returns both Path A (embed) and Path B (custom) fields; the frontend reads
 * `form_mode` to decide which to use.
 */
export const quoteFormConfigQuery = /* groq */ `
  *[_type == "quoteFormConfig"][0]{
    form_mode,
    hero_headline,
    hero_image,
    recipient_email,
    success_message,
    form_enabled,
    form_embed_code,
    form_endpoint,
    transport_modes,
    helicopter_models,
    transaction_types,
    step_titles
  }
`;

/** Site stats (singleton with repeater). */
export const siteStatsQuery = /* groq */ `
  *[_type == "siteStats"][0]{
    "stats": stats[] | order(order asc) {
      value,
      label,
      icon,
      order
    }
  }
`;
