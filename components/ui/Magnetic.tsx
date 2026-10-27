"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { FINE_POINTER, useMediaQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const SPRING = { stiffness: 220, damping: 16, mass: 0.4 };

/** Pulls its child toward the cursor while hovered, then springs back. Mouse only. */
export function Magnetic({
  children,
  strength = 0.3,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useMediaQuery(FINE_POINTER);
  const reduced = useReducedMotion();
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const enabled = fine && !reduced;

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!enabled || !element) return;
    const rect = element.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}
