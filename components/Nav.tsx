"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
import { portfolio, type SocialKey } from "@/data/portfolio";
import { cn, EASE_IN_OUT, EASE_OUT, pad2 } from "@/lib/utils";
import { socialIcons, socialLabels } from "./Icons";
import { useIntro, useScrollControls } from "./Providers";
import { ThemeToggle } from "./ThemeToggle";
import { btn } from "./ui/buttons";
import { RollingText } from "./ui/RollingText";

interface NavLink {
  id: string;
  label: string;
}

const LINKS: NavLink[] = [
  { id: "about", label: "About" },
  ...(portfolio.experience.length || portfolio.leadership.length ? [{ id: "experience", label: "Experience" }] : []),
  ...(portfolio.projects.length ? [{ id: "work", label: "Work" }] : []),
  ...(portfolio.skills.length ? [{ id: "toolkit", label: "Toolkit" }] : []),
  { id: "contact", label: "Contact" },
];

const initials = portfolio.name
  .split(/\s+/)
  .map((word) => word[0])
  .join("")
  .slice(0, 2)
  .toUpperCase();

export function Nav() {
  const { scrollTo, lenis } = useScrollControls();
  const { introDone } = useIntro();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstMenuLink = useRef<HTMLAnchorElement>(null);
  const skipRefocus = useRef(false);

  // Tuck the bar away while scrolling down; bring it back on any upward scroll.
  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(y > previous && y > window.innerHeight * 0.5);
    if (y < window.innerHeight * 0.5) setActive(null);
  });

  // Highlight the section in the middle of the screen.
  useEffect(() => {
    const sections = LINKS.map((link) => document.getElementById(link.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Mobile menu: freeze the page, close on Escape, move focus in and back out.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    if (!lenis) root.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => firstMenuLink.current?.focus(), 200);
    return () => {
      lenis?.start();
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      if (skipRefocus.current) skipRefocus.current = false;
      else menuButton.current?.focus();
    };
  }, [open, lenis]);

  const go = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (open) {
      skipRefocus.current = true;
      setOpen(false);
    }
    requestAnimationFrame(() => {
      // The contact footer is fully uncovered only at the very bottom of the page.
      scrollTo(id === "contact" ? document.documentElement.scrollHeight : `#${id}`);
      document.getElementById(id)?.focus({ preventScroll: true });
    });
  };

  const toTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (open) {
      skipRefocus.current = true;
      setOpen(false);
    }
    scrollTo(0);
  };

  const shown = introDone && (!hidden || open);

  return (
    <>
      <motion.header
        data-reveal
        initial={{ y: "-200%" }}
        animate={{ y: shown ? "0%" : "-200%" }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        onFocusCapture={() => setHidden(false)}
        className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-5"
      >
        <div className="container-page relative flex items-center justify-between gap-4">
          <a
            href="#top"
            onClick={toTop}
            className="group flex items-center gap-3 rounded-full lg:border lg:border-line lg:bg-bg/85 lg:py-1 lg:pl-1 lg:pr-5 lg:shadow-[0_10px_40px_-15px_rgb(0_0_0/0.3)] lg:backdrop-blur-xl"
          >
            <span
              aria-hidden
              className="grid size-10 place-items-center rounded-full bg-fg text-[13px] font-semibold tracking-tight text-bg transition-transform duration-700 ease-expo group-hover:-rotate-12 lg:size-9"
            >
              {initials}
            </span>
            {/* Visible name on large screens; screen readers always hear "<name>, back to top". */}
            <span className="hidden text-sm font-medium lg:block">
              <RollingText>{portfolio.name}</RollingText>
            </span>
            <span className="sr-only lg:hidden">{portfolio.name}</span>
            <span className="sr-only">, back to top</span>
          </a>

          <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 md:block">
            <ul className="flex items-center gap-0.5 rounded-full border border-line bg-bg/85 p-1 shadow-[0_10px_40px_-15px_rgb(0_0_0/0.3)] backdrop-blur-xl">
              {LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={go(link.id)}
                    aria-current={active === link.id ? "location" : undefined}
                    className={cn(
                      "relative block rounded-full px-4 py-2 text-sm transition-colors duration-300",
                      active === link.id ? "text-fg" : "text-fg/70 hover:text-fg",
                    )}
                  >
                    {active === link.id && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-surface-2"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <span className="relative">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden lg:block">
              <a href="#contact" onClick={go("contact")} className={btn.accent}>
                <RollingText>Let’s talk</RollingText>
              </a>
            </span>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative grid size-10 place-items-center rounded-full border border-line bg-bg/70 backdrop-blur-md md:hidden"
            >
              <span
                className={cn(
                  "absolute h-[1.5px] w-4 rounded bg-current transition-transform duration-500 ease-expo",
                  open ? "rotate-45" : "-translate-y-[3px]",
                )}
              />
              <span
                className={cn(
                  "absolute h-[1.5px] w-4 rounded bg-current transition-transform duration-500 ease-expo",
                  open ? "-rotate-45" : "translate-y-[3px]",
                )}
              />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && <MobileMenu go={go} firstLink={firstMenuLink} active={active} />}
      </AnimatePresence>
    </>
  );
}

function MobileMenu({
  go,
  firstLink,
  active,
}: {
  go: (id: string) => (event: MouseEvent<HTMLAnchorElement>) => void;
  firstLink: RefObject<HTMLAnchorElement | null>;
  active: string | null;
}) {
  const socials = (Object.keys(socialLabels) as SocialKey[]).filter((key) => key !== "email" && portfolio.socials[key]);
  const email = portfolio.socials.email;

  return (
    <motion.div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      initial={{ clipPath: "circle(0% at 100% 0%)" }}
      animate={{ clipPath: "circle(150% at 100% 0%)" }}
      exit={{ clipPath: "circle(0% at 100% 0%)" }}
      transition={{ duration: 0.8, ease: EASE_IN_OUT }}
      className="fixed inset-0 z-40 flex flex-col bg-bg md:hidden"
    >
      <nav aria-label="Mobile" className="container-page flex flex-1 flex-col justify-between pb-10 pt-28">
        <ul>
          {LINKS.map((link, i) => (
            <li key={link.id} className="overflow-hidden">
              <motion.a
                ref={i === 0 ? firstLink : undefined}
                href={`#${link.id}`}
                onClick={go(link.id)}
                aria-current={active === link.id ? "location" : undefined}
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                exit={{ y: "105%" }}
                transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.15 + i * 0.06 }}
                className="flex items-baseline gap-4 py-1 text-[clamp(2.75rem,13vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.045em]"
              >
                <span className="font-mono text-xs font-normal tracking-[0.2em] text-accent-ink">{pad2(i + 1)}</span>
                {link.label}
              </motion.a>
            </li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: EASE_OUT }}
          className="space-y-5 border-t border-line pt-6"
        >
          {email && (
            <a href={`mailto:${email}`} className="block text-lg font-medium">
              {email}
            </a>
          )}
          <ul className="flex gap-3">
            {socials.map((key) => {
              const Icon = socialIcons[key];
              return (
                <li key={key}>
                  <a
                    href={portfolio.socials[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={socialLabels[key]}
                    className="grid size-12 place-items-center rounded-full border border-line"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </nav>
    </motion.div>
  );
}
