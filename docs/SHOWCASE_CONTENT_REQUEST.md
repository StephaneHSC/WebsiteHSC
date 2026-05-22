# Shipment Showcase — Content Request

**Purpose:** Asset + copy checklist to forward to PM / client before the showcase lightbox can be considered "real". Everything below is currently placeholder (lorem-ipsum copy and/or demo media) or stub. Asterisk `*` marks items already filled with real client-supplied copy — only media is missing there.

**Page**: `/showcase` and the home-page mosaic both pull from the same dataset (`src/lib/constants.ts → SHOWCASE_TILES`). Replacing a tile here updates both surfaces.

---

## A. Global hero copy

Heading currently per Figma `505:6096`. **Flag for review:**

- [ ] Mobile-only hero subtitle reads _"Access real-time location of your helicopter while in transit, get push notification."_ — this copy is identical to the Smart-Tracking section and looks like a Figma carry-over. Confirm intended copy for the showcase hero subtitle (or remove subtitle entirely).
- [ ] Confirm hero photo (`/showcase/hero-showcase.webp`) — is this the final shot?

---

## B. Per-project lightbox content

For each tile, we need a **carousel** (1+ photos and/or 1 video) plus a **narrative**. Narrative fields:

| Field             | What it is                                                   | Example                                                                     |
| ----------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `title`           | Uppercase header line                                        | "From Switzerland to India"                                                 |
| `aircraft`        | Helicopter model (rendered in red)                           | "Airbus H125"                                                               |
| `route`           | Origin → destination                                         | "Switzerland → India"                                                       |
| `transportMode`   | Air commercial / Air charter / Ocean RoRo / Ocean FCL / etc  | "Air Commercial"                                                            |
| `timeline`        | Duration                                                     | "12 Days"                                                                   |
| `challenge`       | 1-2 sentences on the operational problem                     | "Tight delivery window across 3 customs jurisdictions…"                     |
| `solution`        | 1-2 sentences on how Heli Skycargo solved it                 | "Dismantled to fit a 20" pallet, secured 747F space…"                       |
| `result`          | 1 sentence outcome                                           | "Arrived on time, fully traceable end-to-end."                              |
| `relatedServices` | Which service detail pages this should appear on (slug list) | `air-commercial`, `air-chartering`, `ocean-roro`, `ocean-lolo`, `ocean-fcl` |

### Media requirements per project

- **Photos**: 16:9 or 3:2 preferred, ≥1600px wide for desktop, WebP if possible. 1–4 per project. The carousel will paginate them.
- **Videos**: MP4 (H.264) or YouTube unlisted URL. Recommended ≤10s for autoplay-able clips, otherwise any length. Provide a **poster image** alongside.
- Caption / alt text per photo if specific.

---

### 1. Switzerland → India _(copy: ✅ confirmed)_

- Aircraft: Airbus H125 · Route: Switzerland → India · Mode: Air Commercial · Timeline: 12 Days
- [ ] **Tile photo (home page)** — currently `/showcase/switzerland-to-india.webp` (helicopter being loaded). Confirm.
- [ ] **Tile photo (/showcase page)** — currently `/showcase/switzerland-to-india-showcase.webp` (wrapped helicopter dockside, per Figma `344:4058`). Confirm or replace.
- [ ] **Lightbox carousel** — 2–4 real photos from the actual Swiss → India shipment (currently demo uses unrelated assets).
- [ ] Optional: a short video of the disassembly / loading?

### 2. Loading Operations 1 _(copy: ❌ placeholder)_

Generic "helicopter loading operations" tile, no label visible. Currently shows `/showcase/project-2.webp`.

- [ ] Real narrative — what project is this? If it's a generic representative photo (no specific project), can we attach it to one of the real projects below as a second photo instead, and drop this tile?
- [ ] Confirm tile photo.

### 3. Our Japan Desk _(copy: ✅ confirmed)_

- Tagged as a non-shipment "team / location" tile (Japan-speaking specialists). No route.
- [ ] **Tile photo** — confirm `/showcase/japan-desk.webp`.
- [ ] **Video** — currently `/showcase/sample-video.mp4` (placeholder). Real Japan-desk video (or YouTube unlisted URL)?
- [ ] **Carousel photo(s)** — current 2nd slide is an unrelated photo. Confirm 1–3 real shots of the Japan desk team / office.

### 4. Belgium → Cameroon _(copy: ✅ confirmed)_

- Aircraft: Airbus H145 · Route: Antwerp → Douala · Mode: Ocean Freight (RoRo) · Timeline: 21 Days
- [ ] **Tile photo** — confirm `/showcase/belgium-to-cameroon.webp`.
- [ ] **Lightbox carousel** — 1–4 real photos.

### 5. Myanmar → Gabon _(copy: ✅ confirmed)_

- Aircraft: Bell 412 · Route: Yangon → Libreville · Mode: Ocean Freight (FCL) · Timeline: 35 Days
- [ ] **Tile photo** — confirm `/showcase/myanmar-to-gabon.webp`.
- [ ] **Lightbox carousel** — 1–4 real photos.

### 6. Loading Operations 2 _(copy: ❌ placeholder)_

Generic "helicopter cargo on the dock" tile, no label. Currently `/showcase/project-6.webp`.

- [ ] Same question as #2 — real project, or roll this photo into another project's carousel?

### 7. Loading at Khalifa Port _(copy: ✅ confirmed)_

- Aircraft: Sikorsky S-92 · Location: Khalifa Port, UAE · Mode: Ocean Freight (LoLo) · Timeline: 10 Days
- [ ] **Tile photo** — confirm `/showcase/khalifa-port.webp`.
- [ ] **Lightbox carousel** — 1–4 real photos.

### 8. China → Guatemala _(copy: ✅ confirmed)_

- Aircraft: Airbus H225 · Route: Shanghai → Guatemala City · Mode: Air Charter (AN-124) · Timeline: 5 Days
- [ ] **Tile photo** — confirm `/showcase/china-to-guatemala.webp`.
- [ ] **Lightbox carousel** — 1–4 real photos.

### 9. Ground Operations Video _(copy: ❌ placeholder)_

Video-first tile (play icon overlay). Currently `/showcase/tile-8-video.webp` + sample video.

- [ ] Real narrative — what shipment / activity does this video document?
- [ ] **Real video** — MP4 or YouTube unlisted URL.
- [ ] **Poster image** (still frame from video, or alternate shot).

### 10. Ocean Transit Wrap _(copy: ❌ placeholder)_

Tall pure-photo tile. Currently `/showcase/tile-9.webp` (helicopter wrapped for ocean transit).

- [ ] Real narrative — which shipment is this from? Or is this a generic "we wrap helicopters" tile? If generic, suggest rolling it into one of the labeled projects above.
- [ ] Confirm photo.

### 11. Coordination Footage _(copy: ❌ placeholder, video tile)_

Video tile (play icon overlay). Currently `/showcase/tile-10.webp` with no real video.

- [ ] Real narrative.
- [ ] **Real video** + poster.

### 12. Pre-flight Preparation _(copy: ❌ placeholder)_

Tall pure-photo. Currently `/showcase/tile-11.webp`.

- [ ] Real narrative or roll into another tile's carousel.

### 13. Road Transport _(copy: ❌ placeholder, video tile)_

Video tile (play icon overlay). Currently `/showcase/tile-12.webp` with no real video.

- [ ] Real narrative.
- [ ] **Real video** + poster.

### 14. Ground Handling _(copy: ❌ placeholder)_

Pure-photo tile. Currently `/showcase/tile-13.webp`.

- [ ] Real narrative or roll into another tile's carousel.

---

## C. Summary of asks

- **6 projects already have confirmed narrative** (1, 3, 4, 5, 7, 8) — they just need **real carousel media** (photos + optional video).
- **8 tiles have lorem-ipsum copy** (2, 6, 9, 10, 11, 12, 13, 14) — they need **either real narrative or to be merged into other tiles' carousels** and removed.
- **3 video tiles** (9, 11, 13) currently use a sample MP4 — they need **real video files** (MP4 ≤10s preferred, or YouTube unlisted URL with poster image).
- **1 video tile** (3 — Japan Desk) shares the same sample video.

### Format preferences

- Photos: WebP if available; we'll convert PNG/JPG. ≥1600px wide.
- Videos: MP4 H.264 ≤10MB ideal, or YouTube unlisted URL (zero hosting overhead).
- Send as: Google Drive / Dropbox folder organized one sub-folder per tile (e.g. `01-switzerland-india/`, `02-loading-operations/`).
