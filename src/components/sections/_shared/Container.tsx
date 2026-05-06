import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Standard horizontal container — mirrors the Header/Footer max-w-7xl + responsive
 * gutter so every section aligns on the same vertical grid lines.
 */
export const Container = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  ),
);
Container.displayName = "Container";
