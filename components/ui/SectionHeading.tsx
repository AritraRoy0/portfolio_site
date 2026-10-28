"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn, EASE_OUT } from "@/lib/utils";
import { FadeUp } from "./FadeUp";
import { RevealText } from "./RevealText";
import { ScrambleText } from "./ScrambleText";

/** "[01] ——— About": index, a rule that draws in, and a label that decodes. */
export function SectionLabel({ index, children, className }: { index: string; children: string; className?: string }) {
  return (
    <p className={cn("label-mono flex items-center gap-3 text-muted", className)}>
      <span className="text-accent-ink">[{index}]</span>
      <motion.span
        aria-hidden
        className="h-px w-10 origin-left bg-line-strong"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.1 }}
      />
      <ScrambleText text={children} delay={0.15} />
    </p>
  );
}

/** A hairline that draws across, the numbered label, a masked-reveal title, and an optional intro. */
export function SectionHeading({
  index,
  label,
  title,
  children,
  className,
}: {
  index: string;
  label: string;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <motion.div
        aria-hidden
        className="mb-8 h-px origin-left bg-line md:mb-10"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.6, ease: EASE_OUT }}
      />
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <SectionLabel index={index}>{label}</SectionLabel>
          <RevealText
            as="h2"
            text={title}
            className="mt-6 text-balance text-[clamp(2.75rem,7vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.045em]"
          />
        </div>
        {children ? (
          <FadeUp
            delay={0.2}
            className="max-w-sm text-pretty leading-relaxed text-muted md:col-span-4 md:justify-self-end md:pb-3"
          >
            {children}
          </FadeUp>
        ) : null}
      </div>
    </div>
  );
}
