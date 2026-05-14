import { APP_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Store = "app-store" | "google-play";
type BadgeVariant = "dark" | "light";

const STORE_META: Record<Store, { href: string; primary: string; ariaLabel: string }> = {
  "app-store": {
    href: APP_LINKS.appStore,
    primary: "App Store",
    ariaLabel: "Download on the App Store",
  },
  "google-play": {
    href: APP_LINKS.googlePlay,
    primary: "Google Play",
    ariaLabel: "Get it on Google Play",
  },
};

const variantClasses: Record<BadgeVariant, string> = {
  // Dark pill on light/photo backgrounds
  dark: "bg-ink text-surface hover:bg-ink/85 focus-visible:ring-offset-surface",
  // Light pill on dark backgrounds (footer). When used on a light bg, pass
  // `border border-ink` (or similar) via className so the pill outline shows.
  light: "bg-surface text-ink hover:bg-surface-alt focus-visible:ring-offset-ink",
};

type BadgeSize = "md" | "sm";

const sizeClasses: Record<
  BadgeSize,
  { wrap: string; eyebrow: string; primary: string; gap: string }
> = {
  md: {
    wrap: "px-5 py-2.5 gap-3",
    eyebrow: "text-[10px]",
    primary: "text-base",
    gap: "gap-3",
  },
  sm: {
    wrap: "px-3.5 py-1.5 gap-2",
    eyebrow: "text-[9px]",
    primary: "text-[13px]",
    gap: "gap-2",
  },
};

export type AppBadgeProps = {
  store: Store;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
};

export function AppBadge({ store, variant = "dark", size = "md", className }: AppBadgeProps) {
  const meta = STORE_META[store];
  const s = sizeClasses[size];
  return (
    <a
      href={meta.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={meta.ariaLabel}
      className={cn(
        "focus-visible:ring-brand-red inline-flex items-center gap-3 rounded-full px-5 py-1.5 transition-all duration-200 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:px-5 md:py-2.5",
        variantClasses[variant],
        className,
      )}
    >
      {store === "app-store" ? <AppleIcon size={size} /> : <PlayIcon size={size} />}
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-medium tracking-wide">Download On</span>
        <span className="font-display block text-[14px] font-semibold">{meta.primary}</span>
      </span>
    </a>
  );
}

export type AppBadgeRowProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  /** Forwarded to each individual <AppBadge>. Used for per-context tweaks like
   *  adding a border when the light variant lands on a light bg. */
  badgeClassName?: string;
};

/** Convenience row: App Store + Google Play side by side. */
export function AppBadgeRow({
  variant = "dark",
  size = "md",
  className,
  badgeClassName,
}: AppBadgeRowProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <AppBadge store="app-store" variant={variant} size={size} className={badgeClassName} />
      <AppBadge store="google-play" variant={variant} size={size} className={badgeClassName} />
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────
//
// Inline SVG so they inherit `currentColor` from the variant text color and
// render crisply at any size without an extra network request.

function AppleIcon({ size = "md" }: { size?: BadgeSize }) {
  const d = size === "sm" ? 16 : 22;
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      className="origin-center scale-[1.2]"
      fill="currentColor"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function PlayIcon({ size = "md" }: { size?: BadgeSize }) {
  const w = size === "sm" ? 14 : 20;
  const h = size === "sm" ? 16 : 22;
  return (
    <svg
      className="h-5 w-5"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M.6.5C.22.92 0 1.55 0 2.38v17.24c0 .83.22 1.46.6 1.88l.06.06L10.6 11.6v-.2L.66.44.6.5z" />
      <path d="M14.13 14.93l-3.53-3.53v-.2l3.53-3.53.08.05 4.18 2.38c1.2.68 1.2 1.79 0 2.47l-4.18 2.38-.08.04z" />
      <path d="M14.21 14.89L10.6 11.3.6 21.3c.39.42 1.04.47 1.77.06l11.84-6.47" />
      <path d="M14.21 7.71L2.37.24C1.64-.17.99-.12.6.3l10 10 3.61-3.59z" />
    </svg>
  );
}
