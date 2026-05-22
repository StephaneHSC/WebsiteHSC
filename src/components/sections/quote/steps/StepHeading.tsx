"use client";

import { cn } from "@/lib/utils";
import { RefreshIcon, TickCircle, ChevronDown } from "@/components/icons/quote";

export type StepStatus = "idle" | "active" | "complete";

export type StepHeadingProps = {
  number: string;
  label: string;
  status: StepStatus;
  /** When present, heading becomes a button that toggles expansion. */
  onToggle?: () => void;
  expanded?: boolean;
  /** Legacy: hides the chevron on every breakpoint (kept for compat). */
  hideChevronOnMobile?: boolean;
  /**
   * When true, the chevron shows on desktop too (embedded shell renders the
   * accordion at every breakpoint, not just mobile).
   */
  showChevronOnDesktop?: boolean;
  controlsId?: string;
};

export function StepHeading({
  number,
  label,
  status,
  onToggle,
  expanded,
  hideChevronOnMobile,
  showChevronOnDesktop,
  controlsId,
}: StepHeadingProps) {
  const indicator = (() => {
    if (status === "complete") return <TickCircle className="size-[18px]" />;
    if (status === "active") return <RefreshIcon className="text-brand-red size-[16px]" />;
    return null;
  })();

  // Shell (showChevronOnDesktop=true): indicator stays on the right at every
  // breakpoint, next to the chevron — matches Figma `344:3275`.
  // Standalone (false): indicator hugs the label on desktop per Figma
  // `345:9322`, but stays on the right on mobile (label group would feel
  // cramped under a narrow column).
  const iconBesideLabelOnDesktop = !showChevronOnDesktop;
  // Weight rules:
  //   - Shell (showChevronOnDesktop=true): regular at every breakpoint, per
  //     Figma `344:3275` (step labels use Inter Tight Regular).
  //   - Standalone (false): regular on mobile per Figma `344:4621`, but the
  //     bolder desktop treatment stays as-is.
  const labelWeight = showChevronOnDesktop ? "font-medium" : "font-medium lg:font-bold";
  const content = (
    <>
      <span className="flex items-center gap-[10px]">
        <span
          className={cn(
            "font-display text-ink text-[13px] tracking-[0.06em] uppercase lg:text-[14px]",
            labelWeight,
          )}
        >
          <span className="mr-[12px] inline-block">{number}</span>
          {label}
        </span>
        {iconBesideLabelOnDesktop && indicator ? (
          <span className="hidden lg:inline-flex">{indicator}</span>
        ) : null}
      </span>
      <span className="flex items-center gap-[10px]">
        {indicator ? (
          iconBesideLabelOnDesktop ? (
            <span className="lg:hidden">{indicator}</span>
          ) : (
            indicator
          )
        ) : null}
        {onToggle && !hideChevronOnMobile ? (
          <ChevronDown
            className={cn(
              "text-text-muted-2 size-[16px] shrink-0 transition-transform",
              showChevronOnDesktop ? "" : "lg:hidden",
              expanded && "rotate-180",
            )}
          />
        ) : null}
      </span>
    </>
  );

  if (onToggle) {
    return (
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={controlsId}
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
      >
        {content}
      </button>
    );
  }
  return <div className="flex w-full items-center justify-between">{content}</div>;
}
