import type { Metadata } from "next";
import { Suspense } from "react";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { JsonLd } from "@/components/JsonLd";
import { Marquee } from "@/components/Marquee";
import { Nav } from "@/components/Nav";
import { Preloader } from "@/components/Preloader";
import { Toolkit } from "@/components/Toolkit";
import { Work } from "@/components/Work";
import { portfolio } from "@/data/portfolio";
import { homeJsonLd } from "@/lib/seo";

// Set per page rather than in the layout, so project pages don't inherit the home page's canonical.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Each <Suspense> boundary lets React make that section interactive as its own small
// task, so the hero becomes responsive sooner. Nothing here actually suspends; the
// HTML is fully prerendered, so the fallbacks never show.

export default function Home() {
  const hasExperience = portfolio.experience.length > 0 || portfolio.leadership.length > 0;

  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <Preloader />
      <Nav />
      <main id="main" tabIndex={-1}>
        {/* The hero stays pinned while everything below slides over it like a curtain. */}
        <div className="relative">
          <Hero />
          {/* Rounded at both ends: the orange footer shows through the bottom corners as it is revealed. */}
          <div className="relative z-10 rounded-[var(--curtain-radius)] border-t border-line bg-bg pt-8 md:pt-12">
            <Suspense fallback={null}>
              <Marquee items={portfolio.marquee} />
            </Suspense>
            <Suspense fallback={null}>
              <About />
            </Suspense>
            {hasExperience && (
              <Suspense fallback={null}>
                <Experience />
              </Suspense>
            )}
            {portfolio.projects.length > 0 && (
              <Suspense fallback={null}>
                <Work />
              </Suspense>
            )}
            {portfolio.skills.length > 0 && (
              <Suspense fallback={null}>
                <Toolkit />
              </Suspense>
            )}
          </div>
        </div>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}
