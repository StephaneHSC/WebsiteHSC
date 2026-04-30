/**
 * Shared footer sub-components used by both DesktopFooter (in Footer.tsx)
 * and MobileFooter. Server components — no state, no interactivity.
 */

import Image from "next/image";
import { cn } from "@/lib/utils";
import { APP_LINKS, PARTNERS, SITE, SOCIAL_LINKS } from "@/lib/constants";

// ── App download buttons ────────────────────────────────────────────────────

export function AppStoreButton() {
  return (
    <a
      href={APP_LINKS.appStore}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-surface text-ink hover:bg-surface/90 focus-visible:ring-brand-red focus-visible:ring-offset-ink inline-flex items-center gap-3 rounded-full px-5 py-2.5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <AppleIcon />
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-medium tracking-wide">Download On</span>
        <span className="font-display block text-base font-bold">App Store</span>
      </span>
    </a>
  );
}

export function GooglePlayButton() {
  return (
    <a
      href={APP_LINKS.googlePlay}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-surface text-ink hover:bg-surface/90 focus-visible:ring-brand-red focus-visible:ring-offset-ink inline-flex items-center gap-3 rounded-full px-5 py-2.5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <Image
        src="/icons/google-play.svg"
        alt=""
        width={15}
        height={16}
        aria-hidden="true"
        className="h-[22px] w-auto"
      />
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-medium tracking-wide">Download On</span>
        <span className="font-display block text-base font-bold">Google Play</span>
      </span>
    </a>
  );
}

// ── Social icons ─────────────────────────────────────────────────────────────
//
// Style: red border circle, transparent center, red icon — matches the Figma
// "social row" frame. Hover lifts the icon slightly and brightens it instead of
// filling the background red (which would hide a same-color icon).

export function SocialIcons({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <ul className={cn("flex items-center gap-3", className)}>
      <li>
        <SocialLink href={SOCIAL_LINKS.x} label="X (Twitter)" className={dim}>
          <XIcon />
        </SocialLink>
      </li>
      <li>
        <SocialLink href={SOCIAL_LINKS.youtube} label="YouTube" className={dim}>
          <YouTubeIcon />
        </SocialLink>
      </li>
      <li>
        <SocialLink href={SOCIAL_LINKS.linkedin} label="LinkedIn" className={dim}>
          <LinkedInIcon />
        </SocialLink>
      </li>
    </ul>
  );
}

function SocialLink({
  href,
  label,
  children,
  className,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "border-brand-red text-brand-red focus-visible:ring-brand-red focus-visible:ring-offset-ink inline-flex items-center justify-center rounded-full border transition-all duration-200 hover:scale-110 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </a>
  );
}

// ── VAI partner badge ───────────────────────────────────────────────────────

/**
 * VAI partner mark with "A Proud Member Of :" label stacked above the logo.
 * Matches the Figma compact badge.
 */
export function VaiBadge() {
  return (
    <a
      href={PARTNERS.vai.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex flex-col items-start gap-1.5 transition-opacity hover:opacity-90"
      aria-label={`A Proud Member Of ${PARTNERS.vai.name}`}
    >
      <span className="text-surface/80 font-display text-[11px] tracking-wider uppercase">
        A Proud Member Of :
      </span>
      <Image
        src="/partners/vai.svg"
        alt={PARTNERS.vai.name}
        width={500}
        height={90}
        className="h-7 w-auto [clip-path:inset(1px_0.5px_0_0)]"
      />
    </a>
  );
}

// ── Copyright ───────────────────────────────────────────────────────────────

export function Copyright({ className }: { className?: string }) {
  return <p className={cn("text-surface/70 text-sm", className)}>{SITE.copyright}</p>;
}

// ── Inline SVG icons ────────────────────────────────────────────────────────
//
// Inline so we can theme via `currentColor` (the social icons inherit
// `text-brand-red` from the SocialLink wrapper).

function AppleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.27087 0H0L5.06377 6.65368L0.323931 12.2353H2.51387L6.09878 8.01375L9.28201 12.1965H13.5529L8.34199 5.34947L8.35121 5.36128L12.8379 0.0777275H10.6479L7.31604 4.00137L4.27087 0ZM2.35744 1.16527H3.68702L11.1954 11.0312H9.86586L2.35744 1.16527Z"
        fill="currentColor"
      />
    </svg>
  );
}

function YouTubeIcon() {
  // The user-provided YouTube SVG was a rectangle only (no triangle).
  // This is the standard YouTube logo: rounded rectangle + center play triangle,
  // both filled with currentColor so it inherits brand red from the parent link.
  return (
    <svg width="16" height="12" viewBox="0 0 24 17" fill="none" aria-hidden="true">
      <path
        d="M23.498 3.186a3.016 3.016 0 0 0-2.122-2.136C19.505.545 12 .545 12 .545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 3.186C0 5.07 0 9 0 9s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 12.93 24 9 24 9s0-3.93-.502-5.814zM9.545 12.568V5.432L15.818 9l-6.273 3.568z"
        fill="currentColor"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.97594 4.33301H0.222656V13.1131H2.97594V4.33301Z" fill="currentColor" />
      <path
        d="M10.4263 4.14278C10.3248 4.13009 10.217 4.12374 10.1091 4.1174C8.56754 4.05396 7.69842 4.9675 7.39391 5.36082C7.31144 5.46867 7.27337 5.53211 7.27337 5.53211V4.35847H4.64062V13.1386H7.27337H7.39391C7.39391 12.2441 7.39391 11.3559 7.39391 10.4614C7.39391 9.97925 7.39391 9.49711 7.39391 9.01497C7.39391 8.41863 7.3495 7.78423 7.64767 7.23865C7.90143 6.78188 8.35819 6.5535 8.87205 6.5535C10.3946 6.5535 10.4263 7.93014 10.4263 8.05702C10.4263 8.06337 10.4263 8.06971 10.4263 8.06971V13.1766H13.1796V7.448C13.1796 5.4877 12.1836 4.3331 10.4263 4.14278Z"
        fill="currentColor"
      />
      <path
        d="M1.59868 3.19737C2.4816 3.19737 3.19736 2.48162 3.19736 1.59869C3.19736 0.715757 2.4816 0 1.59868 0C0.71575 0 0 0.715757 0 1.59869C0 2.48162 0.71575 3.19737 1.59868 3.19737Z"
        fill="currentColor"
      />
    </svg>
  );
}
