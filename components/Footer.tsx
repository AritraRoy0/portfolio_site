"use client";

import { ArrowUp, ArrowUpRight, Check, Copy } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { portfolio } from "@/data/portfolio";
import { REDUCED_MOTION, useLocalTime, useMediaQuery } from "@/lib/hooks";
import { EASE_OUT, pad2 } from "@/lib/utils";
import { useScrollControls, useToast } from "./Providers";
import { Magnetic } from "./ui/Magnetic";
import { RevealText } from "./ui/RevealText";
import { RollingText } from "./ui/RollingText";

const HOVER_CHAR = "inline-block transition-transform duration-500 ease-expo hover:-translate-y-[0.08em]";

function EmailActions({ email }: { email: string }) {
  const toast = useToast();
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
      toast("Email copied to clipboard");
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Magnetic strength={0.2}>
        <a
          href={`mailto:${email}`}
          className="group inline-flex items-center gap-3 rounded-full bg-accent-fg py-3 pl-5 pr-3 text-[15px] font-medium text-[#f1f1ec] shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] sm:pl-6 sm:text-base md:py-4 md:pl-8 md:pr-4 md:text-xl"
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
            initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.2 }}
          >
            {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}

/** Sizes one line of text so it spans the full width of its box. */
function GiantName({ text, show }: { text: string; show: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<number | null>(null);

  useEffect(() => {
    const fit = () => {
      const width = measure.current?.getBoundingClientRect().width;
      const available = box.current?.clientWidth;
      if (width && available) setSize((100 * available) / width);
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (box.current) observer.observe(box.current);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} aria-hidden className="relative select-none">
      {/* Measured at a fixed 100px; the visible copy is scaled from it. */}
      <span
        ref={measure}
        className="invisible absolute left-0 top-0 whitespace-pre text-[100px] font-semibold tracking-[-0.06em]"
      >
        {text.replace(/ /g, " ")}
      </span>
      <p
        style={{ fontSize: size ? `${size}px` : "14vw" }}
        className="flex whitespace-nowrap font-semibold leading-[0.78] tracking-[-0.06em]"
      >
        {Array.from(text).map((char, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.02em]">
            <motion.span
              data-reveal
              className="inline-block"
              initial={{ y: "105%" }}
              animate={{ y: show ? "0%" : "105%" }}
              transition={{ duration: 1, ease: EASE_OUT, delay: show ? i * 0.035 : 0 }}
            >
              {char === " " ? " " : char}
            </motion.span>
          </span>
        ))}
      </p>
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
  const rise = useTransform(scrollYProgress, [0, 1], ["16%", "0%"]);
  // The footer is fixed, so it always "intersects" the viewport; reveal by scroll depth instead.
  const [revealed, setRevealed] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (value > 0.45) setRevealed(true);
  });
  useEffect(() => {
    if (scrollYProgress.get() > 0.45) setRevealed(true);
  }, [scrollYProgress]);

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
        <footer className="footer-theme relative h-full overflow-hidden">
          <div
            aria-hidden
            className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_20%_40%,#000,transparent_75%)]"
          />
          <motion.div
            style={reduced ? undefined : { y: rise }}
            className="container-page relative flex h-full flex-col pt-24 md:pt-28"
          >
            <div className="label-mono flex items-start justify-between gap-6">
              <p className="flex items-center gap-3">
                <span>[05]</span>
                <span aria-hidden className="h-px w-10 bg-current opacity-40" />
                Contact
              </p>
              {portfolio.availability && (
                <p className="hidden items-center gap-2.5 rounded-full bg-accent-fg py-2 pl-3 pr-4 text-[10px] text-[#f1f1ec] md:flex">
                  <span className="ping-dot size-1.5 text-emerald-400" />
                  {portfolio.availability}
                </p>
              )}
              <p className="text-right">
                Local time
                <span className="mt-1 block whitespace-nowrap opacity-75">{time ?? " "}</span>
              </p>
            </div>

            <div className="mt-auto grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
              <div className="lg:col-span-8">
                <h2 className="text-[clamp(3rem,8vw,9rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
                  <span className="sr-only">Let’s build something great.</span>
                  <span aria-hidden className="block">
                    <RevealText text="Let’s build" by="char" stagger={0.025} trigger={revealed || reduced} unitClassName={HOVER_CHAR} maskClassName="pb-[0.14em] -mb-[0.14em]" />
                  </span>
                  <span aria-hidden className="block">
                    <RevealText
                      text="something *great.*"
                      by="char"
                      stagger={0.025}
                      delay={0.25}
                      trigger={revealed || reduced}
                      unitClassName={HOVER_CHAR}
                      maskClassName="pb-[0.14em] -mb-[0.14em]"
                      accentClassName="font-serif font-normal italic tracking-[-0.02em]"
                    />
                  </span>
                </h2>
                <p className="mt-5 max-w-md text-pretty text-base leading-relaxed opacity-80 md:text-lg">
                  Have a role or a project in mind? I’d love to hear about it.
                </p>
                {email && (
                  <div className="mt-7 md:mt-9">
                    <EmailActions email={email} />
                  </div>
                )}
              </div>

              <ul className="border-t border-line lg:col-span-4">
                {links.map((link, i) => (
                  <li key={link.label} className="border-b border-line">
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center gap-4 overflow-hidden px-1 py-3.5 md:py-4"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-0 translate-y-full bg-accent-fg transition-transform duration-500 ease-expo group-hover:translate-y-0 group-focus-visible:translate-y-0"
                      />
                      <span className="label-mono relative opacity-60 transition-colors duration-500 group-hover:text-accent group-focus-visible:text-accent">
                        {pad2(i + 1)}
                      </span>
                      <span className="relative flex-1 text-xl font-medium tracking-[-0.02em] transition-[color,transform] duration-500 ease-expo group-hover:translate-x-2 group-hover:text-accent group-focus-visible:text-accent md:text-2xl">
                        {link.label}
                      </span>
                      <ArrowUpRight className="relative mr-2 size-5 transition-[color,transform] duration-500 ease-expo group-hover:rotate-45 group-hover:text-accent group-focus-visible:text-accent" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 flex items-center justify-between gap-4 border-t border-line py-4 text-sm md:mt-12">
              <p className="opacity-75">© {new Date().getFullYear()} {portfolio.name}</p>
              <p className="hidden opacity-60 md:block">Built with Next.js, Tailwind CSS, Motion and Lenis.</p>
              <button type="button" onClick={() => scrollTo(0)} className="group inline-flex items-center gap-3 font-medium">
                <RollingText>Back to top</RollingText>
                <span className="grid size-9 place-items-center rounded-full border border-black/20 transition-colors duration-300 group-hover:bg-accent-fg group-hover:text-accent">
                  <ArrowUp className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5" />
                </span>
              </button>
            </div>

            <div className="-mb-[1.2vw]">
              <GiantName text={portfolio.name} show={revealed || reduced} />
            </div>
          </motion.div>
        </footer>
      </div>
    </div>
  );
}
