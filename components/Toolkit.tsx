"use client";

import { portfolio } from "@/data/portfolio";
import { pad2 } from "@/lib/utils";
import { SectionHeading } from "./ui/SectionHeading";
import { SpotlightCard } from "./ui/SpotlightCard";

// Bento layout for the five skill groups on a 6-column grid. Extra groups fall back to half width.
const SPANS = ["md:col-span-3", "md:col-span-3", "md:col-span-4", "md:col-span-2", "md:col-span-6"];

export function Toolkit() {
  return (
    <section id="toolkit" tabIndex={-1} className="container-page pb-28 pt-20 md:pb-40 md:pt-28">
      <SectionHeading index="04" label="Toolkit" title="Tools I *reach for*">
        {portfolio.intros.toolkit}
      </SectionHeading>

      <div className="mt-14 grid gap-3 md:mt-20 md:grid-cols-6 md:gap-4">
        {portfolio.skills.map((group, i) => (
          <SpotlightCard key={group.label} delay={(i % 3) * 0.08} className={SPANS[i] ?? "md:col-span-3"}>
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{group.label}</h3>
                <span aria-hidden className="font-serif text-4xl italic leading-none text-accent-ink">
                  {pad2(i + 1)}
                </span>
              </div>
              <ul className="mt-12 flex flex-wrap gap-2 md:mt-auto md:pt-16">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line bg-bg/60 px-4 py-2 text-[15px] font-medium transition-colors duration-300 hover:border-accent hover:text-accent-ink"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
