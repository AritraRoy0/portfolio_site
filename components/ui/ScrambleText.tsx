"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";

/**
 * Text that decodes from random glyphs, left to right, the first time it scrolls into
 * view (or when `trigger` turns true). Best on monospace labels, where every glyph has
 * the same width. Screen readers get the plain text.
 */
export function ScrambleText({
  text,
  className,
  trigger,
  delay = 0,
  duration = 750,
  replayOnHover = false,
}: {
  text: string;
  className?: string;
  trigger?: boolean;
  delay?: number;
  duration?: number;
  /** Decode again whenever the pointer enters. */
  replayOnHover?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduced = useReducedMotion();
  const show = trigger ?? inView;

  const run = useCallback(
    (wait = 0) => {
      const element = ref.current;
      if (!element || reduced) return;
      cancelAnimationFrame(frame.current);
      const chars = Array.from(text);
      const start = performance.now() + wait;
      let bucket = -1;

      const tick = (now: number) => {
        const t = (now - start) / duration;
        // Re-roll glyphs every ~50ms so it flickers rather than strobes.
        const nextBucket = Math.floor(now / 50);
        if (t >= 1) {
          element.textContent = text;
          return;
        }
        if (nextBucket !== bucket) {
          bucket = nextBucket;
          let output = "";
          for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const settle = 0.25 + (i / chars.length) * 0.75;
            output += char === " " || t >= settle ? char : GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          element.textContent = output;
        }
        frame.current = requestAnimationFrame(tick);
      };
      frame.current = requestAnimationFrame(tick);
    },
    [text, duration, reduced],
  );

  useEffect(() => {
    if (show) run(delay * 1000);
  }, [show, run, delay]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <span className={cn("inline-block", className)} onPointerEnter={replayOnHover ? () => run() : undefined}>
      <span className="sr-only">{text}</span>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  );
}
