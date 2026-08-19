export type Achievement = {
  id: string;
  title: string;
  result: string;
  year?: string;
  description: string;
  /** Meaningful 3D representation for the trophy room. */
  shape: "drone" | "podium" | "seed" | "grid" | "summit";
  accent: string;
};

export const achievements: Achievement[] = [
  {
    id: "aerothon",
    title: "SAE AeroTHON 2024",
    result: "AIR 5",
    year: "2024",
    description:
      "All-India Rank 5 with Team Third Axis (Drone Club), where I served as Software Head.",
    shape: "drone",
    accent: "#8b6cff",
  },
  {
    id: "codesphere",
    title: "CodeSphere Hackathon",
    result: "1st Runner-up",
    year: "2024",
    description: "Second place in the CodeSphere Hackathon.",
    shape: "podium",
    accent: "#6d7cff",
  },
  {
    id: "msme",
    title: "MSME Hackathon 5.0",
    result: "₹12L grant",
    year: "2026",
    description:
      "Secured a ₹12 lakh grant in MSME Hackathon 5.0 for the autonomous drone project researched and prototyped in 2025.",
    shape: "seed",
    accent: "#4fd1a5",
  },
  {
    id: "odoo",
    title: "Odoo x KAHE Hackathon 2026",
    result: "Top 99 / 2000+",
    year: "2026",
    description: "Placed in the top 99 out of 2000+ teams.",
    shape: "grid",
    accent: "#f5b556",
  },
  {
    id: "kaggle",
    title: "Kaggle",
    result: "Top 1.5%",
    description: "Ranked in the top 1.5% on Kaggle.",
    shape: "summit",
    accent: "#5ec2ff",
  },
];
