import { defineField, defineType } from "sanity";

export const showcaseItem = defineType({
  name: "showcaseItem",
  title: "Showcase Item",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "string",
      description:
        "Must match exactly the slug used in the frontend constants (e.g. 'japan-desk', 'antonov-an124'). Case-sensitive.",
      validation: (Rule) => Rule.required(),
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
  preview: {
    select: { title: "slug" },
    prepare({ title }) {
      return { title: title ?? "Untitled showcase item" };
    },
  },
});
