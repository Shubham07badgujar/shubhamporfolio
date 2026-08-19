import Link from "next/link";
import type { Metadata } from "next";
import { projects } from "@/data/projects";
import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import { SplitWords, Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Projects",
  description: "Systems, applications and research tools built by Shubham Badgujar.",
};

export default function ProjectsIndex() {
  return (
    <>
      <Navbar />
      <main id="main">
        <header className="relative overflow-hidden border-b border-line pb-14 pt-36 md:pt-44">
          <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
          <div className="container-x relative">
            <p className="eyebrow mb-4">Selected work</p>
            <h1 className="display text-[clamp(2.6rem,8vw,5.5rem)] text-fg">
              <SplitWords text="The digital lab." />
            </h1>
            <p className="mt-5 max-w-xl text-muted">
              Every project here is a working system — with a problem behind it and an architecture holding it up.
            </p>
          </div>
        </header>

        <ul className="container-x divide-y divide-[color:var(--line)] py-6">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <Reveal delay={i * 0.05}>
                <Link href={`/projects/${p.slug}`} className="group flex flex-wrap items-center gap-6 py-8 transition-colors md:py-10">
                  <span className="font-mono text-xs text-dim">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-[14rem] flex-1">
                    <span className="display block text-2xl text-fg transition-colors md:text-4xl group-hover:text-gradient">
                      {p.shortTitle}
                    </span>
                    <span className="mt-2 block max-w-xl text-sm text-muted">{p.tagline}</span>
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {p.technologies.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.65rem] text-muted">
                        {t}
                      </span>
                    ))}
                  </span>
                  <span
                    className="grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition-all duration-500 group-hover:border-white/30 group-hover:text-fg"
                    style={{ boxShadow: `0 0 0 0 ${p.accent}` }}
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
