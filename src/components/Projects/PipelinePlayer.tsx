"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { ArchEdge, ArchNode } from "@/data/projects";
import { cn } from "@/lib/utils";
import { useMotion } from "@/components/providers/MotionProvider";

type Props = {
  nodes: ArchNode[];
  edges: ArchEdge[];
  accent: string;
  /** Label shown on the travelling token, e.g. "query". */
  token?: string;
};

/**
 * Interactive pipeline: a token travels stage by stage. The visitor can play,
 * pause, or step to any stage — used for the RAG and data pipelines.
 */
export function PipelinePlayer({ nodes, edges, accent, token = "query" }: Props) {
  const ordered = [...nodes].sort((a, b) => a.tier - b.tier);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const { reducedMotion } = useMotion();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    timer.current = window.setInterval(() => {
      setStage((s) => (s + 1) % ordered.length);
    }, 1400);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, ordered.length, reducedMotion]);

  const branchOf = (id: string) => edges.filter((e) => e.from === id).map((e) => e.to);

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-dim">Pipeline</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:text-fg"
            aria-pressed={playing}
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={() => setStage((s) => (s + 1) % ordered.length)}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-muted transition-colors hover:text-fg"
          >
            Step
          </button>
        </div>
      </div>

      <ol className="relative space-y-2">
        {ordered.map((n, i) => {
          const isActive = i === stage;
          const isPast = i < stage;
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setStage(i);
                }}
                aria-current={isActive}
                className={cn(
                  "relative flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all duration-500",
                  isActive ? "border-white/25 bg-white/[0.06]" : isPast ? "border-line bg-white/[0.03]" : "border-line bg-white/[0.012]",
                )}
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-[0.68rem] transition-colors"
                  style={{
                    background: isActive ? accent : isPast ? `${accent}33` : "rgba(255,255,255,0.05)",
                    color: isActive ? "#0b0b12" : isPast ? accent : "#62626f",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm font-medium", isActive ? "text-fg" : "text-fg/75")}>{n.label}</span>
                  {n.meta && <span className="block truncate text-xs text-muted">{n.meta}</span>}
                </span>
                {isActive && !reducedMotion && (
                  <motion.span
                    layoutId={`token-${token}`}
                    className="rounded-full px-2.5 py-1 font-mono text-[0.62rem]"
                    style={{ background: `${accent}22`, color: accent }}
                    transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  >
                    {token}
                  </motion.span>
                )}
                {branchOf(n.id).length > 1 && (
                  <span className="font-mono text-[0.6rem] text-dim">branches</span>
                )}
              </button>
              {i < ordered.length - 1 && (
                <span className="ml-8 block h-3 w-px bg-gradient-to-b from-white/20 to-transparent" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
