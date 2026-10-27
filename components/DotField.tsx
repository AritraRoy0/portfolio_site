"use client";

import { useEffect, useRef } from "react";

type Rgb = [number, number, number];

const RADIUS = 180;
const TAU = Math.PI * 2;
// Resting dots are grouped into a few opacity steps so each frame needs ~10 fill calls instead of ~1,500.
const ALPHA_STEPS = 10;
const ALPHA_MIN = 0.12;
const ALPHA_RANGE = 0.16;

function readRgb(name: string, fallback: Rgb): Rgb {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parts = raw.split(/[\s,]+/).map(Number);
  return parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite) ? [parts[0], parts[1], parts[2]] : fallback;
}

/**
 * Canvas dot grid behind the hero. Dots breathe in a slow wave, and around the
 * cursor they swell, part and warm up to the accent colour.
 *
 * Runs only while `active` (after the intro), drops to 30fps when nobody is
 * interacting, pauses when the hero is covered or the tab is hidden, and draws a
 * single still frame for reduced motion.
 */
export function DotField({ className, active = true }: { className?: string; active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let gap = 28;
    let frame = 0;
    let tick = 0;
    let running = false;
    let fg = readRgb("--fg-rgb", [17, 17, 16]);
    let accent = readRgb("--accent-rgb", [255, 90, 36]);
    let bucketStyles: string[] = [];
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, strength: 0, targetStrength: 0 };

    const buildStyles = () => {
      bucketStyles = Array.from({ length: ALPHA_STEPS }, (_, step) => {
        const alpha = ALPHA_MIN + ((step + 0.5) / ALPHA_STEPS) * ALPHA_RANGE;
        return `rgba(${fg[0]},${fg[1]},${fg[2]},${alpha.toFixed(3)})`;
      });
    };
    buildStyles();

    const draw = (now: number) => {
      const t = reduced ? 0 : now / 1000;
      pointer.x += (pointer.targetX - pointer.x) * 0.12;
      pointer.y += (pointer.targetY - pointer.y) * 0.12;
      pointer.strength += (pointer.targetStrength - pointer.strength) * 0.08;
      const interacting = pointer.strength > 0.01;

      ctx.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / gap) + 1;
      const rows = Math.ceil(height / gap) + 1;
      const offsetX = (width - (cols - 1) * gap) / 2;
      const offsetY = (height - (rows - 1) * gap) / 2;
      const buckets = Array.from({ length: ALPHA_STEPS }, () => new Path2D());

      for (let i = 0; i < cols; i++) {
        const baseX = offsetX + i * gap;
        const waveX = Math.sin(baseX * 0.0075 + t * 0.55);
        for (let j = 0; j < rows; j++) {
          const baseY = offsetY + j * gap;
          const wave = waveX * Math.cos(baseY * 0.0105 - t * 0.4);

          let k = 0;
          let dx = 0;
          let dy = 0;
          let dist = 0;
          if (interacting) {
            dx = baseX - pointer.x;
            dy = baseY - pointer.y;
            dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < RADIUS) {
              const f = 1 - dist / RADIUS;
              k = f * f * (3 - 2 * f) * pointer.strength;
            }
          }

          if (k < 0.01) {
            const radius = 0.85 + (wave + 1) * 0.45;
            const step = Math.min(ALPHA_STEPS - 1, ((wave + 1) * 0.5 * ALPHA_STEPS) | 0);
            const path = buckets[step];
            path.moveTo(baseX + radius, baseY);
            path.arc(baseX, baseY, radius, 0, TAU);
            continue;
          }

          // Dots near the cursor: drawn one by one with their own colour and size.
          const push = (k * 16) / Math.max(dist, 1);
          const radius = 0.85 + (wave + 1) * 0.45 + k * 2;
          const alpha = Math.min(1, ALPHA_MIN + (wave + 1) * 0.08 + k * 0.6);
          const r = fg[0] + (accent[0] - fg[0]) * k;
          const g = fg[1] + (accent[1] - fg[1]) * k;
          const b = fg[2] + (accent[2] - fg[2]) * k;
          ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
          ctx.beginPath();
          ctx.arc(baseX + dx * push, baseY + dy * push, radius, 0, TAU);
          ctx.fill();
        }
      }

      for (let step = 0; step < ALPHA_STEPS; step++) {
        ctx.fillStyle = bucketStyles[step];
        ctx.fill(buckets[step]);
      }
    };

    const loop = (now: number) => {
      tick += 1;
      // The ambient wave is slow, so idle frames can run at half rate.
      if (pointer.strength > 0.01 || pointer.targetStrength > 0 || tick % 2 === 0) draw(now);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    // The hero is pinned while the page slides over it, so visibility is about scroll depth.
    const sync = () =>
      activeRef.current && !document.hidden && window.scrollY < height ? start() : stop();
    syncRef.current = sync;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      gap = width < 640 ? 24 : width > 1800 ? 34 : 28;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
      sync();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || reduced) return;
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = event.clientX - rect.left;
      pointer.targetY = event.clientY - rect.top;
      if (pointer.targetStrength === 0) {
        pointer.x = pointer.targetX;
        pointer.y = pointer.targetY;
      }
      pointer.targetStrength = 1;
    };
    const onPointerLeave = () => {
      pointer.targetStrength = 0;
    };
    const onTheme = () => {
      fg = readRgb("--fg-rgb", fg);
      accent = readRgb("--accent-rgb", accent);
      buildStyles();
      if (!running) draw(performance.now());
    };

    const themeObserver = new MutationObserver(onTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    darkQuery.addEventListener("change", onTheme);

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", sync, { passive: true });
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);

    return () => {
      stop();
      syncRef.current = () => {};
      themeObserver.disconnect();
      darkQuery.removeEventListener("change", onTheme);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  useEffect(() => {
    activeRef.current = active;
    syncRef.current();
  }, [active]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
