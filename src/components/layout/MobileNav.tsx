"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { NAV } from "@/lib/constants";
import { Logo } from "./Logo";

export type MobileNavProps = {
  /** White hamburger glyph for use on dark / transparent backgrounds. */
  inverted?: boolean;
};

/**
 * Mobile navigation drawer.
 * Logo top-left, X close top-right, expandable Services + Our Team rows,
 * Request Quote pill at bottom. Slides in from the right.
 *
 * Closes on: X click, ESC, backdrop click, or any link click (including the
 * Logo inside the drawer, which gets `onClick={close}` passed in below).
 */
export function MobileNav({ inverted = false }: MobileNavProps = {}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // ESC closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={cn(
          "focus-visible:ring-brand-red inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none",
          inverted ? "text-surface hover:bg-surface/15" : "text-ink hover:bg-surface-alt",
        )}
      >
        <HamburgerIcon />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={close}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="bg-surface fixed top-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="flex items-center justify-between p-6">
              <Logo onClick={close} />
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className="text-brand-red hover:bg-surface-alt focus-visible:ring-brand-red inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-2">
                {NAV.map((item) =>
                  item.children ? (
                    <li key={item.label}>
                      <button
                        type="button"
                        aria-expanded={expanded === item.label}
                        onClick={() =>
                          setExpanded((prev) => (prev === item.label ? null : item.label))
                        }
                        className="bg-surface-alt text-ink hover:bg-border focus-visible:ring-brand-red flex w-full items-center justify-between rounded-full px-5 py-3 text-base font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <span>{item.label}</span>
                        <ChevronIcon
                          className={cn(
                            "transition-transform duration-200",
                            expanded === item.label && "rotate-180",
                          )}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded === item.label && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden pl-4"
                          >
                            {item.children.map((child) => (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={close}
                                  className="text-ink-soft hover:text-ink block rounded-md px-4 py-2 text-sm transition-colors"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  ) : (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className="text-ink hover:bg-surface-alt focus-visible:ring-brand-red block rounded-full px-5 py-3 text-base font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
