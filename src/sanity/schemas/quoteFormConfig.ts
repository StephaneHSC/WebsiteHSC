import { defineField, defineType } from "sanity";

export const quoteFormConfig = defineType({
  name: "quoteFormConfig",
  title: "Quote Form Configuration",
  type: "document",
  fieldsets: [
    {
      name: "common",
      title: "Hero & general settings",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "embed",
      title: "Path A — iframe embed (no-code form tool)",
      description: "Used when Form path is set to Iframe embed.",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "custom",
      title: "Path B — custom React form (matches Figma)",
      description: "Used when Form path is set to Custom React form.",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "form_mode",
      title: "Form path",
      type: "string",
      options: {
        list: [
          { title: "Custom React form (matches Figma exactly)", value: "custom" },
          {
            title: "Iframe embed (paste HTML from Tally / Formspree / etc.)",
            value: "embed",
          },
        ],
        layout: "radio",
      },
      initialValue: "custom",
      validation: (R) => R.required(),
      description:
        "Picks which fields below the frontend uses at runtime. Switch path without a code change.",
    }),

    // ── Common settings ─────────────────────────────────────────────
    defineField({
      name: "hero_headline",
      title: "Hero headline",
      type: "string",
      initialValue: "Share Your Shipment Details — We'll Handle The Rest.",
      fieldset: "common",
    }),
    defineField({
      name: "hero_image",
      title: "Hero background image",
      type: "image",
      options: { hotspot: true },
      fieldset: "common",
    }),
    defineField({
      name: "recipient_email",
      title: "Recipient email (display / audit)",
      type: "string",
      description:
        "Where submissions land. Real routing is configured inside the form provider — this field is for editor reference.",
      fieldset: "common",
    }),
    defineField({
      name: "success_message",
      title: "Success message",
      type: "text",
      rows: 2,
      initialValue: "Thank you for your enquiry. Our ops team will reply within 24 hours.",
      fieldset: "common",
    }),
    defineField({
      name: "form_enabled",
      title: "Form enabled",
      type: "boolean",
      description: "Toggle the form on/off (e.g. during maintenance).",
      initialValue: true,
      fieldset: "common",
    }),

    // ── Path A: iframe embed ────────────────────────────────────────
    defineField({
      name: "form_embed_code",
      title: "Iframe embed code",
      type: "text",
      rows: 8,
      description:
        "Raw HTML iframe snippet from Tally, Formspree, Google Forms, Typeform, etc. The frontend will render this as-is. Form fields, validation, and submit are owned by the third-party tool.",
      fieldset: "embed",
      hidden: ({ document }) => document?.form_mode !== "embed",
    }),

    // ── Path B: custom React form ───────────────────────────────────
    defineField({
      name: "form_endpoint",
      title: "Form provider endpoint URL",
      type: "url",
      description:
        "POST endpoint for form submissions (e.g. https://formspree.io/f/xxxxx). Used by the custom React form.",
      fieldset: "custom",
      hidden: ({ document }) => document?.form_mode !== "custom",
    }),
    defineField({
      name: "transport_modes",
      title: "Mode of Transport options (Step 1)",
      type: "array",
      of: [{ type: "string" }],
      initialValue: [
        "Air Charter",
        "Air Commercial",
        "Ocean Ro/Ro",
        "Ocean Container",
        "Land",
        "Ocean Breakbulk",
      ],
      fieldset: "custom",
      hidden: ({ document }) => document?.form_mode !== "custom",
    }),
    defineField({
      name: "helicopter_models",
      title: "Helicopter model options (Step 3)",
      type: "array",
      of: [{ type: "string" }],
      initialValue: [
        "Airbus H125",
        "Airbus H130",
        "Bell 206",
        "Bell 407",
        "Leonardo AW109",
        "Leonardo AW139",
      ],
      fieldset: "custom",
      hidden: ({ document }) => document?.form_mode !== "custom",
    }),
    defineField({
      name: "transaction_types",
      title: "Transaction Type options (Step 4)",
      type: "array",
      of: [{ type: "string" }],
      fieldset: "custom",
      hidden: ({ document }) => document?.form_mode !== "custom",
    }),
    defineField({
      name: "step_titles",
      title: "Step titles (optional copy override)",
      type: "object",
      description:
        "Override the default step titles. Leave any field empty to use the code default.",
      fieldset: "custom",
      hidden: ({ document }) => document?.form_mode !== "custom",
      fields: [
        defineField({ name: "step_1", title: "Step 1 — Mode of Transport", type: "string" }),
        defineField({ name: "step_2", title: "Step 2 — Route Information", type: "string" }),
        defineField({ name: "step_3", title: "Step 3 — Shipment Details", type: "string" }),
        defineField({ name: "step_4", title: "Step 4 — Transaction Details", type: "string" }),
        defineField({ name: "step_5", title: "Step 5 — Contact & Company", type: "string" }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Quote Form Configuration" }),
  },
});
