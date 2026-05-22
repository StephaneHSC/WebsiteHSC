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
 * All published testimonials, featured first. Used by the home testimonials
 * section's "View All Reviews" expand: initial render shows the top 3 (which
 * are the featured ones when there are ≥3); clicking the button reveals the
 * remaining published entries in subsequent rows of 3.
 */
export const allTestimonialsQuery = /* groq */ `
  *[_type == "testimonial" && status == "published"] | order(is_featured desc, order asc) {
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
      icon,
      order
    }
  }
`;
