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
  location?: string;
  period?: string;
  points: string[];
}

export interface Project {
  title: string;
  subtitle?: string;
  description: string;
  highlights?: string[];
  tags: string[];
  /** Path to a screenshot in /public, e.g. "/projects/streetlevel.png" */
  image?: string;
  demo?: string;
  code?: string;
}

export interface Education {
  school: string;
  degree: string;
  year: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
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
  skills: SkillGroup[];
  /** Most recent first. Leave empty to hide the Experience section. */
  experience: Job[];
  /** Leave empty to hide the Leadership list. */
  leadership: Job[];
  projects: Project[];
  /** Leave empty to hide the Education section. */
  education: Education[];
}

export const portfolio: Portfolio = {
  name: "Roy Mazumder",
  role: "Full-Stack Software Engineer",
  location: "Stoneham, MA",
  tagline:
    "I build full-stack web apps, cloud monitoring tools and automation, from a robot fleet dashboard spanning 4 continents to a fintech platform with 300+ monthly active users.",

  about: [
    "I'm a software engineer who likes owning a product end to end, from UX design and front-end code to APIs and cloud deployment.",
    "At Ava Robotics, a Robots-as-a-Service startup, I led development of the dashboard used to monitor and manage hundreds of robots and 32+ Robot Management Servers worldwide, and automated work that used to take the team hours every week.",
    "Outside work I build my own products. VAULT, a peer-to-peer lending platform, grew to 300+ monthly active users, and I'm currently building StreetLevel, a market research and analytics platform.",
  ],

  resume: "/resume.pdf",

  socials: {
    linkedin: "https://www.linkedin.com/in/roy-mazumder-6b9382b5",
    github: "https://github.com/AritraRoy0",
    email: "roymazumder4@gmail.com",
    x: "",
  },

  skills: [
    { label: "Languages", items: ["Python", "JavaScript", "TypeScript", "Java", "C"] },
    { label: "Frameworks", items: ["React", "Next.js", "Node.js", "Express.js", "Flask", "Django"] },
    {
      label: "Cloud & Infrastructure",
      items: ["AWS", "Google Cloud", "Firebase", "Vercel", "Docker", "Kubernetes"],
    },
    { label: "Databases", items: ["MySQL", "Firestore"] },
    { label: "Tools & Practices", items: ["Git", "Postman", "REST APIs", "Stripe API", "Agile / Scrum"] },
  ],

  experience: [
    {
      role: "Full Stack Application Developer, Cloud RaaS Monitoring Tools",
      company: "Ava Robotics Inc",
      location: "Cambridge, MA",
      period: "Sep 2024 – Aug 2025",
      points: [
        "Led full-stack development, UX design, and AWS cloud deployment of the Ava RMS Administrative Dashboard, used to monitor and manage hundreds of robots and 32+ Robot Management Servers (RMSs) across 4 continents.",
        "Implemented authentication, role-based access control with privilege escalation and revocation, email notifications, remote server maintenance, software updates, and real-time fleet visibility using JavaScript, React.js, Express.js, and AWS.",
      ],
    },
    {
      role: "Software Development Intern, Internal Tools",
      company: "Ava Robotics Inc",
      location: "Cambridge, MA",
      period: "Sep 2023 – Sep 2024",
      points: [
        "Automated delivery of 40,000+ reports, events, and logs per quarter to configurable drives, emails, and datasets with 100% accuracy, cutting manual work for a lean team.",
        "Wrote a script to audit web app and OS versions across RMSs and trigger cross-server software updates in seconds, replacing 4+ hours of manual work each week.",
        "Automated SSL certificate testing and expiration notifications on AWS, eliminating 8–10 hours of idle time every quarter.",
      ],
    },
  ],

  leadership: [
    {
      role: "Vice President",
      company: "Debate Club",
      points: [
        "Trained and mentored new members of the 10-member club in debate and public speaking.",
        "Organized club events and managed the club treasury and event logistics.",
      ],
    },
  ],

  projects: [
    {
      title: "VAULT",
      subtitle: "Peer-to-peer lending platform",
      description:
        "Built and launched a peer-to-peer lending platform with user profiles, authentication, dashboards, NoSQL transactions, and Stripe payments.",
      highlights: ["Grew to 300+ monthly active users, measured with Vercel and Google Cloud analytics."],
      tags: ["TypeScript", "Next.js", "Stripe", "NoSQL", "Vercel"],
      demo: "https://gofundyourselfinc.com/",
      code: "https://github.com/AritraRoy0/GFY",
    },
    {
      title: "StreetLevel",
      subtitle: "Market research & analytics platform",
      description:
        "A market analytics web app with overview, analytics, rule-based signals, and portfolio performance workspaces.",
      highlights: [
        "Technical and risk analytics on historical prices: SMA, RSI, volatility, drawdown, z-scores, beta, Sharpe and Sortino ratios, and Value at Risk.",
        "Express/Node.js REST API on MySQL for historical OHLCV data and Firestore for live quotes, with scheduled ingestion on AWS Lambda and EventBridge.",
      ],
      tags: ["Next.js", "TypeScript", "Tailwind CSS", "Node.js", "MySQL", "AWS"],
      image: "/projects/streetlevel.png",
      demo: "https://streetlevel-peach.vercel.app",
      code: "https://github.com/AritraRoy0/StreetLevel",
    },
  ],

  education: [
    { school: "Princeton University", degree: "B.S.E. in Computer Science", year: "2026" },
  ],
};
