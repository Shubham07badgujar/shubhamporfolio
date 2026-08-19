"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { SceneCanvas } from "./SceneCanvas";
import type { Achievement } from "@/data/achievements";
import { pointer } from "@/lib/pointer";

/* Each achievement gets a shape that means something, not a generic trophy. */

function DroneGlyph({ accent }: { accent: string }) {
  // AeroTHON: a stylised quad frame seen from above
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (g.current) g.current.rotation.y = s.clock.elapsedTime * 0.5;
  });
  return (
    <group ref={g} rotation={[0.9, 0, 0]}>
      {[45, 135, 225, 315].map((deg) => {
        const r = (deg * Math.PI) / 180;
        return (
          <group key={deg} position={[Math.cos(r) * 0.6, 0, Math.sin(r) * 0.6]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.3, 0.012, 8, 32]} />
              <meshBasicMaterial color={accent} />
            </mesh>
          </group>
        );
      })}
      <mesh>
        <boxGeometry args={[0.28, 0.06, 0.28]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function PodiumGlyph({ accent }: { accent: string }) {
  // 1st runner-up: three bars, the second one lit
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (g.current) g.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.5) * 0.5;
  });
  const bars = [
    { x: -0.42, h: 0.5, lit: false },
    { x: 0, h: 0.85, lit: false },
    { x: 0.42, h: 0.68, lit: true },
  ];
  return (
    <group ref={g}>
      {bars.map((b) => (
        <group key={b.x} position={[b.x, b.h / 2 - 0.45, 0]}>
          <mesh>
            <boxGeometry args={[0.34, b.h, 0.34]} />
            <meshBasicMaterial color={b.lit ? accent : "#1c1c28"} transparent opacity={b.lit ? 0.35 : 1} />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(0.34, b.h, 0.34)]} />
            <lineBasicMaterial color={b.lit ? accent : "#3a3a4c"} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

function SeedGlyph({ accent }: { accent: string }) {
  // MSME grant: a seed / sprout of funding growing
  const g = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (g.current) g.current.rotation.y = t * 0.4;
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 1.8) * 0.08);
  });
  return (
    <group ref={g}>
      <mesh ref={core}>
        <dodecahedronGeometry args={[0.34, 0]} />
        <meshBasicMaterial color={accent} wireframe />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <torusGeometry args={[0.62 + i * 0.06, 0.005, 6, 60, Math.PI]} />
          <meshBasicMaterial color={accent} transparent opacity={0.5} />
        </mesh>
      ))}
      <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.44, 40]} />
        <meshBasicMaterial color={accent} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function GridGlyph({ accent }: { accent: string }) {
  // Top 99 / 2000+: a field of points with a few standing out
  const pts = useMemo(() => {
    const arr: number[] = [];
    const n = 9;
    for (let x = 0; x < n; x++)
      for (let y = 0; y < n; y++) arr.push((x / (n - 1) - 0.5) * 1.5, (y / (n - 1) - 0.5) * 1.5, 0);
    return new Float32Array(arr);
  }, []);
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (g.current) {
      g.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.6;
      g.current.rotation.x = Math.cos(s.clock.elapsedTime * 0.3) * 0.2;
    }
  });
  return (
    <group ref={g}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pts, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#3a3a4c" size={0.045} sizeAttenuation />
      </points>
      {[
        [-0.2, 0.3],
        [0.15, -0.1],
        [0.35, 0.42],
      ].map(([x, y]) => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.08]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      ))}
    </group>
  );
}

function SummitGlyph({ accent }: { accent: string }) {
  // Kaggle top 1.5%: a distribution curve with the tip lit
  const geom = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = (i / 80 - 0.5) * 1.8;
      const y = Math.exp(-(x * x) / 0.12) * 0.85 - 0.42;
      pts.push(new THREE.Vector3(x, y, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  const tip = useRef<THREE.Mesh>(null);
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (tip.current) tip.current.position.y = 0.43 + Math.sin(t * 2) * 0.03;
    if (g.current) g.current.rotation.y = Math.sin(t * 0.4) * 0.35;
  });
  return (
    <group ref={g}>
      <line>
        <primitive object={geom} attach="geometry" />
        <lineBasicMaterial color={accent} />
      </line>
      <mesh ref={tip} position={[0, 0.43, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -0.44, 0]}>
        <boxGeometry args={[1.85, 0.006, 0.006]} />
        <meshBasicMaterial color="#3a3a4c" />
      </mesh>
    </group>
  );
}

const GLYPHS = {
  drone: DroneGlyph,
  podium: PodiumGlyph,
  seed: SeedGlyph,
  grid: GridGlyph,
  summit: SummitGlyph,
} as const;

function Tilt({ children }: { children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!g.current) return;
    g.current.rotation.y += (pointer.sx * 0.4 - g.current.rotation.y) * dt * 2;
    g.current.rotation.x += (-pointer.sy * 0.25 - g.current.rotation.x) * dt * 2;
  });
  return <group ref={g}>{children}</group>;
}

/** Small canvas rendering one achievement's meaningful 3D object. */
export function TrophyObject({ achievement, className }: { achievement: Achievement; className?: string }) {
  const Glyph = GLYPHS[achievement.shape];
  return (
    <SceneCanvas className={className} camera={{ position: [0, 0, 3.2], fov: 40 }}>
      <ambientLight intensity={1} />
      <Tilt>
        <Glyph accent={achievement.accent} />
      </Tilt>
    </SceneCanvas>
  );
}
