"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { useMotion } from "@/components/providers/MotionProvider";

type Props = {
  children: ReactNode;
  strength?: number;
  className?: string;
};

/** Wraps a child so it gently follows the cursor within its bounds. */
export function Magnetic({ children, strength = 0.28, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { isTouch, reducedMotion } = useMotion();
  const enabled = !isTouch && !reducedMotion;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    ref.current.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0px, 0px)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)", display: "inline-block" }}
    >
      {children}
    </div>
  );
}
