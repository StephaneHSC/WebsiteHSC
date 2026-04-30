"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
};

/**
 * Accessible modal built on the native <dialog> element.
 * Browser handles ESC, focus trap, and inert background automatically.
 * Click on backdrop closes; click inside content does not propagate.
 */
export function Modal({ open, onClose, children, className, ariaLabel }: ModalProps) {
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
        "m-auto w-[90vw] max-w-lg bg-transparent p-0 outline-none",
        "backdrop:bg-black/60 backdrop:backdrop-blur-sm",
      )}
    >
      <div className={cn("bg-surface rounded-lg p-6 shadow-xl", className)}>{children}</div>
    </dialog>
  );
}
