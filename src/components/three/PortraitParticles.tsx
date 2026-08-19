"use client";

import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { seeded, lerp } from "@/lib/utils";
import { pointer } from "@/lib/pointer";
import { profile } from "@/data/profile";

type Props = {
  /** 0 = scattered cloud, 1 = fully formed face */
  progress: MutableRefObject<number>;
  /** 0 = intact, 1 = dissolved upward */
  dissolve?: MutableRefObject<number>;
  height?: number;
  density?: number; // sample grid columns
  position?: [number, number, number];
  accent?: string;
  accent2?: string;
  network?: boolean;
  src?: string;
};

const pointVert = /* glsl */ `
  attribute vec3 aScatter;
  attribute float aLum;
  attribute float aRand;
  uniform float uTime;
  uniform float uProgress;
  uniform float uDissolve;
  uniform float uSize;
  uniform vec2 uPointer;
  varying float vLum;
  varying float vAlpha;
  float ease(float t){ return t*t*(3.0-2.0*t); }
  void main() {
    vLum = aLum;
    // per-particle staggered progress so the face "grows in"
    float local = clamp((uProgress - aRand * 0.35) / 0.65, 0.0, 1.0);
    float e = ease(local);
    vec3 p = mix(aScatter, position, e);
    // idle jitter (less when formed)
    float jit = (1.0 - e * 0.85) * 0.06;
    p.x += sin(uTime * 0.8 + aRand * 40.0) * jit;
    p.y += cos(uTime * 0.6 + aRand * 33.0) * jit;
    // dissolve upward
    float d = ease(clamp((uDissolve - aRand * 0.4) / 0.6, 0.0, 1.0));
    p.y += d * (1.5 + aRand * 2.5);
    p.x += d * (aRand - 0.5) * 2.0;
    p.z += d * (aRand - 0.5) * 1.5;
    // pointer repulsion
    vec2 dp = p.xy - uPointer;
    float dist = length(dp);
    p.xy += normalize(dp + 0.0001) * smoothstep(0.9, 0.0, dist) * 0.25;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    // clamped so the face reads as fine points rather than a solid mass
    gl_PointSize = clamp(uSize * (0.6 + aLum * 0.9 + aRand * 0.3) * (34.0 / max(-mv.z, 0.1)), 0.5, 3.4);
    vAlpha = (0.25 + e * 0.5) * (1.0 - d);
    gl_Position = projectionMatrix * mv;
  }
`;

const pointFrag = /* glsl */ `
  uniform vec3 uAccent;
  uniform vec3 uAccent2;
  varying float vLum;
  varying float vAlpha;
  void main() {
    float dd = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.1, dd);
    vec3 col = mix(uAccent, mix(uAccent2, vec3(1.0), 0.6), vLum);
    gl_FragColor = vec4(col, a * vAlpha * (0.25 + vLum * 0.7));
  }
`;

const lineVert = /* glsl */ `
  attribute vec3 aScatter;
  attribute float aRand;
  uniform float uTime;
  uniform float uProgress;
  uniform float uDissolve;
  varying float vAlpha;
  float ease(float t){ return t*t*(3.0-2.0*t); }
  void main() {
    float local = clamp((uProgress - aRand * 0.35) / 0.65, 0.0, 1.0);
    float e = ease(local);
    vec3 p = mix(aScatter, position, e);
    float d = ease(clamp((uDissolve - aRand * 0.4) / 0.6, 0.0, 1.0));
    p.y += d * (1.5 + aRand * 2.5);
    p.x += d * (aRand - 0.5) * 2.0;
    vAlpha = e * (1.0 - d) * (0.5 + 0.5 * sin(uTime * 1.5 + aRand * 20.0));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const lineFrag = /* glsl */ `
  uniform vec3 uAccent;
  varying float vAlpha;
  void main() { gl_FragColor = vec4(uAccent, vAlpha * 0.28); }
`;

function sampleImage(img: HTMLImageElement, cols: number) {
  const aspect = img.height / img.width;
  const rows = Math.round(cols * aspect);
  const c = document.createElement("canvas");
  c.width = cols;
  c.height = rows;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;
  const pts: number[] = [];
  const lums: number[] = [];
  const rnd = seeded(11);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const a = data[i + 3] / 255;
      if (a < 0.5) continue;
      const l = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
      // keep denser sampling where it's brighter (features read better)
      if (rnd() > 0.35 + l * 0.6) continue;
      pts.push(x / cols - 0.5, 0.5 - y / rows, (rnd() - 0.5) * 0.04);
      lums.push(l);
    }
  }
  return { pts, lums, aspect };
}

export function PortraitParticles({
  progress,
  dissolve,
  height = 6,
  density = 96,
  position = [0, 0, 0],
  accent = "#5f8dff",
  accent2 = "#a86bff",
  network = true,
  src = profile.avatarImage,
}: Props) {
  const tex = useTexture(src);
  const pointsMat = useRef<THREE.ShaderMaterial>(null);
  const linesMat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const smooth = useRef({ p: 0, d: 0 });

  const data = useMemo(() => {
    const img = tex.image as HTMLImageElement;
    const { pts, lums, aspect } = sampleImage(img, density);
    const n = lums.length;
    const width = height / aspect;
    const positions = new Float32Array(n * 3);
    const scatter = new Float32Array(n * 3);
    const lum = new Float32Array(n);
    const rand = new Float32Array(n);
    const rnd = seeded(23);
    for (let i = 0; i < n; i++) {
      positions[i * 3] = pts[i * 3] * width;
      positions[i * 3 + 1] = pts[i * 3 + 1] * height;
      positions[i * 3 + 2] = pts[i * 3 + 2];
      // scattered start: a loose sphere / cloud around the portrait
      const th = rnd() * Math.PI * 2;
      const ph = Math.acos(2 * rnd() - 1);
      const r = 2.5 + rnd() * 3.5;
      scatter[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      scatter[i * 3 + 1] = Math.cos(ph) * r * 0.8;
      scatter[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r - 1;
      lum[i] = lums[i];
      rand[i] = rnd();
    }
    // network: connect a subset of nodes to nearest neighbours
    let linePos = new Float32Array(0);
    let lineScatter = new Float32Array(0);
    let lineRand = new Float32Array(0);
    if (network && n > 0) {
      const stride = Math.max(1, Math.floor(n / 260));
      const idx: number[] = [];
      for (let i = 0; i < n; i += stride) idx.push(i);
      const segs: number[] = [];
      const maxD2 = (width * 0.11) ** 2;
      for (let a = 0; a < idx.length; a++) {
        let links = 0;
        for (let b = a + 1; b < idx.length && links < 2; b++) {
          const ia = idx[a] * 3,
            ib = idx[b] * 3;
          const dx = positions[ia] - positions[ib];
          const dy = positions[ia + 1] - positions[ib + 1];
          if (dx * dx + dy * dy < maxD2) {
            segs.push(idx[a], idx[b]);
            links++;
          }
        }
      }
      linePos = new Float32Array(segs.length * 3);
      lineScatter = new Float32Array(segs.length * 3);
      lineRand = new Float32Array(segs.length);
      segs.forEach((pi, k) => {
        linePos[k * 3] = positions[pi * 3];
        linePos[k * 3 + 1] = positions[pi * 3 + 1];
        linePos[k * 3 + 2] = positions[pi * 3 + 2];
        lineScatter[k * 3] = scatter[pi * 3];
        lineScatter[k * 3 + 1] = scatter[pi * 3 + 1];
        lineScatter[k * 3 + 2] = scatter[pi * 3 + 2];
        lineRand[k] = rand[pi];
      });
    }
    return { positions, scatter, lum, rand, linePos, lineScatter, lineRand, count: n };
  }, [tex, density, height, network]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uDissolve: { value: 0 },
      uSize: { value: 1.5 },
      uPointer: { value: new THREE.Vector2(99, 99) },
      uAccent: { value: new THREE.Color(accent) },
      uAccent2: { value: new THREE.Color(accent2) },
    }),
    [accent, accent2],
  );
  const lineUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uDissolve: { value: 0 },
      uAccent: { value: new THREE.Color(accent) },
    }),
    [accent],
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const s = smooth.current;
    s.p = lerp(s.p, progress.current, Math.min(1, dt * 3));
    s.d = lerp(s.d, dissolve?.current ?? 0, Math.min(1, dt * 3));
    // pointer in world space (approx: plane at z=0 with a perspective camera at z ~ 8)
    const vw = state.viewport.getCurrentViewport(state.camera, new THREE.Vector3(0, 0, 0));
    const px = pointer.sx * vw.width * 0.5 - position[0];
    const py = pointer.sy * vw.height * 0.5 - position[1];
    for (const m of [pointsMat.current, linesMat.current]) {
      if (!m) continue;
      m.uniforms.uTime.value = t;
      m.uniforms.uProgress.value = s.p;
      m.uniforms.uDissolve.value = s.d;
    }
    if (pointsMat.current) pointsMat.current.uniforms.uPointer.value.set(pointer.active ? px : 99, pointer.active ? py : 99);
    if (group.current) {
      group.current.rotation.y = lerp(group.current.rotation.y, pointer.sx * 0.15, dt * 2);
      group.current.rotation.x = lerp(group.current.rotation.x, -pointer.sy * 0.08, dt * 2);
    }
  });

  if (!data.count) return null;

  return (
    <group ref={group} position={position}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
          <bufferAttribute attach="attributes-aScatter" args={[data.scatter, 3]} />
          <bufferAttribute attach="attributes-aLum" args={[data.lum, 1]} />
          <bufferAttribute attach="attributes-aRand" args={[data.rand, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={pointsMat}
          vertexShader={pointVert}
          fragmentShader={pointFrag}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {network && data.linePos.length > 0 && (
        <lineSegments frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[data.linePos, 3]} />
            <bufferAttribute attach="attributes-aScatter" args={[data.lineScatter, 3]} />
            <bufferAttribute attach="attributes-aRand" args={[data.lineRand, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={linesMat}
            vertexShader={lineVert}
            fragmentShader={lineFrag}
            uniforms={lineUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}
    </group>
  );
}
