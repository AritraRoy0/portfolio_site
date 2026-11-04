import type { MetadataRoute } from "next";
import { portfolio } from "@/data/portfolio";

/** /manifest.webmanifest: name, colours and icons for "Add to Home Screen" and app launchers. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${portfolio.name}, ${portfolio.role}`,
    short_name: portfolio.name,
    description: portfolio.searchDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#08080a",
    theme_color: "#08080a",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
