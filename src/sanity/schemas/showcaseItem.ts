import { defineField, defineType } from "sanity";

/**
 * Showcase tile — fully CMS-managed as of 2026-07 (was: hardcoded tiles +
 * CMS-only gallery images). When ANY showcaseItem documents exist, the
 * frontend renders tiles from Sanity ordered by `order`; when none exist it
 * falls back to the hardcoded `SHOWCASE_TILES` in constants.ts.
 */
export const showcaseItem = defineType({
  name: "showcaseItem",
  title: "Showcase Item",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "string",
      description: "Unique id for this tile (e.g. 'japan-desk'). Lowercase, hyphens, no spaces.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description:
        "Position in the mosaic (1 = first). The home page shows the first 8; /showcase shows all.",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "image",
      title: "Tile Photo",
      type: "image",
      description: "Main photo shown on the mosaic tile and as the modal's first slide.",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Image Alt Text",
      type: "string",
      description: "Short description of the photo for accessibility/SEO.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "label",
      title: "Tile Label Lines",
      type: "array",
      of: [{ type: "string" }],
      description:
        'Text overlay on the tile, one entry per visual line (e.g. "From", "Belgium", "to", "Cameroon"). Leave empty for a photo-only tile.',
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "has_play_icon",
      title: "Show Play Icon",
      type: "boolean",
      description: "Renders the red play circle over the tile (for video tiles).",
      initialValue: false,
    }),
    defineField({
      name: "shape",
      title: "Tile Shape",
      type: "string",
      options: {
        list: [
          { title: "Tall (340×560)", value: "tall" },
          { title: "Medium (340×494)", value: "medium" },
          { title: "Short (340×300)", value: "short" },
          { title: "Extra Short (340×270)", value: "extra-short" },
        ],
        layout: "radio",
      },
      initialValue: "short",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "desktop_column",
      title: "Desktop Column (0–3)",
      type: "number",
      description: "Which of the 4 desktop masonry columns the tile lands in.",
      validation: (Rule) => Rule.required().min(0).max(3).integer(),
    }),
    defineField({
      name: "mobile_column",
      title: "Mobile Column (0–1)",
      type: "number",
      description: "Which of the 2 mobile masonry columns the tile lands in.",
      validation: (Rule) => Rule.required().min(0).max(1).integer(),
    }),
    defineField({
      name: "related_services",
      title: "Related Services",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Ocean RO/RO", value: "ocean-roro" },
          { title: "Ocean LO/LO", value: "ocean-lolo" },
          { title: "Ocean FCL", value: "ocean-fcl" },
          { title: "Road Freight", value: "road-freight" },
          { title: "Air Commercial", value: "air-commercial" },
          { title: "Air Chartering", value: "air-chartering" },
        ],
      },
      description:
        "Service detail pages show only tiles tagged with their service. Leave empty to show on every service page.",
    }),
    defineField({
      name: "modal_title",
      title: "Modal Title",
      type: "string",
      description: 'Header line in the popup, e.g. "From Switzerland to India".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "modal_subtitle",
      title: "Modal Subtitle (optional)",
      type: "string",
      description: 'Small second header line, e.g. "AW139 By Ocean LO/LO".',
    }),
    defineField({
      name: "aircraft",
      title: "Aircraft Model (optional)",
      type: "string",
      description:
        'Renders the large red "AIRCRAFT: …" line in the popup. Free text — e.g. "Airbus H125", "Sikorsky S-92", or "Various".',
    }),
    defineField({
      name: "modal_description",
      title: "Modal Description",
      type: "array",
      of: [{ type: "text", rows: 3 }],
      description:
        'Story paragraphs shown in the popup (one entry per paragraph). Formatting: **word** = bold; lines starting with "- " = bullet list; lines starting with "1. ", "2. " = numbered list.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "transport_mode",
      title: "Transport Mode (for quote prefill)",
      type: "string",
      options: {
        list: [
          "Air Commercial",
          "Air Charter (AN-124)",
          "Ocean Freight (RoRo)",
          "Ocean Freight (LoLo)",
          "Ocean Freight (FCL)",
          "Road Freight",
        ],
      },
      description:
        "Not shown on the site — preselects the transport mode when a visitor clicks Request Quote from this tile's popup.",
    }),
    defineField({
      name: "modal_media",
      title: "Modal Slideshow Media",
      type: "array",
      description:
        "Slides for the popup's main carousel, after the tile photo (always slide 1). Mix photos and videos in any order — drag to reorder.",
      of: [
        { type: "image", options: { hotspot: true } },
        {
          type: "object",
          name: "videoSlide",
          title: "Video",
          fields: [
            defineField({
              name: "url",
              title: "Video URL",
              type: "url",
              description: "Direct MP4 URL (e.g. a Sanity file asset URL or CDN link).",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "poster",
              title: "Poster Image (optional)",
              type: "image",
              options: { hotspot: true },
              description: "Still shown before play. Defaults to the tile photo when empty.",
            }),
          ],
          preview: {
            select: { media: "poster", title: "url" },
            prepare({ media, title }) {
              return { media, title: title ?? "Video slide" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "gallery_images",
      title: "Gallery Images",
      type: "array",
      description:
        "4–5 additional images shown as thumbnail tiles below the main photo in the showcase modal.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption (optional)",
              type: "string",
            }),
          ],
          preview: {
            select: { media: "image", title: "caption" },
            prepare({ media, title }) {
              return { media, title: title ?? "Gallery image" };
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(8),
    }),
  ],
  orderings: [
    {
      title: "Mosaic order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "modal_title", subtitle: "slug", media: "image" },
    prepare({ title, subtitle, media }) {
      return { title: title ?? subtitle ?? "Untitled showcase item", subtitle, media };
    },
  },
});
