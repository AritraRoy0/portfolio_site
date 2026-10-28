"use client";

import { motion } from "motion/react";
import { portfolio, type SkillGroup } from "@/data/portfolio";
import { cn, EASE_OUT, pad2 } from "@/lib/utils";
import { CodeTyper } from "./toolkit/CodeTyper";
import { GitGraph } from "./toolkit/GitGraph";
import { Orbit } from "./toolkit/Orbit";
import { Pipeline } from "./toolkit/Pipeline";
import { QueryTable } from "./toolkit/QueryTable";
import { SectionHeading } from "./ui/SectionHeading";
import { SpotlightCard } from "./ui/SpotlightCard";

type Visual = "code" | "orbit" | "pipeline" | "query" | "git" | "chips";

/** Each group gets a small live illustration, picked from its label. Unknown labels get plain chips. */
function visualFor(label: string): Visual {
  const text = label.toLowerCase();
  if (text.includes("language")) return "code";
  if (text.includes("framework") || text.includes("librar")) return "orbit";
  if (text.includes("cloud") || text.includes("infra") || text.includes("devops")) return "pipeline";
  if (text.includes("database") || text.includes("data")) return "query";
  if (text.includes("tool") || text.includes("practice")) return "git";
  return "chips";
}

// Bento layout on a 12-column grid, by position. Extra groups fall back to half width.
const SPANS = ["md:col-span-2 lg:col-span-7", "lg:col-span-5", "lg:col-span-5", "lg:col-span-3", "md:col-span-2 lg:col-span-4"];

function Chips({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item, i) => (
        <motion.li
          key={item}
          data-reveal
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 + i * 0.05 }}
          className="rounded-full border border-line bg-bg/60 px-4 py-2 text-[15px] font-medium transition-[border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent-ink hover:text-accent-ink"
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}

function ToolCard({ group, index }: { group: SkillGroup; index: number }) {
  const visual = visualFor(group.label);

  return (
    <SpotlightCard delay={(index % 3) * 0.08} className={SPANS[index] ?? "lg:col-span-6"}>
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="label-mono text-muted">{group.label}</h3>
            <p aria-hidden className="mt-2 font-mono text-[11px] text-muted/70">
              {group.items.length} {group.items.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <span aria-hidden className="font-serif text-4xl italic leading-none text-accent-ink">
            {pad2(index + 1)}
          </span>
        </div>

        {visual !== "chips" && (
          <div className="mt-6 flex-1">
            {visual === "code" && <CodeTyper languages={group.items} />}
            {visual === "orbit" && <Orbit items={group.items} />}
            {visual === "pipeline" && <Pipeline />}
            {visual === "query" && <QueryTable items={group.items} />}
            {visual === "git" && (
              <div className="flex h-full items-center rounded-2xl border border-line bg-bg/60 px-4 py-5">
                <GitGraph />
              </div>
            )}
          </div>
        )}

        {(visual === "pipeline" || visual === "git" || visual === "chips") && (
          <Chips items={group.items} className={visual === "chips" ? "mt-auto pt-12" : "mt-6"} />
        )}
      </div>
    </SpotlightCard>
  );
}

export function Toolkit() {
  return (
    <section id="toolkit" tabIndex={-1} className="container-page pb-28 pt-20 md:pb-40 md:pt-28">
      <SectionHeading index="04" label="Toolkit" title="Tools I *reach for*">
        {portfolio.intros.toolkit}
      </SectionHeading>

      <div className="mt-14 grid gap-3 md:mt-20 md:grid-cols-2 md:gap-4 lg:grid-cols-12">
        {portfolio.skills.map((group, i) => (
          <ToolCard key={group.label} group={group} index={i} />
        ))}
      </div>
    </section>
  );
}
