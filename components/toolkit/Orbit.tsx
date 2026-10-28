"use client";

import { useAnimationFrame, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

// Ring radii as a share of the box.
const RX = 38;
const RY = 33;

// Short numbers serialise identically on server and client, so hydration matches.
const round = (n: number) => Math.round(n * 100) / 100;

function position(angle: number) {
  const depth = (Math.sin(angle) + 1) / 2; // 0 = back, 1 = front
  return {
    left: `${round(50 + Math.cos(angle) * RX)}%`,
    top: `${round(50 + Math.sin(angle) * RY)}%`,
    transform: `translate(-50%, -50%) scale(${round(0.78 + depth * 0.3)})`,
    opacity: round(0.45 + depth * 0.55),
    zIndex: Math.round(depth * 10),
  };
}

/**
 * Items circling a core on a tilted ring. Chips in front are larger and brighter
 * than those passing behind. Hovering slows the orbit so a chip is easy to read.
 */
export function Orbit({ items, core = "</>" }: { items: string[]; core?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const chips = useRef<(HTMLLIElement | null)[]>([]);
  const angle = useRef(0);
  const speed = useRef(1);
  const hovered = useRef(false);
  const inView = useInView(box, { margin: "100px 0px" });
  const reduced = useReducedMotion();
  const slot = (i: number) => (i / items.length) * Math.PI * 2;

  useAnimationFrame((_, delta) => {
    if (!inView || reduced) return;
    speed.current += ((hovered.current ? 0.12 : 1) - speed.current) * 0.06;
    angle.current += (delta / 1000) * 0.3 * speed.current;
    chips.current.forEach((chip, i) => {
      if (chip) Object.assign(chip.style, position(angle.current + slot(i)));
    });
  });

  return (
    <div
      ref={box}
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
      className="relative h-full min-h-[15rem] w-full"
    >
      <div aria-hidden className="absolute inset-0 grid place-items-center">
        <span className="absolute h-[66%] w-[76%] rounded-[50%] border border-dashed border-line-strong" />
        <span className="absolute h-[38%] w-[44%] rounded-[50%] border border-line" />
        <span className="relative z-[5] grid size-14 place-items-center rounded-2xl bg-fg font-mono text-sm font-medium text-bg shadow-float">
          <span aria-hidden className="absolute -inset-3 -z-10 animate-pulse rounded-3xl bg-accent/35 blur-lg" />
          {core}
        </span>
      </div>
      <ul aria-label="Frameworks" className="absolute inset-0">
        {items.map((item, i) => (
          <li
            key={item}
            ref={(node) => {
              chips.current[i] = node;
            }}
            style={position(slot(i))}
            className="absolute whitespace-nowrap rounded-full border border-line bg-surface px-4 py-2 text-[15px] font-medium shadow-[0_8px_24px_-12px_rgb(0_0_0/0.4)] transition-colors duration-300 hover:border-accent-ink hover:text-accent-ink"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
