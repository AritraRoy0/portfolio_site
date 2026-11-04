import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { GitHubIcon } from "@/components/Icons";
import { JsonLd } from "@/components/JsonLd";
import { Nav } from "@/components/Nav";
import { NoIntro } from "@/components/NoIntro";
import { btn } from "@/components/ui/buttons";
import { RevealText } from "@/components/ui/RevealText";
import { RollingText } from "@/components/ui/RollingText";
import { SectionLabel } from "@/components/ui/SectionHeading";
import { portfolio } from "@/data/portfolio";
import { projectBySlug, projectJsonLd, projectTitle } from "@/lib/seo";
import { hostOf, pad2, projectPath, slugify } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

// One static page per project in data/portfolio.ts; any other /projects/... is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return portfolio.projects.map((project) => ({ slug: slugify(project.title) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = projectBySlug((await params).slug);
  if (!project) return {};
  const title = projectTitle(project);
  // Share titles don't get the layout's " | Name" template, so it is added by hand.
  const shareTitle = `${title} | ${portfolio.name}`;
  const path = projectPath(project);

  return {
    title,
    description: project.description,
    keywords: [project.title, project.subtitle ?? "", ...project.tags, portfolio.name].filter(Boolean),
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: shareTitle,
      description: project.description,
      url: path,
      siteName: portfolio.name,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title: shareTitle, description: project.description },
  };
}

const FACT_LABEL = "label-mono text-[10px] text-muted";

export default async function ProjectPage({ params }: Props) {
  const project = projectBySlug((await params).slug);
  if (!project) notFound();

  const { projects } = portfolio;
  const index = projects.indexOf(project);
  // The next project first, wrapping round, like turning the ring on the home page.
  const others = [...projects.slice(index + 1), ...projects.slice(0, index)];
  const host = hostOf(project.demo || project.code);
  const repo = project.code?.replace(/^https?:\/\/(www\.)?/, "");

  return (
    <>
      <JsonLd data={projectJsonLd(project)} />
      <NoIntro />
      <Nav />
      {/* Rounded at the bottom: the contact footer is revealed from underneath, as on the home page. */}
      <main id="main" tabIndex={-1} className="relative z-10 rounded-b-[var(--curtain-radius)] bg-bg">
        <div className="container-page pb-24 pt-28 md:pb-36 md:pt-36">
          <nav aria-label="Breadcrumb">
            <ol className="label-mono flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
              <li className="flex items-center gap-3">
                <a href="/" className="transition-colors duration-300 hover:text-fg">
                  {portfolio.name}
                </a>
                <span aria-hidden>/</span>
              </li>
              <li className="flex items-center gap-3">
                <a href="/#work" className="transition-colors duration-300 hover:text-fg">
                  Work
                </a>
                <span aria-hidden>/</span>
              </li>
              <li aria-current="page" className="text-fg">
                {project.title}
              </li>
            </ol>
          </nav>

          <article>
            <header className="mt-12 flex flex-col gap-10 md:mt-16 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="label-mono flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                  <span>
                    <span className="text-accent-ink">{pad2(index + 1)}</span> / {pad2(projects.length)}
                  </span>
                  {host && (
                    <>
                      <span aria-hidden className="h-px w-6 bg-line-strong" />
                      <span className="normal-case tracking-[0.08em]">{host}</span>
                    </>
                  )}
                </p>
                <h1 className="mt-6">
                  <RevealText
                    text={project.title}
                    by="char"
                    stagger={0.035}
                    className="block text-[clamp(3rem,11vw,9.5rem)] font-semibold leading-[0.86] tracking-[-0.055em]"
                    maskClassName="pb-[0.14em] -mb-[0.14em]"
                  />
                  {project.subtitle && (
                    <span className="mt-4 block font-serif text-[clamp(1.75rem,3.4vw,3rem)] font-normal italic leading-tight tracking-[-0.01em] text-accent-ink">
                      {project.subtitle}
                    </span>
                  )}
                </h1>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3 lg:pb-3">
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer" className={btn.primary}>
                    <RollingText>Visit site</RollingText>
                    <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                )}
                {project.code && (
                  <a href={project.code} target="_blank" rel="noopener noreferrer" className={btn.ghost}>
                    <GitHubIcon className="size-4" />
                    <RollingText>Source</RollingText>
                  </a>
                )}
              </div>
            </header>

            {/* Not animated in: it is usually the largest thing on screen, so it should paint right away. */}
            {project.image && (
              <figure className="mt-14 md:mt-20">
                <div className="overflow-hidden rounded-[1.25rem] border border-line-strong bg-bg shadow-float md:rounded-[1.75rem]">
                  <div aria-hidden className="flex h-10 items-center gap-1.5 border-b border-line px-4 md:h-12 md:px-5">
                    <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="size-2.5 rounded-full bg-[#febc2e]" />
                    <span className="size-2.5 rounded-full bg-[#28c840]" />
                    <span className="mx-auto flex max-w-[60%] items-center gap-2 truncate rounded-md bg-surface-2 px-3 py-1 font-mono text-[11px] text-muted">
                      <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      {host}
                    </span>
                    <span className="w-[42px]" />
                  </div>
                  <div className="relative aspect-[16/9] bg-surface-2">
                    <Image
                      src={project.image}
                      alt={`Screenshot of ${projectTitle(project)}`}
                      fill
                      loading="eager"
                      fetchPriority="high"
                      sizes="(min-width: 1440px) 1344px, 100vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                <figcaption className="label-mono mt-4 flex justify-between gap-4 text-[10px] text-muted">
                  <span>
                    Fig. {pad2(index + 1)} — {project.title}
                  </span>
                  {project.demo && <span className="normal-case tracking-[0.08em]">Live at {host}</span>}
                </figcaption>
              </figure>
            )}

            <div className="mt-20 grid gap-16 md:mt-28 lg:grid-cols-12 lg:gap-10">
              <div className="min-w-0 lg:col-span-7">
                <SectionLabel index="01" as="h2">
                  Overview
                </SectionLabel>
                <p className="mt-8 text-pretty text-[clamp(1.6rem,2.8vw,2.5rem)] font-medium leading-[1.15] tracking-[-0.035em]">
                  {project.description}
                </p>
                {project.details?.map((paragraph) => (
                  <p key={paragraph} className="mt-6 text-pretty text-lg leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}

                {project.highlights?.length ? (
                  <>
                    <SectionLabel index="02" as="h2" className="mt-16 md:mt-20">
                      Highlights
                    </SectionLabel>
                    <ul className="mt-8 space-y-5">
                      {project.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-4 text-pretty text-lg leading-relaxed text-muted">
                          <span aria-hidden className="mt-[0.8em] h-px w-5 shrink-0 bg-accent-ink" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>

              <aside aria-label="Project facts" className="lg:col-span-4 lg:col-start-9">
                <dl className="space-y-7 rounded-[1.5rem] border border-line bg-surface p-6 md:p-8 lg:sticky lg:top-28">
                  <div>
                    <dt className={FACT_LABEL}>Built by</dt>
                    <dd className="mt-2">
                      <a
                        href="/"
                        className="text-lg font-medium tracking-[-0.02em] underline decoration-line-strong underline-offset-4 transition-colors duration-300 hover:decoration-accent-ink"
                      >
                        {portfolio.name}
                      </a>
                      <span className="mt-0.5 block text-sm text-muted">{portfolio.role}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className={FACT_LABEL}>Built with</dt>
                    <dd className="mt-3">
                      <ul className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full border border-line px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  {project.demo && (
                    <div>
                      <dt className={FACT_LABEL}>Live site</dt>
                      <dd className="mt-2">
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 font-medium transition-colors duration-300 hover:text-accent-ink"
                        >
                          {hostOf(project.demo)}
                          <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </a>
                      </dd>
                    </div>
                  )}
                  {project.code && (
                    <div>
                      <dt className={FACT_LABEL}>Source code</dt>
                      <dd className="mt-2">
                        <a
                          href={project.code}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex max-w-full items-center gap-2 font-medium transition-colors duration-300 hover:text-accent-ink"
                        >
                          <GitHubIcon className="size-4 shrink-0" />
                          <span className="truncate">{repo}</span>
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </aside>
            </div>
          </article>

          {others.length > 0 && (
            <section aria-labelledby="more-work" className="mt-24 md:mt-36">
              <div className="flex items-end justify-between gap-6 border-t border-line pt-10 md:pt-14">
                <h2 id="more-work" className="text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[0.92] tracking-[-0.045em]">
                  More <span className="font-serif font-normal italic tracking-[-0.01em] text-accent-ink">work</span>
                </h2>
                <a
                  href="/#work"
                  className="group label-mono mb-2 inline-flex shrink-0 items-center gap-2 text-muted transition-colors duration-300 hover:text-fg"
                >
                  <RollingText>All projects</RollingText>
                  <ArrowRight className="size-3.5 transition-transform duration-500 ease-expo group-hover:translate-x-0.5" />
                </a>
              </div>
              <ul className="mt-10 grid gap-3 md:mt-14 md:grid-cols-2 md:gap-4">
                {others.map((other) => (
                  <li key={other.title}>
                    <a
                      href={projectPath(other)}
                      className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-line bg-surface transition-colors duration-500 hover:border-line-strong"
                    >
                      {other.image && (
                        <span className="relative block aspect-[16/9] overflow-hidden border-b border-line bg-surface-2">
                          <Image
                            src={other.image}
                            alt=""
                            fill
                            sizes="(min-width: 768px) 50vw, 100vw"
                            className="object-cover object-top transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.04]"
                          />
                        </span>
                      )}
                      <span className="flex flex-1 items-end justify-between gap-6 p-6 md:p-8">
                        <span className="min-w-0">
                          <span className="label-mono block text-[10px] text-accent-ink">
                            {pad2(projects.indexOf(other) + 1)}
                          </span>
                          <span className="mt-3 block text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-none tracking-[-0.04em]">
                            {other.title}
                          </span>
                          {other.subtitle && (
                            <span className="mt-2 block font-serif text-xl italic leading-tight text-muted">{other.subtitle}</span>
                          )}
                        </span>
                        <span
                          aria-hidden
                          className="grid size-12 shrink-0 place-items-center rounded-full border border-line transition-[background-color,color,transform] duration-500 ease-expo group-hover:-rotate-45 group-hover:bg-fg group-hover:text-bg"
                        >
                          <ArrowRight className="size-5" />
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
