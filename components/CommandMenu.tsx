"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Copy,
  CornerDownLeft,
  FileText,
  Hash,
  Moon,
  Search,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { portfolio } from "@/data/portfolio";
import { toggleTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { GitHubIcon, LinkedInIcon, XIcon } from "./Icons";
import { NAV_LINKS } from "./Nav";
import { useCommand, useScrollControls, useToast } from "./Providers";

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: LucideIcon | typeof GitHubIcon;
  run: () => void;
}

const openTab = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

/** Lower is better; null means no match. Prefix beats substring beats loose subsequence. */
function score(command: Command, query: string) {
  if (!query) return 0;
  const label = command.label.toLowerCase();
  const haystack = `${label} ${command.group} ${command.hint ?? ""} ${command.keywords ?? ""}`.toLowerCase();
  if (label.startsWith(query)) return 0;
  if (label.includes(query)) return 1;
  if (haystack.includes(query)) return 2;
  let i = 0;
  for (const char of haystack) if (char === query[i]) i++;
  return i === query.length ? 3 : null;
}

/**
 * Quick navigation and actions, opened with ⌘K / Ctrl+K, "/" or the search button.
 * A combobox: focus stays in the input while arrow keys move through the results.
 */
export function CommandMenu() {
  const { open, setOpen } = useCommand();
  const { goToSection, lenis } = useScrollControls();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const listId = useId();

  const commands = useMemo<Command[]>(() => {
    const { email, github, linkedin, x } = portfolio.socials;
    const items: Command[] = NAV_LINKS.map((link) => ({
      id: `go-${link.id}`,
      group: "Navigate",
      label: link.label,
      hint: "Jump to section",
      icon: Hash,
      run: () => goToSection(link.id),
    }));
    for (const project of portfolio.projects) {
      if (project.demo)
        items.push({
          id: `demo-${project.title}`,
          group: "Projects",
          label: `Open ${project.title}`,
          hint: project.subtitle,
          keywords: project.tags.join(" "),
          icon: ArrowUpRight,
          run: () => openTab(project.demo!),
        });
      if (project.code)
        items.push({
          id: `code-${project.title}`,
          group: "Projects",
          label: `${project.title} source code`,
          hint: "GitHub",
          keywords: project.tags.join(" "),
          icon: Code2,
          run: () => openTab(project.code!),
        });
    }
    if (email)
      items.push({
        id: "copy-email",
        group: "Actions",
        label: "Copy email address",
        hint: email,
        keywords: "contact mail",
        icon: Copy,
        run: () => {
          navigator.clipboard
            .writeText(email)
            .then(() => toast("Email copied to clipboard"))
            .catch(() => (window.location.href = `mailto:${email}`));
        },
      });
    items.push({
      id: "theme",
      group: "Actions",
      label: "Switch theme",
      hint: "Light / dark",
      keywords: "dark mode light mode appearance",
      icon: Moon,
      run: () => toggleTheme(),
    });
    if (portfolio.resume)
      items.push({ id: "resume", group: "Links", label: "Résumé", hint: "PDF", keywords: "resume cv", icon: FileText, run: () => openTab(portfolio.resume!) });
    if (github) items.push({ id: "github", group: "Links", label: "GitHub", icon: GitHubIcon, run: () => openTab(github) });
    if (linkedin) items.push({ id: "linkedin", group: "Links", label: "LinkedIn", icon: LinkedInIcon, run: () => openTab(linkedin) });
    if (x) items.push({ id: "x", group: "Links", label: "X", icon: XIcon, run: () => openTab(x) });
    return items;
  }, [goToSection, toast]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return commands
      .map((command, order) => ({ command, order, rank: score(command, q) }))
      .filter((item): item is { command: Command; order: number; rank: number } => item.rank !== null)
      .sort((a, b) => a.rank - b.rank || a.order - b.order)
      .map((item) => item.command);
  }, [commands, query]);

  // Group in order of first appearance, keeping each result's flat index for keyboard movement.
  const groups = useMemo(() => {
    const map = new Map<string, { command: Command; index: number }[]>();
    results.forEach((command, i) => {
      const bucket = map.get(command.group) ?? [];
      bucket.push({ command, index: i });
      map.set(command.group, bucket);
    });
    return [...map.entries()];
  }, [results]);

  // Global shortcuts.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, [contenteditable='true']");
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "/" && !typing && !open) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Opening: remember focus, freeze the page. Closing: hand focus back.
  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setIndex(0);
    lenis?.stop();
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    if (!lenis) root.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => input.current?.focus(), 30);
    return () => {
      window.clearTimeout(focusTimer);
      lenis?.start();
      root.style.overflow = previousOverflow;
      restoreFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open, lenis]);

  useEffect(() => setIndex(0), [query]);

  // Keep the highlighted option in view.
  useEffect(() => {
    list.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const select = (command: Command | undefined) => {
    if (!command) return;
    setOpen(false);
    // Let the dialog start closing (and focus return) before scrolling or opening tabs.
    window.setTimeout(command.run, command.group === "Navigate" ? 120 : 0);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (event.key === "Home") {
      event.preventDefault();
      setIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setIndex(Math.max(0, results.length - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(results[index]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Tab") {
      // Nothing else in the dialog takes focus.
      event.preventDefault();
    }
  };

  const activeId = results[index] ? `${listId}-${results[index].id}` : undefined;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="command"
          className="fixed inset-0 z-[110] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-[6px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search and quick actions"
            initial={{ opacity: 0, y: -16, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.97, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="relative w-full max-w-xl overflow-hidden rounded-[1.4rem] border border-line-strong bg-surface shadow-[0_40px_120px_-30px_rgb(0_0_0/0.6)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search className="size-4 shrink-0 text-muted" />
              <input
                ref={input}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                aria-label="Search sections, projects and actions"
                placeholder="Search sections, projects, links…"
                spellCheck={false}
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted/80 focus-visible:outline-none"
              />
              <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-1 font-mono text-[10px] text-muted">esc</kbd>
            </div>

            <ul
              ref={list}
              id={listId}
              role="listbox"
              aria-label="Results"
              data-lenis-prevent
              className="max-h-[min(26rem,55vh)] overflow-y-auto overscroll-contain p-2"
            >
              {groups.map(([group, items]) => (
                <li key={group} role="presentation">
                  <p aria-hidden className="label-mono px-3 pb-1.5 pt-3 text-[10px] text-muted">
                    {group}
                  </p>
                  <ul role="group" aria-label={group}>
                    {items.map(({ command, index: i }) => {
                      const Icon = command.icon;
                      const selected = i === index;
                      return (
                        <li
                          key={command.id}
                          id={`${listId}-${command.id}`}
                          role="option"
                          aria-selected={selected}
                          data-index={i}
                          onPointerMove={() => setIndex(i)}
                          onClick={() => select(command)}
                          className={cn(
                            "relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-200",
                            selected ? "text-fg" : "text-fg/75",
                          )}
                        >
                          {selected && (
                            <motion.span
                              layoutId="command-active"
                              className="absolute inset-0 rounded-xl bg-fg/[0.07]"
                              transition={{ type: "spring", stiffness: 600, damping: 40 }}
                            />
                          )}
                          <span
                            className={cn(
                              "relative grid size-8 shrink-0 place-items-center rounded-lg border transition-colors duration-200",
                              selected ? "border-transparent bg-accent text-accent-fg" : "border-line bg-bg text-muted",
                            )}
                          >
                            <Icon className="size-4" />
                          </span>
                          <span className="relative min-w-0 flex-1">
                            <span className="block truncate font-medium">{command.label}</span>
                          </span>
                          {command.hint && (
                            <span className="relative hidden max-w-[45%] truncate text-xs text-muted sm:block">
                              {command.hint}
                            </span>
                          )}
                          <ArrowRight
                            className={cn(
                              "relative size-4 shrink-0 transition-all duration-300",
                              selected ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0",
                            )}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
              {results.length === 0 && (
                <li role="presentation" className="px-3 py-10 text-center text-sm text-muted">
                  Nothing matches “{query}”.
                </li>
              )}
            </ul>

            <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 font-mono text-[10.5px] text-muted">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-line bg-surface-2 px-1">↑</kbd>
                  <kbd className="rounded border border-line bg-surface-2 px-1">↓</kbd>
                  move
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="grid place-items-center rounded border border-line bg-surface-2 px-1 py-0.5">
                    <CornerDownLeft className="size-2.5" />
                  </kbd>
                  select
                </span>
              </span>
              <span className="hidden sm:inline">{results.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
