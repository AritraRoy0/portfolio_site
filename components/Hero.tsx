import { portfolio } from "@/data/portfolio";
import { SocialLinks } from "./SocialLinks";
import { btnGhost, btnPrimary } from "./ui";

export function Hero() {
  const { name, role, location, tagline, resume } = portfolio;

  return (
    <section className="container-page pt-16 pb-12 md:pt-24 md:pb-18">
      {location && <p className="mb-3 text-sm font-semibold text-accent">{location}</p>}
      <h1 className="text-[clamp(2.4rem,7vw,4.2rem)] leading-[1.05] font-extrabold tracking-[-0.035em]">
        {name}
      </h1>
      <p className="mt-2.5 text-[clamp(1.2rem,3vw,1.6rem)] font-medium text-muted">{role}</p>
      <p className="mt-5 max-w-[600px] text-lg text-muted">{tagline}</p>

      {resume && (
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={resume} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
            View resume
          </a>
          <a href={resume} download={`${name.replace(/\s+/g, "_")}_Resume.pdf`} className={btnGhost}>
            Download PDF
          </a>
        </div>
      )}

      <SocialLinks className="mt-7" />
    </section>
  );
}
