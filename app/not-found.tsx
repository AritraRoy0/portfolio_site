import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { NoIntro } from "@/components/NoIntro";
import { btn } from "@/components/ui/buttons";
import { RollingText } from "@/components/ui/RollingText";
import { portfolio } from "@/data/portfolio";
import { projectPath } from "@/lib/utils";

// Next.js marks this page noindex and answers with a 404 status by itself.
export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <NoIntro />
      <Nav />
      <main id="main" tabIndex={-1} className="relative min-h-svh overflow-hidden">
        <div
          aria-hidden
          className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_30%_50%,#000,transparent_75%)]"
        />
        <div className="container-page relative flex min-h-svh flex-col justify-center pb-16 pt-32">
          <p className="label-mono flex items-center gap-3 text-muted">
            <span className="text-accent-ink">[404]</span>
            <span aria-hidden className="h-px w-10 bg-line-strong" />
            Page not found
          </p>
          <h1 className="mt-6 text-[clamp(3rem,9vw,8rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
            Nothing <span className="font-serif font-normal italic tracking-[-0.01em] text-accent-ink">here.</span>
          </h1>
          <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-muted">
            This page doesn’t exist or has moved. Try the home page, or one of these projects.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/" className={btn.primary}>
              <ArrowLeft className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-x-0.5" />
              <RollingText>Back home</RollingText>
            </a>
            {portfolio.projects.map((project) => (
              <a key={project.title} href={projectPath(project)} className={btn.ghost}>
                <RollingText>{project.title}</RollingText>
              </a>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
