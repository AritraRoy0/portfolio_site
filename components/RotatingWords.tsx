"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE_OUT } from "@/lib/utils";

/** Cycles through phrases with a 3D flip. Screen readers get the full list once. */
export function RotatingWords({
  words,
  interval = 2600,
  paused = false,
}: {
  words: string[];
  interval?: number;
  /** Stops cycling, e.g. while the words are covered. */
  paused?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || paused || words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [reduced, paused, words.length, interval]);

  if (words.length === 0) return null;

  return (
    <>
      <span className="sr-only">{new Intl.ListFormat("en", { type: "disjunction" }).format(words)}</span>
      <span
        aria-hidden
        className="relative inline-grid overflow-x-visible overflow-y-clip pb-[0.14em] -mb-[0.14em] align-bottom [perspective:600px]"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={words[index]}
            initial={{ y: "70%", rotateX: -85, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: "0%", rotateX: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-70%", rotateX: 85, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            className="inline-block origin-[50%_50%_-0.4em] whitespace-nowrap pr-[0.08em] font-serif font-normal italic tracking-[-0.01em] text-accent-ink"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  );
}
