import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
/**
 * Use with useMediaQuery when the preference changes what gets rendered. Unlike
 * Motion's useReducedMotion, it is false during hydration and updates right after,
 * so server and client markup always match.
 */
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Keep in sync with the `wide` custom variant in globals.css. */
export const WIDE_QUERY = "(min-width: 64rem) and (min-height: 40rem)";

/** Subscribes to a media query. Returns `serverFallback` during SSR and hydration. */
export function useMediaQuery(query: string, serverFallback = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}

const noopSubscribe = () => () => {};

/** True on Apple platforms, for showing ⌘ instead of Ctrl. False during SSR and hydration. */
export function useIsMac() {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => false,
  );
}

/** Live clock for a time zone, e.g. "3:42 PM EST". Null until mounted to avoid hydration mismatches. */
export function useLocalTime(timeZone?: string) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    if (!timeZone) return;
    const format = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
      timeZoneName: "short",
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return time;
}
