"use client";

import { ArrowDown, ArrowUpRight, MousePointer2 } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, type MouseEvent } from "react";
import { portfolio } from "@/data/portfolio";
import { FINE_POINTER, REDUCED_MOTION, useLocalTime, useMediaQuery } from "@/lib/hooks";
import { EASE_OUT } from "@/lib/utils";
import { Globe } from "./Globe";
import { useIntro, useScrollControls } from "./Providers";
import { RotatingWords } from "./RotatingWords";
import { btn } from "./ui/buttons";
import { Magnetic } from "./ui/Magnetic";
import { RevealText } from "./ui/RevealText";
import { RollingText } from "./ui/RollingText";
import { ScrambleText } from "./ui/ScrambleText";

const PARALLAX = { stiffness: 60, damping: 20, mass: 0.8 };
const HOVER_CHAR =
  "inline-block transition-[transform,color] duration-500 ease-expo hover:-translate-y-[0.07em] hover:text-accent-ink";

/**
 * Full-screen intro: the name, what I build, and a live globe of the fleet I
 * monitored. It stays pinned while the rest of the page slides over it like a
 * curtain; on the way, the name drifts apart and the globe swells and spins.
 */
export function Hero() {
  const { introDone } = useIntro();
  const { scrollTo } = useScrollControls();
  const reduced = useMediaQuery(REDUCED_MOTION);
  const fine = useMediaQuery(FINE_POINTER);
  const time = useLocalTime(portfolio.timezone);
  const viewport = useRef(800);

  useEffect(() => {
    const update = () => (viewport.current = window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Scroll: the hero recedes as the page covers it.
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, (y) => Math.min(Math.max(y / viewport.current, 0), 1));
  const scale = useTransform(progress, [0, 1], [1, 0.9]);
  const lift = useTransform(progress, [0, 1], ["0%", "-6%"]);
  const dim = useTransform(progress, [0, 1], [0, 0.65]);
  const firstX = useTransform(progress, [0, 1], ["0vw", "-9vw"]);
  const lastX = useTransform(progress, [0, 1], ["0vw", "7vw"]);
  const globeScale = useTransform(progress, [0, 1], [1, 1.3]);

  // Pointer: the globe and glow drift gently against the mouse.
  const pointerX = useSpring(0, PARALLAX);
  const pointerY = useSpring(0, PARALLAX);
  const globeX = useTransform(pointerX, (v) => v * -26);
  const globeY = useTransform([pointerY, progress], ([v, p]: number[]) => `calc(${v * -18}px - ${p * 8}%)`);
  const glowX = useTransform(pointerX, (v) => v * 60);
  const glowY = useTransform(pointerY, (v) => v * 40);

  useEffect(() => {
    if (!fine || reduced) return;
    const onMove = (event: PointerEvent) => {
      pointerX.set(event.clientX / window.innerWidth - 0.5);
      pointerY.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [fine, reduced, pointerX, pointerY]);

  const [first, ...rest] = portfolio.name.split(" ");
  const last = rest.join(" ");

  const appear = (delay: number) => ({
    initial: { opacity: 0, y: 22, filter: "blur(8px)" },
    animate: introDone ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { duration: 1.1, ease: EASE_OUT, delay },
  });

  const toWork = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollTo("#work");
  };

  return (
    <section id="top" aria-label="Introduction" className="sticky top-0 h-svh min-h-[38rem] overflow-hidden">
      {/* Backdrop: blueprint grid and a drifting glow. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={introDone ? { opacity: 1 } : undefined}
        transition={{ duration: 1.8, ease: "easeOut", delay: 0.1 }}
      >
        <div className="bg-grid absolute inset-0 opacity-80 [mask-image:radial-gradient(ellipse_75%_65%_at_72%_45%,#000_15%,transparent_75%)]" />
        <motion.div style={reduced ? undefined : { x: glowX, y: glowY }} className="absolute -right-[20%] -top-[25%] size-[85vmax]">
          <div className="hero-glow size-full rounded-full" />
        </motion.div>
      </motion.div>

      {/* The globe. Its canvas listens on window, so this layer can ignore the pointer. */}
      <motion.div
        aria-hidden
        style={reduced ? undefined : { scale: globeScale, x: globeX, y: globeY }}
        className="pointer-events-none absolute left-[28%] top-[3%] aspect-square w-[125vw] opacity-80 sm:left-[40%] sm:w-[95vw] md:left-auto md:right-[-13vw] md:top-[calc(50%-min(32vw,59svh))] md:w-[min(64vw,118svh)] md:opacity-100"
      >
        <Globe active={introDone} className="size-full" />
        {portfolio.globeCaption && (
          <motion.p
            {...appear(1.5)}
            className="glass label-mono absolute bottom-[13%] left-[10%] hidden items-center gap-2.5 rounded-full px-3.5 py-2 text-[10px] text-muted lg:flex"
          >
            <span className="ping-dot size-1.5 text-accent-ink" />
            {portfolio.globeCaption}
          </motion.p>
        )}
        {fine && !reduced && (
          <motion.p
            {...appear(1.7)}
            className="label-mono absolute right-[22%] top-[11%] hidden items-center gap-2 text-[10px] text-muted lg:flex"
          >
            <MousePointer2 className="size-3" />
            Drag to spin
          </motion.p>
        )}
      </motion.div>

      <motion.div
        style={reduced ? undefined : { scale, y: lift }}
        className="container-page relative z-10 flex h-full origin-top flex-col pb-5 pt-24 md:pb-6 md:pt-28"
      >
        {portfolio.availability && (
          <motion.p
            data-reveal
            {...appear(0.5)}
            className="glass label-mono flex items-center gap-2.5 self-start rounded-full py-2 pl-3 pr-4 text-[10.5px]"
          >
            <span className="ping-dot size-1.5 text-emerald-500" />
            <ScrambleText text={portfolio.availability} trigger={introDone} delay={0.55} />
          </motion.p>
        )}

        <div className="mt-auto md:max-w-[62%]">
          <h1 className="text-[clamp(3.6rem,min(11.5vw,20svh),12rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
            <span className="sr-only">{portfolio.name}</span>
            <motion.span aria-hidden className="block" style={reduced ? undefined : { x: firstX }}>
              <RevealText
                text={first}
                by="char"
                trigger={introDone}
                delay={0.15}
                maskClassName="pb-[0.2em] -mb-[0.2em]"
                unitClassName={HOVER_CHAR}
              />
            </motion.span>
            {last && (
              <motion.span aria-hidden className="block whitespace-nowrap" style={reduced ? undefined : { x: lastX }}>
                <RevealText
                  text={last}
                  by="char"
                  trigger={introDone}
                  delay={0.3}
                  maskClassName="pb-[0.2em] -mb-[0.2em]"
                  unitClassName={HOVER_CHAR}
                />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={introDone ? { opacity: 1 } : undefined}
                  transition={{ delay: 1.1 }}
                  className="ml-[0.05em] inline-block"
                >
                  <span className="caret inline-block h-[0.7em] w-[0.09em] bg-accent-ink" />
                </motion.span>
              </motion.span>
            )}
          </h1>

          <motion.p
            data-reveal
            {...appear(0.85)}
            className="mt-6 text-[clamp(1.3rem,2.3vw,2.1rem)] font-medium leading-[1.15] tracking-[-0.03em] md:mt-8"
          >
            {portfolio.role}
            <span className="flex flex-wrap items-baseline gap-x-[0.3em]">
              <span className="text-muted">building</span>
              <RotatingWords words={portfolio.focus} />
            </span>
          </motion.p>

          <motion.div data-reveal {...appear(1)} className="mt-5 md:mt-6">
            <p className="max-w-lg text-pretty text-[15px] leading-relaxed text-muted">{portfolio.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
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
          className="label-mono mt-8 grid grid-cols-2 items-center gap-4 border-t border-line pt-4 text-muted md:mt-10 lg:grid-cols-[1fr_auto_1fr]"
        >
          <span className="flex items-center gap-3 whitespace-nowrap">
            <span aria-hidden className="scroll-cue relative h-6 w-px overflow-hidden bg-line" />
            Scroll to explore
          </span>
          {portfolio.currently && (
            <span className="hidden min-w-0 items-center gap-2.5 lg:flex">
              <span className="ping-dot size-1.5 shrink-0 text-accent-ink" />
              <span className="truncate">Now: {portfolio.currently}</span>
            </span>
          )}
          <span className="whitespace-nowrap text-right">
            {time ? (
              <>
                <span className="hidden sm:inline">Local time </span>
                {time}
              </>
            ) : (
              " "
            )}
          </span>
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
