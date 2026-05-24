/**
 * Hardcoded site data. Per the project brief, only 5 areas live in the CMS;
 * everything else (nav, footer, services list, page copy) lives here.
 */

export const SITE = {
  name: "Heli SkyCargo",
  tagline: "Bespoke Helicopter Shipping",
  url: "https://heliskycargo.com",
  email: "info@heliskycargo.com",
  copyright: "© 2026 - Heli Skycargo -  All Rights Reserved.",
} as const;

/**
 * Top-level navigation. Items with `children` render as expandable
 * sections in the mobile drawer (chevron pattern from the Figma menu overlay).
 */
export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const NAV: readonly NavItem[] = [
  { label: "About Heli Skycargo", href: "/why-choose-us" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "All Services", href: "/services" },
      { label: "Ocean Ro/Ro", href: "/services/ocean-roro" },
      { label: "Ocean Lo/Lo", href: "/services/ocean-lolo" },
      { label: "Ocean FCL", href: "/services/ocean-fcl" },
      { label: "Road Freight", href: "/services/road-freight" },
      { label: "Air Commercial", href: "/services/air-commercial" },
      { label: "Air Chartering", href: "/services/air-chartering" },
    ],
  },
  { label: "Shipment Showcase", href: "/showcase" },
  { label: "Our Team", href: "/team" },
  { label: "Reviews", href: "/#testimonials" },
] as const;

/**
 * Footer link columns — match the Figma footer frame (node 344:3278).
 * Mobile collapses these into +/- accordion sections; desktop shows them side-by-side.
 */
export const FOOTER = {
  company: [
    { label: "Why Choose Us", href: "/why-choose-us" },
    { label: "Services", href: "/services" },
    { label: "Shipment Showcase", href: "/showcase" },
    { label: "Our Team", href: "/team" },
    { label: "Request Quote", href: "/quote" },
  ],
  legal: [
    { label: "Standard Trading Terms and Conditions", href: "/terms" },
    { label: "Privacy Statement", href: "/privacy" },
  ],
} as const;

/** App download links — confirmed by client. */
export const APP_LINKS = {
  appStore: "https://apps.apple.com/us/app/hschelitrack/id1498909837",
  googlePlay: "https://play.google.com/store/apps/details?id=com.heliskycargo",
} as const;

/** Social channel URLs — provided by the client 2026-04-29. */
export const SOCIAL_LINKS = {
  x: "https://x.com/heliskycargo/",
  youtube: "https://www.youtube.com/channel/UCv3QIsvX9f54okQN0-CqO5Q",
  linkedin: "https://www.linkedin.com/company/13238697/",
} as const;

/** Industry partnerships shown in the footer. */
export const PARTNERS = {
  vai: {
    name: "Vertical Aviation International",
    url: "https://verticalavi.org",
  },
} as const;

/**
 * Helicopter manufacturers HSC ships for — rendered in the home "We ship all
 * helicopter models" strip ("our partners" frame in Figma). Logos exported
 * from Figma at native dimensions; pass width/height to Next.js Image so it
 * preserves aspect ratio without cropping.
 */
export type HelicopterBrand = {
  name: string;
  logo: string;
  width: number;
  height: number;
};

export const HELICOPTER_BRANDS: readonly HelicopterBrand[] = [
  { name: "Leonardo", logo: "/clients/leonardo.png", width: 282, height: 50 },
  { name: "Airbus Helicopters", logo: "/clients/airbus-helicopters.png", width: 177, height: 50 },
  { name: "Robinson Helicopter Company", logo: "/clients/robinson.png", width: 123, height: 50 },
  { name: "Bell Helicopter", logo: "/clients/bell-helicopter.png", width: 242, height: 50 },
  { name: "Sikorsky", logo: "/clients/sikorsky.png", width: 139, height: 50 },
] as const;

/**
 * Global office locations rendered in the "Across all regions worldwide"
 * section. Each office carries its own cityscape photo so the section bg
 * cross-fades when the user clicks/taps a different office. The page hosting
 * the section picks the default-active office via the `defaultActive` prop
 * on `<OfficesGlobal />` (defaults to `uae`).
 *
 * Phone/email values sourced verbatim from Figma node `505:6025`; the
 * developer should verify the USA + Malaysia phone numbers (look like
 * placeholders re-using the HK number) before launch.
 */
export type Office = {
  id: string;
  /** Small label printed above the country name, e.g. "Heli Skycargo Limited". */
  label: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  /** Cityscape shown as the section bg when this office is the active one. */
  cityscape: { src: string; alt: string };
};

export const OFFICES: readonly Office[] = [
  {
    id: "hk",
    label: "Heli Skycargo Limited",
    country: "Hong Kong",
    address: "Suite 409, 87-105 Chatham Road South, TST",
    phone: "+852 6698 0871",
    email: "info@heliskycargo.com",
    cityscape: { src: "/offices/cityscape-hk.webp", alt: "" },
  },
  {
    id: "uae",
    label: "Heli Skycargo Global Customer Support Center",
    country: "UAE",
    address: "Emaar Business Park, Dubai",
    phone: "+971 558 247 780",
    email: "team@heliskycargo.com",
    cityscape: { src: "/offices/cityscape.webp", alt: "" },
  },
  {
    id: "usa",
    label: "Heli Skycargo USA LLC",
    country: "USA",
    address: "16501 Ventura Blvd, Encino, California",
    phone: "+852 6698 0871",
    email: "commercial@heliskycargo.com",
    cityscape: { src: "/offices/cityscape-usa.webp", alt: "" },
  },
  {
    id: "my",
    label: "Heli Skycargo Warehouse",
    country: "Malaysia",
    address: "Kuala Lumpur",
    phone: "+852 6698 0871",
    email: "info@heliskycargo.com",
    cityscape: { src: "/offices/cityscape-my.webp", alt: "" },
  },
] as const;

/**
 * Past-shipment showcase tiles. Used by the home "Some of OUR PROJECTS and
 * More" bento mosaic, every service-detail page, AND the M7 `/showcase`
 * listing page. The mosaic component groups tiles by `desktopColumn` /
 * `mobileColumn` and renders 4 (desktop) or 2 (mobile) flex-col stacks of
 * mixed-height tiles per the `shape` field.
 *
 * Home consumes the first 8 entries (4 columns × 2 rows brick); /showcase
 * consumes all 14 with a Load More batch on mobile (4 → +4 → +4 → +4).
 */
export type TileShape = "tall" | "medium" | "short" | "extra-short";

/**
 * A single carousel slot in the project lightbox — either a photo or a video.
 * The modal renders prev/next arrows + a dot indicator across all media items
 * regardless of type. Photo items render via `next/image`; video items render
 * as an HTML5 `<video controls>` with the optional `poster` shown until play.
 */
export type ShowcaseMedia =
  | { type: "photo"; src: string }
  | { type: "video"; src: string; poster?: string };

export type ShowcaseTile = {
  id: string;
  /** Primary photo for the tile thumbnail (used in the mosaic, not the modal). */
  src: string;
  /**
   * Per-tile CSS `object-position` override for the thumbnail (e.g. `"70% center"`
   * to shift the visible window toward the right side of the photo). Applies to
   * both desktop and mobile mosaics. Default = browser default (`50% 50%`).
   * Increase the X% to slide the photo content leftward in the tile, decrease
   * to slide it rightward.
   */
  objectPosition?: string;
  /**
   * Ordered carousel of mixed photos + videos shown inside the modal. When
   * absent, the modal falls back to the legacy `photos` + `videoUrl` fields.
   * If none of the three are set, the modal shows just `src` as a single
   * static photo with no arrows / dots.
   */
  media?: readonly ShowcaseMedia[];
  /** @deprecated Use `media` instead. Auto-translated when `media` is unset. */
  photos?: readonly string[];
  alt: string;
  /** Overlay route text on the tile (one array entry per visual line). Optional → pure-photo tile. */
  label?: readonly string[];
  /**
   * M7 — explicit video-tile flag on the mosaic. Renders the red play-circle
   * icon over the tile thumbnail. The modal media path is controlled by
   * `media` / `videoUrl` separately. Replaces the M2 `showFlag` Japan-flag
   * overlay (the Figma intent was always a play icon — see DECISIONS.md).
   */
  hasPlayIcon?: boolean;
  /** @deprecated Use `media` instead. Auto-translated when `media` is unset. */
  videoUrl?: string;
  /**
   * Service slugs this project applies to. Detail pages render a filtered
   * subset (`tile.relatedServices?.includes(serviceSlug) ?? true`). When
   * undefined, the tile shows on every detail page.
   */
  relatedServices?: readonly string[];
  /**
   * M7 — drives the per-tile aspect ratio in the masonry. `tall` 340/560,
   * `medium` 340/494, `short` 340/300, `extra-short` 340/270 (desktop). Mobile
   * collapses `short` and `extra-short` to the same 186/160 aspect.
   */
  shape: TileShape;
  /** Column index in the desktop 4-column masonry (0..3). */
  desktopColumn: 0 | 1 | 2 | 3;
  /** Column index in the mobile 2-column masonry (0..1). */
  mobileColumn: 0 | 1;
  /**
   * Modal payload — populated for the M7 project lightbox. Tiles without a
   * confirmed story still get a placeholder payload (carrying lorem-ipsum
   * challenge/solution/result with `// TODO(content):` markers) so every
   * tile is clickable. Replace placeholders when the client supplies copy.
   */
  modal?: {
    /** Pre-formatted uppercase header line, e.g. "FROM ITALY TO GABON". */
    title: string;
    aircraft: string;
    route: string;
    transportMode: string;
    timeline: string;
    challenge: string;
    solution: string;
    result: string;
  };
};

/**
 * Lorem-ipsum placeholder copy used for tiles without confirmed client copy.
 * Replace each `// TODO(content):` marker when the project narrative is signed off.
 */
const PLACEHOLDER_CHALLENGE =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit — coordination, customs, and timing aligned to the shipment's specific constraints.";
const PLACEHOLDER_SOLUTION =
  "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua — bespoke routing, partner network, and on-the-ground supervision delivered the plan.";
const PLACEHOLDER_RESULT =
  "Ut enim ad minim veniam — delivered safely, on time, and ready for operational handover.";

// TODO: PM/client to confirm per-project relatedServices mapping. Initial
// guesses below are inferred from the route hints (e.g. Khalifa Port → ocean,
// Switzerland → likely air); placeholder modal copy carries TODO(content):
// markers until content review.
//
// Order matters — home renders the first 8 entries in a 4×2 brick, with
// `desktopColumn` 0,0,1,1,2,2,3,3 producing the legacy bento. /showcase
// renders all 14 driven by `desktopColumn` (0..3) and `mobileColumn` (0..1).
export const SHOWCASE_TILES: readonly ShowcaseTile[] = [
  // 1 — col0 / tall — switzerland-india (label). Ships with a 3-photo
  // demo `media` carousel (using existing assets) so the modal's prev/next
  // arrows + dot indicator can be exercised end-to-end. Replace with the
  // real per-project media list when the client supplies.
  {
    id: "switzerland-india",
    src: "/showcase/switzerland-to-india.webp",
    media: [
      { type: "photo", src: "/showcase/switzerland-to-india.webp" },
      { type: "photo", src: "/showcase/myanmar-to-gabon.webp" },
      { type: "photo", src: "/showcase/khalifa-port.webp" },
    ],
    alt: "Helicopter shipment from Switzerland to India",
    label: ["From", "Switzer-", "land to", "India"],
    shape: "tall",
    desktopColumn: 0,
    mobileColumn: 0,
    relatedServices: ["air-commercial", "air-chartering"],
    modal: {
      title: "From Switzerland to India",
      aircraft: "Airbus H125",
      route: "Switzerland → India",
      transportMode: "Air Commercial",
      timeline: "12 Days",
      challenge:
        "A tight delivery window required a coordinated multi-leg air freight plan across two continents and three customs jurisdictions.",
      solution:
        'Heli Skycargo dismantled the helicopter to fit a 20" aircraft pallet, secured space on a B747-400F freighter, and managed every clearance step end-to-end.',
      result:
        "The aircraft arrived in India within the agreed timeline, fully traceable through Heli Skycargo's tracking platform.",
    },
  },
  // 2 — col0 / short — pure-photo loading shot.
  {
    id: "loading-1",
    src: "/showcase/project-2.webp",
    alt: "Helicopter loading operations",
    shape: "short",
    desktopColumn: 0,
    mobileColumn: 0,
    relatedServices: ["ocean-roro", "ocean-lolo", "ocean-fcl"],
    modal: {
      // TODO(content): real modal copy for Loading shot 1.
      title: "Helicopter Loading",
      aircraft: "Various",
      route: "Multi-port",
      transportMode: "Ocean Freight",
      timeline: "Project-based",
      challenge: PLACEHOLDER_CHALLENGE,
      solution: PLACEHOLDER_SOLUTION,
      result: PLACEHOLDER_RESULT,
    },
  },
  // 3 — col1 / short — japan-desk (label + play icon, video-ready). Ships
  // with a 2-item demo `media` carousel: video FIRST (so the modal opens on
  // the idle video state — poster + play overlay) + a contrasting photo
  // second (using a different showcase asset so the user can tell the two
  // slides apart at a glance). Replace the sample MP4 / placeholder photo
  // with the real client-supplied assets (or a YouTube unlisted embed, per
  // the 2026-04-28 hosting decision in docs/DECISIONS.md).
  {
    id: "japan-desk",
    src: "/showcase/japan-desk.webp",
    media: [
      {
        type: "video",
        src: "/showcase/sample-video.mp4",
        poster: "/showcase/japan-desk.webp",
      },
      { type: "photo", src: "/showcase/khalifa-port.webp" },
    ],
    alt: "HSC Japan office team",
    label: ["Our", "Japan", "Desk"],
    hasPlayIcon: true,
    shape: "short",
    desktopColumn: 1,
    mobileColumn: 1,
    modal: {
      title: "Our Japan Desk",
      aircraft: "Multiple Models",
      route: "Tokyo, Japan",
      transportMode: "Local Coordination",
      timeline: "Year-Round",
      challenge:
        "Japanese clients required Japanese-speaking specialists able to handle local export formalities, port nominations, and time-zone-aligned support.",
      solution:
        "We established a dedicated Japan Desk staffed by bilingual logistics experts coordinating directly with the global Heli Skycargo network.",
      result:
        "Faster response times, cleaner customs paperwork, and a single accountable contact for every Japan-origin shipment.",
    },
  },
  // 4 — col1 / tall — belgium-cameroon (label).
  {
    id: "belgium-cameroon",
    src: "/showcase/belgium-to-cameroon.webp",
    alt: "Helicopter shipment from Belgium to Cameroon",
    label: ["From", "Belgium", "to", "Cameroon"],
    shape: "tall",
    desktopColumn: 1,
    mobileColumn: 1,
    relatedServices: ["ocean-roro", "ocean-lolo"],
    modal: {
      title: "From Belgium to Cameroon",
      aircraft: "Airbus H145",
      route: "Antwerp → Douala",
      transportMode: "Ocean Freight (RoRo)",
      timeline: "21 Days",
      challenge:
        "Door-to-door movement of an in-service helicopter required minimal disassembly and a guaranteed under-deck stow for monsoon-season transit.",
      solution:
        "We loaded onto a MAFI roll trailer at Antwerp, secured a confirmed under-deck slot with our Ro/Ro carrier, and arranged inland delivery to the operator's hangar in Douala.",
      result: "Delivered fully assembled, on schedule, with zero handling damage.",
    },
  },
  // 5 — col2 / tall — myanmar-gabon (label).
  {
    id: "myanmar-gabon",
    src: "/showcase/myanmar-to-gabon.webp",
    alt: "Helicopter shipment from Myanmar to Gabon",
    label: ["From", "Myanmar", "to Gabon"],
    shape: "tall",
    desktopColumn: 2,
    mobileColumn: 0,
    relatedServices: ["ocean-roro", "ocean-fcl"],
    modal: {
      title: "From Myanmar to Gabon",
      aircraft: "Bell 412",
      route: "Yangon → Libreville",
      transportMode: "Ocean Freight (FCL)",
      timeline: "35 Days",
      challenge:
        "An off-network origin port and remote destination demanded creative routing and tight container fit to keep budget on plan.",
      solution:
        "Partial disassembly fitted the helicopter into a 40' open-top container; we managed transshipment via Singapore and onward via a multipurpose carrier to Libreville.",
      result: "Cost-efficient delivery with full visibility through every transshipment leg.",
    },
  },
  // 6 — col2 / short — pure-photo dockside cargo.
  {
    id: "loading-2",
    src: "/showcase/project-6.webp",
    alt: "Helicopter cargo on the dock",
    shape: "short",
    desktopColumn: 2,
    mobileColumn: 1,
    relatedServices: ["ocean-roro", "ocean-lolo"],
    modal: {
      // TODO(content): real modal copy for Loading shot 2.
      title: "Dockside Loading",
      aircraft: "Various",
      route: "Multi-port",
      transportMode: "Ocean Freight",
      timeline: "Project-based",
      challenge: PLACEHOLDER_CHALLENGE,
      solution: PLACEHOLDER_SOLUTION,
      result: PLACEHOLDER_RESULT,
    },
  },
  // 7 — col3 / short — khalifa-port (label).
  {
    id: "khalifa-port",
    src: "/showcase/khalifa-port.webp",
    alt: "Loading at Khalifa Port",
    label: ["Loading", "at Khalifa", "Port"],
    shape: "short",
    desktopColumn: 3,
    mobileColumn: 1,
    relatedServices: ["ocean-roro", "ocean-lolo", "ocean-fcl"],
    modal: {
      title: "Loading at Khalifa Port",
      aircraft: "Sikorsky S-92",
      route: "Khalifa Port, UAE",
      transportMode: "Ocean Freight (LoLo)",
      timeline: "10 Days",
      challenge:
        "Heavy-lift helicopter required crane handling, dockside cradle support, and coordinated lashing under tight port windows.",
      solution:
        "Our UAE team supervised the lift, custom-built saddles, and a specialist stevedore crew working with the line's chief mate to secure under-deck stowage.",
      result: "Vessel sailed on schedule with the helicopter safely lashed for ocean transit.",
    },
  },
  // 8 — col3 / tall — china-guatemala (label). Figma /showcase frame draws
  // this tile at 340×494 (`medium`); we ship it as `tall` (340×560) so the
  // home page mosaic renders unchanged. /showcase col3 sums ~60px taller
  // than the other columns — see DECISIONS.md 2026-05-10.
  {
    id: "china-guatemala",
    src: "/showcase/china-to-guatemala.webp",
    alt: "Helicopter shipment from China to Guatemala",
    label: ["From", "China to", "Guatemala"],
    shape: "tall",
    desktopColumn: 3,
    mobileColumn: 1,
    relatedServices: ["air-commercial", "air-chartering", "ocean-fcl"],
    modal: {
      title: "From China to Guatemala",
      aircraft: "Airbus H225",
      route: "Shanghai → Guatemala City",
      transportMode: "Air Charter (AN-124)",
      timeline: "5 Days",
      challenge:
        "Urgent operational need demanded a Pacific-spanning charter with minimal disassembly and zero scheduled commercial connections.",
      solution:
        "We chartered an Antonov An-124 with a direct Shanghai–Guatemala City routing, managed export licensing in 72 hours, and provided onboard couriers throughout.",
      result: "Delivered five days from booking confirmation — operationally ready on arrival.",
    },
  },
  // ── Tiles 9-14 below are /showcase-only (home slices the first 8). ────────
  // 9 — col3 / short — pure-photo with play icon (video-ready). Ships
  // with a single-item `media` array containing ONLY a video, so the
  // modal video-only path can be exercised (no carousel arrows; just the
  // poster + play overlay → play → stop).
  {
    id: "tile-video-1",
    src: "/showcase/tile-8-video.webp",
    media: [
      {
        type: "video",
        src: "/showcase/sample-video.mp4",
        poster: "/showcase/tile-8-video.webp",
      },
    ],
    alt: "HSC ground crew preparing helicopter for transport",
    hasPlayIcon: true,
    shape: "short",
    desktopColumn: 3,
    mobileColumn: 0,
    modal: {
      // TODO(content): client to provide narrative + real video file.
      title: "Ground Operations",
      aircraft: "Various",
      route: "Worldwide",
      transportMode: "Multi-modal",
      timeline: "Project-based",
      challenge: PLACEHOLDER_CHALLENGE,
      solution: PLACEHOLDER_SOLUTION,
      result: PLACEHOLDER_RESULT,
    },
  },
  // 10 — col0 / tall — pure-photo.
  {
    id: "tile-9",
    src: "/showcase/tile-9.webp",
    alt: "Helicopter wrapped for ocean transit",
    shape: "tall",
    desktopColumn: 0,
    mobileColumn: 0,
    modal: {
      // TODO(content): client to provide narrative for Tile 9.
      title: "Ocean Transit Wrap",
      aircraft: "Various",
      route: "Worldwide",
      transportMode: "Ocean Freight",
      timeline: "Project-based",
      challenge: PLACEHOLDER_CHALLENGE,
      solution: PLACEHOLDER_SOLUTION,
      result: PLACEHOLDER_RESULT,
    },
  },
  // 11 — col1 / extra-short — pure-photo with play icon (video-ready).
  {
    id: "tile-video-2",
    src: "/showcase/tile-10.webp",
    alt: "Heli Skycargo coordination footage",
    hasPlayIcon: true,
    shape: "extra-short",
    desktopColumn: 1,
    mobileColumn: 0,
    modal: {
      // TODO(content): client to provide narrative + real video file.
      title: "Coordination Footage",
      aircraft: "Various",
      route: "Worldwide",
      transportMode: "Multi-modal",
      timeline: "Project-based",
      challenge: PLACEHOLDER_CHALLENGE,
      solution: PLACEHOLDER_SOLUTION,
      result: PLACEHOLDER_RESULT,
    },
  },
  // 12 — col2 / tall — pure-photo.
  {
    id: "tile-11",
    src: "/showcase/tile-11.webp",
    // Shift the visible window leftward so the wrapped helicopter on the
    // photo's left isn't cropped off and the man-with-back subject stays
    // framed per Figma. Tune by adjusting the X% (lower = photo content
    // moves right; higher = moves left).
    objectPosition: "70% 50%",
    alt: "Helicopter pre-flight on the apron",
    shape: "tall",
    desktopColumn: 2,
    mobileColumn: 1,
    modal: {
      // TODO(content): client to provide narrative for Tile 11.
      title: "Pre-flight Preparation",
      aircraft: "Various",
      route: "Worldwide",
      transportMode: "Ground/Air",
      timeline: "Project-based",
      challenge: PLACEHOLDER_CHALLENGE,
      solution: PLACEHOLDER_SOLUTION,
      result: PLACEHOLDER_RESULT,
    },
  },
  // 13 — col3 / short — pure-photo with play icon (video-ready).
  {
    id: "tile-video-3",
    src: "/showcase/tile-12.webp",
    alt: "Heli Skycargo road transport footage",
    hasPlayIcon: true,
    shape: "short",
    desktopColumn: 3,
    mobileColumn: 0,
    modal: {
      // TODO(content): client to provide narrative + real video file.
      title: "Road Transport",
      aircraft: "Various",
      route: "Worldwide",
      transportMode: "Road Freight",
      timeline: "Project-based",
      challenge: PLACEHOLDER_CHALLENGE,
      solution: PLACEHOLDER_SOLUTION,
      result: PLACEHOLDER_RESULT,
    },
  },
  // 14 — col1 / extra-short — pure-photo.
  {
    id: "tile-13",
    src: "/showcase/tile-13.webp",
    alt: "Helicopter ground handling crew at work",
    shape: "extra-short",
    desktopColumn: 1,
    mobileColumn: 1,
    modal: {
      // TODO(content): client to provide narrative for Tile 13.
      title: "Ground Handling",
      aircraft: "Various",
      route: "Worldwide",
      transportMode: "Ground",
      timeline: "Project-based",
      challenge: PLACEHOLDER_CHALLENGE,
      solution: PLACEHOLDER_SOLUTION,
      result: PLACEHOLDER_RESULT,
    },
  },
] as const;

/**
 * /showcase — hero copy + photo. Mobile splits the H1 into 3 lines via
 * forced `<span className="block">` per line; desktop wraps to 2.
 */
export const SHOWCASE_HERO = {
  eyebrow: "Shipment Showcase",
  // Desktop wraps to 2 lines: "Heli Skycargo Shipment / Highlight and More".
  // Mobile renders 3 lines: "Heli Skycargo / Shipment Highlight / and More" (Figma 505:6096).
  h1Desktop: ["Heli Skycargo Shipment", "Highlight and More"] as const,
  h1Mobile: ["Heli Skycargo", "Shipment Highlight", "and More"] as const,
  // TODO(content): copy lifted verbatim from Figma 505:6096 — text appears
  // carried over from the smart-tracking section. Confirm/replace with
  // showcase-appropriate copy at PM review.
  subtitleMobile:
    "Access real-time location of your helicopter while in transit, get push notification.",
  photo: "/showcase/hero-showcase.webp",
  photoAlt: "Heli Skycargo helicopter ready for transit at the loading dock",
} as const;

/**
 * /showcase — gallery heading copy. Desktop trailing copy reads " and More",
 * mobile reads " & More" — match each Figma frame exactly per breakpoint.
 */
export const SHOWCASE_GALLERY = {
  eyebrow: "Case Visuals",
  h2: {
    pre: "Some of ",
    emphasis: "Our Projects",
    postDesktop: " and More",
    postMobile: " & More",
  },
} as const;

/**
 * Smart Tracking app feature cards (5 composite illustrations baked into the
 * home "App Features" section). Listed here so a future "Mobile App" landing
 * or marketing page can reuse the same set without duplicating the images.
 */
export type SmartTrackingCard = {
  id: number;
  src: string;
  alt: string;
};

export const SMART_TRACKING_CARDS: readonly SmartTrackingCard[] = [
  {
    id: 1,
    src: "/home/smart-tracking/card-1.webp",
    alt: "Your helicopter shipment, in real time — desktop and phone tracking dashboards",
  },
  {
    id: 2,
    src: "/home/smart-tracking/card-2.webp",
    alt: "Track every stage of your shipment — delivery information screen",
  },
  {
    id: 3,
    src: "/home/smart-tracking/card-3.webp",
    alt: "Instant status notifications — push alerts feed",
  },
  {
    id: 4,
    src: "/home/smart-tracking/card-4.webp",
    alt: "Shipment documents and media — attachments gallery",
  },
  {
    id: 5,
    src: "/home/smart-tracking/card-5.webp",
    alt: "Progress status and updates — full event timeline",
  },
] as const;

/**
 * Six service offerings — hardcoded per project brief. Powers the home page
 * teaser, the M3 services listing page, and the M4 detail templates. Slugs
 * match the URL segments under `/services/<slug>`.
 *
 * Image assets live in /public/services/<slug>.webp (1400px wide, ~50-110KB).
 * Description copy is editorial — adjust freely; image+slug are the contract.
 */
/**
 * M4 — segment of an overview paragraph. Each paragraph is an array of
 * "regular" and "bold" runs so per-Figma emphasis (carrier names, key terms)
 * survives without raw HTML in `constants.ts`.
 */
export type OverviewSegment = { kind: "regular"; text: string } | { kind: "bold"; text: string };
export type OverviewParagraph = { parts: readonly OverviewSegment[] };

/** M4 — single benefit chip in the service-detail hero. */
export type ServiceBenefit = {
  slug: string;
  label: string;
  /** Path under /public for the chip icon SVG. */
  icon: string;
};

/** M4 — single card in the When-to-Choose 2x2 grid. */
export type WhenToChooseCard = {
  title: string;
  subtitle: string;
};

export type Service = {
  slug: string;
  /** Display name (rendered uppercase via CSS where required). */
  name: string;
  /** Short description shown on the expanded card + summary on detail page. */
  description: string;
  /** Path to the card image in /public. */
  image: string;
  /**
   * `object-position` for the teaser card image. Defaults to `center` when
   * omitted. Used to nudge the visible crop for photos whose subject isn't
   * centered (e.g., a truck cab on the right side).
   */
  imageObjectPosition?: string;

  // ---- M4 — Service Detail Page fields ----

  /** Eyebrow text on detail page hero, e.g. "OVERVIEW OCEAN RO/RO". */
  detailEyebrow: string;
  /** H1 lines on the detail page hero. Length 1 (single line) or 2 (wrapped). */
  detailHeroTitle: readonly [string] | readonly [string, string];
  /** Detail-page hero background photo (full-bleed). */
  detailHeroImage: string;
  /**
   * Optional CSS `object-position` for the detail-page hero photo. Used to
   * bias the focal point per service (e.g. "center 35%" keeps a tall subject
   * visible above the chip strip at the bottom of the hero). Defaults to
   * "center" when omitted.
   */
  detailHeroImagePosition?: string;
  /**
   * 4 benefit chips on the hero. Optional — when omitted, the shared default
   * (`SHARED_DETAIL_HERO_BENEFITS`) renders. Per §6.2 user direction.
   */
  detailHeroBenefits?: readonly ServiceBenefit[];

  /** §3.2 — Overview section. */
  detailOverview: {
    /** Gray pill label, e.g. "Roll-On/Roll-Off Ocean Transport". */
    label: string;
    /** H2 broken into 1, 2, or 3 lines (Figma shows 2–3 across services). */
    title: readonly string[];
    /** Body paragraphs (typically 1–2). */
    paragraphs: readonly OverviewParagraph[];
    /** Section photo (right column desktop, top mobile). */
    image: string;
    /** When true, render the play-badge SVG overlay on the photo. */
    hasVideoBadge?: boolean;
  };

  /** §3.3 — When-to-Choose section. Defaults to SHARED_WHEN_TO_CHOOSE. */
  detailWhenToChoose: {
    /** H2 broken into 2 lines. Defaults to "When to Choose / This Service". */
    title?: readonly [string, string];
    /** Intro paragraph above the cards. */
    intro: string;
    /** Section photo (left column desktop, top mobile). */
    image: string;
    /** Exactly 4 cards. */
    cards: readonly [WhenToChooseCard, WhenToChooseCard, WhenToChooseCard, WhenToChooseCard];
  };
};

/**
 * M4 — Default 4 benefit chips on the service-detail hero.
 * Per §3.1 audit, every audited Figma frame ships these four labels regardless
 * of service. User confirmed (2026-05-06) to keep them identical for now and
 * leave the field overridable.
 */
export const SHARED_DETAIL_HERO_BENEFITS: readonly ServiceBenefit[] = [
  {
    slug: "secure-handling",
    label: "Secure Handling",
    icon: "/services/detail/icons/secure-handling.svg",
  },
  {
    slug: "global-routes",
    label: "Global Routes",
    icon: "/services/detail/icons/global-routes.svg",
  },
  {
    slug: "fast-vessel-loading",
    label: "Fast Vessel Loading",
    icon: "/services/detail/icons/fast-vessel-loading.svg",
  },
  {
    slug: "expert-coordination",
    label: "Expert Coordination",
    icon: "/services/detail/icons/expert-coordination.svg",
  },
];

/**
 * M4 — shared "When to Choose" content. The Figma audit confirmed that
 * intro paragraph + the 4 cards are byte-identical across all 6 service
 * frames. We expose them per-Service anyway so a single page can override
 * later without a code change.
 *
 * TODO: client review of WTC intro — RO/RO-specific copy used as global
 * default ("not served by Ro/Ro carriers" wording is not generic).
 */
export const SHARED_WHEN_TO_CHOOSE = {
  title: ["When to Choose", "This Service"] as const,
  intro:
    "Though this method adds some time to your transportation schedule to account for loading and unloading, it is ideal for situations where the destination or departure port is not served by Ro/Ro carriers, or where the Ro/Ro carrier schedule does not meet your requirements.",
  cards: [
    { title: "Long-Distance", subtitle: "International Transport" },
    { title: "Cost-Efficient", subtitle: "Alternative To Air Freight" },
    { title: "Safe Transport For", subtitle: "Wheeled Helicopter Platforms" },
    { title: "Ideal For Scheduled", subtitle: "Delivery Timelines" },
  ] as const satisfies readonly [
    WhenToChooseCard,
    WhenToChooseCard,
    WhenToChooseCard,
    WhenToChooseCard,
  ],
} as const;

/**
 * Value-Added Services (8 supporting services beyond the 6 main offerings).
 * Powers the M3 services-listing accordion. Slugs reserved for future
 * detail pages but no routes ship in M3. The Ferry Flight Clearance row
 * carries the only `description` + `detail` blurb (the other 7 act as
 * label-only rows in the Figma design).
 */
export type ValueAddedService = {
  slug: string;
  label: string;
  thumb: string;
  description?: string;
  detail?: {
    /** Pre-formatted parts so the bold runs match the Figma typography. */
    leadBold: string;
    leadRest: string;
    midBold: string;
    tail: string;
  };
  /**
   * M4 — short copy used by the service-detail-page Value-Added grid (§3.4).
   * Distinct from `description`/`detail` (which power the M3 services-page
   * accordion) so the same data array can feed both visual treatments.
   */
  shortDescription: string;
  /** M4 — red line-illustration icon path under /public for the grid. */
  iconM4: string;
};

export const VALUE_ADDED_SERVICES: readonly ValueAddedService[] = [
  {
    slug: "equipment-rental",
    label: "Equipment Rental",
    thumb: "/services/value-added/equipment-rental.webp",
    shortDescription: "Lifting tool, transport saddle and other shipping kits available for rental",
    iconM4: "/services/detail/value-added/equipment-rental.png",
  },
  {
    slug: "aog",
    label: "AOG",
    thumb: "/services/value-added/aog.webp",
    shortDescription: "Grounded aircraft? We arrange parts and engineers to restore service fast.",
    iconM4: "/services/detail/value-added/aog.png",
  },
  {
    slug: "obc",
    label: "OBC",
    thumb: "/services/value-added/obc.webp",
    shortDescription:
      "Our hand-carry team ensures supervised transport and secure delivery of critical aeroparts.",
    iconM4: "/services/detail/value-added/obc.png",
  },
  {
    slug: "ferry-flight-clearance",
    label: "Ferry Flight Clearance",
    thumb: "/services/value-added/ferry-flight-clearance.webp",
    description:
      "For remote locations, helicopters may require a ferry flight to a nearby transport hub.",
    detail: {
      leadBold: "Heli Skycargo ",
      leadRest:
        "can take care of the administration, instruction, and logistics of the ferry flight clearance on ",
      midBold: "your behalf to ensure",
      tail: " that your shipping remains on schedule.",
    },
    shortDescription: "import and export custom clearance of Ferry flight in major countries",
    iconM4: "/services/detail/value-added/ferry-flight-clearance.png",
  },
  {
    slug: "customs-brokerage",
    label: "Customs Brokerage",
    thumb: "/services/value-added/customs-brokerage.webp",
    shortDescription:
      "We connect you with expert customs brokers for smooth import clearance at destination.",
    iconM4: "/services/detail/value-added/customs-brokerage.png",
  },
  {
    slug: "crates-manufacturing",
    label: "Crates Manufacturing",
    thumb: "/services/value-added/crates-manufacturing.webp",
    shortDescription: "We source bespoke crates to safely transport blades and accessories",
    iconM4: "/services/detail/value-added/crates-manufacturing.png",
  },
  {
    slug: "shrink-wrapping",
    label: "Shrink Wrapping",
    thumb: "/services/value-added/shrink-wrapping.webp",
    shortDescription:
      "Shrink-wrapping services to protect and preserve your helicopter during transport.",
    iconM4: "/services/detail/value-added/shrink-wrapping.png",
  },
  {
    slug: "cargo-insurance",
    label: "Cargo Insurance",
    thumb: "/services/value-added/cargo-insurance.webp",
    shortDescription:
      "We prioritise protecting high-value cargo from loss, damage, or risk during transit.",
    iconM4: "/services/detail/value-added/cargo-insurance.png",
  },
] as const;

/** M4 helper: build a paragraph from interleaved regular/bold runs. */
const para = (parts: readonly OverviewSegment[]): OverviewParagraph => ({ parts });
const reg = (text: string): OverviewSegment => ({ kind: "regular", text });
const bold = (text: string): OverviewSegment => ({ kind: "bold", text });

export const SERVICES: readonly Service[] = [
  {
    slug: "ocean-roro",
    name: "Ocean RO/RO",
    description: "Transport your aircraft using Ro/Ro vessel, loaded on a MAFI or simply towing.",
    image: "/services/ocean-roro.webp",
    detailEyebrow: "OVERVIEW OCEAN RO/RO",
    detailHeroTitle: ["Roll-On/Roll-Off", "Ocean Transport"],
    detailHeroImage: "/services/detail/ocean-roro-hero.webp",
    detailHeroImagePosition: "center 65%",
    detailOverview: {
      label: "Roll-On/Roll-Off Ocean Transport",
      title: ["Fast, Secure", "Helicopter Transport", "Using RoRo Vessels."],
      paragraphs: [
        para([
          reg("Shipped on a "),
          bold("MAFI Roll Trailer"),
          reg(" or "),
          bold("towed inside the vessel"),
          reg(
            ", helicopters are stowed and transported safely under deck. With Ro/Ro vessels, loading and unloading is fast and efficient, saving valuable time on the transportation journey.",
          ),
        ]),
        para([
          reg(
            "Heli Skycargo contracts with the very best global Ro/Ro carriers, including NYK, Höegh Autoliners, Wallenius Wilhelmsen, ",
          ),
          reg("MOL (Mitsui O.S.K. Lines)"),
          reg(", K Line, Armacup, "),
          reg("EUKOR"),
          reg(", the Grimaldi Group, Bahri Shipping and many others."),
        ]),
      ],
      image: "/services/detail/ocean-roro-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/ocean-roro-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
  {
    slug: "ocean-lolo",
    name: "Ocean LO/LO",
    description: "Safe Lift-on/Lift-off into cargo load of container vessel or MPV Breakbulk ship.",
    image: "/services/ocean-lolo.webp",
    detailEyebrow: "OVERVIEW OCEAN LO/LO",
    detailHeroTitle: ["Ocean Lift-On / Lift-Off", "Transport Method"],
    detailHeroImage: "/services/detail/ocean-lolo-hero.webp",
    detailHeroImagePosition: "center 40%",
    detailOverview: {
      label: "Lift-on / Lift-off Shipping",
      title: ["Container & Heavy", "Lift Shipping Options"],
      paragraphs: [
        para([
          reg("Alternatively, helicopters can be transported using a "),
          bold("Lift-On/Lift-Off method"),
          reg(" – either via container ships or a multipurpose "),
          bold("heavy lift vessel"),
          reg(
            ". The cargo is lifted on and off the shipping vessel by crane, before being safely stored and secured for travel.",
          ),
        ]),
        para([
          reg(
            "Though this method adds some time to your transportation schedule to account for loading and unloading, it is ideal for situations where the destination or departure port is not served by Ro/Ro carriers, or where the Ro/Ro carrier schedule does not meet your requirements.",
          ),
        ]),
      ],
      image: "/services/detail/ocean-lolo-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/ocean-lolo-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
  {
    slug: "ocean-fcl",
    name: "Ocean FCL",
    description:
      "Save on freight cost by shipping in 40' container High Cube, Open Top or Flat Rack.",
    image: "/services/ocean-fcl.webp",
    detailEyebrow: "OVERVIEW OCEAN FCL",
    detailHeroTitle: ["Ocean FCL - Container Transport"],
    detailHeroImage: "/services/detail/ocean-fcl-hero.webp",
    detailHeroImagePosition: "center 40%",
    detailOverview: {
      // TODO: client review of FCL eyebrow text — replaced "Lift-on / Lift-off
      // Shipping" Figma value with "Full Container Load Shipping" pending
      // content review (per M4 plan §6.4).
      label: "Full Container Load Shipping",
      title: ["Dedicated & Secure", "Full Container Ocean", "Solutions"],
      paragraphs: [
        para([
          reg(
            "Whether partially or fully disassembled, helicopters can be transported using 40' high cube, 40' open-top, or 40' flat rack containers.",
          ),
        ]),
      ],
      image: "/services/detail/ocean-fcl-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/ocean-fcl-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
  {
    slug: "road-freight",
    name: "Road Freight",
    description:
      "We deal with assets-own trucking companies providing GPS-equipped Air-ride specialised trailers.",
    image: "/services/road-freight.webp",
    detailEyebrow: "OVERVIEW ROAD FREIGHT",
    detailHeroTitle: ["Helicopter Road Freight Solutions"],
    detailHeroImage: "/services/detail/road-freight-hero.webp",
    detailOverview: {
      label: "Road Freight Transport",
      title: ["End-to-End", "Road Freight Services"],
      paragraphs: [
        para([
          reg(
            "Whether the helicopter is being exclusively transported by road, or it is just a small part of the wider journey, Heli Skycargo can arrange road freight solutions including road survey and road permit application to meet your exact requirements.",
          ),
        ]),
        para([
          reg(
            "Our carefully selected trucking and haulage companies are on standby ready to serve, and we have exclusive contracts around the world with specialist freight companies offering exceptional transports using air ride and hydraulic trucks.",
          ),
        ]),
      ],
      image: "/services/detail/road-freight-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/road-freight-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
  {
    slug: "air-commercial",
    name: "Air Commercial",
    description: "Ship your aircraft on B74 Freighter.",
    image: "/services/air-commercial.webp",
    detailEyebrow: "OVERVIEW AIR COMMERCIAL",
    detailHeroTitle: ["Commercial Air Freight Transport Solutions"],
    detailHeroImage: "/services/detail/air-commercial-hero.webp",
    detailHeroImagePosition: "center 35%",
    detailOverview: {
      label: "Air Cargo",
      title: ["Reliable & Flexible", "Commercial Air Cargo", "Transport"],
      paragraphs: [
        para([
          reg(
            "If you have a flexible or more generous deadline for your shipping journey, then commercial air transportation is an excellent option. Depending on the departure and arrival locations and the carrier flight schedule, door-to-door transit time typically ranges from just 7 to 10 days.",
          ),
        ]),
        para([
          reg(
            'Once dismantled, the helicopter is securely positioned on 20" aircraft pallets and loaded on board B747-400F or modern B747-8F aircraft. We arrange transportation with only the most reputable commercial cargo freighters, including Cargolux, Korean Air, Silk Way West Airlines, China Airlines, Cathay Pacific, and Singapore Airlines.',
          ),
        ]),
      ],
      image: "/services/detail/air-commercial-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/air-commercial-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
  {
    slug: "air-chartering",
    name: "Air Chartering",
    description:
      "When time is of the essence or to reach places unreachable by 74F, go for the mighty Antonov124-100 or the IL76.",
    image: "/services/air-chartering.webp",
    detailEyebrow: "OVERVIEW AIR CHARTERING",
    detailHeroTitle: ["Air Charter Transport for Urgent Shipments"],
    detailHeroImage: "/services/detail/air-chartering-hero.webp",
    detailHeroImagePosition: "center 55%",
    detailOverview: {
      label: "Air Charter Transport",
      title: ["Fast-Response", "Aircraft Charter", "Transport Solutions"],
      // TODO: confirm Air Chartering overview copy with client — Figma
      // duplicates the Air Commercial paragraphs (per M4 plan §6.4).
      paragraphs: [
        para([
          reg(
            "If you have a flexible or more generous deadline for your shipping journey, then commercial air transportation is an excellent option. Depending on the departure and arrival locations and the carrier flight schedule, door-to-door transit time typically ranges from just 7 to 10 days.",
          ),
        ]),
        para([
          reg(
            'Once dismantled, the helicopter is securely positioned on 20" aircraft pallets and loaded on board B747-400F or modern B747-8F aircraft. We arrange transportation with only the most reputable commercial cargo freighters, including Cargolux, Korean Air, Silk Way West Airlines, China Airlines, Cathay Pacific, and Singapore Airlines.',
          ),
        ]),
      ],
      image: "/services/detail/air-chartering-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/air-chartering-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
] as const;

// ── M5 — Why Choose Heli Skycargo page content ──────────────────────────────

export const WHY_CHOOSE_HERO = {
  eyebrow: "Bespoke Helicopter Shipping",
  // Mobile renders both lines stacked; desktop joins them on a single line.
  h1Lines: ["Why Choose", "Heli Skycargo"] as const,
  photo: "/why-choose-us/hero-team.webp",
  photoAlt: "Heli Skycargo team in front of a Leonardo helicopter",
} as const;

export const WHY_CHOOSE_GLOBAL_REACH = {
  eyebrow: "Global Reach",
  h2: {
    line1: "Wherever your aircraft needs to go,",
    line2Pre: "we make it ",
    line2Highlight: "happen",
    line2Post: ".",
  },
  lede: "No matter from where to where, our experience and expertise in helicopter shipping will deliver a logistical solution catered to your needs and budget. 24/7, we are here for you. Our proven ability to orchestrate helicopter shipping & chartering makes us your partner of choice",
  ctaLabel: "Request Quote",
  ctaHref: "#request-quote",
} as const;

/**
 * Description text mapped by stat label. The Sanity siteStats schema doesn't
 * carry descriptions, so the section component looks them up by label after
 * fetching. Editor-added stats with unmatched labels render without a
 * description (graceful degrade).
 */
/**
 * Two-line descriptions for each stat. Breaks are FIXED to match Figma's
 * mobile counts frame (505:7491 / 674:721 etc.) — same break points at every
 * viewport so the cards read consistently across desktop + mobile. The
 * `StatsBand` component renders each entry as `line1<br/>line2`.
 */
export const STAT_DESCRIPTIONS: Record<string, readonly [string, string]> = {
  "Shipments Completed": ["Air and ocean logistics,", "fully visible end-to-end."],
  "Available Support": ["Always ready.", "Always delivering."],
  "Clients Worldwide": ["Trusted worldwide for reliable", "freight solutions."],
  "Trusted Since": ["We deliver everywhere, to the", "farthest reaches."],
};

/**
 * Fallback used when the Sanity siteStats query returns null (pre-seed dev).
 * TODO(seed): drop once Sanity is populated via `npm run seed:sanity`.
 */
export type PlaceholderSiteStat = { value: string; label: string; order: number };

export const PLACEHOLDER_SITE_STATS: readonly PlaceholderSiteStat[] = [
  { value: "1000+", label: "Shipments Completed", order: 1 },
  { value: "24/7", label: "Available Support", order: 2 },
  { value: "50+", label: "Clients Worldwide", order: 3 },
  { value: "2014", label: "Trusted Since", order: 4 },
];

export const WHY_CHOOSE_INTRO_PHOTO = {
  src: "/why-choose-us/team-band.webp",
  alt: "Heli Skycargo team in front of a Leonardo AW189 helicopter",
} as const;

export type FeatureBlockH2Line = { text: string; weight: "black" | "bold" };

export type FeatureBlockContent = {
  eyebrow: string;
  h2Lines: readonly FeatureBlockH2Line[];
  /** Single intro paragraph above the bullets (Seamless variant). */
  lede?: string;
  /** Body paragraphs (Tailored variant). */
  paragraphs?: readonly string[];
  /** Bullet list (Seamless variant). */
  bullets?: readonly string[];
  photo: {
    src: string;
    alt: string;
    /** Optional mobile-only override (<lg). Set when Figma uses a different
     *  shot on the mobile frame than on desktop. */
    mobileSrc?: string;
  };
  /** Desktop-only image side; mobile is always image-top. */
  imageSide: "left" | "right";
  ctaLabel: string;
  ctaHref: string;
};

export const WHY_CHOOSE_FEATURE_BLOCKS: readonly FeatureBlockContent[] = [
  {
    eyebrow: "Why Choose Us",
    h2Lines: [
      { text: "Seamless coordination", weight: "black" },
      { text: "from planning to", weight: "bold" },
      { text: "delivery.", weight: "bold" },
    ],
    lede: "We combine technical understanding with hands-on logistics experience to deliver reliable, flexible shipping solutions for every mission.",
    bullets: [
      "Dedicated specialists in helicopter transport",
      "Global air and ocean freight coordination",
      "End-to-end shipment visibility through our bespoke app",
      "Strong international partner network",
      "Personal support from planning to delivery",
    ],
    photo: {
      src: "/why-choose-us/seamless-photo.webp",
      alt: "Three HSC specialists in hardhats and safety vests posing on a vessel deck beside a container ship",
    },
    imageSide: "left",
    ctaLabel: "Request Quote",
    ctaHref: "#request-quote",
  },
  {
    eyebrow: "Our Approach",
    h2Lines: [
      { text: "Tailored logistic", weight: "black" },
      { text: "solutions built around", weight: "bold" },
      { text: "your aircraft", weight: "bold" },
    ],
    paragraphs: [
      "Every shipment is different. That's why we design tailored transport strategies based on aircraft type, timeline, destination requirements, and handling needs.",
      "Our team coordinates each stage of transport — ensuring safe handling, regulatory compliance, and on-time delivery.",
    ],
    photo: {
      src: "/why-choose-us/tailored-photo.webp",
      alt: "Wrapped helicopter being lifted by ship-side crane",
      // Mobile-only override (Figma 505:7539): wider shot of the wrapped
      // helicopter on a trailer being rolled onto the "Grande Torino" RoRo.
      mobileSrc: "/why-choose-us/tailored-photo-mobile.webp",
    },
    imageSide: "right",
    ctaLabel: "Request Quote",
    ctaHref: "#request-quote",
  },
];

export const WHY_CHOOSE_TRACKABILITY = {
  eyebrow: "Trackability",
  h2: {
    line1: "Precision Helicopter",
    line2: "Shipping. Globally.",
  },
  lede: "Access real-time location of your helicopter while in transit, get push notification.",
} as const;

// ── M8 — Request a Quote ───────────────────────────────────────────────────

/**
 * Mode-of-transport options (Step 01). Order locked by Figma's desktop layout:
 * the 6 radio widths sum to exactly 1040px in this sequence (180 / 150 / 150 /
 * 230 / 180 / 120 + 5×6px gaps), which matches the form card's content width.
 * The mobile pill cycles through the same order.
 *
 * Replaces the earlier 6-string list in QuoteFormShell.tsx (Figma-canonical).
 */
export const QUOTE_TRANSPORT_MODES = [
  "Air Commercial",
  "Air Charter",
  "Ocean RoRo",
  "Ocean Breakbulk (Lo/Lo)",
  "Ocean Container",
  "Land",
] as const;

/**
 * Shell-variant mode-of-transport list. Per Figma `344:3275` (home shell) the
 * 6 radios render in a 3×2 grid with this order — Air Charter first, no
 * "(Lo/Lo)" suffix on Breakbulk. The canonical full list above is still the
 * source of truth for validation (server-side accepts both shell and standalone
 * orderings); the shell variant is purely a presentation override.
 */
export const QUOTE_SHELL_TRANSPORT_MODES = [
  "Air Charter",
  "Air Commercial",
  "Ocean RoRo",
  "Ocean Container",
  "Land",
  "Ocean Breakbulk (Lo/Lo)",
] as const;

/**
 * Helicopter brand list for Step 03 — first dropdown. Airbus list is canonical
 * (11 models pulled from Figma). The other 7 carry TODO(content) placeholders;
 * client supplies real catalogs.
 *
 * Prefixed `QUOTE_` to avoid collision with the existing `HELICOPTER_BRANDS`
 * constant (manufacturer logos rendered in the home partners strip).
 */
export const QUOTE_HELICOPTER_BRANDS = [
  "Airbus",
  "Leonardo",
  "Sikorsky",
  "Bell",
  "Robinson",
  "Boeing",
  "Kaman model",
  "K-Max",
] as const;

export const QUOTE_HELICOPTER_MODELS_BY_BRAND: Readonly<Record<string, readonly string[]>> = {
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
  // TODO(content): client to confirm full per-brand model catalogs.
  Leonardo: ["AW109", "AW119", "AW139", "AW169", "AW189"],
  Sikorsky: ["S-76", "S-92", "CH-53"],
  Bell: ["206", "407", "412", "429", "505", "525"],
  Robinson: ["R22", "R44", "R66"],
  Boeing: ["CH-47", "AH-6", "MH-6"],
  "Kaman model": ["K-MAX", "SH-2G"],
  "K-Max": ["K-1200", "K-MAX-TITAN"],
};

export const QUOTE_QUANTITIES = ["01", "02", "03", "04", "05", "06"] as const;

// TODO(content): client to confirm transaction-type options + ordering.
export const QUOTE_TRANSACTION_TYPES = ["Purchase", "Sale", "Lease", "Trade-in", "Other"] as const;

/**
 * Service-slug → prefilled mode-of-transport. Used by the service-detail
 * pages so clicking "Request Quote" inside a Ocean Ro/Ro page lands the
 * embedded form with that mode preselected.
 */
export const QUOTE_MODE_BY_SERVICE_SLUG: Readonly<
  Record<string, (typeof QUOTE_TRANSPORT_MODES)[number]>
> = {
  "ocean-roro": "Ocean RoRo",
  "ocean-lolo": "Ocean Breakbulk (Lo/Lo)",
  "ocean-fcl": "Ocean Container",
  "road-freight": "Land",
  "air-commercial": "Air Commercial",
  "air-chartering": "Air Charter",
};

/** Hero copy for the standalone /quote route. CMS hero_headline overrides line 1. */
export const QUOTE_HERO = {
  eyebrow: "Request a Quote",
  headline: {
    desktop: ["Share Your Shipment Details", "We'll Handle The Rest."],
    mobile: ["Share Your Shipment", "Details. We'll", "Handle The Rest."],
  },
  photo: {
    /**
     * Single hero asset (1600×700, ~63 KB). Mobile portrait crops the same
     * image via `object-position: 35% center` to keep the plane nose + ramp
     * loading scene framed. One image keeps the CMS `hero_image` override
     * round-trip clean — editors upload one asset, it works at every breakpoint.
     */
    src: "/quote/quote-hero.webp",
    alt: "Antonov AN-124 cargo aircraft with nose lifted, helicopter being loaded via ramp",
  },
} as const;

export const QUOTE_FORM_DEFAULTS = {
  successMessage: "Thank you for your enquiry. Our ops team will reply within 24 hours.",
  submitLabel: "Submit",
  submittingLabel: "Submitting…",
  disclaimer: "All fields marked * are required · Data transmitted over secure channel",
  legalAttribution:
    "This site is protected by Cloudflare Turnstile and the Cloudflare Privacy Policy and Terms of Service apply.",
} as const;

// ── M6 — Our Team page content ──────────────────────────────────────────────

export const TEAM_HERO = {
  eyebrow: "Our Team",
  // Mobile: 3 explicit `block` lines (one per array entry, Figma `505:6782`).
  // Desktop (lg+): the three spans become `inline`, so the headline reflows
  // inside `max-w-[633px]` at 64 px — the browser picks the wrap point.
  h1Lines: ["Meet the People", "Behind Every", "Shipment"] as const,
  // Two crops of the same source candid (Figma `505:6782` mobile / `344:4891`
  // desktop): wide 16:7 for tablet+, near-square 0.91 for mobile so the team
  // fills the portrait frame instead of getting horizontally cropped.
  photo: "/team/hero-team.webp",
  photoMobile: "/team/hero-team-mobile.webp",
  photoAlt: "Heli Skycargo team behind the scenes",
} as const;

export const TEAM_INTRO = {
  eyebrow: "Experts You Can Trust",
  // 4-line mixed-weight headline on mobile per Figma `505:7076`. On desktop
  // lines 3 + 4 visually collapse to a single line ("to deliver BEST-IN-CLASS
  // service.") via responsive class swap in SpotlightHeadline. Weight is
  // hardcoded per line in the component — line 0 is black, the rest bold.
  h2Lines: [
    "At Heli Skycargo,",
    "our team is fueled by passion",
    "to deliver BEST-IN-CLASS",
    "service.",
  ],
} as const;

/**
 * Spotlight composite imagery — the per-member wide candid photo + the
 * dark gradient overlay that sits on top. M6_PLAN §6.6: only the CEO has a
 * Figma-supplied portrait today, so all 9 members reuse Stephane's spotlight
 * photo as a placeholder until the client supplies the rest.
 */
export const TEAM_SPOTLIGHT_OVERLAY = {
  src: "/team/spotlight/overlay.svg",
  alt: "",
} as const;

export const TEAM_SPOTLIGHT_PLACEHOLDER_PHOTO = {
  src: "/team/spotlight/stephane.webp",
  alt: "Heli Skycargo team member",
} as const;

export type TeamMemberPlaceholder = {
  _id: string;
  full_name: string;
  role: string;
  /** Static portrait PNG used while Sanity is empty. Card slot. */
  placeholderPhoto: string;
  /** Wide candid photo behind the spotlight content. */
  spotlightPhoto?: { src: string; alt: string };
  /** Lorem-ipsum-style placeholder bio paragraphs. CEO uses verbatim Figma copy. */
  bioParagraphs?: readonly string[];
  social_links?: { linkedin?: string; email?: string };
  /** Default-active flag; only ONE member should be true at a time. */
  is_featured?: boolean;
};

const LOREM_BIO_1 =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const LOREM_BIO_2 =
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.";

/**
 * Source of truth for the placeholder team list. Both `home/TeamTeaser`
 * (slice 0..4) and `/team` (all 9) consume this array. Display order is
 * canonical desktop order per M6_PLAN §3.2.3 — mobile-only role variants and
 * the extra "Tim Walsh" entry from the mobile mock are intentionally dropped.
 */
export const PLACEHOLDER_TEAM_MEMBERS: readonly TeamMemberPlaceholder[] = [
  {
    _id: "team.stephane-marot",
    full_name: "Stephane Marot",
    role: "Founder & CEO",
    placeholderPhoto: "/team/stephane-marot.webp",
    spotlightPhoto: TEAM_SPOTLIGHT_PLACEHOLDER_PHOTO,
    bioParagraphs: [
      "With 25+ years in global freight forwarding across Europe, USA, Asia and Middle East. Stephane brings deep industry expertise and a strong customer-focused approach.",
      "Having accompanied helicopter shipments onboard aircraft such as the AN-124 and IL-76, he has built a trusted worldwide network and remains closely involved in supporting clients across the globe.",
    ],
    social_links: {
      linkedin: "https://linkedin.com/in/stephanemarot",
      email: "stephane@heliskycargo.com",
    },
    is_featured: true,
  },
  {
    _id: "team.daniel-cosico",
    full_name: "Daniel Cosico",
    role: "Deployment & Lead Coordinator",
    placeholderPhoto: "/team/daniel-cosico.webp",
    // TODO(content): client to provide bio for Daniel Cosico.
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
  },
  {
    _id: "team.adriana-athirah",
    full_name: "Adriana Athirah",
    role: "Sales & Marketing Executive",
    placeholderPhoto: "/team/adriana-athirah.png",
    // TODO(content): client to provide bio for Adriana Athirah.
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
  },
  {
    _id: "team.rica-mae-cortez",
    full_name: "Rica Mae Cortez",
    role: "Logistic Specialist",
    placeholderPhoto: "/team/rica-mae-cortez.webp",
    // TODO(content): client to provide bio for Rica Mae Cortez.
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
  },
  {
    _id: "team.alfredo-dinglasan",
    full_name: "Alfredo Dinglasan",
    role: "Logistic Specialist",
    placeholderPhoto: "/team/alfredo-dinglasan.webp",
    // TODO(content): client to provide bio for Alfredo Dinglasan.
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
  },
  {
    _id: "team.nikhitha-manuel",
    full_name: "Nikhitha Manuel",
    role: "RFQ",
    placeholderPhoto: "/team/nikhitha-manuel.webp",
    // TODO(content): client to provide bio for Nikhitha Manuel.
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
  },
  {
    _id: "team.remi-hachisuka",
    full_name: "Remi Hachisuka",
    role: "Japan Desk Manager",
    placeholderPhoto: "/team/remi-hachisuka.webp",
    // TODO(content): client to provide bio for Remi Hachisuka.
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
  },
  {
    _id: "team.anjelimo-mulati",
    full_name: "Anjelimo Mulati",
    role: "Accounting",
    placeholderPhoto: "/team/anjelimo-mulati.webp",
    // TODO(content): client to provide bio for Anjelimo Mulati.
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
  },
  {
    _id: "team.mia-juliet-marot",
    full_name: "Mia Juliet Marot",
    role: "Junior Sales & Marketing",
    placeholderPhoto: "/team/mia-juliet-marot.webp",
    // TODO(content): client to provide bio for Mia Juliet Marot.
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
  },
];

export const SERVICES_TEASER: readonly Service[] = [
  {
    slug: "ocean-roro",
    name: "Ocean RO/RO",
    description: "Transport your aircraft using Ro/Ro vessel, loaded on a MAFI or simply towing.",
    image: "/home/services-teaser/ser-1.webp",
    detailEyebrow: "OVERVIEW OCEAN RO/RO",
    detailHeroTitle: ["Roll-On/Roll-Off", "Ocean Transport"],
    detailHeroImage: "/home/services-teaser/ser-1.webp",
    detailOverview: {
      label: "Roll-On/Roll-Off Ocean Transport",
      title: ["Fast, Secure", "Helicopter Transport", "Using RoRo Vessels."],
      paragraphs: [
        para([
          reg("Shipped on a "),
          bold("MAFI Roll Trailer"),
          reg(" or "),
          bold("towed inside the vessel"),
          reg(
            ", helicopters are stowed and transported safely under deck. With Ro/Ro vessels, loading and unloading is fast and efficient, saving valuable time on the transportation journey.",
          ),
        ]),
        para([
          reg(
            "Heli Skycargo contracts with the very best global Ro/Ro carriers, including NYK, Höegh Autoliners, Wallenius Wilhelmsen, ",
          ),
          reg("MOL (Mitsui O.S.K. Lines)"),
          reg(", K Line, Armacup, "),
          reg("EUKOR"),
          reg(", the Grimaldi Group, Bahri Shipping and many others."),
        ]),
      ],
      image: "/services/detail/ocean-roro-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/ocean-roro-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
  {
    slug: "ocean-lolo",
    name: "Ocean LO/LO",
    description: "Safe Lift-on/Lift-off into cargo load of container vessel or MPV Breakbulk ship.",
    image: "/home/services-teaser/ser-2.webp",
    detailEyebrow: "OVERVIEW OCEAN LO/LO",
    detailHeroTitle: ["Ocean Lift-On / Lift-Off", "Transport Method"],
    detailHeroImage: "/home/services-teaser/ser-2.webp",
    detailOverview: {
      label: "Lift-on / Lift-off Shipping",
      title: ["Container & Heavy", "Lift Shipping Options"],
      paragraphs: [
        para([
          reg("Alternatively, helicopters can be transported using a "),
          bold("Lift-On/Lift-Off method"),
          reg(" – either via container ships or a multipurpose "),
          bold("heavy lift vessel"),
          reg(
            ". The cargo is lifted on and off the shipping vessel by crane, before being safely stored and secured for travel.",
          ),
        ]),
        para([
          reg(
            "Though this method adds some time to your transportation schedule to account for loading and unloading, it is ideal for situations where the destination or departure port is not served by Ro/Ro carriers, or where the Ro/Ro carrier schedule does not meet your requirements.",
          ),
        ]),
      ],
      image: "/services/detail/ocean-lolo-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/ocean-lolo-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
  {
    slug: "ocean-fcl",
    name: "Ocean FCL",
    description: "Flat Rack is an alternative and cost effective way of shipping.",
    image: "/home/services-teaser/ser-3.webp",
    detailEyebrow: "OVERVIEW OCEAN FCL",
    detailHeroTitle: ["Ocean FCL - Container Transport"],
    detailHeroImage: "/home/services-teaser/ser-3.webp",
    detailOverview: {
      // TODO: client review of FCL eyebrow text — replaced "Lift-on / Lift-off
      // Shipping" Figma value with "Full Container Load Shipping" pending
      // content review (per M4 plan §6.4).
      label: "Full Container Load Shipping",
      title: ["Dedicated & Secure", "Full Container Ocean", "Solutions"],
      paragraphs: [
        para([
          reg(
            "Whether partially or fully disassembled, helicopters can be transported using 40' high cube, 40' open-top, or 40' flat rack containers.",
          ),
        ]),
      ],
      image: "/services/detail/ocean-fcl-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/ocean-fcl-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
  {
    slug: "road-freight",
    name: "Road Freight",
    description:
      "We deal with assets-own trucking companies providing GPS-equipped Air-ride specialised trailers.",
    image: "/home/services-teaser/ser-4.webp",
    imageObjectPosition: "30% 50%",
    detailEyebrow: "OVERVIEW ROAD FREIGHT",
    detailHeroTitle: ["Helicopter Road Freight Solutions"],
    detailHeroImage: "/home/services-teaser/ser-4.webp",
    detailOverview: {
      label: "Road Freight Transport",
      title: ["End-to-End", "Road Freight Services"],
      paragraphs: [
        para([
          reg(
            "Whether the helicopter is being exclusively transported by road, or it is just a small part of the wider journey, Heli Skycargo can arrange road freight solutions including road survey and road permit application to meet your exact requirements.",
          ),
        ]),
        para([
          reg(
            "Our carefully selected trucking and haulage companies are on standby ready to serve, and we have exclusive contracts around the world with specialist freight companies offering exceptional transports using air ride and hydraulic trucks.",
          ),
        ]),
      ],
      image: "/services/detail/road-freight-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/road-freight-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
  {
    slug: "air-commercial",
    name: "Air Commercial",
    description: "Ship your aircraft on B74 Freighter.",
    image: "/home/services-teaser/ser-5.webp",
    detailEyebrow: "OVERVIEW AIR COMMERCIAL",
    detailHeroTitle: ["Commercial Air Freight Transport Solutions"],
    detailHeroImage: "/home/services-teaser/ser-5.webp",
    detailOverview: {
      label: "Air Cargo",
      title: ["Reliable & Flexible", "Commercial Air Cargo", "Transport"],
      paragraphs: [
        para([
          reg(
            "If you have a flexible or more generous deadline for your shipping journey, then commercial air transportation is an excellent option. Depending on the departure and arrival locations and the carrier flight schedule, door-to-door transit time typically ranges from just 7 to 10 days.",
          ),
        ]),
        para([
          reg(
            'Once dismantled, the helicopter is securely positioned on 20" aircraft pallets and loaded on board B747-400F or modern B747-8F aircraft. We arrange transportation with only the most reputable commercial cargo freighters, including Cargolux, Korean Air, Silk Way West Airlines, China Airlines, Cathay Pacific, and Singapore Airlines.',
          ),
        ]),
      ],
      image: "/services/detail/air-commercial-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/air-commercial-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
  {
    slug: "air-chartering",
    name: "Air Chartering",
    description:
      "When time is of the essence or to reach places unreachable by 74F, go for the mighty Antonov124-100 or the IL76.",
    image: "/home/services-teaser/ser-6.webp",
    imageObjectPosition: "70% 50%",
    detailEyebrow: "OVERVIEW AIR CHARTERING",
    detailHeroTitle: ["Air Charter Transport for Urgent Shipments"],
    detailHeroImage: "/home/services-teaser/ser-6.webp",
    detailOverview: {
      label: "Air Charter Transport",
      title: ["Fast-Response", "Aircraft Charter", "Transport Solutions"],
      paragraphs: [
        para([
          reg(
            "If you have a flexible or more generous deadline for your shipping journey, then commercial air transportation is an excellent option. Depending on the departure and arrival locations and the carrier flight schedule, door-to-door transit time typically ranges from just 7 to 10 days.",
          ),
        ]),
        para([
          reg(
            'Once dismantled, the helicopter is securely positioned on 20" aircraft pallets and loaded on board B747-400F or modern B747-8F aircraft. We arrange transportation with only the most reputable commercial cargo freighters, including Cargolux, Korean Air, Silk Way West Airlines, China Airlines, Cathay Pacific, and Singapore Airlines.',
          ),
        ]),
      ],
      image: "/services/detail/air-chartering-overview.webp",
      hasVideoBadge: true,
    },
    detailWhenToChoose: {
      title: SHARED_WHEN_TO_CHOOSE.title,
      intro: SHARED_WHEN_TO_CHOOSE.intro,
      image: "/services/detail/air-chartering-when.webp",
      cards: SHARED_WHEN_TO_CHOOSE.cards,
    },
  },
] as const;
