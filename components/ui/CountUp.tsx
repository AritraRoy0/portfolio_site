"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { EASE_OUT } from "@/lib/utils";

/** Counts from zero to `value` the first time it scrolls into view. Hidden from screen readers; pair it with the real value. */
export function CountUp({ value, duration = 2.2 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || !inView) return;
    if (reduced) {
      element.textContent = value.toLocaleString("en-US");
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (latest) => {
        element.textContent = Math.round(latest).toLocaleString("en-US");
      },
    });
    return () => controls.stop();
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} aria-hidden className="tabular-nums">
      0
    </span>
  );
}
