import { defineField, defineType } from "sanity";

/**
 * Global office locations ("Our Offices" band above the footer on most
 * pages). Singleton, mirrors the `siteStats` / `smartTrackingCards` pattern:
 * an ordered array editors can add/reorder/edit, falling back to the
 * hardcoded `OFFICES` constant while empty.
 */
export const officeLocations = defineType({
  name: "officeLocations",
  title: "Office Locations",
  type: "document",
  fields: [
    defineField({
      name: "offices",
      title: "Offices",
      type: "array",
      of: [
        {
          type: "object",
          name: "office",
          fields: [
            defineField({
              name: "officeId",
              title: "ID",
              type: "string",
              description:
                'Short unique slug (e.g. "hk", "usa") — used by pages that want a specific office active by default.',
              validation: (R) => R.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              description: 'Small label above the country name, e.g. "Heli Skycargo Limited".',
              validation: (R) => R.required(),
            }),
            defineField({
              name: "country",
              title: "Country",
              type: "string",
              validation: (R) => R.required(),
            }),
            defineField({
              name: "address",
              title: "Address",
              type: "string",
              validation: (R) => R.required(),
            }),
            defineField({
              name: "phone",
              title: "Phone",
              type: "string",
              validation: (R) => R.required(),
            }),
            defineField({
              name: "email",
              title: "Email",
              type: "string",
              validation: (R) => R.required().email(),
            }),
            defineField({
              name: "cityscape",
              title: "Cityscape photo",
              type: "image",
              description: "Background photo shown when this office is active.",
              options: { hotspot: false },
              validation: (R) => R.required(),
            }),
            defineField({
              name: "order",
              title: "Display order",
              type: "number",
              initialValue: 0,
            }),
          ],
          preview: {
            select: { title: "country", subtitle: "label", media: "cityscape" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Office Locations" }),
  },
});
