import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Nav } from "@/components/Nav";
import { Preloader } from "@/components/Preloader";
import { Toolkit } from "@/components/Toolkit";
import { Work } from "@/components/Work";
import { portfolio } from "@/data/portfolio";

export default function Home() {
  const hasExperience = portfolio.experience.length > 0 || portfolio.leadership.length > 0;

  return (
    <>
      <Preloader />
      <Nav />
      <main id="main" tabIndex={-1}>
        {/* The hero stays pinned while everything below slides over it like a curtain. */}
        <div className="relative">
          <Hero />
          {/* Rounded at both ends: the orange footer shows through the bottom corners as it is revealed. */}
          <div className="relative z-10 rounded-[var(--curtain-radius)] border-t border-line bg-bg pt-8 md:pt-12">
            <Marquee items={portfolio.marquee} />
            <About />
            {hasExperience && <Experience />}
            {portfolio.projects.length > 0 && <Work />}
            {portfolio.skills.length > 0 && <Toolkit />}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
