"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { FINE_POINTER, useMediaQuery } from "@/lib/hooks";

const SPRING = { stiffness: 180, damping: 18, mass: 0.6 };

/** Leans toward the cursor in 3D while hovered, then settles back. Mouse only. */
export function Tilt({
  children,
  className,
  max = 7,
  perspective = 1400,
}: {
  children: ReactNode;
  className?: string;
  /** Largest lean in degrees. */
  max?: number;
  perspective?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useMediaQuery(FINE_POINTER);
  const reduced = useReducedMotion();
  const rotateX = useSpring(0, SPRING);
  const rotateY = useSpring(0, SPRING);
  const enabled = fine && !reduced;

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!enabled || !element) return;
    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * max * 2);
    rotateX.set(-py * max * 2);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: perspective }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
