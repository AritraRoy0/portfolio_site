"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Fragment, useRef, type ReactNode } from "react";
import { portfolio } from "@/data/portfolio";
import { REDUCED_MOTION, useMediaQuery } from "@/lib/hooks";
import { cn, plain, tokenize } from "@/lib/utils";
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
  // Words start faint and light up as you scroll. Screen readers get the full sentence separately.
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span
      style={{ opacity: still ? 1 : opacity }}
      className={cn(accent && "font-serif font-normal italic tracking-[-0.01em] text-accent-ink")}
    >
      {children}
    </motion.span>
  );
}

/** A statement whose words light up one after another as it scrolls through the screen. */
function ScrollStatement({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useMediaQuery(REDUCED_MOTION);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const groups = tokenize(text);
  const total = groups.reduce((count, group) => count + group.length, 0);
  let index = 0;

  return (
    <p
      ref={ref}
      className="max-w-[22ch] text-[clamp(2.1rem,5.4vw,5.25rem)] font-medium leading-[1.04] tracking-[-0.04em] md:max-w-[20ch]"
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
  const { statement, about, stats, education } = portfolio;

  return (
    <section id="about" tabIndex={-1} className="container-page py-24 md:py-32">
      <SectionLabel index="01">About</SectionLabel>
      <div className="mt-10 md:mt-14">
        <ScrollStatement text={statement} />
      </div>

      <div className="mt-20 grid gap-14 md:mt-32 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <div className="space-y-6">
            {about.map((paragraph, i) => (
              <FadeUp key={paragraph} delay={i * 0.08}>
                <p className="text-pretty text-lg leading-relaxed text-muted">{paragraph}</p>
              </FadeUp>
            ))}
          </div>

          {education.length > 0 && (
            <FadeUp delay={0.15} className="mt-10 rounded-[1.5rem] border border-line bg-surface p-6 md:p-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Education</p>
              <ul className="mt-5 space-y-5">
                {education.map((item) => (
                  <li key={item.school} className="flex items-end justify-between gap-6">
                    <div>
                      <p className="text-xl font-semibold tracking-[-0.02em]">{item.school}</p>
                      <p className="mt-1 text-muted">{item.degree}</p>
                    </div>
                    <p className="font-serif text-4xl italic leading-none text-accent-ink">
                      <span className="sr-only">Class of {item.year}</span>
                      <span aria-hidden>’{item.year.slice(-2)}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </FadeUp>
          )}
        </div>

        {stats.length > 0 && (
          <dl className="grid grid-cols-2 self-start overflow-hidden rounded-[1.75rem] border border-line md:col-span-6 md:col-start-7">
            {stats.map((stat, i) => (
              <FadeUp
                key={stat.label}
                delay={(i % 2) * 0.1}
                className={cn(
                  "flex min-h-44 flex-col justify-between gap-8 p-5 sm:p-7 md:min-h-56 md:p-8",
                  i % 2 === 0 && "border-r border-line",
                  i < stats.length - 2 && "border-b border-line",
                )}
              >
                <dt className="order-2 max-w-[16rem] text-pretty text-sm leading-snug text-muted">{stat.label}</dt>
                <dd className="order-1 text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-none tracking-[-0.055em]">
                  <span className="sr-only">
                    {stat.value.toLocaleString("en-US")}
                    {stat.suffix}
                  </span>
                  <CountUp value={stat.value} />
                  <span aria-hidden className="text-accent">
                    {stat.suffix}
                  </span>
                </dd>
              </FadeUp>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
