import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SectionTone = "light" | "alt" | "dark";
type SectionSpacing = "none" | "tight" | "standard" | "loose";

const toneClasses: Record<SectionTone, string> = {
  light: "bg-surface text-ink",
  alt: "bg-surface-alt text-ink",
  dark: "bg-ink text-surface",
};

const spacingClasses: Record<SectionSpacing, string> = {
  none: "",
  tight: "py-12 md:py-16",
  standard: "py-16 md:py-24 lg:py-28",
  loose: "py-20 md:py-32 lg:py-40",
};

export type SectionProps = HTMLAttributes<HTMLElement> & {
  tone?: SectionTone;
  spacing?: SectionSpacing;
};

/**
 * Top-level <section> wrapper. Standardizes vertical rhythm and tone (light/dark
 * alternating) so each home section is one line of JSX with predictable spacing.
 */
export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ tone = "light", spacing = "standard", className, ...props }, ref) => (
    <section
      ref={ref}
      className={cn("relative w-full", toneClasses[tone], spacingClasses[spacing], className)}
      {...props}
    />
  ),
);
Section.displayName = "Section";
