"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { SceneCanvas } from "./SceneCanvas";
import { ParticleField } from "./ParticleField";
import { DroneModel } from "./DroneModel";
import { NeuralNetwork } from "./NeuralNetwork";
import { journey } from "@/data/journey";
import { useMotion } from "@/components/providers/MotionProvider";
import { pointer } from "@/lib/pointer";
import { lerp } from "@/lib/utils";

const N = journey.length;

/** Node anchor points — the path snakes into the screen. */
const NODE_POINTS = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(2.4, 0.4, -9),
  new THREE.Vector3(-2.2, -0.3, -18),
  new THREE.Vector3(2.0, 0.6, -27),
  new THREE.Vector3(0, 0.2, -36),
];

const curve = new THREE.CatmullRomCurve3(NODE_POINTS, false, "catmullrom", 0.5);

/* ------------------------------ vignettes ------------------------------ */

function TerminalCore({ accent }: { accent: string }) {
  const g = useRef<THREE.Group>(null);
  const cursor = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (g.current) g.current.rotation.y = Math.sin(t * 0.3) * 0.25;
    if (cursor.current) (cursor.current.material as THREE.MeshBasicMaterial).opacity = Math.round(t * 2) % 2 ? 1 : 0.15;
  });
  return (
    <group ref={g}>
      <mesh>
        <boxGeometry args={[2.2, 1.4, 0.08]} />
        <meshStandardMaterial color="#0d0d16" metalness={0.5} roughness={0.5} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.24, 1.44, 0.1)]} />
        <lineBasicMaterial color={accent} transparent opacity={0.8} />
      </lineSegments>
      {/* code rows */}
      {[0.42, 0.24, 0.06, -0.12, -0.3].map((y, i) => (
        <mesh key={i} position={[-0.95 + [0.5, 0.7, 0.35, 0.8, 0.45][i] / 2, y, 0.05]}>
          <planeGeometry args={[[0.5, 0.7, 0.35, 0.8, 0.45][i], 0.05]} />
          <meshBasicMaterial color={i === 0 ? accent : "#3a3f66"} transparent opacity={i === 0 ? 0.9 : 0.6} />
        </mesh>
      ))}
      <mesh ref={cursor} position={[-0.72, -0.48, 0.05]}>
        <planeGeometry args={[0.1, 0.06]} />
        <meshBasicMaterial color={accent} transparent />
      </mesh>
      {/* pedestal glow */}
      <mesh position={[0, -1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.0, 48]} />
        <meshBasicMaterial color={accent} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function CircuitBoard({ accent }: { accent: string }) {
  const pulses = useRef<THREE.InstancedMesh>(null);
  const grid = useMemo(() => {
    const segs: number[] = [];
    const size = 3.2,
      step = 0.4;
    for (let i = -size / 2; i <= size / 2; i += step) {
      segs.push(-size / 2, 0, i, size / 2, 0, i, i, 0, -size / 2, i, 0, size / 2);
    }
    return new Float32Array(segs);
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lanes = useMemo(() => [-1.2, -0.4, 0.4, 1.2, -0.8, 0.8], []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (!pulses.current) return;
    lanes.forEach((z, i) => {
      const along = ((t * (0.5 + (i % 3) * 0.2) + i * 0.7) % 3.2) - 1.6;
      if (i % 2) dummy.position.set(along, 0.02, z);
      else dummy.position.set(z, 0.02, along);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      pulses.current!.setMatrixAt(i, dummy.matrix);
    });
    pulses.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group rotation={[0.35, 0.4, 0]} position={[0, -0.4, 0]} scale={0.62}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[grid, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={accent} transparent opacity={0.28} />
      </lineSegments>
      <instancedMesh ref={pulses} args={[undefined, undefined, lanes.length]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
      {/* chips */}
      {[
        [-0.8, 0.6],
        [0.6, -0.6],
        [0.9, 0.9],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.08, z]}>
          <mesh>
            <boxGeometry args={[0.42, 0.1, 0.42]} />
            <meshStandardMaterial color="#15151f" metalness={0.5} roughness={0.5} emissive="#0b0b14" />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(0.42, 0.1, 0.42)]} />
            <lineBasicMaterial color={accent} transparent opacity={0.85} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

function EngineerCore({ accent }: { accent: string }) {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (outer.current) {
      outer.current.rotation.y = t * 0.25;
      outer.current.rotation.x = t * 0.12;
    }
    if (inner.current) inner.current.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
    if (rings.current) rings.current.rotation.z = t * 0.2;
  });
  return (
    <group>
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.55} />
      </mesh>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.45, 2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshBasicMaterial color={accent} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={rings} rotation={[Math.PI / 2.6, 0.4, 0]}>
        {[1.5, 1.9].map((r, i) => (
          <mesh key={r} rotation={[0, 0, i * 0.8]}>
            <torusGeometry args={[r, 0.006, 6, 120]} />
            <meshBasicMaterial color={i ? "#ffffff" : accent} transparent opacity={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------- path -------------------------------- */

function Path({ progress }: { progress: MutableRefObject<number> }) {
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 300, 0.012, 6, false), []);
  const glow = useMemo(() => new THREE.TubeGeometry(curve, 300, 0.05, 6, false), []);
  const pulse = useRef<THREE.Mesh>(null);
  const litMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((s) => {
    const p = progress.current;
    if (pulse.current) {
      const t = (p + 0.02 + Math.sin(s.clock.elapsedTime * 0.5) * 0.005) % 1;
      pulse.current.position.copy(curve.getPointAt(Math.min(1, Math.max(0, t))));
    }
    if (litMat.current) litMat.current.opacity = 0.35 + 0.15 * Math.sin(s.clock.elapsedTime * 2);
  });
  return (
    <group>
      <mesh geometry={tube}>
        <meshBasicMaterial color="#8f9dff" transparent opacity={0.9} />
      </mesh>
      <mesh geometry={glow}>
        <meshBasicMaterial ref={litMat} color="#5f6dff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* node markers */}
      {NODE_POINTS.map((p, i) => (
        <group key={i} position={p}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
            <ringGeometry args={[0.28, 0.32, 40]} />
            <meshBasicMaterial color={journey[i].accent} transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color={journey[i].accent} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------ camera rig ------------------------------ */

/* Scratch objects live at module scope so the frame loop never allocates and
   never mutates a hook-owned value. Only one rig renders at a time. */
const scratch = {
  target: new THREE.Vector3(),
  pos: new THREE.Vector3(),
  look: new THREE.Vector3(),
  fogColor: new THREE.Color("#050505"),
  tint: new THREE.Color(),
  base: new THREE.Color("#050505"),
};

function Rig({ progress }: { progress: MutableRefObject<number> }) {
  const { camera, scene } = useThree();
  const smoothP = useRef(0);
  useFrame((_, dt) => {
    const { target, pos, look, fogColor, tint, base } = scratch;
    smoothP.current = lerp(smoothP.current, progress.current, Math.min(1, dt * 4));
    const p = smoothP.current;
    const camT = THREE.MathUtils.clamp(p - 0.085, 0, 1);
    curve.getPointAt(camT, pos);
    pos.y += 0.9 + pointer.sy * 0.2;
    pos.x += pointer.sx * 0.35;
    // beyond the last node hold back a bit for framing
    if (p > 0.95) pos.z += (p - 0.95) * 10;
    camera.position.lerp(pos, Math.min(1, dt * 5));
    curve.getPointAt(THREE.MathUtils.clamp(p + 0.01, 0, 1), look);
    target.lerp(look, Math.min(1, dt * 5));
    camera.lookAt(target);
    // environment tint follows the active year
    const idx = Math.min(N - 1, Math.max(0, Math.round(p * (N - 1))));
    tint.set(journey[idx].accent).multiplyScalar(0.06);
    fogColor.lerp(base.setHex(0x050505).add(tint), dt * 2);
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(fogColor);
  });
  return null;
}

/* ------------------------------- scene -------------------------------- */

type Props = {
  progress: MutableRefObject<number>;
  onDroneSelect?: () => void;
  className?: string;
};

export function TimelineScene({ progress, onDroneSelect, className }: Props) {
  const { quality, isMobile } = useMotion();
  const expandRef = useRef(1);
  return (
    <SceneCanvas className={className} camera={{ position: [0, 1, 4], fov: isMobile ? 62 : 50 }} margin="0px">
      <Rig progress={progress} />
      <fog attach="fog" args={["#050505", 4, 22]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 2]} intensity={1.4} color="#c8d0ff" />
      <pointLight position={[-3, 2, -8]} intensity={12} color="#8b6cff" distance={14} />
      <ParticleField count={quality === "high" ? 900 : quality === "medium" ? 500 : 220} spread={[14, 10, 44]} size={1.3} opacity={0.55} seed={3} />
      <Path progress={progress} />

      <group position={NODE_POINTS[0].clone().add(new THREE.Vector3(0, 0.9, -1.4))}>
        <TerminalCore accent={journey[0].accent} />
      </group>
      <group position={NODE_POINTS[1].clone().add(new THREE.Vector3(0, 0.6, -1.4))}>
        <CircuitBoard accent={journey[1].accent} />
      </group>
      <group position={NODE_POINTS[2].clone().add(new THREE.Vector3(0.2, 1.1, -1.6))}>
        <DroneModel accent={journey[2].accent} scale={0.9} onClick={onDroneSelect} />
      </group>
      <group position={NODE_POINTS[3].clone().add(new THREE.Vector3(0, 1.0, -1.6))}>
        <NeuralNetwork accent={journey[3].accent} count={quality === "low" ? 60 : 110} radius={1.3} expand={expandRef} />
      </group>
      <group position={NODE_POINTS[4].clone().add(new THREE.Vector3(0, 1.1, -1.8))}>
        <EngineerCore accent={journey[4].accent} />
      </group>
    </SceneCanvas>
  );
}
