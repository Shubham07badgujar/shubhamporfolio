"use client";

import Link from "next/link";
import type { Project } from "@/data/projects";
import { isPlaceholder } from "@/data/profile";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { PipelinePlayer } from "./PipelinePlayer";
import { Reveal, SplitWords } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const tokenFor = (slug: string) =>
  slug === "arxiv-assistant" ? "query" : slug === "food-donation-system" ? "record" : slug === "drone-vision" ? "frame" : "data";

export function ProjectCaseStudy({ project, next }: { project: Project; next?: Project }) {
  const usePipeline = project.visual === "pipeline";

  return (
    <article className="relative">
      {/* hero */}
      <header className="relative overflow-hidden border-b border-line pb-16 pt-36 md:pb-24 md:pt-44">
        <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
        <div
          className="absolute inset-0"
          aria-hidden
          style={{ background: `radial-gradient(55% 50% at 30% 20%, ${project.accent}1f, transparent 70%)` }}
        />
        <div className="container-x relative">
          <Link href="/#projects" className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg">
            <span aria-hidden>←</span> All work
          </Link>
          <p className="eyebrow mb-4" style={{ color: project.accent }}>
            {project.category}
          </p>
          <h1 className="display max-w-4xl text-[clamp(2.4rem,7vw,5rem)] text-fg">
            <SplitWords text={project.shortTitle} />
          </h1>
          {project.subtitle && (
            <p className="mt-4 font-mono text-sm text-dim">{project.subtitle}</p>
          )}
          <p className="mt-6 max-w-2xl text-lg text-muted">{project.tagline}</p>
          {project.impact && (
            <p
              className="mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm"
              style={{ borderColor: `${project.accent}55`, color: project.accent, background: `${project.accent}12` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.accent }} aria-hidden />
              {project.impact}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {project.links.map((l) => {
              const placeholder = isPlaceholder(l.url);
              return (
                <a
                  key={l.label}
                  href={placeholder ? "#" : l.url}
                  target={placeholder ? undefined : "_blank"}
                  rel="noreferrer"
                  aria-disabled={placeholder}
                  title={placeholder ? `${l.label} — link to be added` : l.label}
                  className={cn("btn !py-2.5 !px-4 text-sm", placeholder ? "btn-ghost opacity-60" : "btn-ghost")}
                >
                  {l.label}
                  {placeholder && <span className="font-mono text-[0.62rem] text-dim">soon</span>}
                </a>
              );
            })}
          </div>
        </div>
      </header>

      <div className="container-x grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20 lg:py-24">
        {/* narrative */}
        <div className="space-y-10">
          <Reveal>
            <h2 className="eyebrow mb-3">Overview</h2>
            <p className="leading-relaxed text-fg/85">{project.description}</p>
          </Reveal>
          <Reveal>
            <h2 className="eyebrow mb-3">Problem</h2>
            <p className="leading-relaxed text-muted">{project.problem}</p>
          </Reveal>
          <Reveal>
            <h2 className="eyebrow mb-3">Solution</h2>
            <p className="leading-relaxed text-muted">{project.solution}</p>
          </Reveal>
          <Reveal>
            <h2 className="eyebrow mb-3">Outcome</h2>
            <p className="leading-relaxed text-fg/85">{project.outcome}</p>
          </Reveal>
          {project.decisions && (
            <Reveal>
              <h2 className="eyebrow mb-3">Engineering decisions</h2>
              <ul className="grid gap-2.5">
                {project.decisions.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 leading-relaxed text-muted">
                    <span className="mt-[0.45rem] font-mono text-[0.65rem] text-dim" aria-hidden>&#8250;</span>
                    {d}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          <Reveal>
            <h2 className="eyebrow mb-3">Core technologies</h2>
            <ul className="flex flex-wrap gap-1.5">
              {project.technologies.map((t) => (
                <li key={t} className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* interactive column */}
        <div className="space-y-8">
          <Reveal>
            <div className="glass rounded-3xl p-5 md:p-7">
              <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-dim">
                {usePipeline ? "Interactive pipeline" : "Architecture"}
              </p>
              {usePipeline ? (
                <PipelinePlayer nodes={project.architecture.nodes} edges={project.architecture.edges} accent={project.accent} token={tokenFor(project.slug)} />
              ) : (
                <ArchitectureDiagram nodes={project.architecture.nodes} edges={project.architecture.edges} accent={project.accent} />
              )}
              <p className="mt-4 text-xs text-dim">
                {usePipeline ? "Play, pause, or select a stage." : "Select a node to isolate its connections."}
              </p>
            </div>
          </Reveal>

          {project.dataFlow && (
            <Reveal>
              <div className="glass rounded-3xl p-5 md:p-7">
                <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-dim">Data flow</p>
                <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                  {project.dataFlow.map((step, i) => (
                    <li key={step} className="flex items-center gap-1.5">
                      <span className="rounded-md border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-[0.72rem] text-fg/85">
                        {step}
                      </span>
                      {i < project.dataFlow!.length - 1 && (
                        <span className="font-mono text-xs" style={{ color: project.accent }} aria-hidden>
                          &#8594;
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          )}

          {project.services && (
            <Reveal>
              <div className="glass rounded-3xl p-5 md:p-7">
                <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-dim">APIs &amp; services</p>
                <ul className="grid gap-2">
                  {project.services.map((sv) => (
                    <li key={sv} className="flex items-start gap-2 text-sm text-fg/85">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: project.accent }} aria-hidden />
                      {sv}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          <Reveal>
            <div className="glass rounded-3xl p-5 md:p-7">
              <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-dim">Key features</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {project.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-fg/85">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: project.accent }} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>

      {next && (
        <div className="border-t border-line">
          <Link href={`/projects/${next.slug}`} className="group container-x flex items-center justify-between gap-6 py-10 transition-colors hover:bg-white/[0.02]">
            <span>
              <span className="eyebrow block">Next project</span>
              <span className="display mt-2 block text-2xl text-fg md:text-4xl">{next.shortTitle}</span>
            </span>
            <span className="text-2xl text-muted transition-transform duration-500 group-hover:translate-x-2" aria-hidden>
              →
            </span>
          </Link>
        </div>
      )}
    </article>
  );
}
