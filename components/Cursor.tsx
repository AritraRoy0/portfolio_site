"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { FINE_POINTER, useMediaQuery } from "@/lib/hooks";

type Mode = "default" | "link" | "label";

const FOLLOW = { stiffness: 420, damping: 34, mass: 0.5 };

/**
 * A precise dot plus a trailing ring (mouse only). The ring fills over links and
 * turns into a labelled bubble over anything with a `data-cursor="Label"` attribute.
 * Canvas pieces that cannot carry attributes (the globe) ask for a label with a
 * `cursor:label` window event instead. Ring and dot use difference blending so they
 * stay visible on any background.
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
  const [override, setOverride] = useState<string | null>(null);
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
      setMode(target?.closest("a, button, [role='button'], [role='option'], summary, label") ? "link" : "default");
    };
    const onLabel = (event: Event) => setOverride((event as CustomEvent<string | null>).detail ?? null);
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("cursor:label", onLabel);
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("cursor:label", onLabel);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.classList.remove("has-cursor");
    };
  }, [fine, x, y]);

  if (!fine) return null;

  const followX = reduced ? x : springX;
  const followY = reduced ? y : springY;
  // Real links win over a canvas label, so buttons over the globe still read as buttons.
  const current: Mode = override && mode === "default" ? "label" : mode;
  const text = current === "label" ? (mode === "label" ? label : override ?? "") : "";
  const ringSize = current === "link" ? 56 : 34;

  // Each piece is its own small fixed layer: blending only the pixels under the ring and
  // dot is far cheaper than a full-screen blend layer, and moving them never repaints.
  const layer = "pointer-events-none fixed left-0 top-0 will-change-transform";

  return (
    <>
      <motion.div aria-hidden className={`${layer} z-[90] mix-blend-difference`} style={{ x: followX, y: followY }}>
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
          initial={false}
          animate={{
            width: ringSize,
            height: ringSize,
            opacity: visible && current !== "label" ? (current === "link" ? 1 : 0.5) : 0,
            scale: pressed ? 0.78 : 1,
            backgroundColor: current === "link" ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
          }}
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
        />
      </motion.div>
      <motion.div aria-hidden className={`${layer} z-[90] mix-blend-difference`} style={{ x, y }}>
        <motion.div
          className="size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          initial={false}
          animate={{ opacity: visible && current === "default" ? 1 : 0 }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>

      <motion.div aria-hidden className={`${layer} z-[91]`} style={{ x: followX, y: followY }}>
        <AnimatePresence>
          {visible && current === "label" && (
            <motion.div
              key="label"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: pressed ? 0.85 : 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 24 }}
              className="grid size-[4.5rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-accent-fg shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)]"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={text}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {text}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
