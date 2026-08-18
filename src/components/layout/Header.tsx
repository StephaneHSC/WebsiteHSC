"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { buttonVariants } from "@/components/ui/Button";
import { CUSTOMER_PORTAL_URL } from "@/lib/constants";

// Mobile heroes are shorter, so flip to opaque sooner. Threshold is read on
// each scroll so window resize / device rotation adapts automatically.
const MOBILE_BREAKPOINT = 768;
const SCROLL_THRESHOLD_MOBILE = 80;
const SCROLL_THRESHOLD_DESKTOP = 120;

/**
 * Site header — fixed overlay across all pages.
 *
 *  - Top of page: transparent so the first section flows under it.
 *  - After scrolling past the threshold: semi-transparent white + blur + bottom border.
 *
 * The border is rendered as `border-transparent` initially (rather than added
 * on scroll) so the header height stays constant — no 1px layout shift when
 * crossing the threshold.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const threshold =
        window.innerWidth < MOBILE_BREAKPOINT ? SCROLL_THRESHOLD_MOBILE : SCROLL_THRESHOLD_DESKTOP;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-[10000]">
      {/* Visual layer — bg + blur live on this absolute child rather than on
          <header> itself. Putting backdrop-filter on <header> would create a
          containing block for fixed descendants (e.g., MobileNav's overlay)
          and trap them inside the header bar. */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10 border-b transition-colors duration-300",
          scrolled
            ? "bg-surface/80 border-border/50 backdrop-blur-md"
            : "border-transparent bg-transparent",
        )}
      />
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-12 lg:py-4 xl:px-20">
        <Logo inverted={!scrolled} />
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Customer portal - external app, opened in the same tab.
              Hidden below 480px: logo + both buttons + burger need ~463px, so
              portrait phones would overflow. It stays reachable as a MobileNav
              row at every width. Brand red reads on both the transparent hero
              and the scrolled white bar, so it needs no per-state override. */}
          <a
            href={CUSTOMER_PORTAL_URL}
            className={cn(
              buttonVariants({ variant: "brand", size: "sm" }),
              "hidden min-[480px]:inline-flex",
            )}
          >
            Customer Login
          </a>
          <Link
            href="/quote"
            className={cn(
              buttonVariants({ variant: scrolled ? "primary" : "secondary", size: "sm" }),
              "inline-flex",
            )}
          >
            Request Quote
          </Link>
          <MobileNav inverted={!scrolled} />
        </div>
      </div>
    </header>
  );
}
