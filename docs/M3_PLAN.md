# Module 3 — Services Listing — Implementation Plan

> **How to use this file**: This is the design contract for Module 3. Read it cold at the start of the M3 session — it captures the full Figma audit + locked decisions so you don't have to re-pull frames. Cross-references: `CLAUDE.md` (project rules), `docs/DECISIONS.md` (architecture log), `AGENTS.md` (Next.js 16 reminder).

**Status**: planning complete, ready to implement
**Audit date**: 2026-05-05
**Target route**: `/services` (under `src/app/(marketing)/services/page.tsx`)
**Authoritative design source**: Figma (see frame index below)

---

## 1 — Suggested workflow

Same loop as M2. Mirrors `CLAUDE.md` §7.

1. **Open this file + `docs/PROJECT_BRIEF.md` Module 3 section** before writing code.
2. **Confirm scope back to the user in 2–3 sentences.** Don't start coding until aligned.
3. **Re-pull Figma frames only if a token / pixel value isn't in this doc.** All major specs are captured below — Figma MCP quota is precious. If you do need to re-pull, use `get_design_context` and prefer the copy file (see frame index) since it has fresh quota when the original is rate-limited.
4. **Build mobile-first.** 375 → `md` 768 → `lg` 1024 → `xl` 1440. Test at all four widths before claiming any section done. No "fix mobile later".
5. **Component placement**:
   - Page route: `src/app/(marketing)/services/page.tsx`
   - Page-scoped sections: `src/components/sections/services/`
   - Cross-page reusables (eyebrow, offices, quote-form shell): `src/components/sections/_shared/`
   - Service detail stubs: `src/app/(marketing)/services/[slug]/page.tsx` — minimal "Coming in M4" page so the explore-more links don't 404.
6. **Static-first** per CLAUDE.md §3.1. Server Components by default. Client only on subtrees that need state (accordion expand, hover variants triggered via JS, form interactivity later in M8).
7. **Hardcoded content** goes in `src/lib/constants.ts`. Add `VALUE_ADDED_SERVICES` (8 items). The 6 main services are already in `SERVICES`.
8. **Polish baseline matches M2**: `Reveal` scroll-reveal, hover micro-interactions on cards, focus rings, AA contrast.
9. **`npm typecheck` + `npm lint`** after each non-trivial section. Fix before moving on.
10. **No commits** until the user explicitly approves. Append non-obvious calls to `docs/DECISIONS.md`.
11. **At end of session**: update CLAUDE.md §2 "Currently working on" line; summarize what shipped + what's next.

### Suggested implementation order (per session)

This is the order I'd build to keep PRs reviewable and de-risk. Not prescriptive.

1. **Add new tokens** (`tokens.css`) — surface-alt fix, form colors, ink-faint, Poppins font registration. Verify nothing in M2 visually regresses.
2. **Promote `SectionEyebrow`** to `sections/_shared/SectionEyebrow.tsx` with `variant: red | gray | outline-white | outline-ink`. Refactor M2 sites that used inline eyebrow markup to use it.
3. **`/services` page scaffold + Hero** — simplest section, validates the route + header reuse.
4. **Services grid (6 cards)** — desktop hover micro-interaction first, then mobile tap-to-expand accordion.
5. **Value-Added Services accordion** (8 items) — desktop + mobile. Most novel UX in this module.
6. **Quote Form Shell** — visual only, submit disabled. Skeleton for M8.
7. **Offices refactor** — promote `OfficesGlobal` to shared, add `featured + tabs` pattern, update home (M2) consumer to match. Verify home doesn't regress visually.
8. **Service detail stub pages** at `/services/[slug]` — minimal M4 placeholders.
9. **Polish pass** — Reveal stagger, hover timings, focus rings, mobile width sweep at 375/768/1024/1440.
10. **Typecheck + lint clean.** Update CLAUDE.md "Currently working on".

---

## 2 — Figma frame index

**Canonical file**: `oYbmAQczd2UX5PtQnVBz50` (HSC)
**Copy file** (used during M3 audit due to MCP quota on the original): `UkrV8vyPeLqsYbZ57OrESC` (HSC--Copy-)

> If the canonical file is rate-limited, the copy file may have separate quota. Both should match content as of 2026-05-05.

| Section                                                     | Desktop URL                                                                      | Desktop nodeId                          | Mobile URL                                                                       | Mobile nodeId |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------- | ------------- |
| Hero                                                        | [link](https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=345-6960) | `345:6960`                              | [link](https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=505-7643) | `505:7643`    |
| Services Grid (6 cards) — **real layout, 5 idle + 1 hover** | [link](https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=345-7736) | **`345:7736`**                          | [link](https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=505-7652) | `505:7652`    |
| Services Grid — all-hover reference (every card revealed)   | [link](https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=501-311)  | `501:311` (use as hover-state ref only) | —                                                                                | —             |
| Value-Added Services (8 rows)                               | [link](https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=345-7737) | `345:7737`                              | [link](https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=529-8091) | `529:8091`    |
| Quote Form                                                  | [link](https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=345-7746) | `345:7746`                              | [link](https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=505-7765) | `505:7765`    |
| Offices                                                     | [link](https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=446-5620) | `446:5620`                              | [link](https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC?node-id=889-157)  | `889:157`     |
| Footer                                                      | not pulled — reuse existing `Footer` from M2                                     | —                                       | —                                                                                | —             |

### Re-pull command pattern (Figma MCP)

```
mcp__figma-remote-mcp__get_design_context
  fileKey: oYbmAQczd2UX5PtQnVBz50   # or UkrV8vyPeLqsYbZ57OrESC if quota exhausted
  nodeId: <see table>
  clientFrameworks: react,nextjs
  clientLanguages: typescript,css
```

---

## 3 — Section-by-section design specs

### §1 — Hero

|                                   | Desktop (`345:6960`)                                                                                                                        | Mobile (`505:7643`)                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Frame                             | 1600 × 705                                                                                                                                  | 430 × 470                                                                                 |
| Background                        | full-bleed office photo (Global Customer Support Center room)                                                                               | same photo                                                                                |
| Overlay                           | 40% black `rgba(0,0,0,0.4)`                                                                                                                 | 36% black `rgba(0,0,0,0.36)`                                                              |
| Header                            | logo `left:79`, white "Request Quote" pill `left:1295` (rounded-30, padding 30/20, PT Sans Bold 14 black tracking 0.84), burger `left:1491` | logo `left:24`, burger right (no Request Quote pill)                                      |
| Eyebrow                           | red `#e40c28`, padding 11/8, "WHAT WE DO" PT Sans Bold 12 white uppercase tracking 0.72                                                     | red, padding 6, same text                                                                 |
| H1 font                           | **PT Sans Bold 64px**, line-height 82, capitalize, white                                                                                    | **PT Sans Bold 32px**, line-height 42, tracking 0.64, capitalize, white                   |
| H1 text                           | `Global logistics experts / with unique industry access.` (2 lines)                                                                         | `Global logistics / experts with unique / industry access.` (3 lines, hard wrap baked in) |
| Eyebrow position (top from frame) | 294                                                                                                                                         | 212                                                                                       |
| H1 position                       | 355                                                                                                                                         | 252                                                                                       |
| Animation                         | none beyond `Reveal` mount fade                                                                                                             | none beyond `Reveal` mount fade                                                           |

---

### §2 — Services Grid (the 6 cards)

#### Desktop (`501:311`, frame 1600 × 1650, bg `#f5f5f5`)

- **Heading block** centered, `top:100`:
  - Eyebrow: gray pill `#4a4e54`, padding 8, "OUR SERVICES" PT Sans Bold 12 white tracking 0.72 uppercase.
  - H2: **Inter Tight Black 54 / lh 66** uppercase ink: `WE WORK ON SOLUTIONS / AND FAST RESPONSE.` Top: 151.
- **Grid**: 3 cols × 2 rows. Card 470×580. Page padding-x 70, **gap 15px both axes** (very tight gutter).
- **Card row 1**: top 344. Card row 2: top 939. Vertical gap = 15.
  **Confirmed via two Figma frames**: `501:311` shows ALL cards in hover state (the design's "everything-revealed" view), and `345:7736` shows the real layout with 5 idle cards + 1 hover card. The actual page uses `345:7736` as the source of truth.

- **Card anatomy (idle)** — cards 1, 3, 4, 5, 6 in `345:7736`:
  - Background: **plain white** (`#FFFFFF`).
  - Number "01"–"06": **Inter Tight Black 40px** color `#e40c28` red, lh 80, at `left:110, top:384` (40px inset from card top-left).
  - Title (e.g. "OCEAN RO/RO"): **Inter Tight Bold 40px** color **`#101820` ink** (NOT white) uppercase, lh 80, at `left:110, top:441`.
  - **No description visible.**
  - **Decorative world-map curve graphic** on the right side of the card: 270×556, positioned at `left:271, top:344` (relative to card at `left:70`) — i.e. the right ~270px of the card width is filled with a faint world-route line graphic. Same asset reused across all 5 idle cards.
  - **CTA bottom-left**: small **outline** circular arrow button (~53×52, transparent fill with thin ink border) at `left:110, top:832`.
- **Card anatomy (hover/active)** — card 2 in `345:7736`:
  - Background: **service photo** (full-bleed, `object-cover`) + **40% black overlay** `rgba(0,0,0,0.4)`.
  - Decorative world-map graphic is hidden (covered by the photo).
  - Number "02": same red, position unchanged.
  - Title: same Inter Tight Bold 40, but **color flips to white**.
  - **Description fades in**: PT Sans Regular 16/25 **white**, max-width 393, at `left:595, top:494` (relative to card at `left:555`) — ~110px below the title.
  - **CTA bottom-left becomes a red pill**: bg `#e40c28`, rounded-30, padding 30/20, **Inter SemiBold 14** white tracking 0.84 capitalize: `explore more`. At `left:578, top:834`.
- **This same idle/active model applies to mobile** — see §2 mobile spec below. The only difference between desktop and mobile is card size; the state machine is identical.

**Animation**: cross-fade between idle and active states, ~250–350ms ease-out. Image likely fades in (rather than the literal "card flip" the user mentioned — flip is figurative for the content swap). On desktop hover trigger; on mobile tap-to-toggle.

- Service descriptions in Figma:
  - 01 RO/RO: "Transport your aircraft using Ro/Ro vessel, loaded on a MAFI or simply towing"
  - 02 LO/LO: "Safe Lift-on/Lift-off into cargo load of container vessel or MPV Breakbulk ship"
  - 03 FCL: "Save on freight cost by shipping in 40' container High Cube, Open Top or Flat Rack"
  - 04 Road Freight: "We deal with assets-own trucking companies providing GPS-equipped Air-ride specialised trailers"
  - 05 Air Commercial: "Ship your aircraft on B74 Freighter"
  - 06 Air Chartering: "When time is of the essence or to reach places unreachable by 74F, go for the mighty Antonov124-100 or the IL76"

#### Mobile (`505:7652`, frame 430 × ~1900, bg `#f5f5f5`)

- **Heading**: gray pill + H2 **Inter Tight Black 24 / lh 34**, line 1 Black, line 2 Bold (or just keep both Black — Figma export shows mixed weights, treat as Black throughout for simplicity).
- **Card** (idle) — same state machine as desktop, smaller scale:
  - Background: plain white.
  - Red number `Inter Tight Black 24` at `left:64, top:40` (relative to card).
  - Title `Inter Tight Black 20` **ink color `#101820`** uppercase at `top:77`.
  - **No description visible.**
  - **Decorative world-map curve graphic on the right edge** of card (~137px wide, the same line-art motif as desktop, scaled down). NOT the service photo.
  - Small **outline** circular arrow button at `left:64, top:211`.
- **Card (active/expanded, see card 2 in Figma)**:
  - Background flips to **full service photo + 40% overlay**.
  - Decorative graphic hidden.
  - Title color flips to **white**.
  - Description fades in below title: PT Sans Regular 14/22 white, two lines.
  - Outline circle button **morphs to red pill**: rounded-30, padding 20/14, Inter SemiBold 13 white tracking 0.78, label `explore more`.
- **Interaction**: tap-to-expand accordion — only one card open at a time. See Decisions §3.
- Card vertical spacing: 290px between card tops (card 1 at 169, card 2 at 459 = 290 delta).

#### Animation summary

- **Hover (desktop)** / **Tap (mobile)**: idle ↔ active cross-fade ~250–350ms ease-out:
  - White bg fades to service photo + 40% overlay
  - Decorative world-map graphic fades out
  - Title color flips ink → white
  - Description fades in below title
  - Outline circle button morphs to red "Explore More" pill (width animates open)
- **Mobile single-open accordion**: tapping a card collapses any other open card (same fade direction, reverse).
- **Reveal-on-mount**: fade-up stagger across cards via existing `Reveal`.

---

### §3 — Value-Added Services (8 rows)

8 sub-services beyond the 6 main:
**01 Equipment Rental · 02 AOG · 03 OBC · 04 Ferry Flight Clearance · 05 Customs Brokerage · 06 Crates Manufacturing · 07 Shrink Wrapping · 08 Cargo Insurance**

Add to `src/lib/constants.ts` as `VALUE_ADDED_SERVICES` array (slug + label + thumbnailPath + description?).

#### Desktop (`345:7737`)

- **Heading** centered:
  - Eyebrow: gray pill "VALUE-ADDED SERVICES" (note: 84px wide, padding 8).
  - H2: Inter Tight Black 54/66 uppercase ink: `BEYOND STANDARD LOGISTIC. / EXTRA SUPPORT, EVERY STEP.` Top: 159.
- **Row layout** (idle):
  - Left thumbnail strip: 708×100, full bleed photo, no overlay.
  - Right block (`left:807` content start):
    - 2-digit number color `#c4c4c4` (Inter Tight SemiBold 36 lh 50 uppercase) at `left:807`.
    - Label (e.g. "EQUIPMENT RENTAL") Inter Tight SemiBold 36 ink uppercase at `left:876`.
    - Outline circular arrow icon at far right `left:1452`, rotated 37°, ~73×73 (button itself ~52×52).
- **Row vertical rhythm**: 110px between row tops (rows 1–3 at top: 352/462/572, ferry expands at 682, then 1092/1202/1312/1422).
- **Row 4 expanded state** (Figma shows "FERRY -hover"):
  - Thumbnail grows from 100 → **400px tall**.
  - Description block appears at `left:876`:
    - One short line: `For remote locations, helicopters may require a ferry flight to a nearby transport hub.` (PT Sans Regular 17/25 ink)
    - One styled paragraph mixing PT Sans Bold for `"Heli Skycargo"` and `"your behalf to ensure"`, otherwise PT Sans Regular: full text in `data-node-id="345:7069"`.
  - Arrow icon swaps from outline circle → **red filled** (asset `imgButton1`).

#### Mobile (`529:8091`)

- Heading: gray pill + H2 Inter Tight Black 24/34, two lines centered.
- **Row layout** flips: thumbnail full-width on top (382×80 collapsed), label row below: `01 + EQUIPMENT RENTAL + arrow` in single horizontal layout. Number gray `#c4c4c4`, label ink, both Inter Tight SemiBold 20 lh 50 uppercase.
- Row tops: 181, 318, 455, 592 (ferry, expands to 200px thumbnail), 993, 1130, 1267, 1404.
- Row 4 expanded: thumbnail 200px tall, then label, description PT Sans Regular 14/22 ink at `left:27`, then styled paragraph (same content as desktop), arrow red filled.

#### Behavior

- **Accordion**: tap row → expand inline; tapping another row collapses prev. Only one row expanded at a time.
- **Default state**: all collapsed. **First row auto-expands once on scroll into view** (single-shot, doesn't re-trigger). Telegraphs the interaction without locking the user.
- **Animation**: thumbnail height transition 100→400 (desktop) / 80→200 (mobile), description fades in, arrow swaps. ~300–400ms ease-out.

---

### §4 — Request a Quote (visual shell only — M8 wires logic)

#### Desktop (`345:7746`, 1437 × 900)

**Two-column 50/50 layout:**

- **Left column (720×900)**: red gradient bg `#e40c23` + photo (Antonov 124 with helicopters) + 30% black overlay.
  - Eyebrow: white-bordered, padding 8, "Request a Quote" PT Sans Bold 12 black tracking 0.72 uppercase.
  - H2: **Inter Tight Black 54 / Bold 54 / Bold 54** lh 74 white uppercase: `START YOUR / GLOBAL TRANSPORT / REQUEST` (3 lines).
  - `>>` chevron arrow icon at right of H2 (38×38, rotated 90°).
- **Right column (718×900)**: white panel, shadow `0 0 6px rgba(0,0,0,0.09)`, contains 5-step form.

**Form (5 numbered sections, accordion-stepper)**:

- **01 Mode of Transport** ✓ (green tick at right) — 6 radio cards in 3×2 grid (200×60 each, gap ~10px).
  - Selected ("Air Charter"): red gradient `linear-gradient(165deg, #e40c28 22%, #ae302b 78%)`, white text + filled white radio dot.
  - Unselected: white bg, border `#e4e4e4`, gray radio outline.
  - Card text: Inter Tight SemiBold 13 uppercase.
  - Options: Air Charter, Air Commercial, Ocean RORO, Ocean Container, Land, Ocean Breakbulk.
- **02 Route Information** (refresh icon at right): 2 inputs side-by-side, each 305×60.
  - `Origin — Country / City / ZIP *` (active focus state, border `#ff7e8f` light pink).
  - `Destination — Country / City / ZIP *` (idle, border `#e4e4e4`).
  - Label: PT Sans Regular 12 muted `#929292`, asterisk red `#e40c28`.
  - Placeholder: PT Sans Regular 15 `#d9d9d9`.
- **03 Shipment Details** — collapsed (label only).
- **04 Transaction Classification** — collapsed.
- **05 Contact & Company** — collapsed.
- Sections divided by 1px line `#e4e4e4`, full width 621.
- **Submit button**: black `#101820`, 305px wide, padding 30/20, PT Sans Bold 14 white tracking 0.84 capitalize "submit". **Note**: black, not red — distinct from "Explore More" CTAs.
- **Disclaimer below**: `ALL FIELDS MARKED * ARE REQUIRED · DATA TRANSMITTED OVER SECURE CHANNEL` PT Sans Regular 12 ink capitalize.

#### Mobile (`505:7765`, 430 × ~1280)

- **Stacked**: photo column on top (382×450 with red bg + photo + 30% overlay + chevron-down 90° arrow), form panel below (382×738, same shadow).
- Eyebrow: white bg with ink text (10px Regular tracking 0.6) — unlike desktop's outline.
- 01 Mode of Transport collapses to a **single dropdown** (red gradient with `arrow-square-down` icon = collapsed dropdown). Implies mobile uses `<select>` style instead of grid.
- Inputs full-width 318×50 stacked vertically.
- Submit button full-width.

#### M3 build scope

- ✅ Visual shell: structure, eyebrow, headings, photo column, 01 grid + 02 fields with full styling.
- ✅ Disabled placeholders for sections 03/04/05 (label rows only, no inputs).
- ✅ Disabled submit button (cursor-not-allowed, no handler).
- ❌ Formspree, validation, accordion expand/collapse, real radio state, Turnstile — all M8.

#### Sharing with home page

`QuoteFormShell` is a **shared component used by BOTH the home page and the services page**. The two placements are visually identical except for the left-column photo (and possibly the headline copy). Built once in M3, dropped into both pages during the same module.

**Component**: `src/components/sections/_shared/QuoteFormShell.tsx`

**Props** (minimum):

```ts
type QuoteFormShellProps = {
  photo: { src: string; alt: string };
  headline?: { line1: string; line2: string; line3: string }; // defaults to "Start Your / Global Transport / Request"
};
```

**Photo per page**:

- Home page: existing M2 photo (whatever `RequestQuoteCta` currently uses, or a new asset from the home Figma frame)
- Services page: Antonov 124 + helicopters from `345:7746` — save to `/public/quote/services-quote.webp`

**Migration of home**: M2 currently has `src/components/sections/home/RequestQuoteCta.tsx` which is a placeholder CTA card (per the 2026-04-29 quote-form rollout decision). During M3, replace that home consumer with `<QuoteFormShell photo={...} />`. Verify home doesn't visually regress at all four breakpoints. Delete `RequestQuoteCta.tsx` if no longer used elsewhere.

**This supersedes the 2026-04-29 decision in part**: instead of waiting until M8 to build BOTH placements, M3 builds the visual shell now and places it on both home and services. M8 still wires Formspree + state + validation + Turnstile into the same component (no redesign needed).

---

### §5 — Offices (refactor shared component, affects home M2 too)

#### Desktop (`446:5620`, 1600 × 1018)

- Full-bleed cityscape image (Burj Khalifa) + 20% black overlay.
- **Heading block** (centered, top:99):
  - Eyebrow: white-bordered (1px solid white), padding 8, "our offices" PT Sans Bold 12 white tracking 0.72 uppercase.
  - H2: **Poppins Black 54 / Poppins Bold 54** lh 66 white uppercase centered: `ACROSS ALL REGIONS / WORLDWIDE`. Top: 160.
  - Description: PT Sans Regular 16/36 white centered. Top: 291.
- **Locations card** (top: 658):
  - Single horizontal glass card 1439×260 at `left:81`.
  - `bg rgba(16,24,32,0.88)`, `backdrop-blur 50px`, `border rgba(255,255,255,0.66)` solid 1px, `opacity 0.7`, `rounded-20`.
  - **UAE column highlighted with red overlay**: `bg #e40c28`, `opacity 0.7`, 399px wide at `left:465`, sits on top of glass card, no rounding.
- **Each location** (4 columns, equal width split):
  - Sub-label (e.g. "HELI SKYCARGO LIMITED"): Inter Tight SemiBold 14 white uppercase.
  - Country (e.g. "HONG KONG"): Inter Tight SemiBold 48 white uppercase.
  - Address row, phone row, email row: PT Sans Regular 13 white lh 37, with icon (location pin / call / mail) at left.
  - Vertical divider line between USA and Malaysia (height 150px).
- Locations data:
  - HONG KONG · Heli Skycargo Limited · Suite 409, 87-105 Chatham Road South, TST · +85266980871 · info@heliskycargo.com
  - UAE · Heli Skycargo Global Customer Support Center · Emaar Business Park, Dubai · +971558247780 · team@heliskycargo.com
  - USA · Heli Skycargo USA LLC · 16501 Ventura Blvd, Encino, California · +85266980871 (placeholder per DECISIONS log) · commercial@heliskycargo.com
  - MALAYSIA · Heli Skycargo Warehouse · Kuala Lumpur · +85266980871 (placeholder) · info@heliskycargo.com

#### Mobile (`889:157`, 430 × 749)

- Same cityscape + 20% overlay.
- Heading: white-bordered eyebrow + H2 **Poppins Black 24 / Bold 24** lh 34 centered: `ACROSS ALL / REGIONS WORLDWIDE`. Description PT Sans Regular 14/22.
- **Single vertical glass card** 384×435 stacking 4 location summaries.
- **Featured + tabs pattern** (per Decision §4):
  - Default: UAE shown expanded with full address/phone/email.
  - Other 3 (Hong Kong, USA, Malaysia) shown as country name only — tap to expand → details swap in, UAE collapses.
  - Active country: red overlay band `bg #e40c28 opacity-70` 382×180, no rounding.
  - Inactive: just country name + sub-label, no overlay.

#### Refactor scope (affects M2)

The home page already has an `OfficesGlobal` component. Per Decision §4:

- **Promote** to `src/components/sections/_shared/OfficesGlobal.tsx`.
- **Add the featured-tabs pattern on mobile** — affects home page mobile too. Test home doesn't visually regress.
- Desktop offices stays as-is (4-column horizontal card with UAE highlighted).
- The home page might use a subset of locations or a different headline — verify before refactor; pass props if needed.

#### What home-page users will notice after M3 ships

Audited M2's `src/components/sections/home/OfficesGlobal.tsx` on 2026-05-05.

| Surface        | M2 today                                                                                                        | After M3 refactor                                                                                                            | Visible change?                                |
| -------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Desktop layout | 4-col glass card, UAE highlighted with `bg-brand-red/85`                                                        | same                                                                                                                         | **no**                                         |
| Tablet (md)    | 2-col grid, all 4 offices shown with full details                                                               | same                                                                                                                         | **no**                                         |
| Mobile         | All 4 offices stacked vertically, all details visible                                                           | **Featured + tabs** — UAE shows full details by default; HK / USA / Malaysia show country name only and act as taps to focus | **YES — behavior change**                      |
| H2 font        | `font-display` (Inter Tight), `<span font-extrabold>Across All Regions</span> <span font-bold>Worldwide</span>` | **Poppins** Black 900 (line 1) + Bold 700 (line 2), with hard break: `Across All / Regions Worldwide`                        | **YES — typography change at all breakpoints** |

**Constants migration**:

- M2 `OFFICES` uses `office.highlighted: boolean` to flag UAE for the red bg overlay (desktop). M3 needs an `office.featured: boolean` (or rename `highlighted` → `featured`) to drive both the desktop red overlay AND the mobile default-active tab.
- Verify nothing else in the codebase reads `office.highlighted` before the rename.

**Pre-merge regression check** (run during M3 implementation):

1. Take before/after screenshots of `/` at 375 / 768 / 1024 / 1440.
2. Confirm desktop and tablet home offices look identical to before.
3. Confirm mobile home offices now shows the featured-tabs pattern with UAE active by default.
4. Confirm Poppins renders cleanly (no FOUT/FOIT regression — `next/font` should handle this).

---

### §6 — Footer

Reuse `src/components/layout/Footer.tsx` from M2 unchanged. If the M3 Figma footer differs, flag and add a section-specific override — but baseline assumption is identical to home.

---

## 4 — Design tokens — additions / changes

| Token                       | Current     | Change to                                | Reason                                          |
| --------------------------- | ----------- | ---------------------------------------- | ----------------------------------------------- |
| `--color-surface-alt`       | `#F9F9F9`   | `#f5f5f5`                                | Match Figma                                     |
| `--color-input-border`      | not defined | `#e4e4e4`                                | Form inputs                                     |
| `--color-input-focus`       | not defined | `#ff7e8f`                                | Active form input border                        |
| `--color-input-placeholder` | not defined | `#d9d9d9`                                | Form placeholder text                           |
| `--color-text-muted-2`      | not defined | `#929292`                                | Form labels                                     |
| `--color-ink-faint`         | not defined | `#c4c4c4`                                | Number prefixes in value-added rows             |
| `--font-cta`                | not defined | `Inter` (SemiBold via `next/font`)       | "Explore More" pills use Inter, not Inter Tight |
| `--font-display-alt`        | not defined | `Poppins` (Bold + Black via `next/font`) | Offices H2 only                                 |

### Font registration

Currently registered via `next/font`: Inter Tight, PT Sans.
Add: **Inter** (weights: 600), **Poppins** (weights: 700, 900).

All four fonts via `next/font/google` with `display: "swap"`. Update `src/app/layout.tsx` accordingly. Update CLAUDE.md §8 typography section to match.

---

## 5 — Component / reuse map

| Component             | Location                                                   | New / Reuse                                         | Notes                                                                                                                                                     |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Header`              | `src/components/layout/Header.tsx`                         | reuse                                               | Identical to M2                                                                                                                                           |
| `Footer`              | `src/components/layout/Footer.tsx`                         | reuse                                               | Identical to M2                                                                                                                                           |
| `Reveal`              | `src/components/sections/_shared/Reveal.tsx`               | reuse                                               | Scroll-reveal wrapper                                                                                                                                     |
| `SectionEyebrow`      | `src/components/sections/_shared/SectionEyebrow.tsx`       | **promote** from inline pill                        | Variants: `red \| gray \| outline-white \| outline-ink`                                                                                                   |
| `OfficesGlobal`       | `src/components/sections/_shared/OfficesGlobal.tsx`        | **promote** from `home/` + add mobile featured-tabs | Affects home M2                                                                                                                                           |
| `ServicesHero`        | `src/components/sections/services/ServicesHero.tsx`        | new                                                 | Dark hero with eyebrow + PT Sans 64 H1 + photo                                                                                                            |
| `ServicesGrid`        | `src/components/sections/services/ServicesGrid.tsx`        | new                                                 | NOT shared with home `ServicesTeaser` (different visual)                                                                                                  |
| `ServiceCard`         | `src/components/sections/services/ServiceCard.tsx`         | new                                                 | Card with idle/hover/active states; 3 cols desktop, 1 col mobile accordion                                                                                |
| `ValueAddedAccordion` | `src/components/sections/services/ValueAddedAccordion.tsx` | new                                                 | 8-row expandable list, single-open; first row auto-opens on scroll-in                                                                                     |
| `QuoteFormShell`      | `src/components/sections/_shared/QuoteFormShell.tsx`       | new (shared with home)                              | Visual skeleton; placed on BOTH home and services pages with different `photo` prop. Replaces home `RequestQuoteCta`. M8 wires logic into same component. |

### Constants additions

In `src/lib/constants.ts`:

```ts
export const VALUE_ADDED_SERVICES = [
  {
    slug: "equipment-rental",
    label: "Equipment Rental",
    thumb: "/services/value-added/equipment-rental.webp",
  },
  { slug: "aog", label: "AOG", thumb: "/services/value-added/aog.webp" },
  { slug: "obc", label: "OBC", thumb: "/services/value-added/obc.webp" },
  {
    slug: "ferry-flight-clearance",
    label: "Ferry Flight Clearance",
    thumb: "/services/value-added/ferry-flight-clearance.webp",
    description:
      "For remote locations, helicopters may require a ferry flight to a nearby transport hub.",
    detail:
      "Heli Skycargo can take care of the administration, instruction, and logistics of the ferry flight clearance on your behalf to ensure that your shipping remains on schedule.", // emphasis on "Heli Skycargo" and "your behalf to ensure"
  },
  {
    slug: "customs-brokerage",
    label: "Customs Brokerage",
    thumb: "/services/value-added/customs-brokerage.webp",
  },
  {
    slug: "crates-manufacturing",
    label: "Crates Manufacturing",
    thumb: "/services/value-added/crates-manufacturing.webp",
  },
  {
    slug: "shrink-wrapping",
    label: "Shrink Wrapping",
    thumb: "/services/value-added/shrink-wrapping.webp",
  },
  {
    slug: "cargo-insurance",
    label: "Cargo Insurance",
    thumb: "/services/value-added/cargo-insurance.webp",
  },
] as const;
```

### Image assets needed

Pull from Figma when implementing (each card's `imgRectangle` URL has 7-day expiry from the audit; re-pull via MCP at build time if expired):

- 8 thumbnails for `/public/services/value-added/<slug>.webp` (~708×400 source, ~120KB each WebP)
- Quote section photo: `/public/quote/services-quote.webp` (Antonov 124 with helicopters, ~1440×900)
- Hero photo: same as home? Check `/public/hero/` first — the office photo in services hero may already exist from M2. If not, save to `/public/hero/services-hero.webp`.
- **Decorative world-map curve graphic** for service card idle state: SVG asset (line-art world routes), saved to `/public/services/card-decoration.svg`. Pull from `imgImage` asset URL in node `345:7736` at build time. Same asset reused across all 5 idle cards on desktop and across mobile cards.

---

## 6 — Locked decisions (cross-ref `docs/DECISIONS.md`)

1. **M3 service card NOT shared with home `ServicesTeaser`** — different visual treatments. Build a new `ServiceCard` for M3.
2. **Mobile services grid → tap-to-expand accordion**, single open at a time.
3. **Mobile offices → featured + tabs pattern**, default UAE active. Apply to home page mobile too (refactor `OfficesGlobal` to shared).
4. **Offices H2 typeface → Poppins** (Black + Bold) as designed in Figma. Add to `next/font` registration.
5. **Quote form in M3 = visual shell only.** Submit disabled. M8 wires Formspree, state, validation. **Built as a shared component used by BOTH home and services pages — only the photo prop differs.** This supersedes part of the 2026-04-29 placeholder-CTA plan; the home consumer's `RequestQuoteCta` is replaced by `<QuoteFormShell photo={...} />` during M3.
6. **"Explore More" links → `/services/[slug]`** with M4 stub pages so links don't 404.
7. **Value-Added accordion** = all collapsed by default; first row auto-opens once on scroll-into-view.

---

## 7 — Open / pending content questions (track for content review)

- Some service descriptions in `SERVICES` are placeholder copy per existing `DECISIONS.md` 2026-05-04 entry. M3 surfaces them — flag at content review.
- USA + Malaysia office phone numbers reuse the HK number — placeholder per existing log entry.
- Hero photo may need a `/public/hero/services-hero.webp` asset if not already in the M2 home hero set.

---

## 8 — Acceptance checklist (run before claiming M3 done)

- [ ] All sections render at 375 / 768 / 1024 / 1440 without layout breakage
- [ ] Service cards: hover micro-interaction works on desktop, tap-to-expand on mobile
- [ ] Value-Added accordion: single-open behavior, first row auto-opens once on scroll-in
- [ ] Quote form: visual shell only, submit disabled, fields styled correctly with all colors from §4
- [ ] Offices: featured + tabs on mobile both home AND services page; home doesn't regress
- [ ] All "Explore More" buttons link to `/services/[slug]` and target page resolves (stub OK)
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] Lighthouse performance ≥ 95 on `/services` (per CLAUDE.md §3.2)
- [ ] Keyboard navigation: focus rings visible, accordion operable via Enter/Space
- [ ] No client-side fetches to Sanity (this page is fully static — confirms CLAUDE.md §3.1)
- [ ] CLAUDE.md §2 "Currently working on" updated
- [ ] `docs/DECISIONS.md` has any new non-obvious calls appended
