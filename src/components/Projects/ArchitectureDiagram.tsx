"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ArchEdge, ArchNode } from "@/data/projects";
import { cn } from "@/lib/utils";

type Props = {
  nodes: ArchNode[];
  edges: ArchEdge[];
  accent: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
  /** Interactive: clicking a node focuses it and highlights its edges. */
  interactive?: boolean;
};

type Placed = ArchNode & { x: number; y: number };

const NODE_W = 150;
const NODE_H = 56;
const GAP_X = 60;
const GAP_Y = 44;

/**
 * SVG architecture graph with animated data packets flowing along edges.
 * Layout is derived from each node's tier, so data files stay declarative.
 */
export function ArchitectureDiagram({ nodes, edges, accent, orientation = "vertical", className, interactive = true }: Props) {
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState<string | null>(null);

  const { placed, width, height } = useMemo(() => {
    const tiers = new Map<number, ArchNode[]>();
    nodes.forEach((n) => {
      const arr = tiers.get(n.tier) ?? [];
      arr.push(n);
      tiers.set(n.tier, arr);
    });
    const tierKeys = [...tiers.keys()].sort((a, b) => a - b);
    const maxInTier = Math.max(...[...tiers.values()].map((v) => v.length));
    const placed: Placed[] = [];
    tierKeys.forEach((k, ti) => {
      const row = tiers.get(k)!;
      row.forEach((n, i) => {
        const offset = (maxInTier - row.length) / 2;
        if (orientation === "vertical") {
          placed.push({
            ...n,
            x: (i + offset) * (NODE_W + GAP_X) + NODE_W / 2,
            y: ti * (NODE_H + GAP_Y) + NODE_H / 2,
          });
        } else {
          placed.push({
            ...n,
            x: ti * (NODE_W + GAP_X) + NODE_W / 2,
            y: (i + offset) * (NODE_H + GAP_Y) + NODE_H / 2,
          });
        }
      });
    });
    const width =
      orientation === "vertical"
        ? maxInTier * (NODE_W + GAP_X) - GAP_X
        : tierKeys.length * (NODE_W + GAP_X) - GAP_X;
    const height =
      orientation === "vertical"
        ? tierKeys.length * (NODE_H + GAP_Y) - GAP_Y
        : maxInTier * (NODE_H + GAP_Y) - GAP_Y;
    return { placed, width, height };
  }, [nodes, orientation]);

  const byId = useMemo(() => new Map(placed.map((p) => [p.id, p])), [placed]);

  const isDim = (id: string) =>
    !!focus && focus !== id && !edges.some((e) => (e.from === focus && e.to === id) || (e.to === focus && e.from === id));

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <svg
        viewBox={`-8 -8 ${width + 16} ${height + 16}`}
        className="mx-auto block h-auto w-full"
        // Never upscale past the natural layout size, or a single-column graph
        // blows up to fill the panel.
        style={{ maxWidth: width + 16, minWidth: Math.min(width + 16, 280) }}
        role="img"
        aria-label="Architecture diagram"
      >
        <defs>
          <linearGradient id={`edge-${accent.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.7" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.25" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* edges */}
        {edges.map((e, i) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const active = !focus || focus === e.from || focus === e.to;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const path =
            orientation === "vertical"
              ? `M ${a.x} ${a.y + NODE_H / 2} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y - NODE_H / 2}`
              : `M ${a.x + NODE_W / 2} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x - NODE_W / 2} ${b.y}`;
          return (
            <g key={`${e.from}-${e.to}`} opacity={active ? 1 : 0.15} style={{ transition: "opacity 0.4s" }}>
              <path d={path} fill="none" stroke={`url(#edge-${accent.replace("#", "")})`} strokeWidth={1.4} strokeDasharray="3 4" />
              {/* Data packet: SMIL keeps this off the React render path entirely. */}
              {!reduce && (
                <circle r={2.6} fill="#fff" filter="url(#glow)" opacity={0.9}>
                  <animateMotion dur="2.6s" begin={`${i * 0.45}s`} repeatCount="indefinite" path={path} />
                </circle>
              )}
            </g>
          );
        })}

        {/* nodes */}
        {placed.map((n, i) => {
          const dim = isDim(n.id);
          const isFocus = focus === n.id;
          return (
            <motion.g
              key={n.id}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: dim ? 0.3 : 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              style={{ cursor: interactive ? "pointer" : "default" }}
              onClick={() => interactive && setFocus((f) => (f === n.id ? null : n.id))}
              tabIndex={interactive ? 0 : -1}
              role={interactive ? "button" : undefined}
              aria-label={interactive ? `${n.label}${n.meta ? ` — ${n.meta}` : ""}` : undefined}
              onKeyDown={(ev) => {
                if (interactive && (ev.key === "Enter" || ev.key === " ")) {
                  ev.preventDefault();
                  setFocus((f) => (f === n.id ? null : n.id));
                }
              }}
            >
              <rect
                x={n.x - NODE_W / 2}
                y={n.y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={12}
                fill={isFocus ? `${accent}22` : "rgba(255,255,255,0.035)"}
                stroke={isFocus ? accent : "rgba(255,255,255,0.14)"}
                strokeWidth={isFocus ? 1.4 : 1}
                style={{ transition: "all 0.35s" }}
              />
              <text x={n.x} y={n.y + (n.meta ? -3 : 4)} textAnchor="middle" fill="#f4f4f7" fontSize="13" fontWeight="500">
                {n.label}
              </text>
              {n.meta && (
                <text x={n.x} y={n.y + 13} textAnchor="middle" fill="#9a9aa8" fontSize="10">
                  {n.meta}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
