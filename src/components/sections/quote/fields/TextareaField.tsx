"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
  showCounter?: boolean;
};

/**
 * Multiline note input — used by Step 04 "Additional Information" (Figma
 * deviation: drawn as a single-row input, implemented as a 3-row textarea
 * since the placeholder copy implies multi-line content).
 */
export function TextareaField({
  label,
  required,
  error,
  maxLength,
  showCounter,
  className,
  id: providedId,
  value,
  rows = 3,
  ...textareaProps
}: TextareaFieldProps) {
  const autoId = useId();
  const id = providedId ?? autoId;
  const errorId = error ? `${id}-error` : undefined;
  const length = typeof value === "string" ? value.length : 0;
  const showCount = showCounter && maxLength && length > maxLength - 200;

  return (
    <label htmlFor={id} className={cn("block", className)}>
      <span className="font-body text-text-muted-2 block text-[10px] tracking-[0.04em] uppercase lg:text-[12px]">
        {label}
        {required ? <span className="text-brand-red"> *</span> : null}
      </span>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={value}
        aria-required={required || undefined}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        className={cn(
          "font-body text-ink placeholder:text-input-placeholder mt-[6px] block w-full resize-y border bg-white px-[16px] py-[14px] text-[13px] transition-colors outline-none lg:mt-[8px] lg:px-[19px] lg:py-[18px] lg:text-[15px]",
          rows && rows <= 2 ? "min-h-[70px] lg:min-h-[80px]" : "min-h-[100px] lg:min-h-[110px]",
          error
            ? "border-brand-red focus:border-brand-red"
            : "border-input-border focus:border-input-focus",
        )}
        {...textareaProps}
      />
      <div className="mt-[6px] flex items-start justify-between gap-3">
        {error ? (
          <span id={errorId} role="alert" className="text-brand-red font-body text-[12px]">
            {error}
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        {showCount ? (
          <span className="font-body text-text-muted-2 ml-auto text-[11px]">
            {length}/{maxLength}
          </span>
        ) : null}
      </div>
    </label>
  );
}
