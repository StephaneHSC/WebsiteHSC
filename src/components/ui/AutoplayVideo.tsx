"use client";

import { useEffect, useRef, type VideoHTMLAttributes, type ReactNode } from "react";

export type AutoplayVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  children?: ReactNode;
};

/**
 * `<video>` wrapper that force-triggers autoplay on Safari (desktop + iOS).
 *
 * Safari can silently ignore the `autoplay`/`muted` HTML attributes on
 * server-rendered markup — the video element's `muted` IDL property doesn't
 * always end up `true` on hydration even though the attribute is present,
 * which blocks autoplay with no visible error (Chrome/Firefox don't have
 * this quirk). Explicitly setting `.muted = true` and calling `.play()`
 * after mount — plus the legacy `webkit-playsinline` attribute for older
 * iOS Safari — fixes this reliably.
 */
export function AutoplayVideo({ children, ...props }: AutoplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.setAttribute("webkit-playsinline", "true");
    // `.play()` returns a promise that rejects if the browser still refuses
    // (e.g. user has "Never Auto-Play" set in Safari prefs) — swallow that
    // rather than letting it surface as an unhandled rejection; there's
    // nothing more we can do in that case.
    video.play()?.catch(() => {});
  }, []);

  return (
    <video ref={ref} autoPlay muted loop playsInline {...props}>
      {children}
    </video>
  );
}
