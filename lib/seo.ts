import { portfolio, type Project } from "@/data/portfolio";
import { projectPath, slugify } from "@/lib/utils";

// Server-side only: everything here is used to build metadata, the sitemap and structured data.

/**
 * The site's public address, used in canonical links, the sitemap and link previews.
 * NEXT_PUBLIC_SITE_URL wins if set. Otherwise Vercel's production domain is used, which
 * switches to your custom domain by itself once you add one.
 */
const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (vercelDomain ? `https://${vercelDomain}` : "https://portfoliosite-rust-rho.vercel.app")
).replace(/\/+$/, "");

/** Preview deployments are kept out of search results so they never compete with the real site. */
export const indexable = process.env.VERCEL_ENV !== "preview";

export const siteTitle = `${portfolio.name} | ${portfolio.role}`;

/** The project whose page lives at /projects/<slug>, if any. */
export const projectBySlug = (slug: string) => portfolio.projects.find((project) => slugify(project.title) === slug);

/** "VAULT – Peer-to-peer lending platform": a project page's title, before the " | Name" suffix. */
export const projectTitle = (project: Project) =>
  project.subtitle ? `${project.title} – ${project.subtitle}` : project.title;

export const keywords = [
  portfolio.name,
  portfolio.role,
  "Software engineer portfolio",
  ...portfolio.education.map((item) => item.school),
  ...portfolio.marquee,
];

export const absoluteUrl = (path = "/") => new URL(path, `${siteUrl}/`).toString();

/** JSON for a <script type="application/ld+json">, with "<" escaped so content can't close the tag. */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

// ---------------------------------------------------------------------------------------
// Structured data (schema.org). Each page publishes a graph; nodes link to each other by
// "@id", so search engines see one person, one site and the projects they built.

const ids = {
  person: absoluteUrl("/#person"),
  website: absoluteUrl("/#website"),
  profile: absoluteUrl("/#profile"),
};

const projectId = (project: Project) => `${absoluteUrl(projectPath(project))}#project`;

function personNode() {
  const { name, role, socials, education, skills } = portfolio;
  const [givenName, ...rest] = name.split(" ");
  return {
    "@type": "Person",
    "@id": ids.person,
    name,
    givenName,
    familyName: rest.join(" ") || undefined,
    jobTitle: role,
    description: portfolio.searchDescription,
    url: absoluteUrl("/"),
    email: socials.email ? `mailto:${socials.email}` : undefined,
    sameAs: [socials.linkedin, socials.github, socials.x].filter(Boolean),
    alumniOf: education.map((item) => ({ "@type": "CollegeOrUniversity", name: item.school })),
    knowsAbout: skills.flatMap((group) => group.items),
  };
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": ids.website,
    url: absoluteUrl("/"),
    name: portfolio.name,
    description: portfolio.searchDescription,
    inLanguage: "en",
    publisher: { "@id": ids.person },
  };
}

/** The project itself: `url` is the live product, `mainEntityOfPage` the page about it here. */
function projectNode(project: Project) {
  const page = absoluteUrl(projectPath(project));
  return {
    "@type": project.code ? "SoftwareSourceCode" : "CreativeWork",
    "@id": projectId(project),
    name: project.title,
    headline: project.subtitle,
    description: project.description,
    url: project.demo || page,
    mainEntityOfPage: page,
    image: project.image ? absoluteUrl(project.image) : undefined,
    keywords: project.tags.join(", "),
    codeRepository: project.code,
    author: { "@id": ids.person },
  };
}

export function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteNode(),
      {
        "@type": "ProfilePage",
        "@id": ids.profile,
        url: absoluteUrl("/"),
        name: siteTitle,
        description: portfolio.searchDescription,
        inLanguage: "en",
        isPartOf: { "@id": ids.website },
        mainEntity: { "@id": ids.person },
      },
      personNode(),
      ...portfolio.projects.map(projectNode),
    ],
  };
}

export function projectJsonLd(project: Project) {
  const url = absoluteUrl(projectPath(project));
  const crumbs = [
    { name: portfolio.name, item: absoluteUrl("/") },
    { name: "Work", item: absoluteUrl("/#work") },
    { name: project.title, item: url },
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: projectTitle(project),
        description: project.description,
        inLanguage: "en",
        isPartOf: { "@id": ids.website },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: { "@id": projectId(project) },
        primaryImageOfPage: project.image ? absoluteUrl(project.image) : undefined,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: crumbs.map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
      },
      projectNode(project),
      websiteNode(),
      { "@type": "Person", "@id": ids.person, name: portfolio.name, url: absoluteUrl("/") },
    ],
  };
}
