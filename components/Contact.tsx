import { portfolio } from "@/data/portfolio";
import { Section } from "./Section";
import { SocialLinks } from "./SocialLinks";
import { btnGhost, btnPrimary } from "./ui";

export function Contact() {
  const { email, linkedin } = portfolio.socials;

  return (
    <Section id="contact" title="Get in touch" className="text-center">
      <p className="mx-auto max-w-[520px] text-[1.05rem] text-muted">
        I&apos;m open to new opportunities and collaborations. The fastest way to reach me is below.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {email && (
          <a href={`mailto:${email}`} className={btnPrimary}>
            Email me
          </a>
        )}
        {linkedin && (
          <a href={linkedin} target="_blank" rel="noopener noreferrer" className={btnGhost}>
            Connect on LinkedIn
          </a>
        )}
      </div>

      <SocialLinks className="mt-7 justify-center" />
    </Section>
  );
}
