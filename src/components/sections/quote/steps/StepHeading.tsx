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
    if (status === "complete") return <TickCircle className="size-[24px]" />;
    if (status === "active") return <RefreshIcon className="text-brand-red size-[20px]" />;
    return null;
  })();

  const content = (
    <>
      <span className="font-display text-ink text-[13px] font-semibold tracking-[0.06em] uppercase lg:text-[14px] lg:font-bold">
        <span className="mr-[12px] inline-block">{number}</span>
        {label}
      </span>
      <span className="flex items-center gap-[10px]">
        {indicator}
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
