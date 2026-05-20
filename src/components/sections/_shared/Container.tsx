import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Standard horizontal container — mirrors the Header/Footer max-w-[1600px] +
 * responsive gutter so every section aligns on the same vertical grid lines.
 * Frame matches Figma's 1600px artboard with ~80px gutters at xl, giving a
 * ~1442px content band on large screens.
 */
export const Container = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12 xl:px-20", className)}
      {...props}
    />
  ),
);
Container.displayName = "Container";
