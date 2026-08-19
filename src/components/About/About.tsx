"use client";

import type { ReactNode } from "react";
import { about } from "@/data/about";
import { education } from "@/data/experience";
import { Reveal } from "@/components/ui/Reveal";
import { SplitWords } from "@/components/ui/Reveal";
import { PortraitCard } from "./PortraitCard";

/**
 * About: portrait on the left, a short greeting and three focus areas on the
 * right. The longer narrative — the journey and process chains, the highlight
 * stats — is not lost, it lives in Quick View, which is the layer meant for
 * readers who want the detail. The section reads in about five seconds.
 */

const ICONS: Record<string, ReactNode> = {
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="m8 6-6 6 6 6M16 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="m7 7 2.6 2.9M17 7l-2.6 2.9M7 17l2.6-2.9M17 17l-2.6-2.9" strokeLinecap="round" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </svg>
  ),
};

export function About() {
  return (
    <section id="about" className="section container-x" aria-labelledby="about-title">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        {/* portrait */}
        <div className="relative">
          <PortraitCard className="mx-auto lg:mx-0" />
        </div>

        {/* lead */}
        <div>
          <Reveal y={12}>
            <p className="eyebrow mb-5 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-gradient-to-r from-accent to-accent-2" aria-hidden />
              About me
            </p>
          </Reveal>

          <h2 id="about-title" className="display text-5xl text-fg sm:text-6xl md:text-7xl">
            <SplitWords text={about.greeting} />
          </h2>

          <Reveal delay={0.15}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {about.lead.before}
              <span className="font-semibold text-fg">{about.lead.name}</span>
              {about.lead.after}
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-6" aria-label="Focus areas">
              {about.focus.map((f) => (
                <li key={f.id} className="flex flex-col items-center gap-3 text-center">
                  <span className="glass grid h-16 w-16 place-items-center rounded-full text-accent [&>svg]:h-7 [&>svg]:w-7">
                    {ICONS[f.id]}
                  </span>
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted">
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/*
            Education lives here rather than as its own section — three rows of
            dates and scores did not warrant a full-width band of the page.
            Quick View still carries it in full for anyone scanning credentials.
          */}
          <Reveal delay={0.3}>
            <div className="mt-10 border-t border-line pt-6">
              <p className="eyebrow mb-4">Education</p>
              <ul className="space-y-3">
                {education.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                    <span className="min-w-[12rem] flex-1">
                      <span className="block text-sm text-fg/90">{e.institution}</span>
                      <span className="block text-xs text-dim">
                        {e.program}
                        {e.period && ` · ${e.period}`}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-muted">
                      {e.score}
                      <span className="ml-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-dim">
                        {e.scoreLabel}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
