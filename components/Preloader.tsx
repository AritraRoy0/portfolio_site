"use client";

import { AnimatePresence, animate, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { portfolio } from "@/data/portfolio";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/utils";
import { useIntro, useScrollControls } from "./Providers";

// The curtain's bottom edge bows downward as it lifts, then flattens out.
const CURVED = "M0 0 L100 0 Q50 100 0 0 Z";
const FLAT = "M0 0 L100 0 Q50 0 0 0 Z";

/**
 * A short counter intro that plays once per browser session. Repeat visits and
 * reduced-motion visitors skip it (see the boot script in layout.tsx).
 */
export function Preloader() {
  const { finishIntro } = useIntro();
  const { lenis } = useScrollControls();
  const [visible, setVisible] = useState(true);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (document.documentElement.dataset.intro === "skip") {
      setVisible(false);
      finishIntro();
      return;
    }
    const controls = animate(0, 100, {
      duration: 1.6,
      ease: [0.7, 0, 0.3, 1],
      onUpdate: (value) => {
        if (counter.current) counter.current.textContent = String(Math.round(value)).padStart(3, "0");
      },
      onComplete: () => {
        try {
          sessionStorage.setItem("intro-seen", "1");
        } catch {
          // Storage blocked: the intro simply plays again next visit.
        }
        setVisible(false);
        finishIntro();
      },
    });
    return () => controls.stop();
  }, [finishIntro]);

  // No scrolling while the curtain is down.
  useEffect(() => {
    if (!visible || !lenis) return;
    lenis.stop();
    return () => lenis.start();
  }, [visible, lenis]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          aria-hidden
          className="preloader fixed inset-0 z-[100] bg-[#0b0b0c] text-[#ededea]"
          exit={{ y: "-100%" }}
          transition={{ duration: 1.05, ease: EASE_IN_OUT }}
        >
          <motion.div
            className="flex h-full flex-col justify-between p-5 md:p-8"
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE_IN_OUT }}
          >
            <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-[#8d8d92]">
              <span>Portfolio</span>
              <span>©{new Date().getFullYear()}</span>
            </div>

            <div className="overflow-hidden pb-[0.15em]">
              <motion.p
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.1 }}
                className="text-[clamp(2.75rem,9vw,8rem)] font-semibold leading-none tracking-[-0.055em]"
              >
                {portfolio.name}
                <span className="text-[#ff6a3d]">.</span>
              </motion.p>
            </div>

            <div className="flex items-end justify-between gap-6">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="max-w-[14rem] font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-[#8d8d92]"
              >
                {portfolio.role}
              </motion.span>
              <span
                ref={counter}
                className="font-mono text-[clamp(3.5rem,11vw,9rem)] font-light leading-none tracking-[-0.06em] tabular-nums"
              >
                000
              </span>
            </div>
          </motion.div>

          <svg
            className="pointer-events-none absolute left-0 top-full h-[16vh] w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <motion.path
              fill="#0b0b0c"
              initial={{ d: CURVED }}
              exit={{ d: FLAT }}
              transition={{ duration: 1.05, ease: EASE_IN_OUT }}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
