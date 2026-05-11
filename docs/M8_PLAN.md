# Module 8 — Request a Quote — Implementation Plan

> **How to use this file**: Design + functional contract for Module 8. Read it cold at the start of the M8 session — it captures the full Figma audit (4 frames pulled 2026-05-11), locked architecture decisions, content, validation rules, prefill matrix, and the dual CMS-mode test plan. Cross-references: `CLAUDE.md` (project rules), `docs/DECISIONS.md` (architecture log), `docs/M3_PLAN.md` (original QuoteFormShell M3 visual contract — superseded in part by §6 below), `docs/M7_PLAN.md` (sibling module + shared component map), `AGENTS.md` (Next.js 16 reminder).
>
> **Autonomy contract**: this session runs without check-ins. If a decision is missing from this doc, default to the option that (a) matches Figma the closest and (b) keeps the architecture consistent with M3-M7. Do NOT ask questions; pick, ship, and document the choice in `docs/DECISIONS.md`. The dual-mode CMS test plan (§11) is the launch acceptance gate — both `form_mode=custom` AND `form_mode=embed` MUST pass before marking M8 done.

**Status**: planning COMPLETE — desktop hero (`345:9554`), desktop form card with all 5 steps + open dropdowns (`345:9613`), mobile hero (`529:8837`), mobile form card with mobile accordion (`529:9005`) all audited. UI/UX recommendations locked. File-upload control is a deliberate Figma deviation, repository-level (§3.11). Ready for autonomous implementation.
**Audit date**: 2026-05-11
**Target route**: `/quote` (new — Header/Footer/MobileNav/OurSolutions already link to it and currently 404)
**Authoritative design source**: Figma file `UkrV8vyPeLqsYbZ57OrESC` (HSC--Copy-)

---

## 0 — Autonomous workflow contract

This module runs without check-ins. Flow is identical to M6/M7, in this order:

1. **Implementation pass** — build all sections per §3 specs, mobile-first, Server Components by default; the form is a Client Component island. Reuse the existing `Reveal` / `SectionEyebrow` / `Container` / `Section` / `Modal` / `Button` / `OfficesGlobal` / `fetchWithCmsFallback` primitives. Don't re-pull Figma frames unless an asset URL has expired (Figma asset URLs live ~7 days; this audit was 2026-05-11).
2. **Pixel-perfect review pass** — at every viewport (320 / 375 / 430 / 768 / 1024 / 1440 / 1920), compare against the 4 Figma frame screenshots. Verify every item in §9. **A line break, font weight, missing word, wrong indicator color, wrong dropdown active-state bg, or wrong submit-button width counts as a fail.**
3. **Functional review pass** — every item in §10 must pass. Submit the form via the live UI 12 times across the §11 test matrix; verify ops-inbox delivery, success card, error states, prefill behavior, reCAPTCHA invisibility, and the iframe-embed fallback.
4. **Code review pass** — read every new/modified file end-to-end. Check: TypeScript strictness, no `any`, no inline GROQ, no client-side Sanity fetch except via Server Component → Client prop, accessibility (semantic tags, `aria-invalid`, `aria-describedby`, focus rings, keyboard step navigation, ESC inside dropdowns), Reveal staggers consistent with M2-M7 (`0` → `0.1` → `0.2` → `0.3`), **no new dependencies** (see §1), no config edits. Run `pnpm typecheck` and `pnpm lint` clean.
5. **Re-verify pass** — if step 4 caused any UI/UX or functional edits, re-run steps 2 + 3 for the affected areas.
6. **Docs + handover** — append non-obvious calls to `docs/DECISIONS.md`. Update `CLAUDE.md` §2 "Currently working on" line. Update `CLAUDE.md` §3.4 + §8 if reCAPTCHA v3 replaces Turnstile (it does — see §1 below). Summarise what shipped + what's next. **Do not commit** without explicit user approval (memory: `feedback_no_commit_without_ask`).

### Suggested implementation order

1. **Tokens + env scaffolding** — `pnpm add resend` (only new dep, server-only). Add env vars per §1: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (public), `RECAPTCHA_SECRET` (server), `RESEND_API_KEY` (server), `RESEND_FROM_EMAIL` (server), `OPS_INBOX_FALLBACK` (server). No new design tokens.
2. **Constants** — extend `src/lib/constants.ts`:
   - `QUOTE_HERO` (eyebrow, h1Lines desktop+mobile, background photo)
   - `QUOTE_FORM_DEFAULTS` (transport modes, transaction types, helicopter brand→models map, quantity options, shipping period placeholder)
   - `QUOTE_MODE_BY_SERVICE_SLUG` (prefill mapping for service-detail context)
   - File-upload constraints (max files, max bytes, allowed mime types)
   - Promote helicopter-brand→models map to a typed constant (cascading dropdown source of truth)
3. **Types** — add `src/types/quoteForm.ts` with `QuoteFormState`, `QuoteFormRoute`, `QuoteFormErrors`, `QuoteFormConfig` (Sanity), `QuoteFormSubmitResult`.
4. **Validation** — `src/lib/forms/quoteForm.ts` with per-step validators + `validateAll()`. Hand-rolled, no Zod / no new deps (see §1).
5. **Form core (`QuoteFormCore.tsx`)** — Client Component that owns state, validation, client-side submission (POSTs to `/api/quote`), prefill, reCAPTCHA token capture, success/error UI. Renders all 5 step sections internally with a `layout: "expanded-desktop-accordion-mobile" | "mobile-accordion"` prop driving how step 03/04/05 collapse on mobile.
   5b. **Email template (`src/lib/forms/quoteEmailTemplate.ts`)** — pure function returning the branded HTML email body. Used server-side by `/api/quote`. See §7.4 for the structure.
   5c. **Server route (`src/app/api/quote/route.ts`)** — POST handler. Verifies reCAPTCHA token with Google `siteverify`, runs server-side validation (§7.5), resolves recipient from CMS (`recipient_email` or `OPS_INBOX_FALLBACK`), builds attachments from FormData, sends via `resend.emails.send()`. Returns `{ ok: true }` or `{ ok: false, error, field? }`. Full sketch in §7.3.
6. **Standalone `/quote` page** — `src/app/(marketing)/quote/page.tsx` (Server Component, ISR `revalidate: 60`). Fetches CMS via `fetchWithCmsFallback(quoteFormConfigQuery, ...)` and passes `config` + `prefill` (from `searchParams`) into `<QuoteFormCore />`. Page sections in DOM order: `QuoteHero` → form card (`Container` + `QuoteFormCore` in white card) → `<OfficesGlobal defaultActive="uae" />` → Footer. Branch on `config.form_mode === "embed"` to render `<QuoteFormEmbedded code={config.form_embed_code} />` inside the same card (§6.4).
7. **`QuoteHero.tsx`** in `sections/quote/` — full-bleed dark photo + 0.40 overlay desktop / 0.36 mobile + RED eyebrow pill + PT Sans Bold H1.
8. **Update `QuoteFormShell.tsx`** (the embedded variant on home/services/service-detail/why-choose-us/team/showcase) — extend the existing M3 visual shell to host `<QuoteFormCore />` inside the right column. The left column (photo + headline) stays unchanged. Submit lives at the bottom of the right column. See §6.2 for the M3→M8 visual deviation.
9. **Update existing consumers**: `app/(marketing)/page.tsx` (home), `app/(marketing)/services/page.tsx` (services listing), `app/(marketing)/services/[slug]/page.tsx` (service-detail — pass `defaultMode` prop), `app/(marketing)/why-choose-us/page.tsx`, `app/(marketing)/team/page.tsx`, `app/(marketing)/showcase/page.tsx`. Pass `<QuoteFormShell defaultMode={…} />` from service-detail. All other placements pass no prefill.
10. **Update ShowcaseModal "Request Quote" pill** (§8.5) — when on-page form exists, dispatch a `CustomEvent("hsc:quote-prefill", { detail: { mode, origin, destination } })`; when falling back to `/quote`, append URL query params.
11. **Sanity seed extension** — add `seedQuoteFormConfig()` to `scripts/seed-sanity.mjs`. Two presets accessible via `--form-mode=custom` (default) and `--form-mode=embed`. Embed preset uses a sample Tally iframe so we can flip between modes in /studio for §11 testing.
12. **Polish pass** — Reveal stagger, hover timings, focus rings, mobile sweep at 320/375/430/768/1024/1440/1920. Then the §9 pixel-perfect review.
13. **`pnpm typecheck` + `pnpm lint` clean.** Append decisions to `docs/DECISIONS.md`. Update `CLAUDE.md` §2 + §3.4 + §8.

---

## 0.5 — Responsive matrix (non-negotiable)

| Width   | Tier                            | Tailwind | What you check                                                                                                                                                                                                             |
| ------- | ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 320px   | small mobile                    | `<sm`    | hero H1 wraps to 3-4 lines without horizontal scroll; mode-of-transport mobile pill (Step 01) is full-width tappable (≥44px); origin + destination inputs stack vertically; submit button fills container                  |
| 375px   | iPhone-class mobile             | `<sm`    | matches Figma `529:8837` + `529:9005` pixel-for-pixel where audited; hero H1 is 3 lines (`Share your shipment / details. We'll / handle the rest.`)                                                                        |
| 430px   | iPhone Pro Max mobile           | `<sm`    | matches the 430-wide Figma frame exactly; form card has 24px gutter each side                                                                                                                                              |
| 768px   | tablet portrait                 | `md:`    | intermediate breakpoint (not in Figma); form card widens to ~700px; Step 01 transitions from full-width mobile dropdown to a 2x3 or 3x2 radio grid (use 3x2 — fits cleanest); transaction & contact fields can be 2-column |
| 1024px  | tablet landscape / small laptop | `lg:`    | form card 1000-1100px wide; Step 01 is a single-row 6-radio grid; Steps 02/03/04/05 use 2-column layouts; all 5 steps render expanded (no accordion); progressive complete-indicators (`tick-circle`) live                 |
| 1440px  | desktop                         | `xl:`    | matches `345:9613` desktop Figma frame; form card 1196px wide, content padded 78px from left edge of card; submit button 510px wide (NOT full-width); disclaimer text right-aligned                                        |
| 1920px+ | big screen / ultra-wide         | n/a      | hero stays full-bleed; form card stays centered at max-w-[1196px]; offices section + footer stay centered with Container; no awkward stretching                                                                            |

**Rules:**

1. Use the project's existing `Container` for content alignment. The form card uses an inner max-w-[1196px] inside the page container.
2. Hero is full-bleed; uses `next/image` with `priority` (LCP candidate) + `sizes="100vw"` + `aspect-ratio: 1600/700` desktop / `430/470` mobile to prevent CLS.
3. All form `<input>`, `<select>`, `<textarea>` are real semantic controls. Use `<fieldset>` + `<legend>` around each Step for screen-reader navigation. Don't replace native dropdowns with `<div>`-based menus for the brand/model/quantity selectors — accessibility wins outweigh the styling cost; use a custom `<Select>` Client Component that renders a `<select>` for keyboard/AT users AND a styled overlay for sighted users (similar pattern to native `appearance: none` + custom chevron).
4. Each radio in Step 01 desktop is a `<label>` wrapping an `<input type="radio">` (visually hidden) — keyboard arrow-key navigation works for free.
5. Submit button is a single `<button type="submit">` with `aria-busy` toggled during fetch. Disabled state when `!formEnabled` (CMS toggle) or when fetch is in-flight.
6. Big screens (≥1920) — verify hero photo at `/public/quote/helicopter.webp` is at least 2400px wide. If not, flag in DECISIONS.md and request a higher-res from the client.

**Acceptance gate**: in §9's "Pixel-perfect" checklist, every line is implicitly multiplied by the viewports above.

---

## 1 — Token + dependency check

**No new tokens.** All form colors/spacing/fonts were added in M3 (see DECISIONS 2026-05-05). Reconfirmed against Figma 2026-05-11:

- `--color-brand-red` `#E40C28` ✅ — eyebrow pill, selected radio gradient, "add another route" dashed border, required `*` asterisk, refresh indicator
- `--color-ink` `#101820` ✅ — hero H1 (white on dark), form H1, section labels, field text
- `--color-input-border` `#e4e4e4` ✅ — idle input borders
- `--color-input-focus` `#ff7e8f` ✅ — active/focused input border (verified: Step 02 origin input in Figma has this border)
- `--color-input-placeholder` `#d9d9d9` ✅ — placeholder text
- `--color-text-muted-2` `#929292` ✅ — field labels
- Dropdown active-item bg: `#efffe7` — pale green (NEW for M8 but treat as inline literal, single use, not worth a token)
- Inter Tight (Bold/SemiBold/Medium 500/600/700) ✅ — form H1, section labels, radio labels, submit button label (note: the standalone `/quote` form H1 is Inter Tight 50px; the standalone HERO H1 is PT Sans Bold 64px — Figma uses PT Sans on the hero, not Inter Tight)
- PT Sans (Regular 400 / Bold 700) ✅ — hero H1, field labels, field text, placeholder, disclaimer, hero eyebrow
- Poppins (Medium 500) ✅ — already loaded in M3 for offices H2; reused for some field labels per Figma (the field-label spans use a `Poppins:Medium` font-family attribute, but the inner `<span>`s override to PT Sans Regular — effectively PT Sans wins; render labels as PT Sans Regular 12px uppercase per the visible text, not Poppins; the `Poppins` declaration in Figma is a no-op for the rendered glyphs since all visible runs are wrapped in PT Sans spans)

**One new package**: `resend` (official SDK, ~12KB minified, server-only). Install with `pnpm add resend`. Used only inside `src/app/api/quote/route.ts`; never imported into client code.

Spam protection uses **reCAPTCHA v3 invisible** loaded via a vanilla `<Script />` tag — no client-side npm install. Per the conversation 2026-05-11, this supersedes CLAUDE.md §3.4's Turnstile reference; update CLAUDE.md §3.4 in the M8 docs pass.

- Add `<Script src="https://www.google.com/recaptcha/api.js?render=${siteKey}" strategy="afterInteractive" />` to the layout of pages that host the form. Idempotent — Google's script self-deduplicates.
- Call `window.grecaptcha.execute(siteKey, { action: 'quote_submit' })` to get a token at submit time.
- Send the token as a form field named `g-recaptcha-response` to our own `/api/quote` Route Handler.
- The Route Handler verifies the token server-side by POSTing to `https://www.google.com/recaptcha/api/siteverify` with the **secret key** (never exposed to the browser). On success (score ≥ 0.5), the handler proceeds to send the email via Resend. On failure, it returns 400 + JSON error.

**Email delivery** = **Resend** + a server-side `/api/quote` Route Handler. Replaces the earlier Formspree direct-submit path (DECISIONS 2026-05-11). The route lives at `src/app/api/quote/route.ts` and runs as a Vercel serverless function on the same hobby tier as the rest of the site — no separate hosting, no separate bill. Resend free tier covers 3000 emails/month + 100/day + 40MB per email (post-Base64). Formspree free, by contrast, doesn't support file uploads at all (paid plans start at $10/mo for 25MB-per-file uploads), and caps at 50 submissions/month — both real launch risks Resend avoids. Sources: [Resend pricing](https://resend.com/pricing), [Resend attachments docs](https://resend.com/docs/dashboard/emails/attachments), [Formspree plans](https://formspree.io/plans).

**Env vars to add** (`.env.example` + `.env.local`):

```bash
# reCAPTCHA v3 — site key (public, exposed to the browser).
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=

# reCAPTCHA v3 — secret key (server-only, used inside /api/quote).
RECAPTCHA_SECRET=

# Resend — server-only API key for transactional email.
RESEND_API_KEY=

# Resend — verified sender address (must match Resend's domain verification).
# Default: quotes@heliskycargo.com once DNS is verified.
RESEND_FROM_EMAIL=quotes@heliskycargo.com

# Fallback recipient when CMS `recipient_email` is empty.
OPS_INBOX_FALLBACK=info@heliskycargo.com
```

`NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is public by design (visible in DevTools regardless). `RECAPTCHA_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `OPS_INBOX_FALLBACK` are server-only — bundled with the Route Handler, never sent to the browser.

**Resend account setup** (one-time, done before deploy):

1. Create a free Resend account at `resend.com`.
2. Add `heliskycargo.com` as a sending domain → Resend gives 3 DNS records (SPF/DKIM/DMARC TXT records).
3. Client adds the DNS records → Resend's dashboard flips to "Verified" within 5-30 minutes.
4. Generate an API key → paste into `RESEND_API_KEY` env var (Vercel project settings for prod, `.env.local` for dev).
5. During dev / before DNS is live, use Resend's sandbox sender `onboarding@resend.dev` — all emails go to the account owner's address regardless of `to:`.

---

## 2 — Figma frame index

**File**: `UkrV8vyPeLqsYbZ57OrESC` (HSC--Copy-).
Re-pull only if an asset URL has expired (Figma asset URLs live ~7 days) — refer to §4 for the asset download list.

| #   | Section                                              | Desktop nodeId                                        | Mobile nodeId | Status                                                                                                                                                                             |
| --- | ---------------------------------------------------- | ----------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hero (`/quote`)                                      | `345:9554`                                            | `529:8837`    | ✅ audited                                                                                                                                                                         |
| 2   | Form card — all 5 steps expanded (`/quote`)          | `345:9613`                                            | `529:9005`    | ✅ audited (desktop fully expanded; mobile shows 01/02 expanded + 03/04/05 collapsed)                                                                                              |
| 3   | Step 01 mobile — collapsed dropdown (selected state) | n/a                                                   | `529:9023`    | ✅ visible in audit                                                                                                                                                                |
| 4   | Step 01 mobile — open dropdown (option list)         | n/a                                                   | TODO          | implement per the Step 01 mobile pattern below; if missing in Figma, match the desktop dropdown active-item style (`bg-[#efffe7]` + green tick)                                    |
| 5   | Step 03 desktop — open brand/model/qty dropdowns     | `501:295` + `501:306` + `910:597` (inside `345:9613`) | n/a           | ✅ audited (3 open dropdowns shown stacked)                                                                                                                                        |
| 6   | Step 02 multi-route — added second row               | not in Figma                                          | not in Figma  | implement per §3.4.2 (same dual-input row, gain a small "Remove" affordance)                                                                                                       |
| 7   | Success state                                        | not in Figma                                          | not in Figma  | implement per §3.9 (replace right column / form card body with a white card containing the CMS `success_message` + a "Submit another request" outline pill — match M3 ink palette) |
| 8   | Error state                                          | not in Figma                                          | not in Figma  | implement per §3.10 (red banner at top of form card; inline field errors `--color-brand-red` 12px below each field)                                                                |
| 9   | Offices                                              | reuse                                                 | reuse         | direct reuse — `<OfficesGlobal defaultActive="uae" />`                                                                                                                             |
| 10  | Footer                                               | reuse                                                 | reuse         | direct reuse — existing `Footer.tsx`                                                                                                                                               |

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

> Notation: every spec captures Figma's pixel value at the design viewport (1600 desktop / 430 mobile) plus the mobile-first Tailwind classes that produce the same visual. Where a Figma value would clip on a 1280px laptop, the breakpoint deviation is explicit.

### §3.1 — Hero (`/quote` standalone page only)

**Desktop (`345:9554`, frame 1600×700)**

| Element           | Value                                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background        | `/public/quote/helicopter.webp` (already in repo, full-bleed, `next/image fill priority`); object-cover, object-bottom; overlay `bg-black/40` (0.40)                              |
| Eyebrow           | 24×30 red pill at `left: 79px, top: 281px` — `bg-brand-red text-white font-body font-bold text-[12px] tracking-[0.06em] uppercase px-[11px] py-[8px]` — copy: `REQUEST A QUOTE`   |
| H1                | 2 lines, `font-['PT_Sans']` Bold 64px line-height 82px, white, capitalize, `left: 79px, top: 342px` — copy line 1: `Share your shipment details` line 2: `We'll handle the rest.` |
| Subhead           | none                                                                                                                                                                              |
| Total hero height | 700px (`aspect-[1600/700]` lock for CLS)                                                                                                                                          |
| Eyebrow Reveal    | `delay={0}` fade-up                                                                                                                                                               |
| H1 Reveal         | `delay={0.1}` fade-up                                                                                                                                                             |

**Mobile (`529:8837`, frame 430×470)**

| Element           | Value                                                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background        | same `/public/quote/helicopter.webp` (object-cover, object-bottom); overlay `bg-black/[0.36]` (NOT 0.40 — mobile-specific per Figma)                                                    |
| Eyebrow           | red pill at `left: 24px, top: 212px` — same red + PT Sans Bold + tracking, padding `p-[6px]`                                                                                            |
| H1                | 3 lines, `font-['PT_Sans']` Bold 32px line-height 42px, white, capitalize, `left: 24px, top: 252px` — line 1: `Share your shipment` line 2: `details. We'll` line 3: `handle the rest.` |
| Total hero height | 470px (`aspect-[430/470]` lock)                                                                                                                                                         |

**Implementation**: new `src/components/sections/quote/QuoteHero.tsx`. Server Component. Reads `eyebrow`, `headlineLines`, `imageSrc`, `imageAlt` from constants. CMS hero copy (`hero_headline`, `hero_image`) overrides constants when present.

---

### §3.2 — Form card layout

**Desktop (`345:9613`, frame 1196×1305)**

- White card, `bg-surface shadow-[0_0_2px_rgba(0,0,0,0.09)]`, `max-w-[1196px]` mx-auto, sits in the page with negative top margin pulling it up over the hero by ~92px (so the top edge of the card overlaps the bottom 92px of the hero photo — verify against Figma — actually re-checking the audit, the card sits BELOW the hero with the hero ending at y=700 and the card starting at y=92px within its own frame, suggesting the card is rendered in its own section below the hero, NOT overlapping. Treat as: card starts after hero ends, with `mt-0` and no overlap.)
- Form H1 `Request a Quote` — `font-display` Inter Tight Bold `text-[50px]` `leading-[64px]` `text-ink` uppercase, positioned at `left: 78px, top: 69px` inside the card → translate to `pl-[78px] pt-[69px]` on the form container.
- 5 step sections stacked vertically. Padding inside card: `78px` left, varying top per Figma y-values.
- All 5 steps render expanded on desktop. Section heading + fields visible at all times.

**Mobile (`529:9005`, frame 430×~1100 with form card 382×850 starting at y=92)**

- Card width 382px, `mx-auto` with 24px gutter each side (page width 430 → card width 430-48 = 382).
- Form H1 `Request a Quote` 24px Inter Tight Bold, CENTERED above the card at `top: 49px, left: 107px` (centered within page) → render as `<h1 className="text-center">` ABOVE the white card, not inside it.
- Card padding inside: `pt-[35px] pl-[33px] pr-[33px]` (content at x=57, card at x=24 → 57-24=33px left inset).
- Steps 01 + 02 expanded by default. Steps 03 + 04 + 05 collapsed (just a heading row with a thin separator line above and below). User taps to expand or expansion auto-fires when previous step validates (§3.6.1).
- Submit button at the bottom of the card, full-width inside the inset.

**Implementation**: form card markup lives inside `QuoteFormCore.tsx`. The H1 placement difference (inside card on desktop, above on mobile) is handled via `lg:` breakpoint conditionals or by rendering twice with `md:hidden` / `hidden lg:block` — pick the duplicate-and-hide pattern for clarity.

---

### §3.3 — Step 01 — Mode of Transport

**Desktop (`345:9613`, y=156→258)**

- Heading: `01  Mode of Transport` — `font-display` Inter Tight Bold 14px `tracking-[0.06em]` uppercase ink, with **green tick-circle** (24px) when the step is complete (radio selected and any required validation passed). Tick is the `imgTickCircle` asset — green circle + white check. Render as inline SVG (don't ship as PNG).
- Radio row: 6 horizontal radio cards, `gap: 6px`, `h-[60px]`:
  | # | Label | Width |
  |---|-----------------------------|--------|
  | 1 | `AIR COMMERCIAL` | 180px |
  | 2 | `AIR CHARTER` | 150px |
  | 3 | `OCEAN RORO` | 150px |
  | 4 | `OCEAN BREAKBULK (LO/LO)` | 230px |
  | 5 | `OCEAN CONTAINER` | 180px |
  | 6 | `LAND` | 120px |
  Totals: 180+150+150+230+180+120 + 5×6px gap = 1040px. Card content width is 1196-78×2 = 1040px — matches exactly. **Render as `flex gap-[6px]`** with explicit widths; the row fits the content column.
- Selected radio: gradient bg `linear-gradient(164deg, #e40c28 22%, #a30015 78%)`, white text, white outer ring (15px) + white inner dot (9px); label color white.
- Idle radio: `bg-white border border-input-border` (`#e4e4e4`), ink text, gray outer ring (`border-ink/30`), no inner dot.
- Radio label typography: `font-display` Inter Tight SemiBold 12px (NOT 13px — Figma is 12px for desktop radios; mobile pill label is 13px), `tracking-[0.02em]` uppercase, vertically centered, padding `pl-[12px]` after the ring (ring is at left=16px, 15px wide, +1px gap = label starts at left=32px ≈ `pl-[32px]`).
- Required indicator on heading: tick-circle appears only when `state.mode !== null`. Default initial state: `mode === "AIR COMMERCIAL"` (Figma shows this as preselected) — so tick is visible from page load.

**Mobile (`529:9005`, y=128→210)**

- Heading: `01  Mode of Transport` — Inter Tight **Medium** 13px (not Bold; Figma uses Medium 500 on mobile section labels) + tick-circle on right (positioned at `right: 0`).
- Single-row dropdown pill replacing the 6-radio grid: 318px wide × 50px high, gradient bg (same as selected desktop radio but with a 172deg angle and 78% stop at `#ae302b`), white ring + white inner dot + label `AIR COMMERCIAL` Inter Tight SemiBold 13px uppercase white, plus a white `arrow-square-down` icon at right (24×24 white square outline + chevron-down inside).
- Tapping the pill opens an option list (drawer-style or in-place expanded list). **Figma does not provide the open state** — implement as in-place expansion: tapping the pill toggles a panel below it showing 6 stacked options (each 40px tall, ink text, with the same white ring + active row gets the gradient bg). Tap an option → it becomes selected, panel collapses, pill label updates.
- ARIA: use a native `<select>` underneath (visually hidden, focusable) for keyboard + screen-reader support. The visual pill is decorative; the select is what carries form value. Or use a `<button aria-haspopup="listbox" aria-expanded>` + `<ul role="listbox">` pattern (more accessible, more code).

**Transport-mode list (final, 6 options, source of truth for both viewports)**:

```ts
export const TRANSPORT_MODES = [
  "Air Commercial",
  "Air Charter",
  "Ocean RoRo",
  "Ocean Breakbulk (Lo/Lo)",
  "Ocean Container",
  "Land",
] as const;
```

**IMPORTANT — list deviates from existing `QuoteFormShell.tsx` constant** which has `["Air Charter", "Air Commercial", "Ocean RORO", "Ocean Container", "Land", "Ocean Breakbulk"]`. M8 replaces this with the Figma-canonical 6 above. Order is locked because the visual width allocation depends on it.

---

### §3.4 — Step 02 — Route Information

**Desktop (`345:9613`, y=301→528)**

- Heading: `02  Route Information` — same Inter Tight Bold 14px ink — plus a **red refresh icon** (20×20, color `#e40c28`) at the right of the heading row. Indicator appears when the step is "active/in-progress" (origin filled, destination empty, OR validation has fired and one field has an error). When the step is complete (both origin + destination valid), the refresh icon swaps to a green tick-circle to match Step 01's pattern.
- Row 1: 2 fields side-by-side, 510px wide each, `gap: 20px` (508+20+510 = 1040 — wait that's 1040 = card width ÷ exactly. Verified: 78+510+20+510 = 1118 ≠ 1196. Re-checked Figma: origin at `left=78px, w=510px`; destination at `left=608px, w=510px`. So 78+510 = 588px end of origin; 608-588 = 20px gap; 608+510 = 1118px end of destination; card right edge 1196 - 1118 = 78px right padding. **Symmetric 78px gutters confirmed.**)

  **Origin** (required):
  - Label: `ORIGIN — COUNTRY / CITY / ZIP *` — PT Sans Regular 12px `tracking-[0.04em]` uppercase `text-text-muted-2` (`#929292`); asterisk in `text-brand-red`.
  - Input: 510×60, `bg-white border border-input-focus` (the pink `#ff7e8f` — focus state shown in Figma as the default for origin since it's the "active" step), `px-[19px]`, placeholder `e.g. United States / Houston / 77001` in `text-input-placeholder text-[15px]`.
  - When un-focused with no value, border switches to `border-input-border` `#e4e4e4`.

  **Destination** (required):
  - Label: `DESTINATION — COUNTRY / CITY / ZIP *` — same typography.
  - Input: 510×60, `bg-white border border-input-border` (idle), same placeholder pattern `e.g. UAE / Dubai / 00000`.

- Row 2 (multi-route): a 510-wide red-dashed button below origin (NOT spanning both columns; left-aligned to origin width).
  - Label: `MULTIPLE ROUTES SUPPORTED — ADD AS MANY AS NEEDED` — PT Sans Regular 12px text-muted-2 uppercase, at `top: 448px`.
  - Button: 510×60 at `top: 468px`, `bg-white border-2 border-dashed border-brand-red`, centered content: `add-square` icon (24×24 red `+` in a rounded square) `+` label `ADD ANOTHER ROUTE` Inter Tight SemiBold 13px `tracking-[0.04em]` uppercase `text-brand-red`, gap 8px between icon and label.

#### §3.4.1 Add-another-route behavior (extends Figma)

Clicking `ADD ANOTHER ROUTE` appends a second origin+destination row beneath the first. Each appended row:

- Same field shape as the first row.
- Gains a small **Remove route** affordance — a 24×24 ghost button with an `×` glyph at the right end of the destination input's label row (or, on mobile, after the destination input). `text-brand-red hover:bg-brand-red/10 rounded-full`. ARIA label `Remove route 2`.
- The "Add another route" button stays visible — user can add up to **5 routes total** (1 original + 4 additional). Hide the button when `routes.length >= 5`.
- Internal data: `state.routes: { origin: string; destination: string }[]` with `state.routes[0]` always present.

#### §3.4.2 Mobile (`529:9005`, y=250→535)

- Heading: `02  Route Information` Inter Tight Medium 13px + refresh icon at right (red, 16×16 — Figma uses the same `imgVector` asset, scaled).
- Origin label PT Sans Regular **10px** + asterisk (NOT 12px — mobile shrinks the labels), input 318×50 with `#ff7e8f` border, placeholder PT Sans Regular 13px.
- Destination label + input below it (vertical stack), input 318×50 idle border.
- Multi-route label PT Sans Regular **11px** at y=465 above the dashed button.
- Dashed `ADD ANOTHER ROUTE` button 318×50 at y=485, same red dashed + icon + label pattern.
- Appended routes stack vertically; remove `×` appears in the route header row (e.g. `ROUTE 2 ×`).

---

### §3.5 — Step 03 — Shipment Details

**Desktop (`345:9613`, y=571→694)**

- Heading: `03  Shipment Details` Inter Tight Bold 14px ink.
- Two-column layout:

  **Left column (510 wide):**
  - Field: `HELICOPTER SHIPPING PERIOD *` (label) + text input (placeholder `*Helicopter Shipping Period`, idle `#e4e4e4` border, ink text).
  - **Free-text input**, NOT a date picker (Figma shows a text input with the asterisked placeholder — treat as free-text "e.g. Q3 2026", "March 2027", "ASAP", "Within 60 days"). Validation: required, max 80 chars, no specific format.

  **Right column (510 wide):**
  - Label: `HELICOPTER MODEL & QUANTITY` (no asterisk — optional? But the Figma `*` appears to be missing here; cross-check the brief which lists "helicopter model + quantity" as part of the step. Treat as **required** since the whole step is core shipment intent).
  - Three side-by-side dropdowns, gap 7px:
    | # | Width | Default placeholder | Source |
    |---|-------|---------------------|-------------------------|
    | Brand | 180px | `Airbus` (placeholder italic ink-muted) — but Figma shows it as a regular value already selected with `#d9d9d9` placeholder color. Treat default as empty placeholder `Brand` until selected, then display the selected value. | `HELICOPTER_BRANDS` constant — 8 items: `Airbus, Leonardo, Sikorsky, Bell, Robinson, Boeing, Kaman model, K-Max`. |
    | Model | 226px | `Select e.g. Airbus H125` | `HELICOPTER_MODELS_BY_BRAND[brand]` — cascading. Airbus → 11 items: `H125, H130, H145, H160, H170, AS332L1, AS332L2, SUPERPUMA, AS365N2, AS365N3, BK117`. Other brands → TODO content (placeholder list of 3-5 representative models per brand; client to confirm in M9 polish). |
    | Quantity | 91px | `02` (Figma shows 02 preselected — implement as a default of `01`) | `QUANTITIES`: `["01","02","03","04","05","06"]`. Free-text fallback if `> 06` — show an input cell labelled "Other…" at the bottom of the list (M9 polish). |
  - All three dropdowns: `bg-white border border-input-border h-[60px]`, ink text 15px PT Sans Regular, chevron-down icon at right (12×12 ink-muted).
  - **Cascading rule**: changing Brand resets Model to empty placeholder and disables the Model dropdown until a new model is picked.

- **Open dropdown styling** (per `501:295`, `501:306`, `910:597`):
  - White panel, `border border-input-border`, `shadow-[0_4px_4px_rgba(0,0,0,0.13)]`.
  - Panel width matches the trigger width; height = ≤350px with `overflow-y-auto` for the model list (11 items × 42px = 462px would clip — Figma shows it scrollable).
  - Each option row 42px tall, ink text 15px, PT Sans Regular, paddingLeft = match the trigger's text-left position.
  - Active (currently selected) row: `bg-[#efffe7]` (pale green) + a green check icon at right (~12×12 green `#4bb543`).
  - Hover row (no Figma evidence): `bg-surface-alt` (#f5f5f5) — pragmatic default to match the rest of the site.
  - ESC closes; click outside closes; arrow-up/down navigates; Enter selects.

**Mobile (`529:9005`, y=597→657)** — COLLAPSED by default

- Heading row: `03  Shipment Details` Inter Tight Medium 13px ink, separator line below (`border-t border-input-border` 1px above the heading and another below).
- No fields visible initially. Tap the heading row to expand.
- Expanded state: vertical stack of:
  - `HELICOPTER SHIPPING PERIOD *` input (318×50).
  - `HELICOPTER BRAND` dropdown (318×50).
  - `HELICOPTER MODEL` dropdown (318×50, disabled until brand picked).
  - `QUANTITY` dropdown (318×50).
- Expansion animation: framer-motion `motion` package is already in deps (`"motion": "^12.38.0"` per package.json) → use `<motion.div initial={{height:0}} animate={{height:"auto"}}>` for the expansion. Match M3's 200ms ease-out.

---

### §3.6 — Step 04 — Transaction Details

**Desktop (`345:9613`, y=737→858)**

- Heading: `04  Transaction  Details` (double-space between "Transaction" and "Details" preserved from Figma — wait, actually the audit shows `04  Transaction  Details` with double space, which is a Figma typo; render with single space: `04 Transaction Details`). Inter Tight Bold 14px ink.
- Two-column layout:

  **Left column (510 wide):**
  - Label: `TRANSACTION TYPE` (Figma shows no asterisk → optional).
  - Dropdown: 510×60, placeholder `select level` PT Sans Regular 15px `text-input-placeholder`, chevron at right.
  - Options (from `TRANSACTION_TYPES` constant, sourced from brief which mentions "Transaction Details" but doesn't list options — propose defaults below; client to confirm in M9):
    - `Purchase`
    - `Sale`
    - `Lease`
    - `Trade-in`
    - `Other`

  **Right column (510 wide):**
  - Label: `ADDITIONAL INFORMATION *` (asterisk visible in Figma → **required**).
  - Input: 510×60, placeholder `Instructions, cargo dimensions, certifications, or any relevant notes…` PT Sans Regular 15px placeholder.
  - **Implement as `<textarea rows="3">`** with `min-h-[60px]` and `resize-y` even though Figma renders it as a 60px single-row input. Reason: the placeholder copy ("cargo dimensions, certifications, or any relevant notes…") clearly anticipates multi-line content; capping at 60px would force users to write in one line. Documented Figma deviation in DECISIONS.
  - Validation: required, max 2000 chars.

**Mobile (`529:9005`, y=667→707)** — COLLAPSED

- Heading row: `04  Transaction Classification` (NB: mobile Figma uses `Transaction Classification`, desktop uses `Transaction Details` — these are the same step under two labels. **Final canonical label: `Transaction Details`** on both viewports. Document the mobile-Figma mismatch in DECISIONS.)
- Expanded: vertical stack of `TRANSACTION TYPE` dropdown + `ADDITIONAL INFORMATION *` textarea.

#### §3.6.1 Accordion auto-expand behavior (mobile only)

When a previous step transitions from incomplete → complete (i.e., its required fields pass validation), the NEXT collapsed step auto-expands. User can also tap any collapsed heading to expand. Expanded steps can be re-collapsed by tapping the heading again. The currently-active step (where the user last interacted) shows a chevron-up; collapsed steps show no chevron (just a thin top + bottom border line per Figma `imgLine6`).

---

### §3.7 — Step 05 — Contact & Company

**Desktop (`345:9613`, y=901→1140)**

- Heading: `05  Contact & Company` Inter Tight Bold 14px ink.
- Row 1 (y=954→1034):

  **Left**: `COMPANY NAME *` label + input 510×60 placeholder `Your company name`.

  **Right**: `COMPANY WEBSITE *` label + input 510×60 placeholder `yourcompany.com`.

- Row 2 (y=1060→1140):

  **Left**: `YOUR FULL NAME *` label + input 510×60 placeholder `Smith`.

  **Right**: `EMAIL ADDRESS *` label + input 510×60 placeholder `john.smith@company.com`.

- All four fields required. Validation per §10.4.
- **No phone field** in the Figma. Brief mentioned "contact" but doesn't list phone explicitly. Don't add a phone field — match Figma. If client requests it post-launch, add as Row 3 left, with `Company website` shifted to Row 3 right and phone moved into Row 1.

**Mobile (`529:9005`, y=738→781)** — COLLAPSED

- Heading: `05  Contact & Company` Inter Tight Medium 13px.
- Expanded: 4 fields stacked vertically (Company Name → Company Website → Your Full Name → Email Address).

---

### §3.8 — Submit button + disclaimer + reCAPTCHA badge

**Desktop (`345:9613`, y=1163→1216)**

- Submit button:
  - 510×56 (NOT full-width — only spans the left column), `left: 78px, top: 1163px`.
  - `bg-ink text-surface px-[30px] py-[20px] capitalize` `font-body` PT Sans Bold 14px `tracking-[0.06em]`.
  - Hover: `bg-[#2a2f38]` (match service-detail "Request Quote" pill).
  - Disabled: `bg-ink/60 cursor-not-allowed`; `aria-disabled="true"`.
  - Loading: `aria-busy="true"`; replace label with `Submitting…` and a 14px spinner (CSS `border-2 border-white border-t-transparent rounded-full animate-spin`).
- Disclaimer:
  - `ALL FIELDS MARKED * ARE REQUIRED DATA TRANSMITTED OVER SECURE cHANNEL` (the lowercase `cHANNEL` is a Figma typo — render as `ALL FIELDS MARKED * ARE REQUIRED · DATA TRANSMITTED OVER SECURE CHANNEL`, all uppercase, with a middle-dot separator).
  - PT Sans Regular 10px ink, uppercase, `tracking-[0.04em]`, right-aligned at `left: 758px, top: 1196px` → render with `text-right` inside the right column area, or as a separate row below submit. **Pick**: place disclaimer in a flex row alongside the submit button (submit left, disclaimer right-aligned with `ml-auto self-end`).
- reCAPTCHA v3 badge:
  - The Google reCAPTCHA v3 badge is auto-injected by the Google script at the bottom-right of the viewport. Per their TOS, we can hide it (`display: none` via CSS targeting `.grecaptcha-badge`) IF we add an attribution line: `This site is protected by reCAPTCHA and the Google <a>Privacy Policy</a> and <a>Terms of Service</a> apply.`
  - Render this attribution below the disclaimer in 10px PT Sans Regular `text-text-muted-2`. Match small-print color and tracking.
  - In `globals.css`, add `.grecaptcha-badge { visibility: hidden; }`.

**Mobile (`529:9005`, y=802→870)**

- Submit button: 318×56 full-width inside form card content area.
- Disclaimer: PT Sans Regular 10px ink CENTERED below submit, 2 lines: `ALL FIELDS MARKED * ARE REQUIRED DATA TRANSMITTED OVER` / `SECURE CHANNEL`.
- reCAPTCHA attribution: 1 line, center-aligned below the disclaimer, 9px PT Sans Regular `text-text-muted-2`.

---

### §3.9 — Success state (Figma deviation — designed for M8)

After a successful submission:

- The entire form card body is replaced with a centered success card. Hero stays visible above. Offices + Footer stay below.
- Success card layout:
  - Green tick-circle icon (64×64), centered top.
  - H2 `Request received` (or first sentence of the CMS `success_message`) — Inter Tight Bold 32px desktop / 24px mobile, ink, centered.
  - Body paragraph (rest of `success_message`) — PT Sans Regular 16px desktop / 14px mobile, `text-ink-soft`, max-w-[480px] centered.
  - Outline pill button `Submit another request` — `border border-ink text-ink hover:bg-ink hover:text-surface rounded-full px-[30px] py-[16px]` PT Sans Bold 14px tracking-[0.06em] capitalize. Clicking resets the form to initial state (preserving prefill if any).
- Reveal stagger: tick (0) → H2 (0.1) → body (0.2) → button (0.3).
- Vertical padding: `py-[60px]` on the card so it occupies a similar height to the form when full.

---

### §3.10 — Error state (Figma deviation — designed for M8)

**Top-of-form banner** (for submission-level errors like reCAPTCHA failure, network error, `/api/quote` rejection, Resend send failure):

- Red banner inside the form card, above the form H1.
- Background `bg-brand-red/10`, border-left `border-l-4 border-brand-red`, padding `p-[20px]`, ink text `text-[14px]`.
- Two lines: title `Submission failed` (PT Sans Bold) + detail (PT Sans Regular — uses the error message returned by `/api/quote`, or a fallback "Please try again. If the problem persists, email info@heliskycargo.com directly.").
- Dismiss `×` button at right.
- ARIA: `role="alert"` + `aria-live="polite"`.

**Inline field errors** (for per-field validation):

- Below each field that fails validation:
  - Red text 12px PT Sans Regular `text-brand-red`, no transform.
  - Example messages: `Please enter your origin`, `Please enter a valid email address`, `This field is required`.
- Field input gains `border-brand-red` (overrides idle/focus border).
- ARIA: `aria-invalid="true"` + `aria-describedby="<field-id>-error"` on the input; error message has `id="<field-id>-error"`.
- Errors clear as the user types and the value passes validation.

---

### §3.11 — File upload (Figma deviation — designed for M8 per brief)

**Decision**: Brief explicitly lists file upload as part of M8. Figma does NOT include a file-upload control. **Add a file-upload row at the bottom of Step 04, AFTER the Additional Information textarea**, on both desktop and mobile.

**Desktop layout**: full-width row (1040px wide inside content gutters), below Step 04's two-column row.

- Heading row: `ATTACHMENTS (OPTIONAL)` — PT Sans Regular 12px uppercase text-muted-2 + helper text `PDF, DOC, XLS, IMAGES, CAD UP TO 10MB TOTAL` PT Sans Regular 11px text-muted-2.
- Dropzone: full-width × 120px, `bg-white border-2 border-dashed border-input-border hover:border-brand-red` rounded-none. Drag-and-drop OR click to browse.
  - Centered content: cloud-upload SVG icon (40×40 ink-muted) + label `Drop files here, or click to browse` PT Sans Regular 15px ink-muted.
  - On drag-over: `border-brand-red bg-brand-red/5`.
- Uploaded files list (below dropzone, only when files present):
  - Each file = a chip: `bg-surface-alt border border-input-border` rounded-full `px-[12px] py-[6px]`, file icon (12×12) + filename (truncated to 20 chars + ellipsis) + size in KB/MB + `×` remove button.
  - Chips wrap horizontally with `gap-[8px]`.

**Mobile**: same dropzone but full-card-width (318px), 100px tall, single-tap to open the OS file picker (drag-drop is irrelevant on touch).

**Constraints** (final, source of truth for §10 validation):

```ts
export const QUOTE_FILE_LIMITS = {
  maxFiles: 5,
  maxTotalBytes: 10 * 1024 * 1024,
  allowedTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
    "application/acad",
    "application/dxf",
    "application/octet-stream",
  ],
  allowedExtensions: [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".png",
    ".jpg",
    ".jpeg",
    ".dwg",
    ".dxf",
  ],
} as const;
```

**Resend size handling**: Resend caps each email at 40MB after Base64 encoding (~30MB raw). Our 10MB client-side total cap leaves comfortable headroom (~3MB Base64-encoded). If a request exceeds Resend's cap, the API returns an error; surface it via the §3.10 banner. No launch-blocking dependency — the 40MB headroom is well above what ops needs. Formspree's "free doesn't support uploads at all" constraint is no longer relevant (provider switched).

---

## 4 — Asset list

All assets to download from Figma + commit under `/public/quote/`:

| File                                       | Source nodeId   | Format | Notes                                                                                                                                          |
| ------------------------------------------ | --------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `/public/quote/helicopter.webp`            | already in repo | WebP   | Hero bg — verify ≥2400px wide; if not, request higher-res                                                                                      |
| `/public/quote/icon-tick-circle.svg`       | `345:9324`      | SVG    | Inline SVG — green circle + white check (used for step-complete indicator)                                                                     |
| `/public/quote/icon-refresh.svg`           | `345:9354`      | SVG    | Inline SVG — red refresh arrows (step-active indicator)                                                                                        |
| `/public/quote/icon-add-square.svg`        | `345:9370`      | SVG    | Inline SVG — red plus-in-square (multi-route add button)                                                                                       |
| `/public/quote/icon-chevron-down.svg`      | `345:9386`      | SVG    | Inline SVG — ink-muted chevron (dropdown trigger)                                                                                              |
| `/public/quote/icon-arrow-square-down.svg` | `529:9024`      | SVG    | Inline SVG — white square outline + chevron (mobile Step 01 pill trigger)                                                                      |
| `/public/quote/icon-check-green.svg`       | inside dropdown | SVG    | Inline SVG — green tick (12×12) used inside open dropdown for the active row                                                                   |
| `/public/quote/icon-cloud-upload.svg`      | not in Figma    | SVG    | Inline SVG — design as a flat outline cloud + up-arrow, 40×40, `currentColor` so it inherits `text-input-placeholder` / hover `text-brand-red` |

**Asset extraction policy**: per Figma guide, dev exports each SVG from Figma → drops in `/public/quote/`. **Prefer inline SVG components in `src/components/icons/`** (similar to how `ChevronsRight`, `CheckCircle`, etc. are already inline in `QuoteFormShell.tsx`) — saves HTTP requests and lets them inherit `currentColor`. Create `src/components/icons/quote/` with one named export per icon.

---

## 5 — Data model

### §5.1 Form state (TypeScript)

```ts
// src/types/quoteForm.ts

export type TransportMode =
  | "Air Commercial"
  | "Air Charter"
  | "Ocean RoRo"
  | "Ocean Breakbulk (Lo/Lo)"
  | "Ocean Container"
  | "Land";

export type TransactionType = "Purchase" | "Sale" | "Lease" | "Trade-in" | "Other";

export interface QuoteFormRoute {
  origin: string;
  destination: string;
}

export interface QuoteFormState {
  mode: TransportMode; // default: "Air Commercial"
  routes: QuoteFormRoute[]; // length 1..5, [0] always present
  shippingPeriod: string; // free text, max 80 chars
  helicopterBrand: string | null; // e.g. "Airbus"
  helicopterModel: string | null; // depends on brand
  helicopterQuantity: string; // "01" .. "06"
  transactionType: TransactionType | null;
  additionalInformation: string; // max 2000 chars
  companyName: string;
  companyWebsite: string;
  fullName: string;
  email: string;
  attachments: File[]; // max 5, max 10MB total
  recaptchaToken: string | null; // set at submit time
}

export type QuoteFieldKey =
  | "mode"
  | "shippingPeriod"
  | "helicopterBrand"
  | "helicopterModel"
  | "helicopterQuantity"
  | "transactionType"
  | "additionalInformation"
  | "companyName"
  | "companyWebsite"
  | "fullName"
  | "email"
  | "attachments"
  | `routes.${number}.origin`
  | `routes.${number}.destination`;

export type QuoteFormErrors = Partial<Record<QuoteFieldKey, string>>;

export interface QuoteFormConfig {
  form_mode: "custom" | "embed";
  hero_headline: string | null;
  hero_image: SanityImage | null;
  recipient_email: string | null;
  success_message: string;
  form_enabled: boolean;
  form_embed_code: string | null;
  // form_endpoint removed 2026-05-11 — Resend route owns delivery
  transport_modes: string[] | null;
  helicopter_models: string[] | null;
  transaction_types: string[] | null;
  step_titles: {
    step_1: string | null;
    step_2: string | null;
    step_3: string | null;
    step_4: string | null;
    step_5: string | null;
  } | null;
}

export type QuoteFormSubmitResult =
  | { ok: true; message: string }
  | { ok: false; error: string; field?: QuoteFieldKey };
```

### §5.2 Initial state (with prefill)

```ts
function initialState(prefill?: Partial<QuoteFormState>): QuoteFormState {
  return {
    mode: prefill?.mode ?? "Air Commercial",
    routes: prefill?.routes?.length ? prefill.routes : [{ origin: "", destination: "" }],
    shippingPeriod: "",
    helicopterBrand: null,
    helicopterModel: null,
    helicopterQuantity: "01",
    transactionType: null,
    additionalInformation: "",
    companyName: "",
    companyWebsite: "",
    fullName: "",
    email: "",
    attachments: [],
    recaptchaToken: null,
  };
}
```

### §5.3 Constants additions (`src/lib/constants.ts`)

```ts
export const TRANSPORT_MODES = [
  "Air Commercial",
  "Air Charter",
  "Ocean RoRo",
  "Ocean Breakbulk (Lo/Lo)",
  "Ocean Container",
  "Land",
] as const;

export const HELICOPTER_BRANDS = [
  "Airbus",
  "Leonardo",
  "Sikorsky",
  "Bell",
  "Robinson",
  "Boeing",
  "Kaman model",
  "K-Max",
] as const;

export const HELICOPTER_MODELS_BY_BRAND: Record<string, readonly string[]> = {
  Airbus: [
    "H125",
    "H130",
    "H145",
    "H160",
    "H170",
    "AS332L1",
    "AS332L2",
    "SUPERPUMA",
    "AS365N2",
    "AS365N3",
    "BK117",
  ],
  Leonardo: ["AW109", "AW119", "AW139", "AW169", "AW189"], // TODO(content): client to confirm
  Sikorsky: ["S-76", "S-92", "CH-53"], // TODO(content)
  Bell: ["206", "407", "412", "429", "505", "525"], // TODO(content)
  Robinson: ["R22", "R44", "R66"], // TODO(content)
  Boeing: ["CH-47", "AH-6", "MH-6"], // TODO(content)
  "Kaman model": ["K-MAX", "SH-2G"], // TODO(content)
  "K-Max": ["K-1200", "K-MAX-TITAN"], // TODO(content)
};

export const QUANTITIES = ["01", "02", "03", "04", "05", "06"] as const;

export const TRANSACTION_TYPES = ["Purchase", "Sale", "Lease", "Trade-in", "Other"] as const; // TODO(content): client to confirm options + ordering

export const QUOTE_MODE_BY_SERVICE_SLUG: Record<string, TransportMode> = {
  "ocean-roro": "Ocean RoRo",
  "ocean-lolo": "Ocean Breakbulk (Lo/Lo)", // Lo/Lo absorbed into Breakbulk per Figma's 6-option list
  "ocean-fcl": "Ocean Container",
  "road-freight": "Land",
  "air-commercial": "Air Commercial",
  "air-chartering": "Air Charter",
};

export const QUOTE_FILE_LIMITS = {
  maxFiles: 5,
  maxTotalBytes: 10 * 1024 * 1024,
  // ...see §3.11 for full type list
};

export const QUOTE_HERO = {
  eyebrow: "Request a Quote",
  headline: {
    desktop: ["Share your shipment details", "We'll handle the rest."],
    mobile: ["Share your shipment", "details. We'll", "handle the rest."],
  },
  photo: { src: "/quote/helicopter.webp", alt: "Antonov cargo plane loading ramp" },
} as const;

export const QUOTE_FORM_DEFAULTS = {
  successMessage: "Thank you for your enquiry. Our ops team will reply within 24 hours.",
  submitLabel: "Submit",
  disclaimer: "All fields marked * are required · Data transmitted over secure channel",
  recaptchaAttribution:
    "This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.",
} as const;
```

### §5.4 Sanity schema — no changes

The existing `quoteFormConfig` schema (see `src/sanity/schemas/quoteFormConfig.ts`) already has every field M8 needs:

- `form_mode` radio (`custom` | `embed`)
- All Path A fields (`form_embed_code`)
- All Path B fields (`transport_modes`, `helicopter_models`, `transaction_types`, `step_titles`)
- Common (`hero_headline`, `hero_image`, `recipient_email`, `success_message`, `form_enabled`)

**M8 will NOT migrate the schema.** The `helicopter_models` field stays as a flat `string[]` even though we now have brand→models cascading — the cascading map (`HELICOPTER_MODELS_BY_BRAND`) lives in code, not CMS, because it's industry data not editorial content (manufacturer-model relationships don't change). The CMS `helicopter_models` field becomes a `// TODO(content):` placeholder OR is documented as "unused — kept for backwards compat" in the schema file.

Optional future enhancement (not in M8): add a `helicopter_brands: { brand, models[] }[]` to Sanity for full CMS editability. **Skipped because**: aviation manufacturers and their model catalogs are stable industry data, not editorial.

### §5.5 GROQ — no changes

`quoteFormConfigQuery` already selects every field needed.

---

## 6 — Architecture

### §6.1 Component tree

```
src/components/
├── sections/
│   ├── quote/
│   │   ├── QuoteHero.tsx                    ← NEW (Server Component)
│   │   ├── QuoteFormCore.tsx                ← NEW (Client Component — owns state, validation, submit, reCAPTCHA)
│   │   ├── QuoteFormEmbedded.tsx            ← NEW (renders sanitized iframe HTML)
│   │   ├── steps/
│   │   │   ├── Step01ModeOfTransport.tsx    ← NEW
│   │   │   ├── Step02RouteInformation.tsx   ← NEW
│   │   │   ├── Step03ShipmentDetails.tsx    ← NEW
│   │   │   ├── Step04TransactionDetails.tsx ← NEW
│   │   │   └── Step05ContactCompany.tsx     ← NEW
│   │   ├── fields/
│   │   │   ├── TextField.tsx                ← NEW (label + input + error)
│   │   │   ├── TextareaField.tsx            ← NEW
│   │   │   ├── SelectField.tsx              ← NEW (custom dropdown w/ accessible <select> underneath)
│   │   │   ├── ModeRadioGrid.tsx            ← NEW (desktop 6-radio row)
│   │   │   ├── ModeMobilePill.tsx           ← NEW (mobile selected-mode pill + drawer)
│   │   │   └── FileDropzone.tsx             ← NEW
│   │   ├── QuoteFormSuccess.tsx             ← NEW (success card)
│   │   └── QuoteFormErrorBanner.tsx         ← NEW (top-of-form error banner)
│   └── _shared/
│       └── QuoteFormShell.tsx               ← EXTEND (M3 visual shell now hosts QuoteFormCore)
├── icons/
│   └── quote/
│       ├── TickCircle.tsx, Refresh.tsx, AddSquare.tsx,
│       └── ChevronDown.tsx, ArrowSquareDown.tsx, CheckGreen.tsx, CloudUpload.tsx
src/lib/
├── forms/
│   ├── quoteForm.ts                         ← NEW (validators + client-side submission)
│   └── quoteEmailTemplate.ts                ← NEW (HTML email builder used by /api/quote)
src/types/
└── quoteForm.ts                             ← NEW (see §5.1)
src/app/(marketing)/
└── quote/
    └── page.tsx                             ← NEW (Server Component, ISR 60s)
src/app/api/
└── quote/
    └── route.ts                             ← NEW (POST handler — verifies reCAPTCHA, sends via Resend)
```

### §6.2 The two placements — `QuoteFormShell` (embedded) vs `QuoteFormCore` (standalone)

**The form ENGINE is shared.** `QuoteFormCore` is the single Client Component that owns state, validation, submission, reCAPTCHA, success/error UI. Two wrappers render it differently:

- **`/quote` standalone page** — Server Component fetches CMS config → renders `<QuoteHero />` + white card containing `<QuoteFormCore variant="standalone" config={config} prefill={searchParamsToPrefill} />` + offices + footer.
- **`<QuoteFormShell />`** (used on home, services listing, service-detail, why-choose-us, team, showcase) — keeps the M3 split-pane layout (left photo column + right form column). The right column is replaced by `<QuoteFormCore variant="embedded" config={...} prefill={defaultModePropToPrefill} />`. The left column (photo + brand-red bg + headline + chevron) is preserved unchanged from M3 — only the right column markup changes.

**M3 → M8 visual deviation on the embedded shell**: the M3 shell rendered Steps 03/04/05 as collapsed numbered rows only (placeholders). M8 expands them to fully-functional steps. On desktop, the embedded shell's right column becomes substantially taller (~900px → ~1300px). The left photo column auto-stretches to match via the existing `flex` row. Acceptable per the brief — document in DECISIONS as a deliberate M3 → M8 upgrade.

**Variant differences**:

| Concern                         | `variant="standalone"` (`/quote`)                                       | `variant="embedded"` (`QuoteFormShell`)                                                                   |
| ------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Outer wrapper                   | White card `max-w-[1196px] mx-auto shadow-[0_0_2px_rgba(0,0,0,0.09)]`   | Right column of M3 split pane (`bg-surface`)                                                              |
| Form H1                         | `Request a Quote` Inter Tight Bold 50px inside the card top-left        | NONE — the M3 left column has the `START YOUR / GLOBAL TRANSPORT / REQUEST` H2                            |
| Steps 01/02 layout (desktop)    | Same                                                                    | Same                                                                                                      |
| Steps 03/04/05 layout (desktop) | Expanded by default, two-column where Figma shows two columns           | Expanded by default, **single-column** (the right column is half-width ~600px, can't fit two-column rows) |
| Steps 03/04/05 layout (mobile)  | Accordion (collapsed by default, auto-expand on previous step complete) | Accordion (same)                                                                                          |
| Submit button width             | 510px (left column of internal layout)                                  | Full right-column width minus padding                                                                     |
| Disclaimer                      | Right-aligned next to submit                                            | Below submit, full-width                                                                                  |

### §6.3 CMS branching — `form_mode`

```tsx
// src/app/(marketing)/quote/page.tsx (sketch)
export default async function QuotePage({ searchParams }) {
  const config = await fetchWithCmsFallback(quoteFormConfigQuery /* fallback */);
  const prefill = parsePrefillFromSearchParams(await searchParams);
  return (
    <main>
      <QuoteHero hero={config.hero_headline ? config : QUOTE_HERO} />
      <Section tone="light">
        <Container>
          {config.form_enabled === false ? (
            <QuoteFormDisabled message={config.success_message} />
          ) : config.form_mode === "embed" ? (
            <QuoteFormEmbedded code={config.form_embed_code ?? ""} />
          ) : (
            <QuoteFormCore variant="standalone" config={config} prefill={prefill} />
          )}
        </Container>
      </Section>
      <OfficesGlobal defaultActive="uae" />
    </main>
  );
}
```

The same branching applies inside `QuoteFormShell` for the embedded variant.

### §6.4 Iframe-embed path (`QuoteFormEmbedded.tsx`)

- Accepts a `code: string` prop containing the raw HTML iframe.
- Sanitizes: parses the HTML server-side using a regex `^<iframe[^>]+src="https://[^"]+"[^>]*>\s*</iframe>$/i` and strips anything that isn't a single `<iframe>` tag. Allow-listed attributes: `src`, `width`, `height`, `frameborder`, `allow`, `allowfullscreen`, `style`, `title`, `name`, `loading`, `referrerpolicy`. **No `<script>`, no `on*=` attributes.**
- Renders inside the same container as the React form would: matches the standalone white card width, with `min-h-[800px]` so an unsized iframe doesn't collapse.
- If sanitization rejects the code (no valid iframe found), render a maintenance card with a console warning. Editor sees a clear "iframe code invalid" message in `/studio` via the schema description.

### §6.5 reCAPTCHA v3 integration (server-verified)

1. **Layout-level script** — in the `(marketing)` layout (or just on `/quote` + any page that hosts `QuoteFormShell`):
   ```tsx
   <Script
     src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
     strategy="afterInteractive"
   />
   ```
2. **Token at submit** — inside `QuoteFormCore` submit handler:
   ```ts
   const token = await window.grecaptcha.execute(siteKey, { action: "quote_submit" });
   ```
3. **Submission** — POST `FormData` (including `g-recaptcha-response: <token>`) to `/api/quote`. Our Route Handler (`src/app/api/quote/route.ts`) verifies the token server-side by POSTing to `https://www.google.com/recaptcha/api/siteverify` with the **server-only** `RECAPTCHA_SECRET`. On `success: true` AND `score >= 0.5`, the handler proceeds to email delivery (§7.4). On failure, returns `400` + `{ ok: false, error: "Spam check failed." }`.
4. **Hide badge** — `globals.css`:
   ```css
   .grecaptcha-badge {
     visibility: hidden;
   }
   ```
5. **Attribution** — render the §3.8 attribution line below the disclaimer with links to Google's privacy + terms.

---

## 7 — Submission pipeline (custom mode)

### §7.1 Validation (client-side, blocking)

`validateAll(state: QuoteFormState): QuoteFormErrors`

| Field                   | Rule                                                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`                  | Must be one of `TRANSPORT_MODES`; required (default `Air Commercial` always valid).                                                                                    |
| `routes[i].origin`      | Required; min 2 chars; max 200 chars.                                                                                                                                  |
| `routes[i].destination` | Required; min 2 chars; max 200 chars.                                                                                                                                  |
| `shippingPeriod`        | Required; max 80 chars.                                                                                                                                                |
| `helicopterBrand`       | Required; must be a key in `HELICOPTER_MODELS_BY_BRAND`.                                                                                                               |
| `helicopterModel`       | Required; must be in `HELICOPTER_MODELS_BY_BRAND[brand]`.                                                                                                              |
| `helicopterQuantity`    | Required; must be in `QUANTITIES`; defaults `01`.                                                                                                                      |
| `transactionType`       | Optional (Figma shows no `*`); if set, must be in `TRANSACTION_TYPES`.                                                                                                 |
| `additionalInformation` | Required; max 2000 chars.                                                                                                                                              |
| `companyName`           | Required; max 200 chars.                                                                                                                                               |
| `companyWebsite`        | Required; must match `^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i` OR be empty.                                                                                 |
| `fullName`              | Required; max 200 chars; min 2 chars.                                                                                                                                  |
| `email`                 | Required; must match RFC 5322-lite regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.                                                                                              |
| `attachments`           | Optional; count ≤ 5; total bytes ≤ 10MB; each file's MIME type ∈ `allowedTypes` (or extension ∈ `allowedExtensions` since some browsers under-report MIME for `.dwg`). |
| `recaptchaToken`        | Required at submit (not at validate); attached automatically by submit handler.                                                                                        |

Errors render inline per §3.10. Submit button is enabled regardless of validation state — clicking with errors fires validation and surfaces messages (better discoverability than gating Submit; matches the M3 disabled-then-active button intent).

### §7.2 Client-side submit handler

```ts
// src/lib/forms/quoteForm.ts
export async function submitQuoteForm(
  state: QuoteFormState,
  config: QuoteFormConfig,
): Promise<QuoteFormSubmitResult> {
  // 1. Validate
  const errors = validateAll(state);
  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      field: Object.keys(errors)[0] as QuoteFieldKey,
    };
  }

  // 2. Get reCAPTCHA token
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return { ok: false, error: "Spam protection unavailable. Please try again later." };
  await waitForGrecaptcha();
  const token = await window.grecaptcha.execute(siteKey, { action: "quote_submit" });

  // 3. Build FormData
  const fd = new FormData();
  fd.append("mode", state.mode);
  fd.append("routes", JSON.stringify(state.routes)); // server parses this back into structured array
  fd.append("shipping_period", state.shippingPeriod);
  fd.append("helicopter_brand", state.helicopterBrand ?? "");
  fd.append("helicopter_model", state.helicopterModel ?? "");
  fd.append("helicopter_quantity", state.helicopterQuantity);
  fd.append("transaction_type", state.transactionType ?? "");
  fd.append("additional_information", state.additionalInformation);
  fd.append("company_name", state.companyName);
  fd.append("company_website", state.companyWebsite);
  fd.append("full_name", state.fullName);
  fd.append("email", state.email);
  state.attachments.forEach((f, i) => fd.append(`attachment_${i + 1}`, f));
  fd.append("g-recaptcha-response", token);

  // 4. POST to our own /api/quote route
  try {
    const res = await fetch("/api/quote", {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok)
      return {
        ok: false,
        error: body?.error ?? `Submission failed (HTTP ${res.status}).`,
        field: body?.field,
      };
    return { ok: true, message: config.success_message ?? QUOTE_FORM_DEFAULTS.successMessage };
  } catch (e) {
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}
```

### §7.3 Server route — `src/app/api/quote/route.ts`

```ts
import { Resend } from "resend";
import { client as sanityClient } from "@/lib/sanity/client";
import { quoteFormConfigQuery } from "@/lib/sanity/queries";
import { buildQuoteEmailHtml } from "@/lib/forms/quoteEmailTemplate";
import { validateServerSide } from "@/lib/forms/quoteForm";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  // 1. Parse the multipart form
  const fd = await req.formData();
  const token = String(fd.get("g-recaptcha-response") ?? "");
  if (!token)
    return Response.json({ ok: false, error: "Missing spam-protection token." }, { status: 400 });

  // 2. Verify reCAPTCHA token with Google
  const verify = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET!, response: token }),
  });
  const { success, score, "error-codes": errs } = await verify.json();
  if (!success || (typeof score === "number" && score < 0.5)) {
    console.warn("[/api/quote] reCAPTCHA rejected", { score, errs });
    return Response.json(
      { ok: false, error: "Spam check failed. Please refresh and try again." },
      { status: 400 },
    );
  }

  // 3. Server-side validation (defense in depth — don't trust client)
  const errors = validateServerSide(fd);
  if (errors)
    return Response.json(
      { ok: false, error: errors.message, field: errors.field },
      { status: 400 },
    );

  // 4. Resolve recipient from CMS (true CMS-driven routing)
  const config = await sanityClient.fetch(quoteFormConfigQuery);
  const recipient = config?.recipient_email?.trim() || process.env.OPS_INBOX_FALLBACK!;

  // 5. Build email + attachments
  const html = buildQuoteEmailHtml(fd);
  const attachments = [];
  for (let i = 1; i <= 5; i++) {
    const file = fd.get(`attachment_${i}`);
    if (file instanceof File && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachments.push({ filename: file.name, content: buffer });
    }
  }

  // 6. Send via Resend
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!, // e.g. "Heli SkyCargo <quotes@heliskycargo.com>"
      to: [recipient],
      reply_to: String(fd.get("email")),
      subject: `Quote: ${fd.get("company_name")} — ${fd.get("mode")}`,
      html,
      attachments,
    });
    if (error) {
      console.error("[/api/quote] Resend error", error);
      return Response.json(
        {
          ok: false,
          error: "Mail service unavailable. Please email info@heliskycargo.com directly.",
        },
        { status: 502 },
      );
    }
    return Response.json({ ok: true, id: data?.id });
  } catch (e) {
    console.error("[/api/quote] unexpected", e);
    return Response.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

// Vercel route config — allow up to 15s for the email round-trip + larger body for attachments
export const runtime = "nodejs"; // Resend SDK needs Node runtime (not edge)
export const maxDuration = 15;
```

### §7.4 Email template — `src/lib/forms/quoteEmailTemplate.ts`

Single function `buildQuoteEmailHtml(formData: FormData): string` returns a branded HTML email. Structure:

```
┌────────────────────────────────────────────┐
│ [HSC Logo + brand red top stripe]          │
│                                            │
│ NEW QUOTE REQUEST                          │
│ Received: <ISO datetime>                   │
│                                            │
│ ━━━━ MODE OF TRANSPORT ━━━━                │
│ <mode>                                     │
│                                            │
│ ━━━━ ROUTES ━━━━                           │
│ 1. <origin> → <destination>                │
│ 2. <origin> → <destination>                │
│                                            │
│ ━━━━ SHIPMENT DETAILS ━━━━                 │
│ Shipping period:  <period>                 │
│ Helicopter:       <brand> <model> × <qty>  │
│                                            │
│ ━━━━ TRANSACTION ━━━━                      │
│ Type:             <type>                   │
│ Notes:            <additional info>        │
│                                            │
│ ━━━━ CONTACT ━━━━                          │
│ Name:             <full_name>              │
│ Email:            <email>                  │
│ Company:          <company_name>           │
│ Website:          <company_website>        │
│                                            │
│ ━━━━ ATTACHMENTS ━━━━                      │
│ <list of filenames + sizes>                │
│                                            │
│ Reply directly to this email to respond.   │
└────────────────────────────────────────────┘
```

Use a single `<table>` for layout (email-client compatibility — Outlook still doesn't support flexbox). Inline all styles (`style="..."`) — external CSS doesn't load in most mail clients. Test in Litmus or against Gmail / Outlook / Apple Mail before launch.

Brand styling:

- Top stripe: `background: #E40C28; height: 6px;`
- Section headings: `font-family: 'Arial', sans-serif; font-weight: bold; color: #101820; text-transform: uppercase; letter-spacing: 0.06em;` (web fonts like Inter Tight aren't reliable in email — fall back to system fonts)
- Body text: `font-family: 'Arial', sans-serif; color: #3D3D3D; font-size: 14px; line-height: 22px;`
- Section dividers: 1px solid #E5E7EB

The template is just an HTML string — no React rendering. Keep it under 100KB total (Gmail clips emails larger than 102KB).

### §7.5 Server-side validation (defense in depth)

`validateServerSide(fd: FormData)` re-runs every rule from §7.1 against the parsed form data. Never trust the client. Specifically guards against:

- Bypassed client-side validation (a power user disables JS or POSTs directly via curl).
- Oversized attachments (count, individual size, total size).
- MIME-type spoofing (check the file's content-type AND the extension).
- HTML injection in text fields (escape all values when building the email HTML — `escapeHtml(value)` helper).
- Email-header injection (reject any `\r` or `\n` in `email`, `company_name`, etc.).

Reject with a clear `field` indicator so the client can highlight the right field.

### §7.6 Resend dashboard one-time setup (handover)

Document in `docs/CMS_SCHEMAS.md` so the dev team can hand this off cleanly:

1. Create a free Resend account (`resend.com`).
2. Add sending domain `heliskycargo.com` → Resend produces 3 DNS records (SPF/DKIM/DMARC).
3. Client / DNS owner adds the 3 records → wait for Resend dashboard to show "Verified" (5-30 min typical).
4. Create an API key with `sending` scope → paste into Vercel project's env vars (`RESEND_API_KEY`).
5. Set `RESEND_FROM_EMAIL` to `Heli SkyCargo <quotes@heliskycargo.com>`.
6. Set `OPS_INBOX_FALLBACK` to a stable ops address that's used if CMS `recipient_email` is empty.

During dev (DNS not verified yet), use Resend's sandbox sender `onboarding@resend.dev` — every email goes to the account owner's inbox regardless of the `to:` field. Useful for local testing.

---

## 8 — Prefill matrix

| Entry point                                                                      | Prefilled fields                                                                       | Mechanism                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Header → Request Quote` button                                                  | none                                                                                   | `<Link href="/quote">`                                                                                                                                                                                                                                         |
| `MobileNav → Request Quote`                                                      | none                                                                                   | same                                                                                                                                                                                                                                                           |
| `OurSolutions → Request Quote` (home)                                            | none                                                                                   | same                                                                                                                                                                                                                                                           |
| `Footer → Request Quote`                                                         | none                                                                                   | same                                                                                                                                                                                                                                                           |
| `ServiceOverview → Request Quote` (in-page anchor)                               | `mode = QUOTE_MODE_BY_SERVICE_SLUG[slug]`                                              | `service-detail/page.tsx` passes `<QuoteFormShell defaultMode={QUOTE_MODE_BY_SERVICE_SLUG[slug]} />`; `QuoteFormCore` reads the `defaultMode` prop into initial state.                                                                                         |
| `WhenToChoose → Request Quote` (in-page anchor)                                  | same                                                                                   | same                                                                                                                                                                                                                                                           |
| `ShowcaseModal → Request Quote pill` on home/showcase/service-detail (in-page)   | `mode + origin + destination` if `tile.relatedServices` or `tile.modal.route` resolves | `ShowcaseModal` dispatches `window.dispatchEvent(new CustomEvent("hsc:quote-prefill", { detail: { mode, origin, destination } }))` before smooth-scrolling to `#request-quote`. `QuoteFormCore` listens for this event in a `useEffect` and merges into state. |
| `ShowcaseModal → Request Quote pill` (fallback when no `#request-quote` on page) | same                                                                                   | append `?mode=…&origin=…&destination=…` to `/quote` URL.                                                                                                                                                                                                       |
| Direct `/quote?mode=…&origin=…&destination=…` link                               | any combination of `mode`, `origin`, `destination`, `companyName`, `email`             | `quote/page.tsx` parses `searchParams` and passes `prefill` to `<QuoteFormCore />`. Validates each param against the allowed value sets; invalid values are silently dropped (no error).                                                                       |

**URL → state mapping**:

```ts
function parsePrefillFromSearchParams(params: URLSearchParams): Partial<QuoteFormState> {
  const prefill: Partial<QuoteFormState> = {};
  const mode = params.get("mode");
  if (mode && TRANSPORT_MODES.includes(mode as TransportMode)) prefill.mode = mode as TransportMode;
  const origin = params.get("origin");
  const destination = params.get("destination");
  if (origin || destination)
    prefill.routes = [{ origin: origin ?? "", destination: destination ?? "" }];
  const companyName = params.get("company");
  if (companyName) prefill.companyName = companyName.slice(0, 200);
  const email = params.get("email");
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) prefill.email = email;
  return prefill;
}
```

**`hsc:quote-prefill` event payload**:

```ts
type QuotePrefillEvent = CustomEvent<{
  mode?: TransportMode;
  origin?: string;
  destination?: string;
}>;
```

`QuoteFormCore` listens once on mount and on each subsequent event; merges into state, sets `mode` step to complete (auto-tick), focuses Step 02 origin if it's still empty.

---

## 9 — Pixel-perfect checklist

Walk this list at every viewport (320 / 375 / 430 / 768 / 1024 / 1440 / 1920) against the Figma frames. A single fail = the section gets reworked.

### §9.1 Hero (desktop `345:9554` + mobile `529:8837`)

- [ ] Photo source = `/quote/helicopter.webp`, object-cover, object-bottom
- [ ] Overlay = `bg-black/40` desktop / `bg-black/[0.36]` mobile (NOT 0.40 on mobile)
- [ ] Eyebrow pill `REQUEST A QUOTE` red bg, white PT Sans Bold 12px tracking-0.06em
- [ ] Eyebrow position: left=79px desktop / left=24px mobile, top=281px desktop / top=212px mobile
- [ ] H1 PT Sans Bold (NOT Inter Tight) 64px desktop / 32px mobile, capitalize, white
- [ ] H1 line breaks: desktop 2 lines (`Share your shipment details` / `We'll handle the rest.`); mobile 3 lines (`Share your shipment` / `details. We'll` / `handle the rest.`)
- [ ] H1 line-height 82px desktop / 42px mobile
- [ ] Total hero height 700px desktop / 470px mobile, no CLS

### §9.2 Form card layout (desktop `345:9613` + mobile `529:9005`)

- [ ] Card max-width 1196px desktop / 382px mobile, centered
- [ ] Card shadow `0 0 2px rgba(0,0,0,0.09)` desktop / `0 0 6px rgba(0,0,0,0.09)` mobile
- [ ] Form H1 `Request a Quote` Inter Tight Bold 50px desktop / 24px mobile, uppercase
- [ ] Desktop: H1 inside card top-left at left=78px, top=69px
- [ ] Mobile: H1 above card, centered, top=49px

### §9.3 Step 01 (`345:9613` y=156-258, `529:9005` y=128-210)

- [ ] Heading `01  Mode of Transport` Inter Tight Bold 14px desktop / Medium 13px mobile, uppercase
- [ ] Green tick-circle indicator right of heading when mode is set
- [ ] Desktop: 6 radios in single row, exact widths per §3.3 (180/150/150/230/180/120 + 6×6px gaps = 1040)
- [ ] Selected radio gradient `linear-gradient(164deg, #e40c28 22%, #a30015 78%)` desktop / `linear-gradient(172deg, #e40c28 22%, #ae302b 78%)` mobile
- [ ] Idle radio `bg-white border border-input-border`
- [ ] Radio label Inter Tight SemiBold 12px desktop / 13px mobile uppercase
- [ ] Mobile: single full-width pill (selected mode) + arrow-square-down icon on right
- [ ] Mobile pill expanded shows 6 options stacked (custom — see §3.3)

### §9.4 Step 02 (`345:9613` y=301-528, `529:9005` y=250-535)

- [ ] Heading `02  Route Information` + red refresh icon
- [ ] Desktop: origin + destination in 2 columns each 510×60 with 20px gap
- [ ] Origin (active) border `#ff7e8f` (input-focus); destination (idle) border `#e4e4e4`
- [ ] Field label PT Sans Regular 12px desktop / 10px mobile text-muted-2 uppercase + red `*`
- [ ] Placeholder `e.g. United States / Houston / 77001` PT Sans Regular 15px desktop / 13px mobile input-placeholder
- [ ] `MULTIPLE ROUTES SUPPORTED — ADD AS MANY AS NEEDED` label PT Sans Regular 12px desktop / 11px mobile text-muted-2 uppercase
- [ ] `ADD ANOTHER ROUTE` button: 510×60 desktop / 318×50 mobile, red dashed border, red `+` icon, Inter Tight SemiBold 13px uppercase red label
- [ ] Multi-route add behavior: clicking appends a 2nd row beneath; `×` removes; max 5 routes

### §9.5 Step 03 (`345:9613` y=571-694)

- [ ] Heading `03  Shipment Details` Inter Tight Bold 14px
- [ ] Desktop 2-col: left = HELICOPTER SHIPPING PERIOD \* text input (510×60); right = HELICOPTER MODEL & QUANTITY (3 dropdowns 180+7+226+7+91 = 511px ≈ 510, gap 7px)
- [ ] Dropdown chevron-down icon right side, ink-muted
- [ ] Open dropdown: white panel, `border #e4e4e4`, `shadow 0 4px 4px rgba(0,0,0,0.13)`, item 42px tall, active row `bg-#efffe7` + green tick
- [ ] Cascading: changing brand resets model
- [ ] Mobile: heading + thin separator above and below, collapsed by default

### §9.6 Step 04 (`345:9613` y=737-858)

- [ ] Heading `04 Transaction Details` (single space; ignore Figma's double-space typo)
- [ ] Desktop 2-col: left TRANSACTION TYPE dropdown 510×60 placeholder `select level`; right ADDITIONAL INFORMATION \* textarea 510×60 placeholder per §3.6
- [ ] Textarea is `<textarea rows="3" resize-y>` not single-row input (deliberate Figma deviation)
- [ ] Mobile: heading + thin separator, collapsed by default
- [ ] Mobile label `Transaction Classification` — IGNORE; use `Transaction Details` everywhere

### §9.7 Step 05 (`345:9613` y=901-1140)

- [ ] Heading `05  Contact & Company` Inter Tight Bold 14px
- [ ] Desktop 2-col row 1: COMPANY NAME _ + COMPANY WEBSITE _
- [ ] Desktop 2-col row 2: YOUR FULL NAME _ + EMAIL ADDRESS _
- [ ] All 4 fields 510×60
- [ ] Placeholders: `Your company name`, `yourcompany.com`, `Smith`, `john.smith@company.com`
- [ ] Mobile: collapsed by default, expanded = 4 fields stacked

### §9.8 Submit + disclaimer + reCAPTCHA attribution

- [ ] Submit button: 510×56 desktop (left-column width only) / 318×56 mobile (full inset width)
- [ ] Submit: `bg-ink text-surface capitalize` PT Sans Bold 14px tracking-0.06em
- [ ] Hover: `bg-[#2a2f38]`
- [ ] Disclaimer: `All fields marked * are required · Data transmitted over secure channel` PT Sans Regular 10px ink uppercase tracking-0.04em
- [ ] Desktop: disclaimer right-aligned next to submit; mobile: centered below submit
- [ ] reCAPTCHA badge hidden via `.grecaptcha-badge { visibility: hidden }`
- [ ] Attribution text rendered below disclaimer; links open in new tab

### §9.9 File upload row (M8 deviation — §3.11)

- [ ] Position: below Step 04 row, full-width inside content gutters
- [ ] Label `ATTACHMENTS (OPTIONAL)` + helper `PDF, DOC, XLS, IMAGES, CAD UP TO 10MB TOTAL`
- [ ] Dropzone full-width × 120px desktop / 100px mobile, dashed `border-input-border`, hover `border-brand-red bg-brand-red/5`
- [ ] Chip list below dropzone when files present
- [ ] Remove `×` per chip works
- [ ] Drag-and-drop works on desktop; tap-to-browse works on mobile

### §9.10 Success state (§3.9)

- [ ] Replaces form card body
- [ ] Green tick (64×64) centered top
- [ ] H2 `Request received` Inter Tight Bold 32px desktop / 24px mobile centered
- [ ] Body = CMS `success_message` PT Sans Regular 16px / 14px mobile text-ink-soft max-w-[480px] centered
- [ ] Outline pill `Submit another request` works (resets form, preserving prefill)

### §9.11 Error states (§3.10)

- [ ] Submission-level: red banner top-of-card with title + detail + `×` dismiss
- [ ] Inline field-level: red `border-brand-red`, red 12px message below, `aria-invalid` + `aria-describedby`
- [ ] Errors clear as user types

---

## 10 — Functional acceptance checklist

### §10.1 Form lifecycle

- [ ] Page loads. reCAPTCHA script attaches. `grecaptcha` becomes available within 3s.
- [ ] Form renders with default state: mode=`Air Commercial` (tick visible), 1 empty route, all other fields empty.
- [ ] Tab key navigates fields in DOM order (left-to-right, top-to-bottom).
- [ ] Esc inside any dropdown closes it without losing other field state.
- [ ] Arrow up/down inside dropdown navigates options; Enter selects.

### §10.2 Mode of transport (Step 01)

- [ ] Desktop: clicking any radio selects it; previously selected gets idle styling.
- [ ] Mobile: tapping the pill opens the option list; tapping an option selects + collapses.
- [ ] Selecting any mode shows the green tick-circle indicator.
- [ ] Keyboard: arrow keys navigate desktop radios; Space/Enter selects.

### §10.3 Route information (Step 02)

- [ ] Typing into origin makes border switch from `#ff7e8f` (focus) → idle on blur (or `#ff7e8f` on next focus).
- [ ] Empty origin on submit → inline error `Please enter your origin`.
- [ ] Empty destination on submit → inline error `Please enter your destination`.
- [ ] Click `ADD ANOTHER ROUTE` → 2nd row appears with `Remove` button.
- [ ] `Remove` deletes that row; primary row cannot be removed (no `×` on row 0).
- [ ] After 5 routes, `ADD ANOTHER ROUTE` button hides.
- [ ] Refresh indicator on heading: red when any origin/destination is partially filled; green tick when both filled across all rows.

### §10.4 Shipment details (Step 03)

- [ ] Shipping period accepts any free text; required.
- [ ] Brand dropdown shows 8 brands; selecting `Airbus` populates model dropdown with 11 Airbus models.
- [ ] Selecting a different brand resets model to empty placeholder; model dropdown disabled until brand picked.
- [ ] Quantity dropdown shows 01-06; defaults to `01`.
- [ ] All 3 fields required for step completion tick.

### §10.5 Transaction details (Step 04)

- [ ] Transaction type dropdown shows 5 options.
- [ ] Additional information accepts multi-line text up to 2000 chars; counter shown at bottom-right when > 1800 chars.
- [ ] Required validation surfaces on submit.

### §10.6 Contact & company (Step 05)

- [ ] All 4 fields required.
- [ ] Email validates with regex; invalid email → `Please enter a valid email address`.
- [ ] Company website accepts `http://`, `https://`, or bare domain (`yourcompany.com` is valid).
- [ ] Full name min 2 chars.

### §10.7 File upload (§3.11)

- [ ] Drag a file onto dropzone → dropzone highlights `border-brand-red bg-brand-red/5`.
- [ ] Drop → file appears as chip below.
- [ ] Click dropzone → OS file picker opens with accept filter matching `allowedExtensions`.
- [ ] Try to upload a 12MB file → inline error `File too large (max 10MB)`; file not added.
- [ ] Try to upload a 6th file → error `Maximum 5 files`.
- [ ] Try to upload a `.exe` → error `File type not allowed`.
- [ ] Click `×` on chip removes file.
- [ ] Submission with files sends them in FormData; attachments arrive intact in the ops inbox (open one to verify byte-equivalence).
- [ ] Total attachments > 10MB → client-side validation rejects before POST.
- [ ] Server-side validation also rejects oversize (defense in depth; verifiable by curling /api/quote with a fake oversized payload).

### §10.8 Submit + reCAPTCHA + /api/quote + Resend

- [ ] Click Submit with validation errors → inline errors appear, no network call fires.
- [ ] Click Submit with valid data → button shows spinner + `Submitting…`.
- [ ] `grecaptcha.execute` is called; token obtained.
- [ ] POST to `/api/quote` with FormData (verify in Network tab — endpoint is same-origin, not `formspree.io`).
- [ ] Route Handler verifies token with Google's `siteverify` endpoint (visible in Vercel function logs).
- [ ] Route Handler re-runs validation server-side (defense in depth).
- [ ] Route Handler resolves recipient from `quoteFormConfig.recipient_email` (CMS) or `OPS_INBOX_FALLBACK` env.
- [ ] Resend.emails.send fires; email arrives at the resolved recipient within ~10s.
- [ ] Email `from` is `quotes@heliskycargo.com` (verified Resend domain), `reply-to` is the submitter's email.
- [ ] Email subject: `Quote: <company_name> — <mode>`.
- [ ] Email body uses the §7.4 branded HTML template (open in Gmail / Outlook web; verify rendering).
- [ ] Attachments arrive inline in the email.
- [ ] On 4xx from `/api/quote` → red banner with the route's `error` message.
- [ ] On 500 from `/api/quote` → red banner `Something went wrong. Please try again.`
- [ ] On network error → banner `Network error. Please check your connection and try again.`

### §10.9 Success state

- [ ] Form card body swaps to success card (form not visible).
- [ ] `Submit another request` resets state to initial (prefill preserved); form card returns.

### §10.10 Prefill

- [ ] `/quote?mode=Ocean RoRo` → mode preselected, tick visible.
- [ ] `/quote?mode=Ocean RoRo&origin=Dubai&destination=Houston` → routes[0] populated.
- [ ] `/quote?mode=invalid_value` → mode falls back to default `Air Commercial`; no error.
- [ ] Service-detail page → embedded form's mode prefills per slug.
- [ ] Showcase modal → click `Request Quote` while on-page → smooth scroll + form prefills via `CustomEvent`.

### §10.11 CMS toggle behaviors

- [ ] `form_enabled = false` → form hidden, maintenance card shown with `success_message` as the body.
- [ ] `form_mode = "embed"` + valid iframe in `form_embed_code` → iframe renders inside card; React form NOT rendered.
- [ ] `form_mode = "embed"` + invalid HTML (no iframe) → maintenance card with developer-facing console warning.
- [ ] `form_mode = "custom"` + `recipient_email` set → email lands at that address.
- [ ] `form_mode = "custom"` + `recipient_email` empty → email falls back to `OPS_INBOX_FALLBACK` env.
- [ ] Change `recipient_email` in /studio → wait 60s for ISR → next submission lands at the new address. **No code change, no Resend dashboard change, no redeploy.**
- [ ] `success_message` from CMS appears verbatim on success card.
- [ ] `form_endpoint` field has been REMOVED from the schema (2026-05-11) since Resend route owns delivery and there is no editor-configurable endpoint. Schema should NOT have this field; if found, delete it.

### §10.12 Accessibility

- [ ] All required fields have `aria-required="true"`.
- [ ] Fields with errors have `aria-invalid="true"` + `aria-describedby="<id>-error"`.
- [ ] Submit error banner has `role="alert"`.
- [ ] All fields are reachable + operable via keyboard only.
- [ ] Focus rings visible on all interactives.
- [ ] Form survives Lighthouse a11y audit ≥ 95.

---

## 11 — Test plan (LAUNCH GATE — both CMS modes must pass)

Run each test at 375 / 768 / 1024 / 1440. Test the form from EVERY entry point (header, footer, mobile nav, our-solutions, service-detail anchor, showcase-modal, direct /quote, prefill URL).

| #   | Setup                                                                                                       | Action                                  | Expected                                                                                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `form_mode=custom`, `recipient_email` set in CMS, valid Resend API key, valid reCAPTCHA keys                | Fill all required fields, submit        | Success card appears; email arrives at CMS `recipient_email` within ~10s; subject `Quote: <company> — <mode>`; body matches §7.4 template; `from: quotes@heliskycargo.com` |
| 2   | `form_mode=custom`, `form_enabled=false`                                                                    | Visit /quote and any embedded placement | Maintenance card shown everywhere; no form visible                                                                                                                         |
| 3   | `form_mode=embed` + valid Tally iframe pasted in `form_embed_code`                                          | Visit /quote and any embedded placement | Tally iframe renders inside card on all 7 placements; React form NOT rendered; `/api/quote` is bypassed entirely                                                           |
| 4   | `form_mode=embed` + intentionally broken iframe (e.g. with `<script>`)                                      | Visit /quote                            | Sanitizer rejects; maintenance card shown; console warning logged                                                                                                          |
| 5   | `form_mode=custom`, submit with all fields empty                                                            | Click Submit                            | Every required field shows inline error; submit doesn't fire                                                                                                               |
| 6   | `form_mode=custom`, valid data but reCAPTCHA token absent (devtools tamper to clear `g-recaptcha-response`) | Submit                                  | `/api/quote` returns 400; red banner `Spam check failed. Please refresh and try again.`                                                                                    |
| 7   | `form_mode=custom`, attach 11MB file                                                                        | Try to add file                         | Client-side error `File too large`; file not added                                                                                                                         |
| 8   | `form_mode=custom`, attach valid 8MB file + submit                                                          | Submit                                  | File arrives inline as an email attachment (Resend's 40MB envelope easily accommodates 8MB)                                                                                |
| 8b  | Edit CMS `recipient_email` to a different verified address → wait 60s → submit                              | Submit                                  | New submission lands at the NEW address; old one no longer receives. **No deploy, no Resend dashboard change.**                                                            |
| 9   | Direct `/quote?mode=Ocean%20RoRo&origin=Dubai&destination=Houston`                                          | Visit URL                               | Mode preselected; route[0] populated                                                                                                                                       |
| 10  | `/services/ocean-roro` → click any "Request Quote" CTA                                                      | Click                                   | Scrolls to `#request-quote` on same page; embedded form has Ocean RoRo preselected                                                                                         |
| 11  | Showcase modal opens (any tile with relatedServices) → click "Request Quote" while on home                  | Click                                   | Modal closes; smooth scroll to home `#request-quote`; form mode prefilled via CustomEvent                                                                                  |
| 12  | Showcase modal on a page without `#request-quote` (hypothetical)                                            | Click                                   | Falls back to `/quote?mode=…`                                                                                                                                              |
| 13  | Submit form from `/quote` → success → click `Submit another request`                                        | Click                                   | Form resets; default state; can submit a new quote                                                                                                                         |
| 14  | Submit, then immediately re-click Submit (double-click protection)                                          | Double-click                            | Second click no-ops while spinner visible; one Resend send only (verify in Vercel function logs)                                                                           |
| 15  | Add 5 routes, click Remove on route 3                                                                       | Click `×`                               | Route 3 removed; numbering 1,2,3,4; can add a 5th again                                                                                                                    |
| 16  | Fill Step 03 brand=Airbus, model=H125, change brand to Bell                                                 | Brand swap                              | Model dropdown resets to empty; submit blocked with `Please select a model`                                                                                                |
| 17  | Lighthouse audit on `/quote`                                                                                | Run Lighthouse                          | Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95                                                                                                                  |

**All 17 tests must pass on both `form_mode` modes (where applicable) at all 4 viewports before M8 is shipped.**

---

## 12 — Locked decisions (append to `docs/DECISIONS.md` on completion)

These are the non-obvious choices that a reviewer reading the code months later won't infer from the components alone:

1. **`/quote` standalone is a DIFFERENT layout from the embedded `QuoteFormShell`**. Standalone = hero + centered white card; embedded = M3 split-pane with photo on left. Both render the same `<QuoteFormCore />` engine. The visual divergence is documented and intentional (Figma frames `345:9554`/`345:9613` differ from M3 frames `344:5595` etc.).
2. **All 5 steps render expanded on desktop**; mobile uses progressive accordion (01/02 expanded, 03/04/05 collapsed by default with auto-expand on previous-step complete). Matches Figma evidence on both viewports.
3. **Transport mode list canonical order locked**: Air Commercial, Air Charter, Ocean RoRo, Ocean Breakbulk (Lo/Lo), Ocean Container, Land. Replaces the 6-item list in `QuoteFormShell.tsx` which has Air Charter first. Order is structural — the 6 desktop radio widths sum to exactly 1040px in this order.
4. **Helicopter brand → models cascade is hardcoded, NOT in CMS**. `HELICOPTER_MODELS_BY_BRAND` lives in `src/lib/constants.ts`. The Sanity `helicopter_models: string[]` field stays unused as backwards-compat. Industry data is not editorial.
5. **Spam protection = reCAPTCHA v3 invisible** validated **server-side** inside our own `/api/quote` Route Handler (NOT a third-party dashboard). The Route Handler uses `RECAPTCHA_SECRET` to verify the token with Google's `siteverify` endpoint before sending. Supersedes CLAUDE.md §3.4's Turnstile reference (must update CLAUDE.md in the docs pass). User chose reCAPTCHA v3 (not Turnstile) on 2026-05-11; chose server-side verification (not Formspree dashboard) on 2026-05-11 after switching the mail provider to Resend.
6. **Mail delivery = Resend + `/api/quote` Route Handler, NOT Formspree** (DECISIONS 2026-05-11). Reasons: (a) Resend free 3000 emails/mo + 100/day vs Formspree free 50 submissions/mo; (b) Resend supports attachments on free tier (40MB per email post-Base64), Formspree free **doesn't support uploads at all** — paid Personal plan ($10/mo) required just to enable attachments, capped at 25MB per file ([Formspree pricing](https://formspree.io/plans)); (c) Resend reads `recipient_email` from CMS at submit time → true CMS-driven routing matches the client's PDF §4.3 spec literally; (d) emails come from `quotes@heliskycargo.com` (own-domain DKIM/SPF) instead of `no-reply@formspree.io`, passing corporate spam filters more reliably. Trade-off: adds one file (`src/app/api/quote/route.ts`, ~80 lines) — deployed as a Vercel serverless function on the existing hobby tier, no new hosting.
7. **File upload added at the bottom of Step 04** as a deliberate Figma deviation (brief lists upload; Figma doesn't draw it). Max 5 files, 10MB total, allowlist per §3.11. Resend's 40MB email-size cap leaves comfortable headroom; no Formspree-style attachment-size launch risk.
8. **Additional Information field is a `<textarea>`** (rows=3, resize-y) NOT a single-row input as Figma draws it. Placeholder copy implies multi-line content; cap-at-60px would force one-liners.
9. **Step 04 mobile label = `Transaction Details`** everywhere (Figma mobile uses `Transaction Classification` — treated as stale).
10. **Multi-route limit = 5 total (1 base + 4 added)**. Figma doesn't show added-route state — implemented as a vertical stack with per-route `×` remove. Numbering visible above each appended row.
11. **Submit button width is 510px on desktop, NOT full form width**. Figma draws it inside the left column only. Disclaimer sits right-aligned next to it.
12. **Disclaimer Figma typo (`cHANNEL`) is corrected** to all-uppercase + middle-dot separator.
13. **reCAPTCHA badge is hidden via CSS** and replaced with an attribution line below the disclaimer. Required by Google's TOS when hiding the badge.
14. **Form mode `embed` sanitizer allow-lists `<iframe>` only**. No `<script>`, no event handlers. Editor-supplied HTML through Sanity is trusted-but-bounded.
15. **`form_enabled = false` → maintenance card replaces the form everywhere**. Renders the CMS `success_message` as the body (re-purposed as a generic "we'll get back to you" message during maintenance).
16. **Prefill via URL query AND CustomEvent**. URL works for cross-page navigation; CustomEvent works for in-page (showcase modal → `#request-quote` scroll). Both paths converge on `QuoteFormCore`'s prefill merge.
17. **Validation strategy = inline on submit + clear on type**. Submit button stays enabled regardless of validation state (better discoverability). Clicking submit with errors surfaces them; typing into a previously-errored field clears that field's error.
18. **Email template lives in `src/lib/forms/quoteEmailTemplate.ts`** as a single function returning an HTML string. Uses `<table>` layout (Outlook compat), inline styles only (no external CSS), system-font fallback (Inter Tight not reliable in mail clients). Brand red top stripe + section dividers per the HSC color palette. Total size under 100KB (Gmail clips larger).

---

## 13 — Open content questions (resolve with client/PM before launch)

Track these in DECISIONS.md until resolved. Launch-blocking content, not technically-blocking — pages render with placeholder defaults.

1. **Transaction type options** — proposed defaults: Purchase, Sale, Lease, Trade-in, Other. Brief lists "Transaction Details" without enumerating values. Confirm with client.
2. **Helicopter models for non-Airbus brands** — Airbus list is canonical from Figma (11 models). Leonardo/Sikorsky/Bell/Robinson/Boeing/Kaman/K-Max are TODO placeholders with 3-6 representative models each. Client to supply real catalogs.
3. **Ops recipient email** — placeholder in CMS `recipient_email` field. Confirm real address before going live.
4. **Resend account + DNS verification** — client owner needs to create a free Resend account, add `heliskycargo.com` as a sending domain, and add 3 DNS records (SPF/DKIM/DMARC) to verify. Until verified, dev work uses the `onboarding@resend.dev` sandbox sender. Free tier covers 3000 emails/month + 40MB attachments — comfortable for HSC's volume.
5. **Auto-reply email body** — propose a draft, confirm with client.
6. **Allowed file types** — proposed defaults: PDF, Word, Excel, PNG, JPG, DWG, DXF. Confirm with ops if other formats (CAD STEP, IGES, etc.) are needed.
7. **Spam protection budget** — reCAPTCHA v3 free tier is 1M calls/month, more than enough. No action needed.
8. **`/quote` SEO metadata** — title, description, OG image. Use defaults from `layout.tsx`; refine post-launch.

---

## 14 — File-by-file diff summary (target end state)

| File                                                         | Change              | Why                                                                                                                                                                                                                  |
| ------------------------------------------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `src/app/(marketing)/quote/page.tsx`                         | NEW                 | Standalone /quote route; replaces 404s on every existing "Request Quote" link                                                                                                                                        |
| `src/components/sections/quote/QuoteHero.tsx`                | NEW                 | Hero per §3.1                                                                                                                                                                                                        |
| `src/components/sections/quote/QuoteFormCore.tsx`            | NEW                 | Form engine — state, validation, submit, reCAPTCHA, success/error                                                                                                                                                    |
| `src/components/sections/quote/QuoteFormEmbedded.tsx`        | NEW                 | Iframe render path with sanitizer                                                                                                                                                                                    |
| `src/components/sections/quote/QuoteFormSuccess.tsx`         | NEW                 | Success card per §3.9                                                                                                                                                                                                |
| `src/components/sections/quote/QuoteFormErrorBanner.tsx`     | NEW                 | Top-of-form error banner per §3.10                                                                                                                                                                                   |
| `src/components/sections/quote/QuoteFormDisabled.tsx`        | NEW                 | Maintenance card when `form_enabled=false`                                                                                                                                                                           |
| `src/components/sections/quote/steps/Step01..Step05.tsx`     | NEW (×5)            | Per-step render bodies                                                                                                                                                                                               |
| `src/components/sections/quote/fields/*.tsx`                 | NEW                 | TextField, TextareaField, SelectField, ModeRadioGrid, ModeMobilePill, FileDropzone                                                                                                                                   |
| `src/components/icons/quote/*.tsx`                           | NEW                 | Inline SVG icons                                                                                                                                                                                                     |
| `src/components/sections/_shared/QuoteFormShell.tsx`         | EXTEND              | Replace the M3 visual placeholders with `<QuoteFormCore variant="embedded" />`; left column unchanged                                                                                                                |
| `src/components/layout/Header.tsx`                           | unchanged           | `/quote` link already wired                                                                                                                                                                                          |
| `src/components/layout/MobileNav.tsx`                        | unchanged           | same                                                                                                                                                                                                                 |
| `src/components/sections/home/OurSolutions.tsx`              | unchanged           | same                                                                                                                                                                                                                 |
| `src/components/sections/service-detail/ServiceOverview.tsx` | unchanged           | `#request-quote` anchor already wired; embedded form receives `defaultMode` via page-level prop                                                                                                                      |
| `src/components/sections/service-detail/WhenToChoose.tsx`    | unchanged           | same                                                                                                                                                                                                                 |
| `src/components/sections/_shared/ShowcaseModal.tsx`          | MODIFY              | Dispatch `hsc:quote-prefill` CustomEvent before scrollIntoView; query-string fallback when navigating to /quote                                                                                                      |
| `src/app/(marketing)/page.tsx`                               | unchanged           | embedded form still renders; no prefill                                                                                                                                                                              |
| `src/app/(marketing)/services/page.tsx`                      | unchanged           | embedded form; no prefill                                                                                                                                                                                            |
| `src/app/(marketing)/services/[slug]/page.tsx`               | MODIFY              | Pass `<QuoteFormShell defaultMode={QUOTE_MODE_BY_SERVICE_SLUG[slug]} />`                                                                                                                                             |
| `src/app/(marketing)/why-choose-us/page.tsx`                 | unchanged           | embedded form; no prefill                                                                                                                                                                                            |
| `src/app/(marketing)/team/page.tsx`                          | unchanged           | embedded form; no prefill                                                                                                                                                                                            |
| `src/app/(marketing)/showcase/page.tsx`                      | unchanged           | embedded form; no prefill                                                                                                                                                                                            |
| `src/app/layout.tsx` (or `(marketing)/layout.tsx`)           | MODIFY              | Add reCAPTCHA `<Script />` tag                                                                                                                                                                                       |
| `src/app/globals.css`                                        | MODIFY              | Add `.grecaptcha-badge { visibility: hidden; }`                                                                                                                                                                      |
| `src/lib/constants.ts`                                       | MODIFY              | Add TRANSPORT_MODES, HELICOPTER_BRANDS, HELICOPTER_MODELS_BY_BRAND, QUANTITIES, TRANSACTION_TYPES, QUOTE_MODE_BY_SERVICE_SLUG, QUOTE_FILE_LIMITS, QUOTE_HERO, QUOTE_FORM_DEFAULTS                                    |
| `src/lib/forms/quoteForm.ts`                                 | NEW                 | Client-side validators + submitQuoteForm helper (POSTs to /api/quote)                                                                                                                                                |
| `src/lib/forms/quoteEmailTemplate.ts`                        | NEW                 | `buildQuoteEmailHtml(formData)` — branded HTML email rendered server-side inside /api/quote                                                                                                                          |
| `src/types/quoteForm.ts`                                     | NEW                 | Form state + config + result types                                                                                                                                                                                   |
| `src/app/api/quote/route.ts`                                 | NEW                 | POST handler — verifies reCAPTCHA server-side, runs server validation, resolves recipient from CMS, sends via Resend                                                                                                 |
| `src/lib/sanity/queries.ts`                                  | unchanged           | quoteFormConfigQuery already exists                                                                                                                                                                                  |
| `src/sanity/schemas/quoteFormConfig.ts`                      | MODIFIED 2026-05-11 | Removed `form_endpoint` field (vestigial Formspree-era; Resend route owns delivery). Update `recipient_email` field description to clarify "drives delivery in custom mode via /api/quote → Resend at submit time"   |
| `scripts/seed-sanity.mjs`                                    | EXTEND              | Add `seedQuoteFormConfig()` with `--form-mode=custom                                                                                                                                                                 | embed` flag |
| `.env.example`                                               | MODIFY              | Add NEXT_PUBLIC_RECAPTCHA_SITE_KEY, RECAPTCHA_SECRET, RESEND_API_KEY, RESEND_FROM_EMAIL, OPS_INBOX_FALLBACK                                                                                                          |
| `package.json`                                               | MODIFY              | Add `resend` dependency (~12KB, server-only)                                                                                                                                                                         |
| `CLAUDE.md`                                                  | MODIFY              | §3.4 swap Turnstile→reCAPTCHA v3 (server-verified); §3.4 swap Formspree→Resend; §8 add reCAPTCHA attribution note; §2 update "Currently working on"; §10 remove the Formspree file-size open question (now resolved) |
| `docs/DECISIONS.md`                                          | APPEND              | The 18 locked decisions in §12                                                                                                                                                                                       |

---

## 15 — Client requirement compliance audit (PDF §4.2 + §4.3)

This is an explicit walk through the original client requirement (PDF screenshot received 2026-05-11) to prove M8 ships against spec — not against a reinterpretation. Every cell below must read ✅ before launch.

### §15.1 PDF §4.2 — CMS Fields (Singleton)

The client's PDF lists exactly **6 fields**. Our schema (`src/sanity/schemas/quoteFormConfig.ts`) preserves all 6 verbatim AND adds 5 optional fields gated behind a `form_mode` radio. The extension is non-breaking: setting `form_mode = "embed"` makes the frontend behave identically to the literal PDF interpretation (read `form_embed_code`, render). Setting `form_mode = "custom"` opts into the Figma-matching React form.

| #   | Client field      | Client type | Client notes                                                 | M8 schema field   | M8 implementation                                                                                                                                                                                                                                                                                                                                | Status |
| --- | ----------------- | ----------- | ------------------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| 1   | `hero_headline`   | String      | "Share Your Shipment Details — We'll Handle The Rest."       | `hero_headline`   | Sanity string; `initialValue` matches the PDF copy verbatim. `/quote` page reads it; falls back to `QUOTE_HERO.eyebrow + headline` constant if CMS is empty.                                                                                                                                                                                     | ✅     |
| 2   | `hero_image`      | Image       | Aircraft hero background                                     | `hero_image`      | Sanity image with hotspot. `/quote` page passes it to `QuoteHero`; falls back to `/public/quote/helicopter.webp`.                                                                                                                                                                                                                                | ✅     |
| 3   | `form_embed_code` | Code / Text | HTML embed snippet OR config JSON from external form service | `form_embed_code` | Sanity text (rows 8). Path A literal: `form_mode === "embed"` → frontend reads the value, sanitizes to `<iframe>`-only allow-list, renders. Path B "config JSON" interpretation: we extended to native Sanity fields (#7-#11 below) for better editor UX instead of stuffing JSON in this field. Editor flips between paths with `form_mode`.    | ✅     |
| 4   | `recipient_email` | String      | Ops inbox email for submissions (used by mail service)       | `recipient_email` | Sanity string. **Drives delivery at runtime**: `/api/quote` reads this from Sanity at submit time and passes it to Resend's `to:` field. Editor changes the value in /studio → next submission lands at the new address within the 60s ISR window. No deploy, no provider dashboard change. Falls back to `OPS_INBOX_FALLBACK` env var if empty. | ✅     |
| 5   | `success_message` | Text        | Confirmation message shown after submit                      | `success_message` | Sanity text. Used verbatim as the body of the success card (§3.9) and as the maintenance-card body when `form_enabled = false`.                                                                                                                                                                                                                  | ✅     |
| 6   | `form_enabled`    | Boolean     | Toggle form on/off (e.g. during maintenance)                 | `form_enabled`    | Sanity boolean. When `false`, the form is hidden everywhere (`/quote` AND all 6 embedded placements) and replaced with a maintenance card rendering `success_message` as the body.                                                                                                                                                               | ✅     |

**Extended (non-spec) fields, only active when `form_mode === "custom"`:**

| #   | Field               | Purpose                                                                                                                                                                                                                           |
| --- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7   | `form_mode`         | Radio: `custom` (Figma-matching React form) vs `embed` (literal PDF interpretation: iframe-only).                                                                                                                                 |
| 8   | ~~`form_endpoint`~~ | **Removed from schema 2026-05-11.** Originally added 2026-04-29 for the Formspree-style "paste an endpoint URL" pattern. Now obsolete: Resend route owns delivery, recipient comes from `recipient_email`. No replacement needed. |
| 9   | `transport_modes`   | Array — Step 1 options. Falls back to `TRANSPORT_MODES` constant.                                                                                                                                                                 |
| 10  | `helicopter_models` | Array — flat list. Treated as TODO for cascading; brand→model map lives in code (see §5.4).                                                                                                                                       |
| 11  | `transaction_types` | Array — Step 4 options. Falls back to `TRANSACTION_TYPES` constant.                                                                                                                                                               |
| 12  | `step_titles`       | Object — optional per-step label overrides. Falls back to hardcoded step titles.                                                                                                                                                  |

**Why we extended the 6-field spec (Path B):** the PDF's "config JSON from external form service" wording admits two interpretations:

- **Literal**: the editor pastes a JSON blob like `{"endpoint":"https://...","modes":["..."]}` and the frontend parses it. Rejected because editors copy-pasting JSON is error-prone (a missing brace breaks the form).
- **Spirit**: the CMS holds the form's configuration. Implemented as 5 individual Sanity fields with native Studio UX (array picker, URL validator, etc.). Editor friendliness wins, schema growth is small, and `form_mode = "embed"` preserves the literal path as a one-click fallback.

The DECISIONS 2026-04-29 entry ("Quote form: schema supports BOTH iframe AND custom React paths via `form_mode` toggle") locked this; §15 here is the explicit audit.

### §15.2 PDF §4.3 — How It Works

| Client statement                                                                                             | M8 implementation                                                                                                                                                                                                                                                                                                                                                                   | Status |
| ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| **Form rendering**: "frontend reads the embed code / config from the CMS and renders the form"               | `app/(marketing)/quote/page.tsx` (Server Component) calls `fetchWithCmsFallback(quoteFormConfigQuery, …)`. Branches on `form_mode`: `embed` → renders sanitized iframe; `custom` → renders `<QuoteFormCore />` with config fields (transport_modes, etc.) seeded from CMS. The same branching applies inside the embedded `QuoteFormShell` on home/services/etc.                    | ✅     |
| **On submit**: "Form data is sent directly to the external mail service (not to the CMS)"                    | Custom path: browser POSTs FormData to our own `/api/quote` Route Handler (same Next.js project, no separate backend). The Route Handler verifies reCAPTCHA, then forwards directly to Resend's API. Sanity is queried only to resolve the recipient — never written to. Embed path: the iframe owns submission; data goes directly from the third-party provider to their service. | ✅     |
| **Email delivery**: "mail service sends the quote request to the configured recipient email"                 | Resend (our "external mail service") delivers the email to the address pulled from Sanity's `recipient_email` at submit time. Editor changes the CMS value → next submission goes to the new recipient. Falls back to `OPS_INBOX_FALLBACK` env if CMS is empty. Truly CMS-driven, matches the spec literally.                                                                       | ✅     |
| **No CMS submissions table**: "Quote data lives in the email inbox / mail service dashboard, not in the CMS" | Sanity never receives submission data. Verifiable: no mutations against the Sanity client (`useCdn: true` read-only client for all reads, and `/api/quote` only calls `.fetch()` — no `.create()` or `.patch()`). Submissions land in the ops inbox + Resend's send-log dashboard.                                                                                                  | ✅     |

### §15.3 `recipient_email` workflow — resolved (no nuance)

**Earlier in the project (2026-05-11 morning)** we considered Formspree, which would have made `recipient_email` editor-reference only (the value would live in Sanity but Formspree's dashboard would actually own delivery). That created a workflow nuance the client would have had to sign off on.

**Post-decision (2026-05-11 evening)** we switched to **Resend + `/api/quote`** which removes the nuance entirely. The Route Handler reads `quoteFormConfig.recipient_email` from Sanity at submit time and passes it directly to Resend's `to:` field. Editor changes the value in /studio → within 60s (ISR) the new submission lands at the new address. No dashboard updates, no Formspree allow-list, no two-step procedure.

**Security**: Resend requires the recipient address to be a normal email (any valid RFC 5322 inbox). The sender (`from:`) must match the Resend-verified domain — that's how Resend prevents impersonation. Since `from:` is a fixed env var (`RESEND_FROM_EMAIL`) and only the recipient is dynamic, and only authenticated CMS editors can change Sanity values, there's no spam-relay risk.

**Edge cases**:

- CMS `recipient_email` empty → falls back to `OPS_INBOX_FALLBACK` env var (set at deploy).
- CMS `recipient_email` malformed (typo, not an email) → Route Handler rejects with `Invalid recipient configured. Please contact dev.` Logged to Vercel function logs.
- CMS edit hasn't propagated yet (ISR cache cold) → can take up to 60s. Document at handover; consider triggering on-demand revalidation via webhook later if it becomes a UX issue.

### §15.4 Mail service identity reconciliation

The PDF says "external mail service" without naming one. M8 settled on **Resend** (DECISIONS 2026-05-11) — a transactional email API that fits the "external mail service" phrasing exactly: it's external to our app, it's a mail service. No conflict with the PDF; the PDF intentionally left provider-agnostic.

### §15.5 Verification before shipping

The M8 implementation session MUST verify each row in the §15.1 + §15.2 tables on the live deployment by:

1. Editing `quoteFormConfig` in `/studio` → setting each of the 6 client-spec fields to a distinct test value.
2. Refreshing `/quote` after the 60s ISR window (or triggering on-demand revalidation).
3. Confirming each value appears in the rendered output (hero copy from `hero_headline`, success card body from `success_message`, etc.).
4. Toggling `form_mode` between `custom` and `embed` and confirming the form swaps without a redeploy.
5. Toggling `form_enabled` and confirming the maintenance card appears.

This is the same as test #1, #2, #3 in §11 — but with the explicit lens of "every PDF §4.2 / §4.3 line item is observably true."

---

## 16 — Out of scope (M9 polish or post-launch)

- Phone number field (Figma doesn't show one).
- "Other..." free-text quantity input when > 06.
- Per-brand model catalogs beyond Airbus (TODO content placeholders ship for the other 7 brands).
- Form analytics events (no analytics tool at launch per DECISIONS 2026-04-28).
- Multi-language support.
- A "save draft" / resume functionality.
- Custom thank-you redirect URL after submission.
- File-upload preview thumbnails for image attachments.

---

**End of M8 plan. Next session: read this doc cold, follow the §0 autonomous workflow, ship.**
