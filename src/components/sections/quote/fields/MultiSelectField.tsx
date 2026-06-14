"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "@/components/icons/quote";

export type MultiSelectFieldProps = {
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  ariaLabel?: string;
};

/**
 * Multi-select dropdown — allows zero or more options to be checked.
 * Visually mirrors SelectField but each option is a checkbox row.
 */
export function MultiSelectField({
  options,
  values,
  onChange,
  placeholder,
  disabled,
  error,
  className,
  ariaLabel,
}: MultiSelectFieldProps) {
  const id = useId();
  const listId = `${id}-listbox`;
  const errorId = error ? `${id}-error` : undefined;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = useCallback(
    (option: string) => {
      if (values.includes(option)) {
        onChange(values.filter((v) => v !== option));
      } else {
        onChange([...values, option]);
      }
    },
    [values, onChange],
  );

  const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if ([" ", "Enter", "ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onListKey = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
    if (event.key === "Tab") setOpen(false);
  };

  const triggerLabel =
    values.length === 0
      ? placeholder
      : values.length === 1
        ? values[0]!
        : `${values.length} selected`;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        aria-label={ariaLabel ?? placeholder}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
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
        <span className={cn("truncate", values.length === 0 && "text-input-placeholder")}>
          {triggerLabel}
        </span>
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
          aria-multiselectable="true"
          tabIndex={-1}
          ref={(node) => {
            node?.focus();
          }}
          onKeyDown={onListKey}
          className="border-input-border absolute left-0 z-30 mt-[4px] max-h-[300px] w-full origin-top [animation:dropdown-open_150ms_ease-out] overflow-y-auto border bg-white shadow-[0_4px_12px_rgba(0,0,0,0.13)] outline-none"
        >
          {options.map((option) => {
            const checked = values.includes(option);
            return (
              <li
                key={option}
                role="option"
                aria-selected={checked}
                onClick={() => toggle(option)}
                className={cn(
                  "font-body flex h-[42px] cursor-pointer items-center gap-[10px] px-[16px] text-[14px] lg:px-[19px] lg:text-[15px]",
                  checked ? "text-ink bg-[#efffe7]" : "text-ink hover:bg-surface-alt",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex size-[14px] shrink-0 items-center justify-center rounded-[3px]",
                    checked ? "bg-brand-red" : "border border-[#D9D9D9] bg-white",
                  )}
                >
                  {checked ? (
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
                <span className="truncate">{option}</span>
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
