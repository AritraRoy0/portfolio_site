import { portfolio } from "@/data/portfolio";
import { absoluteUrl } from "@/lib/seo";
import { plain, projectPath } from "@/lib/utils";

// /llms.txt (https://llmstxt.org): the whole portfolio as plain Markdown, for AI assistants and
// AI search engines that read sites on someone's behalf. Built from data/portfolio.ts like the page.

export const dynamic = "force-static";

const link = (label: string, url?: string) => (url ? `[${label}](${url})` : "");

function body() {
  const { name, role, socials, resume, education, skills, experience, leadership, projects } = portfolio;
  const lines: string[] = [];
  const add = (...items: string[]) => lines.push(...items);

  add(`# ${name}`, "", `> ${portfolio.searchDescription}`, "", portfolio.tagline, "");
  add(plain(portfolio.statement), "", ...portfolio.about.flatMap((paragraph) => [paragraph, ""]));
  if (portfolio.availability) add(`Status: ${portfolio.availability}.`, "");

  add("## Pages", "", `- ${link("Home", absoluteUrl("/"))}: ${role}. About, experience, projects and skills.`);
  for (const project of projects) {
    add(`- ${link(project.title, absoluteUrl(projectPath(project)))}: ${project.subtitle ?? project.description}`);
  }
  if (resume) add(`- ${link("Résumé (PDF)", absoluteUrl(resume))}`);
  add("");

  add("## Experience", "");
  for (const job of [...experience, ...leadership]) {
    const meta = [job.location, job.period].filter(Boolean).join(", ");
    add(`### ${job.role}, ${job.company}${meta ? ` (${meta})` : ""}`, "", ...job.points.map((point) => `- ${point}`), "");
  }

  add("## Projects", "");
  for (const project of projects) {
    add(`### ${project.title}${project.subtitle ? `: ${project.subtitle}` : ""}`, "", project.description, "");
    for (const paragraph of project.details ?? []) add(paragraph, "");
    add(...(project.highlights ?? []).map((highlight) => `- ${highlight}`));
    add(`- Built with: ${project.tags.join(", ")}`);
    const links = [link("Project page", absoluteUrl(projectPath(project))), link("Live site", project.demo), link("Source code", project.code)];
    add(`- Links: ${links.filter(Boolean).join(" · ")}`, "");
  }

  add("## Skills", "", ...skills.map((group) => `- ${group.label}: ${group.items.join(", ")}`), "");
  if (education.length) {
    add("## Education", "", ...education.map((item) => `- ${item.school}: ${item.degree}, ${item.year}`), "");
  }

  add("## Contact", "");
  if (socials.email) add(`- Email: ${socials.email}`);
  if (socials.linkedin) add(`- ${link("LinkedIn", socials.linkedin)}`);
  if (socials.github) add(`- ${link("GitHub", socials.github)}`);
  if (socials.x) add(`- ${link("X", socials.x)}`);
  return `${lines.join("\n").trim()}\n`;
}

export function GET() {
  return new Response(body(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
