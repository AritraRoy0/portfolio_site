"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, type Variants } from "motion/react";
import type { Project } from "@/data/portfolio";
import { cn, EASE_OUT, hostOf, pad2 } from "@/lib/utils";
import { GitHubIcon } from "../Icons";
import { btn } from "../ui/buttons";
import { RevealText } from "../ui/RevealText";
import { RollingText } from "../ui/RollingText";

/** Children of the details panel rise in one after another. */
export const DETAIL_ITEM: Variants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/**
 * Title, description, highlights, stack and links for one project. `animated`
 * renders the staggered version; the static version is used to reserve height.
 */
export function ProjectDetails({
  project,
  index,
  total,
  animated = false,
}: {
  project: Project;
  index: number;
  total: number;
  animated?: boolean;
}) {
  const Item = animated ? motion.div : "div";
  const itemProps = animated ? { variants: DETAIL_ITEM } : {};
  const host = hostOf(project.demo || project.code);

  return (
    <div className="grid gap-8 md:grid-cols-12 md:gap-10">
      <div className="md:col-span-7">
        <Item {...itemProps} className="label-mono flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
          <span>
            <span className="text-accent-ink">{pad2(index + 1)}</span> / {pad2(total)}
          </span>
          {host && (
            <>
              <span aria-hidden className="h-px w-6 bg-line-strong" />
              <span className="normal-case tracking-[0.08em]">{host}</span>
            </>
          )}
        </Item>
        <h3 className="mt-5 text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.045em]">
          {animated ? <RevealText text={project.title} by="char" stagger={0.035} /> : project.title}
        </h3>
        {project.subtitle && (
          <Item {...itemProps} className="mt-3 font-serif text-[1.65rem] italic leading-tight text-accent-ink">
            {project.subtitle}
          </Item>
        )}
        <Item {...itemProps} className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
          {project.description}
        </Item>
      </div>

      <div className="flex flex-col gap-7 md:col-span-5 md:pt-2">
        {project.highlights?.length ? (
          <Item {...itemProps}>
            <ul className="space-y-3">
              {project.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-pretty text-[15px] leading-relaxed text-muted">
                  <span aria-hidden className="mt-[0.75em] h-px w-4 shrink-0 bg-accent-ink" />
                  {highlight}
                </li>
              ))}
            </ul>
          </Item>
        ) : null}
        <Item {...itemProps}>
          <ul className="flex flex-wrap gap-2" aria-label="Built with">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-line px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted transition-colors duration-300 hover:border-accent-ink hover:text-accent-ink"
              >
                {tag}
              </li>
            ))}
          </ul>
        </Item>
        <Item {...itemProps} className="flex flex-wrap gap-3">
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className={btn.primary}>
              <RollingText>Visit site</RollingText>
              <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}
          {project.code && (
            <a href={project.code} target="_blank" rel="noopener noreferrer" className={cn(btn.ghost)}>
              <GitHubIcon className="size-4" />
              <RollingText>Source</RollingText>
            </a>
          )}
        </Item>
      </div>
    </div>
  );
}
