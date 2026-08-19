"use client";

import Link from "next/link";
import { experience } from "@/data/experience";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function Experience() {
  return (
    <section id="experience" className="section relative" aria-labelledby="experience-title">
      <div className="container-x">
        <SectionHeading eyebrow="Experience" title="Where the work met the world." />
        <ol className="space-y-6">
          {experience.map((e) => (
            <li key={e.id}>
              <Reveal>
                <article className="glass relative overflow-hidden rounded-3xl p-6 md:p-9">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-70"
                    aria-hidden
                    style={{ background: "radial-gradient(60% 60% at 100% 0%, rgba(94,194,255,0.10), transparent 70%)" }}
                  />
                  <div className="relative flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="display text-2xl md:text-3xl text-fg">{e.role}</h3>
                        {e.current && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-accent">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                            </span>
                            Current
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-base text-fg/85">{e.company}</p>
                      {e.location && <p className="mt-1 text-sm text-dim">{e.location}</p>}
                    </div>
                    <p className="rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted">
                      <time dateTime={e.start}>{e.period}</time>
                    </p>
                  </div>

                  <div
                    className={cn(
                      "relative mt-6 grid gap-6",
                      e.project && "md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]",
                    )}
                  >
                    {e.project && (
                      <div>
                        <p className="eyebrow mb-2">Project</p>
                        {e.projectSlug ? (
                          <Link href={`/projects/${e.projectSlug}`} className="text-lg font-medium text-fg underline-offset-4 hover:underline">
                            {e.project}
                          </Link>
                        ) : (
                          <p className="text-lg font-medium text-fg">{e.project}</p>
                        )}
                      </div>
                    )}
                    <div>
                      <p className="eyebrow mb-3">Work</p>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {e.responsibilities.map((r) => (
                          <li key={r} className="flex items-start gap-2 text-sm text-muted">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                            {r}
                          </li>
                        ))}
                      </ul>
                      {e.stack && (
                        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
                          {e.stack.map((t) => (
                            <li key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.68rem] text-muted">
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
