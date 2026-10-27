"use client";

import { ArrowDown, ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, type MouseEvent } from "react";
import { portfolio } from "@/data/portfolio";
import { REDUCED_MOTION, useLocalTime, useMediaQuery } from "@/lib/hooks";
import { EASE_OUT } from "@/lib/utils";
import { DotField } from "./DotField";
import { useIntro, useScrollControls } from "./Providers";
import { RotatingWords } from "./RotatingWords";
import { btn } from "./ui/buttons";
import { Magnetic } from "./ui/Magnetic";
import { RevealText } from "./ui/RevealText";
import { RollingText } from "./ui/RollingText";

/**
 * Full-screen intro. It stays pinned while the rest of the page slides over it
 * like a curtain; on the way, the name drifts apart and the hero recedes.
 */
export function Hero() {
  const { introDone } = useIntro();
  const { scrollTo } = useScrollControls();
  const reduced = useMediaQuery(REDUCED_MOTION);
  const time = useLocalTime(portfolio.timezone);
  const viewport = useRef(800);

  useEffect(() => {
    const update = () => (viewport.current = window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, (y) => Math.min(Math.max(y / viewport.current, 0), 1));
  const scale = useTransform(progress, [0, 1], [1, 0.9]);
  const lift = useTransform(progress, [0, 1], ["0%", "-5%"]);
  const dim = useTransform(progress, [0, 1], [0, 0.6]);
  const firstX = useTransform(progress, [0, 1], ["0vw", "-12vw"]);
  const lastX = useTransform(progress, [0, 1], ["0vw", "10vw"]);

  const [first, ...rest] = portfolio.name.split(" ");
  const last = rest.join(" ");

  const appear = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: introDone ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1.1, ease: EASE_OUT, delay },
  });

  const toWork = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollTo("#work");
  };

  return (
    <section id="top" aria-label="Introduction" className="sticky top-0 h-svh min-h-[34rem] overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={introDone ? { opacity: 1 } : undefined}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
      >
        <div className="hero-glow absolute -right-[18%] -top-[35%] size-[80vmax] rounded-full" />
        <DotField
          active={introDone}
          className="absolute inset-0 size-full [mask-image:radial-gradient(ellipse_80%_75%_at_65%_35%,#000_30%,transparent_80%)]"
        />
      </motion.div>

      <motion.div
        style={reduced ? undefined : { scale, y: lift }}
        className="container-page relative z-10 flex h-full origin-top flex-col pb-5 pt-24 md:pb-7 md:pt-28"
      >
        <div className="flex items-start justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          {portfolio.availability ? (
            <motion.p data-reveal {...appear(0.55)} className="flex items-center gap-2.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              {portfolio.availability}
            </motion.p>
          ) : (
            <span />
          )}
          <motion.p data-reveal {...appear(0.65)} className="hidden whitespace-nowrap text-right sm:block">
            Local time
            <span className="mt-1 block">{time ?? " "}</span>
          </motion.p>
        </div>

        <h1 className="mt-auto text-[clamp(4rem,min(16vw,25svh),15rem)] font-semibold leading-[0.84] tracking-[-0.055em]">
          <span className="sr-only">{portfolio.name}</span>
          <motion.span aria-hidden className="block" style={reduced ? undefined : { x: firstX }}>
            <RevealText text={first} by="char" trigger={introDone} delay={0.15} maskClassName="pb-[0.2em] -mb-[0.2em]" />
          </motion.span>
          {last && (
            <motion.span aria-hidden className="block pl-[0.36em]" style={reduced ? undefined : { x: lastX }}>
              <RevealText text={last} by="char" trigger={introDone} delay={0.3} maskClassName="pb-[0.2em] -mb-[0.2em]" />
            </motion.span>
          )}
        </h1>

        <div className="mt-8 grid gap-7 md:mt-10 md:grid-cols-12 md:items-end">
          <motion.p
            data-reveal
            {...appear(0.85)}
            className="text-[clamp(1.4rem,2.6vw,2.4rem)] font-medium leading-[1.12] tracking-[-0.03em] md:col-span-7"
          >
            {portfolio.role}
            <span className="flex flex-wrap items-baseline gap-x-[0.3em]">
              <span className="text-muted">building</span>
              <RotatingWords words={portfolio.focus} />
            </span>
          </motion.p>

          <motion.div data-reveal {...appear(1)} className="flex flex-col gap-6 md:col-span-5 md:items-end">
            <p className="max-w-md text-pretty text-sm leading-relaxed text-muted md:text-right">{portfolio.tagline}</p>
            <div className="flex flex-wrap gap-3">
              <Magnetic>
                <a href="#work" onClick={toWork} className={btn.primary}>
                  <RollingText>View work</RollingText>
                  <ArrowDown className="size-4 transition-transform duration-500 ease-expo group-hover:translate-y-0.5" />
                </a>
              </Magnetic>
              {portfolio.resume && (
                <Magnetic>
                  <a href={portfolio.resume} target="_blank" rel="noopener noreferrer" className={btn.ghost}>
                    <RollingText>Résumé</RollingText>
                    <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </Magnetic>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          data-reveal
          {...appear(1.15)}
          className="mt-8 flex items-center justify-between border-t border-line pt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted md:mt-10"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden className="scroll-cue relative h-6 w-px overflow-hidden bg-line" />
            Scroll to explore
          </span>
          <span>Portfolio © {new Date().getFullYear()}</span>
        </motion.div>
      </motion.div>

      <motion.div
        aria-hidden
        style={{ opacity: reduced ? 0 : dim }}
        className="pointer-events-none absolute inset-0 z-20 bg-[rgb(0_0_0/var(--dim-alpha))]"
      />
    </section>
  );
}
