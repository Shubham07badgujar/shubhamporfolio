"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Fragment, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
  className?: string;
  amount?: number;
};

const variants: Variants = {
  hidden: (custom: { y: number }) => ({ opacity: 0, y: custom.y, filter: "blur(6px)" }),
  show: (custom: { delay: number }) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay: custom.delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

/** Scroll-triggered reveal used for headings, paragraphs and cards. */
export function Reveal({ children, delay = 0, y = 28, once = true, className, amount = 0.15 }: Props) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={variants}
      custom={{ y, delay }}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {children}
    </motion.div>
  );
}

const wordVariants: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: (custom: { delay: number }) => ({
    y: "0%",
    opacity: 1,
    transition: { duration: 0.9, delay: custom.delay, ease: [0.16, 1, 0.3, 1] },
  }),
};

/**
 * Reveals a heading word by word. The observer sits on the unclipped wrapper:
 * observing each word directly would always report a zero intersection ratio,
 * because it starts translated outside its `overflow-hidden` parent.
 */
export function SplitWords({
  text,
  className,
  delay = 0,
  stagger = 0.06,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <motion.span
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {words.map((w, i) => (
        // The inter-word space must sit outside the clipping span, or it collapses.
        <Fragment key={i}>
          <span className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
            <motion.span className="inline-block" variants={wordVariants} custom={{ delay: delay + i * stagger }} aria-hidden>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.span>
  );
}
