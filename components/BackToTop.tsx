"use client";

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useState } from "react";
import { useScrollControls } from "./Providers";

/**
 * Floating button with a ring that fills as you read down the page. It shows up
 * once the hero is behind you and steps aside when the contact footer arrives
 * (which has its own "Back to top").
 */
export function BackToTop() {
  const { scrollTo } = useScrollControls();
  const { scrollY, scrollYProgress } = useScroll();
  const ring = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  const [shown, setShown] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const fromBottom = document.documentElement.scrollHeight - (y + window.innerHeight);
    setShown(y > window.innerHeight * 1.1 && fromBottom > window.innerHeight * 0.9);
  });

  return (
    <AnimatePresence>
      {shown && (
        <motion.button
          type="button"
          onClick={() => scrollTo(0)}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.4, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.4, y: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          className="glass group fixed bottom-5 right-5 z-50 grid size-12 place-items-center rounded-full shadow-float md:bottom-7 md:right-7 md:size-14"
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 size-full -rotate-90" aria-hidden>
            <circle cx="24" cy="24" r="22" fill="none" stroke="var(--line)" strokeWidth="1.5" />
            <motion.circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="var(--accent-ink)"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: ring }}
            />
          </svg>
          <span className="relative grid size-5 place-items-center overflow-hidden">
            <ArrowUp className="size-4 transition-transform duration-500 ease-quart group-hover:-translate-y-[160%]" />
            <ArrowUp className="absolute size-4 translate-y-[160%] transition-transform duration-500 ease-quart group-hover:translate-y-0" />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
