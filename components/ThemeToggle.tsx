"use client";

import { Moon, Sun } from "lucide-react";
import type { MouseEvent } from "react";
import { toggleTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Light/dark switch. The new theme spreads out in a circle from the button. */
export function ThemeToggle({ className }: { className?: string }) {
  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Keyboard activation has no pointer position, so start from the button's centre.
    const rect = event.currentTarget.getBoundingClientRect();
    toggleTheme({
      x: event.detail > 0 ? event.clientX : rect.left + rect.width / 2,
      y: event.detail > 0 ? event.clientY : rect.top + rect.height / 2,
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Toggle dark mode"
      className={cn(
        "glass relative grid size-10 place-items-center overflow-hidden rounded-full transition-colors duration-300 hover:border-line-strong",
        className,
      )}
    >
      {/* Both icons render; CSS shows the right one, so server and client markup match. */}
      <Sun className="absolute size-4 rotate-90 scale-0 transition-transform duration-700 ease-expo dark:rotate-0 dark:scale-100" />
      <Moon className="absolute size-4 rotate-0 scale-100 transition-transform duration-700 ease-expo dark:-rotate-90 dark:scale-0" />
    </button>
  );
}
