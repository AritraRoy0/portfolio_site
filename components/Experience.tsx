"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { portfolio, type Job } from "@/data/portfolio";
import { REDUCED_MOTION, useMediaQuery } from "@/lib/hooks";
import { EASE_OUT } from "@/lib/utils";
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

/** "Sep 2023 – Sep 2024" + "Sep 2024 – Aug 2025" becomes "Sep 2023 – Aug 2025". */
function overallPeriod(roles: Job[]) {
  if (roles.length === 1) return roles[0].period ?? "";
  const split = (period?: string) => (period ?? "").split(/\s+[–—-]\s+/);
  const start = split(roles[roles.length - 1].period)[0];
  const newest = split(roles[0].period);
  const end = newest[1] ?? newest[0];
  return start && end ? `${start} – ${end}` : (roles[0].period ?? "");
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
        className="absolute bottom-2 left-0 top-2 w-[2px] -translate-x-[0.5px] origin-top bg-accent"
      />
      <ol className="space-y-16 md:space-y-20">
        {roles.map((role) => {
          const [title, ...detail] = role.role.split(", ");
          return (
            <motion.li
              key={role.role}
              data-reveal
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -15% 0px" }}
              transition={{ duration: 1, ease: EASE_OUT }}
              className="relative"
            >
              <span
                aria-hidden
                className="absolute -left-8 top-1 size-3 -translate-x-1/2 rounded-full border-2 border-accent bg-bg md:-left-14"
              />
              {role.period && (
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{role.period}</p>
              )}
              <h4 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-[-0.03em] md:text-[2rem]">
                {title}
              </h4>
              {detail.length > 0 && (
                <p className="mt-1 font-serif text-xl italic text-accent-ink md:text-2xl">{detail.join(", ")}</p>
              )}
              <ul className="mt-6 space-y-4">
                {role.points.map((point) => (
                  <li key={point} className="flex gap-4 text-pretty leading-relaxed text-muted md:text-[1.0625rem]">
                    <span aria-hidden className="mt-[0.8em] h-px w-5 shrink-0 bg-accent" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function CompanyBlock({ group }: { group: CompanyGroup }) {
  return (
    <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-12 md:pt-14">
      <div className="md:col-span-4">
        <div className="md:sticky md:top-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{overallPeriod(group.roles)}</p>
          <h3 className="mt-4 text-[clamp(2.1rem,3.6vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
            {group.company}
          </h3>
          {group.location && <p className="mt-3 text-muted">{group.location}</p>}
          {group.roles.length > 1 && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {group.roles.length} roles
            </p>
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
    <section id="experience" tabIndex={-1} className="container-page py-24 md:py-32">
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
          <p className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-accent" />
            Leadership
          </p>
          <div className="space-y-16">
            {leadership.map((group) => (
              <CompanyBlock key={group.company} group={group} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
