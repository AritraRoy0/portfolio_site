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
import { Fragment, useRef, type ReactNode } from "react";
import { portfolio } from "@/data/portfolio";
import { cn } from "@/lib/utils";

const wrap = (min: number, max: number, value: number) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

/**
 * Endless strip that drifts on its own, speeds up with scroll velocity, and
 * flips direction when you scroll back up.
 */
function Tape({ children, baseVelocity, className }: { children: ReactNode; baseVelocity: number; className?: string }) {
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

  return (
    <div ref={strip} className={cn("overflow-hidden", className)}>
      <motion.div style={{ x }} className="flex w-max whitespace-nowrap">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center">{children}</div>
      </motion.div>
    </div>
  );
}

/** Two tapes crossing over each other: what I do on top, the stack underneath. */
export function Marquee({ items }: { items: string[] }) {
  const stack = portfolio.skills.flatMap((group) => group.items);
  if (items.length === 0) return null;

  return (
    <div aria-hidden className="relative select-none overflow-hidden py-14 md:py-24">
      <Tape
        baseVelocity={-2.4}
        className="relative z-[1] -mx-[5%] -rotate-[3deg] bg-accent py-3 text-accent-fg shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45)] [--outline:var(--accent-fg)] md:py-4"
      >
        {items.map((item, i) => (
          <span
            key={item}
            className="flex items-center text-[clamp(2rem,5.2vw,4.75rem)] font-semibold leading-[1.1] tracking-[-0.045em]"
          >
            <span className={i % 2 === 1 ? "text-outline" : undefined}>{item}</span>
            <Asterisk strokeWidth={2.5} className="spin-slow mx-[0.35em] size-[0.55em] shrink-0" />
          </span>
        ))}
      </Tape>
      <Tape
        baseVelocity={1.6}
        // Pulled up under the lime tape so the two cross; narrow screens need less overlap to show the crossing.
        className="relative -mx-[5%] -mt-[1.75rem] rotate-[3deg] border-y border-line bg-surface py-3 md:-mt-[5.4rem] md:py-4"
      >
        {[0, 1].map((copy) => (
          <Fragment key={copy}>
            {stack.map((item) => (
              <span key={`${copy}-${item}`} className="label-mono flex items-center text-[12px] text-fg/80 md:text-[13px]">
                {item}
                <span className="mx-5 text-accent-ink md:mx-7">✦</span>
              </span>
            ))}
          </Fragment>
        ))}
      </Tape>
    </div>
  );
}
