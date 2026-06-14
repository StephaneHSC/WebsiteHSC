"use client";

/**
 * Animated stat value for the StatsBand.
 *
 * Values matching `\d+\+` (e.g. "1000+", "50+") count up from 0 on viewport
 * entry. All other values ("24/7", "2014", etc.) render as static text.
 */

import { useEffect, useRef, useState } from "react";

// ── helpers ─────────────────────────────────────────────────────────────────

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target: number, duration = 1400) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    let rafId: number;
    function frame(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOutCubic(progress) * target));
      if (progress < 1) rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [started, target, duration]);

  return { count, ref };
}

// ── sub-components ───────────────────────────────────────────────────────────

function CountUpValue({ target, className }: { target: number; className?: string }) {
  const { count, ref } = useCountUp(target);
  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}+
    </span>
  );
}

// ── main export ──────────────────────────────────────────────────────────────

// Only animate values that explicitly end with "+" (e.g. "1000+", "50+").
// Plain numbers like "2014" and strings like "24/7" render statically.
const COUNT_RE = /^(\d[\d,]*)\+$/;

export type CountingStatValueProps = {
  value: string;
  className?: string;
};

export function CountingStatValue({ value, className }: CountingStatValueProps) {
  const match = COUNT_RE.exec(value.replace(/,/g, ""));
  if (match) {
    return <CountUpValue target={parseInt(match[1]!, 10)} className={className} />;
  }
  return <span className={className}>{value}</span>;
}
