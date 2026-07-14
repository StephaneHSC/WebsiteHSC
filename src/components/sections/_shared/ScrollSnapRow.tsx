"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type ScrollSnapRowProps = {
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

/**
 * Horizontal scroll-snap row used by the home carousels.
 *
 * Bakes in the boilerplate that every carousel needs: keyboard scrolling
 * (`tabIndex={0}` + a focus ring), screen-reader region role, hidden native
 * scrollbar, snap-x behaviour, and vertical-swipe → horizontal-scroll on
 * touch devices. Per-section gap, padding, and breakpoint overrides come in
 * via `className`.
 */
export function ScrollSnapRow({
  ariaLabel,
  children,
  className,
  onMouseEnter,
  onMouseLeave,
}: ScrollSnapRowProps) {
  const ref = useRef<HTMLUListElement>(null);

  return (
    <ul
      ref={ref}
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </ul>
  );
}
