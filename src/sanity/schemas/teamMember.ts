import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Team Member",
  type: "document",
  fields: [
    defineField({
      name: "full_name",
      title: "Full name",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "role",
      title: "Role / job title",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "department",
      title: "Department",
      type: "string",
      description: "Optional grouping (operations, sales, etc.)",
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "short_bio",
      title: "Short bio",
      type: "text",
      rows: 2,
      description: "One-liner shown under the grid thumbnail (≤140 chars).",
      validation: (R) => R.max(140),
    }),
    defineField({
      name: "long_bio",
      title: "Long bio",
      type: "array",
      of: [{ type: "block" }],
      description: "Full bio shown in the spotlight view.",
    }),
    defineField({
      name: "social_links",
      title: "Social links",
      type: "object",
      fields: [
        { name: "linkedin", title: "LinkedIn URL", type: "url" },
        { name: "email", title: "Email", type: "string" },
      ],
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "is_featured",
      title: "Featured (default spotlight)",
      type: "boolean",
      description: "Only one team member should be featured at a time.",
      initialValue: false,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: { list: ["draft", "published"], layout: "radio" },
      initialValue: "draft",
      validation: (R) => R.required(),
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "full_name", subtitle: "role", media: "photo" },
  },
});
