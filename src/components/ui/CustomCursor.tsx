"use client";

import { useEffect, useRef } from "react";

/**
 * Elements that trigger the cursor's "hover" grow state. Matches the
 * reference site's `a, .cursor-as-pointer` delegation, broadened to native
 * `<button>` / form controls since this codebase favors semantic HTML over
 * marker classes (CLAUDE.md §7).
 */
const HOVER_TARGET_SELECTOR =
  'a, button, [role="button"], input, select, textarea, summary, [data-cursor-hover]';

/**
 * Desktop-only cursor-follower: a small solid dot that snaps to the pointer
 * instantly, plus a larger ring that eases toward it (the lag comes from the
 * CSS `transition` on `.hsc-cursor--outer`, not JS). Mirrors heliskycargo.com's
 * `circle-cursor--inner/--outer` effect. Two deliberate deviations from that
 * reference, both because this site is predominantly light/white rather than
 * dark: (1) no `dark-color` section-aware swap — brand red already reads on
 * both light and dark backgrounds; (2) the hover state keeps the red border
 * instead of switching to white (which would vanish on white sections) and
 * relies on size/opacity growth for the "hover" feedback instead.
 *
 * Does not hide the native OS cursor (the reference site doesn't either) —
 * this purely overlays a decorative follower, so there's no regression if JS
 * is slow to attach.
 */
export function CustomCursor() {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Only fine-pointer, hover-capable devices (mouse/trackpad) — touch
    // devices have no persistent pointer position for this to track.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    let revealed = false;

    const onMove = (event: MouseEvent) => {
      const transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      outer.style.transform = transform;
      inner.style.transform = transform;
      if (!revealed) {
        revealed = true;
        outer.style.visibility = "visible";
        inner.style.visibility = "visible";
      }
    };

    const onOver = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest(HOVER_TARGET_SELECTOR)) {
        outer.classList.add("hsc-cursor--hover");
        inner.classList.add("hsc-cursor--hover");
      }
    };

    const onOut = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const stillInside =
        event.relatedTarget instanceof Element &&
        event.relatedTarget.closest(HOVER_TARGET_SELECTOR) ===
          event.target.closest(HOVER_TARGET_SELECTOR);
      if (event.target.closest(HOVER_TARGET_SELECTOR) && !stillInside) {
        outer.classList.remove("hsc-cursor--hover");
        inner.classList.remove("hsc-cursor--hover");
      }
    };

    const onLeaveWindow = () => {
      revealed = false;
      outer.style.visibility = "hidden";
      inner.style.visibility = "hidden";
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
    };
  }, []);

  return (
    <>
      <div ref={outerRef} aria-hidden="true" className="hsc-cursor hsc-cursor--outer" />
      <div ref={innerRef} aria-hidden="true" className="hsc-cursor hsc-cursor--inner" />
    </>
  );
}
