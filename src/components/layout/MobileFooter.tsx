"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { FOOTER } from "@/lib/constants";
import { Logo } from "./Logo";
import {
  AppStoreButton,
  Copyright,
  GooglePlayButton,
  SocialIcons,
  VaiBadge,
} from "./_footer-parts";

/**
 * Mobile footer layout (matches the mobile Figma frame).
 * Stacked + centered, with +/- accordion for Company / Legal.
 */
export function MobileFooter() {
  return (
    <div className="px-6 py-10">
      {/* Top row: brand + partner. VaiBadge runs inline (label left of logo)
          to match the Figma mobile frame `352:17257`. Logo size is dialled
          down on mobile so it doesn't dwarf the VAI badge beside it. */}
      <div className="flex items-center justify-between gap-4">
        <Logo inverted imageClassName="h-9" />
        <VaiBadge inline />
      </div>

      <Divider />

      {/* App download buttons — centered, side by side. `sm` size matches the
          tighter mobile pills in Figma. */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <AppStoreButton size="sm" />
        <GooglePlayButton size="sm" />
      </div>

      <Divider />

      {/* Accordion link sections */}
      <div>
        <FooterAccordion title="Company" links={FOOTER.company} defaultOpen />
        <FooterAccordion title="Legal" links={FOOTER.legal} />
      </div>

      <Divider />

      {/* Social icons + copyright (both centered) */}
      <div className="flex flex-col items-center gap-4">
        <SocialIcons className="justify-center" />
        <Copyright className="text-center" />
      </div>
    </div>
  );
}

function Divider() {
  return <hr className="border-surface/10 my-6" />;
}

function FooterAccordion({
  title,
  links,
  defaultOpen = false,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-surface/10 border-b py-4 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="focus-visible:ring-brand-red flex w-full items-center justify-between focus-visible:ring-2 focus-visible:outline-none"
      >
        <h3 className="font-display text-surface text-base font-bold tracking-wider uppercase">
          {title}
        </h3>
        <PlusMinusIcon open={open} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="space-y-3 pt-4">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-surface/80 hover:text-surface block text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors",
        open ? "bg-surface text-ink" : "border-surface/40 text-surface border",
      )}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <line
          x1="2"
          y1="6"
          x2="10"
          y2="6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="2"
          x2="6"
          y2="10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={cn("origin-center transition-transform duration-200", open && "scale-y-0")}
        />
      </svg>
    </span>
  );
}
