"use client";

import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { iconBtn } from "./ui";

type NavLink = { href: string; label: string };

export function Nav({ name, links }: { name: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a href="#top" className="text-[1.05rem] font-extrabold tracking-tight">
          {name}
        </a>

        <nav
          id="nav-links"
          className={`${open ? "flex" : "hidden"} absolute inset-x-0 top-16 flex-col border-b border-line bg-bg md:static md:flex md:flex-row md:gap-7 md:border-0 md:bg-transparent`}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-t border-line px-5 py-3.5 font-medium text-muted transition-colors hover:text-fg md:border-0 md:p-0 md:text-[0.95rem]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-links"
            onClick={() => setOpen((o) => !o)}
            className={`${iconBtn} content-center gap-1 md:hidden`}
          >
            <span className="block h-0.5 w-[18px] rounded bg-current" />
            <span className="block h-0.5 w-[18px] rounded bg-current" />
            <span className="block h-0.5 w-[18px] rounded bg-current" />
          </button>
        </div>
      </div>
    </header>
  );
}
