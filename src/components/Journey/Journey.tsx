"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { journey, journeyOutro, type JourneyYear } from "@/data/journey";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { useMotion } from "@/components/providers/MotionProvider";
import { cn } from "@/lib/utils";

const TimelineScene = dynamic(() => import("@/components/three/TimelineScene").then((m) => m.TimelineScene), {
  ssr: false,
});

const N = journey.length;

function HighlightIcon({ kind }: { kind?: string }) {
  const common = "h-3.5 w-3.5";
  switch (kind) {
    case "award":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="9" r="5" />
          <path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7" />
        </svg>
      );
    case "role":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 3 2 8l10 5 10-5-10-5zM2 13l10 5 10-5" />
        </svg>
      );
    case "internship":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case "project":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 4h16v16H4zM4 10h16M10 4v16" />
        </svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m5 12 5 5L20 7" />
        </svg>
      );
  }
}

function YearPanel({ y, index, compact }: { y: JourneyYear; index: number; compact?: boolean }) {
  return (
    <div className={cn("max-w-xl", compact && "max-w-none")}>
      <p className="mb-2 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em]" style={{ color: y.accent }}>
        <span className="inline-block h-px w-6" style={{ background: y.accent }} aria-hidden />
        {String(index + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} · {y.subtitle}
      </p>
      <p className="display text-[clamp(3.5rem,9vw,7rem)] leading-none text-fg/95">{y.year}</p>
      <h3 className="display mt-2 text-2xl md:text-4xl text-fg">{y.title}</h3>
      <p className="mt-4 text-muted leading-relaxed">{y.summary}</p>
      <ul className="mt-5 flex flex-wrap gap-2" aria-label="Focus">
        {y.focus.map((f) => (
          <li key={f} className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-xs text-fg/85">
            {f}
          </li>
        ))}
      </ul>
      {y.highlights && (
        <ul className="mt-5 grid gap-2 sm:grid-cols-2" aria-label="Highlights">
          {y.highlights.map((h) => (
            <li key={h.label} className="glass flex items-start gap-3 rounded-xl px-3.5 py-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: `${y.accent}22`, color: y.accent }}>
                <HighlightIcon kind={h.kind} />
              </span>
              <span>
                <span className="block text-sm font-medium text-fg">{h.label}</span>
                {h.detail && <span className="block text-xs text-muted">{h.detail}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Journey() {
  const wrap = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(0);
  const [droneInfo, setDroneInfo] = useState(false);
  const { reducedMotion, isMobile } = useMotion();

  const perYear = isMobile ? 90 : 110; // vh of scroll per year
  const totalVh = perYear * N + 40;

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    let lastIdx = -1;
    const loop = () => {
      const el = wrap.current;
      if (el) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = r.height - vh;
        const p = Math.min(1, Math.max(0, -r.top / total));
        progress.current = p;
        const idx = Math.min(N - 1, Math.floor(p * N + 0.0001));
        if (idx !== lastIdx) {
          lastIdx = idx;
          setActive(idx);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const y = journey[active];

  return (
    <section id="journey" aria-labelledby="journey-title" className="relative">
      <div className="container-x pt-24 md:pt-32">
        <SectionHeading
          eyebrow="My Journey · 2022 → 2026"
          title="Four years, five chapters, one path."
          description="Scroll to travel the path. Each year is a node in the story — from the first line of C to intelligent systems in production."
        />
      </div>

      {reducedMotion ? (
        /* Accessible, static version */
        <ol className="container-x grid gap-10 pb-24">
          {journey.map((yy, i) => (
            <li key={yy.year} className="glass rounded-3xl p-6 md:p-10">
              <YearPanel y={yy} index={i} compact />
            </li>
          ))}
        </ol>
      ) : (
        <div ref={wrap} className="relative" style={{ height: `${totalVh}vh` }}>
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            {/* environment tint */}
            <div
              className="absolute inset-0 transition-[background] duration-1000"
              aria-hidden
              style={{ background: `radial-gradient(60% 60% at 60% 50%, ${y.accent}14, transparent 70%)` }}
            />
            <TimelineScene progress={progress} onDroneSelect={() => setDroneInfo(true)} className="absolute inset-0" />
            {/* fallback hint for no-WebGL: gradient path line */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg to-transparent" aria-hidden />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" aria-hidden />

            {/* content overlay */}
            <div className="container-x relative flex h-full items-end pb-16 md:items-center md:pb-0">
              <div className="w-full md:w-[52%]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={y.year}
                    initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-3xl bg-bg/40 p-1 backdrop-blur-[2px] md:bg-transparent md:p-0 md:backdrop-blur-none"
                  >
                    <YearPanel y={y} index={active} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* year rail */}
            <ol className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-5 md:right-10 md:flex" aria-label="Years">
              {journey.map((yy, i) => (
                <li key={yy.year} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "font-mono text-xs transition-all duration-500",
                      i === active ? "text-fg" : "text-dim",
                    )}
                  >
                    {yy.year}
                  </span>
                  <span
                    className="h-2 w-2 rounded-full transition-all duration-500"
                    style={{
                      background: i <= active ? yy.accent : "rgba(255,255,255,0.15)",
                      boxShadow: i === active ? `0 0 16px ${yy.accent}` : "none",
                      transform: i === active ? "scale(1.4)" : "scale(1)",
                    }}
                    aria-hidden
                  />
                </li>
              ))}
            </ol>

            {/* progress bar (mobile) */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-white/5 md:hidden" aria-hidden>
              <div className="h-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-300" style={{ width: `${((active + 1) / N) * 100}%` }} />
            </div>

            {/* drone hint / info */}
            {active === 2 && !droneInfo && (
              <button
                type="button"
                onClick={() => setDroneInfo(true)}
                className="absolute right-6 top-24 hidden items-center gap-2 rounded-full glass px-3.5 py-2 text-xs text-muted hover:text-fg md:right-24 md:top-28 md:flex"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8b6cff]" aria-hidden />
                Click the drone
              </button>
            )}
            <AnimatePresence>
              {droneInfo && (
                <motion.div
                  role="dialog"
                  aria-label="Drone achievements"
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="glass-strong absolute right-5 top-24 z-20 w-[min(92vw,20rem)] rounded-2xl p-5 md:right-24 md:top-28"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <p className="eyebrow !text-[0.62rem]">Team Third Axis · Drone Club</p>
                    <button type="button" onClick={() => setDroneInfo(false)} className="text-muted hover:text-fg" aria-label="Close">
                      ✕
                    </button>
                  </div>
                  <p className="text-sm font-medium text-fg">Software Head</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex justify-between gap-4 border-t border-line pt-2">
                      <span className="text-muted">SAE AeroTHON 2024</span>
                      <span className="font-medium text-fg">AIR 5</span>
                    </li>
                    <li className="flex justify-between gap-4 border-t border-line pt-2">
                      <span className="text-muted">CodeSphere Hackathon</span>
                      <span className="font-medium text-fg">1st Runner-up</span>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* outro */}
      <div className="container-x relative pb-24 pt-10 text-center md:pb-32">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
          {journeyOutro.map((line, i) => (
            <Reveal key={line} delay={i * 0.15} y={16}>
              <p
                className={cn(
                  "display",
                  i === 0 && "font-mono text-sm tracking-[0.3em] text-muted",
                  i === 1 && "text-3xl md:text-5xl text-fg",
                  i === 2 && "text-gradient text-2xl md:text-4xl",
                )}
              >
                {line}
              </p>
              {i < journeyOutro.length - 1 && (
                <span className="mx-auto mt-3 block h-8 w-px bg-gradient-to-b from-accent/70 to-transparent" aria-hidden />
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
