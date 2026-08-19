export const about = {
  /**
   * The lead block. Kept deliberately short — the fuller narrative (journey and
   * process chains, highlight stats) still lives in Quick View, which is the
   * layer built for people who want the detail.
   */
  greeting: "Hello!",
  lead: {
    before: "Hi, my name is ",
    name: "Shubham Badgujar",
    after:
      ", a Computer Engineering graduate from Government College of Engineering, Jalgaon — building intelligent systems, scalable software and real-world solutions.",
  },
  /** Three things to lead with, mirroring the reference's icon row. */
  focus: [
    { id: "code", label: "Software" },
    { id: "ai", label: "AI / ML" },
    { id: "data", label: "Data Science" },
  ],
  intro:
    "I'm Shubham Badgujar, a Computer Engineering graduate from Government College of Engineering, Jalgaon.",
  journeyIntro: "I started my engineering journey in 2022. Over four years I moved through:",
  journeySteps: [
    "Programming",
    "Web Development",
    "Software Engineering",
    "Drone Engineering",
    "Hackathons",
    "AI/ML",
    "Data Science",
    "Real-world software projects",
  ],
  work:
    "I have worked on software systems, AI-powered applications, research assistants, ERP systems, agriculture technology and data science projects.",
  processIntro: "I enjoy taking an idea from:",
  processSteps: [
    "Problem",
    "Research",
    "Architecture",
    "Development",
    "Testing",
    "Deployment",
    "Iteration",
  ],
  highlights: [
    { value: "8.13 CGPA", label: "B.Tech Computer Engineering" },
    { value: "2022–2026", label: "Engineering Journey" },
    { value: "Top 1.5%", label: "Kaggle" },
    { value: "15+", label: "Projects / Work" },
  ],
} as const;
