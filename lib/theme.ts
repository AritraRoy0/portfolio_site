/**
 * Switches between light and dark. Where the View Transitions API is available,
 * the new theme spreads out in a circle from `origin` (the screen centre by default).
 */
export function toggleTheme(origin?: { x: number; y: number }) {
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

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;
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
}
