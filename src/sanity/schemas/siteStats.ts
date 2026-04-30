import { defineField, defineType } from "sanity";

export const siteStats = defineType({
  name: "siteStats",
  title: "Site Stats / KPIs",
  type: "document",
  fields: [
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      of: [
        {
          type: "object",
          name: "stat",
          fields: [
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              description: 'e.g. "1000+", "24/7", "50+", "2014"',
              validation: (R) => R.required().max(8),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              description: 'e.g. "Shipments", "Support", "Clients"',
              validation: (R) => R.required().max(24),
            }),
            defineField({
              name: "icon",
              title: "Icon (optional)",
              type: "image",
              options: { hotspot: false },
            }),
            defineField({
              name: "order",
              title: "Display order",
              type: "number",
              initialValue: 0,
            }),
          ],
          preview: {
            select: { title: "value", subtitle: "label", media: "icon" },
          },
        },
      ],
      validation: (R) => R.length(4).warning("Layout expects exactly 4 stats."),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Stats / KPIs" }),
  },
});
