import { defineField, defineType } from "sanity";

export const milestone = defineType({
  name: "milestone",
  title: "Milestone",
  type: "document",
  fields: [
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (R) => R.required().integer().min(2000).max(2100),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (R) => R.required().max(200),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Used when multiple milestones share the same year.",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Year, ascending",
      name: "yearAsc",
      by: [
        { field: "year", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "headline", subtitle: "year", media: "image" },
  },
});
