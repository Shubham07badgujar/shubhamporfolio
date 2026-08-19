export type JourneyHighlight = {
  label: string;
  detail?: string;
  /** "award" | "role" | "milestone" — used for iconography */
  kind?: "award" | "role" | "milestone" | "project" | "internship";
};

export type JourneyYear = {
  year: string;
  title: string;
  subtitle: string;
  summary: string;
  focus: string[];
  highlights?: JourneyHighlight[];
  /** Name of the 3D vignette rendered for this node. */
  scene: "terminal" | "circuit" | "drone" | "neural" | "engineer";
  accent: string;
};

export const journey: JourneyYear[] = [
  {
    year: "2022",
    title: "The Beginning",
    subtitle: "Foundations",
    summary:
      "Started B.Tech Computer Engineering at Government College of Engineering, Jalgaon — and started thinking in code.",
    focus: [
      "Programming foundations",
      "C / C++",
      "Problem solving",
      "Computer science fundamentals",
    ],
    scene: "terminal",
    accent: "#4f8cff",
  },
  {
    year: "2023",
    title: "The Builder",
    subtitle: "Software & Web",
    summary:
      "Moved from syntax to systems — building projects end to end across the stack.",
    focus: [
      "Software development",
      "Web development",
      "Java · Python",
      "React · Node.js",
      "Databases",
      "DSA",
      "Building projects",
    ],
    scene: "circuit",
    accent: "#6d7cff",
  },
  {
    year: "2024",
    title: "The Engineer",
    subtitle: "Drones, Teams & Hackathons",
    summary:
      "Joined Team Third Axis (Drone Club) as Software Head and took engineering into the air.",
    focus: ["Drone engineering", "Team leadership", "Hackathons", "Systems thinking"],
    highlights: [
      {
        label: "Team Third Axis (Drone Club)",
        detail: "Software Head",
        kind: "role",
      },
      { label: "SAE AeroTHON 2024", detail: "AIR 5", kind: "award" },
      { label: "CodeSphere Hackathon", detail: "1st Runner-up", kind: "award" },
    ],
    scene: "drone",
    accent: "#8b6cff",
  },
  {
    year: "2025",
    title: "The AI Era",
    subtitle: "Intelligence & Research",
    summary:
      "Went deep into AI/ML, data science and computer vision — building research assistants and AI-powered applications.",
    focus: [
      "AI/ML",
      "Data Science",
      "Computer Vision",
      "RAG & LLMs",
      "Research",
      "AI-powered applications",
    ],
    highlights: [
      {
        label: "ArXiv Research Paper Assistant",
        detail: "RAG pipeline with Sentence-BERT, FAISS, Llama 3 & Neo4j",
        kind: "project",
      },
      {
        label: "Autonomous Drone Research & Payload Drop",
        detail: "Technical research and prototype development",
        kind: "project",
      },
    ],
    scene: "neural",
    accent: "#a26bff",
  },
  {
    year: "2026",
    title: "The Engineer",
    subtitle: "Ready to Build",
    summary:
      "B.Tech completed, internship completed, and a stack of real-world systems shipped. Focused on software and AI/ML engineering.",
    focus: ["Software engineering focus", "AI/ML engineering focus"],
    highlights: [
      { label: "B.Tech completed", kind: "milestone" },
      {
        label: "Data Science Intern — Paarsh Infotech Pvt. Ltd.",
        detail: "Jan 2, 2026 – Jun 30, 2026 · SurplusLink",
        kind: "internship",
      },
      { label: "Kaggle", detail: "Top 1.5%", kind: "award" },
      {
        label: "MSME Hackathon 5.0",
        detail: "₹12L grant — autonomous drone project submitted",
        kind: "award",
      },
      {
        label: "Odoo x KAHE Hackathon 2026",
        detail: "Top 99 / 2000+",
        kind: "award",
      },
      {
        label: "KrishiBandhu",
        detail: "AI-powered agriculture platform",
        kind: "project",
      },
    ],
    scene: "engineer",
    accent: "#c46bff",
  },
];

export const journeyOutro = ["2026", "SHUBHAM BADGUJAR", "READY TO BUILD"];
