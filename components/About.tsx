"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Fragment, useRef, type ReactNode } from "react";
import { portfolio } from "@/data/portfolio";
import { REDUCED_MOTION, useMediaQuery } from "@/lib/hooks";
import { cn, EASE_OUT, pad2, plain, tokenize } from "@/lib/utils";
import { Badge } from "./Badge";
import { CountUp } from "./ui/CountUp";
import { FadeUp } from "./ui/FadeUp";
import { SectionLabel } from "./ui/SectionHeading";

function ScrollWord({
  children,
  progress,
  range,
  accent,
  still,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
  accent: boolean;
  still: boolean;
}) {
  // Words start faint and slightly lowered, then light up as you scroll. Screen readers get the full sentence separately.
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, ["0.12em", "0em"]);
  return (
    <motion.span
      data-reveal
      style={still ? undefined : { opacity, y }}
      className={cn("inline-block", accent && "font-serif font-normal italic tracking-[-0.01em] text-accent-ink")}
    >
      {children}
    </motion.span>
  );
}

/** A statement whose words light up one after another as it scrolls through the screen. */
function ScrollStatement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useMediaQuery(REDUCED_MOTION);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const groups = tokenize(text);
  const total = groups.reduce((count, group) => count + group.length, 0);
  let index = 0;

  return (
    <p
      ref={ref}
      className="max-w-[21ch] text-[clamp(2.1rem,4.7vw,4.6rem)] font-medium leading-[1.05] tracking-[-0.04em]"
    >
      <span className="sr-only">{plain(text)}</span>
      <span aria-hidden>
        {groups.map((group, g) => (
          <Fragment key={g}>
            <span className="whitespace-nowrap">
              {group.map((token, t) => {
                const start = index / total;
                index += 1;
                return (
                  <ScrollWord
                    key={t}
                    progress={scrollYProgress}
                    range={[start, index / total]}
                    accent={token.accent}
                    still={reduced}
                  >
                    {token.text}
                  </ScrollWord>
                );
              })}
            </span>
            {g < groups.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </p>
  );
}

export function About() {
  const { statement, about, stats, currently } = portfolio;

  return (
    <section id="about" tabIndex={-1} className="container-page pb-10 pt-20 md:pb-16 md:pt-24">
      <motion.div
        aria-hidden
        className="mb-8 h-px origin-left bg-line md:mb-10"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: EASE_OUT }}
      />
      <SectionLabel index="01">About</SectionLabel>

      <div className="mt-10 grid gap-16 md:mt-14 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-8">
          <ScrollStatement text={statement} />

          <div className="mt-14 grid gap-8 md:mt-20 md:grid-cols-2">
            {about.map((paragraph, i) => (
              <FadeUp key={paragraph} delay={i * 0.1}>
                <p aria-hidden className="label-mono mb-4 flex items-center gap-3 text-accent-ink">
                  {pad2(i + 1)}
                  <span className="h-px w-6 bg-line-strong" />
                </p>
                <p className="text-pretty text-lg leading-relaxed text-muted">{paragraph}</p>
              </FadeUp>
            ))}
          </div>

          {currently && (
            <FadeUp delay={0.15} className="mt-10">
              <p className="inline-flex max-w-full items-center gap-3 rounded-full border border-line bg-surface py-2 pl-2 pr-5 text-sm">
                <span className="label-mono shrink-0 rounded-full bg-accent px-3 py-1.5 text-[10px] text-accent-fg">Now</span>
                <span className="min-w-0 truncate">{currently}</span>
                <span className="ping-dot size-1.5 shrink-0 text-accent-ink" />
              </p>
            </FadeUp>
          )}
        </div>

        <div className="lg:col-span-4">
          <FadeUp distance={60} className="lg:sticky lg:top-20">
            <Badge />
          </FadeUp>
        </div>
      </div>

      {stats.length > 0 && (
        <dl className="mt-20 grid grid-cols-2 border-y border-line md:mt-28 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <FadeUp
              key={stat.label}
              delay={(i % 4) * 0.08}
              className={cn(
                "group relative flex min-h-48 flex-col justify-between gap-8 p-5 transition-colors duration-500 hover:bg-surface sm:p-7 md:min-h-56",
                i % 2 === 0 && "border-r border-line",
                i < 2 && "border-b border-line lg:border-b-0",
                i < stats.length - 1 && "lg:border-r",
              )}
            >
              <motion.span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[2px] origin-left bg-accent-ink"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASE_OUT, delay: 0.2 + i * 0.12 }}
              />
              <span aria-hidden className="label-mono absolute right-5 top-5 text-[10px] text-muted sm:right-7 sm:top-7">
                /{pad2(i + 1)}
              </span>
              <dt className="order-2 max-w-[15rem] text-pretty text-sm leading-snug text-muted">{stat.label}</dt>
              <dd className="order-1 text-[clamp(2.75rem,5.5vw,4.75rem)] font-semibold leading-none tracking-[-0.055em] transition-transform duration-700 ease-expo group-hover:translate-x-1.5">
                <span className="sr-only">
                  {stat.value.toLocaleString("en-US")}
                  {stat.suffix}
                </span>
                <CountUp value={stat.value} />
                <span aria-hidden className="text-accent-ink">
                  {stat.suffix}
                </span>
              </dd>
            </FadeUp>
          ))}
        </dl>
      )}
    </section>
  );
}
