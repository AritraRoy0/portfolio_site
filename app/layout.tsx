import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { portfolio } from "@/data/portfolio";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: `${portfolio.name} | ${portfolio.role}`,
  description: portfolio.tagline,
  openGraph: {
    title: `${portfolio.name} | ${portfolio.role}`,
    description: portfolio.tagline,
    type: "website",
  },
};

// Applies the saved theme before the page paints, so there is no flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg font-sans leading-relaxed text-fg antialiased">{children}</body>
    </html>
  );
}
