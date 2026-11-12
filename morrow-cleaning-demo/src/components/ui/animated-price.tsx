"use client";

import { animate, useMotionValue, useReducedMotion, useTransform, motion } from "motion/react";
import { useEffect } from "react";
import { formatMoney } from "@/lib/pricing";

/** Smoothly counts between price values (in pence). */
export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatMoney(Math.round(v)));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.55, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, mv, reduce]);

  return (
    <motion.span className={`tabular-nums ${className ?? ""}`} aria-live="polite" aria-atomic="true">
      {text}
    </motion.span>
  );
}
