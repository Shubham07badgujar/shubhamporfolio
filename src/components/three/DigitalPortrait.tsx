"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { portraitFragment, portraitVertex } from "./portraitShader";
import { pointer } from "@/lib/pointer";
import { profile } from "@/data/profile";
import { lerp } from "@/lib/utils";

type Props = {
  /** 0 = photo, 1 = fully digital. Read every frame. */
  progress: MutableRefObject<number>;
  height?: number;
  /** When set, the plane is sized to this fraction of the visible height. */
  heightFraction?: number;
  position?: [number, number, number];
  breathe?: boolean;
  parallax?: number;
  edgeFade?: number;
  opacity?: number;
  levels?: number;
  accent?: string;
  accent2?: string;
  src?: string;
  /** Brightness of the photo stage. Below 1 keeps the avatar behind the copy. */
  exposure?: number;
  /** Radial falloff so the plane's rectangle never shows. */
  vignette?: number;
};

/**
 * The avatar: a textured plane processed by the portrait shader with breathing,
 * pointer-reactive lighting and parallax. Swap the image at profile.avatarImage.
 */
export function DigitalPortrait({
  progress,
  height = 6,
  heightFraction,
  position = [0, 0, 0],
  breathe = true,
  parallax = 1,
  edgeFade = 1,
  opacity = 1,
  levels = 9,
  accent = "#5f8dff",
  accent2 = "#a86bff",
  src = profile.avatarImage,
  exposure = 0.55,
  vignette = 0.75,
}: Props) {
  const tex = useTexture(src);
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const smooth = useRef({ p: 0, rx: 0, ry: 0 });

  const viewport = useThree((s) => s.viewport);
  const img = tex.image as HTMLImageElement | undefined;
  const aspect = img ? img.width / img.height : 0.75;
  // Sizing against the viewport keeps the figure framed the same way on any
  // screen, instead of shrinking to a stamp on wide monitors.
  const planeHeight = heightFraction ? viewport.height * heightFraction : height;
  const width = planeHeight * aspect;

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uTexel: { value: new THREE.Vector2(1 / (img?.width ?? 768), 1 / (img?.height ?? 1024)) },
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerOn: { value: 0 },
      uAccent: { value: new THREE.Color(accent) },
      uAccent2: { value: new THREE.Color(accent2) },
      uOpacity: { value: opacity },
      uLevels: { value: levels },
      uEdgeFade: { value: edgeFade },
      uExposure: { value: exposure },
      uVignette: { value: vignette },
    }),
    [tex, img?.width, img?.height, accent, accent2, opacity, levels, edgeFade, exposure, vignette],
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const s = smooth.current;
    s.p = lerp(s.p, progress.current, Math.min(1, dt * 4));
    if (mat.current) {
      mat.current.uniforms.uTime.value = t;
      mat.current.uniforms.uProgress.value = s.p;
      // pointer -> uv space of the plane (approximate: viewport-based)
      const u = 0.5 + pointer.sx * 0.5;
      const v = 0.5 + pointer.sy * 0.5;
      mat.current.uniforms.uPointer.value.set(u, v);
      mat.current.uniforms.uPointerOn.value = lerp(
        mat.current.uniforms.uPointerOn.value,
        pointer.active ? 1 : 0,
        Math.min(1, dt * 3),
      );
    }
    if (mesh.current) {
      const breath = breathe ? 1 + Math.sin(t * 0.9) * 0.008 : 1;
      mesh.current.scale.set(breath, breath, 1);
      s.rx = lerp(s.rx, -pointer.sy * 0.08 * parallax, dt * 3);
      s.ry = lerp(s.ry, pointer.sx * 0.12 * parallax, dt * 3);
      mesh.current.rotation.x = s.rx + Math.sin(t * 0.5) * 0.01;
      mesh.current.rotation.y = s.ry + Math.sin(t * 0.35) * 0.015;
      mesh.current.position.y = position[1] + Math.sin(t * 0.9) * 0.02;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={[width, planeHeight, 32, 48]} />
      <shaderMaterial
        ref={mat}
        vertexShader={portraitVertex}
        fragmentShader={portraitFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
