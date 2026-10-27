import { portfolio, type Job } from "@/data/portfolio";
import { Section } from "./Section";

function Timeline({ jobs }: { jobs: Job[] }) {
  return (
    <ol className="relative before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-0.5 before:bg-line">
      {jobs.map((job) => (
        <li
          key={`${job.company}-${job.role}`}
          className="relative pb-9 pl-10 last:pb-0 before:absolute before:top-1.5 before:left-0 before:size-4 before:rounded-full before:border-[3px] before:border-accent before:bg-bg"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-lg font-semibold">{job.role}</h3>
            {job.period && <span className="text-sm text-muted tabular-nums">{job.period}</span>}
          </div>
          <p className="mt-0.5 font-medium text-accent">
            {job.company}
            {job.location && <span className="font-normal text-muted"> · {job.location}</span>}
          </p>
          {job.points.length > 0 && (
            <ul className="mt-2.5 list-[circle] pl-[18px] text-muted">
              {job.points.map((point) => (
                <li key={point} className="mb-1">
                  {point}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

export function Experience() {
  return (
    <Section id="experience" title="Experience">
      <Timeline jobs={portfolio.experience} />

      {portfolio.leadership.length > 0 && (
        <>
          <h3 className="mt-14 mb-6 text-xl font-bold tracking-tight">Leadership</h3>
          <Timeline jobs={portfolio.leadership} />
        </>
      )}
    </Section>
  );
}
