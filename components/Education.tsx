import { portfolio } from "@/data/portfolio";
import { Section } from "./Section";

export function Education() {
  return (
    <Section id="education" title="Education">
      <ul className="grid gap-4 sm:grid-cols-2">
        {portfolio.education.map((item) => (
          <li
            key={item.school}
            className="flex items-start justify-between gap-4 rounded-[14px] border border-line bg-surface p-5 shadow-card"
          >
            <div>
              <h3 className="text-lg font-semibold">{item.school}</h3>
              <p className="mt-1 text-muted">{item.degree}</p>
            </div>
            <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-sm font-semibold text-accent tabular-nums">
              {item.year}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
