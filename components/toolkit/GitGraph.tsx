"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { EASE_OUT } from "@/lib/utils";

// A main line with a feature branch that splits off and merges back.
const MAIN = "M8 78 H312";
const BRANCH = "M64 78 C 84 78, 84 34, 112 34 H 208 C 236 34, 236 78, 256 78";
const COMMITS: { x: number; y: number; branch?: boolean; label?: string }[] = [
  { x: 28, y: 78 },
  { x: 64, y: 78, label: "init" },
  { x: 128, y: 34, branch: true, label: "feat" },
  { x: 168, y: 34, branch: true },
  { x: 160, y: 78, label: "fix" },
  { x: 204, y: 34, branch: true, label: "test" },
  { x: 256, y: 78, label: "merge" },
  { x: 292, y: 78 },
];

/** A git history that draws itself: main, a feature branch, and the merge back. */
export function GitGraph() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const draw = (delay: number) => ({
    initial: { pathLength: 0 },
    animate: inView ? { pathLength: 1 } : undefined,
    transition: { duration: 1.4, ease: EASE_OUT, delay },
  });

  return (
    <svg ref={ref} viewBox="0 0 320 104" className="w-full overflow-visible" aria-hidden fill="none">
      <motion.path d={MAIN} stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round" {...draw(0)} />
      <motion.path d={BRANCH} stroke="var(--accent-ink)" strokeWidth="2" strokeLinecap="round" {...draw(0.45)} />
      {COMMITS.map((commit, i) => (
        <motion.g
          key={`${commit.x}-${commit.y}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : undefined}
          transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.3 + (commit.x / 320) * 1.3 }}
        >
          <circle
            cx={commit.x}
            cy={commit.y}
            r={i === COMMITS.length - 1 ? 6 : 5}
            fill={commit.branch ? "var(--accent)" : "var(--surface)"}
            stroke={commit.branch ? "var(--accent-ink)" : "var(--fg)"}
            strokeWidth="2"
          />
          {commit.label && (
            <text
              x={commit.x}
              y={commit.branch ? commit.y - 13 : commit.y + 22}
              textAnchor="middle"
              className="fill-[var(--muted)] font-mono text-[9px] uppercase tracking-[0.12em]"
            >
              {commit.label}
            </text>
          )}
        </motion.g>
      ))}
      <motion.g
        initial={{ opacity: 0, x: -6 }}
        animate={inView ? { opacity: 1, x: 0 } : undefined}
        transition={{ delay: 2, duration: 0.6, ease: EASE_OUT }}
      >
        <rect x="270" y="44" width="44" height="17" rx="8.5" fill="var(--fg)" />
        <text x="292" y="56" textAnchor="middle" className="fill-[var(--bg)] font-mono text-[9px] tracking-[0.12em]">
          HEAD
        </text>
        <path d="M292 61 V70" stroke="var(--fg)" strokeWidth="1.5" />
      </motion.g>
    </svg>
  );
}
