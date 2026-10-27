"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { FINE_POINTER, useMediaQuery } from "@/lib/hooks";

type Mode = "default" | "link" | "label";

const FOLLOW = { stiffness: 380, damping: 32, mass: 0.5 };

/**
 * A precise dot plus a trailing ring (mouse only). The ring fills over links and
 * turns into a labelled bubble over anything with a `data-cursor="Label"` attribute.
 * Ring and dot use difference blending so they stay visible on any background.
 */
export function Cursor() {
  const fine = useMediaQuery(FINE_POINTER);
  const reduced = useReducedMotion();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, FOLLOW);
  const springY = useSpring(y, FOLLOW);
  const [mode, setMode] = useState<Mode>("default");
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!fine) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      if (labelled) {
        setMode("label");
        setLabel(labelled.dataset.cursor ?? "");
        return;
      }
      setMode(target?.closest("a, button, [role='button'], summary, label") ? "link" : "default");
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.classList.remove("has-cursor");
    };
  }, [fine, x, y]);

  if (!fine) return null;

  const followX = reduced ? x : springX;
  const followY = reduced ? y : springY;
  const ringSize = mode === "link" ? 60 : 36;

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] mix-blend-difference">
        <motion.div className="absolute left-0 top-0" style={{ x: followX, y: followY }}>
          <motion.div
            className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
            initial={false}
            animate={{
              width: ringSize,
              height: ringSize,
              opacity: visible && mode !== "label" ? (mode === "link" ? 1 : 0.55) : 0,
              scale: pressed ? 0.8 : 1,
              backgroundColor: mode === "link" ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
            }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          />
        </motion.div>
        <motion.div className="absolute left-0 top-0" style={{ x, y }}>
          <motion.div
            className="size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            initial={false}
            animate={{ opacity: visible && mode === "default" ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          />
        </motion.div>
      </div>

      <div aria-hidden className="pointer-events-none fixed inset-0 z-[91]">
        <motion.div className="absolute left-0 top-0" style={{ x: followX, y: followY }}>
          <AnimatePresence>
            {visible && mode === "label" && (
              <motion.div
                key="label"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-[11px] font-medium uppercase tracking-[0.18em] text-accent-fg"
              >
                {label}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
