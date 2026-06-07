import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { fieldClasses } from "./Input";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <select ref={ref} className={cn(fieldClasses(error), "pr-10", className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";
