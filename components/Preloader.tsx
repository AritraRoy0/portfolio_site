"use client";

import { AnimatePresence, animate, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { portfolio } from "@/data/portfolio";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/utils";
import { useIntro, useScrollControls } from "./Providers";

const COLUMNS = 6;
const BOOT_SECONDS = 1.9;

const toolCount = portfolio.skills.reduce((total, group) => total + group.items.length, 0);

// A short boot log built from the real content.
const LOG: { label: string; value: string }[] = [
  { label: "loading experience", value: `${portfolio.experience.length} roles` },
  { label: "compiling projects", value: `${portfolio.projects.length} shipped` },
  { label: "indexing toolkit", value: `${toolCount} tools` },
  { label: "warming up motion", value: "ok" },
];

/**
 * A boot-sequence intro that plays once per browser session: a log prints, a
 * counter runs to 100, and the screen lifts away in staggered columns. Any key or
 * click skips it. Repeat visits and reduced-motion visitors never see it (see the
 * boot script in layout.tsx).
 */
export function Preloader() {
  const { finishIntro } = useIntro();
  const { lenis } = useScrollControls();
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    try {
      sessionStorage.setItem("intro-seen", "1");
    } catch {
      // Storage blocked: the intro simply plays again next visit.
    }
    setVisible(false);
    finishIntro();
  }, [finishIntro]);

  useEffect(() => {
    if (document.documentElement.dataset.intro === "skip") {
      done.current = true;
      setVisible(false);
      finishIntro();
      return;
    }
    let timer = 0;
    const controls = animate(0, 100, {
      duration: BOOT_SECONDS,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (value) => {
        if (counter.current) counter.current.textContent = String(Math.round(value)).padStart(3, "0");
        if (bar.current) bar.current.style.transform = `scaleX(${value / 100})`;
        setStep(Math.min(LOG.length + 1, Math.floor((value / 100) * (LOG.length + 1.6))));
      },
      onComplete: () => {
        timer = window.setTimeout(finish, 280);
      },
    });
    window.addEventListener("keydown", finish);
    window.addEventListener("pointerdown", finish);
    return () => {
      controls.stop();
      window.clearTimeout(timer);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, [finish, finishIntro]);

  // No scrolling while the curtain is down.
  useEffect(() => {
    if (!visible || !lenis) return;
    lenis.stop();
    return () => lenis.start();
  }, [visible, lenis]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div key="preloader" aria-hidden className="preloader fixed inset-0 z-[100] text-[#f1f1ec]">
          {/* Two layers of columns: dark lifts first, the lime one chases it. */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: COLUMNS }, (_, i) => (
              <motion.div
                key={i}
                className="-mx-px h-full flex-1 bg-[#c8ff3d]"
                exit={{ y: "-100%" }}
                transition={{ duration: 0.85, ease: EASE_IN_OUT, delay: 0.16 + i * 0.055 }}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex">
            {Array.from({ length: COLUMNS }, (_, i) => (
              <motion.div
                key={i}
                className="-mx-px h-full flex-1 bg-[#08080a]"
                exit={{ y: "-100%" }}
                transition={{ duration: 0.8, ease: EASE_IN_OUT, delay: i * 0.055 }}
              />
            ))}
          </div>

          <motion.div
            className="relative flex h-full flex-col justify-between p-5 md:p-8"
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.45, ease: EASE_IN_OUT }}
          >
            <div className="label-mono flex justify-between text-[#8b8b94]">
              <span>{portfolio.name} — Portfolio</span>
              <span>©{new Date().getFullYear()}</span>
            </div>

            <div className="max-w-md font-mono text-[12px] leading-[2] text-[#8b8b94] md:text-[13px]">
              <p className="text-[#f1f1ec]">
                <span className="text-[#c8ff3d]">~</span> boot portfolio --env=production
              </p>
              {LOG.map((line, i) => (
                <motion.p
                  key={line.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={step > i ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                  className="flex items-baseline gap-3"
                >
                  <span className="text-[#c8ff3d]">✓</span>
                  <span>{line.label}</span>
                  <span className="mb-[0.35em] flex-1 border-b border-dotted border-[#8b8b94]/40" />
                  <span className="text-[#f1f1ec]">{line.value}</span>
                </motion.p>
              ))}
              <motion.p
                initial={{ opacity: 0 }}
                animate={step > LOG.length ? { opacity: 1 } : undefined}
                className="text-[#f1f1ec]"
              >
                <span className="text-[#c8ff3d]">~</span> ready<span className="caret ml-1 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-[#c8ff3d]" />
              </motion.p>
            </div>

            <div>
              <div className="flex items-end justify-between gap-6">
                <div className="overflow-hidden pb-[0.12em]">
                  <motion.p
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.15 }}
                    className="text-[clamp(2.75rem,9vw,8rem)] font-semibold leading-none tracking-[-0.055em]"
                  >
                    {portfolio.name}
                    <span className="text-[#c8ff3d]">.</span>
                  </motion.p>
                </div>
                <p className="flex items-start font-mono font-light leading-none tracking-[-0.06em] tabular-nums">
                  <span ref={counter} className="text-[clamp(2.5rem,7vw,6rem)]">
                    000
                  </span>
                  <span className="ml-1 mt-2 text-sm tracking-normal text-[#8b8b94]">%</span>
                </p>
              </div>
              <div className="mt-5 h-px w-full bg-white/10">
                <span ref={bar} className="block h-full origin-left scale-x-0 bg-[#c8ff3d]" />
              </div>
              <p className="label-mono mt-4 text-[#8b8b94]/70">Press any key to skip</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
