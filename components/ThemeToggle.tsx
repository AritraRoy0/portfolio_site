"use client";

import { MoonIcon, SunIcon } from "./Icons";
import { iconBtn } from "./ui";

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const saved = root.getAttribute("data-theme");
    const isDark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = isDark ? "light" : "dark";

    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked (e.g. private mode). The toggle still works for this visit.
    }
  }

  // Both icons are rendered; CSS shows the right one, so there is no hydration mismatch.
  return (
    <button type="button" onClick={toggle} aria-label="Toggle dark mode" className={iconBtn}>
      <SunIcon className="hidden size-[18px] dark:block" />
      <MoonIcon className="block size-[18px] dark:hidden" />
    </button>
  );
}
