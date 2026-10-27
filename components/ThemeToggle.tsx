"use client";

import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";

/**
 * Switches between light and dark. Where the View Transitions API is available,
 * the new theme spreads out in a circle from the button.
 */
export function ThemeToggle() {
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const saved = root.getAttribute("data-theme");
    const isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = isDark ? "light" : "dark";

    const apply = () => {
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch {
        // Storage blocked: the choice still applies for this visit.
      }
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof document.startViewTransition !== "function" || reduced) {
      apply();
      return;
    }

    // Keyboard activation has no pointer position, so start from the button's centre.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.detail > 0 ? event.clientX : rect.left + rect.width / 2;
    const y = event.detail > 0 ? event.clientY : rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(apply);
    transition.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 800, easing: "cubic-bezier(0.76, 0, 0.24, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="relative grid size-10 place-items-center overflow-hidden rounded-full border border-line bg-bg/70 backdrop-blur-md transition-colors duration-300 hover:border-fg/50"
    >
      {/* Both icons render; CSS shows the right one, so server and client markup match. */}
      <Sun className="absolute size-4 rotate-90 scale-0 transition-transform duration-700 ease-expo dark:rotate-0 dark:scale-100" />
      <Moon className="absolute size-4 rotate-0 scale-100 transition-transform duration-700 ease-expo dark:-rotate-90 dark:scale-0" />
    </button>
  );
}
