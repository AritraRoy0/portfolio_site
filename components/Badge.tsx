"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useVelocity,
} from "motion/react";
import { useRef, type PointerEvent } from "react";
import { portfolio } from "@/data/portfolio";
import { FINE_POINTER, REDUCED_MOTION, useMediaQuery } from "@/lib/hooks";
import { initialsOf } from "@/lib/utils";

const initials = initialsOf(portfolio.name);

// Underdamped, so a fling swings back and forth a few times before settling.
const PENDULUM = { stiffness: 60, damping: 4.5, mass: 1.1 };
const TILT = { stiffness: 220, damping: 22 };
const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

/**
 * An ID badge on a lanyard. It sways when the page scrolls fast, can be dragged
 * sideways and let go to swing, and leans toward the cursor with a holographic
 * sheen. The text on it is real content, so it stays readable to screen readers.
 */
export function Badge() {
  const reduced = useMediaQuery(REDUCED_MOTION);
  const fine = useMediaQuery(FINE_POINTER);
  const card = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number } | null>(null);

  const target = useMotionValue(0);
  const swing = useSpring(target, PENDULUM);
  const rotateX = useSpring(0, TILT);
  const rotateY = useSpring(0, TILT);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  useMotionValueEvent(velocity, "change", (v) => {
    if (reduced || drag.current) return;
    target.set(clamp(v * 0.01, 10));
  });

  const education = portfolio.education[0];
  const year = education?.year ?? String(new Date().getFullYear());

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.button !== 0) return;
    drag.current = { id: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = card.current;
    if (!element || reduced) return;
    if (drag.current && drag.current.id === event.pointerId) {
      // The badge hangs from its top, where a positive (clockwise) rotation swings the card
      // left, so dragging right needs a negative angle for the card to follow the pointer.
      target.set(clamp((drag.current.x - event.clientX) * 0.14, 32));
      return;
    }
    if (!fine) return;
    const rect = element.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 22);
    rotateX.set((0.5 - py) * 18);
    element.style.setProperty("--holo-x", `${px * 100}%`);
    element.style.setProperty("--holo-y", `${py * 100}%`);
  };

  const release = () => {
    drag.current = null;
    target.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <figure className="relative mx-auto w-[min(19rem,80vw)] select-none" aria-label={`ID badge for ${portfolio.name}`}>
      <motion.div style={reduced ? undefined : { rotate: swing }} className="origin-top will-change-transform">
        {/* Lanyard */}
        <div aria-hidden className="relative mx-auto h-28 w-8 overflow-hidden bg-accent text-accent-fg md:h-36">
          <div className="label-mono absolute inset-0 flex items-center justify-center text-[9px] [writing-mode:vertical-rl]">
            {portfolio.name} · {portfolio.name}
          </div>
        </div>
        <div aria-hidden className="relative z-[1] mx-auto -mt-1 h-6 w-12 rounded-md bg-gradient-to-b from-zinc-200 to-zinc-500 shadow-md">
          <span className="absolute inset-x-2 top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-700/50" />
        </div>

        <div className="-mt-2 [perspective:1200px]">
          <motion.div
            ref={card}
            data-cursor="Drag"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={release}
            onPointerCancel={release}
            onPointerLeave={() => {
              if (!drag.current) release();
            }}
            style={reduced ? undefined : { rotateX, rotateY }}
            className="group relative touch-pan-y overflow-hidden rounded-[1.4rem] border border-line-strong bg-surface p-5 shadow-float"
          >
            <span aria-hidden className="absolute left-1/2 top-3 h-2.5 w-14 -translate-x-1/2 rounded-full border border-line bg-bg" />

            <div className="mt-6 flex items-center justify-between">
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-xl bg-accent text-sm font-semibold tracking-tight text-accent-fg"
              >
                {initials}
              </span>
              <span className="label-mono text-right text-[9.5px] text-muted">
                Portfolio
                <br />
                Access · All areas
              </span>
            </div>

            <div aria-hidden className="bg-grid crop-marks relative mt-5 grid aspect-[4/3] place-items-center overflow-hidden rounded-xl border border-line [--grid:1.25rem]">
              <span className="font-serif text-[5.5rem] italic leading-none tracking-[-0.04em] text-accent-ink">
                {initials.toLowerCase()}
              </span>
              <span className="label-mono absolute bottom-2 left-2.5 text-[9px] text-muted">Fig. 02</span>
              <span className="label-mono absolute bottom-2 right-2.5 text-[9px] text-muted">’{year.slice(-2)}</span>
            </div>

            <p className="mt-5 text-[1.6rem] font-semibold leading-none tracking-[-0.035em]">{portfolio.name}</p>
            <p className="mt-1.5 text-sm text-muted">{portfolio.role}</p>

            <dl className="mt-5 space-y-2 border-t border-dashed border-line-strong pt-4 font-mono text-[10.5px] uppercase tracking-[0.12em]">
              {education && (
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-muted">Edu</dt>
                  <dd>
                    {education.school}
                    <span className="block normal-case tracking-normal text-muted">
                      {education.degree}, {education.year}
                    </span>
                  </dd>
                </div>
              )}
              {portfolio.timezone && (
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-muted">Zone</dt>
                  <dd>{portfolio.timezone.replace(/_/g, " ")}</dd>
                </div>
              )}
              {portfolio.availability && (
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-muted">Status</dt>
                  <dd className="flex items-center gap-2">
                    <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
                    {portfolio.availability}
                  </dd>
                </div>
              )}
            </dl>

            <div aria-hidden className="mt-5 flex items-end justify-between gap-4">
              <span className="barcode h-8 flex-1 text-fg/80" />
              <span className="label-mono text-[9px] text-muted">
                ID {initials}-{year}
              </span>
            </div>

            <span
              aria-hidden
              className="holo pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          </motion.div>
        </div>
      </motion.div>
      {!reduced && (
        <figcaption className="label-mono mt-6 text-center text-[10px] text-muted">
          <span aria-hidden>← </span>Drag me<span aria-hidden> →</span>
        </figcaption>
      )}
    </figure>
  );
}
