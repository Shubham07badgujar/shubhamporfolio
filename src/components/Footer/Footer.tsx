import Link from "next/link";
import { profile, hrefOf, isPlaceholder } from "@/data/profile";
import { navItems } from "@/data/navigation";

/**
 * Footer built as a masthead rather than a link dump: a numbered three-column
 * index, an oversized wordmark, corner registration marks and a faint grid —
 * the same structure as the reference, rendered in this site's own palette
 * (near-black, blue→violet accent) instead of its cyan.
 *
 * It sits on a higher layer than the sticky Contact panel above it and carries
 * an opaque background, so scrolling slides it up over that pinned panel.
 */

const YEAR = 2026;

/** 01 / ABOUT — the small numbered header above each column. */
function ColHead({ n, label }: { n: string; label: string }) {
  return (
    <p className="mb-6 font-mono text-[0.62rem] uppercase tracking-[0.25em] text-dim">
      <span className="text-muted">{n}</span> / {label}
    </p>
  );
}

function Corner({ className }: { className: string }) {
  return <span className={`pointer-events-none absolute h-7 w-7 ${className}`} aria-hidden />;
}

export function Footer() {
  const { footer, social } = profile;
  const connect = [
    { label: "GitHub", href: hrefOf(social.github), placeholder: isPlaceholder(social.github) },
    { label: "LinkedIn", href: hrefOf(social.linkedin), placeholder: isPlaceholder(social.linkedin) },
    { label: "Email", href: hrefOf(social.email, "email"), placeholder: isPlaceholder(social.email) },
  ];

  return (
    <footer className="relative z-10 overflow-hidden border-t border-line bg-bg">
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-50" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-[min(460px,70vw)] w-[min(460px,90vw)] -translate-x-1/2 rounded-full blur-[120px]"
        aria-hidden
        style={{ background: "rgba(111,124,255,0.05)" }}
      />

      {/* registration marks */}
      <Corner className="left-5 top-5 border-l border-t border-white/25 md:left-8 md:top-8" />
      <Corner className="right-5 top-5 border-r border-t border-white/25 md:right-8 md:top-8" />
      <Corner className="bottom-5 left-5 border-b border-l border-white/15 md:bottom-8 md:left-8" />
      <Corner className="bottom-5 right-5 border-b border-r border-white/15 md:bottom-8 md:right-8" />

      <div className="container-x relative z-10 pb-10 pt-16 md:pt-20">
        {/* masthead */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3" aria-label={`${profile.fullName} — home`}>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-line-strong font-mono text-[0.6rem] font-bold text-fg transition-all duration-300 group-hover:rotate-12 group-hover:border-accent group-hover:text-accent">
              SB
            </span>
            <span className="text-sm font-semibold text-fg">{profile.fullName}</span>
          </Link>
          <p className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
            </span>
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted">
              {footer.status}
            </span>
          </p>
        </div>

        {/* three-column index */}
        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-10">
          <div>
            <ColHead n="01" label="About" />
            <p className="display text-[clamp(2.2rem,5vw,3.4rem)] leading-[0.95] text-fg">
              {footer.title.top}
            </p>
            <p
              className="display text-[clamp(2.2rem,5vw,3.4rem)] leading-[0.95] text-transparent"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.22)" }}
            >
              {footer.title.bottom}
            </p>
            <p className="mt-5 max-w-xs font-mono text-xs leading-relaxed text-muted">
              {profile.tagline}
            </p>
          </div>

          <nav aria-label="Footer">
            <ColHead n="02" label="Navigate" />
            {/* two columns so nine links read as a short index, not a list */}
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
              {navItems.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/${n.href}`}
                    className="group inline-flex items-center gap-2 text-lg text-muted transition-colors hover:text-fg"
                  >
                    {n.label}
                    <span className="translate-y-px text-xs opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-60" aria-hidden>
                      ↗
                    </span>
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={profile.resumeUrl}
                  download
                  className="group inline-flex items-center gap-2 text-lg text-muted transition-colors hover:text-fg"
                >
                  Resume
                  <span className="translate-y-px text-xs opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-60" aria-hidden>
                    ↓
                  </span>
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <ColHead n="03" label="Connect" />
            <ul className="flex flex-wrap gap-3">
              {connect.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.placeholder ? undefined : "_blank"}
                    rel="noreferrer"
                    aria-disabled={c.placeholder}
                    title={c.placeholder ? `${c.label} — link to be added` : c.label}
                    className={`group inline-flex items-center gap-2.5 rounded-full border border-line-strong px-4 py-2.5 text-sm transition-all duration-300 hover:border-white/30 hover:bg-white/[0.04] ${
                      c.placeholder ? "text-dim" : "text-muted hover:text-fg"
                    }`}
                  >
                    {c.label}
                    <span className="text-[0.7rem] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden>
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* wordmark */}
        <div className="group mt-16 select-none md:mt-24" aria-hidden>
          <p
            className="relative inline-block origin-left leading-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
          >
            {/* two stacked fills cross-fade, because background-image itself
                cannot be transitioned — this is what makes the colour shift
                smooth rather than a snap */}
            <span
              className="display block text-[clamp(4rem,18vw,13rem)] tracking-[-0.04em] text-transparent transition-opacity duration-500 group-hover:opacity-0"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(111,124,255,0.10) 60%, transparent)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              {footer.wordmark}
            </span>
            <span
              className="display absolute inset-0 block text-[clamp(4rem,18vw,13rem)] tracking-[-0.04em] text-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 55%, rgba(162,107,255,0.25) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              {footer.wordmark}
            </span>
          </p>
        </div>

        {/* base bar */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-line pt-6 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-dim">
          <p>
            © {YEAR} {profile.fullName}
          </p>
          <p className="hidden sm:block">{footer.stack}</p>
          <div className="flex items-center gap-6">
            <Link href="/quick" className="transition-colors hover:text-fg">
              Quick View ↗
            </Link>
            <a href="#home" className="transition-colors hover:text-fg">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
