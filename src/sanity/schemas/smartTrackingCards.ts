import { defineField, defineType } from "sanity";

/**
 * Smart Tracking app feature cards (home page "App Features" carousel).
 * Singleton, mirrors the `siteStats` pattern: an ordered array editors can
 * reorder/add to, each entry a single composite image (title + description +
 * mockup are baked into the artwork itself, same as the hardcoded fallback
 * SVGs in `SMART_TRACKING_CARDS`) plus alt text for accessibility.
 */
export const smartTrackingCards = defineType({
  name: "smartTrackingCards",
  title: "Smart Tracking Cards",
  type: "document",
  fields: [
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      of: [
        {
          type: "object",
          name: "card",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              description: "Composite card graphic (title/description/mockup baked in).",
              options: { hotspot: false },
              validation: (R) => R.required(),
            }),
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              description: "Describe what the card shows, for accessibility.",
              validation: (R) => R.required().max(160),
            }),
            defineField({
              name: "order",
              title: "Display order",
              type: "number",
              initialValue: 0,
            }),
          ],
          preview: {
            select: { title: "alt", media: "image" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Smart Tracking Cards" }),
  },
});
