# Heli SkyCargo Website — Project Brief

> Synthesized from the original PDF estimate (Blink22 → Heli SkyCargo, April 2026).
> **This file is gitignored** — it contains client-confidential project narrative.
> Source PDF: `/home/blink22/blink22-work/heli-skycargo/HSC website estimates.pdf`

---

## Overview

A modern, fast, professional marketing website for Heli SkyCargo — a global helicopter shipping company — that showcases their services, team, and track record to clients worldwide. Mobile-responsive across every screen size, fast on slow connections.

The site has **7 main page types**:

1. Home
2. Services Listing
3. Service Detail (×6 — single template): Ocean Ro/Ro, Ocean Lo/Lo, Ocean FCL, Road Freight, Air Commercial, Air Chartering
4. Why Choose HSC
5. Meet The Team
6. Shipment Showcase
7. Request a Quote (multi-step form, sends email directly to the ops inbox)

---

## Technology Stack & Rationale

| Layer              | Choice                                                                           | Why                                                                                               |
| ------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Framework          | Next.js 15 (App Router)                                                          | Pre-rendering for fast loads + SEO; battle-tested at scale (Nike, Uber, Netflix)                  |
| Language           | TypeScript (strict)                                                              | Type safety for a 1-month sprint with no QA team                                                  |
| Styling            | Tailwind CSS + design tokens                                                     | Mobile-first by default, design tokens map 1:1 to Figma values                                    |
| CMS                | Sanity (free tier)                                                               | 5 small editable areas, image CDN with hotspot/crop, friendly studio UI for non-technical editors |
| Hosting (frontend) | Vercel                                                                           | Free tier, global CDN, native Next.js support, preview deployments                                |
| Form delivery      | Formspree (custom React form by default; iframe-embed as fallback if PM insists) | Free up to 50 submissions/month; visual control kept in our codebase                              |
| Spam protection    | Cloudflare Turnstile                                                             | Free, no CAPTCHA friction, server-validated                                                       |

---

## What the team can edit (CMS-managed)

Most of the site is hardcoded for performance. Only **5 areas** are connected to Sanity:

| #   | Area                   | Type                 | Where it appears                                                                      |
| --- | ---------------------- | -------------------- | ------------------------------------------------------------------------------------- |
| 1   | Team Members           | Collection           | Team page (grid + spotlight), Home team teaser                                        |
| 2   | Testimonials & Ratings | Collection           | Home "Customers" section, future Reviews page                                         |
| 3   | Milestones (Timeline)  | Collection           | Home interactive timeline                                                             |
| 4   | Request a Quote Config | Singleton            | Quote page hero copy, form endpoint OR raw embed code, success message, on/off toggle |
| 5   | Stats / KPIs           | Singleton (repeater) | Why Choose HSC stats band, reusable on Home                                           |

CMS edits go live on the public site within **~1 minute** via on-demand revalidation.

For exact field specifications, see [CMS_SCHEMAS.md](./CMS_SCHEMAS.md).

What is **NOT** in the CMS: page copy, service descriptions, navigation, footer, project showcase entries, partner logos. These are hardcoded for performance.

---

## Module-by-Module Scope

### 1. Setup & Foundation

The technical backbone: project setup, brand styling (red palette, typography Inter Tight + PT Sans, spacing system), reusable building blocks (Button, Card, Modal, Input, Textarea, Select), Header and Footer that appear on every page, mobile responsiveness baseline, Sanity studio scaffold.

### 2. Home Page

- **Hero banner**: full-bleed banner with headline + CTA. Media treatment per Figma — could be a static image, a muted background loop, or a play-on-click poster + video. PDF only specifies "hero banner".
- **Service cards**: 6 services as visual cards linking to detail pages
- **App tracking feature**: callout for the HSC tracking app
- **Team teaser**: strip of team photos pulling from CMS
- **Customer logos**: trusted-by row
- **Project showcase mosaic**: 13-tile bento layout of past shipments
- **Milestones timeline**: interactive year-by-year (2014 → 2020+), pulls from CMS
- **Office locations**: world map highlighting global offices

### 3. Services Listing

Overview page presenting all 6 services as visual cards, plus an "Extra Support Services" list (customs, port handling, etc.), plus an embedded quote-form CTA at the bottom.

### 4. Service Detail Pages (×6, single template)

One reusable template renders all 6 services with different content. Each page has:

- Hero (service-specific image and tagline)
- Overview paragraph
- "When to Choose" section (when this service fits the client)
- Related projects strip

### 5. Why Choose HSC

- **Stats band** (CMS-editable): 1000+ Shipments, 24/7 Support, 50+ Clients, Established 2014
- **Feature blocks**: Seamless Coordination, Tailored Logistics, Precision Shipping (each with icon, title, narrative)
- **World map** with global presence dots

### 6. Our Team

Two-part page: a large **Spotlight** view of one featured team member (large photo, role, full bio), and a **Grid** of all team members below. Clicking a grid member promotes them into the spotlight. All content from CMS.

### 7. Shipment Showcase

A **filterable project gallery** (mosaic with image + video tiles labeled "From X to Y"). Filters by service type. Clicking a tile opens a **detail modal** with route, aircraft, timeline, and a challenge / solution / result narrative.

### 8. Request a Quote

A multi-step form on a dedicated page:

1. Mode of Transport (Air Charter / Air Commercial / Ocean Ro/Ro / Ocean Container / Land / Ocean Breakbulk)
2. Route Information (origin, destination, multi-route support)
3. Shipment Details (cargo description, helicopter model + quantity)
4. Transaction Details
5. Contact & Company info

With: client-side and server-side validation, file upload, Cloudflare Turnstile, success/error states. Submissions are sent via Formspree to the ops inbox — **never stored** in our database or CMS.

> The PM originally specified this as a paste-an-iframe-and-go (Google Forms style). We propose a custom React form instead so the visual matches Figma exactly. The CMS schema accepts both shapes (raw embed HTML or endpoint URL) — see DECISIONS log for the negotiation plan.

### 9. Mobile & Polish

- Animated splash screen on first visit
- Mobile navigation overlay (slide-in menu)
- Final polish pass: spacing, transitions, focus states, empty states across all pages

---

## Performance & Accessibility Targets

- LCP < 2.0s on 4G
- CLS < 0.05
- Lighthouse Performance ≥ 95 on the home page
- WCAG AA color contrast site-wide
- Keyboard navigable, visible focus rings on every interactive element
- All images via Next.js `<Image>` + Sanity image CDN with WebP/AVIF and explicit dimensions

---

## Timeline

The PDF estimates 1 month to develop and launch, plus a 6-week warranty period. See [TIMELINE.md](./TIMELINE.md) for the dated working plan.
