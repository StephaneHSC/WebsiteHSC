# Module 7 — Shipment Showcase — Implementation Plan

> **How to use this file**: Design contract for Module 7. Read it cold at the start of the M7 session — it captures the full Figma audit, locked decisions, content, and UI/UX recommendations so you don't have to re-pull frames or ask the user questions. Cross-references: `CLAUDE.md` (project rules), `docs/DECISIONS.md` (architecture log), `docs/M3_PLAN.md` … `docs/M6_PLAN.md` (sibling modules + shared component map), `AGENTS.md` (Next.js 16 reminder).
>
> **Autonomy contract**: this session runs without check-ins. If a decision is missing from this doc, default to the option that (a) matches Figma the closest and (b) keeps the architecture consistent with the M3-M6 patterns. Do NOT ask questions; pick, ship, and document the choice in `docs/DECISIONS.md`.

**Status**: planning COMPLETE — desktop hero, desktop extended gallery (14 tiles), modal desktop+mobile, and mobile hero+gallery audited; UI/UX recommendations locked for every ambiguous element below. Ready for autonomous implementation.
**Audit date**: 2026-05-10
**Target route**: `/showcase` (already wired in NAV + FOOTER `src/lib/constants.ts`; `<Link href="/showcase">View All Showcase</Link>` already exists on the home `ProjectsMosaic` at `src/components/sections/_shared/ProjectsMosaic.tsx:92`)
**Authoritative design source**: Figma file `UkrV8vyPeLqsYbZ57OrESC` (HSC--Copy-)

---

## 0 — Autonomous workflow contract

This module runs without check-ins. The flow is identical to M6, in this order:

1. **Implementation pass** — build all sections per §3 specs, mobile-first, Server Components by default. Reuse the existing `Reveal` / `SectionEyebrow` / `Container` / `Section` / `ScrollSnapRow` / `Modal` primitives. Don't re-pull Figma frames unless an asset URL has expired (Figma asset URLs live ~7 days).
2. **Pixel-perfect review pass** — at every viewport (320 / 375 / 430 / 768 / 1024 / 1440 / 1920), compare against the Figma frame screenshots. Verify every item in §8. **A line break, font weight, missing word, wrong eyebrow color, or missing play-icon counts as a fail.**
3. **Code review pass** — read every new/modified file end-to-end. Check: TypeScript strictness, no `any`, no inline GROQ, accessibility (semantic tags, `aria-modal` on dialog, focus rings, alt text, ESC closes modal, keyboard arrow-nav between modal photos), Reveal staggers consistent with M2-M6 (`0` → `0.1` → `0.2` → `0.3`), no dependency adds, no config edits. Run `pnpm typecheck` and `pnpm lint` clean.
4. **Re-verify pass** — if step 3 caused any UI/UX edits, re-run step 2 at all viewports for the affected sections.
5. **Docs + handover** — append non-obvious calls to `docs/DECISIONS.md`. Update `CLAUDE.md` §2 "Currently working on" line. Summarise what shipped + what's next. **Do not commit** without explicit user approval (memory: `feedback_no_commit_without_ask`).

### Suggested implementation order

1. **Data extension in `constants.ts`** FIRST — extend `ShowcaseTile` (add `shape`, `desktopColumn`, `mobileColumn`, `photos`, `videoUrl`, `hasPlayIcon`, `modal.title`), expand `SHOWCASE_TILES` from 8 → 14 entries, add `SHOWCASE_HERO` + `SHOWCASE_GALLERY` constants. Backfill `shape` + `desktopColumn` + `mobileColumn` on the existing 8 tiles per the §3.2.2 tables. Migrate `showFlag` → `hasPlayIcon` on the Japan tile.
2. **Refactor `ProjectsMosaic.tsx` (single component, used by home + service-detail + /showcase)** — the cleanest M7 architecture is one mosaic with optional props that drive the variations. **Do NOT make a separate `ShowcaseGalleryGrid`.** New props:

   ```ts
   type ProjectsMosaicProps = {
     tiles?: readonly ShowcaseTile[]; // default SHOWCASE_TILES (all 14). Home passes .slice(0, 8) IF you want to keep home unchanged; the simpler path is "home shows all 14 with showLoadMore enabled too" — discuss with user but DEFAULT: home keeps showing only 8, no Load More.
     showLoadMore?: boolean; // default false. true on /showcase only.
     initialDesktop?: number; // default = tiles.length. /showcase passes 8.
     initialMobile?: number; // default = tiles.length. /showcase passes 4.
     loadMoreIncrement?: { desktop: number; mobile: number }; // default { desktop: Infinity, mobile: 4 }
     ctaHref?: string | null; // default "/showcase". null hides the CTA (used by /showcase since we're already there).
     serviceSlug?: string; // existing — filters by relatedServices on detail pages
     heading?: { eyebrow?: string; titleParts?: { pre; emphasis; post } }; // optional override; default = current "Some of OUR PROJECTS and More"
   };
   ```

   Internally the mosaic switches from 4×2 fixed bento (current home behavior) to **column-based masonry driven by `tile.desktopColumn` + `tile.mobileColumn`** for ALL pages. The current home output should be visually unchanged — verify the 8 home tiles' `desktopColumn` values produce the same 4×2 layout (they should, with shape values `tall|short|tall|short` interleaved per column).

   **Modal lives INSIDE `ProjectsMosaic`** (becomes a client component). Every consumer (home, service-detail, /showcase) now has clickable tiles + the lightbox for free.

3. **`ShowcaseModal.tsx` in `_shared/`** (since multiple pages now render it via the mosaic) — wraps the existing `ui/Modal.tsx`. Renders the project detail. Photo carousel: `useState<number>(photoIdx)` + Arrow-Left/Arrow-Right + dots. Hides arrows + dots if `photos.length <= 1`. Renders an HTML5 `<video controls>` instead of `<Image>` if `tile.videoUrl` is set. The "Request Quote" pill smart-routes: scrolls to `#request-quote` if it exists on the current page, else navigates to `/quote` (M8 future).
4. **Page route** — `src/app/(marketing)/showcase/page.tsx` (Server Component, `revalidate: 60`).
5. **`ShowcaseHero.tsx`** — full-bleed photo + 0.36 overlay + RED eyebrow + H1.
6. **`QuoteFormShell` reuse** — in a `<div id="request-quote" className="scroll-mt-24">` wrapper.
7. **`OfficesGlobal` reuse** — `<OfficesGlobal defaultActive="usa" />`.
8. **Update existing consumers**: `app/(marketing)/page.tsx` (home), `app/(marketing)/services/[slug]/page.tsx` (service-detail). Pass NO new props — the defaults preserve current behavior. Verify visually.
9. **Polish pass** — Reveal stagger, hover timings, focus rings, mobile sweep at 320/375/430/768/1024/1440/1920. Then the pixel-perfect review (§0 step 2).
10. **Typecheck + lint clean.** Append decisions to `docs/DECISIONS.md`. Update `CLAUDE.md` §2.

---

## 0.5 — Responsive matrix (non-negotiable)

| Width   | Tier                            | Tailwind | What you check                                                                                                                                                           |
| ------- | ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 320px   | small mobile                    | `<sm`    | nothing clips horizontally; H1 wraps cleanly; gallery 2-col tiles stay above 140px wide; modal photo + arrows do not overflow                                            |
| 375px   | iPhone-class mobile             | `<sm`    | matches Figma `505:6096` + `505:6412` pixel-for-pixel where audited; H1 hero wraps to 3 lines max                                                                        |
| 430px   | iPhone Pro Max mobile           | `<sm`    | matches the 430-wide Figma frame exactly; mobile gallery shows 2 columns of 186-wide tiles with 9px column gap (Figma: 218-(23+186)=9px)                                 |
| 768px   | tablet portrait                 | `md:`    | gallery transitions to 3-col masonry (intermediate breakpoint, not in Figma — pick reasonable defaults; verify no tile reflow looks broken)                              |
| 1024px  | tablet landscape / small laptop | `lg:`    | gallery moves to 4-col masonry; modal renders at 95vw with desktop split (photo left / content right) — **switch from mobile-stacked to desktop-split modal at `lg`**    |
| 1440px  | desktop                         | `xl:`    | matches `344:4887` desktop Figma frame; tile grid is 4 columns × 4 rows of mixed heights with 26px column gap and 26-27px row gap                                        |
| 1920px+ | big screen / ultra-wide         | n/a      | content stays centered with `Container` max-w; full-bleed sections (hero) fill viewport; gallery max-width caps at the existing `Container` (1280px); modal max-w 1440px |

**Rules:**

1. Use the project's existing `Container` for all content. Don't invent a new container.
2. Hero is full-bleed; uses `next/image` with `priority` (LCP candidate) + `sizes="100vw"` + `aspect-ratio` lock.
3. Gallery tiles use `next/image` with `fill` + appropriate `sizes`. Each tile has an explicit aspect-ratio per `shape`.
4. Modal photo uses `next/image` with `fill` + `sizes="(min-width: 1024px) 50vw, 100vw"`.
5. Each tile is a `<button>` (NOT `<div onClick>`) with `focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2`. Tap target ≥44×44 (smallest tile is 186×160 mobile, well above).
6. Modal arrows are `<button>` elements with `aria-label="Previous photo"` / `aria-label="Next photo"`.
7. Big screens (≥1920) — verify hero asset is at least 2400px wide; if not, flag in DECISIONS.md and request a higher-res from the client.

---

## 1 — Token + dependency check

**No new tokens needed.** All fonts/colors/spacing already defined.

- Inter Tight (all weights 400-900) ✅ — used for H2 mixed-weight ("Some of **Our Projects** and More") + modal section headings + tile route overlays
- PT Sans (Regular 400 / Bold 700) ✅ — used for hero H1, eyebrows, modal body, button labels
- `--color-brand-red` (`#E40C28`) ✅
- `--color-ink` (`#101820`) ✅
- `--color-ink-muted` (`#4A4E54`) ✅ — gallery section eyebrow `bg-ink-muted text-surface`
- `--color-surface` / `--color-surface-alt` (`#f5f5f5`) ✅ — gallery section background
- `--color-input-border` (`#e4e4e4`) ✅ — mobile "loading more..." button border (white bg + border)

**No new packages.** Reuse `Image`, `next/font`, `cn`, `Reveal`, `SectionEyebrow`, `Container`, `Section`, `Modal` (`ui/Modal.tsx`), `Button` (`buttonVariants`), `QuoteFormShell`, `OfficesGlobal`, `fetchWithCmsFallback` (no-op for showcase since data is hardcoded — but keep the page Server-Component-friendly).

---

## 2 — Figma frame index

**File**: `UkrV8vyPeLqsYbZ57OrESC` (HSC--Copy-).

| #   | Section                                | Desktop nodeId | Mobile nodeId | Status                                                 |
| --- | -------------------------------------- | -------------- | ------------- | ------------------------------------------------------ |
| 1   | Hero                                   | `344:4874`     | `505:6096`    | ✅ design-context locked                               |
| 2   | Gallery (Some of Our Projects + tiles) | `344:4887`     | `505:6412`    | ✅ design-context locked                               |
| 3   | Modal / Lightbox                       | `345:9801`     | `505:6761`    | ✅ design-context locked                               |
| 4   | Quote form                             | `344:4621`     | `505:6498`    | direct reuse — `QuoteFormShell`                        |
| 5   | Offices Global — **USA featured**      | reuse          | reuse         | direct reuse — `<OfficesGlobal defaultActive="usa" />` |
| 6   | Footer                                 | reuse          | reuse         | direct reuse — existing `Footer.tsx`                   |

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

### §3.1 — Hero ✅

**Desktop (`344:4874`, frame 1600×700)**

| Element    | Value                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame      | `1600 × 700` (slightly shorter than M6's 705)                                                                                                                                    |
| Background | full-bleed photo (`/showcase/hero-showcase.webp`, see §4) + `rgba(0,0,0,0.36)` overlay — **note: 0.36 BOTH desktop and mobile (M6 was 0.40/0.36)**                               |
| Header     | sits over hero (logo top-left at 79/28 — 136×50, white pill "Request Quote" + hamburger top-right at 1295/28). Reuse existing overlay header.                                    |
| Eyebrow    | **`red` variant** (`bg-brand-red text-surface`), padding `11px / 8px`, PT Sans Bold 12px tracking 0.72px uppercase. Text: `SHIPMENT SHOWCASE`. Position left:79 top:281, ~150×24 |
| H1         | PT Sans Bold 64px / 82px line-height, white, capitalize. Text wraps to 2 lines on desktop:                                                                                       |
|            | line 1: `Heli Skycargo Shipment`                                                                                                                                                 |
|            | line 2: `Highlight and More`                                                                                                                                                     |
|            | Position left:79 top:342, max-width 748px.                                                                                                                                       |

**Mobile (`505:6096`, frame 430×470)**

| Element | Value                                                                                                                                                                                                                                                                                                                                                 |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame   | `430 × 470`                                                                                                                                                                                                                                                                                                                                           |
| Overlay | `rgba(0,0,0,0.36)` (same as desktop). Figma also has a `bg-ink/20` second overlay layer — IGNORE the second layer (the 0.36 alone reads correctly on the photo audit).                                                                                                                                                                                |
| Eyebrow | red variant, smaller padding `6px`, position left:24 top:212, ~144×20                                                                                                                                                                                                                                                                                 |
| H1      | PT Sans Bold 32px / 42px line-height, tracking 0.64px, white, capitalize, max-width 302px → wraps to **3 lines**:                                                                                                                                                                                                                                     |
|         | line 1: `Heli Skycargo Shipment`                                                                                                                                                                                                                                                                                                                      |
|         | line 2: `Highlight`                                                                                                                                                                                                                                                                                                                                   |
|         | line 3: `and More`                                                                                                                                                                                                                                                                                                                                    |
|         | (Force the line break with `<span className="block">` per line — DO NOT rely on natural wrap. `and` MUST be on line 3 with `More`.)                                                                                                                                                                                                                   |
| Subhead | **DROP THIS.** Figma mobile shows `Access real-time location of your helicopter while in transit, get push notification.` at top:379 — this is a stale copy-paste from the smart-tracking page hero. Desktop has no subhead and the copy doesn't match the showcase context. **Recommendation: omit entirely.** Document this in `docs/DECISIONS.md`. |

**Animation**: `Reveal` (eyebrow `delay=0`, H1 `delay=0.1`).

**Component**: NEW `src/components/sections/showcase/ShowcaseHero.tsx`. Layout structurally identical to `TeamHero` minus the M6-specific copy. Mirror the existing pattern; do NOT promote to `_shared/PageHero.tsx` in M7 (defer until 4+ pages all share it — currently 4 do, but M5 chose to stay page-scoped for now).

---

### §3.2 — Gallery ("Some of Our Projects and More") ✅

This is **two visual layers**:

- **Heading** (eyebrow + H2, centered) — Server Component
- **Masonry grid** with **Load More** behavior + click-to-open modal — Client Component (single island)

#### §3.2.1 — Heading

**Desktop (`344:4108`, eyebrow at left:747 top:128, H2 centered at 800/179)**

| Element         | Value                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow         | **`gray` variant** (`bg-ink-muted text-surface`), padding `8px`, PT Sans Bold 12px tracking 0.72px uppercase. Text: `CASE VISUALS`             |
| H2              | Inter Tight, mixed weights, color `#252525` (≈ `--color-ink`), centered, uppercase, font-size 54 / line-height 66. **Single line** on desktop: |
|                 | `Some of ` (Inter Tight Bold) + `Our Projects` (Inter Tight **Black**) + ` and More` (Inter Tight Bold)                                        |
| Vertical rhythm | eyebrow at top:128, H2 at top:179 → gap of 51px. H2 `mt-12` (48px) is close enough.                                                            |

**Mobile (`505:6414`, eyebrow at left:174 top:40, H2 centered at 214/78)**

| Element | Value                                                                                                                                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Eyebrow | gray variant, padding `6px`, PT Sans Bold 10px tracking 0.6px uppercase. Text: `CASE VISUALS`                                                                                                                                                                            |
| H2      | Inter Tight, mixed weights, ink, centered, uppercase, font-size 24 / line-height 34. **Single line** mobile:                                                                                                                                                             |
|         | `Some of ` (Bold) + `Our Projects` (Black) + ` & More` (Bold) — **note: mobile uses `&`, desktop uses `and`. Match each Figma exactly per breakpoint.** Render via two spans: a `<span className="md:hidden">&amp;</span><span className="hidden md:inline">and</span>`. |

#### §3.2.2 — Masonry grid (14 tiles, with Load More)

**Desktop (`344:4887`, 14 tiles, 4 columns at left positions 80 / 446 / 814 / 1180; column gap = 26px since 446-(80+340)=26)**

Per-tile heights and labels (canonical):

| #   | Col | Top (Figma) | Tile size | Label (overlay)             | Has play icon | Modal title (suggested)   | Notes                              |
| --- | --- | ----------- | --------- | --------------------------- | ------------- | ------------------------- | ---------------------------------- |
| 1   | 1   | 290         | 340 × 560 | FROM SWITZER- LAND TO INDIA | no            | FROM SWITZERLAND TO INDIA | tall                               |
| 2   | 2   | 290         | 340 × 300 | OUR JAPAN DESK              | **yes**       | OUR JAPAN DESK            | short, video tile, 0.4 dim overlay |
| 3   | 3   | 290         | 340 × 560 | FROM MYANMAR TO GABON       | no            | FROM MYANMAR TO GABON     | tall                               |
| 4   | 4   | 290         | 340 × 300 | LOADING AT KHALIFA PORT     | no            | LOADING AT KHALIFA PORT   | short                              |
| 5   | 4   | 616         | 340 × 300 | (none — pure photo)         | **yes**       | (no modal — gallery only) | short, video tile                  |
| 6   | 2   | 616         | 340 × 560 | FROM BELGIUM TO CAMEROON    | no            | FROM BELGIUM TO CAMEROON  | tall                               |
| 7   | 1   | 876         | 340 × 300 | (none)                      | no            | (no modal — gallery only) | short, pure photo                  |
| 8   | 3   | 876         | 340 × 300 | (none)                      | no            | (no modal — gallery only) | short, pure photo                  |
| 9   | 4   | 943         | 340 × 494 | FROM CHINA TO GUATEMALA     | no            | FROM CHINA TO GUATEMALA   | medium-tall                        |
| 10  | 1   | 1203        | 340 × 560 | (none)                      | no            | (no modal — gallery only) | tall, pure photo                   |
| 11  | 2   | 1203        | 340 × 270 | (none)                      | **yes**       | (no modal — gallery only) | extra-short, video tile            |
| 12  | 3   | 1203        | 340 × 560 | (none)                      | no            | (no modal — gallery only) | tall, pure photo                   |
| 13  | 4   | 1463        | 340 × 300 | (none)                      | **yes**       | (no modal — gallery only) | short, video tile                  |
| 14  | 2   | 1500        | 340 × 270 | (none)                      | no            | (no modal — gallery only) | extra-short, pure photo            |

> The 8 home-mosaic tiles in `SHOWCASE_TILES` map to the FIRST 8 of these (in some order — the home renders 4 columns × 2 rows from the same array). For M7 we need 14 entries total. Tiles 9-14 are NEW additions (placeholder photos required, see §4). **The home page mosaic must remain visually unchanged after the data extension** — verify the same 8 tiles still render in the same positions on home.

**Tile shapes — 4 distinct heights at desktop**:

| `shape`       | Desktop aspect | Mobile aspect | Used for                           |
| ------------- | -------------- | ------------- | ---------------------------------- |
| `tall`        | `340/560`      | `186/280`     | label tiles + some pure-photo tall |
| `medium`      | `340/494`      | `186/330`     | China-Guatemala only (single tile) |
| `short`       | `340/300`      | `186/160`     | label-short + many pure photos     |
| `extra-short` | `340/270`      | `186/160`     | only used by 2 tiles               |

> Mobile only uses 3 distinct heights (280 / 330 / 160). Decision: collapse `short` and `extra-short` to the same mobile aspect `186/160`. Drives a simpler mobile layout.

**Layout — fixed 4 columns on desktop, 2 columns on mobile**

Because the masonry has very specific per-tile heights, the cleanest implementation is **explicit columns** (NOT CSS columns or generic grid). Each tile in `SHOWCASE_TILES` carries `desktopColumn: 0|1|2|3` and `mobileColumn: 0|1` so column placement is deterministic and easy to tweak per-tile.

Render: `<div className="flex gap-[26px]">` with 4 (desktop) or 2 (mobile) child `<div className="flex flex-col gap-[26px]">` columns. Each child filters `SHOWCASE_TILES` by its column index. Mobile uses 9px column gap (Figma: 218-(23+186)=9px) and 10px row gap.

**Desktop column assignments** (desktop col matches Figma's left:80 / 446 / 814 / 1180 placements):

| Tile id (order in §3.2.2) | desktopColumn | shape       |
| ------------------------- | ------------- | ----------- |
| 1 switzerland-india       | 0             | tall        |
| 2 japan-desk (video)      | 1             | short       |
| 3 myanmar-gabon           | 2             | tall        |
| 4 khalifa-port            | 3             | short       |
| 5 (video, no label)       | 3             | short       |
| 6 belgium-cameroon        | 1             | tall        |
| 7 (pure photo)            | 0             | short       |
| 8 (pure photo)            | 2             | short       |
| 9 china-guatemala         | 3             | medium      |
| 10 (pure photo)           | 0             | tall        |
| 11 (video, no label)      | 1             | extra-short |
| 12 (pure photo)           | 2             | tall        |
| 13 (video, no label)      | 3             | short       |
| 14 (pure photo)           | 1             | extra-short |

Within each column, tiles render top → bottom in the order they appear in `SHOWCASE_TILES`. Column heights at 1440 viewport: col0 1420+52=1472, col1 1400+78=1478, col2 1420+52=1472, col3 1394+78=1472 — near-equal, matches Figma.

**Mobile column assignments** (Figma `505:6412`, 2 columns):

| Tile id              | mobileColumn | mobile shape     |
| -------------------- | ------------ | ---------------- |
| 1 switzerland-india  | 0            | tall (186×280)   |
| 2 japan-desk (video) | 1            | short (186×160)  |
| 7 (pure photo)       | 0            | short            |
| 6 belgium-cameroon   | 1            | tall             |
| 3 myanmar-gabon      | 0            | medium (186×330) |
| 5 (video, no label)  | 1            | short            |
| 4 khalifa-port       | 1            | short            |
| 10 (pure photo)      | 0            | tall             |
| 8 (pure photo)       | 1            | short            |
| 11 (video, no label) | 0            | short            |
| 9 china-guatemala    | 1            | tall             |
| 12 (pure photo)      | 0            | short            |
| 13 (video, no label) | 1            | short            |
| 14 (pure photo)      | 0            | short            |

Mobile rendering: each column flex-col stacks tiles in the order they appear in `SHOWCASE_TILES` AND filtered by `mobileColumn`. The first 4 visible tiles (per Load More batching, see below) come from the first 4 entries of the array — so tile 1 at left, tile 2 at right, tile 3 at left (after tile 7 in column 0), tile 4 at right (after tile 6 in column 1) → first batch is roughly `1, 2, 7, 6`.

> Want a different mobile order? Reorder `SHOWCASE_TILES` in `constants.ts` — the column assignments are stored alongside the tile so reordering Just Works.

**Tile rendering — `ShowcaseTileCard.tsx`**:

```
- aspect-[per-shape] rounded-[10px] overflow-hidden
- next/image fill object-cover sizes="(min-width: 1024px) 25vw, 50vw"
- if tile.label: gradient overlay from-ink/0 via-ink/30 to-ink/65 absolute inset-0
  + p-[24px] absolute bottom-0 left-0 right-0
  + Inter Tight Black (50px desktop / 30px mobile) leading-[60px]/[40px] uppercase white
  + line breaks honored from tile.label array
- if tile.videoUrl OR tile.hasPlayIcon: red-circle play icon SVG, 113×113 desktop / 70×70 mobile, centered or per-position (Figma puts it at center for some tiles, slightly off-center for others — center is the reasonable default)
- if tile is the Japan Desk: 0.4 dim overlay (Figma-distinct from the 0.3 used by other label tiles); other label tiles use 0.3 / gradient
```

**Hover**:

- Tile photo `transition-transform duration-500 group-hover:scale-[1.04]` (matches existing ProjectsMosaic)
- Tile label sub-darken: `transition-opacity duration-300 group-hover:from-ink/10 group-hover:to-ink/75` (lifts the title slightly)
- Cursor: `cursor-pointer` (every tile is clickable, even pure-photo tiles → opens modal)
- Play icon scales up `group-hover:scale-[1.10]` to telegraph the video.

**Click behavior**:

- Tile click → opens modal with that tile's data. **Every tile is clickable, including pure-photo tiles** — they get a placeholder modal payload in the data (`modal: { title: alt, ... lorem ipsum challenge/solution/result }`). See §6 decision #3.
- Video tiles (with `videoUrl`) → modal opens with the video player as the photo area instead of a static image. If `videoUrl` is empty (placeholder state until client supplies videos), modal still opens with the static photo.

**Load More button — batched reveal (different cadence per breakpoint)**

| Property            | Desktop                                                                                                     | Mobile                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Position            | centered below the grid via `flex justify-center mt-12`                                                     | centered below the grid via `flex justify-center mt-8` |
| Background          | white                                                                                                       | white + `border border-[#e4e4e4]` solid                |
| Padding             | px-[30px] py-[20px]                                                                                         | px-[20px] py-[16px]                                    |
| Radius              | rounded-[30px] (pill)                                                                                       | rounded-[30px] (pill)                                  |
| Text                | `Loading More ...`                                                                                          | `Loading More ...`                                     |
| Typography          | PT Sans Bold 14px tracking 0.84px, ink, capitalize                                                          | PT Sans Bold 12px tracking 0.72px, ink, capitalize     |
| Initial batch       | **8 tiles** (matches the home mosaic count)                                                                 | **4 tiles**                                            |
| Per-click increment | reveals **all remaining** in one shot (8 → 14)                                                              | reveals **+4 tiles per click** (4 → 8 → 12 → 14)       |
| Visibility          | shown when `displayedCount < tiles.length`; hidden once all rendered                                        | same                                                   |
| Animation           | newly-appended tiles wrap in a `Reveal` keyed on the batch index — they fade-up once when the batch appears | same                                                   |

> Why different cadence: 14 tiles fit comfortably above the fold on a 1440 desktop, so one click reveals everything. On mobile, each tile is full-column-width tall, so 14 in one shot would be a 7-screen scroll — batching by 4 keeps the UX deliberate. Both behaviours sit behind the same `<button>` and the same Load More handler — internal state `displayedCount: number`, increment is `isMobile ? 4 : tiles.length`.

**Reveal animations on the gallery**:

- Heading: eyebrow (delay 0) → H2 (delay 0.1)
- Initial 8 tiles: per-tile stagger `0.2 + idx * 0.05` (matches ProjectsMosaic pattern)
- Loaded-on-demand tiles 9-14: a single `Reveal` wrapper that fires once when `showAll` becomes true. Use a key bump to retrigger.

---

### §3.3 — Modal / Lightbox ✅

Built on the existing `src/components/ui/Modal.tsx` `<dialog>` primitive. `<dialog>` gives us free ESC, focus trap, and inert background. Extend the component (in-place if needed) to accept a wider `max-w` for desktop:

**Existing**: `m-auto w-[90vw] max-w-lg`. M7 needs `max-w-[1440px]` desktop and `max-w-[382px]` mobile.

**Recommendation**: don't bake those classes into `Modal` itself. Pass them via the existing `className` prop (already supported on the inner panel — `<div className={cn("bg-surface rounded-lg p-6 shadow-xl", className)}>`). The shell `dialog` already says `w-[90vw] max-w-lg`. We need to override the outer `max-w`. **Action**: edit `ui/Modal.tsx` to accept a separate `dialogClassName` prop that targets the `<dialog>` element directly, OR give `Modal` a `size?: "sm" | "lg" | "xl"` prop. Use `size` since it's tighter API. Default = `sm` (current behavior). M7 passes `size="xl"`.

**Desktop (`345:9801`, modal panel 1439×700 centered)**

| Region             | Layout / value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backdrop           | `bg-ink/50 backdrop-blur-sm` — `<dialog>` `::backdrop` already wired                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Panel              | `bg-white rounded-[0px]` (Figma uses square corners on the panel — note the deviation from the rest of the site's `rounded-lg`. Override per modal-shell.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Panel size         | desktop: 1439×700 (90vw with `max-w-[1440px]` cap, `aspect-[1439/700]` lock to keep 700 on big screens; below 1440 it scales). At 1440 viewport it fills nearly edge-to-edge.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Layout             | 2-column flex: photo left (707×700) + content right (728×700, but inside the content has a 152px top padding)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Photo              | `object-cover`, `<next/image fill sizes="50vw">`. Overlays: prev/next arrow circles + 3-dot indicator.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Prev/Next arrows   | red `bg-brand-red` circles with white chevron, ~30px diameter (Figma: inset-[19.5%_52.82%_76.72%_42.17%] for next, inset-[19.5%_87.53%_76.72%_7.46%] for prev). Position: vertically centered on the photo (~40% from top), horizontally inset 8% from each photo edge. Hidden if `photos.length <= 1`. Keyboard: ArrowLeft / ArrowRight when modal has focus.                                                                                                                                                                                                                                                                            |
| Dots               | 78×12 group at bottom of photo (top:726 left:356). 3 dots, 6px each, 12px gap. Active dot `bg-brand-red`, idle dots `bg-ink/15`. Hidden if `photos.length <= 1`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Content padding    | left 854 (start of right column) - 79 (panel left) = 775px from panel left, top 152 from panel top. So `pl-[68px] pr-[40px] pt-[65px]` on the right column inside the 728px width.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Header line 1      | `FROM ITALY TO GABON` — Inter Tight Bold 32px / 40px line-height, ink, uppercase                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Header line 2      | `Aircraft: ` (Inter Tight Bold 40px / 40px line-height, ink) + `Airbus H125` (Inter Tight Bold 40px, **brand red**)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Meta strip         | 3-column row at top:248 (96px below header start). Each column: label (PT Sans Regular 13px, ink) + value (PT Sans Regular 15px, **brand red**). Columns: Route / Transport Mode / Timeline. Column starts at 0 / 183 / 413 from content left.                                                                                                                                                                                                                                                                                                                                                                                            |
| Sections (×3)      | THE CHALLENGE / THE SOLUTION / THE RESULT. Heading: Inter Tight Bold 20px, ink, uppercase, leading-80 (so each heading row is 80px tall — approximate via `mb-[18px]` between heading and paragraph). Body: PT Sans Regular 15px / 28px line-height, ink, max-w 585px. Vertical rhythm: heading top:334, body top:372 (Δ38); next heading top:456 (Δ122 from previous body top); etc. Effective: paragraph + 36px gap + next heading.                                                                                                                                                                                                     |
| Request Quote pill | red `bg-brand-red text-white rounded-[30px] px-[30px] py-[20px]`, label "Request Quote" PT Sans Bold 14px tracking 0.84px capitalize. Position left:0 from content left (so aligned with section headings) at top:664. Click handler: (a) `getElementById("request-quote")` — if found, close modal and `element.scrollIntoView({ behavior: "smooth" })` with `scroll-mt-24` offset on the wrapper; (b) if not found, navigate to `/quote` (M8 future). All current consumers — home, /services, /services/[slug], /why-choose-us, /team, /showcase — render `QuoteFormShell` with the `#request-quote` anchor, so today (a) always wins. |

**Mobile (`505:6761`, modal panel 382×790 — but mobile content is taller because of stacked layout, total 790)**

| Region                        | Layout / value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel                         | 382×790 (note: Figma shows the modal sliding INTO the page, but treat as full-screen modal: 92vw × auto with `max-w-[400px]`)                                                                                                                                                                                                                                                                                                                                                                            |
| Layout                        | vertical stack: photo on top (382×345) → content stacked below with `p-[30px]`                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Photo                         | aspect-[382/345], object-cover, with prev/next arrows centered vertically on photo, dots at bottom                                                                                                                                                                                                                                                                                                                                                                                                       |
| Prev/Next                     | smaller red circles, ~30px diameter, positioned at `inset-[46%_x_x_x]` from photo (centered vertically). Hidden if single photo.                                                                                                                                                                                                                                                                                                                                                                         |
| Dots                          | 3 dots below the photo at top:1139 (i.e. 312px from photo bottom — that's actually beneath the photo and above the content). 6px each, active red.                                                                                                                                                                                                                                                                                                                                                       |
| Header (single line, smaller) | `Aircraft: Airbus H125` Inter Tight Bold 24px, ink + brand-red span. **Mobile DROPS the "FROM X TO Y" line** — Figma shows only `Aircraft: …` on mobile. Do NOT show the route header line on mobile.                                                                                                                                                                                                                                                                                                    |
| Meta strip                    | 2-column row: left col Route (label 11px / value 14px brand-red), then below Transport Mode. Right col only has Timeline (single value, ~40px below the aircraft heading).                                                                                                                                                                                                                                                                                                                               |
| Sections                      | THE CHALLENGE / SOLUTION / RESULT. Heading: Inter Tight Bold 16px ink uppercase. Body: PT Sans Regular 14px / 20px line-height, ink. Max-width 327-318px.                                                                                                                                                                                                                                                                                                                                                |
| Request Quote                 | smaller red pill: `px-[20px] py-[14px] rounded-[30px]`, label PT Sans Bold 12px tracking 0.72px.                                                                                                                                                                                                                                                                                                                                                                                                         |
| Close affordance              | NEITHER Figma frame shows an explicit close X button. <dialog>'s ESC + backdrop click handles it. **Recommendation: ADD a small X button at the top-right of the panel** (mobile: top-right of the photo header; desktop: top-right of the white panel). Reason: backdrop tap on mobile may be hard to discover. Use a 32×32 circular button with a thin × icon, white bg + ink/15 border on desktop / mobile. **This is a UI/UX recommendation justified by accessibility — document in DECISIONS.md.** |
| Body scroll lock              | `<dialog>` handles inert background but page scroll behind the modal can still happen via wheel on the backdrop. Add `useEffect` toggling `document.body.style.overflow = 'hidden'` while modal is open.                                                                                                                                                                                                                                                                                                 |

**Animations**:

- Modal open: native `<dialog>` open is instant. Add a `data-state="open"` + CSS animation: backdrop fade-in 200ms, panel scale `[0.96→1]` + opacity `[0→1]` over 250ms ease-out. Reverse on close.
- Photo carousel: 300ms cross-fade between photos (`transition-opacity duration-300`)
- Prev/next button hover: `bg-brand-red hover:bg-brand-red-dark` + scale 1.05
- Section reveal inside modal: NONE on open (instant render). Reveal animations inside a modal that just appeared feel laggy.

**Keyboard**:

- ESC closes (native via `<dialog>`)
- ArrowLeft / ArrowRight cycles photo (only when `photos.length > 1`)
- Tab traps inside the modal (native via `<dialog>`)
- Initial focus: the close X button (so ESC and Tab both feel reachable). Fall back: prev arrow, then content.

**Component**: NEW `src/components/sections/showcase/ShowcaseModal.tsx`. Client component. Accepts:

```ts
type Props = {
  tile: ShowcaseTile | null; // null → modal closed
  onClose: () => void;
};
```

Internal state: `photoIdx`. Reset to 0 on `tile` change.

---

### §3.4 — Quote form ✅

**Direct reuse of `_shared/QuoteFormShell`**. The Figma frame `344:4621` shows the same QuoteFormShell with a generic photo on the left.

```tsx
<div id="request-quote" className="scroll-mt-24">
  <QuoteFormShell photo={{ src: "/showcase/quote-form-photo.webp", alt: "..." }} />
</div>
```

If a showcase-specific photo is supplied, use it (`/showcase/quote-form-photo.webp`). Otherwise fall back to the existing home photo `/home/quote-form-photo.webp`. **Default**: reuse home photo unless an asset is found in `/public/showcase/quote-form-photo.webp` at implementation time.

Modal "Request Quote" pill links to `#request-quote` on the same page; modal closes on click.

---

### §3.5 — Offices Global — USA featured ✅

**Direct reuse of `_shared/OfficesGlobal`** with `defaultActive="usa"` (per user 2026-05-10).

```tsx
<OfficesGlobal defaultActive="usa" />
```

No edits to `OfficesGlobal`. Per-office cityscape lives in `OFFICES.find(o => o.id === "usa").cityscape.src` (`/offices/cityscape-usa.webp`, already shipped in M5).

---

### §3.6 — Footer ✅

**Direct reuse** of existing `Footer.tsx`. No edits.

---

## 4 — Asset checklist (download + commit)

The 8 home tile photos already exist in `public/showcase/`. M7 needs:

| Asset                                      | Save path                                | Source frame | Source variable                   | Status                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------ | ---------------------------------------- | ------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero showcase photo                        | `/public/showcase/hero-showcase.webp`    | `344:4875`   | `imgBgImg`                        | NEW — pull from frame `344:4874`. Currently the bg image is in Figma; download `imgBgImg` URL. ~1600×900.                                                                                                                                                                                                                       |
| Tile photo — France-Brazil (modal default) | `/public/showcase/france-to-brazil.webp` | `345:9801`   | `imgRectangle31`                  | NEW — visible in modal. Add as a NEW tile #15 to SHOWCASE_TILES (the modal Figma's example tile). 707×700 wide candid. **Actually**: the modal could be ANY tile; treat France-Brazil as a 15th example or substitute with one of the existing tiles (e.g. Belgium-Cameroon). **Decision**: download as new tile + add to data. |
| Play-icon SVG                              | `/public/showcase/icon-play.svg`         | `344:4072`   | `imgGroup6`                       | NEW — red circle with white play triangle, 113×113. Single SVG asset, reused across all video tiles.                                                                                                                                                                                                                            |
| Hero subhead / mobile carry-over           | n/a                                      | n/a          | n/a                               | NOT downloaded — see §3.1 mobile note.                                                                                                                                                                                                                                                                                          |
| Quote form photo (showcase variant)        | `/public/showcase/quote-form-photo.webp` | `344:4621`   | (left column)                     | OPTIONAL — pull only if Figma shows a distinct photo. Otherwise reuse `/home/quote-form-photo.webp`.                                                                                                                                                                                                                            |
| Tile photos for tiles 9-14 (NEW)           | `/public/showcase/tile-{id}.webp`        | `344:4887`   | `imgRectangle32`-`imgRectangle44` | NEW — 6 new photos for the previously-unmodaled tiles. Pull from frame `344:4887` and save with descriptive ids. Format WebP, 720×600 minimum.                                                                                                                                                                                  |

**Asset URLs are short-lived (~7 days).** If any URL has expired by the time the agent downloads, re-pull frames `344:4874`, `344:4887`, `345:9801`, `505:6412`, `505:6761` for fresh URLs. Use `curl -o <save-path> "<url>"` from project root.

**Tile photo sizing**: tiles render at max 340×560 desktop. Download at 2x (680×1120) for retina + WebP @ 80 quality. Pure-photo tiles can be smaller (340×300 → 680×600). The CDN-side (`next/image`) handles further resizing.

---

## 5 — Content + data

### 5.1 — Extend `SHOWCASE_TILES` in `src/lib/constants.ts`

The current type already supports modal payloads (`src/lib/constants.ts:179`). Extend it with:

```ts
export type ShowcaseTile = {
  id: string;
  src: string; // primary photo (= photos[0])
  photos?: readonly string[]; // optional multi-photo carousel for the modal; if undefined or [], modal hides arrows + dots
  alt: string;
  label?: readonly string[]; // overlay route text on tile
  showFlag?: boolean; // unused after M7 — was the misinterpreted Japan flag, but actually the play icon
  hasPlayIcon?: boolean; // M7: explicit video-tile flag, replaces the showFlag misuse
  videoUrl?: string; // M7: optional self-hosted MP4 or YouTube unlisted URL. If present, modal renders <video> or <iframe> in the photo area.
  relatedServices?: readonly string[];
  shape: "tall" | "medium" | "short" | "extra-short"; // M7: REQUIRED, drives masonry per-tile aspect-ratio
  modal?: {
    title: string; // e.g. "FROM ITALY TO GABON" — preformatted, uppercase header line
    aircraft: string;
    route: string; // e.g. "France → Brazil"
    transportMode: string;
    timeline: string;
    challenge: string;
    solution: string;
    result: string;
  };
};
```

**Migration notes**:

- `showFlag` was used on the Japan Desk tile in M2 to flag it as needing an icon overlay. Per Figma audit, that overlay is the **video play icon**, not a Japan flag. **Action**: remove `showFlag` usage from `ProjectsMosaic.tsx` (where it currently renders `/showcase/japan-flag.svg`) AND from the Japan tile data, and replace with `hasPlayIcon: true`. Also remove the `japan-flag.svg` from the public folder (or keep as legacy and document — recommend remove). **HOWEVER**: this changes the home page's visual. Decision: **scope this to M7 only** by introducing `hasPlayIcon` AND keeping `showFlag` rendering in `ProjectsMosaic.tsx` for now (no visual change on home), then deprecating `showFlag` in a follow-up commit. Alternative: align home with the play icon now since it was ALWAYS supposed to be a play icon per Figma — confirm with user before shipping.
  > **Recommendation**: replace `showFlag → japan-flag.svg` with `hasPlayIcon → icon-play.svg` on home immediately, since Figma's intent is unambiguous. Document in DECISIONS.md: "Japan tile was showing a Japan flag SVG; Figma always intended a video play icon. Corrected during M7." Visual on home changes from a Japanese flag in the corner → a red play circle centered. This is a **minor home regression** for a long-standing Figma mismatch. Flag in DECISIONS.md before merging.
- Add 6 new tile entries (tiles 9-14 in the §3.2.2 table). Each gets a placeholder modal payload with `// TODO(content): real challenge/solution/result for {tile.id}`.
- All 14 tiles get a `shape` field. Existing 8 tiles need backfilled `shape` per the §3.2.2 table.

### 5.2 — Add `SHOWCASE_HERO` constant

```ts
export const SHOWCASE_HERO = {
  eyebrow: "Shipment Showcase",
  h1Lines: ["Heli Skycargo Shipment", "Highlight and More"], // desktop 2 lines; mobile re-renders as 3 lines via responsive break
  photo: "/showcase/hero-showcase.webp",
  photoAlt: "Heli Skycargo helicopter in transit at the loading dock",
} as const;

export const SHOWCASE_GALLERY = {
  eyebrow: "Case Visuals",
  // H2 has mixed weights; lines 1+3 are Bold, "Our Projects" is Black.
  // Mobile uses "&" instead of "and" — handled in component, copy is the same.
  h2Parts: {
    pre: "Some of ",
    emphasis: "Our Projects",
    postDesktop: " and More",
    postMobile: " & More",
  },
} as const;
```

### 5.3 — Sanity wiring

**None.** The 2026-05-04 decision (`docs/DECISIONS.md`) keeps showcase entirely hardcoded. M7 does NOT touch Sanity schemas, queries, or seeds. The page is `revalidate: 60` only for parity with sibling pages.

```tsx
// src/app/(marketing)/showcase/page.tsx
import { ShowcaseHero } from "@/components/sections/showcase/ShowcaseHero";
import { ShowcaseGallery } from "@/components/sections/showcase/ShowcaseGallery";
import { QuoteFormShell } from "@/components/sections/_shared/QuoteFormShell";
import { OfficesGlobal } from "@/components/sections/_shared/OfficesGlobal";

export const revalidate = 60;

export const metadata = {
  title: "Shipment Showcase | Heli Skycargo",
  description:
    "Explore our past helicopter shipment projects across the globe — routes, aircraft, timelines, challenges, and outcomes.",
};

export default function ShowcasePage() {
  return (
    <>
      <ShowcaseHero />
      <ShowcaseGallery />
      <div id="request-quote" className="scroll-mt-24">
        <QuoteFormShell
          photo={{
            src: "/home/quote-form-photo.webp",
            alt: "Heli Skycargo team coordinating shipments",
          }}
        />
      </div>
      <OfficesGlobal defaultActive="usa" />
    </>
  );
}
```

---

## 6 — Locked decisions

(Append the non-obvious ones to `docs/DECISIONS.md` during the implementation pass.)

1. **Route**: `/showcase`. Confirmed — already in NAV + FOOTER constants; home `View All Showcase` CTA already points here.
2. **No filter chips on M7.** PDF brief mentioned "filterable", but Figma `344:4887` shows no filter UI — just the masonry + Load More. Trust Figma. Service-specific filtering remains on detail pages via the existing `relatedServices` field on tiles (used by `ProjectsMosaic` when given a `serviceSlug` prop). Document this decision so a reader of the PDF doesn't expect filter chips on M7.
3. **All tiles are clickable, including pure-photo tiles without label.** Each tile opens the modal with that tile's data. Pure-photo tiles get a placeholder modal payload (`title: tile.alt`, lorem-ipsum challenge/solution/result with `// TODO(content)` markers). Reason: the Figma modal frame doesn't disambiguate which tiles open it; the simplest mental model is "every tile drills into a project detail". If only label tiles were clickable, half the gallery would feel dead. Replace placeholder modal copy when client supplies real content.
4. **Modal photo carousel**: prev/next arrows + 3-dot indicator paginate **photos within the same project** (not between projects). Reason: 3 dots = small fixed count = "this project has multiple angle photos". `tile.photos: string[]` data field; if `photos.length <= 1`, hide arrows + dots entirely.
5. **Video tiles** — designer intent + behaviour: 4 tiles in Figma carry a red play-circle icon (Japan Desk + 3 unlabeled tiles). The icon means "this story has a video version — when you open the lightbox, the photo area will be a playable video instead of static photos." The other tiles are photo-only stories. The asymmetry exists because the client filmed b-roll for some shipments (Japan office tour, road transport, port-loading sequence, truck-on-highway) but only has stills for the rest — the designer surfaced that asymmetry as a pre-click affordance.
   - Data: each tile has `videoUrl?: string`. When set, the modal swaps the `<Image>` for `<video controls poster={photos[0]}>` (self-hosted MP4) or a click-to-load YouTube unlisted embed (per the 2026-04-28 hosting decision).
   - **Until the client supplies real video files**, video tiles still open the modal — but the photo area renders the static photo with the play icon overlaid (purely cosmetic — no video plays). Search the codebase for `// TODO(content): video file` markers.
   - The play icon previously misinterpreted as a Japan flag is replaced with the correct play icon site-wide (including home `ProjectsMosaic`).
6. **Load More button — different cadence per breakpoint**:
   - Desktop: 8 initial → one click reveals all 14. Single-shot.
   - Mobile: 4 initial → +4 per click → +4 → +4 (paginated). Each batch fades up via `Reveal`.
   - Internal state `displayedCount: number`; per-click increment is `useMediaQuery("(max-width: 767px)") ? 4 : Infinity`. Button hides once `displayedCount >= tiles.length`.
   - Why: 14 tiles fit comfortably above the fold on a 1440 desktop, so a single reveal is fine. Mobile would otherwise be a 7-screen scroll dump — batching keeps the UX deliberate.
7. **Modal close X button** added at panel top-right (NOT in Figma). Reason: accessibility — backdrop click discoverability is poor on mobile. Document the deviation. Use a 32×32 circular `<button>` with a thin × icon, sits at `top-3 right-3` of the panel, ink color, `bg-white/80 hover:bg-white border border-ink/10`.
8. **Modal max-width**: extend `ui/Modal.tsx` to accept `size?: "sm" | "lg" | "xl"`. Default `sm` keeps current consumers unchanged. M7 uses `xl` for `max-w-[1440px]`. **Breaking change risk**: `Modal` only has one current consumer (search the codebase before assuming). If multiple, add the prop with a default.
9. **Hero eyebrow is RED variant** (not gray). Confirmed from Figma `344:4882` (`bg-[#e40c28]`). Mobile `505:6103` also red. Document the deviation from M6's gray hero eyebrow.
10. **Mobile hero subhead is dropped**. Figma mobile shows a stale "Access real-time location of your helicopter while in transit, get push notification" line that's a copy-paste leak from the smart-tracking page hero. Desktop has no subhead, and the copy doesn't match the showcase context.
11. **H2 copy difference between desktop and mobile**: desktop uses `and`, mobile uses `&`. Render via responsive spans — match each Figma exactly per breakpoint.
12. **Modal mobile drops the route header line** ("FROM ITALY TO GABON"). Mobile only shows `Aircraft: …` as the H1. Confirmed from `505:6768` audit — only one absolute-positioned header line at top:1202.
13. **Tile shape data field is mandatory**: `shape: "tall" | "medium" | "short" | "extra-short"`. Drives the masonry. Mobile collapses `short` and `extra-short` to the same aspect (186/160) to keep mobile simpler.
14. **Column assignment is explicit per-tile**: `desktopColumn: 0|1|2|3` and `mobileColumn: 0|1` baked into each tile in `SHOWCASE_TILES`. Mosaic groups by column and renders 4 (desktop) or 2 (mobile) flex-col stacks. No round-robin / no modulo math — deterministic and trivially editable.
15. **`ProjectsMosaic` is reused on every page that shows projects** (home, service-detail, /showcase). One component with optional props for the variations: `showLoadMore`, `initialDesktop`, `initialMobile`, `ctaHref`, `tiles`, `serviceSlug`, `heading`. **The modal lives inside the mosaic**, so every consumer gets clickable tiles + lightbox for free.
16. **Home + service-detail tiles ARE clickable in M7** (and open the same modal). User confirmed this is desired. The home `View All Showcase` CTA below the mosaic remains the navigation path to the dedicated /showcase page; the modal is for diving into a single project's detail without leaving the current page.
17. **The home page mosaic should look the same** as before M7 except for: (a) tiles become clickable, (b) Japan tile shows a play icon instead of a Japan flag. Verify `desktopColumn`/`shape` values for the first 8 tiles produce the same layout. Acceptance gate.
18. **Showcase-specific quote photo is optional** — fall back to `/home/quote-form-photo.webp` if `/public/showcase/quote-form-photo.webp` does not exist after asset download.
19. **Default-active office on M7 = USA** (per user 2026-05-10). M5 used UAE, M6 used Malaysia.
20. **No CMS, no Sanity changes.** Showcase remains hardcoded per the 2026-05-04 decision.
21. **No new dependencies, no token additions, no schema changes.** Within existing CLAUDE.md guardrails.
22. **`ProjectsMosaic` becomes a client component** (currently Server). It owns the `displayedCount` state, the `activeTileId` modal state, and the photo carousel state. Hero, Quote, Offices, Footer remain Server Components. The page route stays Server; only the mosaic + modal are client islands.
23. **Modal "Request Quote" pill smart-routes**: `getElementById("request-quote")` first; if found, close + smooth-scroll. Else navigate to `/quote` (M8 future). All current consumers render `QuoteFormShell` so the in-page path always wins today; the fallback exists so the mosaic remains reusable on a future page that doesn't embed the form.

---

## 7 — Component map

### NEW

| File                                | Location                    | Server/Client | Notes                                                                                                         |
| ----------------------------------- | --------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| `ShowcaseHero.tsx`                  | `sections/showcase/`        | Server        | full-bleed photo + RED eyebrow + H1, no subhead                                                               |
| `ShowcaseModal.tsx`                 | `sections/_shared/`         | Client        | shared lightbox: photo/video carousel + meta + 3-section body + Request Quote pill. Used by `ProjectsMosaic`. |
| `app/(marketing)/showcase/page.tsx` | `app/(marketing)/showcase/` | Server        | NEW route — composes Hero + ProjectsMosaic + Quote + Offices                                                  |

### MODIFIED

| File                                                 | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/constants.ts`                               | extend `ShowcaseTile` (`shape`, `desktopColumn`, `mobileColumn`, `photos`, `videoUrl`, `hasPlayIcon`, `modal.title`); migrate `showFlag` → `hasPlayIcon` on Japan tile; add 6 new tile entries (tiles 9-14); add `SHOWCASE_HERO` + `SHOWCASE_GALLERY` constants                                                                                                                                                                                                                                                             |
| `src/components/ui/Modal.tsx`                        | add `size?: "sm" \| "lg" \| "xl"` prop; default `sm` keeps current behavior; xl = `max-w-[1440px]`                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/components/sections/_shared/ProjectsMosaic.tsx` | major refactor: becomes a client component, switches from 4×2 fixed bento → column-based masonry driven by `tile.desktopColumn`/`mobileColumn`/`shape`. Adds props for variants (showLoadMore, initialDesktop, initialMobile, ctaHref, etc.). Owns the `ShowcaseModal` and the open/close + photo-carousel state. Replaces `japan-flag.svg` rendering with `icon-play.svg` on `tile.hasPlayIcon`. Click on any tile → opens modal. The CTA `View All Showcase` button stays at the bottom (now configurable via `ctaHref`). |
| `src/app/(marketing)/page.tsx`                       | no prop changes needed — defaults preserve home behavior. Verify visually. (Tiles now clickable, opening the modal — confirmed desired by user.)                                                                                                                                                                                                                                                                                                                                                                            |
| `src/app/(marketing)/services/[slug]/page.tsx`       | no prop changes — `serviceSlug` already passed; tiles now clickable, modal opens                                                                                                                                                                                                                                                                                                                                                                                                                                            |

### REUSED (no edits)

- `_shared/Container`, `Section`, `SectionEyebrow`, `Reveal` (with stagger pattern)
- `_shared/QuoteFormShell` (passed a photo prop)
- `_shared/OfficesGlobal` (passed `defaultActive="usa"`)
- `ui/Modal` (after the `size` prop addition)
- `layout/Header`, `layout/Footer`
- `lib/utils.cn`

### REMOVED (or marked deprecated)

- `/public/showcase/japan-flag.svg` — no longer referenced after the play-icon migration. Delete from repo.

---

## 8 — Acceptance checklist

Run through this before declaring M7 done.

**Functional**

- [ ] `/showcase` renders 8 tiles initially; "Loading More …" button visible.
- [ ] Click "Loading More …" → 14 tiles render; button disappears.
- [ ] Every tile is clickable and opens the modal with its own data.
- [ ] Modal opens with the correct photo, title, aircraft, route, mode, timeline, challenge/solution/result.
- [ ] Modal arrows + dots: appear when `photos.length > 1`, hidden otherwise.
- [ ] Modal arrows cycle photos within the same tile; ArrowLeft/ArrowRight keyboard works.
- [ ] Modal ESC + backdrop click + close-X button all close the modal; body scroll-lock applies while open.
- [ ] Modal "Request Quote" button closes the modal and scrolls to `#request-quote` on the same page (with `scroll-mt-24` offset).
- [ ] Hero overlay 0.36 at all viewports (NOT 0.40 desktop / 0.36 mobile per M6 — M7 is uniform 0.36).
- [ ] Hero eyebrow is RED, gallery eyebrow is GRAY, modal Quote pill is RED — confirmed.
- [ ] Mobile hero shows NO subhead.
- [ ] Mobile gallery H2 reads `& More`; desktop reads `and More`.
- [ ] Header overlay variant renders correctly over the dark hero.
- [ ] FOOTER `Shipment Showcase` link from any page navigates here.
- [ ] OfficesGlobal opens with USA highlighted at all viewports.
- [ ] Home `ProjectsMosaic` renders unchanged compared to pre-M7 — except the Japan tile now shows a play icon (red circle) instead of the Japanese flag.

**Pixel-perfect (per §0 step 2)**

- [ ] Hero matches `344:4874` desktop + `505:6096` mobile (overlay 0.36, eyebrow red, H1 wrap 2/3 lines).
- [ ] Gallery heading matches `344:4108` desktop + `505:6414` mobile (gray eyebrow, mixed-weight single-line H2).
- [ ] All 14 tiles present at desktop, in the order driven by SHOWCASE_TILES, at correct heights.
- [ ] Mobile shows 11 tiles initial then 14 after Load More (or whatever count Figma shows).
- [ ] Tile labels match Figma line breaks exactly (e.g. `FROM SWITZER- LAND TO INDIA` desktop wraps to 4 lines).
- [ ] Play icon (red circle, 113×113 desktop / 70×70 mobile) appears on the 4 video tiles only.
- [ ] Modal layout matches `345:9801` desktop + `505:6761` mobile (split layout vs vertical stack, header sizes, meta strip values in red, section headings 20px ink).
- [ ] Modal Request Quote pill matches `345:9797` desktop + `505:6779` mobile (red, rounded-30, exact padding + tracking).
- [ ] Quote form renders identically to home/services/why-choose-us/team.
- [ ] Footer matches existing implementation.

**Code quality**

- [ ] `pnpm typecheck` clean.
- [ ] `pnpm lint` clean.
- [ ] No new packages in `package.json`.
- [ ] No edits to `next.config.*`, `tailwind.config.*`, `tsconfig.json`, `tokens.css`.
- [ ] All new components are Server Components by default; only `ShowcaseGallery` (and its modal child) is client-side.
- [ ] No client-side Sanity fetch (and no Sanity fetch at all on this page — it's hardcoded).
- [ ] All `<img>` use `next/image` with explicit `width`/`height` (or `fill` + `sizes`).
- [ ] `alt` text meaningful on every photo.
- [ ] Modal panel has `aria-modal="true"` (native via `<dialog>`) and `aria-label` describing the project.
- [ ] Each tile is a `<button type="button">` with `focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2`, NOT a `<div onClick>`.
- [ ] Prev/next modal buttons have `aria-label="Previous photo"` / `aria-label="Next photo"`.
- [ ] Body scroll-lock applies + cleans up on close.
- [ ] No console warnings on first render at any viewport.
- [ ] No unused `showFlag` references after the migration.

**Process**

- [ ] `docs/DECISIONS.md` updated for the non-obvious items in §6 (no filter chips on showcase, all tiles clickable, modal photo carousel scope, video tiles strategy, Load More 8→14, modal close X button addition, Modal `size` prop addition, mobile hero subhead drop, Japan flag → play icon migration).
- [ ] `CLAUDE.md` §2 "Currently working on" updated to reflect M7 done.
- [ ] No commits without explicit user approval.
- [ ] Asset URLs from Figma have been re-pulled if older than 5 days at the time of download.

---

## Appendix A — Verbatim copy

### A.1 — Hero

- Eyebrow: `SHIPMENT SHOWCASE` (red variant)
- H1 desktop (2 lines): `Heli Skycargo Shipment` / `Highlight and More`
- H1 mobile (3 lines): `Heli Skycargo Shipment` / `Highlight` / `and More`

### A.2 — Gallery heading

- Eyebrow: `CASE VISUALS` (gray variant — `bg-ink-muted text-surface`)
- H2 desktop (single line, mixed weights): `Some of ` (Bold) + `Our Projects` (Black) + ` and More` (Bold)
- H2 mobile (single line, mixed weights): `Some of ` (Bold) + `Our Projects` (Black) + ` & More` (Bold)

### A.3 — Tile route labels (canonical, see §3.2.2)

| Tile id             | Desktop label lines (4-line wrap honored) | Mobile label lines                |
| ------------------- | ----------------------------------------- | --------------------------------- |
| `switzerland-india` | FROM / SWITZER- / LAND TO / INDIA         | FROM / SWITZER- / LAND TO / INDIA |
| `japan-desk`        | OUR / JAPAN / DESK                        | OUR / JAPAN / DESK                |
| `myanmar-gabon`     | FROM / MYANMAR / TO GABON                 | FROM / MYANMAR / TO / GABON       |
| `khalifa-port`      | LOADING / AT KHALIFA / PORT               | LOADING / AT KHALIFA / PORT       |
| `belgium-cameroon`  | FROM / BELGIUM / TO / CAMEROON            | FROM / BELGIUM / TO CAME- / ROON  |
| `china-guatemala`   | FROM / CHINA TO / GUATEMALA               | FROM / CHINA TO / GUATEMALA       |

### A.4 — Modal example (France → Brazil, modeled after Figma `345:9801`)

- Header desktop line 1: `FROM ITALY TO GABON` (32px Inter Tight Bold)
- Header desktop line 2: `Aircraft: ` (40px Inter Tight Bold ink) + `Airbus H125` (40px Inter Tight Bold red)
- Header mobile (single line): `Aircraft: ` (24px Inter Tight Bold ink) + `Airbus H125` (24px Inter Tight Bold red)
- Meta — Route: `France → Brazil`
- Meta — Transport Mode: `Ocean Freight (RoRo)`
- Meta — Timeline: `18 Days`
- THE CHALLENGE: `Complex export coordination and secure blade protection required for long-distance transport.`
- THE SOLUTION: `Specialized crating, RoRo transport coordination, and seamless customs clearance ensured safe delivery.`
- THE RESULT: `Delivered safely, on time, and deployment-ready.`
- Button: `Request Quote`

### A.5 — Load More

- Desktop label: `Loading More ...` (capitalize CSS, lowercase source)
- Mobile label: `Loading More ...`

### A.6 — Offices

Reuses existing `OFFICES` constants. Default active = USA (`defaultActive="usa"`).

### A.7 — Quote form

Reuses `QuoteFormShell` defaults — eyebrow `Request a Quote`, H2 `Start Your / Global Transport / Request`. No copy override needed.

---

## Appendix B — Figma asset URLs (snapshot — refresh if expired)

These URLs expire ~7 days after the audit. Re-pull frames from §2 if any 404.

| Asset                             | URL                                                                        |
| --------------------------------- | -------------------------------------------------------------------------- |
| Hero bg (desktop, 344:4875)       | `https://www.figma.com/api/mcp/asset/216c9527-1759-4a87-8d4a-c2ec94b901ee` |
| Hero bg (mobile, 505:6732)        | `https://www.figma.com/api/mcp/asset/0d3d3f00-f21c-4dd0-acbb-a80920a97094` |
| Modal example photo (345:9781)    | `https://www.figma.com/api/mcp/asset/ed09d152-cd7a-45e2-b472-cb4d80868a7a` |
| Modal dot indicators (345:9793)   | `https://www.figma.com/api/mcp/asset/27937716-a712-4362-95ee-187d509e391c` |
| Play icon group (344:4072)        | `https://www.figma.com/api/mcp/asset/8ebea6d6-2b12-4a5e-8aa0-0d1c2a63b899` |
| Play icon (variant, 344:4078)     | `https://www.figma.com/api/mcp/asset/7d0406d8-1bed-4e59-9203-ddde7fbd6820` |
| Play icon (variant, 643:35 Japan) | `https://www.figma.com/api/mcp/asset/3245660f-4978-4f85-b074-7d8c427dc57d` |
| Modal arrow next (674:475)        | `https://www.figma.com/api/mcp/asset/442685a4-3346-45cd-a132-4004a0c31f01` |
| Modal arrow prev (674:480)        | `https://www.figma.com/api/mcp/asset/b2eb6d50-4483-481d-a76e-8d543bf19349` |

If the play-icon variants differ visually, prefer the Japan-Desk variant (`643:35`) since it's the most clearly visible in the audit screenshot.

---

## Appendix C — Open follow-ups for content review (M9 polish or pre-launch)

- [ ] Replace placeholder modal copy on tiles 5, 7, 8, 10, 11, 12, 13, 14 (search `// TODO(content):` in `constants.ts`).
- [ ] Replace placeholder photos on tiles 9-14 (whichever Figma asset URLs were grabbed) with real client-supplied photos.
- [ ] Decide whether the 4 video tiles get real video files. Until then they open the static-photo modal.
- [ ] Verify the showcase quote-form photo is the correct asset (or accept the home reuse).
- [ ] Confirm with client whether the home `Japan` tile play icon (post-migration) reads correctly OR they want to keep the Japan flag for branding (revert if so).

---

End of plan. The next session can run autonomously from §0.
