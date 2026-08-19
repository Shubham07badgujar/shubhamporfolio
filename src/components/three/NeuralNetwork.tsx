"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { seeded } from "@/lib/utils";

type Props = {
  count?: number;
  radius?: number;
  accent?: string;
  accent2?: string;
  /** Number of nearest neighbours to link */
  links?: number;
  speed?: number;
  /** 0..1 how "expanded" the network is (radius multiplier) — read each frame */
  expand?: React.MutableRefObject<number>;
};

/** A slowly rotating sphere of nodes with pulsing links — the AI/ML motif. */
export function NeuralNetwork({ count = 90, radius = 1.4, accent = "#a26bff", accent2 = "#5f8dff", links = 3, speed = 0.15, expand }: Props) {
  const group = useRef<THREE.Group>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);
  const pointsMat = useRef<THREE.PointsMaterial>(null);

  const { positions, linePositions } = useMemo(() => {
    const rnd = seeded(101);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      // fibonacci sphere with jitter for even coverage
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      const jitter = 0.75 + rnd() * 0.45;
      pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(radius * jitter));
    }
    const positions = new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z]));
    const segs: number[] = [];
    pts.forEach((p, i) => {
      const near = pts
        .map((q, j) => ({ j, d: j === i ? Infinity : p.distanceToSquared(q) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, links);
      near.forEach(({ j }) => {
        if (j > i) segs.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z);
      });
    });
    return { positions, linePositions: new Float32Array(segs) };
  }, [count, radius, links]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y += dt * speed;
      group.current.rotation.x = Math.sin(t * 0.2) * 0.2;
      const s = 0.55 + 0.45 * (expand?.current ?? 1);
      group.current.scale.setScalar(s);
    }
    if (lineMat.current) lineMat.current.opacity = 0.18 + 0.1 * Math.sin(t * 1.4);
    if (pointsMat.current) pointsMat.current.size = 0.05 + 0.012 * Math.sin(t * 2.0);
  });

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMat} color={accent} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={pointsMat} color={accent2} size={0.05} sizeAttenuation transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {/* core */}
      <mesh>
        <sphereGeometry args={[radius * 0.28, 24, 24]} />
        <meshBasicMaterial color={accent} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
