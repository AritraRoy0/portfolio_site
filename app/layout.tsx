import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { BackToTop } from "@/components/BackToTop";
import { CommandMenu } from "@/components/CommandMenu";
import { Cursor } from "@/components/Cursor";
import { Providers } from "@/components/Providers";
import { portfolio } from "@/data/portfolio";
import { indexable, keywords, siteTitle, siteUrl } from "@/lib/seo";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

// Search engines get `searchDescription`; link previews get the friendlier first-person tagline.
// Verification codes come from Google Search Console and Bing Webmaster Tools (see README).
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: `%s | ${portfolio.name}` },
  description: portfolio.searchDescription,
  applicationName: portfolio.name,
  authors: [{ name: portfolio.name, url: siteUrl }],
  creator: portfolio.name,
  keywords,
  category: "technology",
  robots: indexable
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
      }
    : { index: false, follow: false },
  openGraph: {
    title: siteTitle,
    description: portfolio.tagline,
    type: "website",
    url: "/",
    siteName: portfolio.name,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: siteTitle, description: portfolio.tagline },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
  ],
};

// Runs before first paint: applies the saved theme, and skips the intro on repeat
// visits or for visitors who prefer reduced motion.
const bootScript = `try{var d=document.documentElement,t=localStorage.getItem("theme");if(t)d.setAttribute("data-theme",t);if(sessionStorage.getItem("intro-seen")||matchMedia("(prefers-reduced-motion: reduce)").matches)d.setAttribute("data-intro","skip")}catch(e){}`;

// Without JavaScript, show everything that would normally animate in.
const noScriptStyles = `.preloader{display:none!important}[data-reveal]{opacity:1!important;transform:none!important}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>{noScriptStyles}</style>
        </noscript>
      </head>
      <body className="bg-bg font-sans text-fg antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>
          <Cursor />
          {children}
          <BackToTop />
          <CommandMenu />
        </Providers>
        <div aria-hidden className="grain" />
        <Analytics />
      </body>
    </html>
  );
}
