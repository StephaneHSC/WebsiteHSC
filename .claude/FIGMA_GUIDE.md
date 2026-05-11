# Figma Usage Guide

> The developer has a Figma **dev seat** — MCP is allowed but used judiciously.
> Default workflow: paste screenshots. Pull MCP only when you need exact tokens or layer dimensions.

---

## Default workflow: paste screenshots

The developer pastes screenshots or frame URLs directly into chat. Implement from the image. This is fastest for both sides.

When the developer pastes a Figma frame URL **without** asking for an MCP pull, treat it as a reference link — not a fetch instruction. Look at any attached screenshot first; ask for one if needed; only call MCP when the screenshot genuinely doesn't carry the information.

---

## When MCP is allowed

The dev-seat permits MCP, so use it when:

1. The developer says **"pull this from Figma"** or **"use Figma MCP"**.
2. You need a specific design token (exact hex, exact spacing, exact font weight) and the screenshot is ambiguous.
3. You're about to build a complex component and exact layer-by-layer dimensions are required.
4. You need to verify a hover/active/focus variant that isn't visible in the shared screenshot.

**Always one frame at a time.** Never bulk-pull a whole page or the whole file. Note in your reply _which_ frame you pulled and why, so the developer can audit usage.

---

## Mobile frames are mandatory

The Figma file has **dedicated mobile frames** for every module. Per the project agreement:

- Always look at both the **desktop** and **mobile** frame for the section you're building.
- If the developer only pastes one, ask for the other before writing the responsive Tailwind.
- Typography has separate desktop and mobile sizes (e.g. H1 64pt → 32pt). Match both.
- Component layouts can change shape between breakpoints (grid → stack, sidebar → drawer). Don't assume the mobile is just the desktop scaled down.

---

## Figma file structure (reference only)

```
Main file:  https://www.figma.com/design/oYbmAQczd2UX5PtQnVBz50/HSC
File ID:    oYbmAQczd2UX5PtQnVBz50
```

### Frame URLs by module

Fill in as we work through each module:

| Module                               | Desktop frame     | Mobile frame                           | Notes                                                                                                       |
| ------------------------------------ | ----------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1. Foundation (header/footer/tokens) | `344:1710`        | `351:15284`                            | Header visible at top, footer at bottom of these home frames. Mobile menu overlay at Frame 9 (image saved). |
| 2. Home Page                         | `344:1710`        | `351:15284`                            | Same frames as M1.                                                                                          |
| 3. Services Listing                  | TODO              | TODO                                   |                                                                                                             |
| 4. Service Detail (template)         | TODO              | TODO                                   |                                                                                                             |
| 5. Why Choose HSC                    | TODO              | TODO                                   |                                                                                                             |
| 6. Our Team                          | TODO              | TODO                                   |                                                                                                             |
| 7. Shipment Showcase                 | TODO              | TODO                                   |                                                                                                             |
| 8. Request a Quote                   | TODO              | TODO                                   |                                                                                                             |
| 9. Mobile & Polish (splash + nav)    | n/a (mobile-only) | screenshots: red + dark/Earth variants | Two design directions for the splash; resolve which is canonical at M9.                                     |

### Specific component frames

| Component           | Node ID    | Notes                                                                             |
| ------------------- | ---------- | --------------------------------------------------------------------------------- |
| Footer (dedicated)  | `344:3278` | Use for footer-only spec in M1.                                                   |
| Mobile menu overlay | image only | Frame 9 — open-hamburger state. Services and Our Team have chevrons (expandable). |

### Brand & typography frame

Tokens captured in `CLAUDE.md` §8. Fonts: Inter Tight (display) + PT Sans (body). Color palette: #E40C28 / #101820 / #4A4E54 / #3D3D3D / #F9F9F9 / #000000 / #FFFFFF.

---

## What to provide alongside a screenshot

For each section the developer wants built:

1. **Full-frame screenshot** at 100% zoom (shows layout)
2. **Cropped close-up** for tricky details (icon style, button corners, gradient)
3. **BOTH desktop AND mobile** for any responsive component
4. The Figma frame name (so we can refer back to it in commits/PRs)
5. Interaction notes ("on hover, the card shadow grows"; "this menu slides in from the right")
6. Variant info ("3 button styles — primary/secondary/ghost — see the design system page")

---

## What Claude should NOT assume

- Don't invent hover/focus/active states — ask if not provided
- Don't guess spacing values — ask, or pull from MCP for that frame
- Don't fabricate icons — ask which library, or whether SVGs are exported in Figma
- Don't skip the mobile frame just because the desktop is "obvious"

---

## Asset extraction

For images and icons that ship with the code (logos, decorative graphics, hero illustrations):

- Developer exports from Figma → SVG (icons) or WebP/PNG (photos) → drops in `/public/`
- Team photos, milestone images, testimonial photos go through **Sanity**, not Figma exports
- Logos and partner icons that are hardcoded → exported once, optimized, committed

Don't try to recreate complex graphics in pure CSS or SVG. Ask for the export.
