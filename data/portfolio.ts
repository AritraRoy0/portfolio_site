/*
 * ============================================================
 *  EDIT THIS FILE to update your portfolio.
 *  Everything on the site (name, links, resume, projects...)
 *  is read from the `portfolio` object below.
 *  Leave an optional field as "" (or remove it) to hide it.
 * ============================================================
 */

export type SocialKey = "linkedin" | "github" | "email" | "x";

export interface Job {
  role: string;
  company: string;
  period: string;
  points: string[];
}

export interface Project {
  title: string;
  description: string;
  tags: string[];
  /** Path to a screenshot in /public, e.g. "/projects/project-one.png" */
  image?: string;
  demo?: string;
  code?: string;
}

export interface Portfolio {
  name: string;
  role: string;
  location: string;
  tagline: string;
  about: string[];
  /** Path to your resume PDF in /public, e.g. "/resume.pdf" */
  resume?: string;
  socials: Partial<Record<SocialKey, string>>;
  skills: string[];
  /** Most recent first. Leave empty to hide the Experience section. */
  experience: Job[];
  projects: Project[];
}

export const portfolio: Portfolio = {
  name: "Roy Mazumder",
  role: "Software Engineer",
  location: "Your City, Country",
  tagline:
    "I build clean, reliable software and enjoy turning ideas into products people actually use.",

  about: [
    "Replace this with a few sentences about who you are, what you work on, and what you're looking for next.",
    "Mention the areas you care about most, such as web development, data, or machine learning, and what makes your approach different.",
  ],

  // Put your resume at public/resume.pdf, or change this path.
  resume: "/resume.pdf",

  socials: {
    linkedin: "https://www.linkedin.com/in/your-handle",
    github: "https://github.com/your-handle",
    email: "you@example.com",
    x: "",
  },

  skills: ["JavaScript", "TypeScript", "Python", "React", "Next.js", "Node.js", "SQL", "AWS"],

  experience: [
    {
      role: "Software Engineer",
      company: "Company Name",
      period: "2024 – Present",
      points: [
        "Describe an impact you had, ideally with a number (e.g. cut page load time by 40%).",
        "Describe a feature or system you owned end to end.",
      ],
    },
    {
      role: "Software Engineering Intern",
      company: "Another Company",
      period: "Summer 2023",
      points: ["What you built, what you learned, and the result."],
    },
  ],

  projects: [
    {
      title: "Project One",
      description:
        "A one or two sentence summary of the problem, what you built, and why it matters.",
      tags: ["React", "Node.js"],
      image: "",
      demo: "https://example.com",
      code: "https://github.com/your-handle/project-one",
    },
    {
      title: "Project Two",
      description:
        "Another project. Focus on the outcome and your role rather than listing every technology.",
      tags: ["Python", "Data"],
      code: "https://github.com/your-handle/project-two",
    },
    {
      title: "Project Three",
      description:
        "A side project, hackathon entry, or open-source contribution you're proud of.",
      tags: ["TypeScript", "AWS"],
      demo: "https://example.com",
    },
  ],
};
