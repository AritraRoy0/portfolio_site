"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE_OUT } from "@/lib/utils";

/** Cycles through phrases with a vertical slide. Screen readers get the full list once. */
export function RotatingWords({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [reduced, words.length, interval]);

  if (words.length === 0) return null;

  return (
    <>
      <span className="sr-only">{new Intl.ListFormat("en", { type: "disjunction" }).format(words)}</span>
      <span aria-hidden className="relative inline-grid overflow-x-visible overflow-y-clip pb-[0.14em] -mb-[0.14em] align-bottom">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={words[index]}
            initial={{ y: "115%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-115%" }}
            transition={{ duration: 0.85, ease: EASE_OUT }}
            className="inline-block whitespace-nowrap pr-[0.08em] font-serif font-normal italic tracking-[-0.01em] text-accent-ink"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  );
}
