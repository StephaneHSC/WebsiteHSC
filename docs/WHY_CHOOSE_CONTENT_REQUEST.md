# Why Choose Heli Skycargo — Content Request

**Purpose:** Asset + copy checklist for `/why-choose-us` before the page can be considered "real" for client review. Everything below is currently placeholder, recycled from the Figma copy track, or a stub used while we built the page.

**Page**: `/why-choose-us`
**Component sources**: `src/components/sections/why-choose/*` + `src/lib/constants.ts` (`WHY_CHOOSE_*`).
**Design**: Figma frames `344:6116` (desktop hero) / `505:7165` (mobile hero), `466:6063` / `505:7491` (Global Reach), `344:6702` / `505:7528` (Seamless), `344:6703` / `505:7539` (Tailored), `373:15` / `3148:15` (Trackability).

---

## A. Hero — `WhyChooseHero`

| Slot         | Current value                                           | Status                                      |
| ------------ | ------------------------------------------------------- | ------------------------------------------- |
| Eyebrow      | "Bespoke Helicopter Shipping"                           | ☐ Confirm — taken from Figma, OK as final?  |
| H1 (desktop) | "Why Choose Heli Skycargo"                              | ☐ Confirm — taken from Figma                |
| Hero photo   | `public/why-choose-us/hero-team.webp` (Leonardo + team) | ☐ Replace if client has a higher-res master |
| Alt text     | "Heli Skycargo team in front of a Leonardo helicopter"  | ☐ Confirm                                   |

---

## B. Global Reach callout — `GlobalReachCallout`

| Slot      | Current value                                                                                                                                                                                                                                                                           | Status    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Eyebrow   | "Global Reach"                                                                                                                                                                                                                                                                          | ☐ Confirm |
| H2 line 1 | "Wherever your aircraft needs to go,"                                                                                                                                                                                                                                                   | ☐ Confirm |
| H2 line 2 | "we make it **happen**."                                                                                                                                                                                                                                                                | ☐ Confirm |
| Lede      | "No matter from where to where, our experience and expertise in helicopter shipping will deliver a logistical solution catered to your needs and budget. 24/7, we are here for you. Our proven ability to orchestrate helicopter shipping & chartering makes us your partner of choice" | ☐ Final?  |
| CTA       | "Request Quote" → scrolls to `#request-quote`                                                                                                                                                                                                                                           | ☐ OK      |

---

## C. Stats band — `StatsBand` (CMS)

Numbers come from Sanity `siteStats`. Descriptions are hard-coded fallbacks in `STAT_DESCRIPTIONS`.

| Stat              | Current value | Description (frontend)                              | Status                        |
| ----------------- | ------------- | --------------------------------------------------- | ----------------------------- |
| Shipments         | 1000+         | "Air and ocean logistics, fully visible end-to-end" | ☐ Client to confirm the count |
| Available Support | 24/7          | "Always ready. Always delivering."                  | ☐ Confirm                     |
| Clients Worldwide | 50+           | "Trusted worldwide for reliable freight solutions." | ☐ Confirm the count           |
| Trusted Since     | 2014          | "We deliver everywhere, to the farthest reaches."   | ☐ Confirm year                |

---

## D. Intro photo band — `IntroPhotoBand`

| Slot     | Current value                                                | Status                                                    |
| -------- | ------------------------------------------------------------ | --------------------------------------------------------- |
| Photo    | `public/why-choose-us/team-band.webp`                        | ☐ Confirm or replace with a different team / mission shot |
| Alt text | "Heli Skycargo team in front of a Leonardo AW189 helicopter" | ☐ Confirm                                                 |

---

## E. Feature block 1 — "Seamless coordination" (`FeatureBlock` image-left)

| Slot         | Current value                                                                                                                               | Status                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Eyebrow      | "Why Choose Us"                                                                                                                             | ☐ Confirm                                 |
| H2 lines     | "**Seamless coordination** / from planning to / delivery."                                                                                  | ☐ Confirm                                 |
| Lede         | "We combine technical understanding with hands-on logistics experience to deliver reliable, flexible shipping solutions for every mission." | ☐ Confirm                                 |
| Bullets (×5) | Dedicated specialists / Global air & ocean / End-to-end visibility / International partner network / Personal support                       | ☐ Confirm or trim                         |
| Photo        | `public/why-choose-us/seamless-photo.webp` (NEW — 3 specialists in PPE on vessel deck)                                                      | ☐ Confirm OR supply preferred replacement |
| CTA          | "Request Quote" → `#request-quote`                                                                                                          | ☐ OK                                      |

---

## F. Feature block 2 — "Tailored logistic solutions" (`FeatureBlock` image-right)

| Slot       | Current value                                                                                                                                                                                                                                                                                       | Status               |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Eyebrow    | "Our Approach"                                                                                                                                                                                                                                                                                      | ☐ Confirm            |
| H2 lines   | "**Tailored logistic** / solutions built around / your aircraft"                                                                                                                                                                                                                                    | ☐ Confirm            |
| Paragraphs | 1) "Every shipment is different. That's why we design tailored transport strategies based on aircraft type, timeline, destination requirements, and handling needs." <br/> 2) "Our team coordinates each stage of transport — ensuring safe handling, regulatory compliance, and on-time delivery." | ☐ Confirm            |
| Photo      | `public/why-choose-us/tailored-photo.webp` (wrapped helicopter being craned)                                                                                                                                                                                                                        | ☐ Confirm or replace |
| CTA        | "Request Quote" → `#request-quote`                                                                                                                                                                                                                                                                  | ☐ OK                 |

---

## G. Trackability callout — `TrackabilityCallout`

| Slot          | Current value                                                                                                          | Status                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Eyebrow       | "Trackability"                                                                                                         | ☐ Confirm                                                                                                |
| H2 line 1     | "Precision Helicopter"                                                                                                 | ☐ Confirm                                                                                                |
| H2 line 2     | "Shipping. Globally."                                                                                                  | ☐ Confirm                                                                                                |
| Lede          | "Access real-time location of your helicopter while in transit, get push notification."                                | ☐ Confirm                                                                                                |
| Phone mockup  | Single image baked from Figma — `phone-mockup-desktop.webp` / `phone-mockup-mobile.webp` (Delivery Information screen) | ☐ Confirm — does this match the real app UI, or do we need to swap for a screenshot of the live HSC app? |
| App Store URL | `APP_LINKS.appStore` (currently placeholder)                                                                           | ☐ **Need real URL** before launch                                                                        |
| Google Play   | `APP_LINKS.googlePlay` (currently placeholder)                                                                         | ☐ **Need real URL** before launch                                                                        |

---

## H. Quote form anchor + offices

These come from the shared `QuoteFormShell` and `OfficesGlobal` components and are tracked separately in `M8_PLAN.md` and the offices module. Nothing page-specific needed here.

---

## I. Open meta / SEO items for this page

- [ ] Confirm `<title>` ("Why Choose Heli Skycargo") and `<meta name="description">` ("Bespoke helicopter shipping with global reach, dedicated specialists, and end-to-end tracking. Tailored logistics solutions built around your aircraft.") read like marketing-approved copy.
- [ ] OG share image — currently inherits site default. Want a dedicated 1200×630?

---

## J. Summary of items the client MUST supply before launch

1. **App Store + Google Play URLs** for the Trackability badges.
2. **Confirmation** that the real tracking app UI matches the mockup we baked from Figma, OR a screenshot of the live app to swap in.
3. **Final stats numbers** (1000+, 50+, 2014) — already in Sanity, just need a sign-off.
4. **Any preferred replacement photos** for hero, intro band, seamless, or tailored sections.
5. **Sign-off on all copy** above (eyebrows, headlines, ledes, bullets, paragraphs).
