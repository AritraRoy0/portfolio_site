"use client";

import { ArrowUp, ArrowUpRight, Check, Copy } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { portfolio } from "@/data/portfolio";
import { REDUCED_MOTION, useLocalTime, useMediaQuery } from "@/lib/hooks";
import { useScrollControls } from "./Providers";
import { Magnetic } from "./ui/Magnetic";
import { RollingText } from "./ui/RollingText";

function EmailActions({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Magnetic strength={0.2}>
        <a
          href={`mailto:${email}`}
          className="group inline-flex items-center gap-3 rounded-full bg-accent-fg py-3 pl-5 pr-3 text-[15px] font-medium text-[#f3f1ec] sm:pl-6 sm:text-base md:py-4 md:pl-8 md:pr-4 md:text-xl"
        >
          <RollingText>{email}</RollingText>
          <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-fg transition-transform duration-500 ease-expo group-hover:rotate-45 md:size-10">
            <ArrowUpRight className="size-4" />
          </span>
        </a>
      </Magnetic>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Email address copied" : "Copy email address"}
        className="grid size-[3.25rem] place-items-center rounded-full border border-black/25 transition-colors duration-300 hover:bg-accent-fg hover:text-accent md:size-[4.25rem]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "check" : "copy"}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
          </motion.span>
        </AnimatePresence>
      </button>
      <AnimatePresence>
        {copied && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="font-mono text-[11px] uppercase tracking-[0.2em]"
          >
            Copied
          </motion.span>
        )}
      </AnimatePresence>
      <span role="status" className="sr-only">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </div>
  );
}

/**
 * Contact section and footer in one. It sits fixed underneath the page and is
 * uncovered as the last section scrolls away, rising slightly as it appears.
 */
export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery(REDUCED_MOTION);
  const { scrollTo } = useScrollControls();
  const time = useLocalTime(portfolio.timezone);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // Content starts lower and rises into place, a little slower than the page scrolls.
  const rise = useTransform(scrollYProgress, [0, 1], ["18%", "0%"]);

  const { email, linkedin, github, x } = portfolio.socials;
  const links = [
    linkedin && { label: "LinkedIn", href: linkedin },
    github && { label: "GitHub", href: github },
    x && { label: "X", href: x },
    portfolio.resume && { label: "Résumé", href: portfolio.resume },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div ref={ref} id="contact" tabIndex={-1} className="footer-reveal">
      <div className="footer-reveal-inner">
        <footer className="footer-theme h-full overflow-hidden">
          <motion.div
            style={reduced ? undefined : { y: rise }}
            className="container-page flex h-full flex-col pb-6 pt-24 md:pb-8 md:pt-28"
          >
            <div className="flex items-start justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.2em]">
              <p className="flex items-center gap-3">
                <span>(05)</span>
                <span aria-hidden className="h-px w-8 bg-current opacity-40" />
                Contact
              </p>
              <p className="text-right">
                Local time
                <span className="mt-1 block whitespace-nowrap opacity-80">{time ?? " "}</span>
              </p>
            </div>

            <div className="mt-auto">
              <h2 className="text-[clamp(3.25rem,10.5vw,11.5rem)] font-semibold leading-[0.86] tracking-[-0.055em]">
                Let’s build
                <br />
                something <span className="font-serif font-normal italic tracking-[-0.02em]">great.</span>
              </h2>
              <p className="mt-6 max-w-md text-pretty text-base leading-relaxed opacity-80 md:text-lg">
                Have a role or a project in mind? I’d love to hear about it.
              </p>

              <div className="mt-8 flex flex-col gap-8 md:mt-12 md:flex-row md:items-end md:justify-between">
                {email && <EmailActions email={email} />}
                <ul className="flex flex-wrap gap-x-8 gap-y-3 text-lg font-medium">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1.5">
                        <RollingText>{link.label}</RollingText>
                        <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-col-reverse gap-4 border-t border-black/15 pt-5 text-sm md:mt-14 md:flex-row md:items-center md:justify-between">
              <p className="opacity-80">
                © {new Date().getFullYear()} {portfolio.name}. Built with Next.js, Tailwind CSS, Motion and Lenis.
              </p>
              <button type="button" onClick={() => scrollTo(0)} className="group inline-flex items-center gap-3 self-start font-medium md:self-auto">
                <RollingText>Back to top</RollingText>
                <span className="grid size-9 place-items-center rounded-full border border-black/20 transition-colors duration-300 group-hover:bg-accent-fg group-hover:text-accent">
                  <ArrowUp className="size-4" />
                </span>
              </button>
            </div>
          </motion.div>
        </footer>
      </div>
    </div>
  );
}
