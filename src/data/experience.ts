export type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  start: string;
  /** Omitted while the role is ongoing. */
  end?: string;
  location?: string;
  /** True for the position currently held. */
  current?: boolean;
  /** Named deliverable, where the role centred on one. */
  project?: string;
  responsibilities: string[];
  /** Tooling the role runs on, shown as chips. */
  stack?: string[];
  projectSlug?: string;
};

export const experience: Experience[] = [
  {
    id: "dr-joshis",
    role: "Web Developer",
    company: "Dr. Joshi's Holistic Multispecialty Clinic",
    period: "Jul 2026 – Present",
    start: "2026-07",
    location: "Mumbai, Maharashtra, India",
    current: true,
    responsibilities: [
      "MERN stack development",
      "Custom AI integration into web systems",
      "API integration",
      "Application optimization",
      "Website maintenance and bug fixing",
      "CRM workflow automation",
      "AI-assisted development using Claude",
    ],
    stack: ["MongoDB", "Express", "React", "Node.js", "Zoho Creator", "Make.com", "Claude"],
  },
  {
    id: "paarsh",
    role: "Data Science Intern",
    company: "Paarsh Infotech Pvt. Ltd.",
    period: "January 2, 2026 – June 30, 2026",
    start: "2026-01-02",
    end: "2026-06-30",
    project: "SurplusLink — AI-Powered Food Donation Management System",
    responsibilities: [
      "Data Science",
      "Dataset generation",
      "Workflow development",
      "Data analysis",
      "Insights generation",
      "NGO food delivery project",
    ],
    stack: ["Python", "Synthetic data generation", "CRM analytics"],
    projectSlug: "food-donation-system",
  },
];

export type Education = {
  id: string;
  institution: string;
  program: string;
  period?: string;
  score: string;
  scoreLabel: string;
};

export const education: Education[] = [
  {
    id: "gcoej",
    institution: "Government College of Engineering, Jalgaon",
    program: "B.Tech Computer Engineering",
    period: "2022–2026",
    score: "8.13",
    scoreLabel: "CGPA",
  },
  {
    id: "mj",
    institution: "M.J. College, Jalgaon",
    program: "HSC",
    score: "79%",
    scoreLabel: "Score",
  },
  {
    id: "lnsv",
    institution: "L.N.S.V., Jalgaon",
    program: "SSC",
    score: "97%",
    scoreLabel: "Score",
  },
];
