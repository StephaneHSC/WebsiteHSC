import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const fieldClasses = (error?: boolean) =>
  cn(
    "bg-surface text-ink block w-full rounded-md border px-4 py-3 text-base",
    "placeholder:text-ink-muted",
    "focus-visible:ring-brand-red focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
    error ? "border-brand-red" : "border-border focus-visible:border-ink",
  );

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input ref={ref} className={cn(fieldClasses(error), className)} {...props} />
  ),
);
Input.displayName = "Input";
