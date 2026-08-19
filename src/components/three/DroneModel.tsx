"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";

type Props = {
  scale?: number;
  accent?: string;
  /** Flies a slow loop when true, otherwise hovers in place. */
  fly?: boolean;
  onClick?: () => void;
  onHover?: (hover: boolean) => void;
  children?: ReactNode;
};

const ARMS = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
] as const;

/** Procedural low-poly quadcopter with spinning rotors and a subtle wire glow. */
export function DroneModel({ scale = 1, accent = "#8b6cff", fly = true, onClick, onHover, children }: Props) {
  const group = useRef<THREE.Group>(null);
  const rotors = useRef<Array<THREE.Mesh | null>>([]);
  const light = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      if (fly) {
        group.current.position.x = Math.sin(t * 0.35) * 0.9;
        group.current.position.z = Math.cos(t * 0.35) * 0.5;
        group.current.position.y = Math.sin(t * 0.9) * 0.15 + Math.cos(t * 0.35) * 0.2;
        group.current.rotation.z = -Math.cos(t * 0.35) * 0.18;
        group.current.rotation.x = Math.sin(t * 0.35) * 0.12;
        group.current.rotation.y = -t * 0.35 + Math.PI / 2;
      } else {
        group.current.position.y = Math.sin(t * 1.1) * 0.08;
        group.current.rotation.z = Math.sin(t * 0.7) * 0.05;
      }
    }
    rotors.current.forEach((r, i) => {
      if (r) r.rotation.y = t * (i % 2 ? 28 : -28);
    });
    if (light.current) {
      const m = light.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.5 + 0.5 * Math.abs(Math.sin(t * 3));
    }
  });

  return (
    <group
      ref={group}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover?.(false);
        document.body.style.cursor = "";
      }}
    >
      {/* body */}
      <mesh>
        <boxGeometry args={[0.55, 0.16, 0.7]} />
        <meshStandardMaterial color="#1a1a26" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.1, 0.05]}>
        <boxGeometry args={[0.32, 0.1, 0.4]} />
        <meshStandardMaterial color="#23232f" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* camera gimbal */}
      <mesh position={[0, -0.13, 0.28]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#0c0c12" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* status light */}
      <mesh ref={light} position={[0, 0.17, -0.2]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color={accent} transparent />
      </mesh>
      {/* arms & rotors */}
      {ARMS.map(([sx, sz], i) => (
        <group key={i}>
          <mesh position={[sx * 0.42, 0, sz * 0.42]} rotation={[0, sx * sz * Math.PI * 0.25, 0]}>
            <boxGeometry args={[0.9, 0.05, 0.07]} />
            <meshStandardMaterial color="#20202c" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[sx * 0.72, 0.03, sz * 0.72]}>
            <cylinderGeometry args={[0.06, 0.07, 0.1, 10]} />
            <meshStandardMaterial color="#2a2a38" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* rotor guard */}
          <mesh position={[sx * 0.72, 0.09, sz * 0.72]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.008, 6, 40]} />
            <meshBasicMaterial color={accent} transparent opacity={0.6} />
          </mesh>
          {/* blades */}
          <mesh
            ref={(el) => {
              rotors.current[i] = el;
            }}
            position={[sx * 0.72, 0.1, sz * 0.72]}
          >
            <boxGeometry args={[0.6, 0.008, 0.05]} />
            <meshBasicMaterial color="#c9ccff" transparent opacity={0.45} />
          </mesh>
          {/* leg */}
          <mesh position={[sx * 0.2, -0.16, sz * 0.2]}>
            <boxGeometry args={[0.03, 0.16, 0.03]} />
            <meshStandardMaterial color="#20202c" />
          </mesh>
        </group>
      ))}
      {children}
    </group>
  );
}
