/**
 * Shared footer sub-components used by both DesktopFooter (in Footer.tsx)
 * and MobileFooter. Server components — no state, no interactivity.
 */

import Image from "next/image";
import { cn } from "@/lib/utils";
import { PARTNERS, SITE, SOCIAL_LINKS } from "@/lib/constants";
import { AppBadge } from "@/components/ui/AppBadge";

// ── App download buttons ────────────────────────────────────────────────────

export function AppStoreButton({ size = "md" }: { size?: "sm" | "md" } = {}) {
  return <AppBadge store="app-store" variant="light" size={size} />;
}

export function GooglePlayButton({ size = "md" }: { size?: "sm" | "md" } = {}) {
  return <AppBadge store="google-play" variant="light" size={size} />;
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
 * VAI partner mark with "A Proud Member Of :" label.
 *
 *  - Default (desktop): label stacked above the logo (matches the Figma
 *    desktop footer column).
 *  - `inline`: label sits to the LEFT of the logo on a single row (mobile
 *    footer top strip).
 */
export function VaiBadge({ inline = false }: { inline?: boolean } = {}) {
  const label = (
    <span className="text-surface/80 font-body text-[12px] tracking-normal">
      A Proud Member Of :
    </span>
  );
  const logo = (
    <Image
      src="/partners/vai.png"
      alt={PARTNERS.vai.name}
      width={504}
      height={92}
      className={cn(
        "w-auto",
        // Inline layout (mobile) uses a shorter logo so the label stays on
        // one line; stacked layout (desktop) keeps the original size.
        inline ? "h-5" : "h-7",
      )}
    />
  );
  return (
    <a
      href={PARTNERS.vai.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex transition-opacity hover:opacity-90",
        inline ? "items-center gap-3" : "flex-col items-start gap-1.5",
      )}
      aria-label={`A Proud Member Of ${PARTNERS.vai.name}`}
    >
      {label}
      {logo}
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
