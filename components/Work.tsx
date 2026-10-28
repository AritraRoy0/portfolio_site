"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { portfolio, type Project } from "@/data/portfolio";
import { REDUCED_MOTION, WIDE_QUERY, useMediaQuery } from "@/lib/hooks";
import { cn, EASE_OUT, hostOf, pad2 } from "@/lib/utils";
import { GitHubIcon } from "./Icons";
import { useScrollControls } from "./Providers";
import { btn } from "./ui/buttons";
import { FadeUp } from "./ui/FadeUp";
import { Magnetic } from "./ui/Magnetic";
import { RevealText } from "./ui/RevealText";
import { RollingText } from "./ui/RollingText";
import { SectionHeading, SectionLabel } from "./ui/SectionHeading";
import { Tilt } from "./ui/Tilt";

const GLOW_POSITIONS = ["72%", "28%", "58%"];
const TITLE = "Things I’ve *built*";

/**
 * On large screens the section pins and the projects slide past sideways as you
 * scroll down, each panel turning to face you as it reaches the centre. Smaller
 * screens (and reduced motion) get a vertical stack of cards.
 *
 * The <section> element is shared by both layouts so in-page navigation and the
 * nav's section tracking never lose hold of it when the layout switches.
 */
export function Work() {
  const wide = useMediaQuery(WIDE_QUERY);
  const reduced = useMediaQuery(REDUCED_MOTION);
  const section = useRef<HTMLElement>(null);

  return (
    <section id="work" ref={section} tabIndex={-1} aria-label="Selected work" className="relative">
      {wide && !reduced ? <Gallery section={section} /> : <Stack />}
    </section>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Shared pieces                                                                                  */
/* ---------------------------------------------------------------------------------------------- */

function BrowserShot({ project, className }: { project: Project; className?: string }) {
  const host = hostOf(project.demo || project.code);
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-line-strong bg-bg shadow-[0_30px_70px_-30px_rgb(0_0_0/0.55)]",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto flex max-w-[60%] items-center gap-1.5 truncate rounded-md bg-surface-2 px-3 py-1 font-mono text-[10px] text-muted">
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
          {host}
        </span>
        <span className="w-[38px]" />
      </div>
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
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
    </div>
  );
}

function ProjectLinks({ project, compact }: { project: Project; compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      {project.demo && (
        <a href={project.demo} target="_blank" rel="noopener noreferrer" className={cn(btn.primary, compact && "py-3")}>
          <RollingText>Visit site</RollingText>
          <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      )}
      {project.code && (
        <a href={project.code} target="_blank" rel="noopener noreferrer" className={cn(btn.ghost, compact && "py-3")}>
          <GitHubIcon className="size-4" />
          <RollingText>Source</RollingText>
        </a>
      )}
    </div>
  );
}

function ProjectInfo({ project, index, total, compact }: { project: Project; index: number; total: number; compact?: boolean }) {
  const host = hostOf(project.demo || project.code);
  return (
    <div className="flex h-full flex-col">
      <div className="label-mono flex items-center justify-between gap-4 text-muted">
        <span>
          <span className="text-accent-ink">{pad2(index + 1)}</span> / {pad2(total)}
        </span>
        {host && <span className="truncate normal-case tracking-[0.08em]">{host}</span>}
      </div>

      <RevealText
        as="h3"
        text={project.title}
        by="char"
        stagger={0.035}
        className={cn(
          "font-semibold leading-[0.92] tracking-[-0.045em]",
          compact ? "mt-6 text-[clamp(2.5rem,min(4.4vw,8svh),4.5rem)]" : "mt-8 text-[clamp(2.5rem,6vw,4.5rem)] md:mt-10",
        )}
      />
      {project.subtitle && (
        <p className={cn("mt-3 font-serif italic leading-tight text-accent-ink", compact ? "text-[1.5rem]" : "text-[1.65rem]")}>
          {project.subtitle}
        </p>
      )}
      <p className={cn("text-pretty leading-relaxed text-muted", compact ? "mt-4 text-[15px]" : "mt-6")}>{project.description}</p>
      {project.highlights?.length ? (
        <ul data-optional="1" className={cn(compact ? "mt-4 space-y-2" : "mt-5 space-y-3")}>
          {project.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-3 text-pretty text-sm leading-relaxed text-muted">
              <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-accent-ink" />
              {highlight}
            </li>
          ))}
        </ul>
      ) : null}

      <div className={cn(compact ? "mt-auto pt-6" : "mt-8")}>
        <ul data-optional="2" className="flex flex-wrap gap-2" aria-label="Built with">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted transition-colors duration-300 hover:border-accent-ink hover:text-accent-ink"
            >
              {tag}
            </li>
          ))}
        </ul>
        <div className={cn(compact ? "mt-5" : "mt-6")}>
          <ProjectLinks project={project} compact={compact} />
        </div>
      </div>
    </div>
  );
}

/** Opens the screenshot in a new tab; hidden from assistive tech because the buttons already do this. */
function MediaLink({ project, className, style, children }: { project: Project; className: string; style?: CSSProperties; children: React.ReactNode }) {
  const href = project.demo || project.code;
  if (!href) return <div className={className} style={style}>{children}</div>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden data-cursor="Visit" className={className} style={style}>
      {children}
    </a>
  );
}

function MoreOnGitHub({ className }: { className?: string }) {
  const github = portfolio.socials.github;
  if (!github) return null;
  return (
    <Magnetic strength={0.25} className={className}>
      <a
        href={github}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative grid size-44 place-items-center rounded-full border border-line-strong text-center transition-colors duration-500 hover:border-transparent md:size-52"
      >
        <span
          aria-hidden
          className="absolute inset-0 scale-0 rounded-full bg-accent transition-transform duration-700 ease-expo group-hover:scale-100 group-focus-visible:scale-100"
        />
        <span className="relative flex flex-col items-center gap-3 transition-colors duration-500 group-hover:text-accent-fg">
          <GitHubIcon className="size-6" />
          <span className="text-sm font-medium leading-tight">
            More on
            <br />
            GitHub
          </span>
          <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
        </span>
      </a>
    </Magnetic>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Wide screens: pinned sideways gallery                                                          */
/* ---------------------------------------------------------------------------------------------- */

interface Metrics {
  distance: number;
  viewport: number;
  lefts: number[];
  widths: number[];
}

function Gallery({ section }: { section: RefObject<HTMLElement | null> }) {
  const projects = portfolio.projects;
  const { scrollTo, goToSection } = useScrollControls();
  const track = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  // Read by the motion transforms, so they always see fresh layout without re-subscribing.
  const metrics = useRef<Metrics>({ distance: 0, viewport: 1, lefts: [], widths: [] });
  const [, setMeasured] = useState(0);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (p) => -p * metrics.current.distance);

  useEffect(() => {
    const element = section.current;
    const measure = () => {
      const strip = track.current;
      if (!strip || !element) return;
      const viewport = window.innerWidth;
      const distance = Math.max(0, strip.scrollWidth - viewport);
      metrics.current = {
        distance,
        viewport,
        lefts: panels.current.map((panel) => panel?.offsetLeft ?? 0),
        widths: panels.current.map((panel) => panel?.offsetWidth ?? 0),
      };
      // The section is as tall as the sideways distance, plus one screen to pin within.
      element.style.height = `${window.innerHeight + distance}px`;
      setMeasured((n) => n + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (track.current) observer.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      if (element) element.style.height = "";
    };
  }, [section]);

  // Which project is closest to the middle of the screen.
  useMotionValueEvent(x, "change", (value) => {
    const { lefts, widths, viewport } = metrics.current;
    let best = 0;
    let bestDistance = Infinity;
    projects.forEach((_, i) => {
      const slot = i + 1; // panel 0 is the intro
      const center = (lefts[slot] ?? 0) + (widths[slot] ?? 0) / 2 + value;
      const distance = Math.abs(center - viewport / 2);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    setActive(best);
  });

  // Keyboard users tabbing into an off-screen panel: scroll until it is centred.
  const reveal = (slot: number) => {
    const element = section.current;
    const { lefts, widths, viewport, distance } = metrics.current;
    if (!element || distance <= 0) return;
    const center = lefts[slot] + widths[slot] / 2 + x.get();
    if (Math.abs(center - viewport / 2) < viewport * 0.2) return;
    const progress = Math.min(1, Math.max(0, (lefts[slot] + widths[slot] / 2 - viewport / 2) / distance));
    const top = element.getBoundingClientRect().top + window.scrollY;
    scrollTo(top + progress * distance);
  };

  const setPanel = (slot: number) => (node: HTMLElement | null) => {
    panels.current[slot] = node;
  };

  return (
    <div className="sticky top-0 flex h-svh flex-col overflow-clip">
      <div className="container-page flex items-center gap-6 pt-24">
        <SectionLabel index="03">Selected work</SectionLabel>
        <div aria-hidden className="relative h-px flex-1 bg-line">
          <motion.span style={{ scaleX: scrollYProgress }} className="absolute inset-0 origin-left bg-accent-ink" />
        </div>
        <p className="label-mono flex items-center gap-1.5 tabular-nums text-muted" aria-hidden>
          <span className="relative inline-grid overflow-hidden text-fg">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={active}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
              >
                {pad2(active + 1)}
              </motion.span>
            </AnimatePresence>
          </span>
          / {pad2(projects.length)}
        </p>
      </div>

      <motion.div
        ref={track}
        style={{ x }}
        className="relative flex flex-1 items-center gap-[4vw] pl-[max(1.25rem,calc((100vw-90rem)/2+3rem))] pr-[8vw]"
      >
        <div ref={setPanel(0)} className="flex w-[min(34vw,32rem)] shrink-0 flex-col" onFocusCapture={() => reveal(0)}>
          <RevealText
            as="h2"
            text={TITLE}
            className="text-[clamp(3.5rem,6.4vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.045em]"
          />
          {portfolio.intros.work && (
            <FadeUp delay={0.2} className="mt-8 max-w-sm text-pretty leading-relaxed text-muted">
              {portfolio.intros.work}
            </FadeUp>
          )}
          <FadeUp delay={0.3} className="label-mono mt-10 flex items-center gap-3 text-muted">
            Keep scrolling
            <motion.span
              aria-hidden
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="grid size-9 place-items-center rounded-full border border-line"
            >
              <ArrowRight className="size-4" />
            </motion.span>
          </FadeUp>
        </div>

        {projects.map((project, i) => (
          <GalleryPanel
            key={project.title}
            ref={setPanel(i + 1)}
            slot={i + 1}
            project={project}
            index={i}
            total={projects.length}
            x={x}
            metrics={metrics}
            onFocus={() => reveal(i + 1)}
          />
        ))}

        <div
          ref={setPanel(projects.length + 1)}
          className="flex w-[min(30vw,26rem)] shrink-0 flex-col items-start gap-8"
          onFocusCapture={() => reveal(projects.length + 1)}
        >
          <p className="text-[clamp(2rem,3.4vw,3.25rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
            That’s the highlight reel.
            <span className="mt-2 block font-serif font-normal italic text-accent-ink">There’s more.</span>
          </p>
          <MoreOnGitHub />
          <a
            href="#contact"
            onClick={(event) => {
              event.preventDefault();
              goToSection("contact");
            }}
            className="group label-mono inline-flex items-center gap-2 text-muted transition-colors hover:text-fg"
          >
            <RollingText>Or say hello</RollingText>
            <ArrowRight className="size-3.5 transition-transform duration-500 ease-expo group-hover:translate-x-1" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}

function GalleryPanel({
  ref,
  slot,
  project,
  index,
  total,
  x,
  metrics,
  onFocus,
}: {
  ref: (node: HTMLElement | null) => void;
  slot: number;
  project: Project;
  index: number;
  total: number;
  x: MotionValue<number>;
  metrics: RefObject<Metrics>;
  onFocus: () => void;
}) {
  // -1 … 1: how far this panel's centre is from the screen's centre, in screen widths.
  const offset = useTransform(x, (value) => {
    const { lefts, widths, viewport } = metrics.current;
    const center = (lefts[slot] ?? 0) + (widths[slot] ?? 0) / 2 + value;
    return Math.max(-1.5, Math.min(1.5, (center - viewport / 2) / viewport));
  });
  const scale = useTransform(offset, (d) => 1 - Math.min(1, Math.abs(d)) * 0.1);
  const rotateY = useTransform(offset, (d) => d * -14);
  const shotX = useTransform(offset, (d) => `${d * -10}%`);
  const numberX = useTransform(offset, (d) => `${d * 60}%`);
  const textOpacity = useTransform(offset, (d) => 1 - Math.min(1, Math.abs(d) * 1.4) * 0.65);
  const glow = { "--glow-x": GLOW_POSITIONS[index % GLOW_POSITIONS.length] } as CSSProperties;
  const info = useRef<HTMLDivElement>(null);

  // Panel height follows the screen, so on shorter screens drop details (highlights,
  // then tags) until the copy fits. They stay available to screen readers.
  useEffect(() => {
    const column = info.current;
    if (!column) return;
    const fit = () => {
      const optional = [...column.querySelectorAll<HTMLElement>("[data-optional]")].sort(
        (a, b) => Number(a.dataset.optional) - Number(b.dataset.optional),
      );
      optional.forEach((node) => node.classList.remove("sr-only"));
      for (const node of optional) {
        if (column.scrollHeight <= column.clientHeight + 1) break;
        node.classList.add("sr-only");
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(column);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => observer.disconnect();
  }, []);

  return (
    <motion.article
      ref={ref}
      onFocusCapture={onFocus}
      aria-label={`${project.title}, project ${index + 1} of ${total}`}
      style={{ scale, rotateY, transformPerspective: 1800 }}
      className="relative flex h-[min(72svh,46rem)] w-[min(84vw,80rem)] shrink-0 overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-float"
    >
      <motion.div ref={info} style={{ opacity: textOpacity }} className="relative z-[1] w-[47%] shrink-0 p-8 xl:w-[43%] xl:p-10">
        <ProjectInfo project={project} index={index} total={total} compact />
      </motion.div>

      <MediaLink
        project={project}
        className="group/media relative m-3 ml-0 flex flex-1 items-center justify-center overflow-hidden rounded-[1.35rem] bg-surface-2 p-10 xl:p-14"
      >
        <span aria-hidden className="media-glow pointer-events-none absolute inset-0" style={glow} />
        <motion.span
          aria-hidden
          style={{ x: numberX }}
          className="text-outline pointer-events-none absolute -bottom-[0.18em] right-[0.04em] select-none text-[clamp(10rem,22vw,20rem)] font-semibold leading-none tracking-[-0.06em] [--outline:var(--line-strong)]"
        >
          {pad2(index + 1)}
        </motion.span>
        <motion.div style={{ x: shotX }} className="relative w-full">
          <Tilt max={6}>
            <BrowserShot
              project={project}
              className="transition-transform duration-700 ease-expo group-hover/media:scale-[1.02]"
            />
          </Tilt>
        </motion.div>
      </MediaLink>
    </motion.article>
  );
}

/* ---------------------------------------------------------------------------------------------- */
/* Smaller screens: stacked cards                                                                 */
/* ---------------------------------------------------------------------------------------------- */

function Stack() {
  const projects = portfolio.projects;
  return (
    <div className="container-page py-20 md:py-28">
      <SectionHeading index="03" label="Selected work" title={TITLE}>
        {portfolio.intros.work}
      </SectionHeading>
      <div className="mt-14 space-y-6 md:mt-20 md:space-y-8">
        {projects.map((project, i) => (
          <StackCard key={project.title} project={project} index={i} total={projects.length} />
        ))}
      </div>
      <FadeUp className="mt-16 flex justify-center md:mt-20">
        <MoreOnGitHub />
      </FadeUp>
    </div>
  );
}

function StackCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useMediaQuery(REDUCED_MOTION);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const shotY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const glow = { "--glow-x": GLOW_POSITIONS[index % GLOW_POSITIONS.length] } as CSSProperties;

  return (
    <motion.article
      ref={ref}
      data-reveal
      initial={{ opacity: 0, y: 70, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, ease: EASE_OUT }}
      style={{ transformPerspective: 1600 }}
      className="relative flex flex-col overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-float lg:flex-row"
    >
      <div className="relative p-6 sm:p-8 md:p-10 lg:w-[44%] lg:shrink-0">
        <ProjectInfo project={project} index={index} total={total} />
      </div>
      <MediaLink
        project={project}
        className="group/media relative order-first m-2 flex items-center justify-center overflow-hidden rounded-[1.35rem] bg-surface-2 p-5 sm:m-3 sm:p-8 md:p-12 lg:order-none lg:ml-0 lg:flex-1"
      >
        <span aria-hidden className="media-glow pointer-events-none absolute inset-0" style={glow} />
        <motion.div style={reduced ? undefined : { y: shotY }} className="relative w-full">
          <Tilt max={5}>
            <BrowserShot
              project={project}
              className="transition-transform duration-700 ease-expo group-hover/media:scale-[1.02]"
            />
          </Tilt>
        </motion.div>
      </MediaLink>
    </motion.article>
  );
}
