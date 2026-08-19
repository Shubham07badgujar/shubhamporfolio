"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { profile } from "@/data/profile";
import { useMotion } from "@/components/providers/MotionProvider";

const subscribeNoop = () => () => {};
const isFirstVisit = () => {
  try {
    return !sessionStorage.getItem("sb-loaded");
  } catch {
    return false;
  }
};

/** Short cinematic loader (skipped for reduced motion, shown once per session). */
export function Preloader() {
  const { reducedMotion } = useMotion();
  const firstVisit = useSyncExternalStore(subscribeNoop, isFirstVisit, () => false);
  const [dismissed, setDismissed] = useState(false);
  const show = firstVisit && !dismissed && !reducedMotion;

  useEffect(() => {
    if (!show) return;
    document.documentElement.classList.add("lenis-stopped");
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem("sb-loaded", "1");
      } catch {
        /* private mode — loader simply shows again */
      }
      setDismissed(true);
      document.documentElement.classList.remove("lenis-stopped");
    }, 1500);
    return () => {
      clearTimeout(t);
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[1000] grid place-items-center bg-bg"
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden
        >
          <div className="relative">
            <motion.span
              className="font-mono text-4xl font-semibold tracking-tight text-fg"
              initial={{ opacity: 0, letterSpacing: "0.4em" }}
              animate={{ opacity: 1, letterSpacing: "-0.02em" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              {profile.logo}
            </motion.span>
            <motion.span
              className="absolute -bottom-4 left-0 h-px w-full origin-left bg-gradient-to-r from-accent to-accent-2"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
