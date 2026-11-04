import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Browsers and some crawlers ask for /favicon.ico directly; answer with the generated icon.
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
  // Project pages live at /projects/<name>; the bare /projects goes to the Work section.
  async redirects() {
    return [{ source: "/projects", destination: "/#work", permanent: false }];
  },
};

export default nextConfig;
