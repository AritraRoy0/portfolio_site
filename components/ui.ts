// Shared class names so buttons look the same everywhere.

const btnBase =
  "inline-flex items-center gap-2 rounded-[10px] border px-5 py-3 text-[0.95rem] font-semibold transition hover:-translate-y-px";

export const btnPrimary = `${btnBase} border-transparent bg-accent text-accent-fg`;

export const btnGhost = `${btnBase} border-line bg-surface hover:border-accent`;

export const iconBtn =
  "inline-grid size-10 cursor-pointer place-items-center rounded-[10px] border border-line bg-surface text-fg";
