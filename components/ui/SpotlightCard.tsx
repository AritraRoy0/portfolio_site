"use client";

import { motion } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn, EASE_OUT } from "@/lib/utils";

/** Card with a soft accent light and glowing border that follow the cursor. */
export function SpotlightCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    element.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      data-reveal
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, ease: EASE_OUT, delay }}
      className={cn(
        "spotlight relative overflow-hidden rounded-[1.5rem] border border-line bg-surface p-6 md:p-8",
        className,
      )}
    >
      <div className="relative z-[1] h-full">{children}</div>
    </motion.div>
  );
}
