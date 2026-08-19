"use client";

import { type MutableRefObject } from "react";
import { SceneCanvas } from "./SceneCanvas";
import { PortraitParticles } from "./PortraitParticles";
import { ParticleField } from "./ParticleField";
import { useMotion } from "@/components/providers/MotionProvider";
import { profile } from "@/data/profile";

type Props = {
  form: MutableRefObject<number>;
  dissolve: MutableRefObject<number>;
  className?: string;
};

/** Contact-section portrait: neural nodes and particles assemble the face, then let it go. */
export function FaceReconstruction({ form, dissolve, className }: Props) {
  const { quality } = useMotion();
  const fallback = (
    <div className="absolute inset-0 grid place-items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.avatarImage}
        alt=""
        className="h-[80%] w-auto object-contain opacity-40 [mask-image:radial-gradient(circle,black_40%,transparent_75%)]"
      />
    </div>
  );
  return (
    <SceneCanvas className={className} camera={{ position: [0, 0, 6.4], fov: 42 }} fallback={fallback}>
      <ParticleField count={quality === "low" ? 100 : 320} spread={[12, 9, 6]} size={1.1} opacity={0.45} seed={17} />
      <PortraitParticles
        progress={form}
        dissolve={dissolve}
        height={5.0}
        density={quality === "high" ? 108 : quality === "medium" ? 84 : 56}
        position={[0, -0.5, 0]}
        network={quality !== "low"}
      />
    </SceneCanvas>
  );
}
