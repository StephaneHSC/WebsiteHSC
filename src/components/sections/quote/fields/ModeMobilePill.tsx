"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { QUOTE_SHELL_TRANSPORT_MODES, QUOTE_TRANSPORT_MODES } from "@/lib/constants";
import type { TransportMode } from "@/types/quoteForm";
import { ArrowSquareDown } from "@/components/icons/quote";

export type ModeMobilePillProps = {
  values: TransportMode[];
  onChange: (modes: TransportMode[]) => void;
  variant?: "standalone" | "shell";
};

const SHELL_LABEL_OVERRIDES: Partial<Record<TransportMode, string>> = {
  "Ocean Breakbulk (Lo/Lo)": "Ocean Breakbulk",
};

function getDisplayLabel(values: TransportMode[], variant: "standalone" | "shell"): string {
  if (values.length === 0) return "Select mode";
  if (values.length === 1) {
    const mode = values[0]!;
    return variant === "shell" && SHELL_LABEL_OVERRIDES[mode] ? SHELL_LABEL_OVERRIDES[mode]! : mode;
  }
  return `${values.length} Modes Selected`;
}

/**
 * Mobile Step 01 — multi-select pill that reveals the 6 options when tapped.
 * Multiple modes can be toggled; the pill summarises the selection.
 */
export function ModeMobilePill({ values, onChange, variant = "standalone" }: ModeMobilePillProps) {
  const buttonId = useId();
  const listId = `${buttonId}-list`;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modes = variant === "shell" ? QUOTE_SHELL_TRANSPORT_MODES : QUOTE_TRANSPORT_MODES;
  const pillLabel = getDisplayLabel(values, variant);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  };

  const toggle = (mode: TransportMode) => {
    if (values.includes(mode)) {
      // Keep at least one selected
      if (values.length === 1) return;
      onChange(values.filter((m) => m !== mode));
    } else {
      onChange([...values, mode]);
    }
  };

  return (
    <div ref={containerRef} className="relative" onKeyDown={onKey}>
      <button
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="font-display text-surface relative flex h-[50px] w-full items-center justify-between bg-[linear-gradient(172deg,#e40c28_22%,#ae302b_78%)] pr-[16px] pl-[40px] text-[13px] font-semibold tracking-[0.02em] uppercase"
      >
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-[14px] size-[15px] -translate-y-1/2 rounded-[3px] bg-white"
        >
          <span className="bg-brand-red absolute inset-[3px] rounded-[2px]" />
        </span>
        <span className="truncate text-left">{pillLabel}</span>
        <ArrowSquareDown
          className={cn("text-surface size-6 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.ul
            id={listId}
            role="listbox"
            aria-multiselectable="true"
            aria-label="Mode of transport options"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="border-input-border absolute left-0 z-20 mt-[6px] w-full overflow-hidden border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.13)]"
          >
            {modes.map((mode) => {
              const selected = values.includes(mode);
              const label =
                variant === "shell" && SHELL_LABEL_OVERRIDES[mode]
                  ? SHELL_LABEL_OVERRIDES[mode]!
                  : mode;
              return (
                <li
                  key={mode}
                  role="option"
                  aria-selected={selected}
                  onClick={() => toggle(mode)}
                  className={cn(
                    "font-display flex h-[44px] cursor-pointer items-center gap-[10px] px-[16px] text-[13px] font-semibold tracking-[0.02em] uppercase",
                    selected ? "text-ink bg-[#efffe7]" : "text-ink hover:bg-surface-alt",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "inline-flex size-[14px] shrink-0 items-center justify-center rounded-[3px]",
                      selected ? "bg-brand-red" : "border border-[#D9D9D9] bg-white",
                    )}
                  >
                    {selected ? (
                      <svg viewBox="0 0 10 8" fill="none" className="size-[8px]">
                        <path
                          d="M1 3.5L3.8 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                  {label}
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
