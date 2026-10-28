"use client";

import { Check, GitCommitHorizontal, Hammer, Rocket, ShieldCheck, Zap } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { REDUCED_MOTION, useMediaQuery } from "@/lib/hooks";
import { cn, EASE_OUT } from "@/lib/utils";

const STAGES = [
  { label: "Commit", status: "Pushed to main", icon: GitCommitHorizontal },
  { label: "Build", status: "Building image…", icon: Hammer },
  { label: "Test", status: "Running checks…", icon: ShieldCheck },
  { label: "Deploy", status: "Rolling out…", icon: Rocket },
  { label: "Live", status: "Live in production", icon: Zap },
];
const LAST = STAGES.length - 1;

/** A deploy pipeline on loop: a pulse runs from commit to live, lighting each stage. */
export function Pipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduced = useMediaQuery(REDUCED_MOTION);
  const [stage, setStage] = useState(0);
  const current = reduced ? LAST : stage;

  useEffect(() => {
    if (reduced || !inView) return;
    const id = window.setTimeout(() => setStage((s) => (s >= LAST ? 0 : s + 1)), stage >= LAST ? 2200 : 850);
    return () => window.clearTimeout(id);
  }, [reduced, inView, stage]);

  const live = current === LAST;

  return (
    <div ref={ref} aria-hidden className="flex h-full flex-col justify-center gap-6 rounded-2xl border border-line bg-bg/60 p-5">
      <div className="relative mx-3">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line-strong" />
        <motion.span
          className="absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-accent-ink"
          initial={false}
          animate={{ width: `${(current / LAST) * 100}%` }}
          transition={current === 0 ? { duration: 0 } : { duration: 0.8, ease: EASE_OUT }}
        />
        <ol className="relative flex justify-between">
          {STAGES.map((item, i) => {
            const Icon = item.icon;
            const done = i < current;
            const on = i === current;
            return (
              <li key={item.label} className="flex flex-col items-center gap-2">
                <motion.span
                  initial={false}
                  animate={{ scale: on ? 1.12 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className={cn(
                    "relative grid size-9 place-items-center rounded-full border transition-colors duration-500 md:size-10",
                    done && "border-transparent bg-fg text-bg",
                    on && "border-transparent bg-accent text-accent-fg",
                    !done && !on && "border-line-strong bg-surface text-muted",
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={2.5} /> : <Icon className="size-4" />}
                  {on && <span className="absolute inset-0 animate-ping rounded-full bg-accent/50" />}
                </motion.span>
                <span
                  className={cn(
                    "label-mono text-[9px] tracking-[0.08em] transition-colors duration-500 sm:tracking-[0.16em]",
                    on || done ? "text-fg" : "text-muted",
                  )}
                >
                  {item.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-dashed border-line pt-4 font-mono text-[11.5px]">
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn("size-2 shrink-0 rounded-full transition-colors duration-500", live ? "bg-emerald-500" : "bg-amber-400")} />
          <span className="relative inline-grid overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={current}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                className="truncate"
              >
                {STAGES[current].status}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
        <span className="shrink-0 text-muted">main · {String(current + 1).padStart(2, "0")}/{String(STAGES.length).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
