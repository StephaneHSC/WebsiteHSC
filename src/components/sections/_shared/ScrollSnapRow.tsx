import { cn } from "@/lib/utils";

type ScrollSnapRowProps = {
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Horizontal scroll-snap row used by the home carousels.
 *
 * Bakes in the boilerplate that every carousel needs: keyboard scrolling
 * (`tabIndex={0}` + a focus ring), screen-reader region role, hidden native
 * scrollbar, and snap-x behaviour. Per-section gap, padding, and breakpoint
 * overrides (e.g. `md:grid` to swap to a desktop grid) come in via `className`.
 */
export function ScrollSnapRow({ ariaLabel, children, className }: ScrollSnapRowProps) {
  return (
    <ul
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
      className={cn(
        "flex overflow-x-auto",
        "snap-x snap-mandatory",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "focus-visible:ring-brand-red focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </ul>
  );
}
