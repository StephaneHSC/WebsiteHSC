"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

export type RevealProps = HTMLMotionProps<"div"> & {
  /** Stagger delay in seconds — chain multiple Reveals with `delay={0.1 * i}`. */
  delay?: number;
  /** Initial vertical offset in px. Default 16. */
  offset?: number;
};

/**
 * Scroll-reveal wrapper. Fades + rises into place when the element enters the
 * viewport. When `prefers-reduced-motion: reduce` is active we short-circuit
 * to a plain div: no IntersectionObserver, no animation engine, no extra DOM
 * mutations — exactly the behaviour the OS asked for.
 *
 * `motion` runs its own JS animation engine, so the CSS-level reduction in
 * `globals.css` does NOT propagate to elements wrapped by motion components.
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
  className,
  children,
  ...props
}: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    // Plain pass-through. We deliberately drop motion-only props (initial,
    // whileInView, viewport, transition). The cast on `children` narrows the
    // motion-flavoured ReactNode | MotionValue union back to plain ReactNode.
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children as ReactNode}
      </div>
    );
  }

  return (
    <motion.div
      initial={initial ?? { opacity: 0, y: offset }}
      whileInView={whileInView ?? { opacity: 1, y: 0 }}
      viewport={viewport ?? { once: true, margin: "-10% 0px" }}
      transition={transition ?? { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
