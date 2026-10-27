import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FadeUp } from "./FadeUp";
import { RevealText } from "./RevealText";

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
      <span className="text-accent-ink">({index})</span>
      <span aria-hidden className="h-px w-8 bg-line" />
      {children}
    </p>
  );
}

/** Numbered label, a large masked-reveal title, and an optional intro on the right. */
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
    <div className={cn("grid gap-8 md:grid-cols-12 md:items-end", className)}>
      <div className="md:col-span-8">
        <SectionLabel index={index}>{label}</SectionLabel>
        <RevealText
          as="h2"
          text={title}
          className="mt-6 text-balance text-[clamp(2.75rem,7.5vw,7rem)] font-semibold leading-[0.92] tracking-[-0.045em]"
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
  );
}
