"use client";

import Lenis from "lenis";
import { Check } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type ScrollTarget = string | number | HTMLElement;

interface ScrollControls {
  /** Smooth-scroll instance. Null for reduced-motion visitors, who get native scrolling. */
  lenis: Lenis | null;
  scrollTo: (target: ScrollTarget, options?: { offset?: number; immediate?: boolean }) => void;
  /** Scrolls to a section by id. The contact footer is fully uncovered only at the very bottom. */
  goToSection: (id: string) => void;
}

interface IntroState {
  /** True once the intro curtain starts lifting, so the hero can animate in. */
  introDone: boolean;
  finishIntro: () => void;
}

interface CommandState {
  open: boolean;
  setOpen: (open: boolean | ((open: boolean) => boolean)) => void;
}

interface ToastState {
  toast: (message: string) => void;
}

// Separate contexts, so each change only re-renders the components that use it.
const ScrollContext = createContext<ScrollControls | null>(null);
const IntroContext = createContext<IntroState | null>(null);
const CommandContext = createContext<CommandState | null>(null);
const ToastContext = createContext<ToastState | null>(null);

const easeInOutExpo = (t: number) =>
  t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;

export function Providers({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [introDone, setIntroDone] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [message, setMessage] = useState<{ id: number; text: string } | null>(null);
  const toastTimer = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const instance = new Lenis({ lerp: 0.09, autoRaf: true });
    setLenis(instance);
    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, []);

  const finishIntro = useCallback(() => setIntroDone(true), []);

  const scrollTo = useCallback<ScrollControls["scrollTo"]>(
    (target, options) => {
      const offset = options?.offset ?? 0;
      if (lenis) {
        lenis.scrollTo(target, {
          offset,
          immediate: options?.immediate,
          duration: 1.6,
          easing: easeInOutExpo,
          force: true,
        });
        return;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const behavior: ScrollBehavior = reduced || options?.immediate ? "auto" : "smooth";
      if (typeof target === "number") {
        window.scrollTo({ top: target, behavior });
        return;
      }
      const element = typeof target === "string" ? document.querySelector(target) : target;
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior });
      }
    },
    [lenis],
  );

  const goToSection = useCallback(
    (id: string) => {
      scrollTo(id === "contact" ? document.documentElement.scrollHeight : id === "top" ? 0 : `#${id}`);
      document.getElementById(id)?.focus({ preventScroll: true });
    },
    [scrollTo],
  );

  const toast = useCallback((text: string) => {
    window.clearTimeout(toastTimer.current);
    setMessage({ id: Date.now(), text });
    toastTimer.current = window.setTimeout(() => setMessage(null), 2400);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const scrollValue = useMemo(() => ({ lenis, scrollTo, goToSection }), [lenis, scrollTo, goToSection]);
  const introValue = useMemo(() => ({ introDone, finishIntro }), [introDone, finishIntro]);
  const commandValue = useMemo(() => ({ open: commandOpen, setOpen: setCommandOpen }), [commandOpen]);
  const toastValue = useMemo(() => ({ toast }), [toast]);

  return (
    <ScrollContext.Provider value={scrollValue}>
      <IntroContext.Provider value={introValue}>
        <CommandContext.Provider value={commandValue}>
          <ToastContext.Provider value={toastValue}>
            <MotionConfig reducedMotion="user">
              {children}
              <div
                role="status"
                aria-live="polite"
                className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex justify-center px-4"
              >
                <AnimatePresence>
                  {message && (
                    <motion.p
                      key={message.id}
                      initial={{ opacity: 0, y: 24, scale: 0.9, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: 12, scale: 0.95, filter: "blur(4px)" }}
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      className="flex items-center gap-2.5 rounded-full bg-fg py-2.5 pl-2.5 pr-5 text-sm font-medium text-bg shadow-float"
                    >
                      <span className="grid size-6 place-items-center rounded-full bg-accent text-accent-fg">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      {message.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </MotionConfig>
          </ToastContext.Provider>
        </CommandContext.Provider>
      </IntroContext.Provider>
    </ScrollContext.Provider>
  );
}

export function useScrollControls() {
  const context = useContext(ScrollContext);
  if (!context) throw new Error("useScrollControls must be used inside <Providers>");
  return context;
}

export function useIntro() {
  const context = useContext(IntroContext);
  if (!context) throw new Error("useIntro must be used inside <Providers>");
  return context;
}

export function useCommand() {
  const context = useContext(CommandContext);
  if (!context) throw new Error("useCommand must be used inside <Providers>");
  return context;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <Providers>");
  return context.toast;
}
