"use client";

import { useEffect } from "react";

/**
 * Attaches touch listeners to a scroll container so that vertical swipes
 * redirect to horizontal scrolling. Lets the page scroll normally once the
 * carousel reaches either edge.
 */
export function useHorizontalTouchScroll(ref: React.RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

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
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (isVertical === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        isVertical = Math.abs(dy) > Math.abs(dx);
      }
      if (!isVertical) return;

      // el is verified non-null before listeners are attached.
      const max = el!.scrollWidth - el!.clientWidth;
      const atStart = el!.scrollLeft <= 0;
      const atEnd = el!.scrollLeft >= max - 1;
      if ((atStart && dy > 0) || (atEnd && dy < 0)) return;

      e.preventDefault();
      el!.scrollLeft -= dx;
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
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [ref, enabled]);
}
