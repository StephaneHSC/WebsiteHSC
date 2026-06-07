import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { fieldClasses } from "./Input";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(fieldClasses(error), "resize-y", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
