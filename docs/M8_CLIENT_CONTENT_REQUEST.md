# M8 — Client Content Request

> **Purpose**: every item below is something the M8 build needs from the client (or PM) **before launch on 2026-05-24**. Each entry lists what we shipped as a temporary default, what we need, who to ask, and why it matters. Figma was silent on each one — we improvised reasonable placeholders so the page renders and the form works, but the placeholders carry brand risk if they go live unverified.

**Status legend**:

- 🟡 SHIPPED WITH PLACEHOLDER — page renders, content is improvised
- 🟠 NEEDS CONFIRMATION — placeholder may be correct; confirm in writing
- 🔴 LAUNCH-BLOCKING — must have real value before production cutover (else form delivery / domain / spam check fails)

---

## 1. 🔴 Cloudflare Turnstile — widget mode

**What we shipped**: code that assumes the Turnstile widget on the Cloudflare dashboard is in **Invisible** mode (no checkbox, fires silently on submit). Site key + secret are loaded from `.env.local` (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`).

**What we need from the client / DevOps**:

1. Confirm the Cloudflare Turnstile widget for `heliskycargo.com` is set to **Widget Mode: Invisible**.
2. Confirm the **Domains** list contains: `localhost`, `heliskycargo.com`, AND the staging Vercel URL (e.g. `heliskycargo-staging.vercel.app`).
3. (Optional) Disable the **"Verify the origin of reCAPTCHA solutions"** checkbox if Vercel preview deploys need to use the same widget — preview subdomains rotate per PR and can't all be allowlisted.

**Why it matters**: Tested with Cloudflare's documented test sitekey `1x00000000000000000000AA` (always-passes invisible) and submission completes end-to-end. With the real production key, the widget never fires a token — which means it's been configured as **Managed** (visible checkbox) rather than **Invisible**. The user-facing symptom is a friendly banner: _"We couldn't verify your browser. Please refresh the page and submit again."_

**How to verify**: switch to Invisible in the Cloudflare dashboard, reload `/quote`, fill required fields, click Submit. Success card should appear within ~5 seconds.

---

## 2. 🔴 Resend domain verification — DNS records

**What we shipped**: `/api/quote` Route Handler sends mail through Resend. During dev we use the sandbox sender `onboarding@resend.dev` (which only delivers to the Resend account owner's own inbox — typically the developer's signup email).

**What we need from the client**:

1. Add 3 DNS records (SPF / DKIM / DMARC TXT records) to `heliskycargo.com` to verify the domain inside Resend. Resend's dashboard generates the exact records — copy verbatim.
2. After Resend shows the domain as **Verified**, send the dev team a confirmation so we can swap `RESEND_FROM_EMAIL` from `onboarding@resend.dev` to `Heli SkyCargo <quotes@heliskycargo.com>` in Vercel production env.

**Why it matters**: until verification, submissions only land at the Resend account owner's email regardless of `recipient_email` in CMS. Once verified, every submission lands at the real ops inbox.

**Owner**: whoever controls `heliskycargo.com` DNS (likely the client's IT team or the original registrar admin).

**ETA expected**: same day if DNS propagation is fast; up to 30 min usually.

---

## 3. 🔴 Ops inbox — real `recipient_email`

**What we shipped**: Sanity `quoteFormConfig.recipient_email` seeded with placeholder `ops@heliskycargo.com`. If empty, `/api/quote` falls back to the `OPS_INBOX_FALLBACK` env var (currently the dev's personal email).

**What we need from the client**:

- The exact email address(es) that should receive quote submissions in production.
- If multiple — currently we only support ONE recipient. Confirm whether we should support multiple (small code change, ~10 lines).

**Why it matters**: submissions land here forever. Wrong address = lost leads.

**Edit path** for the client post-launch: `/studio` → Quote Form Configuration → Recipient email. Change propagates to live submissions within 60 seconds (ISR window).

---

## 4. 🟠 Transaction-type options (Step 04 dropdown)

**What we shipped** (PT-improvised, Figma silent):

```
- Purchase
- Sale
- Lease
- Trade-in
- Other
```

**What we need from the client / ops team**:

- Confirm the list is complete and correctly named.
- Common alternatives we considered but rejected: _Acquisition / Disposition / Repositioning / Repair return / Insurance claim_. If any of these match real ops categories better, swap.
- Confirm ordering (alphabetical vs frequency-of-use).

**Why it matters**: tells the ops team how to triage at a glance. A submission for a "Trade-in" might route differently than a "Purchase."

**Where defined**: `src/lib/constants.ts` → `QUOTE_TRANSACTION_TYPES`. Also seeded into Sanity at `quoteFormConfig.transaction_types`.

---

## 5. 🟠 Helicopter model catalogs (Step 03 — Brand → Model cascade)

**What we shipped**: Airbus has 11 canonical models pulled from Figma. The other 7 brands carry **improvised** model lists based on the manufacturer's most common public-knowledge offerings:

| Brand          | Improvised models (need confirmation)                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| **Airbus** ✅  | H125, H130, H145, H160, H170, AS332L1, AS332L2, SUPERPUMA, AS365N2, AS365N3, BK117 (canonical — from Figma) |
| Leonardo 🟠    | AW109, AW119, AW139, AW169, AW189                                                                           |
| Sikorsky 🟠    | S-76, S-92, CH-53                                                                                           |
| Bell 🟠        | 206, 407, 412, 429, 505, 525                                                                                |
| Robinson 🟠    | R22, R44, R66                                                                                               |
| Boeing 🟠      | CH-47, AH-6, MH-6                                                                                           |
| Kaman model 🟠 | K-MAX, SH-2G                                                                                                |
| K-Max 🟠       | K-1200, K-MAX-TITAN                                                                                         |

**What we need from the client / aviation expert**:

1. **Add missing models** that Heli Skycargo regularly ships (especially anything in active rotation).
2. **Remove models** that are out-of-scope (e.g. heavy-military variants Heli Skycargo doesn't handle).
3. **Disambiguate "Kaman model" vs "K-Max"** — Figma listed them as two separate brands but K-Max is a Kaman product. Are these intentionally separate? Likely just merge "K-Max" into "Kaman" with K-1200 / K-MAX as models.
4. **Confirm exact spelling** (e.g. `SUPERPUMA` vs `Super Puma` vs `AS332 Super Puma`).

**Why it matters**: customers expect to see their model in the dropdown. Missing models force them to pick "wrong" entries or abandon the form.

**Where defined**: `src/lib/constants.ts` → `QUOTE_HELICOPTER_BRANDS` + `QUOTE_HELICOPTER_MODELS_BY_BRAND`.

**Possible fast-fix**: replace the dropdown's static list with a CMS array per brand, so the editor can add models without redeploy. Trade-off: one extra schema field per brand and the editor has to maintain the lists. Skipped for v1 since the data is industry-stable.

---

## 6. 🟠 Auto-reply email body

**What we shipped**: NONE. Currently only the commercial team gets an email; the submitter just sees a success card on the page. The success-card body comes from Sanity `quoteFormConfig.success_message` (currently: _"Thank you for your enquiry. Our commercial team will reply within 24 hours."_).

**What we need from the client**:

Do we want to also send the submitter an automated confirmation email? If yes:

1. **Subject line**: proposed `Heli Skycargo — your quote request was received`
2. **Body content** — proposed (improvise, please edit):
   > _Hello [first name],_
   >
   > _Thanks for reaching out to Heli Skycargo. We've received your quote request for **[mode]** transport between **[origin]** and **[destination]** and our operations team will get back to you within 24 business hours with next steps and a tailored proposal._
   >
   > _If you need to add anything in the meantime, just reply to this email._
   >
   > _The Heli Skycargo team_
3. **From** address: same `quotes@heliskycargo.com` as ops emails, or a separate `noreply@heliskycargo.com`?

**Why it matters**: a confirmation email reassures the customer their request actually went through. ~30 min of dev work to add (extra Resend send inside `/api/quote`).

**Decision needed before launch**: YES or NO. If YES, content above.

---

## 7. 🟠 Allowed attachment file types

**What we shipped** (improvised based on industry norms):

```
.pdf .doc .docx .xls .xlsx .png .jpg .jpeg .dwg .dxf
```

Max 5 files, **10 MB total** across all attachments.

**What we need from the client / ops**:

1. Confirm the list covers what customers typically attach (manifests, CAD drawings, photos, inspection reports).
2. Confirm whether to add: `.zip` (compressed manifests), `.step` / `.iges` (CAD interchange formats), `.heic` (iPhone photos).
3. Confirm the 10 MB total cap (Resend's 40 MB hard cap minus Base64 overhead would let us go up to ~30 MB total — but bigger emails get clipped by Gmail and trigger spam filters).

**Why it matters**: rejecting a customer's CAD file at submit time loses leads. Accepting `.exe` is a security risk.

**Where defined**: `src/lib/constants.ts` → `QUOTE_FILE_LIMITS`.

---

## 8a. 🟠 QuoteFormShell hero photo — Antonov cargo plane

**What we shipped**: `/public/quote/services-quote.webp` and `/public/quote/home-quote.webp` (existing assets).

**What Figma shows**: The shell hero photo is an **Antonov AN-124-100 cargo plane** on the tarmac (per the desktop frame the user shared 2026-05-13). Currently the shell uses a different photo (helicopter-rotor / sunset airport scene).

**What we need from the client**:

1. The AN-124-100 photo at ≥2400px wide (or whatever resolution is available).
2. Confirm whether ALL embedded-shell placements (home / services / showcase / team / why-choose-us / service-detail) should use the same photo, or if each page should have its own.
3. (If mobile differs) confirm the mobile-shell photo — Figma mobile frame shows a red-tinted helicopter loading scene, while desktop shows the Antonov plane.

**Why it matters**: hero photo is the first visual on every page hosting the embedded shell. Wrong photo = brand inconsistency.

**Where defined**: each consumer page passes `photo={{ src, alt }}` to `<QuoteFormShell />`. Just drop the new file under `/public/quote/` and update the page-level `src` strings.

---

## 8. 🟠 Hero copy + photo

**What we shipped**:

- **Hero headline** (verbatim from Figma `345:9554`): `Share Your Shipment Details / We'll Handle The Rest.`
- **Hero photo** (already in repo): `/public/quote/helicopter.webp` — a helicopter at a sunlit airport with vested ground crew.
- **Eyebrow pill**: `REQUEST A QUOTE` (Figma-canonical)

**What we need from the client**:

1. Sign off on the headline copy (or send a better one — see below).
2. Sign off on the photo (or supply a replacement). Specifically: photo should be **≥ 2400px wide** for retina at 1920px viewports. Current `helicopter.webp` is ~1920px wide — borderline.
3. (Optional override) Both `hero_headline` and `hero_image` can be overridden via Sanity `quoteFormConfig` without code change — editor sees the field in `/studio`.

**Why it matters**: hero is the LCP element. Fuzzy hero = bad first impression.

---

## 9. 🟢 Phone number field (Step 05)

**What we shipped**: NONE. Figma `345:9613` shows only Company / Website / Full Name / Email. No phone.

**Question for the client**: Should we add a phone field? Ops teams often want a phone number for urgent quotes.

**If yes**:

- Position: new Row 3 left in Step 05, with Email shifted to Row 3 right and Website moved to Row 1 right (preserves the 2x2 grid).
- Type: free-text input (no E.164 mask — international callers, multiple formats acceptable).
- Validation: optional or required? Default proposed = optional.
- ETA: ~20 min of dev work.

**Decision needed before launch**: YES or NO.

---

## 10. 🟢 SEO metadata for /quote

**What we shipped**:

```
<title>Request a Quote | Heli Skycargo</title>
<meta name="description" content="Tell us about your helicopter shipment — origin, destination, aircraft, and timeline. Our ops team replies within 24 hours.">
```

No custom OG image — falls back to the site's default OG image.

**What we need from the client / SEO consultant**:

1. (Optional) A keyword-tuned meta description if SEO matters for `/quote` (it's a conversion page; usually not a primary SEO target).
2. (Optional) A custom 1200×630 OG image for social-share previews (e.g. when someone posts the `/quote` URL on LinkedIn). Default site OG works fine if no special version is needed.

**Why it matters**: low — `/quote` is rarely indexed (transactional intent). Skip unless the client cares.

---

## 11. 🟢 Multiple-route limit (Step 02)

**What we shipped**: **5 routes total** (1 base + 4 added via "Add Another Route" button). Hard-coded.

**Question for the client**: Is 5 enough? For complex multi-leg shipments (e.g. transit via 3 ports + final destination), customers might want more.

**Trade-off**: each extra route doubles the input fields. 5 is already a lot of fields. If customers regularly need 10+ legs, we should consider a different UX (e.g. comma-separated text area, or "Attach a route sheet" instead).

**Default decision**: keep at 5 unless ops reports it's too few.

---

## 12. 🟢 Cookie / Privacy banner

**What we shipped**: NONE. The form doesn't set cookies. Cloudflare Turnstile sets none in invisible mode. Resend never reaches the browser.

**Question for the client / legal**: Does Heli Skycargo's privacy policy require a cookie banner anyway (e.g. for EU GDPR-strict markets)? The current Privacy Statement is `/privacy` (404 placeholder, M9 work).

**Why it matters**: low. Form submissions are explicit user action (not tracking). No banner is the cleanest UX and is GDPR-compliant for purely transactional forms.

---

## 13. 🟢 Form analytics

**What we shipped**: NONE. Per the project-level decision (`DECISIONS.md` 2026-04-28), no analytics at launch.

**Question for the client**: Would they like to track:

- Quote-form view count
- Step abandonment (which step do users drop off at?)
- Submit conversion rate

**If yes**:

- Add Plausible (free up to 10k pageviews/mo, no cookies needed)
- Or Vercel Analytics (free on hobby tier)
- Both are ~10 min of setup.

**Default decision**: skip unless explicitly requested.

---

## Summary — what BLOCKS the production launch on 2026-05-24

1. **Cloudflare widget set to Invisible mode** (§1) — needs 2 min in the dashboard.
2. **Resend DNS verified** for `heliskycargo.com` (§2) — needs the client / IT to add 3 TXT records.
3. **Real `recipient_email` in CMS** (§3) — needs the client to confirm which inbox.

Everything else (transaction types, model catalogs, hero copy, auto-reply, etc.) ships with reasonable defaults — pages render and the form works. We accept the brand risk of placeholders going live unverified, and improve as content arrives.

---

## Where this list lives

- This file (`docs/M8_CLIENT_CONTENT_REQUEST.md`) is the authoritative working copy.
- Cross-reference: `docs/M8_PLAN.md` §13 has the original "Open content questions" list. This doc supersedes it with structured asks + reasonable defaults already in place.
- Cross-reference: `docs/DECISIONS.md` 2026-05-12 entries 4, 6, 7 cover the architectural reasons behind the defaults.

**Owner**: dev team to keep updated as questions get answered. Move resolved items into `DECISIONS.md` and strike them through here.
