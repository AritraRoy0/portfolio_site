"use client";

import { motion, useInView } from "motion/react";
import { Fragment, useRef, type ElementType } from "react";
import { cn, EASE_OUT, plain, tokenize } from "@/lib/utils";

interface RevealTextProps {
  /** Copy to reveal. Wrap words in *asterisks* to set them in the accent serif. */
  text: string;
  as?: ElementType;
  className?: string;
  /** Animate each character instead of each word. */
  by?: "word" | "char";
  delay?: number;
  stagger?: number;
  /** Controls when the animation plays. Defaults to when the text scrolls into view. */
  trigger?: boolean;
  /** Extra room below the baseline so descenders are not clipped by the mask. */
  maskClassName?: string;
  accentClassName?: string;
}

/** Text that rises into place from behind a mask, word by word or letter by letter. */
export function RevealText({
  text,
  as: Tag = "span",
  className,
  by = "word",
  delay = 0,
  stagger,
  trigger,
  maskClassName = "pb-[0.16em] -mb-[0.16em]",
  accentClassName = "font-serif font-normal italic tracking-[-0.01em] text-accent-ink",
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const show = trigger ?? inView;
  const step = stagger ?? (by === "char" ? 0.04 : 0.065);
  const groups = tokenize(text);
  let index = 0;

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{plain(text)}</span>
      <span aria-hidden>
        {groups.map((group, g) => (
          <Fragment key={g}>
            <span className="inline-block whitespace-nowrap">
              {group.map((token, t) =>
                (by === "char" ? Array.from(token.text) : [token.text]).map((unit, u) => {
                  const i = index++;
                  return (
                    <span
                      key={`${t}-${u}`}
                      className={cn("inline-block overflow-x-visible overflow-y-clip align-bottom", maskClassName)}
                    >
                      <motion.span
                        data-reveal
                        className={cn("inline-block", token.accent && accentClassName)}
                        initial={{ y: "125%" }}
                        animate={{ y: show ? "0%" : "125%" }}
                        transition={{ duration: 1.1, ease: EASE_OUT, delay: delay + i * step }}
                      >
                        {unit}
                      </motion.span>
                    </span>
                  );
                }),
              )}
            </span>
            {g < groups.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
