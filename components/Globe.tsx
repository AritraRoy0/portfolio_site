"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { LAND_MASK, LAND_STEP } from "@/data/landmask";
import { cn, EASE_OUT } from "@/lib/utils";

type Rgb = [number, number, number];
type Vec = [number, number, number];

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
// Land dots are grouped by depth so each frame needs a handful of fill calls instead of thousands.
const DEPTH_STEPS = 8;
/** Depth steps (from the back) small enough to draw as squares. */
const SQUARE_STEPS = 5;
/** Resting spin in radians per second. */
const SPIN = 0.07;
/** The view starts over the Atlantic, tilted to favour the northern hemisphere. */
const START_YAW = 52 * DEG;
const PITCH = 20 * DEG;
const MAX_ARCS = 7;
const INTRO_MS = 2000;

/*
 * Decorative fleet nodes as [lat, lon], eight on each of four continents.
 * They are unlabelled: the point is a network that spans the globe.
 */
const NODES: [number, number][] = [
  [42.36, -71.06], [40.71, -74.0], [37.77, -122.42], [41.88, -87.63],
  [43.65, -79.38], [30.27, -97.74], [47.61, -122.33], [33.75, -84.39],
  [51.51, -0.13], [50.11, 8.68], [48.86, 2.35], [52.37, 4.9],
  [40.42, -3.7], [59.33, 18.07], [45.46, 9.19], [53.35, -6.26],
  [35.68, 139.69], [1.35, 103.82], [37.57, 126.98], [19.08, 72.88],
  [22.32, 114.17], [12.97, 77.59], [25.03, 121.57], [31.23, 121.47],
  [-33.87, 151.21], [-37.81, 144.96], [-27.47, 153.03], [-31.95, 115.86],
  [-34.93, 138.6], [-12.46, 130.84], [-23.7, 133.88], [-42.88, 147.33],
];

const toVec = (lat: number, lon: number): Vec => [
  Math.cos(lat) * Math.sin(lon),
  Math.sin(lat),
  Math.cos(lat) * Math.cos(lon),
];

let landCache: Float32Array | null = null;

/** Unit vectors for every land dot, decoded from the packed mask in data/landmask.ts. */
function landPoints() {
  if (landCache) return landCache;
  const bits = atob(LAND_MASK);
  const out: number[] = [];
  let k = 0;
  // Must walk the rings exactly as the generator did.
  for (let lat = -90 + LAND_STEP / 2; lat < 90; lat += LAND_STEP) {
    const n = Math.max(1, Math.round((360 * Math.cos(lat * DEG)) / LAND_STEP));
    for (let i = 0; i < n; i++, k++) {
      if (!((bits.charCodeAt(k >> 3) >> (k & 7)) & 1)) continue;
      out.push(...toVec(lat * DEG, (-180 + (i + 0.5) * (360 / n)) * DEG));
    }
  }
  landCache = new Float32Array(out);
  return landCache;
}

function readRgb(name: string, fallback: Rgb): Rgb {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parts = raw.split(/[\s,]+/).map(Number);
  return parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite) ? [parts[0], parts[1], parts[2]] : fallback;
}

const rgba = (c: Rgb, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface Arc {
  a: Vec;
  b: Vec;
  omega: number;
  lift: number;
  start: number;
  duration: number;
  target: number;
  landed: boolean;
}

/**
 * A dotted globe with pulsing fleet nodes and data arcs hopping between them.
 * It spins on its own, turns faster as the page scrolls, and can be flung with the
 * mouse. It assembles itself once `active` turns true (after the intro), pauses when
 * covered or in a hidden tab, and draws one still frame for reduced motion.
 */
export function Globe({ className, active = true }: { className?: string; active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const land = landPoints();
    const nodes = NODES.map(([lat, lon]) => toVec(lat * DEG, lon * DEG));
    const phases = nodes.map((_, i) => (i * 0.618) % 1);

    let width = 0;
    let height = 0;
    let radius = 0;
    let scale = 1;
    let frame = 0;
    let running = false;
    let introStart = -1;
    let last = 0;
    let lastSpawn = 0;
    let fg = readRgb("--fg-rgb", [241, 241, 236]);
    let ink = readRgb("--accent-ink-rgb", [207, 255, 94]);
    let dotStyles: string[] = [];
    let dotRadii: number[] = [];
    const arcs: Arc[] = [];
    const ripples: { node: number; start: number }[] = [];

    // Rotation state. `spin` eases back to SPIN after a fling.
    let yaw = START_YAW;
    let pitch = PITCH;
    let spin = SPIN;
    const drag = { active: false, x: 0, y: 0, t: 0, hover: false };

    const buildStyles = () => {
      dotStyles = Array.from({ length: DEPTH_STEPS }, (_, step) => {
        const depth = (step + 0.5) / DEPTH_STEPS;
        return rgba(fg, 0.1 + 0.6 * Math.pow(depth, 1.4));
      });
      dotRadii = Array.from({ length: DEPTH_STEPS }, (_, step) => {
        const depth = (step + 0.5) / DEPTH_STEPS;
        return (0.5 + 0.85 * depth) * scale;
      });
    };

    // Rotate a unit vector into view space: yaw around Y, then pitch around X.
    let cosYaw = 1;
    let sinYaw = 0;
    let cosPitch = 1;
    let sinPitch = 0;
    const out: Vec = [0, 0, 0];
    const rotate = (x: number, y: number, z: number) => {
      const x1 = x * cosYaw + z * sinYaw;
      const z1 = -x * sinYaw + z * cosYaw;
      out[0] = x1;
      out[1] = y * cosPitch - z1 * sinPitch;
      out[2] = y * sinPitch + z1 * cosPitch;
      return out;
    };

    const spawnArc = (now: number) => {
      const from = Math.floor(Math.random() * nodes.length);
      let to = Math.floor(Math.random() * nodes.length);
      // Mostly hop between continents (eight nodes each); sometimes stay local.
      for (let tries = 0; tries < 6 && (to === from || (Math.random() < 0.75 && to >> 3 === from >> 3)); tries++) {
        to = Math.floor(Math.random() * nodes.length);
      }
      if (to === from) return;
      const a = nodes[from];
      const b = nodes[to];
      const omega = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
      if (omega < 0.05) return;
      arcs.push({ a, b, omega, lift: 0.05 + 0.2 * (omega / Math.PI), start: now, duration: 1500 + omega * 900, target: to, landed: false });
    };

    // Point `t` along the great circle from a to b, raised off the surface in the middle.
    const arcPoint = (arc: Arc, t: number): Vec => {
      const s = Math.sin(arc.omega);
      const wa = Math.sin((1 - t) * arc.omega) / s;
      const wb = Math.sin(t * arc.omega) / s;
      const h = 1 + arc.lift * Math.sin(Math.PI * t);
      return [(wa * arc.a[0] + wb * arc.b[0]) * h, (wa * arc.a[1] + wb * arc.b[1]) * h, (wa * arc.a[2] + wb * arc.b[2]) * h];
    };

    const draw = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;

      if (!reduced) {
        if (!drag.active) {
          spin += (SPIN * (drag.hover ? 0.35 : 1) - spin) * Math.min(1, dt * 1.6);
          pitch += (PITCH - pitch) * Math.min(1, dt * 2);
          yaw += spin * dt;
        }
      }
      const intro = reduced ? 1 : introStart < 0 ? 0 : easeOutExpo(Math.min(1, (now - introStart) / INTRO_MS));
      // The globe also turns as the page scrolls over the hero.
      const viewYaw = yaw + (reduced ? 0 : window.scrollY * 0.0016) - (1 - intro) * 1.6;
      cosYaw = Math.cos(viewYaw);
      sinYaw = Math.sin(viewYaw);
      cosPitch = Math.cos(pitch);
      sinPitch = Math.sin(pitch);

      const cx = width / 2;
      const cy = height / 2;
      const r = radius * (0.8 + 0.2 * intro);

      ctx.clearRect(0, 0, width, height);
      if (intro <= 0) return;
      ctx.globalAlpha = intro;
      ctx.lineWidth = 1;

      // (The atmosphere, shading and rim are static CSS layers behind the canvas.)

      // Orbit ring with a satellite. The far half of the ring hides behind the globe.
      const orbitAngle = reduced ? 2.2 : now / 2600;
      const tilt = -0.32;
      const rx = r * 1.2;
      const ry = r * 0.3;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.setLineDash([2, 6]);
      ctx.strokeStyle = rgba(fg, 0.22);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      const satX = Math.cos(orbitAngle) * rx;
      const satY = Math.sin(orbitAngle) * ry;
      const behind = Math.sin(orbitAngle) < 0 && Math.hypot(satX, satY) < r;
      if (!behind) {
        ctx.fillStyle = rgba(ink, 1);
        ctx.beginPath();
        ctx.arc(satX, satY, 3 * scale, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = rgba(ink, 0.35);
        ctx.beginPath();
        ctx.arc(satX, satY, 7 * scale, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();

      // Land dots. This loop is the hot path (thousands of points a frame), so the rotation
      // is inlined and depth is worked out first: over half the points face away and stop there.
      const paths = Array.from({ length: DEPTH_STEPS }, () => new Path2D());
      for (let i = 0; i < land.length; i += 3) {
        const x = land[i];
        const y = land[i + 1];
        const z = land[i + 2];
        const z1 = z * cosYaw - x * sinYaw;
        const depth = y * sinPitch + z1 * cosPitch;
        // Dots right at the limb are nearly invisible; skip them too.
        if (depth <= 0.08) continue;
        const step = depth >= 1 ? DEPTH_STEPS - 1 : (depth * DEPTH_STEPS) | 0;
        const dot = dotRadii[step];
        const sx = cx + (x * cosYaw + z * sinYaw) * r;
        const sy = cy - (y * cosPitch - z1 * sinPitch) * r;
        const path = paths[step];
        // Small far-side dots are drawn as squares: identical at this size, and far cheaper than arcs.
        if (step < SQUARE_STEPS) {
          path.rect(sx - dot, sy - dot, dot * 2, dot * 2);
        } else {
          path.moveTo(sx + dot, sy);
          path.arc(sx, sy, dot, 0, TAU);
        }
      }
      for (let step = 0; step < DEPTH_STEPS; step++) {
        ctx.fillStyle = dotStyles[step];
        ctx.fill(paths[step]);
      }

      // Data arcs.
      if (!reduced && now - lastSpawn > 420 && arcs.length < MAX_ARCS && intro > 0.6) {
        lastSpawn = now;
        spawnArc(now);
      }
      ctx.lineCap = "round";
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        const life = reduced ? 0.7 : (now - arc.start) / arc.duration;
        if (life >= 1) {
          arcs.splice(i, 1);
          continue;
        }
        const head = easeInOut(Math.min(1, life / 0.7));
        const tail = reduced ? 0 : easeInOut(Math.max(0, (life - 0.3) / 0.7));
        if (!arc.landed && head >= 1) {
          arc.landed = true;
          ripples.push({ node: arc.target, start: now });
        }
        const segments = 28;
        ctx.beginPath();
        let open = false;
        let hx = 0;
        let hy = 0;
        let headVisible = false;
        for (let s = 0; s <= segments; s++) {
          const t = tail + ((head - tail) * s) / segments;
          const v = arcPoint(arc, t);
          const p = rotate(v[0], v[1], v[2]);
          // Hidden when it passes behind the sphere.
          const hidden = p[2] < 0 && p[0] * p[0] + p[1] * p[1] < 1;
          const sx = cx + p[0] * r;
          const sy = cy - p[1] * r;
          if (hidden) {
            open = false;
          } else if (open) {
            ctx.lineTo(sx, sy);
          } else {
            ctx.moveTo(sx, sy);
            open = true;
          }
          if (s === segments) {
            hx = sx;
            hy = sy;
            headVisible = !hidden;
          }
        }
        const fade = life > 0.85 ? (1 - life) / 0.15 : 1;
        ctx.strokeStyle = rgba(ink, 0.75 * fade);
        ctx.lineWidth = 1.4 * scale;
        ctx.stroke();
        if (headVisible && head < 1) {
          ctx.fillStyle = rgba(ink, 1);
          ctx.beginPath();
          ctx.arc(hx, hy, 2.2 * scale, 0, TAU);
          ctx.fill();
        }
      }

      // Fleet nodes.
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const p = rotate(n[0], n[1], n[2]);
        if (p[2] <= 0.02) continue;
        const sx = cx + p[0] * r;
        const sy = cy - p[1] * r;
        const pulse = reduced ? 0.4 : ((now / 1000) / 2.6 + phases[i]) % 1;
        ctx.strokeStyle = rgba(ink, (1 - pulse) * 0.55 * p[2]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, (2.5 + pulse * 11) * scale, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = rgba(ink, 0.35 + 0.65 * p[2]);
        ctx.beginPath();
        ctx.arc(sx, sy, 2.3 * scale, 0, TAU);
        ctx.fill();
      }

      // A ring bursts out wherever an arc lands.
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        const t = (now - ripple.start) / 900;
        if (t >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        const n = nodes[ripple.node];
        const p = rotate(n[0], n[1], n[2]);
        if (p[2] <= 0) continue;
        ctx.strokeStyle = rgba(ink, (1 - t) * 0.9);
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(cx + p[0] * r, cy - p[1] * r, (3 + easeOutExpo(t) * 18) * scale, 0, TAU);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    // If the page is struggling (under ~45fps), draw every other frame; the spin is slow enough not to show it.
    let pace = 16.7;
    let previous = 0;
    let odd = false;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (previous) pace += (Math.min(100, now - previous) - pace) * 0.05;
      previous = now;
      odd = !odd;
      if (pace > 22 && odd && !drag.active) return;
      draw(now);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      last = 0;
      previous = 0;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    // The hero is pinned while the page slides over it, so visibility is about scroll depth.
    const sync = () => {
      if (activeRef.current && introStart < 0) introStart = performance.now();
      if (reduced) {
        if (activeRef.current) draw(performance.now());
        return;
      }
      if (activeRef.current && !document.hidden && window.scrollY < window.innerHeight * 1.05) start();
      else stop();
    };
    syncRef.current = sync;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Fine dots look the same at 1.5x as at 2x, for 44% fewer pixels.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      radius = (Math.min(width, height) / 2) * 0.8;
      scale = Math.min(1.35, Math.max(0.55, radius / 360));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStyles();
      if (!running) draw(performance.now());
    };

    // Dragging and hovering are worked out from the pointer position, because the
    // hero copy sits on top of the canvas. Only targets inside the hero count, so
    // the page sliding over it is never mistaken for the globe.
    const hero = canvas.closest("section");
    const pointer = { x: -1, y: -1 };
    const over = (x: number, y: number, target: EventTarget | null) => {
      if (!activeRef.current || !(target instanceof Element) || !hero?.contains(target)) return false;
      if (target.closest("a, button, input, [role='dialog']")) return false;
      const rect = canvas.getBoundingClientRect();
      return Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2)) < radius * 1.02;
    };
    const setHover = (hover: boolean) => {
      if (hover === drag.hover) return;
      drag.hover = hover;
      window.dispatchEvent(new CustomEvent("cursor:label", { detail: hover ? "Drag" : null }));
    };
    // Scrolling moves the page under a still mouse, so check again what it is over.
    const recheckHover = () => {
      if (drag.hover && !drag.active) setHover(over(pointer.x, pointer.y, document.elementFromPoint(pointer.x, pointer.y)));
    };

    const onPointerDown = (event: PointerEvent) => {
      if (reduced || event.pointerType === "touch" || event.button !== 0) return;
      if (!over(event.clientX, event.clientY, event.target)) return;
      event.preventDefault();
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.t = performance.now();
      spin = 0;
      window.dispatchEvent(new CustomEvent("cursor:label", { detail: "Spin" }));
    };
    const onPointerMove = (event: PointerEvent) => {
      if (reduced || event.pointerType === "touch") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (drag.active) {
        const now = performance.now();
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        const dt = Math.max(1, now - drag.t) / 1000;
        const turn = dx * 0.0055;
        yaw += turn;
        pitch = Math.min(0.95, Math.max(-0.3, pitch + dy * 0.004));
        spin = spin * 0.6 + (turn / dt) * 0.4;
        drag.x = event.clientX;
        drag.y = event.clientY;
        drag.t = now;
        return;
      }
      setHover(over(event.clientX, event.clientY, event.target));
    };
    const onPointerUp = () => {
      if (!drag.active) return;
      drag.active = false;
      spin = Math.max(-4, Math.min(4, spin));
      window.dispatchEvent(new CustomEvent("cursor:label", { detail: drag.hover ? "Drag" : null }));
    };

    const onTheme = () => {
      fg = readRgb("--fg-rgb", fg);
      ink = readRgb("--accent-ink-rgb", ink);
      buildStyles();
      if (!running) draw(performance.now());
    };

    const themeObserver = new MutationObserver(onTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    darkQuery.addEventListener("change", onTheme);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    resize();
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("scroll", recheckHover, { passive: true });
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      stop();
      syncRef.current = () => {};
      themeObserver.disconnect();
      resizeObserver.disconnect();
      darkQuery.removeEventListener("change", onTheme);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("scroll", recheckHover);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      if (drag.hover) window.dispatchEvent(new CustomEvent("cursor:label", { detail: null }));
    };
  }, []);

  useEffect(() => {
    activeRef.current = active;
    syncRef.current();
  }, [active]);

  // The canvas radius is 40% of the box, so these layers are sized to match it.
  return (
    <div aria-hidden className={cn("relative", className)}>
      <motion.div
        className="absolute inset-[-3%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/0.1)_55%,rgb(var(--accent-rgb)/0.16)_72%,transparent)]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={active ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 2, ease: EASE_OUT }}
      />
      <motion.div
        className="absolute inset-[10%] rounded-full border border-line-strong bg-[radial-gradient(circle_at_32%_30%,rgb(var(--fg-rgb)/0.07),rgb(var(--fg-rgb)/0.01)_70%)]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={active ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 2, ease: EASE_OUT }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
