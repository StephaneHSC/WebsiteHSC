import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type EyebrowVariant =
  | "red"
  | "gray"
  | "solid-white"
  | "outline-white"
  | "outline-ink"
  // Backwards-compat aliases for M1/M2 consumers.
  | "filled"
  | "outline";

const variantClasses: Record<EyebrowVariant, string> = {
  red: "bg-brand-red text-surface",
  gray: "bg-ink-muted text-surface",
  "solid-white": "bg-surface text-ink",
  "outline-white": "border border-surface text-surface bg-transparent",
  "outline-ink": "border border-ink/15 text-ink bg-transparent",
  filled: "bg-brand-red text-surface",
  outline: "border border-ink text-ink",
};

export type SectionEyebrowProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: EyebrowVariant;
};

/**
 * Small uppercase label that sits above section headings.
 * Tracking 0.72 (~6%) and PT Sans Bold per Figma spec across all variants.
 */
export function SectionEyebrow({
  variant = "red",
  className,
  children,
  ...props
}: SectionEyebrowProps) {
  return (
    <span
      className={cn(
        "font-body inline-flex items-center px-1.5 py-1.5 text-[12px] leading-none font-bold tracking-[0.06em] uppercase",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
