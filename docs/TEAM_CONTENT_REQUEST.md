# Our Team — Content Request

**Purpose:** Asset + copy checklist to forward to PM / client before the `/team` page is client-review-ready. Everything marked **[PLACEHOLDER]** below is currently lorem-ipsum or a stub; items marked **[FINAL]** are already client-supplied. Items marked **[NEW]** were just refreshed (2026-05-17) with the AI-generated higher-quality cutouts from `team-photo-generated/` and now show **upper-body only** per design feedback.

> **Where this content lives today**: `src/lib/constants.ts → PLACEHOLDER_TEAM_MEMBERS` (the fallback used while Sanity is empty). Once the CMS is populated, these placeholders are dropped and Sanity becomes the source of truth — every member listed below also needs to land as a Sanity `teamMember` document.

---

## A. Hero (Meet The People Behind Every Shipment)

- [x] **Hero photo** `/team/hero-team.webp` — group shot in front of helicopter. **[FINAL]** — confirm with client if they want a different lead photo.
- [x] **H1** "Meet The People Behind Every Shipment" — **[FINAL]**.
- [x] **Eyebrow** "Our Team" — **[FINAL]**.

---

## B. Intro headline ("Experts You Can Trust")

- [x] **Eyebrow** "Experts You Can Trust" — **[FINAL]**.
- [ ] **Headline copy** — confirm wording (4 lines on mobile, 3 lines on desktop): > _"At Heli Skycargo, **our team is fueled by passion** **to deliver BEST-IN-CLASS service.**"_
      Mobile renders as 4 explicit lines (`At Heli Skycargo,` / `our team is fueled by passion` / `to deliver BEST-IN-CLASS` / `service.`); on desktop lines 3 + 4 collapse to a single line. Approve or supply alternative.

---

## C. Per-member content (9 members)

For every team member we need:

| Field          | Required? | Notes                                                                                                        |
| -------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `full_name`    | yes       | Display + alt text                                                                                           |
| `role`         | yes       | Short title (max ~28 chars so card label doesn't truncate)                                                   |
| `photo`        | yes       | **PNG with transparent background, upper-body crop only** (head + chest down to mid-torso). Min 600 px wide. |
| `long_bio`     | yes       | 2 paragraphs, ~50–80 words each. Plain prose, no markdown.                                                   |
| `linkedin_url` | optional  | Full URL                                                                                                     |
| `email`        | optional  | Address only (no `mailto:`)                                                                                  |
| `order`        | yes       | Integer 1..9 for display order                                                                               |
| `is_featured`  | yes       | Boolean; exactly **one** member must be `true` (default spotlight on page load)                              |

### Member-by-member checklist

| #   | Name              | Role                          | Photo                            | Bio (long)        | LinkedIn    | Email       |
| --- | ----------------- | ----------------------------- | -------------------------------- | ----------------- | ----------- | ----------- |
| 1   | Stephane Marot    | Founder & CEO                 | **[NEW]** upper-body cutout      | **[FINAL]**       | **[FINAL]** | **[FINAL]** |
| 2   | Daniel Cosico     | Deployment & Lead Coordinator | **[NEW]** upper-body cutout      | **[PLACEHOLDER]** | needed      | needed      |
| 3   | Adriana Athirah   | Sales & Marketing Executive   | **[FINAL]** (already upper-body) | **[PLACEHOLDER]** | needed      | needed      |
| 4   | Rica Mae Cortez   | Logistic Specialist           | **[NEW]** upper-body cutout      | **[PLACEHOLDER]** | needed      | needed      |
| 5   | Alfredo Dinglasan | Logistic Specialist           | **[NEW]** upper-body cutout      | **[PLACEHOLDER]** | needed      | needed      |
| 6   | Nikhitha Manuel   | RFQ                           | **[NEW]** upper-body cutout      | **[PLACEHOLDER]** | needed      | needed      |
| 7   | Remi Hachisuka    | Japan Desk Manager            | **[NEW]** upper-body cutout      | **[PLACEHOLDER]** | needed      | needed      |
| 8   | Anjelimo Mulati   | Accounting                    | **[NEW]** upper-body cutout      | **[PLACEHOLDER]** | needed      | needed      |
| 9   | Mia Juliet Marot  | Junior Sales & Marketing      | **[NEW]** upper-body cutout      | **[PLACEHOLDER]** | needed      | needed      |

**Notes on photos (2026-05-17 refresh):**

- All 8 new portraits in `public/team/*.webp` were generated from `team-photo-generated/*.png` (AI-upscaled cutouts) and cropped to upper-body only (head + chest + arms down to waist).
- Adriana Athirah is the only member without a refreshed source — her existing `/team/adriana-athirah.png` is already upper-body quality and was left untouched.
- If the client provides real higher-resolution photos, drop them in `public/team/` with the same filenames and re-run the crop script at `/tmp/team-crop/crop_team.py` (or just hand them off to dev to import into Sanity).

---

## D. Spotlight wide candid (CEO default state)

- [x] `/team/spotlight/stephane.webp` — 3200×1800 candid at expo booth. **[FINAL]** for default spotlight backdrop.
- [ ] Confirm whether the client wants individual candid photos per member for the spotlight background, or whether the upper-body cutout is acceptable as the spotlight backdrop for non-CEO members (current behaviour).

---

## E. Sanity migration

Once the client signs off on the content above:

1. Create 9 `teamMember` documents in Sanity (`studio/`).
2. Upload each photo to the document's `photo` field (Sanity will store the original; `urlFor()` resizes per-surface).
3. Fill `long_bio` as Portable Text blocks (Sanity Studio handles this with the rich-text editor).
4. Set `order` (1–9) and `is_featured` (Stephane = true; everyone else = false).
5. Set `status` = "published".
6. Once published, `PLACEHOLDER_TEAM_MEMBERS` in `constants.ts` is no longer the source of truth — it remains only as a safety net for empty-CMS rendering.

**Important — do NOT delete the placeholder array from `constants.ts`.** It's the fallback when the Sanity CDN is unreachable or empty.

---

## F. Open questions for PM / client

- [ ] Do we have a published-vs-draft workflow for new hires? (Adding a 10th member post-launch.)
- [ ] LinkedIn / email visibility — should we expose personal LinkedIn or a company group?
- [ ] Headshot consistency — every refreshed photo is the AI-upscaled cutout. Confirm the client is OK with this look (slightly stylized) or wants us to revert once real photos are supplied.
