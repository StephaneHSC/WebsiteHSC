"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Forces a *fresh* route change (clicking a Link/button) to land at the top
 * of the page — but leaves two cases alone so they keep working normally:
 *
 * 1. Hash-anchor links (e.g. Reviews → `/#testimonials`) — skipped whenever
 *    the URL has a `#hash`, so the browser/Next's own anchor-scroll behavior
 *    isn't fought.
 * 2. Back/forward navigation — skipped, and native `scrollRestoration` is
 *    kept as `"auto"` (the browser default) so pressing Back returns you to
 *    wherever you were scrolled to on that page, not the top.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const isPopNav = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      // Explicit, even though "auto" is the default — makes the intent clear
      // and protects against some other code having set it to "manual".
      window.history.scrollRestoration = "auto";
    }
    const onPopState = () => {
      isPopNav.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (isPopNav.current) {
      isPopNav.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
