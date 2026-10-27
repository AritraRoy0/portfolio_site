"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Project } from "@/data/portfolio";
import { ExternalIcon, GitHubIcon } from "./Icons";
import { Section } from "./Section";

function initials(text: string) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[14px] border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-[3px] hover:border-accent">
      <div className="relative grid aspect-video place-items-center bg-linear-135 from-accent-soft to-surface-2 text-4xl font-extrabold tracking-tight text-accent">
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.title} screenshot`}
            fill
            sizes="(max-width: 768px) 100vw, 340px"
            className="object-cover"
          />
        ) : (
          initials(project.title)
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-lg font-semibold">{project.title}</h3>
        <p className="mb-4 flex-1 text-[0.95rem] text-muted">{project.description}</p>

        {project.tags.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                {tag}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-4">
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-accent"
            >
              <ExternalIcon className="size-4" />
              Live demo
            </a>
          )}
          {project.code && (
            <a
              href={project.code}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-accent"
            >
              <GitHubIcon className="size-4" />
              Code
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("All");

  const tags = useMemo(
    () => ["All", ...Array.from(new Set(projects.flatMap((p) => p.tags)))],
    [projects],
  );

  const visible = active === "All" ? projects : projects.filter((p) => p.tags.includes(active));

  return (
    <Section id="projects" title="Projects">
      {tags.length > 2 && (
        <div role="group" aria-label="Filter projects" className="mb-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={tag === active}
              onClick={() => setActive(tag)}
              className="cursor-pointer rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-muted aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-fg"
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(290px,100%),1fr))] gap-5">
        {visible.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </Section>
  );
}
