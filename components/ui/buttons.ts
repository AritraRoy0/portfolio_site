// Shared class names so buttons look and behave the same everywhere.
// Each button is a `group`, so a <RollingText> label inside it rolls on hover.

const base =
  "group relative inline-flex items-center justify-center gap-2.5 rounded-full text-sm font-medium transition-[background-color,color,border-color] duration-300";

export const btn = {
  primary: `${base} bg-fg px-6 py-3.5 text-bg hover:bg-accent hover:text-accent-fg`,
  ghost: `${base} border border-line bg-bg/50 px-6 py-3.5 backdrop-blur-md hover:border-fg/60`,
  accent: `${base} bg-accent px-5 py-2.5 text-accent-fg hover:bg-fg hover:text-bg`,
};
