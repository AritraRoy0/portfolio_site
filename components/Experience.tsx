"use client";

import { ArrowUpRight, MapPin } from "lucide-react";
import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { portfolio, type Job } from "@/data/portfolio";
import { REDUCED_MOTION, useMediaQuery } from "@/lib/hooks";
import { EASE_OUT, splitMetrics } from "@/lib/utils";
import { btn } from "./ui/buttons";
import { FadeUp } from "./ui/FadeUp";
import { RevealText } from "./ui/RevealText";
import { RollingText } from "./ui/RollingText";
import { SectionHeading } from "./ui/SectionHeading";

interface CompanyGroup {
  company: string;
  location?: string;
  roles: Job[];
}

function groupByCompany(jobs: Job[]): CompanyGroup[] {
  const groups: CompanyGroup[] = [];
  for (const job of jobs) {
    const existing = groups.find((group) => group.company === job.company);
    if (existing) existing.roles.push(job);
    else groups.push({ company: job.company, location: job.location, roles: [job] });
  }
  return groups;
}

const splitPeriod = (period?: string) => (period ?? "").split(/\s+[–—-]\s+/);

/** "Sep 2023 – Sep 2024" + "Sep 2024 – Aug 2025" becomes "Sep 2023 – Aug 2025". */
function overallPeriod(roles: Job[]) {
  if (roles.length === 1) return roles[0].period ?? "";
  const start = splitPeriod(roles[roles.length - 1].period)[0];
  const newest = splitPeriod(roles[0].period);
  const end = newest[1] ?? newest[0];
  return start && end ? `${start} – ${end}` : (roles[0].period ?? "");
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Sep 2023" → months since year 0; "Present" → now. Null if it can't be read. */
function monthIndex(text: string) {
  if (/present|now|current/i.test(text)) {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth();
  }
  const match = text.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/i);
  if (!match) return null;
  const month = MONTHS.indexOf(match[1].toLowerCase());
  return month < 0 ? null : Number(match[2]) * 12 + month;
}

/** "Sep 2023 – Aug 2025" → "2 yrs". Empty when the dates can't be read. */
function tenure(period: string) {
  const [from, to] = splitPeriod(period);
  const start = from ? monthIndex(from) : null;
  const end = to ? monthIndex(to) : null;
  if (start === null || end === null || end < start) return "";
  const months = end - start + 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [years && `${years} yr${years > 1 ? "s" : ""}`, rest && `${rest} mo${rest > 1 ? "s" : ""}`].filter(Boolean);
  return parts.join(" ");
}

function Metrics({ text }: { text: string }) {
  return (
    <>
      {splitMetrics(text).map((chunk, i) =>
        chunk.metric ? (
          <span key={i} className="metric">
            {chunk.text}
          </span>
        ) : (
          chunk.text
        ),
      )}
    </>
  );
}

function Role({ role, offsetClass }: { role: Job; offsetClass: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const reduced = useMediaQuery(REDUCED_MOTION);
  // Highlights sweep in once the role has been scrolled into reading position.
  const lit = useInView(ref, { once: true, margin: "0px 0px -30% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "start 0.4"] });
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const [title, ...detail] = role.role.split(", ");

  return (
    <motion.li
      ref={ref}
      data-lit={lit}
      data-reveal
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      transition={{ duration: 1, ease: EASE_OUT }}
      className="relative"
    >
      <span
        aria-hidden
        className={`absolute top-1.5 grid size-4 -translate-x-1/2 place-items-center rounded-full border-2 border-accent-ink bg-bg ${offsetClass}`}
      >
        <motion.span style={{ scale: reduced ? 1 : fill }} className="size-1.5 rounded-full bg-accent-ink" />
      </span>
      <div className="rounded-[1.25rem] transition-colors duration-500 md:-m-6 md:p-6 md:hover:bg-surface">
        {role.period && <p className="label-mono text-muted">{role.period}</p>}
        <h4 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-[-0.03em] md:text-[2rem]">
          {title}
        </h4>
        {detail.length > 0 && (
          <p className="mt-1 font-serif text-xl italic text-accent-ink md:text-2xl">{detail.join(", ")}</p>
        )}
        <ul className="mt-6 space-y-4">
          {role.points.map((point) => (
            <li key={point} className="flex gap-4 text-pretty leading-relaxed text-muted md:text-[1.0625rem]">
              <span aria-hidden className="mt-[0.8em] h-px w-5 shrink-0 bg-accent-ink" />
              <span>
                <Metrics text={point} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.li>
  );
}

/** Vertical line that fills with the accent colour as you read down the roles. */
function Timeline({ roles }: { roles: Job[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery(REDUCED_MOTION);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.55"] });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="relative pl-8 md:pl-14">
      <span aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-line" />
      <motion.span
        aria-hidden
        style={{ scaleY: reduced ? 1 : fill }}
        className="absolute bottom-2 left-0 top-2 w-[2px] -translate-x-[0.5px] origin-top bg-accent-ink"
      />
      <ol className="space-y-16 md:space-y-20">
        {roles.map((role) => (
          <Role key={role.role} role={role} offsetClass="-left-8 md:-left-14" />
        ))}
      </ol>
    </div>
  );
}

function CompanyBlock({ group }: { group: CompanyGroup }) {
  const period = overallPeriod(group.roles);
  const length = tenure(period);

  return (
    <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-12 md:pt-14">
      <div className="md:col-span-4">
        <div className="md:sticky md:top-28">
          {period && <p className="label-mono text-muted">{period}</p>}
          <RevealText
            as="h3"
            text={group.company}
            className="mt-4 text-[clamp(2.1rem,3.6vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
          />
          {group.location && (
            <p className="mt-4 flex items-center gap-2 text-muted">
              <MapPin className="size-4" />
              {group.location}
            </p>
          )}
          {(group.roles.length > 1 || length) && (
            <div className="label-mono mt-6 flex flex-wrap gap-2 text-[10.5px] text-muted">
              {group.roles.length > 1 && (
                <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5">
                  <span aria-hidden className="size-1.5 rounded-full bg-accent-ink" />
                  {group.roles.length} roles
                </span>
              )}
              {length && <span className="rounded-full border border-line px-3 py-1.5">{length}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="md:col-span-8">
        <Timeline roles={group.roles} />
      </div>
    </div>
  );
}

export function Experience() {
  const work = groupByCompany(portfolio.experience);
  const leadership = groupByCompany(portfolio.leadership);

  return (
    <section id="experience" tabIndex={-1} className="container-page pb-12 pt-20 md:pb-16 md:pt-28">
      <SectionHeading index="02" label="Experience" title="Where I’ve *worked*">
        {portfolio.intros.experience}
      </SectionHeading>

      <div className="mt-16 space-y-16 md:mt-24 md:space-y-24">
        {work.map((group) => (
          <CompanyBlock key={group.company} group={group} />
        ))}
      </div>

      {leadership.length > 0 && (
        <div className="mt-24 md:mt-32">
          <p className="label-mono mb-8 flex items-center gap-3 text-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-accent-ink" />
            Leadership
          </p>
          <div className="space-y-16">
            {leadership.map((group) => (
              <CompanyBlock key={group.company} group={group} />
            ))}
          </div>
        </div>
      )}

      {portfolio.resume && (
        <FadeUp className="mt-20 flex flex-col items-start justify-between gap-6 rounded-[1.75rem] border border-line bg-surface p-6 md:mt-28 md:flex-row md:items-center md:p-8">
          <p className="text-balance text-xl font-medium tracking-[-0.02em] md:text-2xl">
            Want the full picture? <span className="text-muted">It’s all in my résumé.</span>
          </p>
          <a href={portfolio.resume} target="_blank" rel="noopener noreferrer" className={btn.primary}>
            <RollingText>Open résumé</RollingText>
            <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </FadeUp>
      )}
    </section>
  );
}
