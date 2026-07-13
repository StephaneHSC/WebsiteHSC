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

## 2026-07-13 — Quote form Step 01/03 validation tightened: mode of transport, helicopter model, and transaction type are now required

**Decision**: Three client-requested changes to `validateAll`/`validateServerSide` (`src/lib/forms/quoteForm.ts`):

1. Step 01 (Mode of Transport) no longer defaults to `["Air Commercial"]` — starts empty (`[]`) and is required (was already blocked-on-empty server/client side, but the default made that path unreachable in normal use). This also required removing `QuoteFormShell.tsx`'s `defaultMode = "Air Charter"` fallback parameter — every embedded shell placement that doesn't pass an explicit `defaultMode` (home, why-choose-us, team, showcase, services listing) was silently pre-selecting "Air Charter" via that default, independent of the `initialQuoteFormState` fix. Only `services/[slug]/page.tsx`'s intentional `defaultMode={QUOTE_MODE_BY_SERVICE_SLUG[slug]}` context-prefill remains.
2. Helicopter Model is now required (was optional). Helicopter Brand and Quantity remain optional — Quantity still pre-fills `"01"`. Since the model picker (`MultiSelectField`) is disabled until a brand is chosen, requiring a model also gates brand selection in practice without a separate "brand required" rule.
3. Transaction Type is now required (was optional). Given a visible `required` asterisk in `Step03ShipmentDetails.tsx`, matching its sibling `Shipping Period` field.

**Why**: Client decision, communicated 2026-07-13. Reverses the original M8 rationale ("customers often quote before finalizing aircraft choice") for model + transaction type specifically.

**Tradeoffs**: Step 01 intentionally does **not** get a visible `*` asterisk — `ModeRadioGrid`/`ModeMobilePill` have no individual label to attach one to, and the client explicitly confirmed no asterisk needed there; required-ness is surfaced via the same inline red error text + `aria-describedby` pattern used elsewhere, firing on submit attempt. Helicopter Model **does** get an asterisk, added to the shared "Helicopter Model & Quantity" heading — client's call, reasoning that Quantity can never be null by UI/UX construction (its `<SelectField>` always holds a value, pre-filled "01", no blank option), so the asterisk isn't misleading there the way it would be for Step 01's unlabeled group.

---

## 2026-05-14 — M8 Quote — hero photo swap + CMS hero overrides flow to shells

**Two corrections from review-round-4:**

1. **Hero photo on /quote** — the placeholder `helicopter.webp` (close-up of helicopter on tarmac next to a small Antonov-nose slice) did not match the Figma frames (345:9554 desktop, 529:8837 mobile). Both Figma frames show the FULL Antonov AN-124 from a side angle — nose lifted, ramp out, helicopter visible inside the cargo hold, wing + engines extending right. Saved two crops sourced from Figma into `public/quote/`:
   - `quote-hero.webp` (1600×700, ~63 KB) — desktop crop
   - `quote-hero-mobile.webp` (860×940, ~42 KB) — mobile portrait crop
     `QuoteHero` now renders two `<Image>` components, one per breakpoint (`lg:hidden` / `hidden lg:block`). The Figma exports already include the rgba(0,0,0,0.36–0.4) wash, so the CSS overlay is now applied ONLY when a CMS override is in effect (the override photo isn't pre-darkened).
     `helicopter.webp` deleted (no remaining references).

2. **CMS `hero_image` + `hero_headline` now propagate to embedded shells** — previously these two fields lived in `quoteFormConfig` but were consumed ONLY by the standalone `/quote` page. The six embedded `QuoteFormShell` placements (home, services listing, service-detail, team, why-choose-us, showcase) ignored them and used their own hardcoded `photo` and 3-line headline. An editor setting `hero_image` or `hero_headline` in Studio would have changed `/quote` but nothing else.
   `QuoteFormShell` now reads the same config it was already fetching for form_mode / form_enabled, and applies:
   - `hero_image` (when set) overrides the page-provided `photo` prop in every shell placement
   - `hero_headline` (when set) replaces the 3-line `{ line1, line2, line3 }` stack with a single bold line
     Default behavior (no CMS override) is unchanged — each placement keeps its context-appropriate photo and copy.

**Why**: User asked "make sure everything in CMS is used". With all 7 fields wired in both places, an editor has a single source of truth for the quote-form chrome (image + headline + recipient + success + enabled + mode + embed code), and every change propagates via the 60s ISR window — no deploy, no hunting through which page uses which override.

**Schema descriptions updated** in `src/sanity/schemas/quoteFormConfig.ts` to document the override semantics so future editors don't expect a /quote-only effect.

**Trade-offs**:

- `hero_image` is one asset, but each embedded shell currently passes a different per-page photo (home gets `home-quote.webp`, services gets `services-quote.webp` with sunset tones, etc.). When the editor sets `hero_image`, that single image will appear on ALL placements — flattening the per-page variety. Acceptable: this is opt-in (default keeps the variety) and intended for campaigns / brand refreshes where the editor explicitly wants uniformity.
- `hero_headline` similarly flattens the 3-line shell H2 ("Start Your / Global Transport / Request") to a single line. Editors who want to keep the structure should just leave it blank.

**Alternatives considered**:

- Add `shell_headline` and `shell_image` as separate CMS fields → rejected: doubles the schema, violates "PDF §4.2 verbatim" constraint, makes editing twice as much work for the common case.
- Keep `hero_*` as /quote-only and document it → rejected: user explicitly wants everything CMS to flow somewhere.

---

## 2026-05-13 — M8 Quote — post-review tightening

**Decisions made after the first round of M8 visual review:**

1. **Shell variant has a separate mode-of-transport order** — `QUOTE_SHELL_TRANSPORT_MODES` (Air Charter, Air Commercial, Ocean RoRo, Ocean Container, Land, Ocean Breakbulk) matches Figma `344:3275` exactly. Canonical `QUOTE_TRANSPORT_MODES` order stays for standalone. Server-side validation accepts both orders since the values overlap.

2. **Shell variant strips "(Lo/Lo)" from the Breakbulk label** — Figma shell shows just "Ocean Breakbulk". `SHELL_LABEL_OVERRIDES` in `ModeRadioGrid` + `ModeMobilePill` handles the rename without changing the form state value.

3. **Shell variant uses 2-column horizontal layout for Step 02, NOT vertical stack** — Figma `344:3275` shows origin + destination side-by-side. Earlier `stackFields={true}` assumption was wrong.

4. **Shell variant hides the "Add Another Route" button** — Figma shell shows a single origin+destination row, no multi-route UI. `hideMultiRoute` prop on `Step02RouteInformation`.

5. **Helicopter Brand + Model + Quantity are now OPTIONAL** (both variants) — customers often request quotes before finalizing aircraft choice. Asterisk dropped from the "Helicopter Model & Quantity" label. Validation only checks consistency (model belongs to brand) when values are present.

6. **Shell variant uses smaller textarea (2 rows) for Additional Information** and HIDES the file-upload dropzone. Standalone keeps the full 3-row textarea + attachments. Per Figma `344:3275` (shell omits attachment UI).

7. **Step 04 label differs by variant** — shell uses "Transaction Classification", standalone uses "Transaction Details". Both labels in Figma; the values are the same, only the heading text changes.

8. **Embedded shell makes ALL 5 steps collapsible** — Steps 01 + 02 were previously always-expanded plain sections; now they use `CollapsibleSection` in shell variant. Standalone /quote keeps Steps 01+02 always-expanded (Figma standalone frame `345:9613` shows all expanded).

9. **Auto-expand effect rewrote to capture `prevCompletion.current` BEFORE `setOpenSteps`** — original code mutated the ref synchronously after the setState updater was queued, so the updater read the already-updated ref and never detected transitions. Fix: read `previous` into a local variable first.

10. **Cloudflare Turnstile attribution removed** — unlike reCAPTCHA, Turnstile doesn't require attribution text. `legalAttribution` constant removed from `QUOTE_FORM_DEFAULTS`.

11. **Submit button is "Submit" (capitalize) not "SUBMIT" (uppercase)** — per Figma frame review. Bumped weight to PT Sans Bold 14-15px.

12. **Mobile step heading weight bumped to `font-semibold`** (Inter Tight 500) — was unweighted (regular). Figma mobile frames show clearly bolder headings than the regular weight default.

13. **Chevron icon in QuoteFormShell bumped to 48px desktop / 44px mobile** with `strokeWidth=3.5` — was 38px desktop / 32px mobile / 2.5px stroke. Figma shows a thicker, larger icon at both viewports.

14. **Selected-radio inner indicator is now a solid white filled disc** (no outline + inner-dot doughnut) — matches Figma's cleaner radio styling on the red gradient bg.

15. **Iframe sanitizer rewritten as blocklist instead of allowlist** — `QuoteFormEmbedded.tsx` previously enumerated 13 allowed attributes (which rejected Google Forms' `marginheight`/`marginwidth` + similar provider-specific attrs). New approach: allow ALL attributes, reject only `on*` handlers + `srcdoc`, force `loading="lazy"`. Accepts paired, self-closed, and bare iframe shapes + fallback text content.

16. **Showcase tile `transportMode` labels now map to canonical modes** via `SHOWCASE_MODE_MAP` in `ShowcaseModal` — Figma showcase tiles use descriptive labels ("Ocean Freight (RoRo)", "Air Charter (AN-124)", etc.) that the form mode dropdown doesn't list verbatim. The mapper translates before dispatching the `hsc:quote-prefill` event. Ambiguous labels (Multi-modal, Local Coordination) intentionally unmapped.

17. **`QuoteFormCore` prefill listener defensively validates `mode`** — drops any value not in `QUOTE_TRANSPORT_MODES`, even if dispatched directly. Prevents future bad-dispatch corruption.

18. **`#request-quote` anchor added to `/` and `/services`** — was already on the 4 other embedded-shell placements (service-detail, why-choose-us, team, showcase). Now consistent across all 6 placements + standalone — showcase modal's smooth-scroll-then-prefill works on every page.

19. **CMS schema trimmed to PDF §4.2 verbatim** — removed 4 dead fields (`transport_modes`, `helicopter_models`, `transaction_types`, `step_titles`) which the frontend never read. Remaining fields: `form_mode` + 6 PDF-spec fields (`hero_headline`, `hero_image`, `recipient_email`, `success_message`, `form_enabled`, `form_embed_code`). Frontend uses hardcoded constants for the dropdown options — those are industry data, not editorial.

20. **`recipient_email` schema description updated to reflect actual behavior** — was "for editor reference" (misleading legacy from the Formspree era); now "Read by /api/quote at submit time and passed to Resend's `to:` field."

21. **Mode-of-transport radios use proportional CSS grid `180fr 150fr 150fr 230fr 180fr 120fr`** instead of fixed widths. All 6 radios fit on one row at every desktop breakpoint (1024 → 1920), not just 1440+.

---

## 2026-05-12 — M8 Request a Quote — locked decisions

**Decision**: `/quote` ships with the architecture, content, and Figma deviations captured below. Each item is something a reader of M3-M7 wouldn't infer from the code or the brief.

1. **`/quote` standalone is a different layout from the embedded `QuoteFormShell`.** Standalone = hero + centered white card; embedded = M3 split-pane with photo on left. Both render the same `<QuoteFormCore />` engine. The visual divergence is documented and intentional (Figma frames `345:9554` / `345:9613` differ from M3 frames). The `variant` prop drives layout differences in the steps (single-row vs stacked, submit-button width, disclaimer placement).

2. **All 5 steps render expanded on desktop; mobile uses progressive accordion** — 01 + 02 always expanded; 03 / 04 / 05 collapsed by default and auto-expand when the previous step transitions to complete. Submit-with-errors also auto-expands the steps that contain errors. Matches Figma evidence at both viewports.

3. **Transport mode list canonical order locked**: Air Commercial, Air Charter, Ocean RoRo, Ocean Breakbulk (Lo/Lo), Ocean Container, Land. Replaces the 6-item list in the M3 `QuoteFormShell.tsx` placeholder. Order is structural — the 6 desktop radio widths sum to exactly 1040 px in this order and that is the inner content width of the 1196 px form card (1196 − 2 × 78 px gutters).

4. **Helicopter brand → model cascade is hardcoded, NOT in CMS** (`QUOTE_HELICOPTER_MODELS_BY_BRAND` in `src/lib/constants.ts`). The Sanity `helicopter_models: string[]` schema field stays as a backwards-compat placeholder. Reason: aviation manufacturer / model relationships are stable industry data, not editorial. Airbus list is canonical (11 models pulled from Figma); other 7 brands ship with `// TODO(content):` placeholder lists.

5. **Spam protection = Cloudflare Turnstile** (server-verified via `/api/quote` Route Handler), NOT Google reCAPTCHA. The 2026-05-11 M8_PLAN.md draft specified reCAPTCHA v3 — pivoted back to Turnstile on 2026-05-12 when the developer's Google Workspace admin restriction blocked Cloud project creation (needed for classic reCAPTCHA keys). Turnstile setup is purely email signup, no Google Cloud project required. Verify endpoint: `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Token field name on submit: `cf-turnstile-response`. Widget runs in invisible mode (configured in the Cloudflare dashboard) and triggers via `turnstile.execute()`; the client passes `appearance: "execute"` so the widget doesn't auto-fire on render. CLAUDE.md §3.4 already named Turnstile so no doc edit needed there.

6. **Mail delivery = Resend + `/api/quote` Route Handler, NOT Formspree.** Reasons: (a) Resend free 3000 emails/mo + 100/day vs Formspree free 50 submissions/mo; (b) Resend supports attachments on free tier (40 MB per email post-Base64), Formspree free doesn't support uploads at all; (c) Resend reads `recipient_email` from CMS at submit time → true CMS-driven routing matches the client's PDF §4.3 spec literally; (d) emails come from `quotes@heliskycargo.com` (own-domain DKIM/SPF) after DNS verification. Trade-off: adds one file (`src/app/api/quote/route.ts`, ~140 lines) — deployed as a Vercel serverless function on the existing hobby tier, no new hosting. During dev we use Resend's sandbox sender `onboarding@resend.dev` (only delivers to the Resend account owner's address). Client must add 3 DNS records (SPF / DKIM / DMARC) to verify `heliskycargo.com` before launch.

7. **File upload added at the bottom of Step 04** as a deliberate Figma deviation (brief lists upload; Figma doesn't draw it). Max 5 files, 10 MB total, allow-list for PDF / DOC / XLS / images / DWG / DXF (see `QUOTE_FILE_LIMITS`). Resend's 40 MB email-size cap leaves comfortable headroom.

8. **Additional Information field is a `<textarea rows="3" resize-y>`** NOT a single-row input as Figma draws it. The placeholder copy ("Instructions, cargo dimensions, certifications, or any relevant notes…") clearly anticipates multi-line content; cap-at-60 px would force one-liners. Per-character counter shown when within 200 chars of the 2000 limit.

9. **Step 04 mobile label = `Transaction Details` everywhere** (Figma mobile uses `Transaction Classification` — treated as a stale duplicate label).

10. **Multi-route limit = 5 total (1 base + 4 added).** Figma doesn't show added-route state — implemented as a vertical stack with per-route header (`ROUTE 2 ×`) above each appended row. The base row has no remove button.

11. **Submit button width is 510 px on desktop standalone, NOT full form width** (Figma draws it inside the left content column only). On the embedded variant, the right column is half-width so submit fills the available width. Disclaimer sits right-aligned next to submit on desktop standalone; below submit and centered on mobile / embedded.

12. **Disclaimer Figma typo (`cHANNEL`) is corrected** to all-uppercase + middle-dot separator: `All fields marked * are required · Data transmitted over secure channel`.

13. **Spam-provider attribution line** is rendered below the disclaimer (`This site is protected by Cloudflare Turnstile and the Cloudflare Privacy Policy and Terms of Service apply.`). Turnstile in invisible mode doesn't ship a visible widget so there's nothing to hide via CSS (unlike reCAPTCHA's badge), but the attribution is good UX hygiene either way.

14. **Form mode `embed` sanitizer allow-lists `<iframe>` only.** No `<script>`, no event handlers (`on*` attrs rejected). Allowed attrs: src, width, height, frameborder, allow, allowfullscreen, style, title, name, loading, referrerpolicy, sandbox, scrolling. Editor-supplied HTML through Sanity is trusted-but-bounded. Invalid embed → maintenance card + console warning.

15. **`form_enabled = false` → maintenance card replaces the form everywhere** (`/quote` AND every embedded placement). Renders the CMS `success_message` as the body (re-purposed as a generic "we'll get back to you" message during maintenance).

16. **Prefill via URL query AND CustomEvent.** URL works for cross-page navigation (`/quote?mode=Ocean%20RoRo&origin=Dubai&destination=Houston&company=Acme&email=a@b.com`); the `hsc:quote-prefill` window event works for in-page prefill (showcase modal → `#request-quote` scroll). Both paths converge on `QuoteFormCore`'s prefill merge. `ShowcaseModal` parses `tile.modal.route` (format "Origin → Destination") and dispatches the event before scroll-into-view; when no on-page form exists, it falls back to the URL-query path.

17. **Validation strategy = inline on submit + clear on type.** Submit button stays enabled regardless of validation state (better discoverability than gating Submit). Clicking submit with errors fires `validateAll`, surfaces inline messages, auto-expands any collapsed mobile step containing an error, and focus-scrolls to the first invalid field. Typing into a previously-errored field clears that field's error.

18. **Email template lives in `src/lib/forms/quoteEmailTemplate.ts`** as a single function returning an HTML string. Uses `<table>` layout (Outlook compat), inline styles only (no external CSS), system-font fallback (Inter Tight not reliable in mail clients). Brand red top stripe (`#E40C28`, 6 px) + section dividers per the HSC color palette. Total size well under 100 KB (Gmail clips larger).

**Open content questions tracked in `docs/M8_PLAN.md` §13**: transaction-type final list, per-brand helicopter model catalogs beyond Airbus, ops recipient email, Resend account owner + DNS verification, auto-reply body, allowed file types, `/quote` SEO metadata. None are launch-blocking — every form area has a placeholder default.

---

## 2026-05-10 — M7 Shipment Showcase — locked decisions

**Decision**: `/showcase` ships with the data model, layout, and page-level deviations from Figma captured below. Each item is something a reader of M2-M6 wouldn't infer from the code or the brief.

**Decisions**:

1. **`ProjectsMosaic` is now reused across home + service-detail + /showcase** as a single client component. The legacy `4×2 fixed bento` layout is replaced by **column-based masonry driven by per-tile `desktopColumn` (0..3) + `mobileColumn` (0..1) + `shape` ("tall" | "medium" | "short" | "extra-short")**. Home and service-detail pass `tiles={SHOWCASE_TILES.slice(0, 8)}` so the visible 8-tile output is byte-equivalent to the M2 brick. /showcase passes all 14 tiles + `showLoadMore` + `initialDesktop=8` + `initialMobile=4` + `ctaHref={null}` (we're already on /showcase).
2. **Modal lives inside the mosaic** as a single client island. Every consumer (home, service-detail, /showcase) gets clickable tiles + lightbox for free. The modal is `_shared/ShowcaseModal.tsx`, wraps `ui/Modal` with the new `size="xl"` + `bare` props, and routes its "Request Quote" pill to `#request-quote` on the current page (with a `/quote` fallback that's currently unreachable since every consumer renders `QuoteFormShell`).
3. **Showcase remains hardcoded** — no Sanity schemas, queries, or seeds touched (per the 2026-05-04 decision below). The page is `revalidate: 60` only for parity with `/team` / `/why-choose-us` / `/services`.
4. **No filter chips** on /showcase. The PDF brief said "filterable" but Figma `344:4887` ships only the masonry + Load More — no filter UI. Trust Figma. Service-specific filtering remains available via the existing `relatedServices` field + `serviceSlug` prop on `ProjectsMosaic`, but is not surfaced as a tile-page UI in M7.
5. **Every tile is clickable, including pure-photo tiles**. Tiles without confirmed client copy carry a placeholder `modal` payload with lorem-ipsum challenge/solution/result and `// TODO(content):` markers (search `constants.ts`). The Figma modal frame doesn't disambiguate which tiles open it; the simplest mental model is "every tile drills into a project detail" — anything else leaves half the gallery feeling dead.
6. **Modal photo carousel paginates within a single project** (not between projects). `tile.photos: string[]` data field; if `photos.length <= 1`, arrows + dots are hidden. ArrowLeft/ArrowRight cycle photos when the dialog is focused. Today every tile ships with a single photo (`tile.photos` undefined), so the carousel UI is dormant until the client supplies extra angles.
7. **Video-tile asymmetry is intentional**. The 4 tiles with `hasPlayIcon: true` (japan-desk + 3 unlabeled) carry a red play-circle icon as a pre-click affordance — meaning "this story has a video version; the lightbox photo area becomes a playable video instead of stills." Until the client supplies real video files (`videoUrl`), the modal opens with the static photo + the play icon overlaid for the look. Search `// TODO(content): video file` markers when the assets land.
8. **Japan tile play icon migration** — site-wide, including home. M2 shipped `showFlag: true` on the Japan Desk tile rendering `/showcase/japan-flag.svg` in the corner. The Figma intent was always a centered play icon (the source frames `344:4072`, `643:35` are red play circles, not flags). M7 renames the data field to `hasPlayIcon: true`, replaces the asset with `/showcase/icon-play.svg`, deletes `/public/showcase/japan-flag.svg`, and the home page now renders the play icon instead of the flag — a one-time visual correction. Document so a reviewer doesn't flag it as a regression.
9. **Modal `size` prop on `ui/Modal`**. Adds `size?: "sm" | "lg" | "xl"` (default `sm` preserves the 2026-04-29 Modal API) + `bare?: boolean` for square corners and zero panel padding. M7 lightbox passes `size="xl" bare`. No other consumer touches the new fields.
10. **Modal close X button** is added at panel top-right (NOT in Figma). Reason: backdrop-click discoverability is poor on mobile, and `<dialog>` ESC alone isn't enough for touch users. Use a 32×32 circular `<button>` with a thin × icon, ink color, `bg-white/80 hover:bg-white border border-ink/10`. Documented as an accessibility deviation from Figma.
11. **Mobile hero subhead is dropped**. Figma mobile `505:6096` shows "Access real-time location of your helicopter while in transit, get push notification" — this is a stale carry-over from the smart-tracking page hero. Desktop has no subhead. Render no subhead on either viewport.
12. **Hero overlay 0.36 at all viewports** (NOT 0.40 desktop / 0.36 mobile per M6). The single `bg-ink/[0.36]` layer reads correctly on the showcase hero photo at every width.
13. **Hero eyebrow is RED variant** (not gray). M5/M6 used different splits — for M7 both desktop and mobile show the red eyebrow. The gallery section keeps the gray eyebrow for visual hierarchy.
14. **H2 mobile vs desktop copy** — desktop reads " and More", mobile reads " & More". Implemented via responsive `<span className="md:hidden">` / `<span className="hidden md:inline">` inside the mixed-weight H2 — added a `postMobile?: string` field to the `ProjectsMosaic` heading prop so /showcase can opt into the split without affecting home.
15. **Modal mobile drops the route header line**. Figma mobile `505:6768` only shows `Aircraft: …` as the modal H1; desktop shows both `<route>` (32px) + `Aircraft: …` (40px). Mobile route is implicit via the meta strip (Route: France → Brazil etc.).
16. **Load More cadence — different per breakpoint**. Desktop: 8 initial tiles → one click reveals all 14, button hides. Mobile: 4 initial → +4 per click → +4 → +4, button hides at 14. Implemented as **two separate buttons** (one `md:hidden`, one `hidden md:flex`) so each viewport's button disappears as soon as that viewport's count reaches `total` — without this, clicking one breakpoint's button left the other breakpoint's "Loading More" pill stranded in the layout.
17. **China-Guatemala tile keeps `shape: "tall"` (340×560), not `medium` (340×494)**. Figma `344:4887` draws this tile at 494px so col3 lines up flush with col0/col2. We ship it as `tall` so the home 4×2 mosaic renders identically to pre-M7 — this means /showcase col3 sums ~60px taller than the other columns (1300px vs 1241px). Acceptable visual deviation in the rightmost column; alternative was a per-page shape override which adds complexity for no real win. Revisit if the client flags the ragged column bottom.
18. **Tablet (768-1023) gallery stays 4-column**. Figma only frames mobile (430) and desktop (1600). At md (768) the mosaic snaps to 4-col masonry (each tile ~180px wide) — slightly tight but readable; cleaner than introducing a 3-col-only intermediate breakpoint for a window that's rarely used.
19. **Tile photos for tiles 9-14** were pulled from Figma `344:4887` and saved as `/public/showcase/tile-{8-video,9,10,11,12,13}.webp`. Re-encoded via ffmpeg from PNG → WebP at quality 78–80 (the Figma-shipped PNGs are 1.5MB+ each; final WebPs are 80-270KB). Hero image was downsized to 2400px wide before encoding.
20. **Home page tile click now opens the modal** (M2 didn't have one). `relatedServices` filtering on service-detail pages is intentionally NOT enabled in M7 — punted to M9 polish since the per-service tile mapping in `constants.ts` is still a placeholder.

**Why these are non-obvious**:

- The Japan flag → play icon swap is a visible home-page change that's easy to mistake for a bug.
- The /showcase col3 ragged bottom (china=tall) trades a Figma deviation for home byte-equivalence; without this entry a reviewer auditing against `344:4887` would file a bug.
- The two-button Load More pattern looks redundant in the JSX but solves a real cross-breakpoint stranding bug.
- The "every tile is clickable" rule — a reviewer expecting "only labeled tiles open the lightbox" will instead find pure-photo tiles drilling into placeholder copy. The TODO(content) markers are the launch-blocking signal.
- The mobile-only route-header drop in the modal is surprising if you only audited desktop.

**How to apply**:

- When the client supplies real per-tile narrative + video files, search `// TODO(content):` in `src/lib/constants.ts` and replace each placeholder modal payload + add `videoUrl` for the 4 video tiles.
- When a future page needs the project mosaic without the modal (unlikely), pass `ctaHref={null}` and skip the click handler — the modal is already gated by `tile !== null`, so no consumer changes are needed.
- When a future page wants service-filtered tiles, pass `<ProjectsMosaic serviceSlug="ocean-roro" tiles={SHOWCASE_TILES} />` — the recycle-to-8 logic from the 2026-05-06 entry still applies.

---

## 2026-05-10 — Sanity seed `_id` format: `team-<slug>` not `team.<slug>` (dot in prefix is a private namespace)

**Decision**: All seeded teamMember documents use `_id: "team-<slug>"` (hyphen separator). The earlier seed used `team.<slug>` (dot) per the M6 plan suggestion; that pattern silently breaks public reads.

**Why**: Sanity treats any `_id` whose first path segment contains a `.` as a **private namespace**, visible only to authenticated requests. Documents created with `_id: "team.stephane-marot"` succeed at write time and are queryable with the seed token, but the public CDN-backed Sanity client (`useCdn: true`, no token, used by all Server Components per `src/lib/sanity/client.ts`) sees them as `[]`. The result: the website's `fetchWithCmsFallback` always hit the empty branch, and the team page rendered `PLACEHOLDER_TEAM_MEMBERS` from `constants.ts` even after a "successful" seed. Confirmed 2026-05-10 by direct unauthenticated API probe — `count(*[_type=="teamMember"])` returned `0`, while the same query with a Bearer token returned `9`.

**Why we hadn't hit this in M2 / M5**: Earlier seed entries used `client.create()` with auto-generated random IDs (e.g. `khNwn...`, `3MdJ16JZ...`) — none of those contained dots, so all were public. Only `team.<slug>` and `siteStats` had explicit IDs. `siteStats` is fine because it's a single-token name with no dot.

**Fix applied**: Renamed all 9 entries in `TEAM_MEMBERS` (`scripts/seed-sanity.mjs`) from `team.X` → `team-X`, then ran `npm run seed:sanity -- --purge` to clean up the unreachable docs and re-create them under public IDs. Verified post-seed that the unauthenticated count is `9`.

**Alternatives considered**:

- Drop `useCdn: true` and use a write/read token — defeats the CDN performance benefit and embeds a token in client-readable env (only `SANITY_AUTH_TOKEN` is server-only; `useCdn: false` would still hit the read API but slower).
- Use auto-generated IDs (`client.create()`) — loses idempotency on re-seed (each run creates 9 new docs) without writing custom dedup logic. Hyphen-IDs preserve idempotency without the privacy gotcha.

**Tradeoffs**: ID readability is slightly worse with `team-X` than `team.X` because the dot grouping reads more naturally. Acceptable for a non-cosmetic API contract.

**How to apply**: Any future Sanity seed entry that wants stable/idempotent IDs should use a separator that is NOT a dot — hyphen, underscore, slash all work. Reserve dot prefixes for `drafts.X`, `versions.X`, and any deliberate private-namespace use case.

---

## 2026-05-07 — M6 Our Team — locked decisions

**Decision**: Module 6 (`/team`) ships with the layout and content defaults captured below. Each item is a deliberate departure from the expectation a reader of M3/M4/M5 would carry in.

**Decisions**:

1. **Eyebrow color split**: hero (`OUR TEAM`) uses `red` variant — matches the user's reference screenshots. The spotlight section (`EXPERTS YOU CAN TRUST`) uses `gray` (`bg-ink-muted text-surface`). The earlier draft of the M6 plan had both as gray; corrected post-implementation review against the actual design screenshots.
2. **Desktop role text is canonical** when desktop and mobile Figma frames disagree. The mobile frame had additional/different role text and an extra "Tim Walsh" entry that does NOT appear on desktop — those are stale. We render 9 members in desktop role wording on every viewport.
3. **Lorem-ipsum bios for non-CEO members** with `// TODO(content): client to provide bio for {full_name}` next to each entry in `PLACEHOLDER_TEAM_MEMBERS` and the seed dataset. CEO bio is verbatim Figma copy. Replace when client supplies real bios — likely M9 or post-launch.
4. **Spotlight photo changes per active member**. The CEO (`is_featured: true`) renders the Figma-supplied wide trade-booth photo with `object-cover` (the canonical `imgImage60`). Every other member renders their card portrait PNG with `object-contain object-bottom` (mobile) / `object-left-bottom` (desktop) on a `bg-ink` backdrop, so the full body reads cleanly without an upscale crop. The user's expectation — "photo should change when I switch team member in view" — is satisfied because the rendered image swap is immediately visible. Replace per-member portraits with proper wide candids when the client delivers them.
5. **Section DOM order**: heading → 9-card slider → spotlight composite (photo + content). The slider is intentionally above the spotlight so the user sees the full team first and clicks a card to drill into that person's photo + bio below. (The original M6 plan placed the slider after the spotlight, mirroring Figma's absolute-positioned overlap — but the user clarified the cards-above order during pixel review.)
6. **Mobile spotlight = vertical stack on dark band** below the photo. Figma's mobile frame has a taller dark gradient overlay (818px) that extends past the photo (500px) so the bio reads on a dark ground. Our implementation: photo at top with `aspect-[430/500]`, then content stacks below in a `bg-ink` band, with a `from-ink/0 to-ink` gradient at the bottom of the photo to soften the seam. Desktop (`lg+`) keeps the single 1600×900 composite with content overlay on the upper-right.
7. **Mobile offices = Malaysia featured** (consistent with desktop). Figma mobile frame shows UAE highlighted; treat as stale. User confirmed (2026-05-07).
8. **`OfficesGlobal` API note (retroactive)** — the M5 plan mentioned `featuredOverride/backgroundSrc/backgroundAlt` props, but the actual M5 implementation refactored to a cleaner `defaultActive?: string` prop with per-office cityscapes baked into the `OFFICES` constant. M6 just calls `<OfficesGlobal defaultActive="my" />`. (See the 2026-05-07 OfficesGlobal entry below for the full rationale.)
9. **`PLACEHOLDER_TEAM_MEMBERS` is promoted to `constants.ts`** and extended from 4 to 9 entries. Both home (`TeamTeaser` slice 0..4) and `/team` (all 9) consume the same source. The shape gained `bioParagraphs`, `social_links`, `is_featured`, and an optional `spotlightPhoto` field (alongside the existing `placeholderPhoto`).
10. **Bio renders as plain `<p>` paragraphs** — not Portable Text. We extract `block.children[].text` from each Sanity `long_bio` block and render concatenated text per block. Avoids pulling `@portabletext/react` for what is currently a 2-paragraph bio. Revisit if rich formatting (lists, links, marks) becomes a content requirement.
11. **`seedTeamMembers()` now uses `createOrReplace` keyed on `team.<slug>` ids** (matching the singleton `siteStats` pattern) so re-running the seed updates rather than appending. The `bioParagraphs` arrays in the seed data are converted to Portable Text on the fly via a small `paragraphsToPortableText()` helper.

**Why these are non-obvious**:

- The eyebrow color deviation will trip up anyone reading the M3/M4/M5 components first — the variant is a deliberate Figma signal.
- The desktop-canonical rule for text mismatches makes future role-edits unambiguous.
- The lorem-ipsum + spotlight-photo placeholders are launch-blocking content tasks; without `// TODO(content):` markers they could ship to production unnoticed.
- The mobile spotlight restructure is invisible from the desktop frame but is the only way the bio paragraphs read on a dark ground at sub-`lg` widths.

**How to apply**:

- When the client supplies real bios + per-member spotlight photos, search for `TODO(content):` in `src/lib/constants.ts` and `scripts/seed-sanity.mjs`, replace each, and remove the marker. Update the spotlight photo source per-member by populating `spotlightPhoto` on each `TeamMemberPlaceholder` and (on the CMS path) extending `resolveSpotlightPhoto()` to read from a new Sanity field.
- When sibling pages need a Malaysia-featured offices section, use `<OfficesGlobal defaultActive="my" />`. Other office ids: `hk`, `uae`, `usa`.
- The `paragraphsToPortableText()` helper in `scripts/seed-sanity.mjs` is a candidate for promotion to a shared `scripts/lib/portable-text.mjs` if a future module needs it.

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

---

## 2026-07-07 — Showcase tiles fully CMS-managed (scope change)

**Decision**: The shipment-showcase mosaic (tiles + modal content + slideshow photos) moved from hardcoded `SHOWCASE_TILES` to the Sanity `showcaseItem` schema. CMS-first with fallback: when any showcaseItem docs exist they drive the mosaic (ordered by `order`); when none exist the hardcoded array still renders, so nothing breaks pre-seed.

**Why**: Developer/client request — editors need to add and edit showcase projects (image, story, gallery) without deploys. Supersedes the earlier gallery-images-only escape hatch (which still works in fallback mode).

**Tradeoffs**: Editors now control layout-affecting fields (shape, desktop/mobile column) — bad values can unbalance the masonry, mitigated by dropdowns + validation. The /showcase page's bespoke Figma tile reorder only applies to the fallback set; CMS mode uses plain `order`. Modal descriptions are plain text paragraphs (no rich text) matching the 2026-07 title+description modal simplification.
