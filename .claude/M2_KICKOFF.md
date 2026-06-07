# Module 2 — Home Page · Kickoff Prompt

> Paste this verbatim (or adapt) at the start of a fresh Claude Code chat.
> Once M2 is shipped, you can update or replace this with M3_KICKOFF.md.

---

I'm continuing solo development of the Heli Skycargo website. **Module 1 (Setup & Foundation) is complete and committed on `dev`.** I'm starting **Module 2 — Home Page** today.

## Read first (in this order, before any code)

1. `CLAUDE.md` — project rules, brand tokens, architectural conventions
2. `docs/DECISIONS.md` — every architectural decision logged. Critical entries:
   - **2026-04-29 "Option A"** — home's quote CTA section is a CARD linking to `/quote`, NOT the actual multi-step form. Form is built in M8.
   - **2026-04-28 video** — YouTube unlisted embed for play-on-click. Hero is a STATIC IMAGE, not a video.
   - **2026-04-28 mobile-first** — every section ships responsive at 375 / 768 / 1024 / 1440 from day one.
   - **2026-04-29 quote form schema** — supports both iframe and custom React paths via `form_mode` toggle (relevant only for M8, but good context).
3. `docs/CMS_SCHEMAS.md` — CMS field specs. Home page consumes `milestone`, `teamMember`, `testimonial`, and `siteStats` data.

## Critical things easy to miss

- **The hero is a static image, not a video.** Confirmed earlier from Figma frame `832:15`. The 93MB client-provided video lives in the SECOND section ("We deliver tailored helicopter logistic solutions") as a play-on-click tile.
- **Don't build the quote form here.** Per Option A: home's "Start your global transport request" section is a CTA card with image + headline + button → links to `/quote`. The full form (with both embedded and page variants) gets built once in M8 and retrofitted onto home and services listing. If you build the form in M2, you'll burn ~2 days of the M2 budget.
- **Animations are mandatory** — scroll reveals, stagger entrances, hover micro-interactions, smooth transitions. `motion` is already installed. Use it.
- **Reuse existing components** — `Button`, `buttonVariants()`, `Card`, `Modal`, `Logo`, `Header`, `Footer`, `MobileNav`, `_footer-parts` icons are all in place. Don't recreate.
- **Service-card design must be reusable** — the home's service teaser cards become the M3 (Services Listing) cards and M4's "related projects" strip. Architect for reuse on day one.

## Figma frames (request via MCP one at a time as needed)

- **Desktop home**: https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=344-1710
- **Mobile home**: https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=351-15284

Per the Figma policy (`.claude/FIGMA_GUIDE.md`): paste screenshots when possible, MCP-pull only when you genuinely need exact tokens or layer dimensions. Pull mobile + desktop for every section before implementing it.

## What's already built (don't duplicate)

- Sticky `Header` (Server, no backdrop-blur — solid bar)
- `MobileNav` drawer (Client, motion entrance, ESC + click-outside close, body scroll lock, chevron-expandable Services/Our Team)
- `Footer` (desktop 4-col + delegates to `MobileFooter` for mobile)
- `Logo` (auto-picks `/logo.svg` or `/logo-light.svg` via `inverted` prop)
- `Button` with `buttonVariants()` for use on `<Link>` elements
- Sanity client + 5 schemas (already deployed to Studio at `/studio`)
- Brand tokens in `globals.css` (`bg-brand-red`, `text-ink`, `font-display`, etc.)

## Home page sections (per the Figma — confirm before building)

In top-to-bottom order:

1. **Hero** — full-bleed photo + headline ("Innovative Global Helicopter Freight Forwarder") + sub + App Store / Google Play CTAs. Static image background.
2. **"We deliver tailored helicopter logistic solutions"** — split layout, includes the play-on-click video tile (YouTube unlisted, click-to-load wrapper)
3. **"Smart Tracking Powered By Our Bespoke App"** — phone mockup + feature highlights + red CTA
4. **"Explore our flexible helicopter transport solutions"** — service cards (6 services teaser, link to detail pages — these will become real in M4)
5. **"Meet the team behind every mission"** — CMS-driven team grid teaser (pulls from `teamMember` Sanity schema)
6. **"Customers love Heli Skycargo"** — testimonial cards (CMS-driven via `testimonial` schema, filtered by `is_featured`)
7. **"Our projects and more"** — bento mosaic of past shipments (hardcoded image grid)
8. **"Heli Skycargo milestones"** — interactive horizontal timeline (CMS-driven via `milestone` schema)
9. **"Start your global transport request"** — **CTA CARD only** (per Option A). Image + headline + button → `/quote`
10. **"Across all regions worldwide"** — global office locations with cityscape background image. The footer overlays this image with slight transparency.

## Suggested build order (smallest → riskiest)

1. Hero (static image + text + CTAs) — simplest, sets the visual tone
2. Service cards (reusable component, used 3+ times across modules)
3. Smart Tracking feature block
4. CTA card for quote ("Start your global transport request")
5. Customers / testimonials section (Sanity-driven, simple repeater)
6. Team teaser (Sanity-driven)
7. Projects mosaic (hardcoded grid layout, hover micro-interactions)
8. Milestones timeline (more complex — interactive, scroll/click navigation)
9. Office locations (image background + footer overlap)
10. Play-on-click video tile inside section 2 ("We deliver...")

Plan the 1-2 sections at a time. After each, propose the design + animations, get approval, then implement. Build, lint, typecheck after every section.

## Working agreement (reminders)

- Server Components by default. `"use client"` only when state, effects, browser APIs, or motion is required.
- Use `@/` path alias, not deep relative imports.
- All GROQ queries in `src/lib/sanity/queries.ts` as named exports — never inline.
- Tokens via Tailwind utilities (`bg-brand-red`), not hex codes inline.
- Mobile-first: build at 375, then add `md:`, `lg:`, `xl:` overrides.
- Test every section at 375 / 768 / 1024 / 1440 before claiming done.
- **Do NOT commit without explicit "yes commit"** from me. Stage and propose a message; I'll approve.
- No new dependencies without asking. `motion`, `clsx`, `tailwind-merge`, `next-sanity`, `sanity`, `@sanity/vision`, `@sanity/image-url` are already installed.

## Timeline

Module 2 deadline: **Mon May 4** (4 working days at ~2.5h/d, with private +1h-on-heavy-days buffer).

This is the heaviest module after M8. Don't try to ship all 10 sections in one session — plan in 2-3 chunks.

## When you're done with a section

Show me a screenshot or describe the result. I'll verify against the Figma. We iterate, then move to the next section.

When a logical chunk (e.g., 3-4 sections) is stable, propose committing to `dev`. I'll review and approve. **Never commit without "yes commit".**

---

Ready when you are. Pull the desktop home frame first (`344:1710`) and propose a plan for sections 1–3 (Hero, Service Cards, Smart Tracking). We'll proceed from there.
