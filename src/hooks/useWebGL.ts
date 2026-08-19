"use client";

import { useSyncExternalStore } from "react";

let cached: boolean | null = null;

const detect = () => {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement("canvas");
    cached = !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    cached = false;
  }
  return cached;
};

const subscribe = () => () => {};

/** Detects WebGL support once; returns null during SSR so markup stays stable. */
export function useWebGL() {
  return useSyncExternalStore<boolean | null>(subscribe, detect, () => null);
}
