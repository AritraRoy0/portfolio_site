"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { REDUCED_MOTION, useMediaQuery } from "@/lib/hooks";
import { EASE_OUT } from "@/lib/utils";

const KINDS: Record<string, string> = {
  mysql: "relational",
  postgresql: "relational",
  postgres: "relational",
  sqlite: "relational",
  supabase: "relational",
  firestore: "document",
  mongodb: "document",
  dynamodb: "key-value",
  redis: "key-value",
};

const QUERY = "SELECT name, kind FROM stack;";

/** Types a query, then the databases arrive as its result rows. */
export function QueryTable({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduced = useMediaQuery(REDUCED_MOTION);
  const [typed, setTyped] = useState(0);
  const shown = reduced ? QUERY.length : typed;
  const done = shown >= QUERY.length;

  useEffect(() => {
    if (reduced || !inView || typed >= QUERY.length) return;
    const id = window.setTimeout(() => setTyped((n) => n + 1), 38);
    return () => window.clearTimeout(id);
  }, [reduced, inView, typed]);

  return (
    <div ref={ref} className="flex h-full flex-col rounded-2xl border border-line bg-bg/60 p-4 font-mono text-[12px] md:text-[12.5px]">
      <p aria-hidden className="min-h-[1.5em] break-all">
        <span className="text-accent-ink">sql&gt;</span> {QUERY.slice(0, shown)}
        {!done && <span className="caret ml-px inline-block h-[1.1em] w-[0.5em] translate-y-[0.2em] bg-accent-ink" />}
      </p>
      <table className="mt-4 w-full border-collapse text-left">
        <caption className="sr-only">Databases</caption>
        <thead>
          <tr className="border-y border-dashed border-line-strong text-muted">
            <th scope="col" className="py-2 pr-3 font-normal">name</th>
            <th scope="col" className="py-2 font-normal">kind</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <motion.tr
              key={item}
              data-reveal
              initial={{ opacity: 0, x: -8 }}
              animate={done ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.15 + i * 0.16 }}
              className="border-b border-line"
            >
              <td className="py-2.5 pr-3 font-sans text-[15px] font-medium">{item}</td>
              <td className="py-2.5 text-muted">{KINDS[item.toLowerCase()] ?? "—"}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      <motion.p
        aria-hidden
        data-reveal
        initial={{ opacity: 0 }}
        animate={done ? { opacity: 1 } : undefined}
        transition={{ delay: 0.25 + items.length * 0.16 }}
        className="mt-auto pt-4 text-muted"
      >
        {items.length} row{items.length === 1 ? "" : "s"} in set <span className="text-accent-ink">✓</span>
      </motion.p>
    </div>
  );
}
