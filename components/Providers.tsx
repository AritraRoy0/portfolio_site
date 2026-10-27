"use client";

import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ScrollTarget = string | number | HTMLElement;

interface ScrollControls {
  /** Smooth-scroll instance. Null for reduced-motion visitors, who get native scrolling. */
  lenis: Lenis | null;
  scrollTo: (target: ScrollTarget, options?: { offset?: number; immediate?: boolean }) => void;
}

interface IntroState {
  /** True once the intro curtain starts lifting, so the hero can animate in. */
  introDone: boolean;
  finishIntro: () => void;
}

// Two contexts, so finishing the intro only re-renders the components that animate on it.
const ScrollContext = createContext<ScrollControls | null>(null);
const IntroContext = createContext<IntroState | null>(null);

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

  const scrollValue = useMemo(() => ({ lenis, scrollTo }), [lenis, scrollTo]);
  const introValue = useMemo(() => ({ introDone, finishIntro }), [introDone, finishIntro]);

  return (
    <ScrollContext.Provider value={scrollValue}>
      <IntroContext.Provider value={introValue}>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
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
