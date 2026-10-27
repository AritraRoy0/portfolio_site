"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { Fragment, useRef, type CSSProperties } from "react";
import { portfolio, type Project } from "@/data/portfolio";
import { REDUCED_MOTION, STACK_QUERY, useMediaQuery } from "@/lib/hooks";
import { cn, EASE_OUT, hostOf, pad2 } from "@/lib/utils";
import { GitHubIcon } from "./Icons";
import { btn } from "./ui/buttons";
import { RollingText } from "./ui/RollingText";
import { SectionHeading } from "./ui/SectionHeading";

/** Scroll distance each pinned card gets, in viewport heights. Above 1 = a pause before the next card arrives. */
const SLOT = 1.3;
const GLOW_POSITIONS = ["72%", "28%", "58%"];

/**
 * On large screens each project card pins in place, rests for a moment, and the
 * next one slides over it while the cards underneath shrink and darken into a deck.
 * Smaller screens (and reduced motion) get a simple vertical list.
 */
export function Work() {
  const projects = portfolio.projects;
  const container = useRef<HTMLDivElement>(null);
  const stack = useMediaQuery(STACK_QUERY);
  const reduced = useMediaQuery(REDUCED_MOTION);
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });

  return (
    <section id="work" tabIndex={-1} className="pb-8 pt-24 md:pt-32">
      <div className="container-page">
        <SectionHeading index="03" label="Selected work" title="Things I’ve *built*">
          {portfolio.intros.work}
        </SectionHeading>
      </div>
      <div ref={container} className="container-page mt-14 space-y-5 md:mt-20 stack:space-y-0">
        {projects.map((project, index) => (
          <Fragment key={project.title}>
            <ProjectCard
              project={project}
              index={index}
              total={projects.length}
              progress={scrollYProgress}
              stacked={stack && !reduced}
            />
            {/*
              Scroll room for the card to rest before the next one arrives. It is a
              sibling rather than part of the pinned slot: each slot must stay one
              screen tall so every card remains pinned until the whole deck leaves.
            */}
            <div aria-hidden className="stack-spacer hidden stack:block" style={{ height: `${(SLOT - 1) * 100}svh` }} />
          </Fragment>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  index,
  total,
  progress,
  stacked,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  stacked: boolean;
}) {
  // A card starts shrinking once the next card begins to slide over it.
  const range = total * SLOT - 1;
  const start = Math.min(1, (index * SLOT + (SLOT - 1)) / range);
  const depth = total - 1 - index;
  const scale = useTransform(progress, [start, 1], [1, 1 - depth * 0.05]);
  const shade = useTransform(progress, [start, 1], [0, depth * 0.14]);

  const shotRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: shotProgress } = useScroll({ target: shotRef, offset: ["start end", "end start"] });
  const shotY = useTransform(shotProgress, [0, 1], ["7%", "-7%"]);

  const href = project.demo || project.code;
  const host = hostOf(project.demo || project.code);
  const glow = { "--glow-x": GLOW_POSITIONS[index % GLOW_POSITIONS.length] } as CSSProperties;

  const browserWindow = (
    <motion.div
      ref={shotRef}
      style={stacked ? { y: shotY } : undefined}
      className="relative w-full overflow-hidden rounded-xl border border-line bg-bg shadow-[0_30px_70px_-30px_rgb(0_0_0/0.5)] transition-transform duration-700 ease-expo group-hover/media:scale-[1.025]"
    >
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto max-w-[60%] truncate rounded-md bg-surface-2 px-3 py-1 font-mono text-[10px] text-muted">
          {host}
        </span>
        <span className="w-[38px]" />
      </div>
      <div className="relative aspect-[16/9] bg-surface-2">
        {project.image ? (
          <Image
            src={project.image}
            alt={`Screenshot of ${project.title}`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-top"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-serif text-6xl italic text-accent-ink">
            {project.title.slice(0, 1)}
          </span>
        )}
      </div>
    </motion.div>
  );

  const mediaClass =
    "group/media relative order-first m-2 flex items-center justify-center overflow-hidden rounded-[1.35rem] bg-surface-2 p-5 sm:m-3 sm:p-8 md:p-12 stack:order-none stack:ml-0 stack:flex-1 stack-short:p-10";

  return (
    <div className="stack-slot stack:sticky stack:top-0 stack:flex stack:h-svh stack:items-start">
      <motion.article
        data-reveal
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.1, ease: EASE_OUT }}
        style={stacked ? { scale, top: `calc(6svh + ${index * 24}px)` } : undefined}
        className="relative flex w-full origin-top flex-col overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-[0_40px_100px_-50px_rgb(0_0_0/0.55)] stack:h-[min(84svh,46rem)] stack:flex-row"
      >
        <div className="relative flex flex-col p-6 sm:p-8 md:p-10 stack:w-[44%] stack:shrink-0 stack-short:p-8">
          <div className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span>
              <span className="text-accent-ink">{pad2(index + 1)}</span> / {pad2(total)}
            </span>
            {host && <span className="truncate">{host}</span>}
          </div>

          <h3 className="mt-8 text-[clamp(2.5rem,min(4.6vw,8svh),4.5rem)] font-semibold leading-[0.92] tracking-[-0.045em] md:mt-10 stack-short:mt-5">
            {project.title}
          </h3>
          {project.subtitle && (
            <p className="mt-3 font-serif text-[1.65rem] italic leading-tight text-accent-ink stack-short:mt-2 stack-short:text-[1.45rem]">
              {project.subtitle}
            </p>
          )}
          <p className="mt-6 text-pretty leading-relaxed text-muted stack-short:mt-4">{project.description}</p>
          {project.highlights?.length ? (
            <ul className="mt-5 space-y-3 stack-short:mt-3 stack-short:space-y-2">
              {project.highlights.map((highlight) => (
                <li key={highlight} className="flex gap-3 text-pretty text-sm leading-relaxed text-muted">
                  <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-accent" />
                  {highlight}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 stack:mt-auto stack:pt-8 stack-short:pt-5">
            <ul className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-line px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3 stack-short:mt-4">
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(btn.primary, "stack-short:py-2.5")}
                >
                  <RollingText>Visit site</RollingText>
                  <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              )}
              {project.code && (
                <a
                  href={project.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(btn.ghost, "stack-short:py-2.5")}
                >
                  <GitHubIcon className="size-4" />
                  <RollingText>Source</RollingText>
                </a>
              )}
            </div>
          </div>
        </div>

        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden
            data-cursor="Visit"
            className={mediaClass}
          >
            <span aria-hidden className="media-glow pointer-events-none absolute inset-0" style={glow} />
            {browserWindow}
          </a>
        ) : (
          <div className={mediaClass}>
            <span aria-hidden className="media-glow pointer-events-none absolute inset-0" style={glow} />
            {browserWindow}
          </div>
        )}

        <motion.div
          aria-hidden
          style={{ opacity: stacked ? shade : 0 }}
          className="pointer-events-none absolute inset-0 z-10 bg-black"
        />
      </motion.article>
    </div>
  );
}
