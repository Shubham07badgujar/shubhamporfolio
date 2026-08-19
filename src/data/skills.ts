export type SkillCategory = {
  id: string;
  label: string;
  skills: string[];
  accent: string;
};

export const skillCategories: SkillCategory[] = [
  {
    id: "programming",
    label: "Programming",
    skills: ["C", "C++", "Python", "Java", "JavaScript"],
    accent: "#4f8cff",
  },
  {
    id: "frontend",
    label: "Frontend",
    skills: ["React", "Next.js", "Tailwind CSS", "Bootstrap"],
    accent: "#6d7cff",
  },
  {
    id: "backend",
    label: "Backend",
    skills: ["Node.js", "Express.js"],
    accent: "#8b6cff",
  },
  {
    id: "database",
    label: "Database",
    skills: ["MongoDB", "PostgreSQL", "SQLite", "Supabase", "Firebase", "Neo4j"],
    accent: "#a26bff",
  },
  {
    id: "aiml",
    label: "AI / ML",
    skills: [
      "NumPy",
      "Pandas",
      "Scikit-learn",
      "XGBoost",
      "LightGBM",
      "CatBoost",
      "PyTorch",
      "Transformers",
      "FAISS",
      "Sentence-BERT",
      "RAG",
    ],
    accent: "#c46bff",
  },
  {
    id: "tools",
    label: "Tools",
    skills: ["GitHub", "VS Code", "Kaggle", "Google Colab", "Streamlit", "Render"],
    accent: "#5ec2ff",
  },
];
