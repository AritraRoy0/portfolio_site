"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { REDUCED_MOTION, useMediaQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";

// The same tiny function in each language. Unknown languages get a placeholder.
const SNIPPETS: Record<string, { file: string; code: string }> = {
  python: {
    file: "greet.py",
    code: `# ship it\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nprint(greet("world"))`,
  },
  javascript: {
    file: "greet.js",
    code: `// ship it\nconst greet = (name) =>\n  \`Hello, \${name}!\`;\n\nconsole.log(greet("world"));`,
  },
  typescript: {
    file: "greet.ts",
    code: `// ship it\nconst greet = (name: string): string =>\n  \`Hello, \${name}!\`;\n\nconsole.log(greet("world"));`,
  },
  java: {
    file: "Greet.java",
    code: `// ship it\nstatic String greet(String name) {\n  return "Hello, " + name + "!";\n}\n\nSystem.out.println(greet("world"));`,
  },
  c: {
    file: "greet.c",
    code: `// ship it\nvoid greet(const char *name) {\n  printf("Hello, %s!\\n", name);\n}\n\ngreet("world");`,
  },
};

const snippetFor = (language: string) =>
  SNIPPETS[language.toLowerCase()] ?? {
    file: language.toLowerCase().replace(/\W+/g, "-"),
    code: `// ${language}\n// snippet coming soon`,
  };

const TOKEN =
  /(\/\/.*|#.*)|(f?"(?:[^"\\\n]|\\.)*"?|`[^`]*`?)|\b(def|return|const|let|static|void|char|String|str|string|print|printf)\b|(\b\w+(?=\())|(=>|->)/g;
const TOKEN_CLASS = ["text-muted/70 italic", "text-accent-ink", "text-[#7aa2ff] dark:text-[#8fb3ff]", "text-fg", "text-[#c792ea]"];

/** Light syntax colouring that tolerates half-typed code. */
function highlight(code: string) {
  const parts: { text: string; className?: string }[] = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    if (start > last) parts.push({ text: code.slice(last, start) });
    const group = match.slice(1).findIndex((value) => value !== undefined);
    parts.push({ text: match[0], className: TOKEN_CLASS[group] });
    last = start + match[0].length;
  }
  if (last < code.length) parts.push({ text: code.slice(last) });
  return parts;
}

/**
 * A tiny editor that types the same function in each language, one after another.
 * Picking a tab shows that language and stops the rotation.
 */
export function CodeTyper({ languages }: { languages: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduced = useMediaQuery(REDUCED_MOTION);
  const [current, setCurrent] = useState(0);
  const [typed, setTyped] = useState(0);
  const [pinned, setPinned] = useState(false);
  const { file, code } = snippetFor(languages[current] ?? "");
  const shown = reduced ? code.length : typed;

  useEffect(() => {
    if (reduced || !inView) return;
    if (typed < code.length) {
      const id = window.setTimeout(() => setTyped((n) => Math.min(code.length, n + 2)), 34);
      return () => window.clearTimeout(id);
    }
    if (pinned || languages.length < 2) return;
    const id = window.setTimeout(() => {
      setCurrent((i) => (i + 1) % languages.length);
      setTyped(0);
    }, 2600);
    return () => window.clearTimeout(id);
  }, [reduced, inView, typed, code.length, pinned, languages.length]);

  const pick = (i: number) => {
    setPinned(true);
    if (i === current) return;
    setCurrent(i);
    setTyped(0);
  };

  const lines = code.slice(0, shown).split("\n");

  return (
    <div ref={ref} className="flex h-full flex-col gap-4">
      <ul className="flex flex-wrap gap-2" aria-label="Languages">
        {languages.map((language, i) => (
          <li key={language}>
            <button
              type="button"
              onClick={() => pick(i)}
              aria-pressed={i === current}
              className={cn(
                "relative rounded-full border px-4 py-2 text-[15px] font-medium transition-colors duration-300",
                i === current ? "border-transparent text-accent-fg" : "border-line bg-bg/60 hover:border-line-strong",
              )}
            >
              {i === current && (
                <motion.span
                  layoutId="code-tab"
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{language}</span>
            </button>
          </li>
        ))}
      </ul>

      <div aria-hidden className="flex min-h-[13.5rem] flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-bg/70">
        <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="size-2 rounded-full bg-fg/15" />
            <span className="size-2 rounded-full bg-fg/15" />
            <span className="size-2 rounded-full bg-fg/15" />
          </span>
          <span className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-[10.5px] text-muted">{file}</span>
          <span className="label-mono ml-auto text-[9.5px] text-muted">utf-8</span>
        </div>
        <pre className="flex-1 overflow-hidden p-4 font-mono text-[12.5px] leading-[1.75] md:text-[13px]">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="w-7 shrink-0 select-none text-right text-muted/50">{i + 1}</span>
              <span className="pl-4 whitespace-pre">
                {highlight(line).map((part, j) => (
                  <span key={j} className={part.className}>
                    {part.text}
                  </span>
                ))}
                {i === lines.length - 1 && <span className="caret ml-px inline-block h-[1.1em] w-[0.5em] translate-y-[0.2em] bg-accent-ink" />}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
