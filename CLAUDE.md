# CLAUDE.md — Project Context & Working Agreement

@AGENTS.md

> **Read this file at the start of every session.** It contains the standing rules, architecture decisions, and conventions for this project. Do not violate these without explicit confirmation from the developer.

> **Important — Next.js 16 + Tailwind v4**: This project runs Next.js 16 (released after the Jan 2026 cutoff for many model training datasets) and Tailwind v4 (CSS-based config, no JS config file). Conventions, APIs, and file structure may differ from older Next.js / Tailwind documentation. When in doubt, consult `node_modules/next/dist/docs/` (per AGENTS.md) and Tailwind v4 docs before assuming v3 patterns.

---

## 1. Project Snapshot

- **Client website** — corporate marketing site (services + showcase + quote form)
- **Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Sanity CMS
- **Frontend hosting**: Vercel
- **CMS hosting**: Sanity (managed, free tier)
- **Form handling**: External (Formspree / Resend / mail API) — NO form data is stored in the CMS or DB
- **Timeline**: 1 month build + 6-week warranty
- **Maintainer**: The dev team will maintain post-launch
- **Detailed scope**: see `.claude/PROJECT_BRIEF.md` (full project narrative)
- **CMS field specs**: see `docs/CMS_SCHEMAS.md` (engineering reference for handover)
- **Design source**: Figma (dev seat, MCP `figma-remote-mcp` connected) — see `.claude/FIGMA_GUIDE.md`. Figma has BOTH desktop and mobile frames for every module — implement both.
- **Dated timeline**: see `docs/TIMELINE.md` — production deploy target **2026-05-24 (Sun)**
- **Decisions log**: see `docs/DECISIONS.md` (committed — append-only architecture log)

---

## Top-line, non-negotiable rules

1. **Mobile-first, responsive on every breakpoint.** Build for 375px first, then `md:` (768), `lg:` (1024), `xl:` (1440). Test every component at all four widths before claiming done. Figma has dedicated mobile frames — there is no excuse for "we'll fix mobile later".
2. **Modular, composable code.** Each component is single-responsibility, lives in one file, has a typed props interface, and is reusable. No 500-line components. No copy-paste sections — extract a shared component.
3. **Static-first.** Server Components by default. Client only when interactivity demands it.
4. **No new dependencies without asking.** Every package install is a decision.
5. **Match the design.** Don't invent — implement the Figma frame.

---

## 2. Pages & Modules (9 total)

The project is split into 9 modules. Each module gets its own focused work session. Do not mix work across modules unless explicitly told to.

1. **Setup & Foundation** ← current focus when this section is empty
2. Home Page
3. Services Listing
4. Service Detail Pages (×6, single template)
5. Why Choose Us page
6. Our Team page
7. Shipment Showcase (filterable gallery + modal)
8. Request a Quote (multi-step form)
9. Mobile & Polish

**Currently working on**: M8 — Request a Quote shipped (round-3 polish complete). Standalone `/quote` + embedded `QuoteFormShell` (home / services / service-detail / why-choose-us / team / showcase) share a single `QuoteFormCore` (5 steps: Mode / Route / Shipment / Transaction / Contact). Spam = **Cloudflare Turnstile** (invisible, server-verified via `/api/quote`); mail = **Resend** + Node-runtime route handler reading `recipient_email` from Sanity at submit time. **Variant differences** (matters for review): standalone shows all 5 steps expanded on desktop + has attachments dropzone + multi-route "Add Another Route" + canonical 6-mode order (Air Commercial first, includes "(Lo/Lo)" suffix); embedded shell collapses ALL 5 steps into accordion at every breakpoint + drops attachments + drops multi-route + uses different mode order (Air Charter first, strips "(Lo/Lo)" label) + uses smaller 2-row textarea + labels Step 04 "Transaction Classification" (standalone: "Transaction Details"). **Touched-aware indicators**: untouched step → no icon, touched + valid → green tick, touched + invalid → red refresh. **Validation**: mode of transport (Step 01) has no pre-selected default and is required (client asked 2026-07-13; previously defaulted to "Air Commercial"); helicopter brand + quantity stay OPTIONAL (quantity pre-fills "01"); helicopter model and transaction type are REQUIRED as of 2026-07-13 (was OPTIONAL — client changed their mind); all other required fields strict client + server-side. **CMS schema is PDF §4.2 verbatim** — 6 spec fields + `form_mode` toggle. Dead fields (`transport_modes` / `helicopter_models` / `transaction_types` / `step_titles`) removed 2026-05-13 since the frontend used hardcoded constants anyway. `form_mode=embed` renders a sanitized iframe via blocklist (rejects `on*` + `srcdoc` + non-https `src`, accepts everything else — works with Google Forms / Tally / Typeform / etc.); `form_enabled=false` → maintenance card site-wide. Prefill via URL query (`/quote?mode=…&origin=…&destination=…`) AND `hsc:quote-prefill` CustomEvent from ShowcaseModal (mode labels translated via `SHOWCASE_MODE_MAP`). `#request-quote` anchor on all 7 placements. Auto-expand effect bug fixed (was reading post-mutation ref). Submit button "Submit" not "SUBMIT"; no Cloudflare attribution line (Turnstile doesn't require it). Mode-radio inner indicator = solid white filled disc; shell chevron 48px desktop / 44px mobile, thicker stroke. New env: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET` / `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `OPS_INBOX_FALLBACK`. New dep: `resend@^6`. Seed script: `npm run seed:sanity -- --purge` + optional `--form-mode=custom|embed`. `npm run typecheck` + `lint` + `build` clean (16 routes; `/quote` + `/api/quote` dynamic; rest SSG). 39 M8 decisions in `docs/DECISIONS.md` (18 from 2026-05-12 + 21 from 2026-05-13). Open content asks tracked in `docs/M8_CLIENT_CONTENT_REQUEST.md` (helicopter model catalogs / transaction-type list / auto-reply email / Antonov hero photo / Resend DNS). Next: M9 — Mobile & Polish (Lighthouse pass, animation timing, focus rings, content-handover punch list).

---

## 3. Architecture Principles

### 3.1 Static-first, hydrate-only-when-needed

- **Default to Server Components.** Only use `"use client"` when interactivity actually requires it (form state, modals, filters, splash animation, mobile menu).
- **Pre-render everything possible at build time** with `generateStaticParams` and static fetches.
- **ISR with `revalidate: 60`** on pages that read CMS content — keeps Sanity API usage minimal.
- **No client-side fetches to Sanity.** All Sanity queries happen on the server.

### 3.2 Performance budget

- LCP < 2.0s on 4G
- CLS < 0.05
- All images served via Next.js `<Image>` + Sanity image CDN with WebP/AVIF and explicit dimensions
- No layout shift from late-loading fonts (use `next/font` with `display: swap` or preload critical weights)
- Lighthouse Performance ≥ 95 on home page

### 3.3 What's in the CMS vs. hardcoded

**ONLY these 5 areas are CMS-managed** (per the project brief):

1. Team Members (collection)
2. Testimonials / Ratings (collection)
3. Milestones / Timeline (collection)
4. Quote Form Config (singleton — NOT submissions)
5. Stats / KPIs (singleton with repeater)

**Everything else is hardcoded** in the frontend: page copy, service descriptions, navigation, footer, project showcase, partner logos, page layouts. Do not propose adding extra CMS fields without asking.

### 3.4 Forms

- Quote form submissions go through an external service. Do **not** store submissions in Sanity.
- The CMS only stores form configuration (recipient email, embed snippet, hero text).
- Spam protection: Cloudflare Turnstile (free, server-validated).

---

## 4. File Structure

```
/
├── CLAUDE.md                        ← this file
├── docs/
│   ├── PROJECT_BRIEF.md             ← full project scope
│   ├── CMS_SCHEMAS.md               ← Sanity field specifications
│   ├── FIGMA_GUIDE.md               ← Figma usage rules + page links
│   └── DECISIONS.md                 ← architecture decision log (append-only)
├── src/
│   ├── app/
│   │   ├── (marketing)/             ← public pages
│   │   ├── api/                     ← form submission, revalidation webhooks
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                      ← primitives: Button, Card, Modal, Input
│   │   ├── layout/                  ← Header, Footer, MobileNav, SplashScreen
│   │   ├── sections/                ← page-level composites: Hero, ServiceCard, TeamGrid
│   │   └── forms/                   ← QuoteForm, form steps
│   ├── lib/
│   │   ├── sanity/
│   │   │   ├── client.ts            ← read-only client (CDN)
│   │   │   ├── queries.ts           ← all GROQ queries, named exports
│   │   │   └── image.ts             ← urlFor() helper
│   │   ├── utils.ts                 ← cn(), formatters
│   │   └── constants.ts             ← hardcoded site data (services, nav, footer)
│   ├── styles/
│   │   └── tokens.css               ← CSS custom properties (colors, spacing)
│   └── types/
│       └── sanity.ts                ← generated + hand-written types
├── studio/                          ← Sanity Studio (separate Next.js route OR subfolder)
│   ├── schemas/
│   └── sanity.config.ts
└── public/
```

**Component naming**: `PascalCase.tsx`. **Files for hooks/utils**: `camelCase.ts`. **Folders**: `kebab-case`.

---

## 5. Coding Conventions

### TypeScript

- `strict: true` in `tsconfig.json`. No `any` without a `// TODO:` comment explaining why.
- Use `type` for unions/aliases, `interface` for object shapes that may be extended.
- All Sanity query results have explicit return types in `types/sanity.ts`.

### Components

- One component per file. Default export the component.
- Props interface named `<Component>Props`, defined just above the component.
- No prop drilling deeper than 2 levels — lift to a wrapper or use composition.
- Server Components by default. Mark client boundaries narrowly (e.g. only the interactive subtree).

### Styling

- **Tailwind utility classes** for everything except design tokens.
- Design tokens in CSS custom properties (`--color-brand-red`, `--space-1`, etc.) referenced via Tailwind theme extension.
- No inline `style={{}}` except for dynamic values that can't be expressed in Tailwind (e.g. computed transforms).
- Use `cn()` helper (clsx + tailwind-merge) for conditional class composition.

### Imports

- Path aliases: `@/components`, `@/lib`, `@/types`, `@/styles`. No deep relative imports (`../../../`).
- Order: built-ins → third-party → `@/` aliases → relative.

### Accessibility (non-negotiable)

- All interactive elements keyboard-navigable with visible focus rings.
- Images have meaningful `alt` text (or `alt=""` if decorative).
- Forms have associated labels, error messages tied via `aria-describedby`.
- Color contrast ≥ WCAG AA. The brand red on white must be tested for body text use.
- No motion-only feedback (always pair animation with text/icon).

---

## 6. Sanity-Specific Rules

### Queries

- **All GROQ queries live in `src/lib/sanity/queries.ts`** as named exports. Do not write inline GROQ in components.
- Each query has a TypeScript return type in `src/types/sanity.ts`.
- Use **projections** to fetch only needed fields (don't `*[]` everything).
- Use the **CDN client** (`useCdn: true`) for all read operations on the public site.

### Images

- Always use `urlFor(image).width(N).format('webp').quality(80)` for display.
- Always pass `width` and `height` to Next.js `<Image>` (compute from Sanity asset metadata).
- Respect hotspot/crop set by editors.

### API call minimization

- Static fetch + ISR everywhere. Never fetch on every request.
- One on-demand revalidation webhook (`/api/revalidate`) triggered by Sanity on publish.
- Editors expect changes to go live within ~1 minute (per project brief).

---

## 7. Working Agreement With Claude Code

When the developer asks for work, follow this loop:

1. **Read `CLAUDE.md` and the relevant module section in `docs/PROJECT_BRIEF.md`.**
2. **Confirm scope back in 2–3 sentences before writing code** if the request is non-trivial. Ask clarifying questions if anything is ambiguous.
3. **Check Figma** (see `docs/FIGMA_GUIDE.md`) for the specific frame BEFORE generating UI. Do NOT invent layouts — match the design.
4. **Write the smallest amount of code that satisfies the requirement.** Prefer composition over abstraction; don't pre-build for hypothetical future needs.
5. **Update `docs/DECISIONS.md`** when making a non-obvious architectural choice.
6. **At end of session**, summarize what changed and what's next. Update the "Currently working on" line in section 2.

### Things to ALWAYS do

- Run `pnpm typecheck` and `pnpm lint` after non-trivial changes.
- Add a `// TODO:` with developer initials when leaving a deliberate stub.
- Use semantic HTML (`<button>` not `<div onClick>`, `<nav>`, `<section>`, `<article>` etc.).

### Things to NEVER do without asking

- **Commit, push, or merge.** Propose the diff, wait for explicit approval each time. A previous "yes, commit" does not authorize the next commit.
- **Deploy.** Never run `vercel`, `scripts/deploy-staging.sh`, or any deploy command. All deploys (preview, staging, production) are initiated by the maintainer after manager review.
- Add new dependencies (npm packages). Suggest, then wait for approval.
- Change `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, or any root config.
- Add new fields to Sanity schemas beyond what's in `docs/CMS_SCHEMAS.md`.
- Introduce a new state library, animation library, or UI kit.
- Fetch from Sanity client-side.
- Commit `.env*` files or any secret.

### Figma usage discipline (developer doesn't want to abuse MCP)

- The developer has a Figma dev seat and MCP access, but credit/cost is a concern.
- **Default**: developer pastes a Figma frame URL or screenshot into chat.
- **Use Figma MCP only when**: (a) developer explicitly says "pull this from Figma", or (b) you need to inspect exact design tokens (color, spacing, font) that aren't visible in the screenshot.
- Never bulk-pull entire pages. One frame at a time.

---

## 8. Brand & Design Tokens

(Authoritative source: Figma. These are the agreed values to mirror in `tokens.css` and `tailwind.config.ts`.)

```
COLORS  (confirmed from Figma brand frame, 2026-04-28)
--color-brand-red:        #E40C28
--color-brand-red-dark:   #B00A1F   /* derived ~10% darker — confirm hover/active in M1 */
--color-ink:              #101820   /* headlines / primary */
--color-ink-soft:         #3D3D3D   /* body paragraphs */
--color-ink-muted:        #4A4E54   /* secondary / captions */
--color-surface:          #FFFFFF
--color-surface-alt:      #F9F9F9   /* section backgrounds */
--color-border:           #E5E7EB   /* subtle borders — confirm against Figma cards/inputs in M1 */
--color-black:            #000000

TYPOGRAPHY  (Google Fonts via next/font)
--font-display:  "Inter Tight"
  desktop: H1 64/Bold, H2 54/Semibold, H3 36/Semibold
  mobile:  H1 32/Bold, H2 24/Bold,    H3 20/Bold

--font-body:     "PT Sans"
  desktop: P1 18/Bold, P2 16/Regular, P3 15/Regular, sub-heading 24/Bold, highlight 10/Regular
  mobile:  P1 16/Bold, P2 14/Bold,    P3 12/Bold,    sub-heading 16/Bold

SPACING (8pt base)
--space-1: 4px;  --space-2: 8px;  --space-3: 12px;  --space-4: 16px;
--space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;
--space-24: 96px;

BREAKPOINTS (mobile-first; Tailwind defaults)
sm: 640px  md: 768px  lg: 1024px  xl: 1280px  2xl: 1536px

RADIUS
--radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 12px;  --radius-pill: 9999px;
```

---

## 9. Special Assets — Client-Provided Video

The client provided one ~93MB video on Google Drive (already downloaded). **Placement and role unknown** — the PDF says "Hero banner" without specifying media type, and the Figma frame the developer shared shows a **play-on-click pattern** (poster image + red play button overlay), not a background loop. Final placement (which page, which section) is TBD against Figma in Module 2.

**Hosting strategy** (decided 2026-04-28 — free-tier preference):

- **Default (play-on-click featured video)**: YouTube **unlisted** embed. Free, takes 93MB without re-encoding, transcodes adaptively, lazy-loads via iframe, doesn't impact LCP because video only loads on click. Use `?rel=0` to limit suggested-video chrome.
- **Only if a section needs a muted background loop**: re-encode with ffmpeg → H.264 + WebM, 720p max, ~10–15s, no audio, ≤5MB. Self-host in `/public/`.
  - Reference command: `ffmpeg -i source.mp4 -t 12 -vf "scale=-2:720" -c:v libx264 -crf 28 -an hero.mp4`
- Mux / Cloudflare Stream are out — no usable free tier at production scale.

**Implementation rules** (apply regardless of host):

- Wrap YouTube embeds in a click-to-load poster component so the iframe + YouTube JS only load on user click — saves ~500KB on initial page load.
- Always provide an optimized WebP poster (~150KB).
- For self-hosted `<video>`: include `playsInline` and `muted` for mobile autoplay.
- Captions if the video has speech.

---

## 10. Open Questions / Pending Decisions

(Append as they arise. Resolve with the PM/client, then move resolved items to `docs/DECISIONS.md`.)

Resolved (see `docs/DECISIONS.md` for rationale):

- [x] **Form provider** — Formspree REST (custom React form, CMS stores endpoint URL + recipient email)
- [x] **Sanity account** — created under dev account; transfer to client on request
- [x] **Analytics** — none at launch (out of scope per PDF)
- [x] **Brand fonts** — Inter Tight (display) + PT Sans (body), Google Fonts via next/font
- [x] **Brand colors** — confirmed from Figma frame (see §8)

Still open:

- [ ] **Video plan** — confirm whether the hero is a loop (Plan A: re-encode + self-host) or a feature film (Plan B: YouTube unlisted). 93MB source is unacceptable raw.
- [ ] **DNS / domain** — when does the client hand over registrar/DNS access? Fallback: launch on `*.vercel.app`, repoint later.
- [ ] **Staging access** — password-protect the Vercel preview before showing the client?
- [ ] **Formspree file-upload size** — verify the free tier supports the attachment sizes the quote form expects (CAD drawings, manifests).
