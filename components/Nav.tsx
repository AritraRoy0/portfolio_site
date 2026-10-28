"use client";

import { ArrowUp, ArrowUpRight, Search } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
import { portfolio, type SocialKey } from "@/data/portfolio";
import { useIsMac } from "@/lib/hooks";
import { cn, EASE_IN_OUT, EASE_OUT, initialsOf, pad2 } from "@/lib/utils";
import { socialIcons, socialLabels } from "./Icons";
import { useCommand, useIntro, useScrollControls } from "./Providers";
import { ThemeToggle } from "./ThemeToggle";
import { btn } from "./ui/buttons";
import { RollingText } from "./ui/RollingText";

interface NavLink {
  id: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { id: "about", label: "About" },
  ...(portfolio.experience.length || portfolio.leadership.length ? [{ id: "experience", label: "Experience" }] : []),
  ...(portfolio.projects.length ? [{ id: "work", label: "Work" }] : []),
  ...(portfolio.skills.length ? [{ id: "toolkit", label: "Toolkit" }] : []),
  { id: "contact", label: "Contact" },
];

const initials = initialsOf(portfolio.name);

export function Nav() {
  const { goToSection, lenis } = useScrollControls();
  const { introDone } = useIntro();
  const { setOpen: setCommandOpen } = useCommand();
  const isMac = useIsMac();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
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
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
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
    requestAnimationFrame(() => goToSection(id));
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
        className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-4"
      >
        <div className="container-page relative flex items-center justify-between gap-4">
          <a
            href="#top"
            onClick={go("top")}
            className="group flex items-center gap-3 rounded-full lg:glass lg:py-1 lg:pl-1 lg:pr-5 lg:shadow-float"
          >
            <span
              aria-hidden
              className="relative grid size-10 place-items-center overflow-hidden rounded-full bg-accent text-[13px] font-semibold tracking-tight text-accent-fg lg:size-9"
            >
              <span className="transition-transform duration-500 ease-quart group-hover:-translate-y-[180%]">
                {initials}
              </span>
              <ArrowUp className="absolute size-4 translate-y-[180%] transition-transform duration-500 ease-quart group-hover:translate-y-0" />
            </span>
            {/* Visible name on large screens; screen readers always hear "<name>, back to top". */}
            <span className="hidden text-sm font-medium lg:block">
              <RollingText>{portfolio.name}</RollingText>
            </span>
            <span className="sr-only lg:hidden">{portfolio.name}</span>
            <span className="sr-only">, back to top</span>
          </a>

          <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 md:block">
            <ul
              onPointerLeave={() => setHovered(null)}
              className="glass flex items-center gap-0.5 rounded-full p-1 shadow-float"
            >
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={go(link.id)}
                    onPointerEnter={() => setHovered(link.id)}
                    onFocus={() => setHovered(link.id)}
                    onBlur={() => setHovered(null)}
                    aria-current={active === link.id ? "location" : undefined}
                    className={cn(
                      "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors duration-300",
                      active === link.id || hovered === link.id ? "text-fg" : "text-fg/65",
                    )}
                  >
                    {hovered === link.id && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-full bg-fg/[0.07]"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    {active === link.id && (
                      <motion.span
                        layoutId="nav-active"
                        aria-hidden
                        className="relative size-1.5 rounded-full bg-accent-ink"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              aria-label="Search and quick actions"
              aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
              className="glass group hidden h-10 items-center gap-2 rounded-full pl-3.5 pr-1.5 text-sm text-fg/70 transition-colors duration-300 hover:border-line-strong hover:text-fg lg:flex"
            >
              <Search className="size-4 transition-transform duration-500 ease-expo group-hover:-rotate-12 group-hover:scale-110" />
              <kbd className="rounded-full border border-line bg-surface-2 px-2 py-1 font-mono text-[10.5px] leading-none tracking-wide">
                {isMac ? "⌘K" : "Ctrl K"}
              </kbd>
            </button>
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
              className="glass relative grid size-10 place-items-center rounded-full md:hidden"
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
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000,transparent_70%)]" />
      <nav aria-label="Mobile" className="container-page relative flex flex-1 flex-col justify-between pb-10 pt-28">
        <ul className="border-t border-line">
          {NAV_LINKS.map((link, i) => (
            <li key={link.id} className="overflow-hidden border-b border-line">
              <motion.a
                ref={i === 0 ? firstLink : undefined}
                href={`#${link.id}`}
                onClick={go(link.id)}
                aria-current={active === link.id ? "location" : undefined}
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                exit={{ y: "105%" }}
                transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.15 + i * 0.06 }}
                className="group flex items-center gap-4 py-3 text-[clamp(2.25rem,11vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.045em]"
              >
                <span className="font-mono text-xs font-normal tracking-[0.2em] text-accent-ink">{pad2(i + 1)}</span>
                <span className="flex-1">{link.label}</span>
                <ArrowUpRight
                  className={cn(
                    "size-6 transition-transform duration-500 ease-expo group-active:translate-x-1",
                    active === link.id ? "text-accent-ink" : "text-muted",
                  )}
                />
              </motion.a>
            </li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: EASE_OUT }}
          className="space-y-5 pt-6"
        >
          {portfolio.availability && (
            <p className="label-mono flex items-center gap-2.5 text-muted">
              <span className="ping-dot text-emerald-500" />
              {portfolio.availability}
            </p>
          )}
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
