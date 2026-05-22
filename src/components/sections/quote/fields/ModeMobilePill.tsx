"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { QUOTE_SHELL_TRANSPORT_MODES, QUOTE_TRANSPORT_MODES } from "@/lib/constants";
import type { TransportMode } from "@/types/quoteForm";
import { ArrowSquareDown } from "@/components/icons/quote";

export type ModeMobilePillProps = {
  value: TransportMode;
  onChange: (mode: TransportMode) => void;
  variant?: "standalone" | "shell";
};

const SHELL_LABEL_OVERRIDES: Partial<Record<TransportMode, string>> = {
  "Ocean Breakbulk (Lo/Lo)": "Ocean Breakbulk",
};

/**
 * Mobile Step 01 — single full-width gradient pill that reveals the 6
 * options when tapped (in-place expansion, no drawer). Figma doesn't show
 * the open state, so the expanded list reuses the desktop dropdown active-
 * item visual (pale-green bg) plus the gradient pill style for the current
 * selection.
 */
export function ModeMobilePill({ value, onChange, variant = "standalone" }: ModeMobilePillProps) {
  const buttonId = useId();
  const listId = `${buttonId}-list`;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modes = variant === "shell" ? QUOTE_SHELL_TRANSPORT_MODES : QUOTE_TRANSPORT_MODES;
  const pillLabel =
    variant === "shell" && SHELL_LABEL_OVERRIDES[value] ? SHELL_LABEL_OVERRIDES[value]! : value;

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
          className="absolute top-1/2 left-[14px] size-[15px] -translate-y-1/2 rounded-full border border-white"
        >
          <span className="bg-surface absolute top-1/2 left-1/2 size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
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
            aria-label="Mode of transport options"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="border-input-border absolute left-0 z-20 mt-[6px] w-full overflow-hidden border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.13)]"
          >
            {modes.map((mode) => {
              const selected = mode === value;
              const label =
                variant === "shell" && SHELL_LABEL_OVERRIDES[mode]
                  ? SHELL_LABEL_OVERRIDES[mode]!
                  : mode;
              return (
                <li
                  key={mode}
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(mode);
                    setOpen(false);
                  }}
                  className={cn(
                    "font-display flex h-[44px] cursor-pointer items-center px-[16px] text-[13px] font-semibold tracking-[0.02em] uppercase",
                    selected ? "text-ink bg-[#efffe7]" : "text-ink hover:bg-surface-alt",
                  )}
                >
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
