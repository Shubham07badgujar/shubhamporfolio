"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotion } from "./MotionProvider";

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

/** Scrolls to a hash target with Lenis when available, else native. */
export function scrollToTarget(target: string | HTMLElement, offset = -80) {
  const el =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset, duration: 1.4 });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const { reducedMotion, isTouch } = useMotion();

  useEffect(() => {
    // Respect reduced motion; native scrolling remains fully accessible.
    if (reducedMotion) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: isTouch ? 1.2 : 1,
    });
    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [reducedMotion, isTouch]);

  return <>{children}</>;
}
