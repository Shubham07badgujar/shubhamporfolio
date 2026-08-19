"use client";

import { useEffect, useRef, useState } from "react";
import { skillCategories } from "@/data/skills";
import { seeded, clamp } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useMotion } from "@/components/providers/MotionProvider";

type Node = {
  id: string;
  label: string;
  cat: string;
  isCat: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  accent: string;
};

/**
 * 2D canvas constellation: category hubs orbited by their skills, linked by
 * animated lines. Canvas keeps it at 60fps even with ~40 nodes; an accessible
 * list of the same data is rendered alongside by the parent section.
 */
export function SkillConstellation({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const { reducedMotion, quality } = useMotion();

  useEffect(() => {
    hoverRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, quality === "high" ? 2 : 1.5);

    const build = () => {
      const rect = cv.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rnd = seeded(42);
      const nodes: Node[] = [];
      const cols = w < 640 ? 2 : 3;
      skillCategories.forEach((c, ci) => {
        const cx = ((ci % cols) + 0.5) * (w / cols);
        const cy = (Math.floor(ci / cols) + 0.5) * (h / Math.ceil(skillCategories.length / cols));
        nodes.push({ id: c.id, label: c.label, cat: c.id, isCat: true, x: cx, y: cy, vx: 0, vy: 0, r: 6, accent: c.accent });
        c.skills.forEach((s, si) => {
          const a = (si / c.skills.length) * Math.PI * 2 + rnd() * 0.5;
          const rad = 46 + rnd() * 34;
          nodes.push({
            id: `${c.id}-${s}`,
            label: s,
            cat: c.id,
            isCat: false,
            x: cx + Math.cos(a) * rad,
            y: cy + Math.sin(a) * rad,
            vx: 0,
            vy: 0,
            r: 2.6,
            accent: c.accent,
          });
        });
      });
      nodesRef.current = nodes;
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(cv);

    const hubOf = (cat: string) => nodesRef.current.find((n) => n.isCat && n.cat === cat)!;

    let t = 0;
    const draw = () => {
      t += 0.016;
      const nodes = nodesRef.current;
      const hover = hoverRef.current;
      ctx.clearRect(0, 0, w, h);

      // physics: skills orbit their hub, repel each other lightly, react to cursor
      nodes.forEach((n) => {
        if (n.isCat) return;
        const hub = hubOf(n.cat);
        const dx = n.x - hub.x;
        const dy = n.y - hub.y;
        const d = Math.hypot(dx, dy) || 1;
        const active = !hover || hover === n.cat;
        const targetR = (active ? 70 : 44) + (hover === n.cat ? 22 : 0);
        const f = (targetR - d) * 0.012;
        n.vx += (dx / d) * f;
        n.vy += (dy / d) * f;
        // slow orbit
        if (!reducedMotion) {
          n.vx += (-dy / d) * 0.05;
          n.vy += (dx / d) * 0.05;
        }
        // cursor repulsion
        const mdx = n.x - mouse.current.x;
        const mdy = n.y - mouse.current.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 90) {
          n.vx += (mdx / (md || 1)) * (1 - md / 90) * 0.9;
          n.vy += (mdy / (md || 1)) * (1 - md / 90) * 0.9;
        }
        n.vx *= 0.9;
        n.vy *= 0.9;
        n.x = clamp(n.x + n.vx, 8, w - 8);
        n.y = clamp(n.y + n.vy, 8, h - 8);
      });

      // links
      nodes.forEach((n) => {
        if (n.isCat) return;
        const hub = hubOf(n.cat);
        const active = !hover || hover === n.cat;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + n.x * 0.05);
        ctx.strokeStyle = n.accent;
        ctx.globalAlpha = active ? (hover === n.cat ? 0.45 + pulse * 0.25 : 0.16) : 0.04;
        ctx.lineWidth = hover === n.cat ? 1.1 : 0.7;
        ctx.beginPath();
        ctx.moveTo(hub.x, hub.y);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      });

      // nodes
      nodes.forEach((n) => {
        const active = !hover || hover === n.cat;
        ctx.globalAlpha = active ? 1 : 0.2;
        if (n.isCat) {
          const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 34);
          glow.addColorStop(0, `${n.accent}55`);
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 34, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = n.accent;
          ctx.beginPath();
          ctx.arc(n.x, n.y, hover === n.cat ? 7 : 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#f4f4f7";
          ctx.font = "600 12px var(--font-geist-sans), system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(n.label, n.x, n.y - 16);
        } else {
          ctx.fillStyle = hover === n.cat ? "#ffffff" : n.accent;
          ctx.beginPath();
          ctx.arc(n.x, n.y, hover === n.cat ? 3.4 : n.r, 0, Math.PI * 2);
          ctx.fill();
          if (hover === n.cat || !hover) {
            ctx.globalAlpha = hover === n.cat ? 0.95 : 0.55;
            ctx.fillStyle = "#c9c9d6";
            ctx.font = "10px var(--font-geist-mono), monospace";
            ctx.textAlign = "center";
            ctx.fillText(n.label, n.x, n.y - 8);
          }
        }
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion, quality]);

  return (
    <div className={cn("relative", className)}>
      <canvas ref={canvas} className="h-full w-full" aria-hidden />
      {/* category controls sit above the canvas so hovering is keyboard-reachable too */}
      <ul className="absolute inset-x-0 -bottom-2 flex flex-wrap justify-center gap-2 md:bottom-3">
        {skillCategories.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(c.id)}
              onBlur={() => setHovered(null)}
              onClick={() => setHovered((h) => (h === c.id ? null : c.id))}
              aria-pressed={hovered === c.id}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-all",
                hovered === c.id ? "text-fg" : "border-line text-muted hover:text-fg",
              )}
              style={hovered === c.id ? { borderColor: c.accent, background: `${c.accent}1a` } : undefined}
            >
              {c.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
