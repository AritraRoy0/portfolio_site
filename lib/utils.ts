import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export type Bezier = [number, number, number, number];

/** Fast start, long soft landing. Used for most reveals. */
export const EASE_OUT: Bezier = [0.16, 1, 0.3, 1];
/** Symmetric, weighty. Used for curtains and page-level moves. */
export const EASE_IN_OUT: Bezier = [0.76, 0, 0.24, 1];

export const pad2 = (n: number) => String(n).padStart(2, "0");

/** Removes the *highlight* markers used in copy. */
export const plain = (text: string) => text.replace(/\*/g, "");

export function hostOf(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export interface Token {
  text: string;
  accent: boolean;
}

/**
 * Splits copy into words for animation. Words wrapped in *asterisks* are flagged
 * as accent. Each group holds tokens that must stay together on one line, such as
 * a highlighted word and the comma right after it.
 */
export function tokenize(input: string): Token[][] {
  const groups: Token[][] = [];
  let joinNext = false;

  const pushSegment = (segment: string, accent: boolean) => {
    for (const part of segment.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        joinNext = false;
        continue;
      }
      if (joinNext && groups.length > 0) groups[groups.length - 1].push({ text: part, accent });
      else groups.push([{ text: part, accent }]);
      joinNext = true;
    }
  };

  const pattern = /\*([^*]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(input)) !== null) {
    pushSegment(input.slice(last, match.index), false);
    pushSegment(match[1], true);
    last = match.index + match[0].length;
  }
  pushSegment(input.slice(last), false);
  return groups;
}
