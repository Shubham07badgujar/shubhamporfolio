"use client";

import dynamic from "next/dynamic";
import { achievements } from "@/data/achievements";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const TrophyObject = dynamic(() => import("@/components/three/TrophyObject").then((m) => m.TrophyObject), {
  ssr: false,
});

/** The digital trophy room — each achievement rendered as a meaningful object. */
export function Achievements() {
  return (
    <section id="achievements" className="section relative" aria-labelledby="achievements-title">
      <div
        className="absolute inset-0"
        aria-hidden
        style={{ background: "radial-gradient(50% 40% at 50% 20%, rgba(111,124,255,0.07), transparent 70%)" }}
      />
      <div className="container-x relative">
        <SectionHeading
          eyebrow="Achievements"
          title="The trophy room."
          description="Five results that mark the turns in the journey. Each object is drawn from what the achievement actually was."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => (
            <li key={a.id} className={i === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-1" : ""}>
              <Reveal delay={i * 0.07}>
                <article
                  className="group glass relative h-full overflow-hidden rounded-3xl p-6 transition-transform duration-500 hover:-translate-y-1"
                  data-cursor
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    aria-hidden
                    style={{ background: `radial-gradient(60% 50% at 50% 0%, ${a.accent}1f, transparent 70%)` }}
                  />
                  <div className="relative mb-4 h-32">
                    <TrophyObject achievement={a} className="absolute inset-0" />
                  </div>
                  <div className="relative">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.accent }} aria-hidden />
                      {a.year && <span className="font-mono text-[0.65rem] text-dim">{a.year}</span>}
                    </div>
                    <h3 className="text-lg font-medium text-fg">{a.title}</h3>
                    <p className="mt-1 text-2xl font-semibold tracking-tight" style={{ color: a.accent }}>
                      {a.result}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{a.description}</p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
