"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile, useIsTouch, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useWebGL } from "@/hooks/useWebGL";
import { bindPointer } from "@/lib/pointer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type Quality = "high" | "medium" | "low";

type MotionContextValue = {
  reducedMotion: boolean;
  isMobile: boolean;
  isTouch: boolean;
  /** null while detecting */
  webgl: boolean | null;
  quality: Quality;
  /** true when 3D scenes should render */
  scenes: boolean;
};

const MotionContext = createContext<MotionContextValue>({
  reducedMotion: false,
  isMobile: false,
  isTouch: false,
  webgl: null,
  quality: "high",
  scenes: false,
});

export const useMotion = () => useContext(MotionContext);

export function MotionProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const isTouch = useIsTouch();
  const webgl = useWebGL();

  useEffect(() => bindPointer(), []);

  const value = useMemo<MotionContextValue>(() => {
    const cores =
      typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 8 : 8;
    const quality: Quality = isMobile ? "low" : cores <= 4 ? "medium" : "high";
    return {
      reducedMotion,
      isMobile,
      isTouch,
      webgl,
      quality,
      scenes: webgl === true,
    };
  }, [reducedMotion, isMobile, isTouch, webgl]);

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
