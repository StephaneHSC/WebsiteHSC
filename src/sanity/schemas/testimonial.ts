import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "customer_name",
      title: "Customer name",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "logo",
      title: "Company logo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "photo",
      title: "Customer photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      validation: (R) => R.required().max(280),
    }),
    defineField({
      name: "rating",
      title: "Rating (1-5 stars)",
      type: "number",
      validation: (R) => R.required().integer().min(1).max(5),
    }),
    defineField({
      name: "service_tag",
      title: "Related service",
      type: "string",
      options: {
        list: [
          { title: "Ocean Ro/Ro", value: "ocean-roro" },
          { title: "Ocean Lo/Lo", value: "ocean-lolo" },
          { title: "Ocean FCL", value: "ocean-fcl" },
          { title: "Road Freight", value: "road-freight" },
          { title: "Air Commercial", value: "air-commercial" },
          { title: "Air Chartering", value: "air-chartering" },
        ],
      },
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "is_featured",
      title: "Show on home page",
      type: "boolean",
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
  preview: {
    select: { title: "customer_name", subtitle: "company", media: "logo" },
  },
});
