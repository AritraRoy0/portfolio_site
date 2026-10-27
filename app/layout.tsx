import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Cursor } from "@/components/Cursor";
import { Providers } from "@/components/Providers";
import { ScrollProgress } from "@/components/ScrollProgress";
import { portfolio } from "@/data/portfolio";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

// Set NEXT_PUBLIC_SITE_URL in Vercel if you add a custom domain.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfoliosite-rust-rho.vercel.app";
const title = `${portfolio.name} | ${portfolio.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description: portfolio.tagline,
  authors: [{ name: portfolio.name }],
  openGraph: {
    title,
    description: portfolio.tagline,
    type: "website",
    url: "/",
    siteName: portfolio.name,
  },
  twitter: { card: "summary_large_image", title, description: portfolio.tagline },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f1ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

// Runs before first paint: applies the saved theme, and skips the intro on repeat
// visits or for visitors who prefer reduced motion.
const bootScript = `try{var d=document.documentElement,t=localStorage.getItem("theme");if(t)d.setAttribute("data-theme",t);if(sessionStorage.getItem("intro-seen")||matchMedia("(prefers-reduced-motion: reduce)").matches)d.setAttribute("data-intro","skip")}catch(e){}`;

// Without JavaScript, show everything that would normally animate in.
const noScriptStyles = `.preloader{display:none!important}[data-reveal]{opacity:1!important;transform:none!important}`;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: portfolio.name,
  jobTitle: portfolio.role,
  url: siteUrl,
  sameAs: [portfolio.socials.linkedin, portfolio.socials.github, portfolio.socials.x].filter(Boolean),
  alumniOf: portfolio.education.map((item) => ({ "@type": "CollegeOrUniversity", name: item.school })),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>{noScriptStyles}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      </head>
      <body className="bg-bg font-sans text-fg antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>
          <ScrollProgress />
          <Cursor />
          {children}
        </Providers>
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
