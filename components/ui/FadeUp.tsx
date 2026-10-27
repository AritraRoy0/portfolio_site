"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { EASE_OUT } from "@/lib/utils";

type FadeUpProps = HTMLMotionProps<"div"> & { delay?: number; distance?: number };

/** Fades and lifts its content into place the first time it scrolls into view. */
export function FadeUp({ delay = 0, distance = 40, children, ...rest }: FadeUpProps) {
  return (
    <motion.div
      data-reveal
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, ease: EASE_OUT, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
