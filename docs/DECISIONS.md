# Architecture Decisions Log

> Append-only. Newest entries at the top. Each decision answers: WHAT was decided, WHY, what was the alternative, and any TRADEOFFS.

Format:

```
## YYYY-MM-DD — [Title]

**Decision**: ...
**Why**: ...
**Alternatives considered**: ...
**Tradeoffs**: ...
```

---

## 2026-05-06 — M5 stats descriptions are hardcoded in the frontend, not in Sanity

**Decision**: The 4 stat-cell descriptions on `/why-choose-us` (`Air and ocean logistics, fully visible end-to-end.`, etc.) are stored in `STAT_DESCRIPTIONS` in `src/lib/constants.ts`, mapped by the stat's `label` field. The Sanity `siteStats` schema continues to carry only `value / label / icon / order` — no `description` field is added.

**Why**: The descriptions are fixed editorial copy that pairs 1:1 with each stat. Adding a `description` field to the Sanity schema would force a migration and expose copy that the editor isn't expected to vary. Mapping by label keeps the source of truth in code while letting editors still reorder/reword the canonical 4 labels through Studio.

**Alternatives considered**:

- Add a `description` field to the schema — clean but requires schema migration, Studio re-deploy, and exposes editorial copy that should not vary.
- Use the `order` index as the join key — fragile if editors renumber.

**Tradeoffs**: Editor-added stats (a 5th, etc.) render without a description (graceful degrade). If editors rename a label string, the description disappears until `STAT_DESCRIPTIONS` is updated. Acceptable because the 4 stats are conceptually fixed brand assets, not free-form CMS content.

---

## 2026-05-07 — `OfficesGlobal` is now a clickable interactive — every office can be activated, the bg cityscape cross-fades

**Decision**: `_shared/OfficesGlobal.tsx` was refactored from a "static featured office + per-page bg image override" into a self-contained interactive: each office cell is a button on both desktop (4-up) and mobile (tabs), clicking promotes that office to active, the brand-red highlight slides to the active column (rounded outer corners when the active column is first/last), and the section background cross-fades to that office's own cityscape photo. Pages pick the default-active office via a single `defaultActive?: string` prop (defaults to `"uae"`). The data model gained a per-office `cityscape: { src, alt }` field on `Office` in `src/lib/constants.ts`; the previous `featured?: boolean` flag was removed (it duplicated the per-call `defaultActive` prop). Four cityscape assets ship in `/public/offices/`: `cityscape.webp` (UAE default), `cityscape-hk.webp`, `cityscape-usa.webp`, `cityscape-my.webp`.

**Why**: The Figma file ships four desktop variants of this section (home/UAE-featured, `446:5508` HK-featured, `446:4065` USA-featured, `446:4177` Malaysia-featured) — each with the red strip in a different column AND a different cityscape behind. That's the signature of a clickable interactive, not four static page variants; a static-only design wouldn't bother creating frames for offices nobody can switch to. Bundling cityscapes onto each `Office` keeps the data model honest (each office is the source of truth for its bg) and lets a future Team page reuse the same component with `defaultActive="usa"` without any extra work.

**Alternatives considered**:

- Keep `backgroundSrc` as a per-page prop — forces every page to know each cityscape filename and breaks the mental model "the office _is_ the card AND the bg".
- Fetch cityscapes from Sanity — out of scope for M5 (offices aren't CMS-managed).
- Fork into static + interactive sibling components — duplicates ~270 lines of layout for a click handler.

**Tradeoffs**: All four cityscape `<Image>` elements render in the DOM and load. The default-active one carries `priority`; the other three are lazy. Total cold-load weight ~1.4MB across four WebPs; for the GPU-cheap cross-fade behavior we accept this. The previous `featured` flag on `Office` is gone — anyone reading it would have crashed at typecheck (no consumers do).

---

## 2026-05-06 — `StatsBand` is promoted to `_shared/` from day one (used only by /why-choose-us in M5)

**Decision**: The CMS-driven KPI band lives at `src/components/sections/_shared/StatsBand.tsx` even though M5 is its sole consumer at launch. The fall back to `PLACEHOLDER_SITE_STATS` in `src/lib/constants.ts` mirrors the `MilestonesTimeline` placeholder pattern.

**Why**: `docs/CMS_SCHEMAS.md` §5 says `siteStats` is "reusable on Home page". Anticipating the home placement and making the component shared from day one avoids a folder rename + import update later, and makes it obvious to anyone scanning `_shared/` that the building block exists.

**Alternatives considered**:

- Place under `why-choose/` and move later — adds a future migration step and import-path churn.

**Tradeoffs**: A reader might wonder why `_shared/` houses a single-consumer component today. Comment in the file documents the home-page intent.

---

## 2026-05-06 — M5 Stats band order is CMS-driven; mobile 2x2 reading order accepts a small deviation from the Figma mock

**Decision**: The seed populates `siteStats` in desktop-reading order (`1000+, 24/7, 50+, 2014`). Mobile lays out as a 2x2 grid following the same `order asc` query, which means the top row reads `1000+, 24/7` and the bottom row reads `50+, 2014`. The Figma mobile mock shows `50+, 1000+, 24/7, 2014` instead — we accept the deviation to keep a single source of truth.

**Why**: Maintaining two parallel orderings (desktop vs mobile) would require either a second CMS field or hardcoded reordering in the frontend. Both add complexity and a synchronization risk. The 4 numbers are equally weighted brand stats — the order doesn't carry meaning.

**Alternatives considered**:

- Add a `mobileOrder` field to the schema — schema migration + editor confusion.
- Reorder in the frontend by hand — makes the component a static layout, defeats the CMS purpose.

**Tradeoffs**: Pixel comparison vs the Figma mobile mock will fail on the stat cell positions. Pixel comparison vs the desktop mock + 2x2 wrap will pass.

---

## 2026-05-06 — `ProjectsMosaic` recycles tiles when filtered subset has < 8 entries

**Decision**: When `ProjectsMosaic` is rendered with a `serviceSlug` prop on the M4 service-detail pages, the filtered tile list is padded to a minimum of 8 entries by recycling tiles round-robin. The desktop bento mosaic always shows 8 tiles (4 columns × 2 rows) regardless of how many tiles match the current service.

**Why**: Several M4 services (e.g. Road Freight, Air Chartering) currently map to only 1–3 tiles in the placeholder `relatedServices` mapping. A half-empty bento grid creates jarring whitespace and breaks the brick stagger pattern. Recycling preserves the visual cadence until the client supplies more projects in M7.

**Alternatives considered**:

- Render fewer columns when fewer tiles exist — visually inconsistent across services and would require a second tile-layout pass.
- Hide the section entirely when fewer than 8 tiles match — felt aggressive given the placeholder data; client may add tiles later.

**Tradeoffs**: A user clicking through related projects may see the same tile twice on a heavily-filtered service page. Acceptable until the M7 audit when `relatedServices` will be revised against the real project catalog. Flagged as a M7 follow-up.

---

## 2026-05-06 — M4 service-detail pages link "Request Quote" CTAs to `#request-quote` anchor on the same page

**Decision**: The black "Request Quote" pill buttons in `ServiceOverview` and `WhenToChoose` link to `#request-quote`, which targets the in-page `QuoteFormShell` wrapper. No separate `/quote` route is involved.

**Why**: The Figma frames don't show a navigation away from the service detail page. Keeping the user on-page preserves context and reduces the funnel by one click. The `scroll-mt-24` utility on the wrapper compensates for the fixed header.

**Alternatives considered**:

- Link to `/quote` (a future M8 page) — out of scope for M4 and would 404 today.
- Smooth-scroll via JS click handler — adds client-side JS for no functional gain over the native anchor jump.

**Tradeoffs**: When M8 introduces `/quote` as a standalone page, this anchor link can stay or be redirected — both work.

---

## 2026-05-06 — Value-Added accordion switches to vertical layout at `xl:` (1280px), not `lg:` (1024px)

**Decision**: The Value-Added Services accordion uses Tailwind's `xl:` breakpoint (≥1280px) to gate the desktop horizontal layout (708px thumbnail + label + arrow on one row). Below 1280px the row stacks vertically (thumbnail full-width on top, label row below). The M3 plan (`docs/M3_PLAN.md` §3 §3) implied the `lg:` breakpoint (≥1024px) since Figma's desktop frame is 1600px.

**Why**: At 1024–1279px the desktop horizontal layout is too cramped for the 708px thumbnail + 36px label + 73px arrow button — the arrow gets clipped on the right edge and labels wrap awkwardly. Confirmed visually by the developer at 1099px (arrow disappeared off-screen). Switching to vertical stacking from the lg range up to just below xl preserves a usable layout on common laptop widths (1280–1366 mostly OK, 1024–1279 needs the mobile-style stack).

**Alternatives considered**:

- Keep `lg:` and shrink the thumbnail proportionally with the container — would deviate from Figma's 708px contract and add responsive sizing complexity.
- Use a custom breakpoint like `min-[1221px]:` — same end result as `xl:`, but `xl:` is a standard Tailwind token and easier to reason about.

**Tradeoffs**: Slight design deviation from the 1600px Figma frame's implied breakpoint behavior. Mitigated by the fact that the mobile-style stacked layout still uses the same components and renders cleanly — no jarring transition. Devs reviewing M3 against the plan will see the deviation; this entry is the authoritative explanation.

**How to apply**: `xl:` (≥1280px) for horizontal value-added layout; vertical stack below. See `src/components/sections/services/ValueAddedAccordion.tsx`.

---

## 2026-05-05 — Quote form: build the visual shell in M3 as a shared component (supersedes part of 2026-04-29)

**Decision**: The quote form's visual shell is built once in Module 3 as a **shared component placed on BOTH the home page and the services page**. The two placements are pixel-identical except for the left-column photo (and optionally the headline copy). Module 8 still wires Formspree + state + validation + Turnstile into the same component — no redesign at that stage, only logic.

**Component**: `src/components/sections/_shared/QuoteFormShell.tsx`. Accepts `photo` and optional `headline` props. M3 hardcodes default headline `START YOUR / GLOBAL TRANSPORT / REQUEST` and disables the submit button (visual shell only).

**Why the change**:

- Per the M3 Figma audit, the embedded quote form on the services page is identical to the one on the home page apart from the photo. Building two separate components (a placeholder CTA on home + a shell on services) would mean immediate code duplication that we'd undo in M8.
- One shared component means M3 ships one well-styled section and home/services stay in lockstep through M8.
- M3 is already touching shared infrastructure (`OfficesGlobal` promotion, eyebrow promotion). Promoting the quote form too is consistent.

**Supersedes (in part)**: the 2026-04-29 "Quote form rollout: build once in M8, use CTA placeholders in M2/M3" decision. The "build once" principle is preserved — we still build the form's logic exactly once. The change is _when_ the visual shell ships: now (M3), not M8. The `RequestQuoteCta.tsx` placeholder on home gets replaced during M3.

**Tradeoffs**:

- M3 work grows by one section (the shell on home). Mitigated because the shell is the same component already being built for services — only an import + photo prop on the home page.
- Home page sees a visual upgrade in M3 ahead of the M8 functional wiring. Acceptable because the submit button is disabled and the form is clearly non-functional; users see a "preview" that becomes interactive in M8.

**How to apply (M3)**:

1. Build `QuoteFormShell.tsx` in `sections/_shared/` per the Figma spec (see `docs/M3_PLAN.md` §4).
2. Place it on `/services` with the Antonov 124 photo (`345:7746` left column).
3. Replace `<RequestQuoteCta />` on the home page with `<QuoteFormShell photo={{...home photo}} />`. Verify no visual regression on home at 375 / 768 / 1024 / 1440.
4. Delete `RequestQuoteCta.tsx` if no other consumer remains.
5. M8 imports the shell, adds form state, wires Formspree + Turnstile + validation. No template changes.

---

## 2026-05-05 — M3 Services Listing: design audit + locked decisions

**Decision**: Module 3 (Services Listing at `/services`) implementation contract is captured in `docs/M3_PLAN.md`. Read that file at the start of the M3 session — it has the full Figma audit (6 sections × desktop+mobile), pixel-level specs, animation contracts, component map, and Figma frame links. The locked decisions for M3 are summarized below; the plan doc is the source of truth.

**Locked decisions (M3)**:

1. **`ServiceCard` for M3 is its own component**, NOT shared with home `ServicesTeaser`. The two pages use visually different treatments per Figma — M3 uses 470×580 photo cards with full-bleed images and an icon→pill hover morph; the home teaser uses a smaller variant.
2. **Mobile services grid uses a tap-to-expand accordion**: only one card open at a time. Idle = white card with title + small icon button + decorative thumbnail strip on right; active = full image takeover with description and red "Explore More" pill.
3. **Mobile offices uses a "featured + tabs" pattern**: only the active country shows full address/phone/email; the others show the country name only and act as tabs. Default active = UAE (matches Figma highlight + brand HQ). **This change applies to home page mobile too** — `OfficesGlobal` will be promoted from `sections/home/` to `sections/_shared/` and the home consumer must be updated to match.
4. **Quote form in M3 is visual-shell only.** Section 01 (mode of transport radio grid) and Section 02 (origin/destination inputs) are styled to spec; sections 03/04/05 render as collapsed labels only; the submit button is disabled. M8 wires Formspree + state + validation + Turnstile (per the existing 2026-04-29 quote-form rollout decision). Component lives at `sections/_shared/QuoteFormShell.tsx` so M8 can extend it without redesign.
5. **"Explore More" buttons link to `/services/[slug]`** (M4 routes). M3 ships minimal stub pages at `src/app/(marketing)/services/[slug]/page.tsx` so dev links resolve to a "Coming in M4" placeholder rather than 404.
6. **Value-Added Services accordion default state**: all 8 rows collapsed; the first row auto-expands once on scroll-into-view (single-shot, doesn't re-trigger). Subsequent taps work as standard single-open accordion.

**How to apply**: open the next session with `read docs/M3_PLAN.md and start Module 3`. The plan doc has the full implementation order, component map, token additions, and acceptance checklist.

---

## 2026-05-05 — M3 token additions: form colors, faint ink, Inter (CTA), Poppins (offices)

**Decision**: M3 introduces several tokens that didn't exist in the M1/M2 brand definition. Add them to `tokens.css` and the Tailwind theme during M3 setup, before building sections that consume them.

**New / changed tokens**:

| Token                       | Value                           | Used by                                                                                                  |
| --------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `--color-surface-alt`       | **`#f5f5f5`** (was `#F9F9F9`)   | section backgrounds (services grid, value-added) — Figma uses `#f5f5f5`; correcting the M1 derived value |
| `--color-input-border`      | `#e4e4e4`                       | quote form input borders (idle)                                                                          |
| `--color-input-focus`       | `#ff7e8f`                       | quote form input border (active/focus) — light pink                                                      |
| `--color-input-placeholder` | `#d9d9d9`                       | quote form placeholder text                                                                              |
| `--color-text-muted-2`      | `#929292`                       | quote form labels                                                                                        |
| `--color-ink-faint`         | `#c4c4c4`                       | value-added row number prefixes                                                                          |
| `--font-cta`                | `Inter` (SemiBold 600)          | "Explore More" pill button label — note: Inter, not Inter Tight                                          |
| `--font-display-alt`        | `Poppins` (Bold 700, Black 900) | Offices section H2 ("ACROSS ALL REGIONS WORLDWIDE")                                                      |

**Why Poppins is added**: the offices H2 in Figma renders in Poppins on both desktop and mobile, while every other H2 on the site uses Inter Tight. Two interpretations were considered: (a) Figma is auto-substituting Poppins because Inter Tight isn't installed in the design workspace (Figma rendering bug), or (b) intentional. User decision: trust the design source — render in Poppins as designed. Adds a third font registered via `next/font/google` with `display: swap`. CLAUDE.md §8 typography section should be updated to list all four fonts (Inter Tight, PT Sans, Inter, Poppins).

**Why Inter (not Inter Tight) on the CTA pill**: Figma exports the "Explore More" pill text as `Inter:Semi_Bold` (not Inter Tight SemiBold). Could be a Figma rendering quirk, but matches across all 6 service cards consistently — treating as intentional.

**Tradeoffs**: 4 font families = 4 network requests. Mitigated by `next/font` preloading and aggressive subsetting. Each font weight used is preloaded only at the weights actually consumed (PT Sans Regular+Bold, Inter Tight Bold+Black, Inter SemiBold, Poppins Bold+Black).

**How to apply**: in the M3 setup commit, edit `tokens.css` + `src/app/layout.tsx` (next/font registrations) + Tailwind theme extension to add all 8 tokens at once. Update CLAUDE.md §8 to match. Verify the surface-alt change doesn't visually regress any M2 section that used `bg-surface-alt`.

---

## 2026-05-04 — Open content questions for client/PM before launch

**Decision**: track these in DECISIONS.md until they're resolved with the client team. Each is launch-blocking content (real values must replace the placeholders) but not technically-blocking — pages render either way.

1. **Office phone numbers** — `OFFICES` in `src/lib/constants.ts` lists `+852 6698 0871` for Hong Kong, USA, **and** Malaysia. The HK number is right; USA + Malaysia look like Figma placeholders that re-use the HK number. Get correct numbers from ops before launch.
2. **App Store / Google Play URLs** — `APP_LINKS` in `constants.ts` has real-looking IDs (`id1498909837`, `com.heliskycargo`); confirm with client these are the production app IDs and not a sandbox.
3. **Service descriptions** — five of six services in `SERVICES` use my reasonable-default copy; only `Ocean FCL` has the real Figma blurb. PM/client should review and supply final copy for the other five.
4. **Testimonial logos** — three placeholder logos (Lufttransport, Mitsui Bussan Aerospace, Sazma Aviation) live in `/public/testimonials/` so the section renders something pre-launch. Once Sanity is populated by the editor, real uploads override the static paths.

**How to apply**: walk this list at the M9 polish review with the PM. Replace each with confirmed values; remove the relevant `TODO` comments and the placeholder asset(s).

---

## 2026-05-04 — Sanity integration: which sections are CMS-driven today

**Decision**: three of the five Sanity schemas are wired into home-page sections that fetch live data and fall back to inline placeholders when the collection is empty. The other two are queryable but not yet consumed on any page.

**Live (home page)**:

- `teamMember` → `TeamTeaser.tsx` (top 4 published members)
- `testimonial` → `CustomerTestimonials.tsx` (featured + published, top 3)
- `milestone` → `MilestonesTimeline.tsx` (top 4 by year DESC)

**Wired but unused (no consumer yet)**:

- `quoteFormConfig` — will be consumed in M8 when the multi-step quote form is built
- `siteStats` — likely consumed by M5 (Why Choose Us page) for the stats band

**Why /studio shows no documents**: the Sanity dataset is empty. Editors need to add documents in `/studio` (Sanity Studio at `localhost:3000/studio` in dev). Once added with `status: published`, they'll appear on the home page automatically (60s ISR cache; force a hard refresh to see immediately).

**How to apply**: when the editor sits down to populate the CMS, point them at the three live schemas first. The placeholder data in `TeamTeaser`/`CustomerTestimonials`/`MilestonesTimeline` will keep the page looking populated during dev, and disappear automatically as soon as real entries arrive.

---

## 2026-05-04 — Pre-launch placeholder data lives inline; remove on M9 sign-off

**Decision**: Three home-page sections (`TeamTeaser`, `CustomerTestimonials`, `MilestonesTimeline`) ship with hardcoded `PLACEHOLDER_*` arrays as a fallback when their Sanity collections are empty. Names/quotes/years are sourced verbatim from the Figma design (real client team and customers). Each block is marked `// TODO(seed):` so it's grep-able.

**Why**: The CMS will be populated by the editor late in the project (M9 polish or after handover). Building sections that render an empty grid pre-launch would look broken in dev and on staging. Hardcoded fallbacks keep the visual consistent until real data arrives.

**How to apply**:

- During M9 polish, after the editor confirms Sanity is populated, search the codebase for `TODO(seed)` and delete each `PLACEHOLDER_*` constant + the empty-fallback branch in the parent component.
- The Sanity query is the source of truth — components don't need any other change. Removing the fallback just causes empty queries to render an empty grid (which is the correct production behaviour).

**Tradeoffs**: real client names sit in a public git repo until M9 cleanup. Acceptable since they're already on the live HSC site.

---

## 2026-05-04 — Showcase tile data centralised in `constants.ts` for M7 reuse

**Decision**: Project-mosaic tiles (`SHOWCASE_TILES`) and helicopter-client logos (`HELICOPTER_BRANDS`) live in `src/lib/constants.ts` rather than colocated with their consuming home-page sections. Office locations (`OFFICES`) and service offerings (`SERVICES`) follow the same rule.

**Why**: Module 7 (Shipment Showcase listing page) and Module 3 (Services Listing page) consume the same data with different layouts. Centralising in `constants.ts` prevents copy-paste of the source-of-truth list and makes editor-driven content audits a one-file scan.

**How to apply**: Hardcoded site content (per CLAUDE §3.3 — anything not in the 5 CMS schemas) should be added to `constants.ts` with a `Service`-style typed export. Section components import + derive layout from the data.

---

## 2026-04-29 — Quote form rollout: build once in M8, use CTA placeholders in M2/M3 (Option A)

**Decision**: The Quote form has two visual variants in the Figma — embedded (split layout, used on Home and Services Listing) and full-page (used on /quote). Both share the same form logic. We build the form ONCE in Module 8 and place both variants in the same module. Until M8, Module 2 (Home) and Module 3 (Services Listing) use simple CTA placeholder cards (image + headline + button) that link to /quote, where /quote is a stub until M8.

**Why**:

- M2 is already the heaviest module (8 sections, 4 days). Adding the multi-step form (state machine + file upload + Turnstile + Formspree) to M2 risks slipping the schedule.
- Building the form once in M8 — when all the form complexity is in one focused window — is cleaner than splitting it across modules.
- CTA placeholders mean users never see a half-functional form. They see either a button-link or a real working form.

**Alternatives considered (Option B)**: build the working form in M2 and reuse on /quote in M8. Pros: home page matches Figma immediately, fewer placeholders. Cons: pushes M2 deeper into form complexity, risk of M2 slipping.

**How to apply**:

- M2: render a CTA card matching the "Start your global transport request" Figma section. Button → /quote.
- M3: render the same CTA card pattern in the services listing footer. Button → /quote.
- /quote: stub page until M8 (placeholder content, "Coming soon" or similar).
- M8: build the form (multi-step state, file upload, Turnstile, Formspree wiring). Render two variants: `<QuoteFormPage />` on /quote, `<QuoteFormEmbedded />` to replace the CTA cards on M2 home and M3 services listing. All three placements ship in M8.

---

## 2026-04-29 — Quote form: schema supports BOTH iframe AND custom React paths via `form_mode` toggle

**Decision**: The `quoteFormConfig` Sanity schema now exposes both paths side-by-side, with a `form_mode` radio (`"custom"` | `"embed"`) that hides the irrelevant fields. Editors fill exactly one path. Frontend reads `form_mode` to decide what to render.

**Schema additions (Path B — custom React form)**:

- `form_endpoint` (url) — Formspree REST or other POST URL
- `transport_modes` (string[]) — Step 1 dropdown options, seeded with the 6 PDF defaults
- `helicopter_models` (string[]) — Step 3 dropdown options, seeded with 6 common models
- `transaction_types` (string[]) — Step 4 options
- `step_titles` (object) — optional copy overrides for step 1–5

**Schema additions (Path A — iframe)**: existing `form_embed_code` (text) — raw HTML iframe from Tally / Formspree / Google Forms / Typeform / etc.

**Why**:

- The PDF wording ("frontend reads the embed code / config from the CMS and renders the form") admits both interpretations. The original PM may have envisioned iframe; the design clearly wants a branded form.
- Carrying both options lets the PM negotiation in M8 land on either without a schema change.
- The `form_mode` toggle prevents editors from accidentally filling both fields and creating ambiguity.
- Path B's dropdown options being CMS-driven means the client can update helicopter models, transport modes, etc. without dev work — addresses the "dynamic fields" concern from the PDF.

**Tradeoffs**:

- Slightly more schema surface area for the editor to understand. Mitigated by the radio toggle hiding irrelevant fields.
- Frontend rendering code in M8 will branch on `form_mode`. Modest extra complexity.

**How to apply (M8)**: In the QuoteForm component, read `form_mode` from the CMS singleton. If `"embed"`, render `<div dangerouslySetInnerHTML={{ __html: form_embed_code }} />` (sandboxed). If `"custom"`, render the React form using the dropdown arrays + step titles + endpoint.

---

## 2026-04-29 — Sanity content-publishing access control: defer until handover

**Decision**: For Module 1, all Sanity users will get the **Editor** role (full draft + publish power). At handover to the client team, if they want junior staff to edit drafts but not publish, add per-user `document.actions` filtering in `sanity.config.ts` (Layer 2 of Sanity's permission model — free tier compatible).

**Why**:

- Free tier built-in roles only offer Administrator / Editor / Viewer — no built-in "edit but can't publish" distinction.
- Custom document actions in `sanity.config.ts` can hide the Publish button for specific user IDs, achieving a "submitter / publisher" workflow without paid tier.
- Premature to wire this up before we know who the client's editor team is and what workflow they need. The infrastructure (custom actions API) is free and 30 minutes of work to add later.

**Alternatives considered**:

- `sanity-plugin-workflow` for explicit Draft → In Review → Approved → Published states. Useful if the client wants formal review queues. Defer to warranty period if asked for.
- Sanity Growth tier ($99/mo) for true custom roles with document-level permissions — overkill for this site.

**How to apply**: At handover, ask the client which team members should be publishers vs. submitters. Add an `isPublisher(currentUser)` allowlist in `sanity.config.ts → document.actions`. Document the publisher list in `docs/HANDOVER.md`.

---

## 2026-04-28 — Mobile-first responsiveness is a top-line rule, not a final-module concern

**Decision**: Every module ships with full responsive behavior at 375px / 768px / 1024px / 1440px from day one. Module 9 (Mobile & Polish) is for splash screen, mobile nav overlay, and final polish — NOT for retrofitting basic responsive layouts.

**Why**: The Figma file already has dedicated mobile frames per module. Skipping mobile until M9 would mean rebuilding every page late in the schedule, which the timeline cannot absorb.

**How to apply**: Build with Tailwind defaults (mobile) and add `md:`, `lg:`, `xl:` overrides. Test every component at all four widths before claiming a module done. Always pull both desktop and mobile Figma frames at the start of each module.

---

## 2026-04-28 — Brand fonts: Inter Tight (display) + PT Sans (body)

**Decision**: Inter Tight for headings, PT Sans for body — both via `next/font` (Google Fonts).

**Why**: Specified in the Figma typography frame. Both are standard Google Fonts so we get free hosting + automatic font-display optimization via next/font.

**Tradeoffs**: Two font families → two network requests. Mitigated by next/font preloading and `display: swap`.

---

## 2026-04-28 — Brand color tokens

**Decision**: Confirmed from Figma brand frame:

- `--color-brand-red`: #E40C28
- `--color-ink`: #101820 (headlines)
- `--color-ink-soft`: #3D3D3D (body)
- `--color-ink-muted`: #4A4E54 (secondary)
- `--color-surface-alt`: #F9F9F9
- `--color-black`: #000000
- `--color-surface`: #FFFFFF

Derived (not in Figma swatch — confirm in M1 against actual usage):

- `--color-brand-red-dark`: ~#B00A1F (for hover/active)
- `--color-border`: #E5E7EB

**Why**: Matches the design. Tokens centralized in `tokens.css` + Tailwind theme extension so they're swappable.

---

## 2026-04-28 — Quote form: propose custom React form, keep iframe-embed as fallback (negotiable with PM)

**Decision**: Default plan is to build the quote form as a multi-step React component in Next.js (visuals match Figma exactly). Submissions POST to a Formspree REST endpoint. The CMS `quoteFormConfig` singleton stores: hero copy, the Formspree endpoint URL, recipient email, success message, on/off toggle.

**Context (important)**: The original PDF/PM was thinking iframe-style — i.e. paste a `<iframe>` from Formspree/Google Forms into a CMS field, render it as-is, the form "just appears" with the provider's styling. The Sanity field name `form_embed_code` was named with that mental model. Our schema field accepts either shape (raw HTML embed OR endpoint URL string), so both implementations are possible without a schema change.

**Why we propose custom form (config approach) instead**:

- iframe embeds are styled by the form provider — they cannot match the multi-step Figma design
- Custom React form keeps full visual control; CMS field just holds a config string (the endpoint URL) instead of literal HTML
- Same end result for the editor (paste a string into Sanity, swap providers without code) — better UX, better design fidelity, same maintenance story
- Multi-step UX with file upload + Turnstile + per-step validation is hard/impossible inside a third-party iframe

**Negotiation plan with PM** (start of Module 8):

- Show side-by-side: (a) iframe = ~30 min to wire, looks like Formspree's default; (b) custom = ~3 days, matches Figma exactly with all features.
- Frame as: "the brief said 'embed code' — we can do that literally with an iframe, but here's what it looks like vs what the Figma shows. Recommendation: spend the 3 days to match design."
- If PM insists on iframe: ship the iframe path, save ~2.5 days, redirect that time into polish/buffer.

**Tradeoffs (custom path)**: Formspree free tier 50/mo + 10MB attachment cap (verify in M8). DKIM uses Formspree's domain.
**Tradeoffs (iframe fallback)**: visual mismatch with Figma; multi-step + file upload + Turnstile may not all be supported; less control over success/error UX.

---

## 2026-04-28 — Client video: YouTube unlisted (default), or self-hosted re-encode if it's a background loop

**Context**: Client provided one ~93MB video on Google Drive. The PDF says "hero banner" without specifying media type. The Figma frame the developer shared shows a **play-on-click pattern** (poster image + red play button overlay) — not a background loop, not necessarily even on the hero.

**Decision**:

- **Default (play-on-click featured video, anywhere on the site)**: YouTube **unlisted** embed. Free, accepts 93MB, transcodes adaptively, lazy-loads, doesn't impact LCP because video only loads on click.
- **If a section turns out to need a muted background loop** (e.g. the home hero is actually a loop, not a poster): re-encode with ffmpeg → H.264 + WebM, 720p max, ~10–15s, no audio, ≤5MB. Self-host in `/public/`.

Initial recommendation was wrong — assumed the video was a hero background loop based on existing CLAUDE.md wording. Corrected after seeing the actual Figma frame: it's a featured play-on-click element. YouTube unlisted is the simpler, cheaper, and correct path for this pattern.

**Why**: User wants free hosting. 93MB raw is unviable on `/public/` for any non-loop use (LCP, bandwidth). Mux / Cloudflare Stream don't have viable free tiers at production scale. YouTube handles 93MB trivially and degrades gracefully on slow connections.

**Alternatives considered**:

- Mux dev tier: not free at production scale.
- Cloudflare Stream: pay-per-minute, no free tier.
- Vimeo Free: 500MB/week upload, more branding than YouTube.
- Cloudflare R2 + custom video element: free egress, but adaptive streaming requires more setup; marginal benefit over YouTube for one video.

**Tradeoffs**: YouTube branding (small logo + suggested-videos overlay on pause). Mitigations: `?rel=0` to limit suggestions; consider a custom poster + click-to-play wrapper that only loads YouTube on click.

---

## 2026-04-28 — No analytics at launch

**Decision**: Skip Plausible / Vercel Analytics / GA4. No analytics tool will be added.

**Why**: Not in PDF scope. Keeps the site lean, avoids cookie banner complexity, no privacy-compliance overhead.

**Tradeoffs**: No traffic data after launch. Easy to add later (Plausible or Vercel Analytics is one env var + one script tag).

---

## 2026-04-28 — Sanity project owned by developer initially

**Decision**: Create the Sanity project under the developer's personal account. Transfer ownership / change billing email if/when the client requests.

**Why**: Faster setup; no waiting on the client to create accounts. Sanity transfer flow is straightforward.

**Tradeoffs**: Project lives in the dev's account during build. Plan a transfer handover before billing kicks in (free tier is fine for the foreseeable future).

---

## 2026-04-27 — Use Sanity (Free tier) as the headless CMS

**Decision**: Sanity, hosted/managed (free tier).

**Why**:

- Only 5 small CMS-managed areas — fits free tier easily (~50 documents vs 10k limit)
- Image CDN with hotspot/crop is built in — meaningful perf win on an image-heavy site
- Studio admin UX is well-suited for a non-technical client editor
- One-month build timeline — Sanity setup is hours, not days
- Dev team will maintain → zero ops burden is a real advantage vs self-hosted alternatives

**Alternatives considered**:

- Payload CMS (self-host) — rejected: maintenance overhead + image pipeline DIY + setup time
- Strapi — rejected: same as Payload + admin UX less polished
- Contentful — rejected: free tier too restrictive, pricing scales hard
- Sitecore — rejected: enterprise pricing, overkill for scope

**Tradeoffs**:

- Vendor lock-in to Sanity (mitigated by export tools and the ability to migrate to Payload later if needed)
- Per-seat pricing if we ever exceed 20 free users (unlikely on this project)

---

## 2026-04-27 — Form submissions handled outside the CMS

**Decision**: Quote form submissions go through an external mail service (Formspree). The CMS only stores form configuration.

**Why**: Project brief explicitly defines this scope. Avoids storing PII in Sanity, avoids consuming document quota, simplifies GDPR posture.

**Tradeoffs**: Submissions live in the email inbox / mail service dashboard. If the client later wants a submissions table in the admin, it's a scope change.
