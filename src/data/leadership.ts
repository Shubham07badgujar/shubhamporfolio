export type Leadership = {
  id: string;
  role: string;
  organization: string;
  period?: string;
  /** Duration as stated, e.g. "1 yr 4 mos". */
  duration?: string;
  location?: string;
  employment?: string;
  description: string;
  traits: string[];
};

/** Ordered most recent first. */
export const leadership: Leadership[] = [
  {
    id: "third-axis",
    role: "Software Head",
    organization: "Team Third Axis — Drone Club",
    description:
      "Led the software direction for the college drone team, including the SAE AeroTHON 2024 campaign (AIR 5).",
    traits: ["Technical direction", "Ownership", "Teamwork"],
  },
  {
    id: "ai-club",
    role: "Captain",
    organization: "AI Club",
    period: "2025–2026",
    description: "Captained the AI Club, guiding members through AI/ML learning and projects.",
    traits: ["Leadership", "Communication", "Mentoring"],
  },
  {
    id: "compact-president",
    role: "President",
    organization: "COMPACT",
    period: "2025–26",
    description:
      "Presided over COMPACT, coordinating people, events and technical initiatives.",
    traits: ["Leadership", "Ownership", "Communication"],
  },
  {
    id: "gcoej-media",
    role: "English Content Writer",
    organization: "GCOEJ Media",
    period: "Jul 2024 – Oct 2025",
    duration: "1 yr 4 mos",
    location: "Jalgaon, Maharashtra, India",
    description:
      "Wrote and edited newsletter content for clarity and engagement, produced articles and event reports covering college activities, and worked with the media team on consistency — researching to make the content more informative.",
    traits: ["Communication", "Report Writing"],
  },
  {
    id: "compact-treasurer",
    role: "Vice Treasurer",
    organization: "COMPACT",
    period: "Sep 2024 – Jun 2025",
    duration: "10 mos",
    location: "Jalgaon, Maharashtra, India",
    employment: "Full-time",
    description:
      "Managed financial records, budgeting and fund allocation for departmental events, workshops and technical activities. Helped organize tech fests, seminars and hackathons, coordinated with faculty and student members on sponsorship and financial operations, and improved transparency through documentation and reporting.",
    traits: ["Financial Management", "Analytical Skills"],
  },
];

export const leadershipValues = [
  "Leadership",
  "Teamwork",
  "Communication",
  "Ownership",
  "Technical direction",
];
