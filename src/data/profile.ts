/**
 * Central profile configuration.
 * Replace placeholder links here — every component reads from this file.
 */
export const profile = {
  firstName: "Shubham",
  lastName: "Badgujar",
  fullName: "Shubham Badgujar",
  logo: "SB.",
  roles: ["Computer Engineer", "Software Developer", "AI/ML"],
  headline: "Computer Engineer | Software Developer | AI/ML",
  tagline:
    "Building intelligent systems at the intersection of software, AI and real-world problems.",
  shortTagline: "Build. Learn. Experiment. Ship.",
  heroDescription:
    "I build intelligent, scalable and impactful solutions that bridge technology and real-world problems.",
  location: "Jalgaon, Maharashtra, India",
  college: "Government College of Engineering, Jalgaon",
  degree: "B.Tech Computer Engineering",
  years: "2022–2026",
  cgpa: "8.13",
  identity: [
    "Computer Engineer",
    "Software Developer",
    "AI/ML Engineer / Enthusiast",
    "Data Science enthusiast",
    "Full-stack developer",
  ],
  interests: [
    "Software Development",
    "Backend Development",
    "AI/ML",
    "Data Science",
    "Web Development",
    "Computer Vision",
    "LLM/RAG systems",
    "Intelligent applications",
  ],
  avatarImage: "/images/shubham-profile.webp",
  /**
   * Hero backdrop. "video" plays the rendered loop (regenerate it with
   * `npm run hero:video`); "avatar" falls back to the live WebGL portrait.
   */
  heroBackground: "video" as "video" | "avatar",
  video: {
    mp4: "/video/hero-video.mp4",
    webm: "/video/hero-video.webm",
    poster: "/images/hero-poster.jpg",
    /** Master the loop is rendered from (outside public/ — not shipped). */
    source: "assets/shubham badgujar video.mp4",
  },
  /**
   * The About-section portrait. `image` is shown exactly as supplied — no
   * shader, contour or colour treatment is applied to it.
   *
   * `revealImage` is optional: set it to a second image shot/rendered in the
   * SAME pose and framing (e.g. a plain photograph paired with this anatomical
   * one) and the card cross-reveals between them under a soft cursor-following
   * mask, the way the reference site does. Leave it undefined and the card just
   * does the subtle parallax.
   */
  portrait: {
    /** Shown as supplied — no shader, contour or colour treatment. */
    image: "/images/shubham-portrait.webp",
    /**
     * Optional counterpart in the SAME pose and framing. Set it and the card
     * performs the reference site's exact cross-reveal between the two under a
     * cursor-following mask. Leave it undefined for the single-image variant.
     */
    revealImage: undefined as string | undefined,
    /**
     * Single-image mode only: hold the base back slightly so the cursor has
     * something to restore. Set false to keep the base fully untouched, in
     * which case there is nothing visible to reveal without `revealImage`.
     */
    dimBase: false,
    /** Strength of the hold-back on the base layer in single-image mode. */
    dim: "grayscale(0.45) brightness(0.88)",
  },
  /** Footer masthead. */
  footer: {
    /** Stacked title, second line rendered as an outline. */
    title: { top: "AI/ML", bottom: "Software Developer" },
    /**
     * Status line beside the live dot. Kept factual — change it to
     * "Available for work" or similar when that is true.
     */
    status: "Mumbai, Maharashtra · India",
    stack: "Next.js / React Three Fiber / GSAP",
    /** Oversized wordmark across the base of the footer. */
    wordmark: "SHUBHAM",
  },
  resumeUrl: "/resume/Shubham-Badgujar-Resume.pdf",
  /** Any value left as "[Something]" renders disabled, never as a dead link. */
  social: {
    github: "https://github.com/Shubham07badgujar",
    linkedin: "https://www.linkedin.com/in/shubham-badgujar-05b97425b/",
    email: "shubhambadgujari076@gmail.com",
  },
  intro: {
    lines: [
      "Hey 👋",
      "I'm Shubham Badgujar.",
      "I'm a Computer Engineer who loves building intelligent systems, scalable software and real-world solutions using code, AI and creativity.",
    ],
    followUp: "Scroll down and explore my journey.",
  },
  stats: [
    { value: "4+", label: "Years of Journey" },
    { value: "15+", label: "Projects" },
    { value: "10+", label: "Achievements" },
    { value: "Top 1.5%", label: "Kaggle" },
  ],
} as const;

export type Profile = typeof profile;

/** True when a link is still an unfilled placeholder like "[GitHub Link]". */
export const isPlaceholder = (link: string) => /^\[.*\]$/.test(link);

/** Returns a usable href, or "#" for placeholders so nothing 404s. */
export const hrefOf = (link: string, kind?: "email") => {
  if (isPlaceholder(link)) return "#";
  if (kind === "email" && !link.startsWith("mailto:")) return `mailto:${link}`;
  return link;
};
