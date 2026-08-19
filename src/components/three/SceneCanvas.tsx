"use client";

import { Canvas, invalidate, type CanvasProps } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useMotion } from "@/components/providers/MotionProvider";

/** Restarts the render loop once suspended scene content (textures) has mounted. */
function ResumeOnMount() {
  useEffect(() => {
    invalidate();
  }, []);
  return null;
}

type Props = {
  children: ReactNode;
  className?: string;
  camera?: CanvasProps["camera"];
  /** Rendered when WebGL is unavailable. */
  fallback?: ReactNode;
  /** Root margin for the in-view observer that pauses the render loop off-screen. */
  margin?: string;
  eventSource?: CanvasProps["eventSource"];
  style?: React.CSSProperties;
};

/**
 * Canvas that pauses its render loop when scrolled out of view, scales DPR by
 * device quality, and degrades to a DOM fallback when WebGL is missing.
 *
 * The caller owns sizing and positioning via `className` (e.g. "absolute inset-0"
 * or "h-80 w-full"): this wrapper adds no position class of its own, because a
 * competing one would collapse the box and leave the canvas unmeasured.
 */
export function SceneCanvas({ children, className, camera, fallback = null, margin = "200px", style }: Props) {
  const { scenes, quality, webgl } = useMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);

  // R3F drives every canvas from one global rAF loop that stops once all of them
  // are paused. Setting frameloop back to "always" does not restart it on its own,
  // so nudge it the frame after this canvas comes back into view.
  useEffect(() => {
    if (!inView) return;
    const id = requestAnimationFrame(() => invalidate());
    return () => cancelAnimationFrame(id);
  }, [inView]);

  const dpr: [number, number] = quality === "high" ? [1, 1.75] : quality === "medium" ? [1, 1.25] : [0.8, 1];

  return (
    <div ref={wrap} className={className} style={style} aria-hidden>
      {webgl === false && fallback}
      {scenes && (
        <Canvas
          dpr={dpr}
          camera={camera}
          frameloop={inView ? "always" : "never"}
          gl={{ antialias: quality !== "low", alpha: true, powerPreference: "high-performance", stencil: false }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
          style={{ position: "absolute", inset: 0 }}
          resize={{ scroll: false, debounce: { scroll: 50, resize: 100 } }}
        >
          <Suspense fallback={null}>
            <ResumeOnMount />
            {children}
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
