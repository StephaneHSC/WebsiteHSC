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
