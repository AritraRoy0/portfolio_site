import type { MetadataRoute } from "next";
import { portfolio } from "@/data/portfolio";
import { absoluteUrl } from "@/lib/seo";
import { projectPath } from "@/lib/utils";

/** /sitemap.xml: the home page and every project page, with project screenshots for image search. */
export default function sitemap(): MetadataRoute.Sitemap {
  // Content only changes when the site is rebuilt, so the build time is an honest "last modified".
  const lastModified = new Date();

  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    ...portfolio.projects.map((project) => ({
      url: absoluteUrl(projectPath(project)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: project.image ? [absoluteUrl(project.image)] : undefined,
    })),
  ];
}
