"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { SceneCanvas } from "./SceneCanvas";
import { ParticleField } from "./ParticleField";
import { DigitalPortrait } from "./DigitalPortrait";
import { useMotion } from "@/components/providers/MotionProvider";
import { pointer } from "@/lib/pointer";
import { profile } from "@/data/profile";

function OrbitRings() {
  const g = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.rotation.z = t * 0.03;
    g.current.rotation.x = Math.PI / 2.4 + pointer.sy * 0.1;
    g.current.rotation.y = pointer.sx * 0.15;
  });
  return (
    <group ref={g} position={[0.6, -0.4, -1.5]}>
      {[3.2, 4.1, 5.3].map((r, i) => (
        <mesh key={r} rotation={[0, 0, i * 0.4]}>
          <torusGeometry args={[r, 0.004, 8, 160]} />
          <meshBasicMaterial color={i === 1 ? "#a26bff" : "#5f8dff"} transparent opacity={0.22 - i * 0.05} />
        </mesh>
      ))}
    </group>
  );
}

function GlowDisc() {
  return (
    <mesh position={[0.6, -0.6, -2.4]}>
      <circleGeometry args={[3.4, 48]} />
      <meshBasicMaterial color="#3a4cff" transparent opacity={0.09} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function CameraRig() {
  useFrame((state, dt) => {
    const cam = state.camera;
    cam.position.x += (pointer.sx * 0.25 - cam.position.x) * dt * 2;
    cam.position.y += (pointer.sy * 0.15 - cam.position.y) * dt * 2;
    cam.lookAt(0, 0, 0);
  });
  return null;
}

type Props = { progress: MutableRefObject<number>; className?: string };

/** Hero background: particle field, orbit rings and the breathing digital avatar. */
export function AvatarScene({ progress, className }: Props) {
  const { quality, isMobile } = useMotion();
  const fallback = (
    <div className="absolute inset-0 flex items-end justify-center md:justify-end md:pr-[8vw]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={profile.avatarImage}
        alt=""
        className="h-[70%] w-auto object-contain opacity-35 mix-blend-luminosity [mask-image:radial-gradient(70%_60%_at_50%_40%,black_35%,transparent_78%)]"
      />
    </div>
  );
  // Framed like the reference: the figure stands tall on the right, bleeding off
  // the bottom edge, with the copy occupying the left of the viewport.
  const portraitFraction = isMobile ? 0.72 : 0.98;
  const portraitPos: [number, number, number] = isMobile ? [0, -0.9, 0] : [1.9, -0.7, 0];
  return (
    <SceneCanvas className={className} camera={{ position: [0, 0, 7.5], fov: 40 }} fallback={fallback} margin="0px">
      <CameraRig />
      <fog attach="fog" args={["#050505", 6, 14]} />
      <ParticleField count={quality === "high" ? 700 : quality === "medium" ? 400 : 180} spread={[18, 12, 8]} />
      <GlowDisc />
      {!isMobile && <OrbitRings />}
      <DigitalPortrait
        progress={progress}
        heightFraction={portraitFraction}
        position={portraitPos}
        levels={9}
        exposure={0.5}
        vignette={0.85}
      />
    </SceneCanvas>
  );
}
