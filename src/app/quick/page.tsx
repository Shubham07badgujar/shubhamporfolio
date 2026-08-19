import Link from "next/link";
import type { Metadata } from "next";
import { profile, hrefOf, isPlaceholder } from "@/data/profile";
import { about } from "@/data/about";
import { projects } from "@/data/projects";
import { experience, education } from "@/data/experience";
import { achievements } from "@/data/achievements";
import { skillCategories } from "@/data/skills";
import { leadership } from "@/data/leadership";
import { SocialLinks } from "@/components/ui/SocialLinks";

export const metadata: Metadata = {
  title: "Quick View",
  description: `A fast, scannable summary of ${profile.fullName}'s experience, projects, skills and achievements.`,
};

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line py-10 first:border-t-0">
      <h2 className="eyebrow mb-6">{title}</h2>
      {children}
    </section>
  );
}

const QUICK_NAV = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "achievements", label: "Achievements" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

/** Recruiter mode: everything important, no 3D, one screen of scrolling per topic. */
export default function QuickView() {
  return (
    <main id="main" className="min-h-screen">
      <div className="container-x max-w-4xl py-16 md:py-24">
        {/* header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-mono text-sm text-muted">{profile.logo}</p>
              <h1 className="display mt-2 text-4xl text-fg md:text-6xl">{profile.fullName}</h1>
              <p className="mt-3 text-base text-fg/85">{profile.headline}</p>
              <p className="mt-1 text-sm text-muted">
                {profile.degree} · {profile.college} · {profile.years} · CGPA {profile.cgpa}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <a href={profile.resumeUrl} download className="btn btn-primary !py-2.5 !px-4 text-sm">
                Download Resume
              </a>
              <Link href="/" className="text-xs text-muted transition-colors hover:text-fg">
                ← Full interactive experience
              </Link>
            </div>
          </div>
          <div className="mt-6">
            <SocialLinks showLabels size="sm" className="flex-wrap" />
          </div>
        </header>

        {/* jump nav */}
        <nav aria-label="Quick view sections" className="glass sticky top-4 z-40 mb-8 flex flex-wrap gap-1 rounded-full px-2 py-2">
          {QUICK_NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className="rounded-full px-3 py-1.5 text-xs text-muted transition-colors hover:bg-white/[0.06] hover:text-fg">
              {n.label}
            </a>
          ))}
        </nav>

        <Block id="about" title="About">
          <p className="leading-relaxed text-fg/85">{about.intro}</p>
          <p className="mt-3 leading-relaxed text-muted">{about.work}</p>
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
            {about.highlights.map((h) => (
              <div key={h.label} className="bg-bg-2/80 p-4">
                <dd className="text-lg font-semibold text-fg">{h.value}</dd>
                <dt className="mt-1 text-xs text-muted">{h.label}</dt>
              </div>
            ))}
          </dl>
        </Block>

        <Block id="experience" title="Experience">
          <ul className="space-y-5">
            {experience.map((e) => (
              <li key={e.id} className="rounded-2xl border border-line p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-medium text-fg">
                    {e.role} · <span className="text-fg/80">{e.company}</span>
                    {e.current && (
                      <span className="ml-2 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 align-middle font-mono text-[0.6rem] uppercase tracking-[0.12em] text-accent">
                        Current
                      </span>
                    )}
                  </h3>
                  <p className="font-mono text-xs text-muted">{e.period}</p>
                </div>
                {e.location && <p className="mt-1 text-xs text-dim">{e.location}</p>}
                {e.project && <p className="mt-2 text-sm text-muted">Project: {e.project}</p>}
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {e.responsibilities.map((r) => (
                    <li key={r} className="rounded-md bg-white/[0.04] px-2 py-1 text-xs text-muted">
                      {r}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <h3 className="eyebrow mt-8 mb-4">Leadership</h3>
          <ul className="grid gap-3 sm:grid-cols-3">
            {leadership.map((l) => (
              <li key={l.id} className="rounded-2xl border border-line p-4">
                <p className="text-sm font-medium text-fg">{l.role}</p>
                <p className="mt-1 text-xs text-muted">{l.organization}</p>
                {l.period && <p className="mt-1 font-mono text-[0.65rem] text-dim">{l.period}</p>}
              </li>
            ))}
          </ul>
        </Block>

        <Block id="projects" title="Projects">
          <ul className="space-y-3">
            {projects.map((p) => (
              <li key={p.slug} className="rounded-2xl border border-line p-5 transition-colors hover:bg-white/[0.02]">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <Link href={`/projects/${p.slug}`} className="text-lg font-medium text-fg underline-offset-4 hover:underline">
                    {p.shortTitle}
                  </Link>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-dim">{p.category}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{p.description}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {p.technologies.map((t) => (
                    <li key={t} className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[0.65rem] text-muted">
                      {t}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="skills" title="Skills">
          <dl className="grid gap-4 sm:grid-cols-2">
            {skillCategories.map((c) => (
              <div key={c.id}>
                <dt className="mb-2 flex items-center gap-2 text-sm font-medium text-fg">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.accent }} aria-hidden />
                  {c.label}
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {c.skills.map((s) => (
                    <span key={s} className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[0.68rem] text-muted">
                      {s}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Block>

        <Block id="achievements" title="Achievements">
          <ul className="grid gap-3 sm:grid-cols-2">
            {achievements.map((a) => (
              <li key={a.id} className="flex items-baseline justify-between gap-4 rounded-2xl border border-line p-4">
                <span>
                  <span className="block text-sm font-medium text-fg">{a.title}</span>
                  {a.year && <span className="font-mono text-[0.65rem] text-dim">{a.year}</span>}
                </span>
                <span className="text-sm font-semibold" style={{ color: a.accent }}>
                  {a.result}
                </span>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="education" title="Education">
          <ul className="space-y-2">
            {education.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-3 rounded-2xl border border-line p-4">
                <span>
                  <span className="block text-sm font-medium text-fg">{e.institution}</span>
                  <span className="text-xs text-muted">
                    {e.program}
                    {e.period && ` · ${e.period}`}
                  </span>
                </span>
                <span className="text-sm text-fg">
                  {e.score} <span className="text-xs text-dim">{e.scoreLabel}</span>
                </span>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="contact" title="Contact">
          <p className="text-muted">Have an idea, opportunity, or project worth building?</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={hrefOf(profile.social.email, "email")}
              className="btn btn-primary !py-2.5 !px-4 text-sm"
              aria-label={isPlaceholder(profile.social.email) ? "Email link to be added" : "Email Shubham"}
            >
              Email
            </a>
            <a href={profile.resumeUrl} download className="btn btn-ghost !py-2.5 !px-4 text-sm">
              Resume
            </a>
          </div>
          <div className="mt-6">
            <SocialLinks showLabels size="sm" className="flex-wrap" />
          </div>
        </Block>
      </div>
    </main>
  );
}
