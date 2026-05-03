"use client";

import { motion, type HTMLMotionProps } from "motion/react";

export type RevealProps = HTMLMotionProps<"div"> & {
  /** Stagger delay in seconds — chain multiple Reveals with `delay={0.1 * i}`. */
  delay?: number;
  /** Initial vertical offset in px. Default 16. */
  offset?: number;
};

/**
 * Scroll-reveal wrapper. Fades + rises into place when the element enters
 * viewport. Respects `prefers-reduced-motion` via globals.css transition-duration
 * override (motion library inherits that CSS rule).
 *
 * Use `delay` to stagger sibling Reveals; defaults to firing once per session.
 */
export function Reveal({
  delay = 0,
  offset = 16,
  initial,
  whileInView,
  viewport,
  transition,
  ...props
}: RevealProps) {
  return (
    <motion.div
      initial={initial ?? { opacity: 0, y: offset }}
      whileInView={whileInView ?? { opacity: 1, y: 0 }}
      viewport={viewport ?? { once: true, margin: "-10% 0px" }}
      transition={transition ?? { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      {...props}
    />
  );
}
