"use client";

import dynamic from "next/dynamic";
import { skillCategories } from "@/data/skills";
import { SectionHeading } from "@/components/ui/SectionHeading";

const SkillConstellation = dynamic(() => import("./SkillConstellation").then((m) => m.SkillConstellation), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-3xl bg-white/[0.02]" />,
});

export function Skills() {
  return (
    <section id="skills" className="section relative" aria-labelledby="skills-title">
      <div className="container-x">
        <SectionHeading
          eyebrow="Skills"
          title="A constellation, not a checklist."
          description="Hover or focus a category to light up what connects to it."
        />

        <div className="glass relative overflow-hidden rounded-[2rem]">
          <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
          <SkillConstellation className="relative h-[30rem] w-full md:h-[34rem]" />
        </div>

        {/*
          The constellation is an aria-hidden canvas, so this list is the only
          thing that exposes the individual skills to assistive technology. It is
          visually hidden rather than deleted — it would otherwise duplicate the
          constellation on screen — and <noscript> restores it visually for the
          case where the canvas cannot render at all.
        */}
        <noscript>
          <style>{`.skills-index{position:static!important;width:auto!important;height:auto!important;margin-top:2.5rem!important;overflow:visible!important;clip:auto!important;clip-path:none!important;white-space:normal!important;}`}</style>
        </noscript>
        <ul
          className="skills-index sr-only grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Skills by category"
        >
          {skillCategories.map((c) => (
            <li key={c.id} className="bg-bg-2/80 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-fg">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.accent }} aria-hidden />
                {c.label}
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {c.skills.map((sk) => (
                  <li key={sk} className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[0.68rem] text-muted">
                    {sk}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
