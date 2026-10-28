"use client";

import { portfolio } from "@/data/portfolio";
import { SectionHeading } from "./ui/SectionHeading";
import { Carousel } from "./work/Carousel";

/** Selected work: a heading, then the projects on a 3D turntable carousel. */
export function Work() {
  return (
    <section id="work" tabIndex={-1} aria-label="Selected work" className="relative overflow-x-clip pb-16 pt-20 md:pb-24 md:pt-28">
      <div className="container-page">
        <SectionHeading index="03" label="Selected work" title="Things I’ve *built*">
          {portfolio.intros.work}
        </SectionHeading>
      </div>
      <Carousel projects={portfolio.projects} />
    </section>
  );
}
