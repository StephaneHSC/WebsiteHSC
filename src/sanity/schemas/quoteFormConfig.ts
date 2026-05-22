import { defineField, defineType } from "sanity";

/**
 * Quote form configuration — singleton.
 *
 * Implements PDF §4.2's 6 client-spec fields verbatim:
 *   1. hero_headline
 *   2. hero_image
 *   3. form_embed_code
 *   4. recipient_email
 *   5. success_message
 *   6. form_enabled
 *
 * Plus a `form_mode` toggle (custom vs embed) so an editor can swap between
 * the Figma-matching React form and a third-party iframe embed without a
 * code change. When `form_mode === "embed"`, the editor pastes raw HTML in
 * `form_embed_code` (sanitized to `<iframe>` allow-list); when `"custom"`,
 * the React form renders.
 *
 * Cleanup history:
 *   2026-05-11  Removed `form_endpoint` (Resend + `/api/quote` replaced it).
 *   2026-05-13  Removed `transport_modes`, `helicopter_models`,
 *               `transaction_types`, `step_titles`. These fields were dead
 *               code paths — the frontend uses hardcoded constants
 *               (`QUOTE_TRANSPORT_MODES`, `QUOTE_HELICOPTER_MODELS_BY_BRAND`,
 *               `QUOTE_TRANSACTION_TYPES`) so editing them changed nothing.
 *               Per "PDF spec verbatim" request.
 */
export const quoteFormConfig = defineType({
  name: "quoteFormConfig",
  title: "Quote Form Configuration",
  type: "document",
  fields: [
    defineField({
      name: "form_mode",
      title: "Form path",
      type: "string",
      options: {
        list: [
          { title: "Custom React form (matches Figma exactly)", value: "custom" },
          {
            title: "Iframe embed (paste HTML from Tally / Google Forms / Typeform / etc.)",
            value: "embed",
          },
        ],
        layout: "radio",
      },
      initialValue: "custom",
      validation: (R) => R.required(),
      description:
        "Switch between the Figma-matching React form and a third-party iframe embed. No code change needed — the frontend reads this at runtime and renders the appropriate path. `form_embed_code` below is only used when this is set to Iframe embed.",
    }),

    defineField({
      name: "hero_headline",
      title: "Hero headline",
      type: "text",
      rows: 3,
      description:
        "Multi-line override that replaces the H1 on /quote AND the headline on every embedded quote-form section (home, services, service-detail, team, why-choose-us, showcase). Each newline = a line break in the rendered headline. SPECIAL CASE: if the value is the canonical 'Share Your Shipment Details. We'll Handle The Rest.' (any casing/punctuation/whitespace), the Figma per-breakpoint break patterns are used instead — desktop 2 lines, mobile 3 lines (because the mobile layout uses a different word grouping that a single text field can't express). Edit to anything else and your own newline breaks apply uniformly.",
    }),

    defineField({
      name: "hero_image",
      title: "Hero background image",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional override that replaces the photo on /quote AND on every embedded quote-form section across the site. Leave blank to keep each placement's hardcoded context photo (Antonov AN-124 loading scene on /quote; per-page photos on home / services / team / etc.).",
    }),

    defineField({
      name: "recipient_email",
      title: "Recipient email",
      type: "string",
      description:
        "Where quote submissions land. Read by /api/quote at submit time and passed to Resend's `to:` field — so editing this propagates to the next submission within ~60 seconds (no deploy). Leave blank to fall back to the OPS_INBOX_FALLBACK env var.",
    }),

    defineField({
      name: "success_message",
      title: "Success message",
      type: "text",
      rows: 2,
      initialValue: "Thank you for your enquiry. Our ops team will reply within 24 hours.",
      description:
        "Body shown on the in-page success card after a successful submission. Also reused as the maintenance card body when `form_enabled` is off.",
    }),

    defineField({
      name: "form_enabled",
      title: "Form enabled",
      type: "boolean",
      description:
        "Master switch. When off, the form is replaced everywhere (standalone /quote + every embedded placement) with a maintenance card.",
      initialValue: true,
    }),

    defineField({
      name: "form_embed_code",
      title: "Iframe embed code",
      type: "text",
      rows: 8,
      description:
        "Raw HTML iframe snippet from Tally, Google Forms, Typeform, Formspree, Calendly, etc. The frontend sanitizes to an `<iframe>` allow-list (rejects `<script>`, `on*` event handlers, non-https `src`) and renders it. Only used when Form path = Iframe embed.",
      hidden: ({ document }) => document?.form_mode !== "embed",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Quote Form Configuration" }),
  },
});
