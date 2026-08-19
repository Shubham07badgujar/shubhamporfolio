import { profile, hrefOf, isPlaceholder } from "@/data/profile";
import { cn } from "@/lib/utils";

const icons = {
  github: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  resume: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6M8 13h8M8 17h5" />
    </svg>
  ),
};

type Props = { className?: string; size?: "sm" | "md"; showLabels?: boolean };

export function SocialLinks({ className, size = "md", showLabels = false }: Props) {
  const items = [
    { key: "github", label: "GitHub", href: hrefOf(profile.social.github), placeholder: isPlaceholder(profile.social.github) },
    { key: "linkedin", label: "LinkedIn", href: hrefOf(profile.social.linkedin), placeholder: isPlaceholder(profile.social.linkedin) },
    { key: "email", label: "Email", href: hrefOf(profile.social.email, "email"), placeholder: isPlaceholder(profile.social.email) },
    { key: "resume", label: "Resume", href: profile.resumeUrl, placeholder: false },
  ] as const;

  return (
    <ul className={cn("flex items-center gap-2", className)} aria-label="Social links">
      {items.map((it) => (
        <li key={it.key}>
          <a
            href={it.href}
            target={it.key === "resume" || it.placeholder ? undefined : "_blank"}
            rel="noreferrer"
            download={it.key === "resume" ? true : undefined}
            aria-label={it.placeholder ? `${it.label} (link coming soon)` : it.label}
            title={it.placeholder ? `${it.label} — link to be added` : it.label}
            className={cn(
              "group inline-flex items-center gap-2 rounded-full border border-line text-muted transition-all hover:text-fg hover:border-white/30 hover:bg-white/[0.04]",
              size === "md" ? "h-11 px-3.5" : "h-9 px-3",
              showLabels ? "" : "justify-center",
              !showLabels && (size === "md" ? "w-11" : "w-9"),
              !showLabels && "!px-0",
            )}
          >
            {icons[it.key]}
            {showLabels && <span className="text-sm">{it.label}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
