"use client";

/**
 * A tiny shared pointer store so 3D scenes and DOM effects read the same,
 * already-normalized cursor position without each attaching listeners.
 * x/y are in [-1, 1] relative to the viewport centre; smooth values ease toward raw.
 */
export const pointer = {
  x: 0,
  y: 0,
  sx: 0,
  sy: 0,
  px: 0,
  py: 0,
  active: false,
};

let bound = false;
let raf = 0;

export function bindPointer() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  const onMove = (e: PointerEvent) => {
    pointer.px = e.clientX;
    pointer.py = e.clientY;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.active = true;
  };
  const onLeave = () => {
    pointer.active = false;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerleave", onLeave);
  const tick = () => {
    pointer.sx += (pointer.x - pointer.sx) * 0.06;
    pointer.sy += (pointer.y - pointer.sy) * 0.06;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerleave", onLeave);
    cancelAnimationFrame(raf);
    bound = false;
  };
}
