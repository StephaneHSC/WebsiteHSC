# Module 6 — Our Team — Implementation Plan

> **How to use this file**: Design contract for Module 6. Read it cold at the start of the M6 session — it captures the full Figma audit, locked decisions, and content so you don't have to re-pull frames. Cross-references: `CLAUDE.md` (project rules), `docs/DECISIONS.md` (architecture log), `docs/M3_PLAN.md`, `docs/M4_PLAN.md`, `docs/M5_PLAN.md` (sibling modules + shared component map), `AGENTS.md` (Next.js 16 reminder).

**Status**: planning COMPLETE — both desktop + mobile frames audited, the spotlight section design context pulled and locked (eyebrow color, H2 mixed-weight rules, card states, social-icon shape), responsive rules captured, content captured in Appendix A. Ready for autonomous implementation.
**Audit date**: 2026-05-07
**Target route**: `/team` (already wired in NAV + FOOTER `src/lib/constants.ts`)
**Authoritative design source**: Figma file `UkrV8vyPeLqsYbZ57OrESC` (HSC--Copy-)

---

## 0 — Autonomous workflow contract

This module runs without check-ins. The flow is:

1. **Implementation pass** — build all sections per §3 specs, mobile-first, Server Components by default. Use the existing `Reveal` / `SectionEyebrow` / `Container` / `Section` / `ScrollSnapRow` primitives. Don't re-pull Figma frames unless a value is missing from this doc.
2. **Pixel-perfect review pass** — at every viewport (375 / 768 / 1024 / 1440), compare against the Figma frame screenshots. Verify each item below. **A line break, font weight, missing word, or wrong eyebrow color counts as a fail.**
   - eyebrow text + casing + tracking + variant (note: M6 uses `gray` not `red`)
   - H1/H2/H3 line breaks (where do words wrap?)
   - mixed font weights inside a single H2 (Inter Tight Black on line 1 vs Bold on the rest)
   - bio text wording exactly as written (CEO is verbatim from Figma; placeholder bios are lorem-ipsum-style)
   - card name/role wording exactly as written (desktop is canonical — see §3.2 footnote)
   - active vs idle card colors (red plate + white text vs white plate + ink text)
   - social-icon shape (red square, white icon inside — NOT outline)
   - image positions, aspect ratio, rounded corners
   - vertical rhythm (gap between eyebrow → H2 → spotlight → cards)
   - background overlay opacity (hero is `0.36` mobile / `0.40` desktop)
3. **Code review pass** — read every new/modified file end-to-end. Check: TypeScript strictness, no `any`, no inline GROQ, no client-side Sanity fetch, accessibility (semantic tags, focus rings on cards, alt text, aria, keyboard select on cards, escape closes any expansion), Reveal staggers consistent with M2-M5 (`0` → `0.1` → `0.2` → `0.3`), no dependency adds, no config edits. Run `pnpm typecheck` and `pnpm lint` clean.
4. **Re-verify pass** — if step 3 caused any UI/UX edits, re-run step 2 at all viewports for the affected sections.
5. **Docs + handover** — append non-obvious calls to `docs/DECISIONS.md`. Update `CLAUDE.md` §2 "Currently working on" line. Summarise what shipped + what's next. **Do not commit** without explicit user approval (memory: `feedback_no_commit_without_ask`).

### Suggested implementation order

1. **Hardcoded content + types in `constants.ts`** — add `TEAM_HERO`, `TEAM_INTRO`, and an extended `PLACEHOLDER_TEAM_MEMBERS` (9 entries, lorem-ipsum bios for non-CEO) BEFORE building UI so all sections have parity content.
2. **Page route stub** — `src/app/(marketing)/team/page.tsx` with metadata + section import shells (Server Component, ISR `revalidate: 60`).
3. **Optional seed extension** — add `seedTeamMembers()` to `scripts/seed-sanity.mjs` if the user provides the full team list. Default: skip seeding (the `PLACEHOLDER_TEAM_MEMBERS` fallback already keeps the page populated).
4. **Sections, in DOM order** (see §3) — TeamHero → TeamSpotlightSection (heading + spotlight + slider, single client island) → QuoteFormShell → OfficesGlobal (Malaysia featured) → Footer. Build mobile-first, verify at 4 widths per section before moving on.
5. **Polish pass** — Reveal stagger, hover timings, focus rings, mobile width sweep at 375/768/1024/1440. **Then** the pixel-perfect review (§0 step 2).
6. **Typecheck + lint clean.**

---

## 0.5 — Responsive matrix (non-negotiable)

Every section MUST render correctly at the 6 viewports below. Same standard as M5 (`feedback_responsive_first` memory; CLAUDE.md §2 top-line rule #1).

| Width   | Tier                            | Tailwind | What you check                                                                                                                                                |
| ------- | ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 320px   | small mobile                    | `<sm`    | nothing clips horizontally; H1 still wraps cleanly; team slider scrolls smoothly with 1.x cards visible; eyebrow + buttons remain tappable (≥40px tap target) |
| 375px   | iPhone-class mobile             | `<sm`    | matches `505:6781` Figma frames pixel-for-pixel where audited; H1 hero is 3 lines (NOT 4)                                                                     |
| 430px   | iPhone Pro Max mobile           | `<sm`    | matches the 430-wide Figma frame exactly                                                                                                                      |
| 768px   | tablet portrait                 | `md:`    | spotlight transitions: photo-bg → photo-side; team slider can stay horizontal-scroll OR wrap to 2-row grid (pick scroll for consistency)                      |
| 1024px  | tablet landscape / small laptop | `lg:`    | spotlight fully photo-side; team slider 9-up single row OR ScrollSnapRow if it overflows                                                                      |
| 1440px  | desktop                         | `xl:`    | matches `344:4889` Figma desktop frame pixel-for-pixel; spotlight content right-aligned within the photo                                                      |
| 1920px+ | big screen / ultra-wide         | n/a      | content stays centered with `Container` max-w; full-bleed sections (hero, spotlight bg) fill viewport but content stays centered; no awkward stretching       |

**Rules to apply across the board:**

1. **Use the project's existing `Container`** for all content. Don't invent a new container.
2. **Full-bleed sections** (Hero, Spotlight background image): extend to viewport edges; content sits inside `Container`.
3. **Hero photo**: `next/image` with `priority` (it's the LCP candidate) + `sizes="100vw"` + `aspect-ratio` lock to prevent CLS.
4. **Spotlight composite image**: 2-layer stack (`image 60` photo + `image 64` overlay/gradient) using `next/image` with `fill` + `sizes="100vw"`. The active member's portrait is the `image 60` layer; on click swap, fade-cross between members.
5. **Team slider**: reuse the existing `ScrollSnapRow` primitive (already used by `TeamTeaser`). At ≥1024 it fits 9 cards in a single row (1600px frame ≈ 146×9 + 15×8 = 1434, fits inside `Container`'s 1280px max-w with horizontal scroll spillover OR wraps to 2 rows). **Decision: keep `ScrollSnapRow` at all breakpoints — single row on desktop with overflow-x-auto, horizontal scroll on mobile.** Avoids duplicate layout code.
6. **Card click target**: each `<button>` (NOT `<div onClick>`) inside the slider must be ≥44×44 to satisfy mobile tap targets. The card itself is 146×195 — well within target.
7. **Big screens (≥1920)**: Hero photo, spotlight composite, and offices cityscape should not pixellate — verify the source assets are at least 2400px wide. If not, flag in DECISIONS.md.

**Acceptance gate**: in §8's "Pixel-perfect" checklist, every line is implicitly multiplied by the viewports above. The pass isn't done until each section has been visually verified at 320, 375, 430, 768, 1024, 1440, 1920.

---

## 1 — Token + dependency check

**No new tokens needed.** All fonts/colors/spacing already defined.

- Inter Tight — all weights `400, 500, 600, 700, 800, 900` loaded in `src/app/layout.tsx`. So `Black` (900), `Bold` (700), `SemiBold` (600) all render at exact weight — no fallback.
- PT Sans (Regular 400 / Bold 700) ✅
- `--color-brand-red` (`#E40C28`), `--color-ink` (`#101820`), `--color-ink-muted` (`#4A4E54`), `--color-ink-soft` (`#3D3D3D`), `--color-surface` (white), `--color-input-border` (`#E4E4E4`) ✅
- Card idle border uses `#f5f5f5` (a touch lighter than `--color-surface-alt`'s background usage). Treat as inline literal `border-[#f5f5f5]` since this is an edge-case border, not worth a dedicated token.
- **Eyebrow gray variant** — `SectionEyebrow` already supports `variant="gray"` (`bg-ink-muted text-surface`) — confirmed at `src/components/sections/_shared/SectionEyebrow.tsx:14`. Use this for the spotlight section eyebrow `EXPERTS YOU CAN TRUST`. Hero eyebrow `OUR TEAM` uses `variant="gray"` too per Figma (NOT red).

**No new packages.** Reuse `Image`, `next/font`, `cn`, `Reveal`, `SectionEyebrow`, `Container`, `Section`, `ScrollSnapRow`, `Button` (`buttonVariants`), `QuoteFormShell`, `OfficesGlobal`, `fetchWithCmsFallback`.

---

## 2 — Figma frame index

**Audit file**: `UkrV8vyPeLqsYbZ57OrESC` (HSC--Copy-).
Re-pull only if an asset URL has expired (Figma asset URLs live ~7 days) — refer to §4 for the asset download list.

| #   | Section                                            | Desktop nodeId                       | Mobile nodeId                                     | Status                                                |
| --- | -------------------------------------------------- | ------------------------------------ | ------------------------------------------------- | ----------------------------------------------------- |
| 1   | Hero                                               | `344:4891` + `344:4897`              | `505:6782`                                        | ✅ audited (metadata)                                 |
| 2a  | Heading "Experts You Can Trust"                    | `344:4903`                           | `505:7073`                                        | ✅ design-context locked                              |
| 2b  | Spotlight (photo bg + name + role + bio + socials) | `344:4910` + `446:3995` + `446:3996` | `505:7079` + `505:7077` + `505:7078` + `505:7084` | ✅ design-context locked                              |
| 2c  | Team slider (9 cards)                              | `344:4926`–`674:493`                 | `505:7095`–`505:7149`                             | ✅ design-context locked                              |
| 3   | Quote form                                         | `344:5595`                           | `505:6839`                                        | direct reuse — `QuoteFormShell`                       |
| 4   | Offices Global — **Malaysia featured**             | `446:4177`                           | `889:327`                                         | direct reuse — `<OfficesGlobal defaultActive="my" />` |
| 5   | Footer                                             | reuse                                | reuse                                             | direct reuse — existing `Footer.tsx`                  |

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

### §3.1 — Hero ✅

**Desktop (`344:4891` bg + `344:4897` content, frame 1600×705)**

| Element         | Value                                                                                                                                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame           | `1600 × 705`                                                                                                                                                                                                                                         |
| Background      | full-bleed photo (`/team/hero-team.webp`, see §4) + `rgba(0,0,0,0.40)` overlay                                                                                                                                                                       |
| Header          | sits over hero (logo top-left at 79/28 — 136×50, "Request Quote" pill + hamburger top-right at 1295/28). **Reuse existing `Header.tsx` overlay variant**, no duplication                                                                             |
| Eyebrow         | **`gray`** variant (`bg-ink-muted text-surface`), padding `8px`, PT Sans Bold 12px tracking 0.72px uppercase. Text: `OUR TEAM`. Position left:79 top:281, ~83×24                                                                                     |
| H1              | PT Sans Bold 64/82 **OR** Inter Tight Bold (verify against M5 hero pattern — likely PT Sans to match M5). White, capitalize. Text: `Meet the People Behind Every Shipment`. Position left:79 top:342, max-width 633px → wraps to 2 lines on desktop. |
| Vertical rhythm | eyebrow at top:281; H1 at top:342 → gap of ~37px (`mt-8` ≈ 32px is close enough). Hero bottom padding from H1 to frame bottom: 705-(342+127)=236px (lots of breathing room)                                                                          |

**Mobile (`505:6782`, frame 430×470)**

| Element | Value                                                                                                                                                                                                                                                                                  |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame   | `430 × 470`                                                                                                                                                                                                                                                                            |
| Overlay | `rgba(0,0,0,0.36)` — **0.36 mobile vs 0.40 desktop** (mirrors M4 ServiceDetailHero + M5 WhyChooseHero pattern: `bg-ink/[0.36] md:bg-ink/40`)                                                                                                                                           |
| Eyebrow | gray variant, smaller padding `6px`, position left:24 top:212, ~73×20                                                                                                                                                                                                                  |
| H1      | PT Sans Bold 32/42 (or 28/36 if 32px overflows the 239px column), white, capitalize, **3 lines**: `Meet the People` / `Behind Every` / `Shipment`. Position left:24 top:252, 239×106. **Force the line break** with `<span className="block">` per line — DO NOT rely on natural wrap. |

**Animation/hover**: `Reveal` (eyebrow `delay=0`, H1 `delay=0.1`). Header is sticky/fixed via existing layout — no extra work.

**Component**: NEW `src/components/sections/team/TeamHero.tsx`. Layout structurally identical to `WhyChooseHero` minus the M5-specific copy. **Consider promoting to `_shared/PageHero.tsx` if M6 + M5 + M4 patterns are 95% identical** — but defer that refactor unless time permits (M5 hero stayed page-scoped, follow that precedent).

---

### §3.2 — Experts You Can Trust + Spotlight + Team Slider ✅

This is **one logical section** rendered as **one client component** (`TeamSpotlightSection`) because the slider's selected card drives the spotlight content. All three sub-areas (heading, spotlight, slider) share state.

**Desktop (`344:5593`, frame 1600×1202)**

#### §3.2.1 Heading (centered, top of frame)

| Element   | Value                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| Eyebrow   | **`gray`** variant (NOT red). Text: `EXPERTS YOU CAN TRUST`. Position centered at 731/0 (relative), ~164×24, padding 8px |
| H2        | 3 lines, all uppercase, font-size 54 / line-height 66, color `--color-ink` (`#101820`), centered. Mixed weights:         |
|           | line 1 — Inter Tight **Black** — `At Heli Skycargo,`                                                                     |
|           | line 2 — Inter Tight **Bold** — `our team is fueled by passion to deliver`                                               |
|           | line 3 — Inter Tight **Bold** — `BEST-IN-CLASS service.`                                                                 |
| Container | max-width 1167px centered. Title sits in a 222px-tall block. Apply `max-w-[1167px] mx-auto` on the inner wrapper.        |
| Vertical  | eyebrow at top:0, H2 at top:51 (Δ51 / `mt-12`)                                                                           |

#### §3.2.2 Spotlight (composite photo-bg with content overlay on the right)

| Element              | Value                                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frame                | full-width 1600×900, sits at top:284 (just below the heading)                                                                                                                                                                                                                                                                                                      |
| Photo background     | 2-layer stack: bottom `imgImage60` (`/team/spotlight/{id}-photo.webp`, ~1600×900 wide candid photo of the active member) + top `imgImage64` (`/team/spotlight/overlay.webp`, dark/red gradient or vignette). Both `next/image fill sizes="100vw"`. Active member's `image 60` swaps on click.                                                                      |
| Content position     | absolute right side, left:929 top:461 (so 671px from frame left, 461px from spotlight section top). Width 588px tall 300px.                                                                                                                                                                                                                                        |
| Name (H3)            | Inter Tight **SemiBold** 40px / 80px line-height, color `--color-surface` (white), uppercase, capitalize. Text: e.g. `Stephane Marot`                                                                                                                                                                                                                              |
| Role                 | PT Sans Regular 17px / 80px line-height (effectively single-line), white, capitalize. Text: e.g. `Founder & CEO`. Position 56px below name baseline.                                                                                                                                                                                                               |
| Bio paragraph 1      | PT Sans Regular 17px / 28px line-height, white, max-width 462px. ~3 lines.                                                                                                                                                                                                                                                                                         |
| Bio paragraph 2      | PT Sans Regular 17px / 28px line-height, white, max-width 457px. ~4 lines. Position 96px below paragraph 1 top (so 28px gap between paragraphs).                                                                                                                                                                                                                   |
| Social icons (right) | 2 squares stacked horizontally at top:461 right:79 (so aligned with name baseline). Each is 48×48 `bg-brand-red` (filled red `#e40c28`), white icon centered (LinkedIn / email). Reuse the SVG assets from `imgLinkedIn` and `imgSms` — download to `/public/team/icon-linkedin.svg` and `/public/team/icon-email.svg`. Spacing: 13px gap between the two squares. |

**Spotlight content height**: 300px (name 29 + gap + role 12 + gap + bio1 68 + gap + bio2 95 ≈ 300). Photo background is 900px tall, so content occupies the upper-right third of the photo.

#### §3.2.3 Team Slider (9 cards, bottom of frame)

Position: cards row at top:928 (so 928px down from heading top, which means ~644px down from spotlight start). Cards span x:83 to x:1517 (=1434px wide row), within the 1600px frame.

| Element                    | Value                                                                                                                                                                                                                                                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card frame                 | 146 × 195 px (146 wide, 195 tall). Gap between cards: 244-(83+146) = 15px → `gap-[15px]` between flex items.                                                                                                                                                                                                                        |
| Active state plate         | `bg-brand-red` (`#e40c28`) full card area (146×184, top:11 within the 195-tall frame so the photo's head extends above by 11px). Card content area below the photo's bottom edge.                                                                                                                                                   |
| Idle state plate           | `bg-surface` (white) + `border border-[#f5f5f5]` (same plate dimensions).                                                                                                                                                                                                                                                           |
| Photo bg (behind portrait) | radial gradient `linear-gradient(white→#e4e4e4)` square at 8.34px/8.54 inside the card, ~129×128. Visible behind the portrait crop.                                                                                                                                                                                                 |
| Portrait                   | per-member crop, varied widths (82–129px) × 148px tall, positioned to overflow the plate top by ~11px (so head pokes up above the red/white plate). Each card's portrait fills its slot per `imgImage21`/`23`/etc.                                                                                                                  |
| Name                       | Inter Tight **Bold** 12px / 50px line-height, uppercase capitalize, centered horizontally within the plate. Color: `--color-surface` (white) on active card, `--color-ink` on idle.                                                                                                                                                 |
| Role                       | PT Sans Regular 10px, centered. Color: white on active, ink on idle. Line-height varies by role length: `leading-[36px]` (single short line, e.g. "Founder & CEO", "RFQ"), `leading-[20px]` (long single line, e.g. "Sales & Marketing Executive"), `leading-[11px]` (explicit 2-line break, e.g. "Deployment & Lead Coordinator"). |

**Cards in display order (desktop, x-asc)** — desktop roles are canonical (per user 2026-05-07):

| #   | Name              | Role                          | Photo asset (Figma var → save path)                                 |
| --- | ----------------- | ----------------------------- | ------------------------------------------------------------------- |
| 1   | Stephane Marot    | Founder & CEO                 | `imgImage21` → `/public/team/stephane-marot.png`                    |
| 2   | Daniel Cosico     | Deployment & Lead Coordinator | `imgImage23` → `/public/team/daniel-cosico.png`                     |
| 3   | Adriana Athirah   | Sales & Marketing Executive   | `imgImage74` → `/public/team/adriana-athirah.png`                   |
| 4   | Rica Mae Cortez   | Logistic Specialist           | `imgImage68` → `/public/team/rica-mae-cortez.png`                   |
| 5   | Alfredo Dinglasan | Logistic Specialist           | `imgImage22` → `/public/team/alfredo-dinglasan.png`                 |
| 6   | Nikhitha Manuel   | RFQ                           | `imgImage71` → `/public/team/nikhitha-manuel.png`                   |
| 7   | Remi Hachisuka    | Japan Desk Manager            | `imgImage73` → `/public/team/remi-hachisuka.png`                    |
| 8   | Anjelimo Mulati   | Accounting                    | `imgImage72` → `/public/team/anjelimo-mulati.png`                   |
| 9   | Mia Juliet Marot  | Junior Sales & Marketing      | `imgImage73` (different crop) → `/public/team/mia-juliet-marot.png` |

> Mobile metadata had longer alternative roles + an extra "Tim Walsh" entry. Per user 2026-05-07, **desktop roles are canonical** — ignore the mobile variants. Do NOT include Tim Walsh.

**Mobile (`505:7072`, frame 430×1072)** — same 3 sub-areas, vertical stack:

#### §3.2.1' Heading (mobile)

| Element | Value                                                                                                                                                     |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow | gray variant, padding 8px, position centered at 133/40, ~164×24                                                                                           |
| H2      | 4 lines (mobile wraps differently than desktop), font-size 24 / line-height 34, all uppercase, ink color, centered:                                       |
|         | line 1 — Inter Tight Black — `At Heli Skycargo,`                                                                                                          |
|         | line 2 — Inter Tight Bold — `our team is fueled by passion`                                                                                               |
|         | line 3 — Inter Tight Bold — `to deliver best in-class`                                                                                                    |
|         | line 4 — Inter Tight Bold — `service.`                                                                                                                    |
|         | (Note: mobile uses `best in-class` lowercase, not `BEST-IN-CLASS`. Desktop uses caps. **Use `uppercase` CSS at section level** so both render uppercase.) |

#### §3.2.2' Spotlight (mobile, vertical stack)

| Element           | Value                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Composite image   | 2-layer stack: `image 60` (430×500 portrait) + `image 64` (430×818, taller for gradient). Position top:254 — directly below the heading. |
| Spotlight content | inside the image area, vertical text-stack starting at top:539, padding x:24, width 382px:                                               |
| Name              | Inter Tight SemiBold 24px / 80px line-height, white, uppercase capitalize                                                                |
| Role              | PT Sans Regular 14px / 80px line-height, white                                                                                           |
| Bio paragraph 1   | PT Sans Regular 14px / 20px line-height, **`text-justify`** (justified), white, ~382px wide, ~3 lines                                    |
| Bio paragraph 2   | PT Sans Regular 14px / 20px line-height, **`text-justify`**, white, ~4 lines, position top:673                                           |
| Social icons      | top:538 right side, 73×32 total (smaller than desktop 109×48). Same red squares with white icons inside.                                 |

#### §3.2.3' Team Slider (mobile, horizontal scroll)

Same 146×195 cards. Position top:843. Cards extend from x:25 to x:1419 — far past the 430px frame. **Native horizontal scroll (`ScrollSnapRow`)** with `snap-mandatory snap-start`. Stephane card initial position visible at x:25.

**Same 9 cards, same order, same active = Stephane on first paint** (matches desktop).

**Animation/hover (entire §3.2)**:

- **Reveal stagger on heading** — eyebrow (0) → H2 (0.1).
- **Reveal stagger on spotlight content** — name (0.2) → role (0.25) → bio paragraphs (0.3) → social icons (0.35).
- **Reveal on slider row** — single fade-up (0.4).
- **Click-to-swap**: clicking a card updates the spotlight content + spotlight photo + active card plate. Crossfade on the spotlight `image 60` layer (`transition-opacity duration-300 ease-out` between members). Spotlight content (name, role, bio, social URLs) updates instantly.
- **Hover (desktop only)**: idle cards lift `translate-y-[-2px]` + reveal the red plate at `opacity-30` (telegraphs clickability). Active card has no hover effect (already red). Mobile: no hover, just `:active` press feedback.
- **Keyboard select**: each card is a `<button>` — Enter/Space activates select. Arrow Left/Right (when focus is in the slider) moves focus to adjacent card. ESC clears the focused card (no behavior change to spotlight).
- **Crossfade timing**: spotlight `image 60` fades over 300ms. Bio + name swap is instant (no fade) because text crossfade looks janky with line-height shifts.

**Component**: NEW `src/components/sections/team/TeamSpotlightSection.tsx` — single client component (`"use client"` because the swap state is interactive). Sub-components inside same file or split into `team/TeamCard.tsx` + `team/TeamSpotlight.tsx` if it grows past ~200 lines. Use `useState<string>(activeId)` and `useMemo` to derive the active member from the unified list.

---

### §3.3 — Quote form ✅

**Direct reuse of `_shared/QuoteFormShell`**. Pass an appropriate `photo` prop. The Figma frame `344:5595` shows a generic team-photo placeholder on the left column. Default to the existing home photo until/unless an M6-specific asset is supplied.

```tsx
<div id="request-quote" className="scroll-mt-24">
  <QuoteFormShell photo={{ src: "/home/quote-form-photo.webp", alt: "..." }} />
</div>
```

If a M6-specific photo arrives later, swap the `photo` prop and flag in DECISIONS.md.

---

### §3.4 — Offices Global — Malaysia featured ✅

**Direct reuse of `_shared/OfficesGlobal`** with `defaultActive="my"`. The component reads the cityscape from `OFFICES.find(o => o.id === "my").cityscape.src` (`/offices/cityscape-my.webp`, already in `public/offices/`).

```tsx
<OfficesGlobal defaultActive="my" />
```

**No edits to `OfficesGlobal`**. M5's plan called for `featuredOverride/backgroundSrc/backgroundAlt` props but the actual implementation refactored to a cleaner `defaultActive` + per-office cityscape model (see `OFFICES` constants and `OfficesGlobal` source). M6 just calls `defaultActive="my"`.

**Mobile**: defaults to Malaysia featured too (same prop). The Figma mobile frame shows UAE highlighted — that's a stale mobile mock. Consistency wins; user explicitly confirmed Malaysia default at all viewports (2026-05-07).

**Animation**: existing component already has Reveal stagger + featured-tabs pattern + cityscape cross-fade on tap. No changes.

---

### §3.5 — Footer ✅

**Direct reuse** of existing `Footer.tsx`. No edits.

---

## 4 — Asset checklist (download + commit)

Most team portraits already exist in `public/team/` (Stephane, Daniel, Adriana). New ones to download:

| Asset                                      | Save path                              | Source frame                       | Source variable                               | Notes                                                                                                                                        |
| ------------------------------------------ | -------------------------------------- | ---------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero team photo                            | `/public/team/hero-team.webp`          | `344:4891`                         | (bg of Rectangle 36)                          | re-pull from frame `344:4889` since metadata only references it                                                                              |
| Spotlight photo — Stephane (CEO)           | `/public/team/spotlight/stephane.webp` | `344:5593`                         | `imgImage60`                                  | wide candid 1600×900                                                                                                                         |
| Spotlight overlay (gradient)               | `/public/team/spotlight/overlay.webp`  | `344:5593`                         | `imgImage64`                                  | 1600×900 dark gradient or vignette                                                                                                           |
| Spotlight photos — placeholder for other 8 | (skip; CEO is the only one in Figma)   | —                                  | —                                             | placeholder bios + spotlight photo = use Stephane's photo or a generic team photo with "TODO" overlay until client supplies bios + portraits |
| Card portrait — Daniel                     | `/public/team/daniel-cosico.png`       | already in `/public/team/` from M2 | —                                             | reuse                                                                                                                                        |
| Card portrait — Adriana                    | `/public/team/adriana-athirah.png`     | already in `/public/team/` from M2 | —                                             | reuse                                                                                                                                        |
| Card portrait — Stephane                   | `/public/team/stephane-marot.png`      | already in `/public/team/` from M2 | —                                             | reuse                                                                                                                                        |
| Card portrait — Rica Mae                   | `/public/team/rica-mae-cortez.png`     | `344:5593`                         | `imgImage68`                                  | NEW                                                                                                                                          |
| Card portrait — Alfredo                    | `/public/team/alfredo-dinglasan.png`   | `344:5593`                         | `imgImage22`                                  | NEW                                                                                                                                          |
| Card portrait — Nikhitha                   | `/public/team/nikhitha-manuel.png`     | `344:5593`                         | `imgImage71`                                  | NEW                                                                                                                                          |
| Card portrait — Remi Hachisuka             | `/public/team/remi-hachisuka.png`      | `344:5593`                         | `imgImage73`                                  | NEW                                                                                                                                          |
| Card portrait — Anjelimo                   | `/public/team/anjelimo-mulati.png`     | `344:5593`                         | `imgImage72`                                  | NEW                                                                                                                                          |
| Card portrait — Mia Juliet                 | `/public/team/mia-juliet-marot.png`    | `344:5593`                         | `imgImage73` (different crop or `imgImage74`) | NEW — verify which asset id maps in re-pull                                                                                                  |
| Social icon — LinkedIn                     | `/public/team/icon-linkedin.svg`       | `344:5593`                         | `imgLinkedIn`                                 | NEW (white SVG)                                                                                                                              |
| Social icon — email                        | `/public/team/icon-email.svg`          | `344:5593`                         | `imgSms`                                      | NEW (white SVG)                                                                                                                              |

**Asset URLs are short-lived (~7 days).** If any URL has expired by the time the agent downloads, re-pull frame `344:5593` (via `mcp__figma-remote-mcp__get_design_context`) for fresh URLs. Use `curl -o <save-path> "<url>"` from project root.

**Card portrait sizing**: Figma shows each portrait at 82–129px wide × 148px tall (varies per member to fit the body shape). Download at 2x (i.e. 160–260 wide × 300 tall) for retina. Format: PNG (transparent background) since the cards layer the portrait over a radial gradient.

---

## 5 — Content + CMS

### 5.1 — Hardcoded constants (extend `src/lib/constants.ts`)

```ts
export const TEAM_HERO = {
  eyebrow: "Our Team",
  h1Lines: ["Meet the People", "Behind Every", "Shipment"], // mobile 3-line; desktop renders as 2 lines via natural wrap inside max-w-[633px]
  photo: "/team/hero-team.webp",
  photoAlt: "Heli Skycargo team behind the scenes",
} as const;

export const TEAM_INTRO = {
  eyebrow: "Experts You Can Trust",
  // H2 is a 3-line mixed-weight headline. The first line is BLACK, the rest are BOLD.
  // Mobile re-wraps to 4 lines (handled in component, NOT here — copy is identical).
  h2Lines: [
    { text: "At Heli Skycargo,", weight: "black" },
    { text: "our team is fueled by passion to deliver", weight: "bold" },
    { text: "BEST-IN-CLASS service.", weight: "bold" },
  ],
} as const;
```

### 5.2 — Extend `PLACEHOLDER_TEAM_MEMBERS` (move from `TeamTeaser.tsx` to `constants.ts`)

The existing `TeamTeaser.tsx` has 4 placeholders. **Promote and extend to 9** so M6 + the home teaser share the same source. Move the array from `TeamTeaser.tsx` to `constants.ts` and import.

```ts
// src/lib/constants.ts
export type TeamMemberPlaceholder = {
  _id: string;
  full_name: string;
  role: string;
  /** Static portrait PNG used while Sanity is empty. */
  placeholderPhoto: string;
  /** Lorem-ipsum-style placeholder bio paragraphs. CEO uses verbatim Figma copy. */
  bioParagraphs: readonly string[];
  social_links?: { linkedin?: string; email?: string };
  /** Default-active flag; only ONE member should be true at a time. */
  is_featured?: boolean;
};

export const PLACEHOLDER_TEAM_MEMBERS: readonly TeamMemberPlaceholder[] = [
  {
    _id: "p1",
    full_name: "Stephane Marot",
    role: "Founder & CEO",
    placeholderPhoto: "/team/stephane-marot.png",
    bioParagraphs: [
      "With 25+ years in global freight forwarding across Europe, USA, Asia and Middle East. Stephane brings deep industry expertise and a strong customer-focused approach.",
      "Having accompanied helicopter shipments onboard aircraft such as the AN-124 and IL-76, he has built a trusted worldwide network and remains closely involved in supporting clients across the globe.",
    ],
    social_links: {
      linkedin: "https://linkedin.com/in/stephanemarot",
      email: "stephane@heliskycargo.com",
    },
    is_featured: true,
  },
  {
    _id: "p2",
    full_name: "Daniel Cosico",
    role: "Deployment & Lead Coordinator",
    placeholderPhoto: "/team/daniel-cosico.png",
    bioParagraphs: [
      // TODO(content): client to provide bio for Daniel Cosico.
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ],
  },
  // ... 7 more entries with same shape, lorem-ipsum bios for non-CEO members ...
];
```

**TeamTeaser refactor**: the home teaser component imports `PLACEHOLDER_TEAM_MEMBERS` from constants and uses the first 4 (matching today's behavior). The `placeholderPhoto` field is shared between TeamTeaser and TeamSpotlightSection. No regression on home page expected.

### 5.3 — Sanity wiring on the page

The existing `teamMembersQuery` (in `src/lib/sanity/queries.ts`) already returns: `_id, full_name, role, department, photo, short_bio, long_bio, social_links, is_featured` ordered by `order asc`, filtered to `status == "published"`. **No query changes needed**.

```tsx
// src/app/(marketing)/team/page.tsx
import { sanityClient } from "@/lib/sanity/client";
import { teamMembersQuery } from "@/lib/sanity/queries";
import { PLACEHOLDER_TEAM_MEMBERS } from "@/lib/constants";
import type { TeamMember } from "@/types/sanity";

export const revalidate = 60;

export default async function TeamPage() {
  const members = await sanityClient.fetch<TeamMember[]>(teamMembersQuery);
  const display = members.length > 0 ? members : PLACEHOLDER_TEAM_MEMBERS;

  return (
    <>
      <TeamHero />
      <TeamSpotlightSection members={display} />
      <div id="request-quote" className="scroll-mt-24">
        <QuoteFormShell photo={{ src: "/home/quote-form-photo.webp", alt: "..." }} />
      </div>
      <OfficesGlobal defaultActive="my" />
    </>
  );
}
```

`TeamSpotlightSection` accepts a `members` prop typed as `TeamMember[] | TeamMemberPlaceholder[]` (use a union or a discriminator field). The type guard `isPlaceholder(m)` matches the existing `TeamTeaser` pattern. Initial active member is `members.find(m => m.is_featured) ?? members[0]`.

**Optional seed extension** — `scripts/seed-sanity.mjs` can gain a `seedTeamMembers()` function that uploads the 9 placeholder portraits + bios to Sanity. **Defer unless user explicitly requests** — `PLACEHOLDER_TEAM_MEMBERS` keeps the page populated without seeding. If implemented, follow the existing `seedSiteStats()` pattern (createOrReplace per `_id`).

> **CRITICAL — `_id` format**: Use `_id: "team-<slug>"` (hyphen), NOT `team.<slug>` (dot). Sanity treats any `_id` whose first path segment contains a dot (`team.X`, `foo.bar`, etc.) as a **private namespace** that's hidden from unauthenticated public reads — the seed will succeed but the website's CDN-backed client will see the docs as `[]` and fall through to placeholders. Verified 2026-05-10 by direct API probe. See `docs/DECISIONS.md`.

### 5.4 — Bio rendering: plain text paragraphs, not Portable Text

The Sanity schema has `long_bio` typed as `array of block` (Portable Text). The Figma design renders only 2 simple paragraphs. **Decision**: render `long_bio` as plain `<p>` paragraphs by extracting the `children[].text` from each block. Don't pull in `@portabletext/react` for this. If future bios use rich formatting (lists, links), revisit. Falls back to the placeholder `bioParagraphs` array when CMS is empty.

---

## 6 — Locked decisions

(Append the non-obvious ones to `docs/DECISIONS.md` during the implementation pass.)

1. **Route**: `/team`. Confirmed — already in NAV + FOOTER constants.
2. **Spotlight is click-to-swap**, single client island in `TeamSpotlightSection`. Initial active = the member with `is_featured: true`, or the first member if none is featured. URL hash sync NOT implemented in v1 (future polish).
3. **Eyebrow uses `gray` variant**, not red, for both hero and spotlight section. Verified from Figma `bg-[#4a4e54]`. Documented because it deviates from M3/M4/M5 default red.
4. **Desktop roles are canonical** when desktop and mobile Figma frames disagree. Mobile shows additional/different role text and an extra "Tim Walsh" entry that does NOT appear on desktop — those are stale. Use desktop roles for all members and 9 total members (no Tim Walsh).
5. **Placeholder bios for non-CEO members are lorem-ipsum** with `// TODO(content):` markers. Replace with real bios when client supplies them — likely M9 polish or post-launch.
6. **Spotlight photo for non-CEO members** — Figma only shows the CEO. Two options:
   - (a) Reuse Stephane's photo as a generic placeholder for all 8 non-CEO members until client supplies. Visually inconsistent but quick.
   - (b) Use a generic team photo (any of the existing `/team/hero-team.webp` etc.) with a "Photo coming soon" overlay on hover. More UX-friendly.
   - **Decision**: option (a) — reuse Stephane's spotlight photo for now. Flag as a M9 task to swap in real per-member spotlight photos when client delivers. Less visual disruption than the overlay.
7. **Mobile offices default = Malaysia** (consistent with desktop). Figma mobile frame shows UAE highlighted — treat as stale. User confirmed (2026-05-07).
8. **`OfficesGlobal` API has changed** since M5_PLAN was written: it now accepts `defaultActive?: string` (office id) — not `featuredOverride` + `backgroundSrc` + `backgroundAlt`. Per-office cityscape lives in the `OFFICES` constant. M6 just passes `defaultActive="my"`.
9. **Promoting placeholder team data to constants.ts** — moves `PLACEHOLDER_TEAM_MEMBERS` from `TeamTeaser.tsx` to `constants.ts` and extends to 9 members. Both home (top 4) and `/team` (all 9) consume the same array.
10. **Bio renders as plain paragraphs**, not Portable Text — no new dependency. Revisit if rich formatting needed later.
11. **Card portrait images stay PNG** (not WebP) because they're transparent-bg cutouts that need an alpha channel; WebP supports alpha but PNGs are already in repo from M2.
12. **No new dependencies, no token additions, no Sanity schema changes.** Within existing CLAUDE.md guardrails.

---

## 7 — Component map

### NEW (page-scoped — `src/components/sections/team/`)

| File                       | Server/Client                                        | Notes                                                                                               |
| -------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `TeamHero.tsx`             | Server                                               | hero, structurally similar to `WhyChooseHero` — full-bleed photo + 0.36/0.40 overlay + eyebrow + H1 |
| `TeamSpotlightSection.tsx` | Client                                               | heading + spotlight + slider as one unit; manages `activeId` state                                  |
| `TeamCard.tsx`             | Client (rendered inside the parent client component) | individual card; `<button>` with `aria-pressed`; hover/active visual states                         |

### MODIFIED

| File                                      | Change                                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `lib/constants.ts`                        | append `TEAM_HERO`, `TEAM_INTRO`, and migrate `PLACEHOLDER_TEAM_MEMBERS` (extended to 9) here   |
| `components/sections/home/TeamTeaser.tsx` | import `PLACEHOLDER_TEAM_MEMBERS` from constants instead of declaring inline; use `slice(0, 4)` |
| `app/(marketing)/team/page.tsx`           | new route — assembles all sections + reads `teamMembersQuery`                                   |

### REUSED (no edits)

- `_shared/Container`, `Section`, `SectionEyebrow`, `Reveal`, `ScrollSnapRow`, `cmsFallback`
- `_shared/QuoteFormShell` (passed a photo prop for §3.3)
- `_shared/OfficesGlobal` (passed `defaultActive="my"` for §3.4)
- `ui/Button` (`buttonVariants`)
- `layout/Header`, `layout/Footer`
- `lib/sanity/client`, `lib/sanity/queries.teamMembersQuery`

---

## 8 — Acceptance checklist

Run through this before declaring M6 done.

**Functional**

- [ ] `/team` renders pre-seed (PLACEHOLDER_TEAM_MEMBERS, 9 entries) and post-seed (CMS values) with no visual difference when CMS has 9 members.
- [ ] Initial active card = the member with `is_featured: true` (Stephane in placeholder data).
- [ ] Clicking any card swaps the spotlight photo + name + role + bio + social URLs.
- [ ] Spotlight photo crossfades over ~300ms; text swaps instantly.
- [ ] Active card has the red plate; previously active card returns to white-with-border.
- [ ] Keyboard: Tab into slider, Arrow Left/Right cycles focus, Enter/Space selects.
- [ ] All anchors `#request-quote` scroll to the in-page quote form with `scroll-mt-24` offset.
- [ ] `Header` overlay variant renders correctly over the dark hero (logo legible, hamburger visible).
- [ ] FOOTER `Our Team` link from any page navigates here.
- [ ] OfficesGlobal opens with Malaysia highlighted at all viewports.

**Pixel-perfect (per §0 step 2)**

- [ ] Hero matches `344:4891`+`344:4897` desktop + `505:6782` mobile (overlay opacity 0.40/0.36, eyebrow gray variant, H1 wraps to 2 lines desktop / 3 lines mobile).
- [ ] Heading "Experts You Can Trust" matches `344:4903` desktop + `505:7073` mobile (gray eyebrow, mixed-weight 3-line H2 desktop / 4-line H2 mobile, `BEST-IN-CLASS` uppercase desktop, `best in-class` lowercase mobile but rendered uppercase via CSS).
- [ ] Spotlight matches `344:4910`+`446:3995`+`446:3996` desktop + `505:7079` mobile (photo bg, content right-aligned 588×300 desktop / vertical stack mobile, 2 paragraphs justify, social icons 2 red squares with white icons).
- [ ] Cards row matches `344:4926`–`674:493` desktop + `505:7095`–`505:7149` mobile (146×195 cards, active red, idle white-with-border, name 12px Inter Tight Bold, role 10px PT Sans Regular with correct line-height per role length).
- [ ] All 9 cards present, in correct order, with desktop role text exactly per Appendix A.
- [ ] Quote form renders identically to home/services/why-choose-us; submit disabled (visual-shell only).
- [ ] Footer matches existing implementation.

**Code quality**

- [ ] `pnpm typecheck` clean.
- [ ] `pnpm lint` clean.
- [ ] No new packages in `package.json`.
- [ ] No edits to `next.config.*`, `tailwind.config.*`, `tsconfig.json`, `tokens.css`.
- [ ] All new components are Server Components by default; `TeamSpotlightSection` (and its children) is the only client island, narrowly scoped.
- [ ] No client-side Sanity fetch.
- [ ] All `<img>` use `next/image` with explicit `width`/`height` (or `fill` + `sizes`).
- [ ] `alt` text meaningful on all portraits and the hero/spotlight photos.
- [ ] Focus rings on all cards (`focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2`).
- [ ] `aria-pressed` on each card button (true for active, false for idle).
- [ ] Slider region has `aria-label="Heli Skycargo team members"` (matches `TeamTeaser` pattern).
- [ ] No console warnings on first render at any viewport.

**Process**

- [ ] `docs/DECISIONS.md` updated for the non-obvious items in §6 (eyebrow gray variant, desktop-role canonical, lorem-ipsum bios, spotlight photo placeholder strategy, mobile offices = Malaysia, `OfficesGlobal` API change retroactive note).
- [ ] `CLAUDE.md` §2 "Currently working on" updated to reflect M6 done.
- [ ] No commits without explicit user approval.

---

## Appendix A — Verbatim copy

### A.1 — Hero

- Eyebrow: `OUR TEAM`
- H1 (desktop 2 lines / mobile 3 lines): `Meet the People Behind Every Shipment`
  - Mobile line breaks: `Meet the People` / `Behind Every` / `Shipment`

### A.2 — "Experts You Can Trust" heading

- Eyebrow: `EXPERTS YOU CAN TRUST` (gray variant — `bg-ink-muted text-surface`)
- H2 desktop (3 lines, all uppercase, mixed weights):
  - line 1 (Inter Tight Black): `At Heli Skycargo,`
  - line 2 (Inter Tight Bold): `our team is fueled by passion to deliver`
  - line 3 (Inter Tight Bold): `BEST-IN-CLASS service.`
- H2 mobile (4 lines, all uppercase via CSS):
  - line 1 (Black): `At Heli Skycargo,`
  - line 2 (Bold): `our team is fueled by passion`
  - line 3 (Bold): `to deliver best in-class`
  - line 4 (Bold): `service.`

### A.3 — Spotlight (Stephane, default active)

- Name: `Stephane Marot`
- Role: `Founder & CEO`
- Bio paragraph 1: `With 25+ years in global freight forwarding across Europe, USA, Asia and Middle East. Stephane brings deep industry expertise and a strong customer-focused approach.`
- Bio paragraph 2: `Having accompanied helicopter shipments onboard aircraft such as the AN-124 and IL-76, he has built a trusted worldwide network and remains closely involved in supporting clients across the globe.`
- Social: LinkedIn URL + email (placeholder values until client supplies)

### A.4 — Spotlight placeholders (members 2–9)

For each of the 8 non-CEO members, render two lorem-ipsum paragraphs as the bio:

- Paragraph 1: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
- Paragraph 2: `Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.`

Add a `// TODO(content): client to provide bio for {full_name}` comment next to each non-CEO entry in `PLACEHOLDER_TEAM_MEMBERS`.

### A.5 — Team slider cards (9 total, in display order — desktop is canonical)

| #   | Name              | Role                          |
| --- | ----------------- | ----------------------------- |
| 1   | Stephane Marot    | Founder & CEO                 |
| 2   | Daniel Cosico     | Deployment & Lead Coordinator |
| 3   | Adriana Athirah   | Sales & Marketing Executive   |
| 4   | Rica Mae Cortez   | Logistic Specialist           |
| 5   | Alfredo Dinglasan | Logistic Specialist           |
| 6   | Nikhitha Manuel   | RFQ                           |
| 7   | Remi Hachisuka    | Japan Desk Manager            |
| 8   | Anjelimo Mulati   | Accounting                    |
| 9   | Mia Juliet Marot  | Junior Sales & Marketing      |

### A.6 — Offices

Reuses existing `OFFICES` constants. Default active = Malaysia (`defaultActive="my"`).

### A.7 — Quote form

Reuses `QuoteFormShell` defaults — eyebrow `Request a Quote`, H2 `Start Your / Global Transport / Request`. No copy override needed.
