import { portfolio } from "@/data/portfolio";
import { Section } from "./Section";

export function About() {
  return (
    <Section id="about" title="About">
      <div className="grid gap-8 md:grid-cols-[1.6fr_1fr] md:gap-12">
        <div>
          {portfolio.about.map((paragraph) => (
            <p key={paragraph} className="mb-4 text-[1.05rem] text-muted">
              {paragraph}
            </p>
          ))}
        </div>

        {portfolio.skills.length > 0 && (
          <div>
            <h3 className="mb-3.5 text-sm font-semibold tracking-[0.08em] text-muted uppercase">
              Skills
            </h3>
            <ul className="flex flex-wrap gap-2">
              {portfolio.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-line bg-surface-2 px-3 py-1.5 text-sm font-medium"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}
