# Module 4 — Service Detail Pages — Implementation Plan

> **How to use this file**: This is the design contract for Module 4. Read it cold at the start of the M4 session — it captures the Figma audit + locked decisions so you don't have to re-pull frames. Cross-references: `CLAUDE.md` (project rules), `docs/DECISIONS.md` (architecture log), `docs/M3_PLAN.md` (sibling module + shared component map), `AGENTS.md` (Next.js 16 reminder).

**Status**: planning COMPLETE — all 7 sections audited across desktop + mobile, all 6 services covered, reuse decisions locked, per-service content captured in Appendix A, M7 lightbox referenced in Appendix B. Ready for autonomous implementation.
**Audit date**: 2026-05-06
**Target route**: `/services/[slug]` (replaces M3 stub at `src/app/(marketing)/services/[slug]/page.tsx`)
**Authoritative design source**: Figma file `UkrV8vyPeLqsYbZ57OrESC` (HSC--Copy-)

---

## 1 — Suggested workflow

Identical loop to M2 / M3. Mirrors `CLAUDE.md` §7.

1. **Open this file + `CLAUDE.md` §2 + `docs/PROJECT_BRIEF.md` §4 (Service Detail Pages)** before writing code.
2. **Confirm scope back to the user in 2–3 sentences.** Don't start coding until aligned. If §6 still has open gaps, surface them now.
3. **Re-pull Figma frames only if a token / pixel value isn't in this doc.** All hero specs are captured below — Figma MCP quota is precious. If you do need to re-pull, prefer the copy file (`UkrV8vyPeLqsYbZ57OrESC`) since the M3 audit confirmed it has fresher quota when the original is rate-limited.
4. **Build mobile-first.** 375 → `md` 768 → `lg` 1024 → `xl` 1440. Test at all four widths before claiming any section done. No "fix mobile later".
5. **Component placement**:
   - Page route: `src/app/(marketing)/services/[slug]/page.tsx` (replace current M3 stub)
   - Page-scoped sections: `src/components/sections/service-detail/`
   - Cross-page reusables already exist under `_shared/` — reuse `Header`/`Footer`/`Reveal`/`SectionEyebrow`/`Container`/`OfficesGlobal`/`QuoteFormShell`. Do NOT promote service-detail components to `_shared/` unless a second consumer is identified during the build.
6. **Static-first** per `CLAUDE.md` §3.1. Server Components by default. The whole `[slug]` page reads from `SERVICES` in `src/lib/constants.ts` — no Sanity, no client fetch. `generateStaticParams` already returns the 6 slugs (existing M3 stub).
7. **Hardcoded content** in `src/lib/constants.ts`. Extend the existing `Service` type with the M4 fields (see §5). Do **not** add anything to Sanity for M4 — `CLAUDE.md` §3.3 limits the CMS to 5 specific collections; service detail copy is hardcoded.
8. **Polish baseline matches M2/M3**: `Reveal` scroll-reveal stagger, hover micro-interactions, focus rings, AA contrast. Lighthouse target ≥ 95 (`CLAUDE.md` §3.2).
9. **`pnpm typecheck` + `pnpm lint`** after each non-trivial section. Fix before moving on.
10. **No commits** until the user explicitly approves (memory: `feedback_no_commit_without_ask`). Append non-obvious calls to `docs/DECISIONS.md`.
11. **At end of session**: update `CLAUDE.md` §2 "Currently working on" line; summarise what shipped + what's next.

### Suggested implementation order (per session)

This is the order to keep PRs reviewable and de-risk. Not prescriptive.

1. **Extend `Service` type + content** in `src/lib/constants.ts` — add hero fields (eyebrow override, h1 lines, hero photo path, benefits) and detail-section fields (overview body, when-to-choose bullets, related project slugs). Do this **before** any UI so all 6 services have parity content.
2. **`ServiceDetailHero`** — biggest visual change vs. the M3 stub. Build mobile-first; verify all 6 services render correctly.
3. **`ServiceOverview`** — overview paragraph section. Spec deferred until Figma frames provided.
4. **`WhenToChoose`** — fit-for-use section. Spec deferred until Figma frames provided.
5. **`RelatedProjects`** — strip linking to M7 showcase. Spec deferred. M4 may stub with placeholder cards if M7 data isn't ready.
6. **Page assembly** — the `[slug]/page.tsx` route imports the four sections + reuses `QuoteFormShell` and `OfficesGlobal` at the bottom (see §3 — pending confirmation in §6).
7. **Polish pass** — Reveal stagger, hover timings, focus rings, mobile width sweep at 375/768/1024/1440. After making sure all
8. **Typecheck + lint clean.** Update `CLAUDE.md` §2 "Currently working on".

---

## 2 — Figma frame index

**Audit file**: `UkrV8vyPeLqsYbZ57OrESC` (HSC--Copy-) — same file used in the M3 audit.
**Canonical file** (per M3 plan): `oYbmAQczd2UX5PtQnVBz50` — re-use only if the copy is rate-limited.

| Section                          | Service                | Desktop nodeId                           | Mobile nodeId       | Status                                           |
| -------------------------------- | ---------------------- | ---------------------------------------- | ------------------- | ------------------------------------------------ |
| Hero                             | Ocean RO/RO            | `345:8253`                               | `529:8213`          | ✅ audited                                       |
| Hero                             | Ocean LO/LO            | `589:206`                                | —                   | ✅ audited (desktop), mobile inferred from RO/RO |
| Hero                             | Ocean FCL              | `593:1201`                               | —                   | ✅ audited (desktop), mobile inferred from RO/RO |
| Hero                             | Air Commercial         | `681:530`                                | —                   | ✅ audited (desktop), mobile inferred from RO/RO |
| Hero                             | Air Chartering         | `681:1030`                               | —                   | ✅ audited (desktop), mobile inferred from RO/RO |
| Hero                             | Road Freight           | `681:19`                                 | —                   | ✅ audited (desktop), mobile inferred from RO/RO |
| Overview (§3.2)                  | Ocean RO/RO            | `345:8753`                               | `529:8622`          | ✅ audited                                       |
| Overview (§3.2)                  | Ocean LO/LO            | `589:250`                                | inferred from RO/RO | ✅ audited (desktop)                             |
| Overview (§3.2)                  | Ocean FCL              | `593:1245`                               | inferred from RO/RO | ✅ audited (desktop)                             |
| Overview (§3.2)                  | Road Freight           | `681:63`                                 | inferred from RO/RO | ✅ audited (desktop)                             |
| Overview (§3.2)                  | Air Commercial         | `681:574`                                | inferred from RO/RO | ✅ audited (desktop)                             |
| Overview (§3.2)                  | Air Chartering         | `681:1074`                               | inferred from RO/RO | ✅ audited (desktop)                             |
| When to Choose (§3.3)            | Ocean RO/RO            | `345:8763`                               | `529:8633`          | ✅ audited                                       |
| When to Choose (§3.3)            | Ocean LO/LO            | `589:260`                                | inferred            | ✅ audited — **identical copy to RO/RO**         |
| When to Choose (§3.3)            | Ocean FCL              | `593:1255`                               | inferred            | ✅ audited — **identical copy to RO/RO**         |
| When to Choose (§3.3)            | Road Freight           | `681:72`                                 | inferred            | ✅ audited — **identical copy to RO/RO**         |
| When to Choose (§3.3)            | Air Commercial         | `681:583`                                | inferred            | ✅ audited — **identical copy to RO/RO**         |
| When to Choose (§3.3)            | Air Chartering         | `681:1084`                               | inferred            | ✅ audited — **identical copy to RO/RO**         |
| Value-Added Services grid (§3.4) | shared across services | `345:8693`                               | `529:8669`          | ✅ audited                                       |
| Projects Showcase strip (§3.5)   | shared across services | `373:2841`                               | `529:8808`          | ✅ audited                                       |
| Quote Form (§3.6)                | shared across services | `345:8798`                               | `529:8356`          | ✅ audited — **identical to M3 — direct reuse**  |
| Offices (§3.7)                   | shared across services | `889:939`                                | `889:487`           | ✅ audited — **identical to M3 — direct reuse**  |
| Footer                           | shared across services | not pulled — reuse existing `Footer.tsx` | —                   | reuse                                            |

### Re-pull command pattern (Figma MCP)

```
mcp__figma-remote-mcp__get_design_context
  fileKey: UkrV8vyPeLqsYbZ57OrESC
  nodeId: <see table>
  clientFrameworks: react,nextjs
  clientLanguages: typescript,css
```

---

## 3 — Section-by-section design specs

### §3.1 — Hero (audited, ready to build) ✅

The hero is **identical in structure across all 5 audited services** — only the eyebrow text, H1 copy, background photo, and hero asset URLs change per service. Build it as a single `ServiceDetailHero` component that takes the service record (or destructured props) and renders the right content.

#### Desktop (`345:8253` Ocean RO/RO is the canonical reference; 589:206, 593:1201, 681:530, 681:1030 confirm consistency)

| Element                 | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame                   | `1600 × 705`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Background              | full-bleed photo + black overlay `rgba(0,0,0,0.4)` (Ocean FCL desktop frame uses `0.3` instead — treat as **0.4 across the board**, the Ocean FCL value is likely an inconsistency. See note below)                                                                                                                                                                                                                                                                                 |
| Header                  | logo `left:79 top:28` (136×50); white "Request Quote" pill at `left:1295 top:28` (rounded-30, padding 30/20, **PT Sans Bold 14 black tracking 0.84 capitalize**); burger at `left:1491 top:42` (31×22). **Identical to M2/M3 header — reuse existing `Header` component, no override needed.**                                                                                                                                                                                      |
| Eyebrow pill            | `bg #e40c28`, padding 11/8, "OVERVIEW <SERVICE NAME>" PT Sans Bold 12 white tracking 0.72 uppercase. Position: `left:79 top:281`.                                                                                                                                                                                                                                                                                                                                                   |
| H1                      | **PT Sans Bold 64px** white capitalize, line-height 82. Position: `left:79 top:342`. Some titles wrap to 2 lines (Ocean RO/RO, Ocean LO/LO), some to 1 line (Ocean FCL, Air Commercial, Air Chartering). The wrap is content-driven — the `whitespace-nowrap` in the Figma export only applies when the copy fits on a single line at 1600px width. Implementation: use `whitespace-pre-line` and let `\n` in the data control wrap.                                                |
| Benefits strip          | 4 chips at `top:572`. Each: `276 × 70`, `bg rgba(0,0,0,0.31)`, `backdrop-blur 16.8px`. Positions: `left:79 / 463 / 847 / 1231`. **Gap between chips: 108px** (`463 - (79+276) = 108`). Each chip contains a 22×22 white outline icon at `left:106` (28px inset from chip left) and a label at `left:55px` from chip left, baseline at `top:602` (vertically centered in the 70px chip with cap-height drop). **Label font: Poppins SemiBold 16 white, capitalize, leading-normal.** |
| Benefit icons (desktop) | shield/check, globe, 3d-rotate, badge-check — exported as SVG/PNG by Figma asset URLs (see §4 for retrieval). White/light strokes on transparent backgrounds.                                                                                                                                                                                                                                                                                                                       |
| Animation               | none in Figma. Mount uses our existing `Reveal` (fade-up). No hover effect on the hero.                                                                                                                                                                                                                                                                                                                                                                                             |

##### Per-service hero content (audited)

| slug             | Eyebrow text              | H1 (line-1 / line-2 — `\n` separated)                      | Bg photo notes                                                |
| ---------------- | ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| `ocean-roro`     | `OVERVIEW OCEAN RO/RO`    | `Roll-On/Roll-Off\nOcean Transport`                        | helicopter being rolled onto Grande Torino vessel             |
| `ocean-lolo`     | `OVERVIEW OCEAN LO/LO`    | `Ocean Lift-On / Lift-Off\nTransport Method`               | container ship + dockside helicopters                         |
| `ocean-fcl`      | `OVERVIEW OCEAN FCL`      | `Ocean FCL - Container Transport` (single line)            | helicopters loaded on flatbed near container yard             |
| `road-freight`   | `OVERVIEW ROAD FREIGHT`   | `Helicopter Road Freight Solutions` (single line)          | helicopter on heavy-haul flatbed truck, ground crew in hi-vis |
| `air-commercial` | `OVERVIEW AIR COMMERCIAL` | `Commercial Air Freight Transport Solutions` (single line) | helicopter inside opened B747 freighter cargo hold            |
| `air-chartering` | `OVERVIEW AIR CHARTERING` | `Air Charter Transport for Urgent Shipments` (single line) | Volga-Dnepr Antonov-124 with helicopters on tarmac            |

##### Benefits chips — IDENTICAL across all 5 audited services

All four chips show the same labels in every audited frame:

1. **Secure Handling** — shield-check icon
2. **Global Routes** — globe icon
3. **Fast Vessel Loading** — 3d-rotate icon
4. **Expert Coordination** — verify-check badge icon

> **Open question (see §6)**: "Fast Vessel Loading" doesn't make sense for Air Commercial / Air Chartering / Road Freight. Either (a) Figma is templated and devs are expected to override per service, (b) brand voice is universal, or (c) designer hasn't customised yet. The autonomous session **must NOT swap these labels per-service without user confirmation**. Default behaviour: ship the same 4 labels on all 6 pages (matches Figma); flag for content review.

#### Mobile (`529:8213` Ocean RO/RO — only mobile frame audited)

| Element        | Value                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame visible  | `430 × 470` (the hero band)                                                                                                                                                                                                                                                                                                                                                                                                 |
| Background     | full-bleed photo + black overlay `rgba(0,0,0,0.36)` — note **36% on mobile vs. 40% on desktop** (matches the M3 services hero pattern from `505:7643`)                                                                                                                                                                                                                                                                      |
| Header         | single 381×40 image at `left:24 top:21` containing logo + burger combined. **No "Request Quote" pill on mobile** (matches M2/M3 mobile header). Reuse existing `Header` component.                                                                                                                                                                                                                                          |
| Eyebrow        | bg `#e40c28`, padding **6** (vs. desktop 11/8), same "OVERVIEW <SERVICE>" text, PT Sans Bold 12 white tracking 0.72 uppercase. Position: `left:24 top:212`.                                                                                                                                                                                                                                                                 |
| H1             | **PT Sans Bold 32 / line-height 42** white capitalize, on 2 lines for RO/RO. Position: `left:24 top:252`.                                                                                                                                                                                                                                                                                                                   |
| Benefits strip | 4 chips at `top:370`. Each chip is **the same 276×70 desktop size** but laid out HORIZONTALLY past the 430px frame width (positions: `left:30 / 314 / 698 / 1082`). Gap between chips: `314 - (30+276) = 8px`. **This is a horizontal scroll/carousel on mobile.** Implementation: `overflow-x-auto` + `scroll-snap-type: x mandatory`, with each chip `scroll-snap-align: start`. Hide native scrollbar; allow drag/swipe. |

##### Implementation notes for the chips on mobile

- Use a flex row with horizontal overflow.
- First chip flush at `left:24`/`30` (the 30px and 24px values differ slightly between RO/RO mobile hero and rest — adopt **24px page padding** to match M3 mobile container).
- Add a faint right-edge fade gradient (optional polish) to telegraph that more content scrolls.
- Chips on mobile are visible-by-2: card 1 fully + card 2 partially as shown in the screenshot.

#### Desktop ↔ mobile asymmetries (must-handle)

| Property        | Desktop                            | Mobile                                        |
| --------------- | ---------------------------------- | --------------------------------------------- |
| Overlay         | 40% black                          | **36% black**                                 |
| Eyebrow padding | 11/8                               | **6 (uniform)**                               |
| H1 size         | 64 / lh 82                         | **32 / lh 42**                                |
| H1 wrap         | content-driven (1 or 2 lines)      | always 2 lines (RO/RO has hard wrap baked in) |
| Header          | logo + Request Quote pill + burger | logo + burger only                            |
| Benefits chips  | 4 in row, 108px gap                | 4 in horizontal scroll, 8px gap               |
| Page padding-x  | 79px                               | 24px                                          |

#### Hero acceptance checks

- [ ] All 6 services render the hero with their own eyebrow + H1 + photo
- [ ] Mobile benefits strip scrolls horizontally with snap
- [ ] All sections render at 375 / 768 / 1024 / 1440
- [ ] Reveal fade-up plays once on scroll-in for eyebrow + H1 (stagger 0.1s)
- [ ] Header reuses existing `Header` component (no per-page override)
- [ ] No layout shift when fonts load (next/font already configured for PT Sans + Poppins)
- [ ] Lighthouse LCP < 2.0s on 4G (hero photo is the LCP candidate; use `priority` on `<Image>` and a sized WebP)

---

### §3.2 — Overview (audited) ✅

Two-column section: photo on the right, content (eyebrow + H2 + 2 paragraphs + black "Request Quote" pill) centered in left column. Text is **center-aligned** in both desktop and mobile.

#### Desktop (`345:8753`)

| Element                                       | Value                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Frame                                         | `~1432 × 740`. Image column starts at `left:724` and is `708 × 740` (full-bleed of the section). Content column is the left half (0–720), padded centred.                                                                                                                                                                                                                                        |
| Background                                    | `bg-surface` (white).                                                                                                                                                                                                                                                                                                                                                                            |
| Eyebrow (gray pill, **section-name variant**) | `bg #4a4e54` padding 8, **PT Sans Bold 12** white tracking 0.72 uppercase. Text is the **service's full marketing label** — for RO/RO: `Roll-On/Roll-Off Ocean Transport`. Position: `left:218 top:97` (centered above H2).                                                                                                                                                                      |
| H2                                            | 3 lines, all **center-aligned**, **Inter Tight Black 54 / line-height 70 ink #101820 uppercase**. Position: centered horizontally in left column at `top:148`. RO/RO content: `Fast, secure / helicopter transport / using RoRo vessels.` (line 1 in Black, lines 2–3 in Bold per Figma export — but visually they look the same Black weight; treat all 3 as Inter Tight Black for simplicity). |
| Paragraph 1                                   | Centered, max-width 600px. **PT Sans Regular 15 / line-height 30 ink #101820**. Mixes regular + **bold runs** for emphasis on key terms (`MAFI Roll Trailer`, `towed inside the vessel`). Position: `top:371`.                                                                                                                                                                                   |
| Paragraph 2                                   | Centered, max-width 600px. PT Sans Regular 15 / lh 30 ink. Has bold runs on carrier names (`MOL (Mitsui O.S.K. Lines)`, `EUKOR`, etc.). Position: `top:478`.                                                                                                                                                                                                                                     |
| CTA button                                    | Black `#101820` rounded-30 pill, padding 30/20, **PT Sans Regular 14** white tracking 0.84 capitalize: `Request Quote`. Position: `top:593`, **center-aligned in left column** (left:243 in Figma — i.e. 322 - 79/2 ≈ centred in the 0–720 column). Links to the shared QuoteFormShell anchor on the same page (e.g. `#request-quote`).                                                          |
| Image                                         | Right column 708×740, full-bleed. `object-cover`, slight horizontal offset (image is rendered at 139% width with negative left).                                                                                                                                                                                                                                                                 |
| Right-column overlay                          | A small decorative **play-button-like circle group6** image is positioned at `left:1022 top:314` (size 113×113) on TOP of the image — this is a **video/play icon** suggesting this section's image may be a click-to-play video later. **For M4 ship as a static photo with an SVG play badge overlay** (visual-only; no video player wired yet).                                               |

#### Mobile (`529:8622`)

| Element            | Value                                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Frame              | `~430 × 830` (430 width × stacked height).                                                                                    |
| Layout             | Photo on top, content stacked below. Content **center-aligned**.                                                              |
| Image              | `382 × 338` at `left:24 top:30`, rounded none.                                                                                |
| Eyebrow            | gray pill with **same** copy. Position: centered around `left:91 top:392` (visually centered with offset due to label width). |
| H2                 | 3 lines, **Inter Tight Black 24 / line-height 34** uppercase ink. Centered. Top: `443`.                                       |
| Paragraph 1        | PT Sans Regular **14 / line-height 24**, max-width 382, centered. Bold runs on emphasis terms. Top: `550`.                    |
| Paragraph 2        | Same style as P1. Top: `657`.                                                                                                 |
| CTA                | Black pill, padding **20/14** (smaller than desktop), PT Sans Regular 14 white. Centered. Top: `761`.                         |
| Play badge overlay | not visible in mobile frame — drop on mobile, OR reuse a smaller version.                                                     |

#### Animation

- Mount: `Reveal` fade-up stagger (eyebrow → H2 → P1 → P2 → CTA) on scroll-in.
- No hover state on CTA other than standard button focus + opacity transition.
- The play-badge circle on desktop is decorative-static for M4; if we wire video later (Module 9 polish), animate it on click.

---

### §3.3 — When to Choose (audited) ✅

Mirror layout of §3.2 but image is on the **LEFT** instead of the right, with a 4-card 2×2 grid replacing the carrier-list paragraph.

#### Desktop (`345:8763`)

| Element                 | Value                                                                                                                                                                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame                   | `~1437 × 740`.                                                                                                                                                                                                                                                                               |
| Image                   | Left column `708 × 740` at `left:0 top:0`. `object-cover`, slight horizontal offset (185% width, -40% left for hotspot).                                                                                                                                                                     |
| Eyebrow                 | Gray pill `bg #4a4e54` padding 8, **PT Sans Bold 12** white tracking 0.72 uppercase. Text: **`OUR VALUES`** (literal, all services). Position: centered above H2 in right column (left:cont-center, top:79).                                                                                 |
| H2                      | 2 lines, **Inter Tight Black 54 / line-height 70 ink uppercase**. Position: centered in right column. Text: `When to Choose / This Service` (literal copy across all services — only the bullet list below it differs).                                                                      |
| Paragraph               | PT Sans Regular 15 / lh 30 ink centered, max-width 600. Top:270. **Same paragraph as in §3.2 in the Figma — likely placeholder copy. Per-service this paragraph differs.**                                                                                                                   |
| Card grid               | 2 × 2 grid, `top:371`. Each card `315 × 100`, `bg-white border 1px #f5f5f5 backdrop-blur 16.8px`. Cards arranged: `(left:787,top:371)`, `(left:1111,top:371)`, `(left:787,top:481)`, `(left:1111,top:481)`. **Gap: `1111 - (787+315) = 9px` horizontal, `481 - (371+100) = 10px` vertical.** |
| Card content (per card) | Red verify badge icon at left:`card.left + 73` top:`card.top + 34` (~22 × 22). Title in **PT Sans Bold 16 ink** + subtitle **PT Sans Regular 16 ink** stacked vertically at left:`card.left + 73` top:`card.top + 34`.                                                                       |
| CTA                     | Black rounded-30 pill — same as §3.2 — at `left:1027 top:611`, centered under the card grid.                                                                                                                                                                                                 |

##### Per-service "When to Choose" cards (RO/RO from `345:8763`)

| #   | Title (PT Sans Bold) | Subtitle (PT Sans Regular)   |
| --- | -------------------- | ---------------------------- |
| 1   | Long-Distance        | International Transport      |
| 2   | Cost-Efficient       | Alternative To Air Freight   |
| 3   | Safe Transport For   | Wheeled Helicopter Platforms |
| 4   | Ideal For Scheduled  | Delivery Timelines           |

#### Mobile (`529:8633`)

| Element                    | Value                                                                                                                                                                                                                                                                       |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame                      | `~430 × 975`.                                                                                                                                                                                                                                                               |
| Layout                     | Photo on top, content stacked below. Cards **stack vertically** (1 × 4) instead of 2 × 2.                                                                                                                                                                                   |
| Image                      | `382 × 338` at `left:24 top:30`.                                                                                                                                                                                                                                            |
| Eyebrow                    | Gray pill, centered, `top:402`.                                                                                                                                                                                                                                             |
| H2                         | Inter Tight Black 24 / lh 34 uppercase ink centered. 2 lines. Top:446.                                                                                                                                                                                                      |
| Paragraph                  | PT Sans Regular **14 / line-height 22** ink centered, max-width 382. Top:521.                                                                                                                                                                                               |
| Cards                      | 4 cards stacked vertically at `left:85`, `260 × 60` each, `bg-white border #f5f5f5`. Top positions: `617 / 687 / 757 / 827` (gap 10). Each card has icon at `left:145` (60 inset) and title+subtitle stacked, **PT Sans Bold 14 / Regular 14**.                             |
| Mobile card order in Figma | The frame export shows card order: `Ideal For Scheduled / Cost-Efficient / Safe Transport For / Long-Distance` — i.e. **reversed/reshuffled vs. desktop**. Likely Figma layer ordering accident; ship the **desktop order** on mobile too for consistency. Flag for review. |
| CTA                        | Black pill 20/14 padding, centered, top:901.                                                                                                                                                                                                                                |

#### Animation

- Reveal fade-up stagger: eyebrow → H2 → paragraph → cards (sequential 0.05s) → CTA.
- No hover effect on cards (they're informational, not links).

---

### §3.4 — Value-Added Services grid (audited) ✅ — **NEW component, NOT shared with M3 accordion**

Critical finding: M4 service detail pages render Value-Added as a **static 4-column × 2-row grid**, not the M3 services-page accordion. Same data source (`VALUE_ADDED_SERVICES`), different visual treatment. Build a new `ValueAddedGrid` component alongside the existing `ValueAddedAccordion`.

#### Desktop (`345:8693`)

| Element       | Value                                                                                                                                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame         | `1600 × 1000` `bg #f5f5f5`.                                                                                                                                                                                                                                    |
| Heading block | Centered. Gray pill (PT Sans Bold 12 white tracking 0.72) "VALUE-ADDED SERVICES" at `top:129`. H2 below: `Beyond Standard Logistic. / Extra Support, Every Step.` **Inter Tight Black 54 / line-height 66 ink uppercase**, top:180.                            |
| Grid          | 4 × 2 cards. Each card `342 × 250`, `bg-white border 1px #f5f5f5`. Page padding-x 80. Card row 1: `top:347`. Card row 2: `top:621`. **Card horizontal positions: 80 / 446 / 812 / 1178** (gap = `446-(80+342) = 24px`). Vertical gap = `621-(347+250) = 24px`. |
| Card anatomy  | Red icon (~48×48) at `left:34 top:38` (relative to card top-left). Label below at `left:34 top:108`, **Inter Tight SemiBold 20 ink uppercase line-height 50**. Description at `left:34 top:144`, **PT Sans Regular 16 / line-height 27 ink**, max-width 274.   |
| Icon style    | Each icon is a **red line illustration on transparent bg** (helicopter, crane, box, briefcase, etc.) — distinct from the M3 accordion thumbnails (which were full-photo). New asset set, see §4 for asset URLs.                                                |

#### Mobile (`529:8669`)

| Element       | Value                                                                                                                                                                                                                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame         | `~430 × 1110` `bg #f5f5f5`.                                                                                                                                                                                                                                                                              |
| Heading block | Centered. Gray pill at `top:44`. H2 `Inter Tight Black 24 / lh 34 ink uppercase`, 2 lines. Top:88.                                                                                                                                                                                                       |
| Grid          | **2 × 4** cards. Each card `185 × 220`, `bg-white border 1px #f5f5f5`. Page padding-x 23. Card columns at left:23 / 222 (gap 14). Row tops: `187 / 417 / 647 / 877`. Vertical gap 10.                                                                                                                    |
| Card anatomy  | Red icon (~24×24) at `left:17 top:25` (relative to card). Label below at `left:17 top:65`, **Inter Tight SemiBold 16 / line-height 20 ink uppercase** (often wraps to 2 lines, e.g. "EQUIPMENT / RENTAL"). Description at `left:17 top:115`, **PT Sans Regular 14 / line-height 22 ink**, max-width 152. |

##### Per-card content (audited from `345:8693`)

These descriptions are **shorter than the M3 accordion's full Ferry-Flight blurb**. Add as a new `shortDescription` field on `ValueAddedService` for use only by this M4 grid.

| #   | Label                  | Short description                                                                           |
| --- | ---------------------- | ------------------------------------------------------------------------------------------- |
| 01  | EQUIPMENT RENTAL       | Lifting tool, transport saddle and other shipping kits available for rental                 |
| 02  | AOG                    | Grounded aircraft? We arrange parts and engineers to restore service fast.                  |
| 03  | OBC                    | Our hand-carry team ensures supervised transport and secure delivery of critical aeroparts. |
| 04  | FERRY FLIGHT CLEARANCE | import and export custom clearance of Ferry flight in major countries                       |
| 05  | CUSTOMS BROKERAGE      | We connect you with expert customs brokers for smooth import clearance at destination.      |
| 06  | CRATES MANUFACTURING   | We source bespoke crates to safely transport blades and accessories                         |
| 07  | SHRINK WRAPPING        | Shrink-wrapping services to protect and preserve your helicopter during transport.          |
| 08  | CARGO INSURANCE        | We prioritise protecting high-value cargo from loss, damage, or risk during transit.        |

#### Animation

- Mount: Reveal fade-up stagger across cards (4 columns desktop = stagger 0.04s × i; 2 columns mobile = stagger 0.04s × i).
- No hover state in Figma. Add a subtle `border-ink/15` + `shadow-sm` on hover as a polish touch (matches landing-page convention).

#### Interaction note

The cards in the desktop frame have no link target. Treat them as **informational tiles**, not links. (If we add per-service-detail-page routes for value-added services later, expose them as anchors with focus rings.)

---

### §3.5 — Projects Showcase strip (audited) ✅ — **REUSE existing home `ProjectsMosaic`**

**Critical discovery (2026-05-06):** the home page already renders this exact section as `src/components/sections/home/ProjectsMosaic.tsx`, backed by `SHOWCASE_TILES` in `src/lib/constants.ts`. The Figma frames `373:2841` (desktop) and `529:8808` (mobile) are **the same component visually** — same brick mosaic, same 8 tiles, same circular corner badge on the "Our Japan Desk" tile, same "View All Showcase" outline CTA linking to `/showcase`.

**Correction on the corner badge (2026-05-06, per user):** the badge is a **play-style click affordance**, not a country flag. Every tile opens a **project detail lightbox modal** when clicked (frame `345:9801` audited — see Appendix B). The current home-page implementation uses `/showcase/japan-flag.svg`; **swap for a play-button asset and wire the click handler as part of Module 7** (filterable showcase page), NOT M4. M4 ships the mosaic as-is.

**Action for M4:**

1. **Promote** `ProjectsMosaic` from `home/` → `_shared/`. Update home `page.tsx` import + delete the old file.
2. **Optional filter prop**: extend `ShowcaseTile` with `relatedServices?: readonly string[]` (defaults to "show on every detail page" if absent). Add an optional `serviceSlug?: string` prop on `ProjectsMosaic`; when set, filter tiles by `tile.relatedServices?.includes(serviceSlug) ?? true`. Home renders without the prop → unchanged. Detail pages pass their slug → curated subset.
3. **No new component** for §3.5. No new `Project` type. No new `PROJECTS` array. Reuse what's there.

> **Important architecture note:** Module 7 (Shipment Showcase) will reuse the **same `ProjectsMosaic`** with filter UI on top. Same data structure (`SHOWCASE_TILES`), same tile component, same render path.

#### Desktop (`373:2841`)

| Element                 | Value                                                                                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame                   | `1600 × ~1370` `bg-surface` (white).                                                                                                                                                                                                                                                                    |
| Heading                 | Gray pill `top:115` "CASE VISUALS" (PT Sans Bold 12 white tracking 0.72). H2 below at `top:166`: `Some of `**`Our Projects`**` and More` — Inter Tight Bold 54 / line-height 66 ink uppercase, "Our Projects" middle word in **Inter Tight Black** for emphasis.                                        |
| Mosaic grid             | 4 columns × 3 rows of mixed tile heights. Page padding-x 75. Tile width: 340. Tile gaps: 26px horizontal (`441-(75+340)=26`, `809-(441+340)=28`, `1175-(809+340)=26`).                                                                                                                                  |
| Tile heights            | Two heights: **560 (tall)** and **300 (short)**. Each column has one tall + one short tile, alternating to create a brick-pattern mosaic. Audited tile placements (all sized 340 wide):                                                                                                                 |
|                         | Col 1: `560 tall` at top:277, then `300 short` at top:863 (gap 26).                                                                                                                                                                                                                                     |
|                         | Col 2: `300 short` at top:277, then `560 tall` at top:603 (gap 26).                                                                                                                                                                                                                                     |
|                         | Col 3: `560 tall` at top:277, then `300 short` at top:863 (gap 26).                                                                                                                                                                                                                                     |
|                         | Col 4: `300 short` at top:277, then `560 tall` at top:603 (gap 26).                                                                                                                                                                                                                                     |
| Tile anatomy            | All tiles `rounded-10`. Background image full-bleed. **Some tiles have a 40% black overlay + label**, others have **no overlay (raw image)**. Labels are **Inter Tight Black 50 / line-height 60 white uppercase**, positioned bottom-left of the tile (~30px inset).                                   |
| Video tile              | One tile carries an `imgGroup6` overlay (a circular play-button asset) + the label "OUR / JAPAN / DESK" — represents a video.                                                                                                                                                                           |
| Per-service vs. shared  | The M4 audit frame shows the **same tile set on every service page** (likely Figma placeholder). In implementation, **each service has its own filtered subset**: tiles where `project.relatedServices` includes the current slug. Module 7 will show the union (with filters).                         |
| "View All Showcase" CTA | Outline pill at `top:1235`, centered. `bg-white border 1px #e4e4e4 rounded-30 padding 30/20`. **PT Sans Regular 14 ink tracking 0.84 capitalize**: `view all showcase`. Links to `/shipment-showcase` (Module 7 page — will exist after M7 ships; before that, link to itself with `#` anchor or omit). |

##### Per-tile content (audited from `373:2841`)

| #   | Tile size | Label                     | Type                                         |
| --- | --------- | ------------------------- | -------------------------------------------- |
| 1   | 340×560   | FROM SWITZERLAND TO INDIA | image                                        |
| 2   | 340×300   | (no label, raw image)     | image                                        |
| 3   | 340×300   | OUR JAPAN DESK            | video (play badge)                           |
| 4   | 340×560   | FROM BELGIUM TO CAMEROON  | image                                        |
| 5   | 340×560   | FROM MYANMAR TO GABON     | image (no overlay, light text on dark photo) |
| 6   | 340×300   | (no label, raw image)     | image                                        |
| 7   | 340×300   | LOADING AT KHALIFA PORT   | image                                        |
| 8   | 340×560   | FROM CHINA TO GUATEMALA   | image (no overlay)                           |

#### Mobile (`529:8808`)

| Element                 | Value                                                                                                                                                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frame                   | `430 × 750` `bg-surface`. **Mobile shows ONLY 4 tiles** (a curated subset) plus the "View All Showcase" CTA.                                                                                                                                    |
| Heading                 | **Black pill (NOT gray)** at `top:40` `bg #101820 padding 6 PT Sans Bold 10 white tracking 0.6 uppercase` "CASE VISUALS". H2 below `top:78` Inter Tight Bold/Black 24 / line-height 34 ink, single line: `Some of `**`Our Projects`**` & More`. |
| Mosaic                  | 2 columns. Tile width 186. Page padding-x 24. Tiles:                                                                                                                                                                                            |
|                         | Col 1: `280 tall` at top:119 ("FROM SWITZERLAND TO INDIA"); `160 short` at top:409 (no label).                                                                                                                                                  |
|                         | Col 2: `160 short` at top:119 ("OUR JAPAN DESK" video); `280 tall` at top:289 ("FROM BELGIUM TO CAMEROON").                                                                                                                                     |
| Tile labels             | **Inter Tight ExtraBold 30 / line-height 40 white uppercase**.                                                                                                                                                                                  |
| "View All Showcase" CTA | Outline pill at `top:593`, centered. Same style as desktop but smaller padding (20/16) and **PT Sans Bold 12 ink tracking 0.72**.                                                                                                               |

#### Animation

- Mount: Reveal fade-up stagger across tiles (top-to-bottom, left-to-right).
- **Hover (desktop)**: tile lifts slightly (`translate-y-1` or `scale-[1.01]`) + overlay darkens. Pure polish — Figma doesn't show a hover state explicitly.
- The "Our Japan Desk" video tile: hovering reveals "Watch video" affordance OR clicking opens a modal/lightbox. **For M4 ship as a click-to-open-modal placeholder** — the actual video player is M9 polish.

#### Data structure

Add to `src/lib/constants.ts`:

```ts
export type Project = {
  slug: string;
  /** Display label, e.g. "FROM SWITZERLAND TO INDIA". */
  label: string;
  /** Full-bleed photo. */
  image: string;
  /** Optional video — when set, tile renders the play badge + may open modal. */
  videoUrl?: string;
  /** Tile aspect on desktop: "tall" (560h) or "short" (300h). */
  shape: "tall" | "short";
  /** Whether to render the 40% overlay (true if image is bright; false if image is already dark). */
  overlay: boolean;
  /** Service slugs this project relates to — used to filter on detail pages. */
  relatedServices: readonly string[];
};

export const PROJECTS: readonly Project[] = [
  /* 8 items audited */
];
```

---

### §3.6 — Quote Form (audited) ✅ — **direct reuse of M3 `QuoteFormShell`**

Frame `345:8798` (desktop) is **byte-identical** to the M3 services-page quote form spec already implemented in `src/components/sections/_shared/QuoteFormShell.tsx`. Frame `529:8356` (mobile) matches the existing M3 mobile spec.

**Implementation:** import and render `<QuoteFormShell photo={...} />` at the bottom of every service detail page. Use the existing services-page Antonov 124 photo (`/quote/services-quote.png`) — the desktop frame shows the same photo asset as M3.

No code changes needed to `QuoteFormShell` itself.

---

### §3.7 — Offices (audited) ✅ — **direct reuse of M3 `OfficesGlobal`**

Frames `889:939` (desktop) + `889:487` (mobile) are **identical** to the M3 offices spec already implemented in `src/components/sections/_shared/OfficesGlobal.tsx`. The desktop layout (4-column glass card with UAE highlighted), mobile (featured-tabs pattern with UAE active), Poppins H2, locations data, divider line — all match.

**Implementation:** import and render `<OfficesGlobal />` after `QuoteFormShell` on every service detail page. No prop changes; no component code changes.

---

### §3.8 — Footer

Reuse existing `src/components/layout/Footer.tsx` from M2 unchanged.

---

## 4 — Design tokens — additions

Hero only — no new tokens needed beyond what M3 already added. The hero uses:

| Token                          | Already in `globals.css`?           |
| ------------------------------ | ----------------------------------- |
| `--color-brand-red`            | ✅                                  |
| `--font-body` (PT Sans)        | ✅                                  |
| `--font-display-alt` (Poppins) | ✅ — used by benefit chip labels    |
| `bg-ink/40` overlay            | ✅ (via Tailwind opacity utilities) |

Custom values that may need a utility:

- `backdrop-blur-[16.8px]` on the benefit chip — Tailwind v4 supports arbitrary values; just inline.
- `bg-[rgba(0,0,0,0.31)]` — same, arbitrary.

No `tokens.css` change required for §3.1. Re-evaluate when §3.2–3.4 specs land.

---

## 5 — Component / reuse map

| Component                              | Location                                                                         | New / Reuse                                   | Notes                                                                                                                                                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Header`                               | `src/components/layout/Header.tsx`                                               | reuse                                         | Identical to M2/M3                                                                                                                                                                                                      |
| `Footer`                               | `src/components/layout/Footer.tsx`                                               | reuse                                         | Identical to M2/M3                                                                                                                                                                                                      |
| `Container`                            | `src/components/sections/_shared/Container.tsx`                                  | reuse                                         |                                                                                                                                                                                                                         |
| `Reveal`                               | `src/components/sections/_shared/Reveal.tsx`                                     | reuse                                         | Scroll-reveal wrapper                                                                                                                                                                                                   |
| `SectionEyebrow`                       | `src/components/sections/_shared/SectionEyebrow.tsx`                             | reuse                                         | `variant="red"` for hero eyebrow                                                                                                                                                                                        |
| `QuoteFormShell`                       | `src/components/sections/_shared/QuoteFormShell.tsx`                             | reuse                                         | M3 visual shell — already shared between home + services                                                                                                                                                                |
| `OfficesGlobal`                        | `src/components/sections/_shared/OfficesGlobal.tsx`                              | reuse                                         | M3 promoted to shared                                                                                                                                                                                                   |
| `ServiceDetailHero`                    | `src/components/sections/service-detail/ServiceDetailHero.tsx`                   | **new**                                       | Renders hero from `Service` record. Driven by `detailEyebrow`, `detailHeroTitle`, `detailHeroImage`, `detailHeroBenefits` (or default chips).                                                                           |
| `ServiceOverview`                      | `src/components/sections/service-detail/ServiceOverview.tsx`                     | **new**                                       | Two-column section. Reads `detailOverview.label / title / paragraphs / image`. Renders the small play-badge overlay if `detailOverview.hasVideoBadge` is true.                                                          |
| `WhenToChoose`                         | `src/components/sections/service-detail/WhenToChoose.tsx`                        | **new**                                       | Image-left + content-right (desktop). Reads `detailWhenToChoose.intro` + `detailWhenToChoose.image` + `detailWhenToChoose.cards[]` (4 items).                                                                           |
| `ValueAddedGrid`                       | `src/components/sections/service-detail/ValueAddedGrid.tsx`                      | **new** (NOT shared with M3 accordion)        | Static 4×2 (desktop) / 2×4 (mobile) grid using `VALUE_ADDED_SERVICES`. Each card renders icon + label + `shortDescription`. **Different visual treatment than M3's `ValueAddedAccordion` — both stay in the codebase.** |
| `ProjectsMosaic`                       | `src/components/sections/_shared/ProjectsMosaic.tsx` (**promoted** from `home/`) | reuse — already exists on home                | Same component, just moved to `_shared/`. Add optional `serviceSlug?: string` prop to filter `SHOWCASE_TILES` by `relatedServices` on detail pages. Home renders unchanged. M7 will wrap this with filter UI.           |
| `BenefitChip` (optional sub-component) | `src/components/sections/service-detail/BenefitChip.tsx`                         | new (only if reused inside hero or elsewhere) | Single chip with icon + label.                                                                                                                                                                                          |

### `Service` type changes (in `src/lib/constants.ts`)

Existing fields: `slug`, `name`, `description`, `image`. Add for M4:

```ts
export type ServiceBenefit = {
  /** "secure-handling" | "global-routes" | "fast-vessel-loading" | "expert-coordination" */
  slug: string;
  label: string;
  /** Path under /public for the chip icon SVG. */
  icon: string;
};

export type Service = {
  slug: string;
  name: string;
  description: string; // existing — stays as services-grid copy
  image: string; // existing — stays as services-grid card photo

  // M4 additions:
  /** Eyebrow text on detail page hero, e.g. "OVERVIEW OCEAN RO/RO". */
  detailEyebrow: string;
  /** H1 lines on the detail page hero. Length 1 or 2. */
  detailHeroTitle: readonly [string] | readonly [string, string];
  /** Detail-page hero background photo (full-bleed). */
  detailHeroImage: string;
  /** 4 benefit chips on the hero. May be the same array on every service (see §3.1 open question). */
  detailHeroBenefits: readonly ServiceBenefit[];

  // M4 — overview section (§3.2)
  detailOverview: {
    /** Gray pill label e.g. "Roll-On/Roll-Off Ocean Transport". */
    label: string;
    /** H2 broken into 3 lines. */
    title: readonly [string, string, string];
    /** Two paragraphs with optional bold runs. */
    paragraphs: readonly OverviewParagraph[];
    /** Section photo (right column desktop, top mobile). */
    image: string;
    /** When true, renders the play-badge SVG overlay on top of the photo. */
    hasVideoBadge?: boolean;
  };

  // M4 — when-to-choose section (§3.3)
  detailWhenToChoose: {
    /** H2 broken into 2 lines. Defaults to "When to Choose / This Service" globally. */
    title?: readonly [string, string];
    /** Intro paragraph (above the cards). */
    intro: string;
    /** Section photo (left column desktop, top mobile). */
    image: string;
    /** 4 cards. Length === 4. */
    cards: readonly { title: string; subtitle: string }[];
  };

  // M4 — related projects (§3.5) is derived: filter PROJECTS by relatedServices
  // No per-Service field needed; the filter happens at render time.
};

export type OverviewParagraph = {
  /** Plain text segments + bold runs interleaved, in order. */
  parts: readonly OverviewSegment[];
};

export type OverviewSegment = { kind: "regular"; text: string } | { kind: "bold"; text: string };

// Already locked in §3.4: extend ValueAddedService with shortDescription
// (for the M4 grid). Existing description+detail keep powering the M3 accordion.
export type ValueAddedService = {
  slug: string;
  label: string;
  thumb: string;
  /** NEW (M4) — short copy used by the static grid on detail pages. */
  shortDescription: string;
  /** Icon used by M4 grid (red line illustration on transparent bg). */
  iconM4: string;
  /** Existing M3 fields below. */
  description?: string;
  detail?: { leadBold: string; leadRest: string; midBold: string; tail: string };
};

// NEW (M4) — projects data structure shared with M7
export type Project = {
  slug: string;
  label: string; // "FROM SWITZERLAND TO INDIA"
  image: string;
  videoUrl?: string; // when set, render play badge + open in modal
  shape: "tall" | "short"; // 560h vs 300h on desktop
  overlay: boolean; // 40% black overlay on top of image
  relatedServices: readonly string[]; // service slugs this project applies to
};

export const PROJECTS: readonly Project[] = [
  /* 8 audited from 373:2841 */
];

// `detailHeroBenefits` defaults to this shared array when a service omits it.
// Override per-service only if/when the client requests different chips.
export const SHARED_DETAIL_HERO_BENEFITS: readonly ServiceBenefit[] = [
  {
    slug: "secure-handling",
    label: "Secure Handling",
    icon: "/services/detail/icons/secure-handling.svg",
  },
  {
    slug: "global-routes",
    label: "Global Routes",
    icon: "/services/detail/icons/global-routes.svg",
  },
  {
    slug: "fast-vessel-loading",
    label: "Fast Vessel Loading",
    icon: "/services/detail/icons/fast-vessel-loading.svg",
  },
  {
    slug: "expert-coordination",
    label: "Expert Coordination",
    icon: "/services/detail/icons/expert-coordination.svg",
  },
] as const;
```

### Image assets needed

Pull from Figma at build time (asset URLs from the audit have 7-day expiry — re-pull via MCP if expired). All asset IDs are from the 2026-05-06 audit run; re-call `get_design_context` on the matching nodeId from §2 if expired.

#### Hero (§3.1) — 6 photos

`/public/services/detail/<slug>-hero.webp` (~1600×705 source, ~200KB each WebP):

- `ocean-roro` → `4f78d866-e20f-4ffe-a0a0-3df05ba86cdd`
- `ocean-lolo` → `de0c9015-68b5-4724-bbc8-80846b0a66bf`
- `ocean-fcl` → `10eb07bd-b451-45f8-a819-0a32772c9f1d`
- `air-commercial` → `b77b2017-e739-4b03-a9eb-bfaeb2673fde`
- `air-chartering` → `bce75f20-e560-4ae4-9221-aa0690feb320`
- `road-freight` → `c7461323-f3c0-4a3c-9845-e7946a9a477a`

#### Hero benefit icons (§3.1) — 4 SVGs

`/public/services/detail/icons/<name>.svg` (~24px each):

- `secure-handling.svg` → `336bda92-b3d2-4034-aff4-84d889a3ee2b`
- `global-routes.svg` → `3e336a17-75c6-4483-ac43-6ad2a06ddda6`
- `fast-vessel-loading.svg` → `d9100eab-67dc-4e3f-b18c-a9cb03dc33ce`
- `expert-coordination.svg` → `4b7a012d-6260-432d-b6eb-928afaca3139`

#### Overview (§3.2) — 1 photo per service + 1 play-badge SVG

For RO/RO desktop:

- Photo `/public/services/detail/<slug>-overview.webp` (708×740) → RO/RO asset `237ff2f8-4e91-4e45-915a-958d4fa963ed`
- Play-badge SVG `/public/services/detail/play-badge.svg` (113×113) → asset `deb1e4fd-a80c-4f20-bec2-81e020b744be`. **Single asset reused on every detail page.**

For RO/RO mobile photo (382×338): asset `6ee82dec-901e-4fd3-96c7-a341ea80154b`. **Use mobile-optimised crop if available; otherwise the desktop photo with `sizes` will serve.**

The other 5 services' overview photos are not yet provided — the autonomous session must request frame URLs OR fall back to the hero photo with `// TODO`.

#### When to Choose (§3.3) — 1 photo per service + 1 verify-badge SVG

For RO/RO desktop: photo asset `61313e35-2f62-4b71-8765-3e5c64ba150e`. Verify-badge red icon SVG `/public/services/detail/verify-red.svg` → asset `8317db14-46e3-4409-9f3a-4bf3f6df0a4b`. **Single icon reused on all 4 cards** within this section, on every detail page.

For RO/RO mobile: photo `73d39922-34bb-4324-8f2b-3db0e263bf30` (with secondary `3beb704b-c62d-48f4-bfc0-55dc8a567b1b`). Mobile verify icon `d0fc5a06-f5c0-4bec-af66-913af88f8e88`.

#### Value-Added grid (§3.4) — 8 red line-illustration icons

`/public/services/detail/value-added/<slug>.svg` (each 24-48px, transparent bg, `#e40c28` stroke):

Desktop versions (~48px):

- `equipment-rental` → `aa1d74fe-a9bc-4f65-9697-0e2050cc7e65`
- `aog` → `eca08d4f-8a43-4f28-a71e-e643c01a4284`
- `obc` → `3e8b386d-0048-4468-bdab-deb694e2fb2e`
- `ferry-flight-clearance` → `9e6641c5-7bfe-4cfe-a71b-d0b03aba7b47`
- `customs-brokerage` → `e1c47f76-ab94-47be-8a3d-bb0e7c0ecbef`
- `crates-manufacturing` → `0afcef77-4596-4258-8f5d-2d416dca55a6`
- `shrink-wrapping` → `0c3a7dcf-b485-4cf0-8837-9052643bc803`
- `cargo-insurance` → `dd9b2d85-bf03-491a-b658-912245eb4d7d`

Mobile versions (~24px) — visually similar; pull if size differs noticeably:

- `1fbfa67e-88ea-4a57-865c-9788cf16a391`, `fa072422-0741-4a55-85b4-a4afb8cd9556`, `ad49845b-0498-48b5-8d0a-01728da187df`, `5871c5ba-fd05-4028-9c43-cdd273cea112`, `8f0d7b11-ba51-4657-b250-669244384e8b`, `e0255e48-eb69-4233-bc9e-097d7fa2c77c`, `ee2c7ef7-ee56-45b1-be14-5441254949c4`, `8f2ba1de-f3ba-4962-8b13-93d2edc5b51e`

#### Projects Showcase (§3.5) — 8 project photos + play-badge

`/public/projects/<slug>.webp`:

- `from-switzerland-to-india` → `e45d658e-ce35-47b6-99b3-b9e0fbae890f`
- `project-2-no-label` → `8f0b9d65-e0b6-437b-8c03-119ef796a25c`
- `our-japan-desk` (video) → `ce81007d-329e-46ba-b97f-64a2d68dd0cd` + play-badge `57aa2a68-7282-4bcf-aaca-e32dcfa61e6b`
- `from-belgium-to-cameroon` → `37b5b3cf-c478-47d6-ae53-4d0c4e7c27b7`
- `from-myanmar-to-gabon` → `5f633730-8027-4489-8f9b-1a2596b11428`
- `project-6-no-label` → `ca83062a-721d-4fce-aa37-e50bde3a928a`
- `loading-at-khalifa-port` → `96b3579d-fd3b-448d-9e8c-19ec30f74a06`
- `from-china-to-guatemala` → `353b44d0-8a58-4d34-be88-7e582e3f290d`

Pull command (one example):

```
curl -L -o public/services/detail/ocean-roro-hero.webp \
  "https://www.figma.com/api/mcp/asset/4f78d866-e20f-4ffe-a0a0-3df05ba86cdd"
```

Pull command (one example):

```
curl -L -o public/services/detail/ocean-roro-hero.webp \
  "https://www.figma.com/api/mcp/asset/4f78d866-e20f-4ffe-a0a0-3df05ba86cdd"
```

**The autonomous session should re-pull each asset when implementing — do not assume the URLs above are still live after 2026-05-13.** If expired, re-call `get_design_context` on the matching nodeId from §2.

---

## 6 — Open / pending content questions (BLOCKING — must resolve before build past §3.1)

The autonomous session **must stop after building the hero** and surface these to the user. Do not invent designs for missing sections.

### 6.1 — Missing Figma frames

**All Ocean RO/RO sections audited as of 2026-05-06.** Per-service variants for the other 5 services (LO/LO, FCL, Road Freight, Air Commercial, Air Chartering) are NOT individually audited — assumption is that **layout is shared**, only **content (eyebrow label, H2, paragraphs, when-to-choose cards, photos)** differs per service. This matches the hero pattern.

**If per-service Overview / When-to-Choose visuals diverge from RO/RO (e.g. Air Chartering swaps the layout entirely), the autonomous session will need additional frames.** Default assumption: layout is templated, content is per-service.

### 6.2 — User-confirmed answers (2026-05-06)

| Question                                                                  | User's answer                                                                                                                                                                                             |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Do the 4 benefit chip labels really stay identical across all 6 services? | **Keep them identical** as shown in Figma. Make the field optional/dynamic in `Service` type so a service can override its chips later, but **default to the four shared labels** on all services for M4. |
| Do detail pages end with `QuoteFormShell` + `OfficesGlobal`?              | **Yes.**                                                                                                                                                                                                  |
| Hero overlay 30% on Ocean FCL vs 40% elsewhere — intentional?             | **Use 40% uniformly.** Treat the FCL frame as a Figma inconsistency.                                                                                                                                      |
| Are the 6 hero photos final?                                              | **Use the Figma photos as final.** Re-pull via MCP at build time if asset URLs expired.                                                                                                                   |
| Related Projects data source                                              | **Hardcode in `constants.ts` now (M4).** M7 will reuse the same data structure when it builds the showcase. No "TBD" / "coming soon" stub.                                                                |

### 6.3 — Resolved (cross-ref `docs/DECISIONS.md` once committed)

- [x] **Hero is identical structure across all services** — only eyebrow text, H1, and photo vary. Driven by a single component reading the `Service` record.
- [x] **Benefit chips on mobile scroll horizontally** — implementation uses `overflow-x-auto` + `scroll-snap-x mandatory`.
- [x] **Header reuses existing M2/M3 component** — no service-detail override.
- [x] **No new fonts or tokens needed for the hero** — Poppins + PT Sans + Inter Tight already registered.
- [x] **All 6 hero frames audited** — Ocean RO/RO `345:8253`, Ocean LO/LO `589:206`, Ocean FCL `593:1201`, Road Freight `681:19`, Air Commercial `681:530`, Air Chartering `681:1030`. Mobile RO/RO `529:8213` is the canonical mobile reference; other services inherit the structure with their own H1 / eyebrow / photo.
- [x] **Benefit chip labels stay shared across all 6 services**; `detailHeroBenefits` field is optional on `Service` with the shared default applied at render time.
- [x] **Related Projects: hardcoded data in `constants.ts` for M4.** M7 reads the same structure; no separate stub state.
- [x] **Detail page bottom = `QuoteFormShell` + `OfficesGlobal` reused from M3.**
- [x] **Value-Added section is a static 4×2 grid in M4** (per `345:8693` audit) — distinct from M3's `ValueAddedAccordion`. Build a NEW `ValueAddedGrid` component; both stay in the codebase.
- [x] **Projects Showcase strip is M7-aligned** — promote to `_shared/`. Module 7 wraps it with filter UI; M4 detail pages render a service-filtered subset.
- [x] **Quote form section in M4 = identical reuse** of `QuoteFormShell` (no prop changes).
- [x] **Offices section in M4 = identical reuse** of `OfficesGlobal` (no prop changes).
- [x] **Page section order on every detail page**: Hero → Overview → When-to-Choose → Value-Added Grid → Projects Showcase → Quote Form Shell → Offices → Footer.

### 6.4 — User confirmations (2026-05-06, second round) — locked

| Item                                                                               | User answer                                                                                                                                                                                                                                                                         | Implementation note                                                                    |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Ocean FCL eyebrow shows "Lift-on / Lift-off Shipping" — Figma copy-paste accident? | **Change it.** Use a sensible replacement (proposed: `Full Container Load Shipping`). Add a `// TODO: client review of FCL eyebrow text — replaced "Lift-on / Lift-off Shipping" Figma value with "Full Container Load Shipping" pending content review` comment in `constants.ts`. | Don't ship the obviously-wrong copy. Replace + flag for review.                        |
| Air Chartering Overview paragraphs duplicated from Air Commercial in Figma         | **Ship as-designed for now.** Keep paragraphs identical to Air Commercial; add `// TODO: client review of Air Chartering overview copy — Figma duplicates Air Commercial text` comment.                                                                                             | PM/client revises later.                                                               |
| When-to-Choose intro paragraph mentions "Ro/Ro carriers" on every service page     | **Ship as-designed.** Add `// TODO: client review of WTC intro — RO/RO-specific copy used as global default` comment in the `SHARED_WHEN_TO_CHOOSE` constant.                                                                                                                       | Same approach.                                                                         |
| Corner badge on "Our Japan Desk" tile in `ProjectsMosaic`                          | **Currently `/showcase/japan-flag.svg`. Treat as M7 fix.** M4 ships unchanged.                                                                                                                                                                                                      | Module 7 swaps to a play-button SVG and wires the lightbox click handler (Appendix B). |

### 6.5 — Remaining open content questions (non-blocking)

| Question                                                                                                                                                                                                    | Default if user doesn't reply                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-service Overview paragraphs (P1, P2) for LO/LO, FCL, Road Freight, Air Commercial, Air Chartering. The RO/RO copy is hardcoded; copy for the other 5 needs to be drafted/sourced from the client or PM. | **Reuse RO/RO placeholder copy** with a clear `// TODO: per-service copy from client review` flag in `constants.ts`. Flag to PM.                                                                                                  |
| Per-service "When to Choose" 4-card content for the other 5 services.                                                                                                                                       | Same — reuse RO/RO placeholders with a `// TODO` flag.                                                                                                                                                                            |
| Per-service Overview + When-to-Choose photos (other 5 services).                                                                                                                                            | Use the hero photo for the same service as a placeholder; flag for design review.                                                                                                                                                 |
| Mobile When-to-Choose card order (RO/RO frame shows reversed order vs. desktop).                                                                                                                            | Ship desktop order on mobile too.                                                                                                                                                                                                 |
| `PROJECTS` content + per-tile `relatedServices` mapping.                                                                                                                                                    | Pull the 8 projects audited from `373:2841` into `constants.ts`. Map each to relevant service slugs based on label hints (e.g. "Khalifa Port" → ocean-related, "Switzerland to India" → likely air). Flag for PM accuracy review. |
| §3.5 video tile ("Our Japan Desk") — link target / actual video.                                                                                                                                            | Render as a click-to-modal stub for M4; M9 polish wires real video player.                                                                                                                                                        |

---

## 7 — Locked decisions (append to `docs/DECISIONS.md` once content questions resolve)

1. **`Service` type extended in `constants.ts`** with `detailEyebrow`, `detailHeroTitle`, `detailHeroImage`, `detailHeroBenefits` (all M4) — no Sanity addition. Detail copy is hardcoded per `CLAUDE.md` §3.3.
2. **Mobile benefits strip = horizontal scroll-snap carousel**, NOT wrapped grid. Matches Figma layout where chips overflow the 430px frame.
3. **Single `ServiceDetailHero` component** for all 6 services — no per-service hero variants.
4. **Hero overlay normalised to 40%** on desktop, 36% on mobile (Ocean FCL frame's 30% is treated as a Figma inconsistency).
5. **No new tokens for §3.1** — uses existing M3 token set + arbitrary Tailwind values for backdrop-blur and rgba overlay.

---

## 8 — Acceptance checklist (run before claiming M4 done)

### Hero (§3.1)

- [ ] All 6 services render with the correct eyebrow + H1 + photo + 4 benefit chips
- [ ] Mobile chips scroll horizontally with snap; first chip flush left at 24px page padding
- [ ] Desktop overlay 40%, mobile overlay 36% — verified at all 4 widths
- [ ] Header reuses existing `Header` component (no per-page override)
- [ ] Reveal fade-up stagger plays once on scroll-in
- [ ] Hero photo loaded with `<Image priority sizes="100vw">`; LCP < 2.0s on 4G

### Overview (§3.2)

- [ ] All 6 services render the overview with eyebrow + 3-line H2 + 2 paragraphs (with bold runs preserved) + CTA + photo
- [ ] Desktop image is on the right; mobile image is stacked on top
- [ ] Play-badge overlay renders on desktop when `hasVideoBadge` is true
- [ ] Reveal stagger plays on scroll-in

### When to Choose (§3.3)

- [ ] All 6 services render with 4 cards, each with title + subtitle
- [ ] Image-left + content-right on desktop; stacked on mobile
- [ ] 2×2 card grid on desktop; 1×4 stack on mobile
- [ ] Verify-red badge icon renders on every card

### Value-Added grid (§3.4)

- [ ] 8 cards render in 4×2 grid on desktop, 2×4 on mobile
- [ ] Red line-illustration icons + label + short description visible always (no accordion)
- [ ] Cards on hover get a subtle border + shadow polish

### Projects Showcase (§3.5)

- [ ] Mosaic of 8 tiles on desktop in brick pattern (560 + 300 alternating)
- [ ] Mosaic of 4 tiles on mobile (2 columns)
- [ ] "View All Showcase" CTA links to `/shipment-showcase` (or `#` if M7 hasn't shipped)
- [ ] Video tile renders play badge; clicking opens placeholder modal
- [ ] Hover lifts tile + darkens overlay (desktop polish)
- [ ] Each detail page shows tiles filtered by `relatedServices`

### Quote Form (§3.6) + Offices (§3.7)

- [ ] `<QuoteFormShell />` rendered with services-page Antonov 124 photo prop
- [ ] `<OfficesGlobal />` rendered immediately after
- [ ] Verified at all 4 widths — pixel-identical to the M3 services page

### Page-level

- [ ] All 6 routes generated by `generateStaticParams`
- [ ] Old M3 stub copy removed (the "Coming in Module 4" message)
- [ ] `<QuoteFormShell />` + `<OfficesGlobal />` rendered at the bottom (assuming default in §6.2)
- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean
- [ ] Lighthouse Performance ≥ 95 on `/services/ocean-roro` (representative slug)
- [ ] Keyboard navigation: focus rings visible on benefit chips and CTA (if any)
- [ ] No client-side fetches to Sanity (entire route is static)
- [ ] `CLAUDE.md` §2 "Currently working on" updated
- [ ] `docs/DECISIONS.md` has any new non-obvious calls appended

---

## Appendix A — Per-service content (audited 2026-05-06)

All copy below is **dynamic** — lives in `src/lib/constants.ts` extending the `Service` type per §5. Client can edit any string without touching component code.

### A.1 — Overview (§3.2) per service — DIFFERENT per service

The audit confirmed every service has its **own** eyebrow label, H2, and paragraphs. None are shared.

#### `ocean-roro` (frame `345:8753`)

- **Eyebrow label**: `Roll-On/Roll-Off Ocean Transport`
- **H2 lines** (3): `Fast, Secure` / `Helicopter Transport` / `Using RoRo Vessels.`
- **Paragraph 1**: `Shipped on a `**`MAFI Roll Trailer`**`or`**`towed inside the vessel`**`, helicopters are stowed and transported safely under deck. With Ro/Ro vessels, loading and unloading is fast and efficient, saving valuable time on the transportation journey.`
- **Paragraph 2**: `Heli Skycargo contracts with the very best global Ro/Ro carriers, including as NYK, Höegh Autoliners, Wallenius Wilhelmsen, `**`MOL (Mitsui O.S.K. Lines)`**`, K Line, Armacup, `**`EUKOR`**`, the Grimaldi Group, Bahri Shipping and many others.`

#### `ocean-lolo` (frame `589:250`)

- **Eyebrow label**: `Lift-on / Lift-off Shipping`
- **H2 lines** (2): `Container & Heavy` / `Lift Shipping Options`
- **Paragraph 1**: `Alternatively, helicopters can be transported using a `**`Lift-On/Lift-Off method`**`– either via container ships or a multipurpose`**`heavy lift vessel`**`. The cargo is lifted on and off the shipping vessel by crane, before being safely stored and secured for travel.`
- **Paragraph 2**: `Though this method adds some time to your transportation schedule to account for loading and unloading, it is ideal for situations where the destination or departure port is not served by Ro/Ro carriers, or where the Ro/Ro carrier schedule does not meet your requirements.`

#### `ocean-fcl` (frame `593:1245`)

- **Eyebrow label**: `Lift-on / Lift-off Shipping` ⚠️ _likely Figma copy-paste accident — flag for content review; should probably read "Full Container Load Shipping" or "FCL Container Transport"._
- **H2 lines** (3): `Dedicated & Secure` / `Full Container Ocean` / `Solutions`
- **Paragraph 1**: `Whether partially or fully disassembled, helicopters can be transported using 40' high cube, 40' open-top, or 40' flat rack containers.`
- **Paragraph 2**: _(none — FCL has only one paragraph)_

#### `road-freight` (frame `681:63`)

- **Eyebrow label**: `Road Freight Transport`
- **H2 lines** (2): `End-to-End` / `Road Freight Services`
- **Paragraph 1**: `Whether the helicopter is being exclusively transported by road, or it is just a small part of the wider journey, Heli Skycargo can arrange road freight solutions including road survey and road permit application to meet your exact requirements.`
- **Paragraph 2**: `Our carefully selected trucking and haulage companies are on standby ready to serve, and we have exclusive contracts around the world with specialist freight companies offering exceptional transports using air ride and hydraulic trucks.`

#### `air-commercial` (frame `681:574`)

- **Eyebrow label**: `Air Cargo`
- **H2 lines** (3): `Reliable & Flexible` / `Commercial Air Cargo` / `Transport`
- **Paragraph 1**: `If you have a flexible or more generous deadline for your shipping journey, then commercial air transportation is an excellent option. Depending on the departure and arrival locations and the carrier flight schedule, door-to-door transit time typically ranges from just 7 to 10 days.`
- **Paragraph 2**: `Once dismantled, the helicopter is securely positioned on 20" aircraft pallets and loaded on board B747-400F or modern B747-8F aircraft. We arrange transportation with only the most reputable commercial cargo freighters, including Cargolux, CARGOLUX, Korean Air, Silk Way West Airlines, China Airlines, Cathay Pacific, and Singapore Airlines.`

#### `air-chartering` (frame `681:1074`)

- **Eyebrow label**: `Air Charter Transport`
- **H2 lines** (3): `Fast-Response` / `Aircraft Charter` / `Transport Solutions`
- **Paragraph 1**: ⚠️ **Same copy as Air Commercial in Figma** (`If you have a flexible…`) — **likely placeholder**. Flag for content review; Air Chartering should probably emphasise speed/urgency/AN-124/IL-76 fleet rather than commercial transit times.
- **Paragraph 2**: ⚠️ **Same copy as Air Commercial in Figma** — same flag.

> **Recommended autonomous-session behaviour for Air Chartering:** ship with the duplicated copy as the Figma shows it, with a `// TODO: confirm Air Chartering overview copy with client` comment in `constants.ts`. PM/client review will replace.

### A.2 — When to Choose (§3.3) per service — IDENTICAL across all 5 audited

Confirmed by direct frame comparison: the intro paragraph, H2, and 4 cards are **byte-identical** in `345:8763`, `589:260`, `593:1255`, `681:72`, `681:583`, `681:1084`. The autonomous session can hardcode these once and apply universally — but **per user instruction (2026-05-06), still expose them as per-service `Service.detailWhenToChoose` fields** with a shared default, so any service can override later.

- **Eyebrow**: `Our Values` (literal, all services)
- **H2 lines** (2): `When to Choose` / `This Service`
- **Intro paragraph**: `Though this method adds some time to your transportation schedule to account for loading and unloading, it is ideal for situations where the destination or departure port is not served by Ro/Ro carriers, or where the Ro/Ro carrier schedule does not meet your requirements.` ⚠️ _This text is RO/RO-specific ("not served by Ro/Ro carriers") despite appearing on every service page — almost certainly a Figma placeholder. Flag for content review._
- **4 cards** (in this order, even on mobile):
  1. **Long-Distance** / International Transport
  2. **Cost-Efficient** / Alternative To Air Freight
  3. **Safe Transport For** / Wheeled Helicopter Platforms
  4. **Ideal For Scheduled** / Delivery Timelines

### A.3 — Implementation pattern in `constants.ts`

```ts
// Shared default for "When to Choose" — all 5 audited frames are identical.
const SHARED_WHEN_TO_CHOOSE = {
  title: ["When to Choose", "This Service"] as const,
  intro:
    "Though this method adds some time to your transportation schedule to account for loading and unloading, it is ideal for situations where the destination or departure port is not served by Ro/Ro carriers, or where the Ro/Ro carrier schedule does not meet your requirements.",
  cards: [
    { title: "Long-Distance", subtitle: "International Transport" },
    { title: "Cost-Efficient", subtitle: "Alternative To Air Freight" },
    { title: "Safe Transport For", subtitle: "Wheeled Helicopter Platforms" },
    { title: "Ideal For Scheduled", subtitle: "Delivery Timelines" },
  ],
} as const;

// Each Service then carries its own detailOverview + detailWhenToChoose.
// detailWhenToChoose typically just spreads SHARED_WHEN_TO_CHOOSE plus the
// per-service hero photo for the section image. Override individual fields
// only when the service genuinely diverges.
```

This satisfies the user's guidance (2026-05-06): _"text are same in all but lets make them dynamic so if client needed change we change easily."_

### A.4 — Asset URLs for the new per-service section photos

Already captured per service in §4. The audit run on 2026-05-06 produced fresh asset URLs for each Overview and When-to-Choose photo:

| Service          | Overview photo (right column desktop)  | When-to-Choose photo (left column desktop) |
| ---------------- | -------------------------------------- | ------------------------------------------ |
| `ocean-roro`     | `237ff2f8-4e91-4e45-915a-958d4fa963ed` | `61313e35-2f62-4b71-8765-3e5c64ba150e`     |
| `ocean-lolo`     | `7b556c1b-7cc1-4818-9a2c-ae1a57dcf624` | `25840836-379b-4ad3-a075-ee1131b53508`     |
| `ocean-fcl`      | `d0e7b918-98ec-4e05-8119-b651006f98bb` | `6715faed-7d58-4cc3-bb77-d0b6e8888d70`     |
| `road-freight`   | `9269209e-edb4-4744-a454-c9adc5f649ce` | `23543db9-4364-4764-acd9-8bb1cbe4c785`     |
| `air-commercial` | `f9098cfc-e2eb-41ac-8112-813db4ed65ee` | `4f16d967-62b8-4934-9733-99e4ad2fb6a4`     |
| `air-chartering` | `44b8e9cd-d455-4e1e-8c27-dc72a853688d` | `e1631cae-1275-48af-93cd-5be02cf077ec`     |

The play-badge SVG (decorative overlay on Overview photos) is shared across all 6 services — pull once and reuse: `deb1e4fd-a80c-4f20-bec2-81e020b744be` (RO/RO frame). Re-pull from Figma if asset URLs expired.

The verify-red badge SVG (4 cards on When-to-Choose) is also shared across services.

---

## Appendix B — Project Lightbox Modal (Module 7 deferred)

**Frame**: `345:9801` (audited 2026-05-06).
**Status**: NOT implemented in M4. Reference for M7. Captured here so the data model in M4 includes the right fields.

When the user clicks any tile in `ProjectsMosaic`, this modal opens. M4 ships the mosaic without click handlers (no-op or TODO); M7 wires the modal.

### Desktop layout (1596 × 2118 frame, modal panel 1439 × 700 centered at left:79 top:87)

- **Backdrop**: `bg-#101820 opacity-50` covers the page; modal sits above it.
- **Two-column white panel** (`bg-white`, no rounded corners visible at this scale):
  - **Left column (707 × 700)**: project photo full-bleed, with **prev / next arrow circles** (`#e40c28` red filled circle, white arrow inside) at left:`~7%` and right:`~42%` (vertically centered roughly at 19.5% from modal top — i.e. mid-height of the photo). 3-dot pagination indicator near the photo bottom (`/showcase/dots-78x12.svg`).
  - **Right column (~732 × 700)**:
    - Title block: `From Italy To Gabon` (Inter Tight Bold 32) + `Aircraft: ` + **red `Airbus H125`** (Inter Tight Bold 40 mixed weight). Position top:152.
    - Three-column meta band at top:248 (140 below title): `Route: France → Brazil` / `Transport Mode: Ocean Freight (RoRo)` / `Timeline: 18 Days`. Each: PT Sans Regular 13 ink for label, PT Sans Regular 15 red for value.
    - Three text blocks: `THE CHALLENGE` / `THE SOLUTION` / `THE RESULT` — each as **Inter Tight Bold 20 ink uppercase** heading (line-height 80) followed by a **PT Sans Regular 15 ink** body paragraph max-width 585. Top: 334 / 456 / 576.
    - **Red CTA pill** at top:664: `bg #e40c28 rounded-30 padding 30/20 PT Sans Bold 14 white tracking 0.84 capitalize: Request Quote`.

### Mobile layout (382 × 790 panel)

- Same two-block structure but **stacked**: photo on top (382×345), then content below.
- Prev/next arrows overlaid on the photo (smaller).
- 3-dot indicator below the photo.
- Title with red aircraft model on top of content stack.
- Meta band drops to PT Sans Regular 11/14.
- Text blocks at smaller sizes (Inter Tight Bold 16 headings, PT Sans Regular 14 body).
- Red CTA pill smaller padding 20/14, PT Sans Bold 12.

### Animation / behaviour

- Open: backdrop fade-in + modal scale-in (from 0.96 → 1.0 over ~200ms ease-out).
- Close: ESC, backdrop click, or close button (close button position not in this frame — needs separate audit if visible elsewhere).
- Prev / next: cycle through `SHOWCASE_TILES` filtered by current view.
- Body scroll lock while open.

### Data model implications for M4

To prepare for M7, **extend `ShowcaseTile` in `constants.ts`** with the modal fields **right now** (M4) so the data is ready when M7 wires the modal:

```ts
export type ShowcaseTile = {
  // ... existing fields (id, src, alt, label, showFlag) stay
  modal?: {
    aircraft: string; // e.g. "Airbus H125"
    route: string; // e.g. "France → Brazil"
    transportMode: string; // e.g. "Ocean Freight (RoRo)"
    timeline: string; // e.g. "18 Days"
    challenge: string;
    solution: string;
    result: string;
  };
  /** Service slugs this project applies to — for /services/[slug] filtering. */
  relatedServices?: readonly string[];
};
```

M4 populates `modal` and `relatedServices` for the existing 8 `SHOWCASE_TILES` (placeholder content where unknown — flag for content review). M4 does NOT render the modal. M7 reads these same fields.

### Reference frames

- Modal: `345:9801` (audited)
- Showcase page (M7): `344:4887` — **not audited in this M4 session, deferred to M7**.
