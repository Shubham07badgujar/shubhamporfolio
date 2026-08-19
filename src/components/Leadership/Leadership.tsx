"use client";

import { leadership, leadershipValues } from "@/data/leadership";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/** Beyond Code — a command-center panel of leadership roles. */
export function Leadership() {
  // The hairline grid is the container colour showing through a 1px gap, so a
  // part-filled last row leaves a bare slab of it. Pad the row — but the grid is
  // 2 columns at sm and 3 at lg, and those need different amounts, so each
  // filler is shown only at the breakpoints that actually want it.
  const need = (cols: number) => (cols - (leadership.length % cols)) % cols;
  const fillersSm = need(2);
  const fillersLg = need(3);
  const fillers = Array.from({ length: Math.max(fillersSm, fillersLg) }, (_, i) =>
    cn(
      "bg-bg-2/80",
      i < fillersSm ? "hidden sm:block" : "hidden",
      i < fillersLg ? "lg:block" : "lg:hidden",
    ),
  );

  return (
    <section id="leadership" className="section relative" aria-labelledby="leadership-title">
      <div className="container-x">
        <div className="glass relative overflow-hidden rounded-[2rem] p-6 md:p-12">
          <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{ background: "radial-gradient(50% 60% at 80% 0%, rgba(162,107,255,0.10), transparent 70%)" }}
          />
          <div className="relative">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
              <SectionHeading eyebrow="Beyond code" title="Command center." className="!mb-0" />
              <ul className="flex flex-wrap gap-2" aria-label="Values">
                {leadershipValues.map((v) => (
                  <li key={v} className="rounded-full border border-line px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {leadership.map((l, i) => (
                <li key={l.id} className="flex flex-col bg-bg-2/80 p-6">
                  <Reveal delay={i * 0.1}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="font-mono text-[0.65rem] text-dim">UNIT {String(i + 1).padStart(2, "0")}</span>
                      <span className="flex items-center gap-1.5 text-right font-mono text-[0.65rem] text-muted">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
                        {l.period ?? "active"}
                      </span>
                    </div>
                    <h3 className="text-xl font-medium text-fg">{l.role}</h3>
                    <p className="mt-1 text-sm text-accent-2">{l.organization}</p>
                    {(l.duration || l.employment || l.location) && (
                      <p className="mt-1.5 font-mono text-[0.65rem] text-dim">
                        {[l.employment, l.duration, l.location].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="mt-3 text-sm leading-relaxed text-muted">{l.description}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {l.traits.map((t) => (
                        <li key={t} className="rounded-md bg-white/[0.04] px-2 py-1 text-[0.68rem] text-muted">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </li>
              ))}
              {fillers.map((className, i) => (
                <li key={`filler-${i}`} className={className} aria-hidden />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
