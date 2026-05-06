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
  { label: "About Heli Skycargo", href: "/about" },
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
  {
    label: "Our Team",
    href: "/team",
    children: [
      { label: "Leadership", href: "/team#leadership" },
      { label: "Operations", href: "/team#operations" },
    ],
  },
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

/**
 * App download links. TODO: replace placeholder hrefs with the real
 * App Store and Google Play URLs when the client provides them.
 */
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
 * Global office locations rendered in the home "Across all regions worldwide"
 * section. UAE is the featured HQ (red overlay on desktop, default-active tab on mobile). Phone/email values
 * sourced verbatim from Figma node 505:6025; the developer should verify the
 * USA + Malaysia phone numbers (look like placeholders that re-use the HK
 * number) before launch.
 */
export type Office = {
  id: string;
  /** Small label printed above the country name, e.g. "Heli Skycargo Limited". */
  label: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  /**
   * Marks the headquarters office. Drives the desktop red overlay AND the
   * mobile "featured + tabs" default-active state.
   */
  featured?: boolean;
};

export const OFFICES: readonly Office[] = [
  {
    id: "hk",
    label: "Heli Skycargo Limited",
    country: "Hong Kong",
    address: "Suite 409, 87-105 Chatham Road South, TST",
    phone: "+852 6698 0871",
    email: "info@heliskycargo.com",
  },
  {
    id: "uae",
    label: "Heli Skycargo Global Customer Support Center",
    country: "UAE",
    address: "Emaar Business Park, Dubai",
    phone: "+971 558 247 780",
    email: "team@heliskycargo.com",
    featured: true,
  },
  {
    id: "usa",
    label: "Heli Skycargo USA LLC",
    country: "USA",
    address: "16501 Ventura Blvd, Encino, California",
    phone: "+852 6698 0871",
    email: "commercial@heliskycargo.com",
  },
  {
    id: "my",
    label: "Heli Skycargo Warehouse",
    country: "Malaysia",
    address: "Kuala Lumpur",
    phone: "+852 6698 0871",
    email: "info@heliskycargo.com",
  },
] as const;

/**
 * Past-shipment showcase tiles, used by the home "Some of OUR PROJECTS and
 * More" bento mosaic AND the future M7 (Shipment Showcase) listing page.
 * Order is the canonical desktop bento order — the mosaic component slices
 * this into four 2-tile columns and applies the alternating tall/short
 * pattern; the M7 page is free to reflow as a flat grid.
 *
 * Tiles with a `label` array overlay the route text; pure photo tiles omit
 * it. `showFlag` is the Japan-flag corner badge for the "Our Japan Desk" tile.
 */
export type ShowcaseTile = {
  id: string;
  src: string;
  alt: string;
  label?: readonly string[];
  showFlag?: boolean;
};

export const SHOWCASE_TILES: readonly ShowcaseTile[] = [
  {
    id: "switzerland-india",
    src: "/showcase/switzerland-to-india.webp",
    alt: "Helicopter shipment from Switzerland to India",
    label: ["From", "Switzer-", "land to", "India"],
  },
  { id: "loading-1", src: "/showcase/project-2.webp", alt: "Helicopter loading operations" },
  {
    id: "japan-desk",
    src: "/showcase/japan-desk.webp",
    alt: "HSC Japan office team",
    label: ["Our", "Japan", "Desk"],
    showFlag: true,
  },
  {
    id: "belgium-cameroon",
    src: "/showcase/belgium-to-cameroon.webp",
    alt: "Helicopter shipment from Belgium to Cameroon",
    label: ["From", "Belgium", "to", "Cameroon"],
  },
  {
    id: "myanmar-gabon",
    src: "/showcase/myanmar-to-gabon.webp",
    alt: "Helicopter shipment from Myanmar to Gabon",
    label: ["From", "Myanmar", "to Gabon"],
  },
  { id: "loading-2", src: "/showcase/project-6.webp", alt: "Helicopter cargo on the dock" },
  {
    id: "khalifa-port",
    src: "/showcase/khalifa-port.webp",
    alt: "Loading at Khalifa Port",
    label: ["Loading", "at Khalifa", "Port"],
  },
  {
    id: "china-guatemala",
    src: "/showcase/china-to-guatemala.webp",
    alt: "Helicopter shipment from China to Guatemala",
    label: ["From", "China to", "Guatemala"],
  },
] as const;

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
export type Service = {
  slug: string;
  /** Display name (rendered uppercase via CSS where required). */
  name: string;
  /** Short description shown on the expanded card + summary on detail page. */
  description: string;
  /** Path to the card image in /public. */
  image: string;
};

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
};

export const VALUE_ADDED_SERVICES: readonly ValueAddedService[] = [
  {
    slug: "equipment-rental",
    label: "Equipment Rental",
    thumb: "/services/value-added/equipment-rental.webp",
  },
  { slug: "aog", label: "AOG", thumb: "/services/value-added/aog.webp" },
  { slug: "obc", label: "OBC", thumb: "/services/value-added/obc.webp" },
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
  },
  {
    slug: "customs-brokerage",
    label: "Customs Brokerage",
    thumb: "/services/value-added/customs-brokerage.webp",
  },
  {
    slug: "crates-manufacturing",
    label: "Crates Manufacturing",
    thumb: "/services/value-added/crates-manufacturing.webp",
  },
  {
    slug: "shrink-wrapping",
    label: "Shrink Wrapping",
    thumb: "/services/value-added/shrink-wrapping.webp",
  },
  {
    slug: "cargo-insurance",
    label: "Cargo Insurance",
    thumb: "/services/value-added/cargo-insurance.webp",
  },
] as const;

export const SERVICES: readonly Service[] = [
  {
    slug: "ocean-roro",
    name: "Ocean RO/RO",
    description: "Transport your aircraft using Ro/Ro vessel, loaded on a MAFI or simply towing.",
    image: "/services/ocean-roro.webp",
  },
  {
    slug: "ocean-lolo",
    name: "Ocean LO/LO",
    description: "Safe Lift-on/Lift-off into cargo load of container vessel or MPV Breakbulk ship.",
    image: "/services/ocean-lolo.webp",
  },
  {
    slug: "ocean-fcl",
    name: "Ocean FCL",
    description:
      "Save on freight cost by shipping in 40' container High Cube, Open Top or Flat Rack.",
    image: "/services/ocean-fcl.webp",
  },
  {
    slug: "road-freight",
    name: "Road Freight",
    description:
      "We deal with assets-own trucking companies providing GPS-equipped Air-ride specialised trailers.",
    image: "/services/road-freight.webp",
  },
  {
    slug: "air-commercial",
    name: "Air Commercial",
    description: "Ship your aircraft on B74 Freighter.",
    image: "/services/air-commercial.webp",
  },
  {
    slug: "air-chartering",
    name: "Air Chartering",
    description:
      "When time is of the essence or to reach places unreachable by 74F, go for the mighty Antonov124-100 or the IL76.",
    image: "/services/air-chartering.webp",
  },
] as const;
