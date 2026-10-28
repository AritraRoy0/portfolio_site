// Shared class names so buttons look and behave the same everywhere.
// Each button is a `group`, so a <RollingText> label inside it rolls on hover,
// and a colour fill sweeps up from the bottom edge.

const base =
  "group relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full text-sm font-medium transition-[color,border-color,box-shadow] duration-500 ease-expo [&>*]:relative before:absolute before:inset-0 before:translate-y-[101%] before:rounded-[inherit] before:transition-transform before:duration-500 before:ease-expo hover:before:translate-y-0 focus-visible:before:translate-y-0";

export const btn = {
  primary: `${base} bg-fg px-6 py-3.5 text-bg before:bg-accent hover:text-accent-fg focus-visible:text-accent-fg`,
  ghost: `${base} glass px-6 py-3.5 before:bg-fg hover:border-fg hover:text-bg focus-visible:text-bg`,
  accent: `${base} bg-accent px-5 py-2.5 text-accent-fg before:bg-fg hover:text-bg focus-visible:text-bg`,
};
