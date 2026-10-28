"use client";

import { AnimatePresence, motion, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import type { ReactNode } from "react";
import type { Project } from "@/data/portfolio";
import { EASE_IN_OUT, hostOf, pad2 } from "@/lib/utils";

/** `value` wrapped into [-size/2, size/2): how many slots a card is from the front, either way round. */
export const wrapOffset = (value: number, size: number) => ((((value + size / 2) % size) + size) % size) - size / 2;

const FACE =
  "absolute inset-0 overflow-hidden rounded-[1.1rem] border [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

/**
 * One card on the ring: a browser window showing the project, standing at its slot
 * and facing outward, with a designed back for when it turns away. It fades into the
 * fog the further it is from the front, and lights up when it arrives there.
 */
export function RingCard({
  project,
  index,
  total,
  slot,
  slots,
  position,
  front,
  priority,
  onSelect,
}: {
  project: Project;
  /** The project's index; slots repeat projects so the ring looks full. */
  index: number;
  total: number;
  slot: number;
  slots: number;
  /** Ring position in slots (fractional while turning). */
  position: MotionValue<number>;
  /** True for the card currently facing the viewer. */
  front: boolean;
  priority?: boolean;
  onSelect: (slot: number) => void;
}) {
  const offset = useTransform(position, (p) => wrapOffset(slot - p, slots));
  const fog = useTransform(offset, (o) => Math.min(0.85, Math.abs(o) * 0.42));
  const edge = useTransform(offset, (o) => Math.max(0, 1 - Math.abs(o) * 2.5));
  const href = project.demo || project.code;
  const host = hostOf(href);

  const content: ReactNode = (
    <>
      <span className="flex h-[34px] shrink-0 items-center gap-1.5 border-b border-line bg-bg px-3">
        <span className="size-2 rounded-full bg-[#ff5f57]" />
        <span className="size-2 rounded-full bg-[#febc2e]" />
        <span className="size-2 rounded-full bg-[#28c840]" />
        <span className="mx-auto flex max-w-[62%] items-center gap-1.5 truncate rounded-md bg-surface-2 px-2.5 py-0.5 font-mono text-[9.5px] text-muted">
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
          {host}
        </span>
        <span className="w-[30px]" />
      </span>
      <span className="relative block aspect-[16/9] shrink-0 overflow-hidden bg-surface-2">
        {project.image ? (
          <Image
            src={project.image}
            alt=""
            fill
            draggable={false}
            priority={priority}
            sizes="(min-width: 1024px) 40vw, (min-width: 640px) 52vw, 66vw"
            className="object-cover object-top transition-transform duration-[1.2s] ease-expo group-hover/face:scale-[1.04]"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-serif text-6xl italic text-accent-ink">
            {project.title.slice(0, 1)}
          </span>
        )}
      </span>
      <span className="flex h-[44px] shrink-0 items-center gap-3 border-t border-line bg-surface px-4">
        <span className="label-mono text-[10px] text-accent-ink">{pad2(index + 1)}</span>
        <span className="truncate text-sm font-semibold tracking-[-0.01em]">{project.title}</span>
        {project.subtitle && (
          <span className="ml-auto hidden truncate font-serif text-[15px] italic text-muted sm:block">{project.subtitle}</span>
        )}
      </span>

      {/* Fog for cards turned away from the front. */}
      <motion.span style={{ opacity: fog }} className="pointer-events-none absolute inset-0 bg-bg" />
      {/* Accent edge on the front card. */}
      <motion.span
        style={{ opacity: edge }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1.5px_var(--accent-ink)]"
      />
      {/* A light sweep each time a card arrives at the front. */}
      <AnimatePresence>
        {front && (
          <motion.span
            key="sweep"
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            initial={{ x: "0%" }}
            animate={{ x: "420%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: EASE_IN_OUT, delay: 0.25 }}
          />
        )}
      </AnimatePresence>
    </>
  );

  const faceClass = `${FACE} group/face flex flex-col border-line-strong bg-bg shadow-[0_40px_80px_-40px_rgb(0_0_0/0.7)] transition-transform duration-700 ease-expo [-webkit-box-reflect:below_10px_linear-gradient(transparent_58%,rgb(255_255_255/0.2))] hover:[transform:translateZ(26px)]`;

  return (
    <div
      data-card
      className="absolute left-1/2 top-1/2 h-[var(--card-h)] w-[var(--card-w)] [transform-style:preserve-3d]"
      style={{ transform: `translate(-50%, -50%) rotateY(${(slot * 360) / slots}deg) translateZ(var(--radius))` }}
    >
      {front && href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden
          data-cursor="Visit"
          draggable={false}
          className={faceClass}
        >
          {content}
        </a>
      ) : (
        <div aria-hidden data-cursor={front ? undefined : "View"} onClick={() => onSelect(slot)} className={`${faceClass} cursor-pointer`}>
          {content}
        </div>
      )}

      <div
        aria-hidden
        className={`${FACE} bg-grid crop-marks grid place-items-center border-line bg-surface-2 [--grid:1.4rem] [transform:rotateY(180deg)]`}
      >
        <span className="text-outline select-none text-[calc(var(--card-w)*0.36)] font-semibold leading-none tracking-[-0.06em] [--outline:var(--line-strong)]">
          {pad2(index + 1)}
        </span>
        <span className="label-mono absolute bottom-4 left-4 text-[10px] text-muted">
          {project.title} · {pad2(index + 1)}/{pad2(total)}
        </span>
      </div>
    </div>
  );
}
