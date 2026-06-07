"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

export type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  offset?: number;
  /** Direction the element slides in from. Default "up". */
  direction?: "up" | "down" | "left" | "right";

  onMount?: boolean;
};

export function Reveal({
  delay = 0,
  offset = 16,
  direction = "up",
  initial,
  whileInView,
  viewport,
  transition,
  className,
  children,
  onMount = false,
  ...props
}: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children as ReactNode}
      </div>
    );
  }

  const directionMap = {
    up: { x: 0, y: offset },
    down: { x: 0, y: -offset },
    left: { x: offset, y: 0 },
    right: { x: -offset, y: 0 },
  };

  const { x, y } = directionMap[direction];
  if (onMount) {
    return (
      <motion.div
        initial={{ opacity: 0, x, y }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial ?? { opacity: 0, x, y }}
      whileInView={whileInView ?? { opacity: 1, x: 0, y: 0 }}
      viewport={viewport ?? { once: true, margin: "-10% 0px" }}
      transition={transition ?? { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
