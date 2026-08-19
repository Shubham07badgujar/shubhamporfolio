"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "@/components/providers/MotionProvider";

/** Subtle custom cursor: dot + trailing ring. Disabled on touch / reduced motion. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const { isTouch, reducedMotion } = useMotion();

  useEffect(() => {
    if (isTouch || reducedMotion) return;
    let x = 0,
      y = 0,
      rx = 0,
      ry = 0,
      raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = !!t?.closest("a, button, [role=button], input, textarea, [data-cursor]");
      ring.current?.classList.toggle("is-hover", interactive);
    };
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (ring.current) ring.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      cancelAnimationFrame(raf);
    };
  }, [isTouch, reducedMotion]);

  if (isTouch || reducedMotion) return null;
  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className="cursor-ring" aria-hidden />
    </>
  );
}
