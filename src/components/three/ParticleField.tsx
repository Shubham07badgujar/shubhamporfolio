"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { seeded } from "@/lib/utils";
import { pointer } from "@/lib/pointer";

type Props = {
  count?: number;
  spread?: [number, number, number];
  size?: number;
  color?: string;
  color2?: string;
  opacity?: number;
  speed?: number;
  /** how strongly the field parallaxes with the cursor */
  parallax?: number;
  seed?: number;
};

const vert = /* glsl */ `
  attribute float aScale;
  attribute float aPhase;
  attribute float aMix;
  uniform float uTime;
  uniform float uSize;
  uniform float uSpeed;
  varying float vMix;
  varying float vAlpha;
  void main() {
    vMix = aMix;
    vec3 p = position;
    float t = uTime * uSpeed;
    p.x += sin(t * 0.7 + aPhase * 6.2831) * 0.25;
    p.y += cos(t * 0.5 + aPhase * 6.2831) * 0.25 + sin(t * 0.13 + aPhase) * 0.15;
    p.z += sin(t * 0.3 + aPhase * 3.0) * 0.1;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    // clamped so particles passing near the camera stay specks, not blobs
    gl_PointSize = clamp(uSize * aScale * (30.0 / max(dist, 0.1)), 0.5, 5.0);
    vAlpha = smoothstep(0.0, 1.0, 0.65 + 0.35 * sin(t * 1.5 + aPhase * 12.0));
    gl_Position = projectionMatrix * mv;
  }
`;

const frag = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uColor2;
  uniform float uOpacity;
  varying float vMix;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.05, d);
    a *= a;
    vec3 col = mix(uColor, uColor2, vMix);
    gl_FragColor = vec4(col, a * uOpacity * vAlpha);
  }
`;

export function ParticleField({
  count = 600,
  spread = [16, 10, 8],
  size = 1.6,
  color = "#7f9cff",
  color2 = "#b58cff",
  opacity = 0.7,
  speed = 0.35,
  parallax = 0.35,
  seed = 7,
}: Props) {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const { positions, scales, phases, mixes } = useMemo(() => {
    const rnd = seeded(seed);
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    const mixes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rnd() - 0.5) * spread[0];
      positions[i * 3 + 1] = (rnd() - 0.5) * spread[1];
      positions[i * 3 + 2] = (rnd() - 0.5) * spread[2];
      scales[i] = 0.4 + rnd() * rnd() * 1.6;
      phases[i] = rnd();
      mixes[i] = rnd();
    }
    return { positions, scales, phases, mixes };
  }, [count, spread, seed]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uSpeed: { value: speed },
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(color) },
      uColor2: { value: new THREE.Color(color2) },
    }),
    [size, speed, opacity, color, color2],
  );

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.rotation.y = pointer.sx * 0.08 * parallax;
      ref.current.rotation.x = -pointer.sy * 0.06 * parallax;
    }
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
        <bufferAttribute attach="attributes-aMix" args={[mixes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
