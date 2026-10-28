"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type Variants,
} from "motion/react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { portfolio, type Project } from "@/data/portfolio";
import { FINE_POINTER, REDUCED_MOTION, useMediaQuery } from "@/lib/hooks";
import { cn, EASE_OUT, pad2 } from "@/lib/utils";
import { GitHubIcon } from "../Icons";
import { Magnetic } from "../ui/Magnetic";
import { RollingText } from "../ui/RollingText";
import { ProjectDetails } from "./ProjectDetails";
import { RingCard, wrapOffset } from "./RingCard";

/** The ring repeats projects until it has at least this many cards, so it always looks full. */
const MIN_SLOTS = 6;
const AUTOPLAY_SECONDS = 6;
/** A weighty turn with a little overshoot. */
const TURN = { type: "spring", stiffness: 55, damping: 14, mass: 1 } as const;
const LOOK = { stiffness: 70, damping: 18 };

const mod = (value: number, size: number) => ((value % size) + size) % size;

const PANEL: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 48 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT, staggerChildren: 0.06, delayChildren: 0.05 } },
  exit: (direction: number) => ({ opacity: 0, x: direction * -48, transition: { duration: 0.3, ease: EASE_OUT } }),
};

/**
 * Projects on a turntable: cards stand around a ring seen from slightly above, and
 * the one facing you is described underneath. Drag, swipe, scroll sideways, use the
 * arrow keys or the controls to turn it; it also turns on its own until you take over.
 */
export function Carousel({ projects }: { projects: Project[] }) {
  const total = projects.length;
  const slots = total * Math.max(1, Math.ceil(MIN_SLOTS / total));
  const step = 360 / slots;
  const reduced = useMediaQuery(REDUCED_MOTION);
  const fine = useMediaQuery(FINE_POINTER);
  const detailsId = useId();

  const scene = useRef<HTMLDivElement>(null);
  const angleReadout = useRef<HTMLSpanElement>(null);
  const turn = useRef<AnimationPlaybackControls | null>(null);
  /** Where the ring is heading, in slots. Navigation builds on this so quick clicks queue up. */
  const target = useRef(0);
  const settled = useRef(0);

  const position = useMotionValue(0);
  const progress = useMotionValue(0);
  const [slot, setSlot] = useState(0);
  const [direction, setDirection] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [detailsHeight, setDetailsHeight] = useState<number | null>(null);
  const active = slot % total;
  const activeRef = useRef(active);
  useLayoutEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Track the height of the details panel on show (plus the box's top padding and rule), to animate the box to it.
  const measurePanel = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const box = node.parentElement;
    const observer = new ResizeObserver(() => {
      // Panels on their way out keep reporting; only the current one sets the height.
      if (Number(node.dataset.index) !== activeRef.current || !box) return;
      const style = getComputedStyle(box);
      setDetailsHeight(node.offsetHeight + (parseFloat(style.paddingTop) || 0) + (parseFloat(style.borderTopWidth) || 0));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // --- Camera ----------------------------------------------------------------------------
  // Scrolling past cranes the camera down a little; the mouse lets you look around.
  const { scrollYProgress } = useScroll({ target: scene, offset: ["start end", "end start"] });
  const lookX = useSpring(0, LOOK);
  const lookY = useSpring(0, LOOK);
  const intro = useMotionValue(0);
  const tilt = useTransform([scrollYProgress, lookY], ([p, y]: number[]) => (reduced ? -9 : -15 + p * 10 + y * 5));
  const yaw = useTransform([position, intro, scrollYProgress, lookX], ([p, i, s, x]: number[]) =>
    reduced ? -p * step : -p * step + i + (s - 0.5) * 10 + x * 8,
  );
  const stageTransform = useMotionTemplate`translateZ(calc(var(--radius) * -1)) rotateX(${tilt}deg)`;
  const ringTransform = useMotionTemplate`rotateY(${yaw}deg)`;

  useMotionValueEvent(yaw, "change", (angle) => {
    if (angleReadout.current) angleReadout.current.textContent = mod(-angle, 360).toFixed(1).padStart(5, "0");
  });

  // --- Turning ---------------------------------------------------------------------------
  useMotionValueEvent(position, "change", (p) => {
    const rounded = Math.round(p);
    if (rounded === settled.current) return;
    setDirection(rounded > settled.current ? 1 : -1);
    settled.current = rounded;
    setSlot(mod(rounded, slots));
  });

  const spinTo = useCallback(
    (destination: number, velocity = 0) => {
      target.current = destination;
      turn.current?.stop();
      if (reduced) {
        position.set(destination);
        return;
      }
      turn.current = animate(position, destination, { ...TURN, velocity });
    },
    [position, reduced],
  );

  const turnBy = useCallback((delta: number) => spinTo(target.current + delta), [spinTo]);

  /** Turns the shortest way round to the nearest card showing project `index`. */
  const goToProject = useCallback(
    (index: number) => {
      const here = mod(target.current, slots);
      let best = 0;
      let bestDistance = Infinity;
      for (let s = index; s < slots; s += total) {
        const delta = wrapOffset(s - here, slots);
        if (Math.abs(delta) < bestDistance) {
          bestDistance = Math.abs(delta);
          best = delta;
        }
      }
      spinTo(target.current + best);
    },
    [slots, total, spinTo],
  );

  const goToSlot = useCallback(
    (s: number) => spinTo(target.current + wrapOffset(s - mod(target.current, slots), slots)),
    [slots, spinTo],
  );

  /** Any deliberate interaction hands control to the visitor and stops the autoplay. */
  const takeOver = useCallback(() => setPlaying(false), []);

  // --- Autoplay --------------------------------------------------------------------------
  const visible = useInView(scene, { amount: 0.45 });
  const running = playing && !reduced && visible && !hovering && !focused && !dragging;

  useEffect(() => {
    progress.set(0);
  }, [slot, progress]);

  useEffect(() => {
    if (!running) return;
    const controls = animate(progress, 1, {
      duration: AUTOPLAY_SECONDS * (1 - progress.get()),
      ease: "linear",
      onComplete: () => turnBy(1),
    });
    return () => controls.stop();
  }, [running, slot, progress, turnBy]);

  // --- Entrance: the ring spins up the first time it comes into view ---------------------
  const entered = useInView(scene, { once: true, amount: 0.25 });
  useEffect(() => {
    if (!entered || reduced) return;
    intro.set(-150);
    const controls = animate(intro, 0, { type: "spring", stiffness: 26, damping: 12, mass: 1.2 });
    return () => controls.stop();
  }, [entered, reduced, intro]);

  // --- Dragging and flinging -------------------------------------------------------------
  const slotWidth = () => (scene.current?.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 400) * 0.85;

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || (event.target as Element).closest("button")) return;
    const width = slotWidth();
    const start = { x: event.clientX, position: position.get(), lastX: event.clientX, lastT: performance.now(), velocity: 0 };
    let moved = false;

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - start.x;
      if (!moved) {
        if (Math.abs(dx) < 6) return;
        moved = true;
        turn.current?.stop();
        setDragging(true);
        takeOver();
      }
      const now = performance.now();
      const dt = Math.max(1, now - start.lastT) / 1000;
      const instant = -(e.clientX - start.lastX) / width / dt;
      start.velocity = start.velocity * 0.7 + instant * 0.3;
      start.lastX = e.clientX;
      start.lastT = now;
      position.set(start.position - dx / width);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (!moved) return;
      setDragging(false);
      // A drag ends in a click on whatever is under the pointer; swallow it.
      const swallow = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };
      window.addEventListener("click", swallow, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
      // Fling: momentum carries up to half a card further, then the ring settles on the nearest one.
      // A quick flick always moves at least one card, however short.
      const velocity = Math.max(-5, Math.min(5, start.velocity));
      let destination = Math.round(position.get() + Math.max(-0.45, Math.min(0.45, velocity * 0.15)));
      if (destination === Math.round(start.position) && Math.abs(velocity) > 1) destination += Math.sign(velocity);
      spinTo(destination, velocity);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  // Sideways trackpad scrolling turns the ring; vertical scrolling is left to the page.
  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    let timer = 0;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      turn.current?.stop();
      takeOver();
      position.set(position.get() + event.deltaX / (slotWidth() * 1.4));
      window.clearTimeout(timer);
      timer = window.setTimeout(() => spinTo(Math.round(position.get())), 140);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", onWheel);
      window.clearTimeout(timer);
    };
  }, [position, spinTo, takeOver]);

  // The mouse nudges the camera.
  const onLook = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!fine || reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    lookX.set((event.clientX - rect.left) / rect.width - 0.5);
    lookY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, () => void> = {
      ArrowRight: () => turnBy(1),
      ArrowLeft: () => turnBy(-1),
      Home: () => goToProject(0),
      End: () => goToProject(total - 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    takeOver();
    move();
  };

  const select = (s: number) => {
    takeOver();
    goToSlot(s);
  };

  const github = portfolio.socials.github;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Projects"
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      className="relative"
    >
      {/* ---------------- The ring ---------------- */}
      <motion.div
        data-reveal
        initial={{ opacity: 0, y: 60, scale: 0.92 }}
        animate={entered ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ duration: 1.4, ease: EASE_OUT }}
        className="relative"
      >
        {/* The ring works like a rotary dial, so it is exposed as a slider: arrows turn it. */}
        <div
          ref={scene}
          tabIndex={0}
          role="slider"
          aria-label="Project ring"
          aria-roledescription="rotary dial"
          aria-orientation="horizontal"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={active + 1}
          aria-valuetext={`${projects[active].title}, ${active + 1} of ${total}`}
          aria-controls={detailsId}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onLook}
          onPointerLeave={() => {
            lookX.set(0);
            lookY.set(0);
          }}
          onDragStart={(event) => event.preventDefault()}
          data-cursor="Drag"
          className={cn(
            "group/scene relative mt-10 h-[calc(var(--card-h)*1.85)] touch-pan-y select-none outline-none [perspective-origin:50%_35%] [perspective:calc(var(--card-w)*4)] md:mt-16",
            "[--card-h:calc(var(--card-w)*0.5625+78px)] [--card-w:min(68vw,36rem)] [--radius:calc(var(--card-w)*0.98)] sm:[--card-w:min(52vw,36rem)] lg:[--card-w:min(40vw,36rem)]",
            dragging ? "cursor-grabbing" : "cursor-grab",
          )}
        >
          {/* Stage: pushed back by the ring's radius so the front card sits at true size, then tilted. */}
          <motion.div
            style={{ transform: stageTransform }}
            className="absolute inset-0 origin-[50%_42%] [transform-style:preserve-3d]"
          >
            {/* Pool of light on the floor in front of the ring. */}
            <div
              aria-hidden
              className="absolute left-1/2 top-[42%] h-[calc(var(--card-w)*0.8)] w-[calc(var(--card-w)*1.7)] rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/0.28),rgb(var(--accent-rgb)/0.06)_60%,transparent)]"
              style={{ transform: "translate(-50%, -50%) translateY(calc(var(--card-h) / 2 + 2px)) translateZ(var(--radius)) rotateX(90deg)" }}
            />

            <motion.div style={{ transform: ringTransform }} className="absolute inset-x-0 top-[42%] h-0 [transform-style:preserve-3d]">
              {/* Turntable under the cards. */}
              <div
                aria-hidden
                className="absolute left-1/2 top-0 size-[calc(var(--radius)*2.7)] rounded-full border border-line [mask-image:radial-gradient(closest-side,#000_70%,transparent)]"
                style={{
                  transform: "translate(-50%, -50%) translateY(calc(var(--card-h) / 2 + 1px)) rotateX(90deg)",
                  background:
                    "repeating-conic-gradient(from 0deg, var(--line-strong) 0deg 0.35deg, transparent 0.35deg 7.5deg), repeating-radial-gradient(circle, transparent 0 calc(var(--radius) * 0.16 - 1px), var(--line) calc(var(--radius) * 0.16 - 1px) calc(var(--radius) * 0.16))",
                }}
              >
                {Array.from({ length: slots }, (_, s) => (
                  <span
                    key={s}
                    className={cn(
                      "absolute left-1/2 top-1/2 size-2.5 rounded-full transition-colors duration-500",
                      s === slot ? "bg-accent-ink shadow-[0_0_12px_2px_rgb(var(--accent-rgb)/0.6)]" : "bg-line-strong",
                    )}
                    style={{ transform: `translate(-50%, -50%) rotate(${-s * step}deg) translateY(calc(var(--radius) * 1.16))` }}
                  />
                ))}
              </div>

              {Array.from({ length: slots }, (_, s) => (
                <RingCard
                  key={s}
                  project={projects[s % total]}
                  index={s % total}
                  total={total}
                  slot={s}
                  slots={slots}
                  position={position}
                  front={s === slot}
                  priority={s === 0}
                  onSelect={select}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Instrument readouts in the corners. */}
          <div
            aria-hidden
            className="crop-marks pointer-events-none absolute inset-x-[4%] inset-y-0 rounded-[1.75rem] opacity-70 transition-[opacity,box-shadow] duration-500 group-focus-visible/scene:opacity-100 group-focus-visible/scene:shadow-[inset_0_0_0_2px_var(--accent-ink)] md:inset-x-[6%]"
          >
            <p className="label-mono absolute left-3 top-3 text-[10px] text-muted">
              θ <span ref={angleReadout}>000.0</span>°
            </p>
            <p className="label-mono absolute right-3 top-3 hidden text-[10px] text-muted md:block">
              {fine ? "Drag · ← → · Click a card" : "Swipe to turn"}
            </p>
            <p className="label-mono absolute bottom-3 left-3 flex items-center gap-2 text-[10px] text-muted">
              <span className={cn("size-1.5 rounded-full", running ? "bg-accent-ink" : "bg-line-strong")} />
              {reduced ? "Manual" : playing ? (running ? "Auto-rotate" : "Paused") : "Manual"}
            </p>
            <p className="label-mono absolute bottom-3 right-3 flex items-center gap-1.5 text-[10px] text-muted">
              <span className="relative inline-grid overflow-hidden text-fg">
                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                  <motion.span
                    key={active}
                    custom={direction}
                    initial={{ y: `${direction * 100}%` }}
                    animate={{ y: "0%" }}
                    exit={{ y: `${direction * -100}%` }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                  >
                    {pad2(active + 1)}
                  </motion.span>
                </AnimatePresence>
              </span>
              / {pad2(total)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ---------------- Controls ---------------- */}
      <div className="container-page mt-6 flex flex-col items-center gap-5 md:mt-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-2 md:order-1">
          {[
            { label: "Previous project", icon: ArrowLeft, delta: -1 },
            { label: "Next project", icon: ArrowRight, delta: 1 },
          ].map(({ label, icon: Icon, delta }) => (
            <Magnetic key={label} strength={0.35}>
              <button
                type="button"
                aria-label={label}
                aria-controls={detailsId}
                onClick={() => {
                  takeOver();
                  turnBy(delta);
                }}
                className="glass group grid size-12 place-items-center overflow-hidden rounded-full transition-colors duration-300 hover:border-line-strong"
              >
                <span className="relative grid size-4 place-items-center overflow-hidden">
                  <Icon
                    className={cn(
                      "size-4 transition-transform duration-500 ease-quart",
                      delta > 0 ? "group-hover:translate-x-[170%]" : "group-hover:-translate-x-[170%]",
                    )}
                  />
                  <Icon
                    className={cn(
                      "absolute size-4 transition-transform duration-500 ease-quart group-hover:translate-x-0",
                      delta > 0 ? "-translate-x-[170%]" : "translate-x-[170%]",
                    )}
                  />
                </span>
              </button>
            </Magnetic>
          ))}
        </div>

        <div role="group" aria-label="Choose a project" className="glass flex max-w-full gap-1 rounded-full p-1 md:order-2">
          {projects.map((project, i) => (
            <button
              key={project.title}
              type="button"
              aria-controls={detailsId}
              aria-current={i === active ? "true" : undefined}
              onClick={() => {
                takeOver();
                goToProject(i);
              }}
              className={cn(
                "relative flex min-w-0 items-center gap-2 overflow-hidden rounded-full px-3.5 py-2 text-sm transition-colors duration-300 sm:px-4",
                i === active ? "text-bg" : "text-fg/65 hover:text-fg",
              )}
            >
              {i === active && (
                <motion.span
                  layoutId="carousel-chip"
                  className="absolute inset-0 rounded-full bg-fg"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              {i === active && playing && !reduced && (
                <motion.span
                  aria-hidden
                  style={{ scaleX: progress }}
                  className="absolute inset-x-3 bottom-1 h-[2px] origin-left rounded-full bg-accent"
                />
              )}
              <span className="relative font-mono text-[10px] opacity-60">{pad2(i + 1)}</span>
              <span className="relative truncate font-medium">{project.title}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 md:order-3">
          {!reduced && (
            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? "Pause auto-rotation" : "Resume auto-rotation"}
              className="glass grid size-12 place-items-center rounded-full transition-colors duration-300 hover:border-line-strong"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={playing ? "pause" : "play"}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                </motion.span>
              </AnimatePresence>
            </button>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="group label-mono inline-flex items-center gap-2 text-muted transition-colors duration-300 hover:text-fg"
            >
              <GitHubIcon className="size-3.5" />
              <RollingText>More on GitHub</RollingText>
              <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-expo group-hover:rotate-45" />
            </a>
          )}
        </div>
      </div>

      {/* ---------------- Details of the front project ---------------- */}
      <div id={detailsId} className="container-page mt-12 md:mt-16">
        {/* The panel eases to each project's own height, so nothing below jumps and there is no dead space. */}
        <motion.div
          initial={false}
          animate={{ height: detailsHeight ?? "auto" }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="relative border-t border-line pt-10 md:pt-12"
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={active}
              ref={measurePanel}
              data-index={active}
              role="group"
              aria-roledescription="slide"
              aria-label={`${projects[active].title}, ${active + 1} of ${total}`}
              custom={direction}
              variants={PANEL}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <ProjectDetails project={projects[active]} index={active} total={total} animated />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {/* Without JavaScript the ring can't turn, so list the other projects too. */}
        <noscript>
          {projects.map((project, i) =>
            i === active ? null : (
              <div key={project.title} className="mt-12 border-t border-line pt-10">
                <ProjectDetails project={project} index={i} total={total} />
              </div>
            ),
          )}
        </noscript>
        <p aria-live={playing ? "off" : "polite"} aria-atomic="true" className="sr-only">
          {projects[active].title}, project {active + 1} of {total}
        </p>
      </div>
    </div>
  );
}
