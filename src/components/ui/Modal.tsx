"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type ModalSize = "sm" | "lg" | "xl";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
  /**
   * Size preset for the dialog max-width. `sm` (default) preserves the M2/M3
   * card-style modal — `max-w-lg`. `lg` widens to `max-w-3xl`. `xl` is the
   * M7 lightbox preset — full-bleed `max-w-[1440px]` with 92vw on mobile.
   */
  size?: ModalSize;
  /**
   * When true, the inner panel uses square corners and no padding so the
   * caller can paint the panel edge-to-edge (e.g. M7 lightbox split layout
   * with a photo flush against the panel's left edge).
   */
  bare?: boolean;
};

const sizeDialogClasses: Record<ModalSize, string> = {
  sm: "w-[90vw] max-w-lg",
  lg: "w-[90vw] max-w-3xl",
  xl: "w-[92vw] max-w-[1440px]",
};

/**
 * Accessible modal built on the native <dialog> element.
 * Browser handles ESC, focus trap, and inert background automatically.
 * Click on backdrop closes; click inside content does not propagate.
 */
export function Modal({
  open,
  onClose,
  children,
  className,
  ariaLabel,
  size = "sm",
  bare = false,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto bg-transparent p-0 outline-none",
        sizeDialogClasses[size],
        "backdrop:bg-black/60 backdrop:backdrop-blur-sm",
      )}
    >
      <div
        className={cn("bg-surface shadow-xl", bare ? "rounded-none" : "rounded-lg p-6", className)}
      >
        {children}
      </div>
    </dialog>
  );
}
