import Link from "next/link";
import { cn } from "@/lib/utils";

type BackBreadcrumbProps = {
  href: string;
  label: string;
  /** "light" = white text for dark hero backgrounds (default). "dark" = ink text for light backgrounds. */
  variant?: "light" | "dark";
  className?: string;
};

/**
 * Mobile-only "← Back to X" back link. Rendered at the top of the hero's
 * inner padding area so it sits over the dark photo rather than between the
 * header and hero as a plain white bar. Hidden on md+ since the nav is visible.
 */
export function BackBreadcrumb({ href, label, variant = "light", className }: BackBreadcrumbProps) {
  return (
    <div className={cn("absolute top-[72px] right-0 left-0 z-10 px-4 sm:px-6", className)}>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-80",
          variant === "light" ? "text-surface/80" : "text-ink-muted hover:text-ink",
        )}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M10 3L5 8l5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </Link>
    </div>
  );
}
