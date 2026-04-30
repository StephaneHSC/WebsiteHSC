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
  { label: "Reviews", href: "/reviews" },
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
