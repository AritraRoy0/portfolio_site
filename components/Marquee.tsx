"use client";

import { Asterisk } from "lucide-react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRef } from "react";

const wrap = (min: number, max: number, value: number) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

/**
 * Endless banner that drifts on its own, speeds up with scroll velocity, and
 * flips direction when you scroll back up.
 */
export function Marquee({ items, baseVelocity = -3 }: { items: string[]; baseVelocity?: number }) {
  const reduced = useReducedMotion();
  const strip = useRef<HTMLDivElement>(null);
  const inView = useInView(strip, { margin: "200px 0px" });
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });
  // Two identical rows: shifting by one row width (50%) loops seamlessly.
  const x = useTransform(baseX, (value) => `${wrap(-50, 0, value)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reduced || !inView) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    moveBy += direction.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  if (items.length === 0) return null;

  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={item} className="flex items-center">
          <span className={i % 2 === 1 ? "text-outline" : undefined}>{item}</span>
          <Asterisk
            strokeWidth={2.5}
            className="mx-[0.3em] size-[0.5em] shrink-0 animate-[spin_12s_linear_infinite] text-accent"
          />
        </span>
      ))}
    </div>
  );

  return (
    <div ref={strip} aria-hidden className="select-none overflow-hidden border-y border-line py-5 md:py-7">
      <motion.div
        style={{ x }}
        className="flex w-max whitespace-nowrap text-[clamp(2.75rem,8vw,7.5rem)] font-semibold leading-[1.05] tracking-[-0.045em]"
      >
        {row}
        {row}
      </motion.div>
    </div>
  );
}
