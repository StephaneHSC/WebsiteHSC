"use client";

import { useId, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { QUOTE_SHELL_TRANSPORT_MODES, QUOTE_TRANSPORT_MODES } from "@/lib/constants";
import type { TransportMode } from "@/types/quoteForm";

export type ModeRadioGridProps = {
  values: TransportMode[];
  onChange: (modes: TransportMode[]) => void;
  /** Embedded shell renders inside half-width column → 3x2 grid; standalone → single row. */
  layout?: "single-row" | "two-rows";
  /**
   * Variant determines the canonical order + label shortening.
   * - standalone (default): full 6-mode list with "(Lo/Lo)" suffix on Breakbulk
   * - shell: Figma `344:3275` order (Air Charter first), Breakbulk label shortened
   */
  variant?: "standalone" | "shell";
  invalid?: boolean;
};

/**
 * Step 01 desktop — 6 transport-mode checkboxes (multi-select).
 *
 * Layout strategy:
 * - `single-row` (standalone /quote): CSS grid with fractional column widths
 *   (180fr / 150fr / 150fr / 230fr / 180fr / 120fr) so the tiles fit on one
 *   row at every desktop breakpoint (1024 → 1440 → 1920). Proportions match
 *   Figma's 1196px frame widths but scale fluidly. Mobile keeps a flex-wrap
 *   row that breaks naturally (it's hidden behind the mobile pill anyway).
 * - `two-rows` (embedded shell, half-width column): 3×2 grid.
 *
 * Each tile acts as a checkbox — clicking toggles it in/out of the selection.
 * Arrow keys move focus; Space toggles the focused item.
 */
const SINGLE_ROW_GRID_TEMPLATE = "180fr 150fr 150fr 230fr 180fr 120fr";

const SHELL_LABEL_OVERRIDES: Partial<Record<TransportMode, string>> = {
  "Ocean Breakbulk (Lo/Lo)": "Ocean Breakbulk",
};

export function ModeRadioGrid({
  values,
  onChange,
  layout = "single-row",
  variant = "standalone",
  invalid = false,
}: ModeRadioGridProps) {
  const groupId = useId();
  const modes = variant === "shell" ? QUOTE_SHELL_TRANSPORT_MODES : QUOTE_TRANSPORT_MODES;

  const toggle = (mode: TransportMode) => {
    if (values.includes(mode)) {
      // Keep at least one selected
      if (values.length === 1) return;
      onChange(values.filter((m) => m !== mode));
    } else {
      onChange([...values, mode]);
    }
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>, index: number, mode: TransportMode) => {
    if (event.key === " ") {
      event.preventDefault();
      toggle(mode);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = (index + 1) % modes.length;
      (document.getElementById(`${groupId}-cb-${next}`) as HTMLElement | null)?.focus();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = (index - 1 + modes.length) % modes.length;
      (document.getElementById(`${groupId}-cb-${next}`) as HTMLElement | null)?.focus();
    }
  };

  return (
    <div
      role="group"
      aria-label="Mode of Transport"
      aria-describedby={invalid ? "step-01-mode-error" : undefined}
      data-field="modes"
      style={
        layout === "single-row"
          ? ({ "--mode-grid-cols": SINGLE_ROW_GRID_TEMPLATE } as React.CSSProperties)
          : undefined
      }
      className={cn(
        "flex flex-wrap gap-[6px]",
        layout === "single-row" &&
          "lg:grid lg:flex-none lg:[grid-template-columns:var(--mode-grid-cols)]",
        layout === "two-rows" && "lg:grid lg:grid-cols-3",
      )}
    >
      {modes.map((mode, index) => {
        const selected = values.includes(mode);
        const label =
          SHELL_LABEL_OVERRIDES[mode] && variant === "shell" ? SHELL_LABEL_OVERRIDES[mode] : mode;
        return (
          <div
            key={mode}
            id={`${groupId}-cb-${index}`}
            role="checkbox"
            aria-checked={selected}
            tabIndex={0}
            onKeyDown={(e) => onKey(e, index, mode)}
            onClick={() => toggle(mode)}
            className={cn(
              "font-display relative flex h-[50px] flex-1 cursor-pointer items-center pr-[12px] pl-[36px] text-[12px] font-semibold tracking-[0.02em] uppercase select-none lg:h-[60px] lg:flex-none lg:pl-[40px] lg:text-[12px]",
              "focus-visible:ring-brand-red focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              selected
                ? "text-surface bg-[linear-gradient(164deg,#e40c28_22%,#a30015_78%)]"
                : "border-input-border text-ink hover:border-input-focus border bg-white",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1/2 left-[14px] size-[15px] -translate-y-1/2 rounded-full",
                selected ? "bg-white" : "bg-[#D9D9D9]",
              )}
            >
              {selected ? (
                <span className="bg-brand-red absolute inset-[3px] rounded-full" />
              ) : null}
            </span>
            {label}
          </div>
        );
      })}
    </div>
  );
}
