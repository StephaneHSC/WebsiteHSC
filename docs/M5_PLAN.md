# Module 5 — Why Choose Heli Skycargo — Implementation Plan

> **How to use this file**: Design contract for Module 5. Read it cold at the start of the M5 session — it captures the full Figma audit, locked decisions, and content so you don't have to re-pull frames. Cross-references: `CLAUDE.md` (project rules), `docs/DECISIONS.md` (architecture log), `docs/M3_PLAN.md` and `docs/M4_PLAN.md` (sibling modules + shared component map), `AGENTS.md` (Next.js 16 reminder).

**Status**: planning COMPLETE — all 9 sections audited across desktop + mobile, design-token gaps captured, content captured in Appendix A, hover/animation specs captured per section. Ready for autonomous implementation.
**Audit date**: 2026-05-06
**Target route**: `/why-choose-us` (already wired in FOOTER `src/lib/constants.ts`)
**Authoritative design source**: Figma file `UkrV8vyPeLqsYbZ57OrESC` (HSC--Copy-)

---

## 0 — Autonomous workflow contract

This module runs without check-ins. The flow is:

1. **Implementation pass** — build all sections per §3 specs, mobile-first, Server Components by default. Use the existing `Reveal` / `SectionEyebrow` / `Container` / `Section` primitives. Don't re-pull Figma frames unless a value is missing from this doc.
2. **Pixel-perfect review pass** — at every viewport (375 / 768 / 1024 / 1440), compare against the Figma frame screenshots. Verify each item below. **A line break, font weight, or missing word counts as a fail.**
   - eyebrow text + casing + tracking + variant
   - H2/H3 line breaks (where do words wrap?)
   - mixed font weights inside a single H2 (Inter Tight Black vs Bold per line/word)
   - bullet text wording exactly as written
   - button label, padding, fill vs outline, color
   - image positions (left/right/centered), aspect ratio, rounded corners
   - vertical rhythm (gap between eyebrow → H2 → lede → CTA)
   - background overlay opacity (e.g. hero is `0.36` on mobile but `0.4` on desktop)
3. **Code review pass** — read every new/modified file end-to-end. Check: TypeScript strictness, no `any`, no inline GROQ, no client-side Sanity fetch, accessibility (semantic tags, focus rings, alt text, aria), Reveal staggers consistent with M2-M4 (`0` → `0.1` → `0.2` → `0.3`), no dependency adds, no config edits. Run `pnpm typecheck` and `pnpm lint` clean.
4. **Re-verify pass** — if step 3 caused any UI/UX edits, re-run step 2 at all 4 viewports for the affected sections.
5. **Docs + handover** — append non-obvious calls to `docs/DECISIONS.md`. Update `CLAUDE.md` §2 "Currently working on" line. Summarise what shipped + what's next. **Do not commit** without explicit user approval (memory: `feedback_no_commit_without_ask`).

### Suggested implementation order

1. **Extend `siteStats` seed + Sanity wiring** — add the 4 stats to `scripts/seed-sanity.mjs` (see §5.2). Make sure the live-fallback pattern matches `MilestonesTimeline` / `TeamTeaser` so the page renders pre-seed.
2. **Hardcoded content + types in `constants.ts`** — add `WHY_CHOOSE_*` constants (see §5.1) BEFORE building UI so all sections have parity content.
3. **Page route stub** — `src/app/(marketing)/why-choose-us/page.tsx` with metadata + section import shells (Server Component, ISR `revalidate: 60`).
4. **Sections, in DOM order** (see §3) — Hero → GlobalReachCallout → StatsBand → IntroPhotoBand → FeatureBlock × 2 → TrackabilityCallout → OfficesGlobal (variant) → QuoteFormShell. Build mobile-first, verify at 4 widths per section before moving on.
5. **Polish pass** — Reveal stagger, hover timings, focus rings, mobile width sweep at 375/768/1024/1440. **Then** the pixel-perfect review (§0 step 2).
6. **Typecheck + lint clean.**

---

## 0.5 — Responsive matrix (non-negotiable)

Every section MUST render correctly at the 6 viewports below. The existing project standard (`feedback_responsive_first` memory; `CLAUDE.md` §2 top-line rule #1) is "375 / 768 / 1024 / 1440 from day one" — for M5 we extend this to also cover small mobile (320) and ultra-wide (1920+). **Test all 6 widths before declaring any section done. No "fix it later".**

| Width   | Tier                            | Tailwind                                           | What you check                                                                                                                                                                                                                    |
| ------- | ------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 320px   | small mobile                    | `<sm`                                              | nothing clips horizontally; H2 still wraps cleanly without overflowing; bullet text doesn't overflow; eyebrow + buttons remain tappable (≥40px tap target)                                                                        |
| 375px   | iPhone-class mobile             | `<sm`                                              | matches `505:*` Figma frames pixel-for-pixel where audited                                                                                                                                                                        |
| 768px   | tablet portrait                 | `md:`                                              | feature blocks transition: image-top → image-side; stats band can be either 2x2 or 4-up — pick 4-up if it fits, else 2x2; container padding scales up                                                                             |
| 1024px  | tablet landscape / small laptop | `lg:`                                              | feature blocks fully image-side; stats band 4-up; offices 4-col                                                                                                                                                                   |
| 1440px  | desktop                         | `xl:` (or `lg:` since `xl` Tailwind = 1280)        | matches `344:*`, `466:*`, `373:*`, `446:*` Figma desktop frames pixel-for-pixel                                                                                                                                                   |
| 1920px+ | big screen / ultra-wide         | (no breakpoint — depends on `Container` `max-w-*`) | content stays centered with a sensible max-width; full-bleed sections (hero, trackability, offices) fill the screen but their content stays inside the same centered container; no awkward stretching of photos or 3000px-wide H2 |

**Rules to apply across the board:**

1. **Use the project's existing `Container`** for all content — it already caps width at the right max-w value used by sibling modules. Don't invent a new container.
2. **Full-bleed sections** (Hero, GlobalReachCallout's bg world map, TrackabilityCallout, OfficesGlobal) extend to the viewport edges, but their _content_ sits inside `Container` so it stays centered at ultra-wide.
3. **Photos in feature blocks and the intro band**: `next/image` with `sizes="(min-width: 1024px) 50vw, 100vw"` for side-by-side blocks and `sizes="(min-width: 1024px) 1280px, 100vw"` for full-width contained photos. Use `aspect-[713/625]` or similar to lock aspect ratio so the layout doesn't shift while the image loads.
4. **H2 line breaks** are the trickiest part. Where Figma shows a specific line break (e.g. `Seamless coordination / from planning to / delivery.`), force it with `<span className="block">` per line — DO NOT rely on natural word-wrap, because the breakpoint of natural wrap drifts with viewport. The bullet list, lede paragraphs, and other body copy should wrap naturally.
5. **Stats band on tablet (768–1023)**: prefer 4-up if all 4 cells fit without truncating values/labels. If `1000+ Shipments Completed` truncates, fall back to 2x2 at this range.
6. **Feature blocks at tablet (768–1023)**: image-side layout if it fits (≥640px content column with the image still legible), else image-top. Test both Seamless (image-left) and Tailored (image-right) since the swap can hide truncation issues.
7. **Trackability phone mockup at tablet**: scale down proportionally; floating cards may need to be repositioned. The phone mockup is the visual anchor; if it can't fit with the headline, stack vertically (phone above, headline below) at this range.
8. **OfficesGlobal already handles**: 1-col mobile (featured-tabs), 2-col tablet (`md:grid-cols-2`), 4-col desktop (`lg:grid-cols-4`). No new responsive work.
9. **Big screens (≥1920)**: explicit test pass — open the browser at 1920×1080 and verify every section. The most common issues are: photos becoming pixellated (provide a 2x asset for ≥1920), text getting too wide to scan (cap with `Container` max-w), and buttons drifting too far apart in flex rows. Cap H2 width to ~900px at all sizes.

**Acceptance gate**: in §8's "Pixel-perfect" checklist, every line is implicitly multiplied by the 6 viewports. The pass isn't done until each section has been visually verified at 320, 375, 768, 1024, 1440, 1920.

---

## 1 — Token + dependency check

**No new tokens needed.** All fonts/colors/spacing already defined.

- Inter Tight — **all weights `400, 500, 600, 700, 800, 900` loaded** in `src/app/layout.tsx:9`. So `Black` (900), `Bold` (700), and `SemiBold` (600) all render at exact weight — no fallback. The Global Reach mobile H2 line 3 (`we make it happen.`) and the Offices H2/labels can use SemiBold faithfully.
- PT Sans (Regular 400 / Bold 700) ✅
- Poppins (Bold 700 / Black 900) ✅ added in M3 for offices H2
- Inter (SemiBold 600) ✅ added in M3 for CTA pill text + app badges
- `--color-brand-red`, `--color-ink`, `--color-ink-soft`, `--color-surface`, `--color-surface-alt`, `--color-black` ✅
- Stats divider color: matches `--color-border` (`#e5e7eb`) — verify visually against Figma; bump to `--color-input-border` (`#e4e4e4`) if needed

**No new packages.** Reuse `Image`, `next/font`, `cn`, `Reveal`, `SectionEyebrow`, `Container`, `Section`, `Button` (`buttonVariants`), `AppBadge` / `AppBadgeRow`.

---

## 2 — Figma frame index

**Audit file**: `UkrV8vyPeLqsYbZ57OrESC` (HSC--Copy-).
Re-pull only if an asset URL has expired (Figma asset URLs live ~7 days) — refer to §4 for the asset download list.

| #   | Section                                              | Desktop nodeId                 | Mobile nodeId                                     | Status                                   |
| --- | ---------------------------------------------------- | ------------------------------ | ------------------------------------------------- | ---------------------------------------- |
| 1   | Hero                                                 | `344:6116`                     | `505:7165`                                        | ✅ audited                               |
| 2   | Global Reach callout                                 | `466:6063`                     | `505:7491` (top half)                             | ✅ audited                               |
| 3   | Stats band                                           | (no separate frame — see §3.3) | `505:7491` (middle)                               | ✅ inferred from mobile + screenshot     |
| 4   | Intro team photo band                                | (no separate frame — see §3.4) | `505:7491` (bottom)                               | ✅ inferred — full-width contained photo |
| 5   | Feature block A — Seamless Coordination (image-left) | `344:6702`                     | `505:7528`                                        | ✅ audited                               |
| 6   | Feature block B — Tailored Logistic (image-right)    | `344:6703`                     | `505:7539`                                        | ✅ audited                               |
| 7   | Trackability red callout                             | `373:15`                       | `505:7551`                                        | ✅ audited                               |
| 8   | Offices Global — **Hong Kong featured variant**      | `446:5508`                     | (reuse `OfficesGlobal` mobile, override featured) | ✅ audited                               |
| 9   | Quote form                                           | reuse from M3                  | reuse from M3                                     | direct reuse — `QuoteFormShell`          |
| 10  | Footer                                               | reuse                          | reuse                                             | direct reuse — existing `Footer.tsx`     |

### Re-pull command pattern

```
mcp__figma-remote-mcp__get_design_context
  fileKey: UkrV8vyPeLqsYbZ57OrESC
  nodeId: <see table above>
  clientFrameworks: react,nextjs
  clientLanguages: typescript,css
```

---

## 3 — Section-by-section design specs

> Notation: every spec captures Figma's pixel value at the design viewport (1600 desktop / 430 mobile) plus the mobile-first Tailwind classes that produce the same visual at our breakpoints (sm 640 / md 768 / lg 1024 / xl 1280). Where a Figma value would clip on a 1280px laptop, the breakpoint deviation is explicit.

### §3.1 — Hero (`ServiceDetailHero`-style, page-scoped variant) ✅

**Desktop (`344:6116`)**

| Element         | Value                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame           | `1600 × 705`                                                                                                                                                                    |
| Background      | full-bleed photo (`/why-choose-us/hero-team.webp`, see §4) + `rgba(0,0,0,0.4)` overlay                                                                                          |
| Header          | sits over hero (logo top-left, "Request Quote" pill + hamburger top-right) — **reuse existing `Header.tsx` overlay variant**, no duplication                                    |
| Eyebrow         | red filled, PT Sans Bold 12px tracking 0.72px uppercase, padding `11px 8px` (left:79, top:373), text `BESPOKE HELICOPTER SHIPPING`                                              |
| H1              | `font-body` (PT Sans) **Bold** 64px / 82px line-height, capitalize, white, no wrap on desktop. Text: `Why Choose Heli Skycargo`                                                 |
| Vertical rhythm | eyebrow at top:373; H1 at top:424 → gap of 6px from eyebrow bottom to H1 top (=H1 baseline 51 below eyebrow top). Translates to `mt-6 md:mt-8 lg:mt-12` between eyebrow and H1. |

**Mobile (`505:7165`)**

| Element | Value                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Frame   | `430 × 470`                                                                                                                    |
| Overlay | `rgba(0,0,0,0.36)` — **note: 0.36 mobile vs 0.40 desktop**, mirror M4 ServiceDetailHero pattern (`bg-ink/[0.36] md:bg-ink/40`) |
| Eyebrow | left:24, top:256, padding `6px` (smaller than desktop's 11/8)                                                                  |
| H1      | PT Sans Bold 32px / 42px capitalize, white, two lines: `Why Choose` / `Heli Skycargo`. Force the line break (no auto-wrap).    |

**Animation/hover**: `Reveal` (eyebrow `delay=0`, H1 `delay=0.1`). Header is sticky/fixed via existing layout — no extra work.

**Component**: NEW `src/components/sections/why-choose/WhyChooseHero.tsx`. Layout structurally similar to `ServiceDetailHero` minus the chip strip. Don't promote to `_shared/` (only one consumer).

---

### §3.2 — Global Reach callout ✅

**Desktop (`466:6063`)**

| Element           | Value                                                                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background        | white, with the existing `/home/world-map.svg` faint dotted graphic centered behind the content (re-use `OurSolutions.tsx` pattern; same asset path)                                                     |
| Eyebrow           | red filled, padding `8px`, "Global Reach"                                                                                                                                                                |
| H2                | 3 lines, mixed weights, **all uppercase**, color `#101820`, line-height `64px`, font-size `50px`:                                                                                                        |
|                   | line 1 — `Inter Tight Black` 50/64 — `Wherever your aircraft needs to go,` (single line — wraps allowed below 1280)                                                                                      |
|                   | line 2 — `Inter Tight Bold` 50/64 — `we make it ` then word `happen` colored `#292d32` (subtle differentiation, almost ink) then `.`                                                                     |
|                   | (no third line on desktop — Figma wraps "Wherever your aircraft needs to go," to one line and "we make it happen." to another)                                                                           |
| Lede              | PT Sans Regular 16px, mixed line-height (the first sentence at 36, the second at 30 per Figma), color `#3d3d3d`, max-width 791px, centered. Text: see Appendix A.                                        |
| CTA               | **Filled red pill**, padding `30/20` (px/py), `rounded-[30px]`, PT Sans Bold 14px tracking 0.84px capitalize white, text "Request Quote", links to `#request-quote` (in-page anchor, same pattern as M4) |
| Vertical position | eyebrow top:149, H2 top:204, lede top:339, CTA top:436                                                                                                                                                   |

**Mobile (`505:7491` top portion)**

| Element | Value                                                                                                                                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow | red filled, smaller padding `6px`, centered                                                                                                                                                                      |
| H2      | 3 lines, 24px / 34px line-height, all uppercase, centered: `Wherever your aircraft` (Black) / `needs to go,` (Black) / `we make it happen.` (SemiBold — note: **SemiBold on mobile, Bold on desktop** per Figma) |
| Lede    | PT Sans Regular **14px** / 26px line-height, centered, max-width 382px. Same body copy as desktop.                                                                                                               |
| CTA     | **Outline pill** — white bg, ink border, ink text `12px` PT Sans Bold tracking 0.72px capitalize. **DIFFERENT from desktop's filled red.** Padding `20/16`.                                                      |

**Animation/hover**: Reveal stagger eyebrow (0) → H2 (0.1) → lede (0.2) → CTA (0.3). Hover on CTA — desktop pill darkens to `--color-brand-red-dark`; mobile outline pill swaps to ink fill + white text on hover (use `Button` `variant="primary"` + `variant="secondary"` per breakpoint).

**Component**: NEW `src/components/sections/why-choose/GlobalReachCallout.tsx`. **Do not** modify `OurSolutions.tsx` — typography mix and CTA differ enough that two components are cleaner than props-drilled variants. Re-use the world-map background pattern.

---

### §3.3 — Stats band (CMS-driven) ✅

**Desktop (inferred — no separate Figma URL but visible in Image #1 the user shared)**

The user-supplied screenshot shows 4 stats in a single row above the team photo. Order (left→right): `1000+ Shipments Completed`, `24/7 Available Support`, `50+ Clients Worldwide`, `2014 Trusted Since`. (This is the order the editor enters in Sanity via the `order` field. Use `siteStatsQuery` which already orders by `order asc`.)

| Element         | Value                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Layout          | 4-column row, equal-width cells, vertical 1px dividers between cells (not on outer edges)                                                 |
| Cell padding    | ~24px horizontal, ~16px vertical                                                                                                          |
| Label (eyebrow) | Inter Tight Bold **12px / 48px line-height** uppercase, color `#101820`                                                                   |
| Value           | Inter Tight Black **48px / 48px line-height**, color `#101820`. Possible CSS `feature-settings` for tabular nums to keep `1000+` aligned. |
| Description     | PT Sans Regular **12px / 16px line-height**, color `#101820` (or `#3d3d3d`), 2-line max wrap                                              |
| Divider         | 1px solid line, color `--color-border` (`#e5e7eb`); height ~80% of cell                                                                   |

**Mobile (`505:7491` middle portion — `674:721` content group)**

| Element                                                                                                                                                                                                                                                                                                                                                                                                                             | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout                                                                                                                                                                                                                                                                                                                                                                                                                              | 2 × 2 grid; vertical divider between columns (line-14 svg) and horizontal divider between rows (line-15 svg), full width `378px`                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Order in grid                                                                                                                                                                                                                                                                                                                                                                                                                       | top-left = order 1 (`50+`), top-right = order 2 (`1000+`)... (per the audit, mobile renders `50+ / 1000+ / 24/7 / 2014` reading order). **Desktop and mobile render in CMS `order asc` — but the layouts arrange them differently. To keep consistent, treat the `order` field as the source of truth for desktop reading order; mobile lays out as: row-1 = first two by order, row-2 = next two. With seed order `1000, 24/7, 50+, 2014`, mobile would read `1000+, 24/7 / 50+, 2014` top-to-bottom — which differs from the Figma mobile frame.** |
| **Decision**: seed CMS with **`order` matching the desktop reading order** (`1000+, 24/7, 50+, 2014`). Mobile 2x2 lays out per CMS order → top row `1000+, 24/7`; bottom row `50+, 2014`. The Figma mobile mock shows a different order (`50+, 1000+, 24/7, 2014`); we accept the small deviation as the same set rendered consistently from a single source. **Flag this as a "design vs. CMS-drive" tradeoff in `DECISIONS.md`.** |
| Cell content                                                                                                                                                                                                                                                                                                                                                                                                                        | label (Inter Tight Bold 12-13/48), value (Inter Tight Black 48/48), description (PT Sans Regular 12/16)                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Cell positions                                                                                                                                                                                                                                                                                                                                                                                                                      | left col x:37, right col x:238; top row y:407, bottom row y:544; cell heights ~120px                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

**Surrounding padding**: this section sits inside the `Container` (matches user's screenshot — not full-bleed). Light bg.

**Animation/hover**: Reveal stagger across the 4 cells (each cell `delay = 0.05 * index`, capped at 0.2). **Optional polish (skip if it bloats budget)**: count-up animation on numbers via `Intersection Observer` + `requestAnimationFrame` in a tiny client island. Default to static for v1.

**Component**: NEW `src/components/sections/_shared/StatsBand.tsx` (in `_shared/` because per `docs/CMS_SCHEMAS.md` siteStats is "reusable on Home page" — so promote from day one). Server Component reading from `siteStatsQuery`. Inline `PLACEHOLDER_STATS` fallback (matching the seed values) so the page renders pre-seed (same `// TODO(seed):` pattern as `MilestonesTimeline`).

**Description field handling**: the existing `siteStats` schema only has `value / label / icon / order`. The descriptions are FIXED design copy. To avoid a schema migration, **hardcode the description-by-label map in `constants.ts`** — the section component looks up the description by the stat's `label` field. If editor adds a 5th stat, it renders without a description (graceful degradation). Capture this in `DECISIONS.md`.

---

### §3.4 — Intro team-photo band ✅ (inferred from screenshot + mobile bottom)

A wide, contained team-group photo sits between the stats band and the first feature block. Same photo as the hero (the HSC team in front of the Leonardo helicopter) but rounded-corner and contained, NOT full-bleed. Visible in Image #1 the user shared and in mobile frame `505:7491` bottom (`505:7526`).

| Element                   | Value                                                                                                                                                                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout                    | full-width inside `Container`; rounded-2xl (16-20px); aspect ~16:9 desktop, ~16:9 or ~16:11 mobile                                                                                                                                                                           |
| Asset                     | reuse hero photo OR a separate wider crop. **Source from Figma asset on hero node `344:6116` `imgRectangle36`** (download into `/public/why-choose-us/team-band.webp`). Provide a `width`/`height` based on the actual image dimensions; use `next/image` with `sizes` prop. |
| Gap from stats band above | ~48px desktop, ~32px mobile                                                                                                                                                                                                                                                  |
| Gap to next section below | ~48px desktop, ~32px mobile                                                                                                                                                                                                                                                  |

**Animation**: single `Reveal` fade-up (delay 0).

**Component**: not its own file — render inline in the page route as a `<Container><Reveal><div className="aspect-... overflow-hidden rounded-2xl"><Image ... /></div></Reveal></Container>` block.

---

### §3.5 — Feature block A — Seamless Coordination (image-left) ✅

**Desktop (`344:6702`)**

| Element         | Value                                                                                                                                                                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame           | content area ~1342×625; image at `0/0/713/625`, content at `831/27`                                                                                                                                                                                                                                 |
| Image           | left column, **rounded-2xl** + surrounding padding (per user's "last 3 sections have surrounding padding" rule — see §6 locked decision). Aspect 713:625 ≈ 1.14:1. Photo: yellow-vest workers on a vessel deck (download from `imgImg` on `344:6702` → `/public/why-choose-us/seamless-photo.webp`) |
| Eyebrow         | red filled, padding `8px`, `WHY CHOOSE US`                                                                                                                                                                                                                                                          |
| H2              | 3 lines, all uppercase, color `#101820`, font-size 40, line-height 54:                                                                                                                                                                                                                              |
|                 | line 1 — `Inter Tight Black` — `Seamless coordination`                                                                                                                                                                                                                                              |
|                 | line 2 — `Inter Tight Bold` — `from planning to`                                                                                                                                                                                                                                                    |
|                 | line 3 — `Inter Tight Bold` — `delivery.`                                                                                                                                                                                                                                                           |
| Lede            | PT Sans Regular 16px / 30px, color `#101820`, max-width 517px. Text exactly: `We combine technical understanding with hands-on logistics experience to deliver reliable, flexible shipping solutions for every mission.`                                                                            |
| Bullet list     | PT Sans Regular **15px / 39px line-height**, list-disc, indent `ms-22.5px`, color `#101820`. 5 items — see Appendix A for exact wording.                                                                                                                                                            |
| CTA             | filled red pill, "Request Quote", links to `#request-quote`                                                                                                                                                                                                                                         |
| Vertical rhythm | eyebrow 27 → H2 82 (Δ55 / `mt-6`) → lede 251 (Δ ~115 / `mt-12`) → bullets 338 (Δ ~70 / `mt-7`) → CTA 549 (Δ ~150 from last bullet baseline / `mt-8`)                                                                                                                                                |

**Mobile (`505:7528`)**

| Element | Value                                                                                                |
| ------- | ---------------------------------------------------------------------------------------------------- |
| Layout  | image on top (left:25, top:0, w:382, h:338, **rounded-2xl**), content stacked below                  |
| H2      | 24/34, three lines: `Seamless coordination` (Black) / `from planning to` (Bold) / `delivery.` (Bold) |
| Lede    | 14px / 24px                                                                                          |
| Bullets | 13px / 39px line-height (smaller than desktop)                                                       |
| CTA     | filled red pill, smaller padding (`20/14`), text 14px, "Request Quote"                               |

**Animation/hover**:

- Reveal stagger: eyebrow (0) → H2 (0.1) → lede (0.2) → bullets (0.3) → CTA (0.4).
- Photo: subtle hover lift — `transform: translateY(-2px)` + slight shadow on desktop, 200ms ease-out. Skip on mobile.
- CTA hover: brand-red → brand-red-dark (already in `Button`).

---

### §3.6 — Feature block B — Tailored Logistic (image-right) ✅

**Desktop (`344:6703`)**

Mirror of §3.5 — content on LEFT, image on RIGHT.

| Element         | Value                                                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image           | right column, rounded-2xl, photo at `629/0/713/625`. Helicopter winch unloading photo (download from `imgImg` on `344:6703` → `/public/why-choose-us/tailored-photo.webp`) |
| Eyebrow         | red filled, `OUR APPROACH`                                                                                                                                                 |
| H2              | 3 lines uppercase, font-size 40 / line-height 54, color `#101820`:                                                                                                         |
|                 | line 1 — Inter Tight Black — `Tailored logistic`                                                                                                                           |
|                 | line 2 — Inter Tight Bold — `solutions built around`                                                                                                                       |
|                 | line 3 — Inter Tight Bold — `your aircraft`                                                                                                                                |
| Body            | TWO paragraphs, PT Sans Regular 16/30, color `#101820`, max-width 506px. See Appendix A for exact text.                                                                    |
| CTA             | filled red pill, "Request Quote"                                                                                                                                           |
| Vertical rhythm | eyebrow 85 → H2 140 → body 313 (Δ173 from H2 — note the bigger gap) → CTA 490                                                                                              |

**Mobile (`505:7539`)**

| Element | Value                                                                                          |
| ------- | ---------------------------------------------------------------------------------------------- |
| Layout  | image on top (rounded-2xl), content stacked below — same pattern as §3.5                       |
| H2      | 24/34 — `Tailored logistic` (Black) / `solutions built around` (Bold) / `your aircraft` (Bold) |
| Body    | 14/24, two paragraphs                                                                          |
| CTA     | filled red pill, 20/14 padding                                                                 |

**Animation/hover**: identical to §3.5. **At <md, both feature blocks render the same way (image-top, content-below); at >=md, A is image-left and B is image-right.**

**Component**: NEW `src/components/sections/why-choose/FeatureBlock.tsx` — shared by §3.5 and §3.6 with an `imageSide: "left" | "right"` prop (also drives the mobile reading order if needed; default mobile = image-top). Content driven from `WHY_CHOOSE_FEATURE_BLOCKS` array in `constants.ts`.

---

### §3.7 — Trackability red callout ✅

**Desktop (`373:15`)**

A brand-red full-bleed band with a phone mockup on the left and headline + app badges on the right.

| Element             | Value                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame               | `1600 × 800`, full-bleed                                                                                                                                                                                                                                                                                                                                                                            |
| Background          | layered: bottom `#e40c28` solid + middle `imgRectangle5` (subtle abstract shape) at `mix-blend-overlay opacity-20` covering full frame                                                                                                                                                                                                                                                              |
| Phone mockup (left) | composed of: device frame at `292/153` (273×519, rounded-34), red top section (273×181) for app header, then nested screen content (delivery info, status pills, image cards). All asset URLs in §4.                                                                                                                                                                                                |
| Floating overlay 1  | "search bar" pill at `81/389` (~265×144), backdrop-blur-12.6, white-24% bg, rounded-20, with an inner image card.                                                                                                                                                                                                                                                                                   |
| Floating overlay 2  | "delivery details" pill at `520/306` (~268×82), backdrop-blur-12.6, white-24% bg, with white inner card showing skeleton bars.                                                                                                                                                                                                                                                                      |
| Eyebrow             | **white filled** bg (NOT red — variant outline-ink-on-white per Figma). Text: `TRACKABILITY`. Padding `11/8`. Position 869/258.                                                                                                                                                                                                                                                                     |
| H2                  | white, all uppercase, font-size 54 / line-height 66:                                                                                                                                                                                                                                                                                                                                                |
|                     | line 1 — Inter Tight Black — `Precision Helicopter`                                                                                                                                                                                                                                                                                                                                                 |
|                     | line 2 — Inter Tight Bold — `Shipping. Globally.`                                                                                                                                                                                                                                                                                                                                                   |
| Lede                | PT Sans Regular 18px white. Text: `Access real-time location of your helicopter while in transit, get push notification.`                                                                                                                                                                                                                                                                           |
| App badges          | row of 2 white pills (App Store + Google Play). Mixed font: outer wrapper Inter SemiBold for the small text, inner uses `font-['PT_Sans:Regular']` 10/14 for "download on" + `font-['PT_Sans:Bold']` 14/14 for "App Store" / "Google Play". Reuse existing `<AppBadgeRow variant="dark" />` (white pill, ink text) — verify the variant produces this look; otherwise add a `light-on-red` variant. |

**Mobile (`505:7551`)**

| Element      | Value                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| Frame        | `430 × 620`, full-bleed red                                                                                        |
| Phone mockup | top-center, scaled-down, ~152×288 device frame (`134/48`); plus 2 mini floating cards (location/search)            |
| Eyebrow      | white filled, `11/8` padding, `TRACKABILITY` at 25/369                                                             |
| H2           | 24/34, two lines: `Precision Helicopter` (Black) / `Shipping. Globally.` (Bold)                                    |
| Lede         | 16px white, two lines: `Access real-time location of your helicopter while` / `in transit, get push notification.` |
| App badges   | row of 2 white pills, smaller padding (`18/10`), positioned 25/530                                                 |

**Animation/hover**:

- Reveal stagger right column: eyebrow (0) → H2 (0.1) → lede (0.2) → badges (0.3).
- Phone mockup: Reveal fade-up (`delay=0`) — single block, no internal animation.
- Floating cards: optional subtle bob (`@keyframes bob` ±4px translateY 3s ease-in-out infinite). **Default to static for v1; flag bob as a polish item if time permits.**
- App badges: hover scale `1.02` + 200ms ease-out (already on `AppBadge`).

**Component**: NEW `src/components/sections/why-choose/TrackabilityCallout.tsx`. Phone mockup is a composite of static images + absolute-positioned elements; render as a server-rendered `<div>` of `<Image>` slots. Treat the asset URLs in §4 as the single source — if the agent finds them expired, re-pull frame `373:15` to get fresh URLs.

---

### §3.8 — Offices Global — Hong Kong featured variant ✅

**Reuse `_shared/OfficesGlobal.tsx`** with two extensions:

1. **Different background** — Figma frame `446:5508` shows a different cityscape image (downtown Hong Kong harbor view, evening lit-up) compared to the existing `/offices/cityscape.webp` used on home/services. **Asset**: `imgImage14` from frame `446:5508` → save as `/public/offices/cityscape-hk.webp`.
2. **Hong Kong featured (red overlay)** instead of UAE — the red overlay on the office card moves from UAE (current default) to Hong Kong. Mobile featured/expanded card defaults to Hong Kong as well.

**Implementation**: extend `OfficesGlobal` props to:

```ts
type OfficesGlobalProps = {
  featuredOverride?: string; // office id, e.g. "hong-kong"
  backgroundSrc?: string; // public path to bg image
  backgroundAlt?: string;
};
```

- Default `featuredOverride` undefined → fall back to current `OFFICES.find(o => o.featured)` behavior.
- Default `backgroundSrc` undefined → fall back to `/offices/cityscape.webp`.
- Mobile state: `useState(featuredOverride ?? defaultFeatured.id)`.

**Verification on M3/M2 consumers** — the existing imports `<OfficesGlobal />` on home and services pages must continue to render UAE-featured + the home cityscape. Since the new props are optional and default to the current behavior, no edits to those consumers should be needed.

**H2 + eyebrow on the M5 frame**: `446:5508` shows Poppins Black 54/66 "ACROSS ALL REGIONS / WORLDWIDE" + outline-white eyebrow "OUR OFFICES" + 16/36 lede — all match the existing `OfficesGlobal` exactly. No copy/typography changes needed.

**Animation/hover**: existing component already has `Reveal` stagger and hover states. No changes.

**Component update**: `src/components/sections/_shared/OfficesGlobal.tsx` — add the two optional props, route them through, leave default behavior intact.

---

### §3.9 — Quote form ✅

**Direct reuse of `_shared/QuoteFormShell`.** Pass an appropriate `photo` prop. **Pending Figma confirmation**: the M5 page-bottom quote form is not in the URLs the user supplied — assume identical to home/services with a photo TBD. Default to the home photo for v1; flag in `DECISIONS.md` to swap if M5 has its own photo.

```tsx
<div id="request-quote" className="scroll-mt-24">
  <QuoteFormShell photo={{ src: "/why-choose-us/quote-photo.webp", alt: "..." }} />
</div>
```

If a M5-specific photo isn't supplied, fall back to the home photo (`/home/quote-form-photo.webp` or whatever is currently in use on `(marketing)/page.tsx`).

---

### §3.10 — Footer ✅

**Direct reuse** of existing `Footer.tsx`. No edits.

---

## 4 — Asset checklist (download + commit)

| Asset                               | Save path                                              | Source frame | Source variable                                                                                         |
| ----------------------------------- | ------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------- |
| Hero team photo                     | `/public/why-choose-us/hero-team.webp`                 | `344:6116`   | `imgRectangle36`                                                                                        |
| Intro band photo (may = hero)       | `/public/why-choose-us/team-band.webp`                 | `344:6116`   | `imgRectangle36` (re-export at wider crop)                                                              |
| Seamless coordination photo         | `/public/why-choose-us/seamless-photo.webp`            | `344:6702`   | `imgImg`                                                                                                |
| Tailored logistic photo             | `/public/why-choose-us/tailored-photo.webp`            | `344:6703`   | `imgImg`                                                                                                |
| Trackability phone mockup           | `/public/why-choose-us/phone-frame.webp` (composite)   | `373:15`     | `imgImage62`, `imgImage4`, `imgImage58`, `imgImage5` (multiple — composite or render as separate slots) |
| Trackability arrow icon             | `/public/why-choose-us/arrow-square-left.svg`          | `373:15`     | `imgArrowSquareLeft`                                                                                    |
| Trackability decorative bg shape    | `/public/why-choose-us/red-bg-shape.webp`              | `373:15`     | `imgRectangle5`                                                                                         |
| Trackability app store icon (apple) | reuse `/home/badge-apple.svg` (likely already exists)  | `373:15`     | `imgImage1`                                                                                             |
| Trackability google play icon       | reuse `/home/badge-google.svg` (likely already exists) | `373:15`     | `imgImage2`                                                                                             |
| Offices Hong Kong cityscape         | `/public/offices/cityscape-hk.webp`                    | `446:5508`   | `imgImage14`                                                                                            |

**Asset URLs are short-lived (~7 days).** If any URL has expired by the time the agent downloads, re-pull the parent frame via `mcp__figma-remote-mcp__get_design_context` to get fresh URLs. Use `curl -o <save-path> "<url>"` from project root.

---

## 5 — Content + CMS

### 5.1 — Hardcoded constants (extend `src/lib/constants.ts`)

```ts
export const WHY_CHOOSE_HERO = {
  eyebrow: "Bespoke Helicopter Shipping",
  h1Lines: ["Why Choose", "Heli Skycargo"], // 2-line break on mobile; desktop renders both as one line via CSS whitespace
  photo: "/why-choose-us/hero-team.webp",
  photoAlt: "Heli Skycargo team in front of a Leonardo helicopter",
} as const;

export const WHY_CHOOSE_GLOBAL_REACH = {
  eyebrow: "Global Reach",
  h2: {
    line1: "Wherever your aircraft needs to go,", // Inter Tight Black
    line2Pre: "we make it ", // Inter Tight Bold
    line2Highlight: "happen", // colored #292d32
    line2Post: ".",
  },
  lede: "No matter from where to where, our experience and expertise in helicopter shipping will deliver a logistical solution catered to your needs and budget. 24/7, we are here for you. Our proven ability to orchestrate helicopter shipping & chartering makes us your partner of choice",
  ctaLabel: "Request Quote",
  ctaHref: "#request-quote",
} as const;

// Description text mapped by stat label (since the Sanity siteStats schema
// doesn't carry descriptions). If editor adds a stat with an unmatched
// label, it renders without a description (graceful degrade).
export const STAT_DESCRIPTIONS: Record<string, string> = {
  "Shipments Completed": "Air and ocean logistics, fully visible end-to-end.",
  "Available Support": "Always ready. Always delivering.",
  "Clients Worldwide": "Trusted worldwide for reliable freight solutions.",
  "Trusted Since": "We deliver everywhere, to the farthest reaches.",
};

// Fallback used when Sanity siteStats query returns null (pre-seed dev).
export const PLACEHOLDER_SITE_STATS = [
  { value: "1000+", label: "Shipments Completed", order: 1 },
  { value: "24/7", label: "Available Support", order: 2 },
  { value: "50+", label: "Clients Worldwide", order: 3 },
  { value: "2014", label: "Trusted Since", order: 4 },
];

export const WHY_CHOOSE_INTRO_PHOTO = {
  src: "/why-choose-us/team-band.webp",
  alt: "Heli Skycargo team at a customer site",
} as const;

type FeatureBlock = {
  eyebrow: string;
  h2Lines: { text: string; weight: "black" | "bold" }[];
  lede: string; // single paragraph body
  paragraphs?: string[]; // multi-paragraph alternative (Tailored uses this)
  bullets?: string[]; // bullet list (Seamless uses this)
  photo: { src: string; alt: string };
  imageSide: "left" | "right"; // desktop only; mobile is always image-top
  ctaLabel: string;
  ctaHref: string;
};

export const WHY_CHOOSE_FEATURE_BLOCKS: readonly FeatureBlock[] = [
  {
    eyebrow: "Why Choose Us",
    h2Lines: [
      { text: "Seamless coordination", weight: "black" },
      { text: "from planning to", weight: "bold" },
      { text: "delivery.", weight: "bold" },
    ],
    lede: "We combine technical understanding with hands-on logistics experience to deliver reliable, flexible shipping solutions for every mission.",
    bullets: [
      "Dedicated specialists in helicopter transport",
      "Global air and ocean freight coordination",
      "End-to-end shipment visibility through our bespoke app",
      "Strong international partner network",
      "Personal support from planning to delivery",
    ],
    photo: {
      src: "/why-choose-us/seamless-photo.webp",
      alt: "HSC operations team in safety vests on a vessel deck",
    },
    imageSide: "left",
    ctaLabel: "Request Quote",
    ctaHref: "#request-quote",
  },
  {
    eyebrow: "Our Approach",
    h2Lines: [
      { text: "Tailored logistic", weight: "black" },
      { text: "solutions built around", weight: "bold" },
      { text: "your aircraft", weight: "bold" },
    ],
    lede: "", // unused — paragraphs drive
    paragraphs: [
      "Every shipment is different. That's why we design tailored transport strategies based on aircraft type, timeline, destination requirements, and handling needs.",
      "Our team coordinates each stage of transport — ensuring safe handling, regulatory compliance, and on-time delivery.",
    ],
    photo: {
      src: "/why-choose-us/tailored-photo.webp",
      alt: "Wrapped helicopter being lifted by ship-side crane",
    },
    imageSide: "right",
    ctaLabel: "Request Quote",
    ctaHref: "#request-quote",
  },
];

export const WHY_CHOOSE_TRACKABILITY = {
  eyebrow: "Trackability",
  h2: {
    line1: "Precision Helicopter", // Inter Tight Black
    line2: "Shipping. Globally.", // Inter Tight Bold
  },
  lede: "Access real-time location of your helicopter while in transit, get push notification.",
  // Reuses APP_LINKS for hrefs.
} as const;
```

### 5.2 — Update `scripts/seed-sanity.mjs` to seed `siteStats`

Add a `SITE_STATS` constant + a `seedSiteStats()` function. The schema is a singleton so create a SINGLE document with `_id = "siteStats"` (matching the structure file's pinned id at `src/sanity/structure.ts:22`):

```js
const SITE_STATS = {
  _id: "siteStats",
  _type: "siteStats",
  stats: [
    { value: "1000+", label: "Shipments Completed", order: 1 },
    { value: "24/7", label: "Available Support", order: 2 },
    { value: "50+", label: "Clients Worldwide", order: 3 },
    { value: "2014", label: "Trusted Since", order: 4 },
  ],
};

async function seedSiteStats() {
  console.log("\n[seed] site stats");
  // Use createOrReplace because the singleton has a fixed _id.
  const created = await client.createOrReplace(SITE_STATS);
  console.log(`  ✓ ${SITE_STATS.stats.length} stats → ${created._id}`);
}
```

Then in `purgeAll()` add `siteStats` to the type list (so `--purge` clears the singleton too), and call `seedSiteStats()` from `main()` after `seedTestimonials()`. Verify the schema accepts the data shape — the existing schema fields are `value / label / icon (optional) / order`, all match.

**No icons in seed**: editors can add icons later via Studio. The frontend renders without icons today (Figma frame doesn't show them in the stats band).

### 5.3 — Sanity wiring on the page

```tsx
// src/app/(marketing)/why-choose-us/page.tsx
import { sanityClient } from "@/lib/sanity/client";
import { siteStatsQuery } from "@/lib/sanity/queries";
import type { SiteStats } from "@/types/sanity";

export const revalidate = 60;

export default async function WhyChooseUsPage() {
  const siteStats = await sanityClient.fetch<SiteStats | null>(siteStatsQuery);
  // Pass siteStats?.stats ?? PLACEHOLDER_SITE_STATS into <StatsBand />
  ...
}
```

`StatsBand` uses the same fallback pattern as `MilestonesTimeline` / `TeamTeaser` / `CustomerTestimonials`. When the Sanity query returns null (empty CMS) it falls back to `PLACEHOLDER_SITE_STATS`. Mark with `// TODO(seed):` so the M9 cleanup pass can find and remove the fallback.

---

## 6 — Locked decisions

(Append the non-obvious ones to `docs/DECISIONS.md` during the implementation pass.)

1. **Route**: `/why-choose-us`. Confirmed — already in FOOTER constants and CMS_SCHEMAS doc.
2. **Stats descriptions are hardcoded**, not in Sanity, to avoid a schema migration. Map by `label`. Captured in §5.1 as `STAT_DESCRIPTIONS`.
3. **Feature blocks (§3.5, §3.6) and the intro photo band (§3.4) render inside `Container` with horizontal page padding** — full-bleed only for Hero, GlobalReach (white bg with world map), Trackability (full red), Offices, and Footer. The user's Image #1 confirms photos in feature blocks have visible side padding and rounded corners.
4. **Mobile feature-block layout**: image-top, content-below at <md, regardless of `imageSide` prop. Desktop-only swap (image-left vs image-right at >=lg).
5. **Mobile Global Reach CTA is OUTLINE** (white bg, ink border) while desktop is FILLED RED. Confirmed from Figma — mirror with breakpoint-conditional `Button` variant.
6. **Hero overlay opacity**: 0.36 mobile / 0.40 desktop (mirrors M4 ServiceDetailHero pattern).
7. **OfficesGlobal Hong Kong variant**: extend the existing component with `featuredOverride` + `backgroundSrc` optional props rather than forking. Default behavior preserved for home/services consumers.
8. **Stats band is promoted to `_shared/`** from day one because `docs/CMS_SCHEMAS.md` §5 says siteStats is "reusable on Home page" — anticipating a future home-page placement.
9. **Trackability section is NOT a reuse of `home/SmartTracking.tsx`** — it's a different layout (full red bg, phone mockup left, headline+badges right) versus home (light bg, two-col header, scroll-snap card row). Build new.
10. **Quote form photo for M5 is TBD**; default to the home photo. Flag in DECISIONS for a swap if Figma later supplies an M5-specific photo.
11. **No new dependencies, no token additions, no Sanity schema changes.** Within the existing CLAUDE.md guardrails.
12. **Stats band order is CMS-driven** (`order asc`). Mobile 2x2 lays out top-row first-two by order, bottom-row next-two — accept the small reading-order deviation from the Figma mobile mock to keep a single source of truth.

---

## 7 — Component map

### NEW (page-scoped — `src/components/sections/why-choose/`)

| File                      | Server/Client              | Notes                                                  |
| ------------------------- | -------------------------- | ------------------------------------------------------ |
| `WhyChooseHero.tsx`       | Server                     | hero, similar shape to `ServiceDetailHero` minus chips |
| `GlobalReachCallout.tsx`  | Server                     | centered eyebrow+H2+lede+CTA on world-map bg           |
| `IntroPhotoBand.tsx`      | Server (or inline in page) | wide rounded photo                                     |
| `FeatureBlock.tsx`        | Server                     | shared by §3.5 and §3.6 with `imageSide` prop          |
| `TrackabilityCallout.tsx` | Server                     | red-bg, phone mockup + headline + app badges           |

### NEW (cross-page reusable — `src/components/sections/_shared/`)

| File            | Server/Client | Notes                                                                     |
| --------------- | ------------- | ------------------------------------------------------------------------- |
| `StatsBand.tsx` | Server        | reads from `siteStatsQuery`; `description` lookup via `STAT_DESCRIPTIONS` |

### MODIFIED

| File                                     | Change                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `_shared/OfficesGlobal.tsx`              | add optional `featuredOverride: string` and `backgroundSrc/backgroundAlt: string` props; default behavior preserved |
| `lib/constants.ts`                       | append `WHY_CHOOSE_*` constants and `STAT_DESCRIPTIONS`, `PLACEHOLDER_SITE_STATS`                                   |
| `scripts/seed-sanity.mjs`                | add `seedSiteStats()` (createOrReplace singleton)                                                                   |
| `app/(marketing)/why-choose-us/page.tsx` | new route — assembles all sections + reads `siteStatsQuery`                                                         |

### REUSED (no edits)

- `_shared/Container`, `Section`, `SectionEyebrow`, `Reveal`
- `_shared/QuoteFormShell` (passed a photo prop for §3.9)
- `ui/Button` (`buttonVariants`)
- `ui/AppBadge` / `AppBadgeRow`
- `layout/Header`, `layout/Footer`
- `lib/sanity/client`, `lib/sanity/queries.siteStatsQuery`

---

## 8 — Acceptance checklist

Run through this before declaring M5 done.

**Functional**

- [ ] `/why-choose-us` renders pre-seed (PLACEHOLDER_SITE_STATS) and post-seed (CMS values) with no visual difference (same 4 stats).
- [ ] `npm run seed:sanity` populates the singleton without errors.
- [ ] All anchors `#request-quote` scroll to the in-page quote form with `scroll-mt-24` offset for the fixed header.
- [ ] `Header` overlay variant renders correctly over the dark hero (logo legible, hamburger visible).
- [ ] FOOTER `Why Choose Us` link from any page navigates here.

**Pixel-perfect (per §0 step 2)**

- [ ] Hero matches `344:6116` desktop + `505:7165` mobile (overlay opacity, eyebrow padding, H1 line break).
- [ ] Global Reach matches `466:6063` desktop + `505:7491` top mobile (font weights line-by-line, mobile outline button vs desktop filled red, lede max-width).
- [ ] Stats band matches the user's screenshot (Image #1) at desktop and `505:7491` middle at mobile (4-up vs 2x2; dividers; value/label/description fonts).
- [ ] Intro photo band has visible horizontal padding + rounded-2xl at all viewports.
- [ ] Feature block A matches `344:6702` desktop + `505:7528` mobile (image-left desktop, image-top mobile; H2 weights line-by-line; 5 bullet items exactly).
- [ ] Feature block B matches `344:6703` desktop + `505:7539` mobile (image-right desktop; 2 paragraphs; H2 weights line-by-line).
- [ ] Trackability matches `373:15` desktop + `505:7551` mobile (red bg + 0.2 overlay shape; phone mockup composition; white eyebrow; app badges).
- [ ] Offices uses Hong Kong as the featured (red) office at all viewports; new background image loads.
- [ ] Quote form renders identically to home/services; submit disabled.

**Code quality**

- [ ] `pnpm typecheck` clean.
- [ ] `pnpm lint` clean.
- [ ] No new packages in `package.json`.
- [ ] No edits to `next.config.*`, `tailwind.config.*`, `tsconfig.json`, `tokens.css`.
- [ ] All new components are Server Components by default; client-only where state required (`StatsBand` count-up is client if implemented; phone-mockup-bob is client if implemented).
- [ ] No client-side Sanity fetch.
- [ ] All `<img>` use `next/image` with explicit `width`/`height` (or `fill` + `sizes`).
- [ ] `alt` text meaningful (or empty for decorative).
- [ ] Focus rings on all interactive elements.
- [ ] No console warnings on first render at any viewport.

**Process**

- [ ] `docs/DECISIONS.md` updated for items #2, #3, #7, #8 (description hardcode, container padding rule, OfficesGlobal extension, StatsBand promotion to `_shared/`).
- [ ] `CLAUDE.md` §2 "Currently working on" updated to reflect M5 done.
- [ ] No commits without explicit user approval.

---

## Appendix A — Verbatim copy

### A.1 — Hero

- Eyebrow: `BESPOKE HELICOPTER SHIPPING`
- H1 (mobile 2 lines / desktop 1 line): `Why Choose Heli Skycargo`

### A.2 — Global Reach

- Eyebrow: `GLOBAL REACH`
- H2 line 1 (Black): `Wherever your aircraft needs to go,`
- H2 line 2 (Bold + highlighted "happen" #292d32): `we make it happen.`
- Lede (one paragraph): `No matter from where to where, our experience and expertise in helicopter shipping will deliver a logistical solution catered to your needs and budget. 24/7, we are here for you. Our proven ability to orchestrate helicopter shipping & chartering makes us your partner of choice`
- CTA: `Request Quote`

### A.3 — Stats band (CMS singleton, in `order asc`)

| order | value   | label                 | description                                          |
| ----- | ------- | --------------------- | ---------------------------------------------------- |
| 1     | `1000+` | `Shipments Completed` | `Air and ocean logistics, fully visible end-to-end.` |
| 2     | `24/7`  | `Available Support`   | `Always ready. Always delivering.`                   |
| 3     | `50+`   | `Clients Worldwide`   | `Trusted worldwide for reliable freight solutions.`  |
| 4     | `2014`  | `Trusted Since`       | `We deliver everywhere, to the farthest reaches.`    |

### A.4 — Feature block A — Seamless Coordination

- Eyebrow: `WHY CHOOSE US`
- H2 (3 lines): `Seamless coordination` (Black) / `from planning to` (Bold) / `delivery.` (Bold)
- Lede: `We combine technical understanding with hands-on logistics experience to deliver reliable, flexible shipping solutions for every mission.`
- Bullets:
  1. `Dedicated specialists in helicopter transport`
  2. `Global air and ocean freight coordination`
  3. `End-to-end shipment visibility through our bespoke app`
  4. `Strong international partner network`
  5. `Personal support from planning to delivery`
- CTA: `Request Quote`

### A.5 — Feature block B — Tailored Logistic

- Eyebrow: `OUR APPROACH`
- H2 (3 lines): `Tailored logistic` (Black) / `solutions built around` (Bold) / `your aircraft` (Bold)
- Paragraph 1: `Every shipment is different. That's why we design tailored transport strategies based on aircraft type, timeline, destination requirements, and handling needs.`
- Paragraph 2: `Our team coordinates each stage of transport — ensuring safe handling, regulatory compliance, and on-time delivery.`
- CTA: `Request Quote`

### A.6 — Trackability

- Eyebrow: `TRACKABILITY` (white-bg variant)
- H2 line 1 (Black, white): `Precision Helicopter`
- H2 line 2 (Bold, white): `Shipping. Globally.`
- Lede (white, may wrap to 2 lines on mobile): `Access real-time location of your helicopter while in transit, get push notification.`
- App badges: App Store + Google Play (existing `APP_LINKS` in `constants.ts`)

### A.7 — Offices

- Eyebrow: `OUR OFFICES`
- H2: `ACROSS ALL REGIONS WORLDWIDE` (Poppins Black + Bold split — already in component)
- Lede: `Delivering reliable helicopter logistics services across all regions worldwide.`
- 4 offices from existing `OFFICES` in `constants.ts` — Hong Kong gets the red overlay (featured), others remain neutral.

### A.8 — Quote form

- Reuses `QuoteFormShell` defaults — eyebrow `Request a Quote`, H2 `Start Your / Global Transport / Request`. No copy override needed unless Figma later supplies one.
