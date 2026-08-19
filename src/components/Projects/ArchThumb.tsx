import type { ArchEdge, ArchNode } from "@/data/projects";

/**
 * A miniature of the project's own architecture, used as the card artwork.
 *
 * The reference site leads its cards with screenshots. There are none here, and
 * inventing them would be worse than having none — so each card is illustrated
 * by the thing the section is actually about: the system's node graph, drawn
 * small and tinted with the project's accent. It is decorative only; the real,
 * labelled diagram lives in the viewer.
 */
export function ArchThumb({
  nodes,
  edges,
  accent,
  className,
}: {
  nodes: ArchNode[];
  edges: ArchEdge[];
  accent: string;
  className?: string;
}) {
  const tiers = new Map<number, ArchNode[]>();
  nodes.forEach((n) => {
    const arr = tiers.get(n.tier) ?? [];
    arr.push(n);
    tiers.set(n.tier, arr);
  });
  const keys = [...tiers.keys()].sort((a, b) => a - b);
  const widest = Math.max(...[...tiers.values()].map((v) => v.length));

  const STEP_X = 46;
  const STEP_Y = 26;
  const W = Math.max(1, keys.length) * STEP_X;
  const H = Math.max(1, widest) * STEP_Y;

  const pos = new Map<string, { x: number; y: number }>();
  keys.forEach((k, ti) => {
    const row = tiers.get(k)!;
    row.forEach((n, i) => {
      const offset = (widest - row.length) / 2;
      pos.set(n.id, { x: ti * STEP_X + STEP_X / 2, y: (i + offset) * STEP_Y + STEP_Y / 2 });
    });
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      focusable="false"
    >
      {edges.map((e, i) => {
        const a = pos.get(e.from);
        const b = pos.get(e.to);
        if (!a || !b) return null;
        const mx = (a.x + b.x) / 2;
        return (
          <path
            key={i}
            d={`M ${a.x + 9} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x - 9} ${b.y}`}
            fill="none"
            stroke={accent}
            strokeWidth={1}
            opacity={0.5}
          />
        );
      })}
      {[...pos.values()].map((p, i) => (
        <g key={i}>
          <rect
            x={p.x - 9}
            y={p.y - 5}
            width={18}
            height={10}
            rx={3}
            fill={accent}
            opacity={0.16}
          />
          <rect
            x={p.x - 9}
            y={p.y - 5}
            width={18}
            height={10}
            rx={3}
            fill="none"
            stroke={accent}
            strokeWidth={0.9}
            opacity={0.85}
          />
        </g>
      ))}
    </svg>
  );
}
