"use client";

import { useEffect } from "react";

/**
 * Attaches touch listeners to a scroll container so that vertical swipes
 * redirect to horizontal scrolling. At either end of the carousel, vertical
 * swipes fall through to normal page scrolling (driven manually, since
 * `touch-action: pan-x` disables the browser's native vertical panning on
 * the element).
 */
export function useHorizontalTouchScroll(ref: React.RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    // Without this, the browser starts a native vertical page scroll on the
    // first touchmove and ignores later preventDefault calls — the redirect
    // never gets a chance to run. pan-x keeps native horizontal swiping.
    const prevTouchAction = el.style.touchAction;
    el.style.touchAction = "pan-x";

    let startX = 0;
    let startY = 0;
    let isVertical: boolean | null = null;

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      startX = t.clientX;
      startY = t.clientY;
      isVertical = null;
    }

    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0];
      if (!t || !el) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (isVertical === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        isVertical = Math.abs(dy) > Math.abs(dx);
      }
      // Horizontal gestures: let the browser's native pan-x scrolling run.
      if (!isVertical) return;

      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= max - 1;

      if ((atStart && dy > 0) || (atEnd && dy < 0)) {
        // Carousel edge — hand the gesture to the page. touch-action: pan-x
        // suppressed native vertical panning, so scroll the window manually.
        window.scrollBy(0, -dy);
      } else {
        // Swipe up (dy < 0) advances the carousel; swipe down rewinds it.
        e.preventDefault();
        el.scrollLeft -= dy;
      }
      startX = t.clientX;
      startY = t.clientY;
    }

    function onTouchEnd() {
      isVertical = null;
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.style.touchAction = prevTouchAction;
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [ref, enabled]);
}
