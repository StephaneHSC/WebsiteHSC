import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  bordered?: boolean;
  padded?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ bordered = true, padded = true, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-surface rounded-lg",
        bordered && "border-border border",
        padded && "p-6",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";
