import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type EyebrowVariant = "filled" | "outline";

const variantClasses: Record<EyebrowVariant, string> = {
  filled: "bg-brand-red text-surface",
  outline: "border border-ink/15 text-ink",
};

export type SectionEyebrowProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: EyebrowVariant;
};

/**
 * Small label that sits above section headings. "OUR SOLUTIONS" uses `filled`,
 * "MOBILE APP" uses `outline`
 */
export function SectionEyebrow({
  variant = "filled",
  className,
  children,
  ...props
}: SectionEyebrowProps) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold tracking-wider uppercase",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
