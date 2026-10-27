import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Education } from "@/components/Education";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Projects } from "@/components/Projects";
import { portfolio } from "@/data/portfolio";

export default function Home() {
  const hasExperience = portfolio.experience.length > 0 || portfolio.leadership.length > 0;
  const hasEducation = portfolio.education.length > 0;

  const links = [
    { href: "#about", label: "About" },
    ...(hasExperience ? [{ href: "#experience", label: "Experience" }] : []),
    { href: "#projects", label: "Projects" },
    ...(hasEducation ? [{ href: "#education", label: "Education" }] : []),
    { href: "#contact", label: "Contact" },
  ];

  return (
    <>
      <Nav name={portfolio.name} links={links} />
      <main id="top">
        <Hero />
        <About />
        {hasExperience && <Experience />}
        <Projects projects={portfolio.projects} />
        {hasEducation && <Education />}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
