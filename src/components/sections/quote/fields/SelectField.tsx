"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import { CheckGreen, ChevronDown } from "@/components/icons/quote";

export type SelectFieldProps = {
  label?: string;
  required?: boolean;
  options: readonly string[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  /** Compact = no label; used in Step 03 right-column 3-up row (label is a header above). */
  compact?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
};

/**
 * Custom dropdown that renders a styled trigger + accessible listbox panel.
 * Keyboard navigation: Tab focuses the trigger; Space/Enter/Arrow Down opens;
 * Arrow Up/Down + Home/End navigate; Enter/Space selects; Esc closes.
 *
 * Why not a native `<select>`: Figma's open-state styling (white panel +
 * pale-green active row + green check) doesn't survive the OS picker. The
 * listbox pattern below is accessible-by-construction (role + aria-* attrs)
 * and preserves the design.
 */
export function SelectField({
  label,
  required,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  compact,
  className,
  id: providedId,
  ariaLabel,
}: SelectFieldProps) {
  const autoId = useId();
  const id = providedId ?? autoId;
  const listId = `${id}-listbox`;
  const errorId = error ? `${id}-error` : undefined;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    value ? Math.max(options.indexOf(value), 0) : 0,
  );
  const [openCount, setOpenCount] = useState(0); // bumped each time we open — drives the active-index reset below
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  // React 19 in-render reset: when the panel opens, snap activeIndex to the
  // currently selected option. Comparison uses `useState`, not `useRef`, per
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders.
  const [lastOpenCount, setLastOpenCount] = useState(openCount);
  if (open && openCount !== lastOpenCount) {
    setLastOpenCount(openCount);
    const idx = value ? options.indexOf(value) : 0;
    const target = idx >= 0 ? idx : 0;
    if (target !== activeIndex) setActiveIndex(target);
  }

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const choose = useCallback(
    (index: number) => {
      const next = options[index];
      if (next === undefined) return;
      onChange(next);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [onChange, options],
  );

  const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === " " ||
      event.key === "Enter"
    ) {
      event.preventDefault();
      if (!open) {
        setOpenCount((c) => c + 1);
        setOpen(true);
      }
    }
  };

  const onListKey = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(activeIndex);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
    }
  };

  const triggerLabel = useMemo(() => value ?? placeholder, [value, placeholder]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && !compact ? (
        <label
          htmlFor={id}
          className="font-body text-text-muted-2 mb-[6px] block text-[10px] tracking-[0.04em] uppercase lg:mb-[8px] lg:text-[12px]"
        >
          {label}
          {required ? <span className="text-brand-red"> *</span> : null}
        </label>
      ) : null}

      <button
        id={id}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-required={required || undefined}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        aria-label={ariaLabel ?? (label ? undefined : placeholder)}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => {
            if (!v) setOpenCount((c) => c + 1);
            return !v;
          });
        }}
        onKeyDown={onTriggerKey}
        className={cn(
          "font-body relative flex h-[50px] w-full items-center justify-between gap-2 border bg-white px-[16px] text-left text-[13px] transition-colors outline-none lg:h-[60px] lg:px-[19px] lg:text-[15px]",
          disabled && "cursor-not-allowed opacity-60",
          error
            ? "border-brand-red"
            : open
              ? "border-input-focus"
              : "border-input-border hover:border-input-focus",
        )}
      >
        <span className={cn("truncate", !value && "text-input-placeholder")}>{triggerLabel}</span>
        <ChevronDown
          className={cn(
            "text-text-muted-2 size-[14px] shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-activedescendant={`${id}-opt-${activeIndex}`}
          tabIndex={-1}
          ref={(node) => {
            node?.focus();
          }}
          onKeyDown={onListKey}
          className="border-input-border absolute left-0 z-30 mt-[4px] max-h-[300px] w-full overflow-y-auto border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.13)] outline-none"
        >
          {options.map((option, index) => {
            const isActive = index === activeIndex;
            const isSelected = option === value;
            return (
              <li
                key={option}
                id={`${id}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={cn(
                  "font-body flex h-[42px] cursor-pointer items-center justify-between px-[16px] text-[14px] lg:px-[19px] lg:text-[15px]",
                  isSelected ? "text-ink bg-[#efffe7]" : "text-ink",
                  isActive && !isSelected && "bg-surface-alt",
                )}
              >
                <span className="truncate">{option}</span>
                {isSelected ? <CheckGreen className="size-[14px]" /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {error ? (
        <span
          id={errorId}
          role="alert"
          className="text-brand-red font-body mt-[6px] block text-[12px]"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
