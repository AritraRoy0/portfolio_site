import { portfolio } from "@/data/portfolio";
import { Section } from "./Section";

export function About() {
  return (
    <Section id="about" title="About">
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:gap-12">
        <div>
          {portfolio.about.map((paragraph) => (
            <p key={paragraph} className="mb-4 text-[1.05rem] text-muted">
              {paragraph}
            </p>
          ))}
        </div>

        {portfolio.skills.length > 0 && (
          <div className="flex flex-col gap-5">
            {portfolio.skills.map((group) => (
              <div key={group.label}>
                <h3 className="mb-2.5 text-xs font-semibold tracking-[0.08em] text-muted uppercase">
                  {group.label}
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full border border-line bg-surface-2 px-3 py-1 text-sm font-medium"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
