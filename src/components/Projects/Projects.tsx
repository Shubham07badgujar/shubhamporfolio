"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { projects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { ArchThumb } from "./ArchThumb";
import { cn } from "@/lib/utils";


/** Labelled technical block, matching the architecture panel treatment. */
function TechPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-2xl border border-line bg-bg/50 p-4">
      <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-dim">{label}</p>
      {children}
    </div>
  );
}

/** Horizontal step chain; wraps rather than scrolling so it survives mobile. */
function FlowChain({ steps, accent }: { steps: string[]; accent: string }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-1.5">
          <span className="rounded-md border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-[0.7rem] text-fg/85">
            {s}
          </span>
          {i < steps.length - 1 && (
            <span className="font-mono text-xs" style={{ color: accent }} aria-hidden>
              &#8594;
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * The Digital Lab: projects are stations you inspect. Selecting one brings its
 * live architecture into the viewer beside the list.
 */
export function Projects() {
  const [active, setActive] = useState(0);
  const p = projects[active];

  return (
    <section id="projects" className="section relative" aria-labelledby="projects-title">
      <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Selected work"
          title="Systems I've engineered."
          description="Each project is a production-oriented system built around a real problem, with a defined architecture, data flow, APIs and engineering decisions. Select a system to inspect its architecture."
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
          {/* station list */}
          <ul className="flex flex-col gap-3" role="tablist" aria-label="Projects">
            {projects.map((proj, i) => {
              const isActive = i === active;
              return (
                <li key={proj.slug}>
                  <Reveal delay={Math.min(i, 5) * 0.05} y={18} amount={0.2}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="project-viewer"
                      onClick={() => setActive(i)}
                      className={cn(
                        "group relative h-[148px] w-full overflow-hidden rounded-2xl border text-left",
                        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        "hover:-translate-y-1 focus-visible:-translate-y-1",
                        isActive
                          ? "border-white/25 bg-white/[0.05] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]"
                          : "border-line bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.035] hover:shadow-[0_26px_64px_-28px_rgba(0,0,0,0.85)]",
                      )}
                    >
                      {/* artwork: the system's own graph */}
                      <span
                        className="pointer-events-none absolute inset-y-0 right-0 w-[62%] transition-transform duration-700 group-hover:scale-105"
                        aria-hidden
                      >
                        <ArchThumb
                          nodes={proj.architecture.nodes}
                          edges={proj.architecture.edges}
                          accent={proj.accent}
                          className={cn(
                            "h-full w-full transition-opacity duration-500",
                            isActive ? "opacity-60" : "opacity-30 group-hover:opacity-45",
                          )}
                        />
                      </span>

                      {/* accent wash + scrim so the copy stays legible over it */}
                      <span
                        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
                        aria-hidden
                        style={{
                          background: `radial-gradient(120% 90% at 100% 50%, ${proj.accent}22, transparent 62%)`,
                          opacity: isActive ? 1 : 0.55,
                        }}
                      />
                      <span
                        className="pointer-events-none absolute inset-0"
                        aria-hidden
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.85) 42%, rgba(5,5,5,0.25) 78%, rgba(5,5,5,0.05) 100%)",
                        }}
                      />

                      {/* index */}
                      <span className="absolute left-4 top-4 grid h-7 w-7 place-items-center rounded-full border border-line-strong bg-black/40 font-mono text-[0.6rem] text-muted backdrop-blur-md">
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      {/* open affordance */}
                      <span
                        className={cn(
                          "absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full border border-line-strong bg-black/30 text-muted backdrop-blur-md",
                          "transition-all duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-black",
                        )}
                        aria-hidden
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M7 7h10v10" />
                          <path d="M7 17 17 7" />
                        </svg>
                      </span>

                      {/* copy */}
                      <span className="absolute inset-x-4 bottom-4 block">
                        <span
                          className="block truncate text-[0.62rem] uppercase tracking-[0.2em] transition-colors duration-300"
                          style={{ color: isActive ? proj.accent : undefined }}
                        >
                          <span className={isActive ? "" : "text-dim"}>{proj.category}</span>
                        </span>
                        <span className="mt-1 block truncate text-lg font-medium tracking-tight text-fg">
                          {proj.shortTitle}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted">{proj.tagline}</span>
                      </span>

                      {/* selection bar */}
                      <span
                        className="absolute bottom-0 left-0 h-[2px] w-full origin-left transition-transform duration-500"
                        aria-hidden
                        style={{
                          background: `linear-gradient(90deg, ${proj.accent}, transparent)`,
                          transform: `scaleX(${isActive ? 1 : 0})`,
                        }}
                      />
                    </button>
                  </Reveal>
                </li>
              );
            })}
          </ul>

          {/* viewer */}
          <div id="project-viewer" role="tabpanel" className="relative">
            <div className="glass sticky top-24 overflow-hidden rounded-3xl">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                aria-hidden
                style={{ background: `radial-gradient(70% 50% at 50% 0%, ${p.accent}18, transparent 70%)` }}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative p-6 md:p-8"
                >
                  <p className="eyebrow mb-3">{p.category}</p>
                  <h3 className="display text-2xl md:text-3xl text-fg">{p.title}</h3>
                  {p.subtitle && <p className="mt-2 font-mono text-xs text-dim">{p.subtitle}</p>}
                  <p className="mt-3 text-sm leading-relaxed text-muted">{p.description}</p>

                  <TechPanel label="Problem">
                    <p className="text-sm leading-relaxed text-muted">{p.problem}</p>
                  </TechPanel>

                  <div className="my-6 rounded-2xl border border-line bg-bg/50 p-4">
                    <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-dim">Architecture</p>
                    <ArchitectureDiagram
                      nodes={p.architecture.nodes}
                      edges={p.architecture.edges}
                      accent={p.accent}
                      orientation={p.visual === "pipeline" ? "vertical" : "vertical"}
                    />
                  </div>

                  {p.dataFlow && (
                    <TechPanel label="Data flow">
                      <FlowChain steps={p.dataFlow} accent={p.accent} />
                    </TechPanel>
                  )}

                  {p.services && (
                    <TechPanel label="APIs & services">
                      <ul className="grid gap-1.5">
                        {p.services.map((sv) => (
                          <li key={sv} className="flex items-start gap-2 text-sm text-fg/85">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: p.accent }} aria-hidden />
                            {sv}
                          </li>
                        ))}
                      </ul>
                    </TechPanel>
                  )}

                  {p.decisions && (
                    <TechPanel label="Engineering decisions">
                      <ul className="grid gap-2">
                        {p.decisions.map((d) => (
                          <li key={d} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                            <span className="mt-[0.35rem] font-mono text-[0.6rem] text-dim" aria-hidden>&#8250;</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </TechPanel>
                  )}

                  {p.impact && (
                    <p
                      className="mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs"
                      style={{ borderColor: `${p.accent}55`, color: p.accent, background: `${p.accent}12` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} aria-hidden />
                      {p.impact}
                    </p>
                  )}

                  <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-dim">Core technologies</p>
                  <ul className="mb-6 flex flex-wrap gap-1.5" aria-label="Technologies">
                    {p.technologies.map((t) => (
                      <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.68rem] text-muted">
                        {t}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/projects/${p.slug}`}
                    className="btn btn-ghost !py-2.5 !px-4 text-sm"
                    aria-label={`Read the ${p.shortTitle} case study`}
                  >
                    Read case study
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Reveal className="mt-10">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
            View all projects
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
