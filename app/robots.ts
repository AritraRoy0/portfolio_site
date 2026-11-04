import type { MetadataRoute } from "next";
import { absoluteUrl, indexable } from "@/lib/seo";

/** /robots.txt: everything is open to crawlers (scripts and styles included, so pages render), except on previews. */
export default function robots(): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
