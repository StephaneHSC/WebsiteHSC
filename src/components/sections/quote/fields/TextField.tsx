"use client";

import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  required?: boolean;
  error?: string;
  /** Mobile label uses 10px PT Sans Regular; desktop uses 12px. */
  labelSize?: "default" | "compact";
};

/**
 * Quote-form text input. Mobile-first; mirrors Figma §3.4 (Step 02) input
 * styling. Borders: idle `#e4e4e4`, focused `#ff7e8f`, error `#E40C28`.
 */
export function TextField({
  label,
  required,
  error,
  labelSize = "default",
  className,
  id: providedId,
  ...inputProps
}: TextFieldProps) {
  const autoId = useId();
  const id = providedId ?? autoId;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label htmlFor={id} className={cn("block", className)}>
      <span
        className={cn(
          "font-body text-text-muted-2 block tracking-[0.04em] uppercase",
          labelSize === "compact" ? "text-[10px]" : "text-[10px] lg:text-[12px]",
        )}
      >
        {label}
        {required ? <span className="text-brand-red"> *</span> : null}
      </span>
      <input
        id={id}
        aria-required={required || undefined}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        className={cn(
          "font-body text-ink placeholder:text-input-placeholder mt-[6px] flex h-[50px] w-full items-center border bg-white px-[16px] text-[13px] transition-colors outline-none lg:mt-[8px] lg:h-[60px] lg:px-[19px] lg:text-[15px]",
          error
            ? "border-brand-red focus:border-brand-red"
            : "border-input-border focus:border-input-focus",
        )}
        {...inputProps}
      />
      {error ? (
        <span
          id={errorId}
          role="alert"
          className="text-brand-red font-body mt-[6px] block text-[12px]"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}
