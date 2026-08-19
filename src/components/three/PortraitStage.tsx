"use client";

import { type MutableRefObject } from "react";
import { SceneCanvas } from "./SceneCanvas";
import { DigitalPortrait } from "./DigitalPortrait";
import { ParticleField } from "./ParticleField";
import { useMotion } from "@/components/providers/MotionProvider";
import { profile } from "@/data/profile";

type Props = { progress: MutableRefObject<number>; className?: string };

/** Standalone portrait canvas used in About: photo -> contours -> wireframe -> particles. */
export function PortraitStage({ progress, className }: Props) {
  const { quality } = useMotion();
  const fallback = (
    <div className="absolute inset-0 grid place-items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.avatarImage}
        alt=""
        className="h-[85%] w-auto object-contain opacity-60 mix-blend-luminosity [mask-image:radial-gradient(70%_65%_at_50%_42%,black_45%,transparent_82%)]"
      />
    </div>
  );
  return (
    <SceneCanvas className={className} camera={{ position: [0, 0, 6.2], fov: 42 }} fallback={fallback}>
      <ParticleField count={quality === "low" ? 80 : 220} spread={[8, 8, 4]} size={1.2} opacity={0.5} />
      <DigitalPortrait progress={progress} height={5.4} position={[0, -0.35, 0]} parallax={0.6} edgeFade={0.8} levels={11} />
    </SceneCanvas>
  );
}
