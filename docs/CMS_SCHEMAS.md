# CMS Schema Specifications

> Source of truth for Sanity content models. Mirror the field definitions from the project brief exactly. Do not add fields without updating this doc + `docs/DECISIONS.md`.

There are **5 schemas total**: 3 collections + 2 singletons.

---

## 1. `teamMember` — Collection

Appears on: Team page (grid + spotlight) and Home page team teaser.

| Field          | Type                      | Notes                                                                    | Required |
| -------------- | ------------------------- | ------------------------------------------------------------------------ | -------- |
| `full_name`    | string                    | Display name                                                             | ✓        |
| `role`         | string                    | Job title                                                                | ✓        |
| `department`   | string                    | Optional grouping (operations, sales, etc.)                              | –        |
| `photo`        | image                     | Portrait — used in grid + spotlight. Hotspot enabled.                    | ✓        |
| `short_bio`    | text                      | One-liner under grid thumbnail                                           | –        |
| `long_bio`     | block content (rich text) | Full bio shown in spotlight                                              | –        |
| `social_links` | object                    | `{ linkedin: url, email: string }` — both optional                       | –        |
| `order`        | number                    | Display order in grid                                                    | ✓        |
| `is_featured`  | boolean                   | If true, default spotlight member. **Validation: only one can be true.** | –        |
| `status`       | string (enum)             | `draft` / `published`                                                    | ✓        |

**Validation rules**:

- `photo` must have hotspot
- Only one `is_featured = true` at a time (Sanity validation rule + UI hint)
- `short_bio` ≤ 140 characters

---

## 2. `testimonial` — Collection

Appears on: Home page "Customers" section, future Reviews page.

| Field           | Type          | Notes                               | Required |
| --------------- | ------------- | ----------------------------------- | -------- |
| `customer_name` | string        | Person's name                       | ✓        |
| `company`       | string        | Company name                        | ✓        |
| `logo`          | image         | Company logo                        | –        |
| `photo`         | image         | Customer photo                      | –        |
| `quote`         | text          | Testimonial text                    | ✓        |
| `rating`        | number        | 1–5 star rating, integer            | ✓        |
| `service_tag`   | string        | Which service the review relates to | –        |
| `order`         | number        | Display order                       | ✓        |
| `is_featured`   | boolean       | Show on home page                   | –        |
| `status`        | string (enum) | `draft` / `published`               | ✓        |

**Validation rules**:

- `rating`: integer between 1 and 5
- `quote`: max 280 characters
- `service_tag`: predefined list matching the 6 services

---

## 3. `milestone` — Collection

Appears on: Home page interactive timeline.

| Field         | Type   | Notes                                       | Required |
| ------------- | ------ | ------------------------------------------- | -------- |
| `year`        | number | e.g. 2014, 2015, 2017                       | ✓        |
| `headline`    | string | Short title                                 | ✓        |
| `description` | text   | Short narrative                             | ✓        |
| `image`       | image  | Supporting photo                            | ✓        |
| `order`       | number | Display position when multiple in same year | –        |

**Validation rules**:

- `year`: integer between 2000 and current year + 1
- `description`: max 200 characters
- Default sort: by year ascending, then order

---

## 4. `quoteFormConfig` — Singleton

Appears on: Quote page hero + form embed.

| Field             | Type           | Notes                                                       |
| ----------------- | -------------- | ----------------------------------------------------------- |
| `hero_headline`   | string         | e.g. "Share Your Shipment Details — We'll Handle The Rest." |
| `hero_image`      | image          | Hero background                                             |
| `form_embed_code` | text (code)    | HTML snippet OR config JSON from external form provider     |
| `recipient_email` | string (email) | Ops inbox                                                   |
| `success_message` | text           | Confirmation shown after submit                             |
| `form_enabled`    | boolean        | Toggle form on/off (maintenance)                            |

**Important**: This singleton stores **configuration only**. Form submissions are handled by an external service (Formspree / Resend API) and are NEVER stored in Sanity.

---

## 5. `siteStats` — Singleton with repeater

Appears on: Why Choose Us stats band; reusable on Home page.

```
{
  stats: [
    {
      value: string,       // "1000+", "24/7", "50+", "2014"
      label: string,       // "Shipments", "Support", "Clients", "Established"
      icon: image?,        // optional icon above the number
      order: number
    },
    ...
  ]
}
```

**Validation rules**:

- Recommend exactly 4 stats for the band layout
- `value` max 8 characters
- `label` max 24 characters

---

## What is NOT in the CMS (do not add these)

Per the project brief, the following are hardcoded in the frontend:

- Service descriptions (all 6 services)
- "When to choose" copy on service detail pages
- Project showcase entries (the mosaic of past shipments)
- Partner logos
- Page navigation and footer links
- All hero copy except the Quote page hero
- "Why Choose Us" feature blocks (seamless coordination, tailored logistics, precision shipping)
- All static page copy (mission statements, body paragraphs, etc.)

These live in `src/lib/constants.ts` or directly in the page files. If the client later wants any of these in the CMS, it's a scope change requiring a new schema and frontend rewire.

---

## Initial seed data

Pre-populate the Sanity dataset with the following on first deploy (so the studio isn't empty for the client):

**Milestones** — the 5 entries from the brief (2014, 2015, 2017, 2018, 2020)

**Stats** — 4 entries: `1000+/Shipments`, `24/7/Support`, `50+/Clients`, `2014/Established`

**Quote Form Config** — populate hero copy, recipient email (placeholder), success message

Team Members and Testimonials will be added by the client (or the dev team during content load).

---

## showcaseItem (expanded 2026-07-07)

Full showcase tile (was: gallery images only). Fields:

| Field               | Type                                   | Notes                                  |
| ------------------- | -------------------------------------- | -------------------------------------- |
| `slug`              | string, required                       | Unique tile id, e.g. `japan-desk`      |
| `order`             | number, required                       | Mosaic position; home shows first 8    |
| `image`             | image, required                        | Tile photo + modal slide 1             |
| `alt`               | string, required                       | Accessibility text                     |
| `label`             | string[] (max 4)                       | Tile overlay lines; empty = photo-only |
| `has_play_icon`     | boolean                                | Red play circle on tile                |
| `shape`             | tall \| medium \| short \| extra-short | Masonry aspect                         |
| `desktop_column`    | number 0–3                             | Desktop masonry column                 |
| `mobile_column`     | number 0–1                             | Mobile masonry column                  |
| `related_services`  | string[] (service slugs)               | Filter for service detail pages        |
| `modal_title`       | string, required                       | Popup header                           |
| `modal_subtitle`    | string                                 | e.g. "AW139 By Ocean LO/LO"            |
| `modal_description` | text[] , required                      | Story paragraphs                       |
| `transport_mode`    | string (enum)                          | Quote-form prefill only, not rendered  |
| `media_photos`      | image[] (max 8)                        | Extra popup carousel slides            |
| `video_url`         | url                                    | MP4 slide, tile photo as poster        |
| `gallery_images`    | {image, caption}[] (max 8)             | Thumbnail strip in popup               |
