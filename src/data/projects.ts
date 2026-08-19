export type ArchNode = {
  id: string;
  /** Layer name — Frontend, API Layer, Vector Store, Hardware, and so on. */
  label: string;
  /** Concrete technology or detail shown under the label. */
  meta?: string;
  /** Column / tier index used to lay the graph out. */
  tier: number;
};

export type ArchEdge = { from: string; to: string };

export type ProjectLink = { label: string; url: string };

export type Project = {
  slug: string;
  title: string;
  shortTitle: string;
  /** Context line: hackathon, internship or club the system was built in. */
  subtitle?: string;
  category: string;
  tagline: string;
  description: string;
  problem: string;
  solution: string;
  architecture: { nodes: ArchNode[]; edges: ArchEdge[] };
  technologies: string[];
  /** Ordered path a unit of work takes through the system. */
  dataFlow?: string[];
  /** APIs, services and interfaces the system exposes or consumes. */
  services?: string[];
  /** The engineering calls that shaped the build. */
  decisions?: string[];
  features: string[];
  outcome: string;
  /** Headline result, rendered as a metric chip where one is stated. */
  impact?: string;
  links: ProjectLink[];
  featured?: boolean;
  /** Which interactive visualization to render on the detail page. */
  visual: "layered" | "pipeline" | "erp" | "graph";
  accent: string;
};

export const projects: Project[] = [
  {
    slug: "erp",
    title: "Mini ERP: From Demand to Delivery",
    shortTitle: "Mini ERP",
    subtitle: "Odoo x KAHE Hackathon 2026 · Finalist",
    category: "Enterprise Systems · Full-stack",
    tagline: "7+ modules and 30+ REST APIs turning demand into traceable delivery.",
    description:
      "A centralized Mini ERP platform with 7+ integrated modules and 30+ REST APIs, automating inventory workflows for Make-to-Stock (MTS) and Make-to-Order (MTO) production across 5 role-based user tiers. BoM-driven manufacturing pipelines and real-time stock reservation give end-to-end traceability through structured inventory ledgers and work orders.",
    problem:
      "Sales, purchasing, manufacturing and stock each moved on their own, so no single system connected a customer's demand to the work orders and stock movements that fulfil it — and nobody could trace a finished unit back through its production.",
    solution:
      "One centralized platform where 7+ modules share a data model and talk over 30+ REST APIs. Demand enters as MTS or MTO, a Bill of Materials explodes it into work orders, stock is reserved in real time, and every movement lands in a structured inventory ledger. Five role tiers scope what each user can reach.",
    architecture: {
      nodes: [
        { id: "users", label: "Role-Based Access", meta: "5 user tiers", tier: 0 },
        { id: "api", label: "REST API Layer", meta: "30+ endpoints", tier: 1 },
        { id: "core", label: "ERP Core", meta: "7+ integrated modules", tier: 2 },
        { id: "mfg", label: "Manufacturing", meta: "MTS · MTO · BoM", tier: 3 },
        { id: "inventory", label: "Inventory", meta: "Real-time reservation", tier: 3 },
        { id: "orders", label: "Work Orders", tier: 4 },
        { id: "ledger", label: "Inventory Ledger", tier: 4 },
        { id: "trace", label: "Traceability", meta: "Demand → delivery", tier: 5 },
      ],
      edges: [
        { from: "users", to: "api" },
        { from: "api", to: "core" },
        { from: "core", to: "mfg" },
        { from: "core", to: "inventory" },
        { from: "mfg", to: "orders" },
        { from: "inventory", to: "ledger" },
        { from: "orders", to: "trace" },
        { from: "ledger", to: "trace" },
      ],
    },
    technologies: ["REST APIs", "RBAC", "BoM modelling", "Inventory ledgers"],
    dataFlow: [
      "Demand (MTS / MTO)",
      "BoM explosion",
      "Work order generation",
      "Real-time stock reservation",
      "Inventory ledger entry",
      "Delivery + traceability",
    ],
    services: [
      "30+ REST APIs spanning 7+ integrated modules",
      "Role-based access control across 5 user tiers",
      "Stock reservation service backing MTS and MTO flows",
    ],
    decisions: [
      "BoM-driven pipelines: production is derived from demand rather than entered by hand.",
      "Stock reserved in real time, keeping committed inventory distinct from available stock.",
      "Inventory ledgers and work orders as the traceability backbone, so every unit has a history.",
      "One shared data model across modules instead of per-module stores, removing reconciliation.",
    ],
    features: [
      "7+ integrated business modules",
      "30+ REST APIs",
      "5 role-based user tiers",
      "MTS and MTO production workflows",
      "Bill of Materials driven manufacturing",
      "Real-time stock reservation",
      "Work orders",
      "Structured inventory ledgers",
      "End-to-end production traceability",
    ],
    outcome:
      "Cross-functional operations streamlined across five role tiers, with production lead time reduced by 20%.",
    impact: "20% lower production lead time",
    links: [
      { label: "GitHub", url: "https://github.com/Shubham07badgujar/OdooFinalRound" },
      { label: "Live Demo", url: "[Live Demo]" },
    ],
    featured: true,
    visual: "erp",
    accent: "#f5b556",
  },
  {
    slug: "food-donation-system",
    title: "AI-Powered Food Donation Management System",
    shortTitle: "Food Donation System",
    subtitle: "Data Science Internship — Jan–Jun 2026",
    category: "Data Science · AI Pipeline",
    tagline: "Forecasting, freshness scoring and hotspot mapping over 50K+ engineered records.",
    description:
      "An AI-powered Food Donation Management System with predictive demand forecasting, automated hotspot mapping and real-time freshness scoring, optimizing resource allocation across 6 operational modules. A Python synthetic data generation framework produced 50K+ interconnected records with 70+ features, feeding an end-to-end CRM analytics platform that tracks 10+ core KPIs.",
    problem:
      "Matching surplus food to the people who need it depends on knowing where demand will appear, how long a donation stays viable, and which areas concentrate need — and there was no production-grade dataset to train any of that on.",
    solution:
      "A Python framework generates 50K+ interconnected synthetic records across 70+ features, giving the models realistic training data. On top of it sit demand forecasting, freshness scoring and hotspot mapping, wired into 6 operational modules and a CRM analytics layer tracking 10+ KPIs.",
    architecture: {
      nodes: [
        { id: "gen", label: "Data Generation", meta: "Python framework", tier: 0 },
        { id: "dataset", label: "Dataset", meta: "50K+ records · 70+ features", tier: 1 },
        { id: "ml", label: "ML Pipeline", meta: "AI training", tier: 2 },
        { id: "forecast", label: "Demand Forecasting", tier: 3 },
        { id: "freshness", label: "Freshness Scoring", meta: "Real-time", tier: 3 },
        { id: "hotspot", label: "Hotspot Mapping", meta: "Automated", tier: 3 },
        { id: "modules", label: "Operational Modules", meta: "6 modules", tier: 4 },
        { id: "crm", label: "CRM Analytics", meta: "10+ core KPIs", tier: 5 },
      ],
      edges: [
        { from: "gen", to: "dataset" },
        { from: "dataset", to: "ml" },
        { from: "ml", to: "forecast" },
        { from: "ml", to: "freshness" },
        { from: "ml", to: "hotspot" },
        { from: "forecast", to: "modules" },
        { from: "freshness", to: "modules" },
        { from: "hotspot", to: "modules" },
        { from: "modules", to: "crm" },
      ],
    },
    technologies: ["Python", "Synthetic data generation", "Predictive forecasting", "CRM analytics"],
    dataFlow: [
      "Synthetic generation (Python)",
      "50K+ interconnected records · 70+ features",
      "AI training pipeline",
      "Forecasting · freshness · hotspots",
      "6 operational modules",
      "CRM KPI analytics",
    ],
    services: [
      "Predictive demand forecasting",
      "Real-time freshness scoring",
      "Automated hotspot mapping",
      "CRM analytics tracking 10+ core KPIs",
    ],
    decisions: [
      "Synthetic generation over scarce real data, so models could train at production scale from day one.",
      "Records generated interconnected rather than independently, preserving the relationships the models need to learn.",
      "70+ engineered features to support forecasting, freshness and geospatial demand from one dataset.",
      "KPI analytics built into the platform so allocation decisions are measured, not assumed.",
    ],
    features: [
      "Predictive demand forecasting",
      "Real-time freshness scoring",
      "Automated hotspot mapping",
      "Python synthetic data generation framework",
      "50K+ interconnected records with 70+ features",
      "6 operational modules",
      "End-to-end CRM analytics platform",
      "10+ core KPIs tracked",
    ],
    outcome:
      "A production-grade training dataset and analytics platform supporting data-driven resource allocation end to end.",
    links: [{ label: "GitHub", url: "[GitHub Link]" }],
    featured: true,
    visual: "pipeline",
    accent: "#5ec2ff",
  },
  {
    slug: "krishibandhu",
    title: "KrishiBandhu: AI-Powered Agriculture Platform",
    shortTitle: "KrishiBandhu",
    subtitle: "Jan 2026",
    category: "AI · Full-stack · AgriTech",
    tagline: "Crop diagnostics, forecasting and a marketplace behind one React/Node platform.",
    description:
      "An AI-driven web platform built with React.js and Node.js delivering real-time crop health analysis, predictive weather forecasting and a localized agricultural marketplace. NLP workflows power an AI chatbot and voice navigation, streamlining farmer-to-market information retrieval, while a fine-tuned deep learning diagnostic engine accelerates crop treatment workflows.",
    problem:
      "Farmers need crop diagnosis, weather, and buyers in one place — and the information that exists is often locked behind interfaces that assume literacy in a language and a UI pattern they may not share.",
    solution:
      "A React.js front end over Node.js APIs. A fine-tuned deep learning engine diagnoses crop health from images, forecasting handles weather, and a marketplace closes the loop to buyers. NLP-driven chat and voice navigation lower the barrier to reaching any of it.",
    architecture: {
      nodes: [
        { id: "user", label: "Farmer", meta: "Voice · chat · UI", tier: 0 },
        { id: "frontend", label: "Frontend", meta: "React.js", tier: 1 },
        { id: "api", label: "API Layer", meta: "REST", tier: 2 },
        { id: "backend", label: "Backend", meta: "Node.js", tier: 3 },
        { id: "dl", label: "Diagnostic Engine", meta: "Fine-tuned DL · MobileNetV2", tier: 4 },
        { id: "nlp", label: "NLP Services", meta: "Chatbot · voice nav", tier: 4 },
        { id: "weather", label: "Weather Forecasting", meta: "Predictive", tier: 4 },
        { id: "market", label: "Marketplace", meta: "Farmer → market", tier: 4 },
        { id: "db", label: "Database", meta: "MongoDB", tier: 5 },
      ],
      edges: [
        { from: "user", to: "frontend" },
        { from: "frontend", to: "api" },
        { from: "api", to: "backend" },
        { from: "backend", to: "dl" },
        { from: "backend", to: "nlp" },
        { from: "backend", to: "weather" },
        { from: "backend", to: "market" },
        { from: "dl", to: "db" },
        { from: "market", to: "db" },
      ],
    },
    technologies: [
      "React.js",
      "Node.js",
      "MongoDB",
      "Deep Learning",
      "MobileNetV2",
      "Computer Vision",
      "NLP",
    ],
    dataFlow: [
      "Farmer input (image · voice · text)",
      "React.js frontend",
      "REST API layer",
      "Node.js backend",
      "DL diagnostics · NLP · forecasting",
      "Marketplace + response",
    ],
    services: [
      "REST/API-driven backend services",
      "Deep learning crop diagnostic engine",
      "NLP chatbot and voice navigation",
      "Predictive weather forecasting",
      "Localized agricultural marketplace",
    ],
    decisions: [
      "A fine-tuned diagnostic model rather than a generic classifier, to make crop disease detection usable in the field.",
      "Voice navigation and NLP chat as first-class inputs, not add-ons, so accessibility does not depend on literacy or UI familiarity.",
      "API-driven separation of React front end and Node services, keeping AI workloads independent of the interface.",
    ],
    features: [
      "Real-time crop health analysis",
      "Fine-tuned deep learning diagnostic engine",
      "Predictive weather forecasting",
      "AI chatbot with NLP workflows",
      "Voice navigation",
      "Localized agricultural marketplace",
      "Farmer-to-market information retrieval",
    ],
    outcome:
      "Crop treatment workflows accelerated, manual intervention reduced by 40%, with improved early disease detection.",
    impact: "40% less manual intervention",
    links: [
      { label: "GitHub", url: "https://github.com/Shubham07badgujar/krishibandhu" },
      { label: "Live Demo", url: "[Live Demo]" },
    ],
    featured: true,
    visual: "layered",
    accent: "#4fd1a5",
  },
  {
    slug: "infosys-springboard",
    title: "Infosys Springboard Internship",
    shortTitle: "Infosys Springboard",
    subtitle: "Sep 2025 – Nov 2025",
    category: "Backend · Java · Databases",
    tagline: "Relational schemas and JDBC connectivity behind Java web applications.",
    description:
      "Constructed relational database schemas and backend logic using Core Java, OOP principles and JDBC to establish connectivity between web applications and database systems. Developed and debugged web architectures using Java and SQL, resolving code exceptions to minimize runtime errors and improve application processing efficiency.",
    problem:
      "Web applications need a dependable path from application logic to stored data — a schema that models the domain and a connectivity layer that does not fail silently at runtime.",
    solution:
      "Relational schemas modelled in SQL, backend logic written in Core Java following OOP principles, and JDBC wiring the two together. Exceptions were traced and resolved to cut runtime errors.",
    architecture: {
      nodes: [
        { id: "web", label: "Web Application", meta: "Java", tier: 0 },
        { id: "logic", label: "Backend Logic", meta: "Core Java · OOP", tier: 1 },
        { id: "jdbc", label: "JDBC", meta: "Connectivity layer", tier: 2 },
        { id: "schema", label: "Relational Schema", meta: "SQL", tier: 3 },
        { id: "db", label: "Database", tier: 4 },
      ],
      edges: [
        { from: "web", to: "logic" },
        { from: "logic", to: "jdbc" },
        { from: "jdbc", to: "schema" },
        { from: "schema", to: "db" },
      ],
    },
    technologies: ["Core Java", "OOP", "JDBC", "SQL"],
    dataFlow: [
      "Web application request",
      "Core Java backend logic",
      "JDBC connectivity",
      "Relational schema",
      "Database",
    ],
    decisions: [
      "OOP-structured backend logic to keep application concerns separable from persistence.",
      "Schema designed relationally first, with JDBC as the single connectivity path.",
      "Systematic exception handling to convert silent runtime failures into traceable errors.",
    ],
    features: [
      "Relational database schema design",
      "Core Java backend logic",
      "JDBC database connectivity",
      "Java + SQL web architecture",
      "Exception handling and debugging",
    ],
    outcome: "Runtime errors reduced and application processing efficiency improved.",
    links: [{ label: "GitHub", url: "[GitHub Link]" }],
    visual: "layered",
    accent: "#7c8cff",
  },
  {
    slug: "autonomous-drone",
    title: "Autonomous Drone Research & Payload Drop System",
    shortTitle: "Autonomous Drone",
    subtitle: "Research & Prototype — 2025",
    category: "Robotics · Computer Vision",
    tagline: "Vision-guided target detection deciding its own drop point.",
    description:
      "Technical research into autonomous drone navigation, carried through to prototype development in 2025. The system pairs a computer vision pipeline that detects and identifies target locations with an autonomous payload-drop mechanism, letting the drone determine the drop point itself and execute precise delivery. The project was submitted through the MSME Hackathon 5.0 application in 2026.",
    problem:
      "A payload drop that depends on a human spotting the target and calling the moment is limited by line of sight and reaction time. The drone has to identify the target and decide when to release on its own.",
    solution:
      "A computer vision pipeline detects and localizes the target from the drone's view, feeding an autonomous decision step that computes the drop point and triggers the payload-drop mechanism.",
    architecture: {
      nodes: [
        { id: "nav", label: "Autonomous Navigation", meta: "Flight path", tier: 0 },
        { id: "vision", label: "Vision Pipeline", meta: "Computer vision", tier: 1 },
        { id: "detect", label: "Target Detection", tier: 2 },
        { id: "localize", label: "Target Localization", tier: 3 },
        { id: "decide", label: "Drop Decision", meta: "Autonomous", tier: 4 },
        { id: "payload", label: "Payload Mechanism", meta: "Hardware", tier: 5 },
      ],
      edges: [
        { from: "nav", to: "vision" },
        { from: "vision", to: "detect" },
        { from: "detect", to: "localize" },
        { from: "localize", to: "decide" },
        { from: "decide", to: "payload" },
      ],
    },
    technologies: ["Computer Vision", "Autonomous navigation", "Drone control"],
    dataFlow: [
      "Aerial view",
      "Computer vision pipeline",
      "Target detection",
      "Target localization",
      "Autonomous drop decision",
      "Payload release",
    ],
    decisions: [
      "Target identification placed on the drone's own vision pipeline rather than a ground operator.",
      "Localization separated from detection, so the drop point is computed rather than approximated.",
    ],
    features: [
      "Autonomous drone navigation research (2025)",
      "Prototype development",
      "Computer vision target detection",
      "Target localization",
      "Autonomous drop-point decision-making",
      "Precise payload delivery mechanism",
    ],
    outcome:
      "Researched and prototyped through 2025, then submitted via the MSME Hackathon 5.0 application in 2026 — which received a ₹12 lakh grant.",
    impact: "₹12L MSME grant (2026)",
    links: [{ label: "GitHub", url: "[GitHub Link]" }],
    visual: "pipeline",
    accent: "#8b6cff",
  },
  {
    slug: "arxiv-assistant",
    title: "ArXiv Research Paper Assistant",
    shortTitle: "ArXiv Assistant",
    subtitle: "Mini Project — Mar 2025",
    category: "AI · RAG · LLM",
    tagline: "A RAG pipeline from ArXiv ingest to a grounded Llama 3 answer.",
    description:
      "A Streamlit-based RAG pipeline that fetches ArXiv papers, stores metadata in a Neo4j graph database, and processes queries using FAISS and Meta Llama 3 8B through the Groq API. Text extraction and document ranking run on Sentence-BERT, enabling efficient retrieval of relevant research and NLP-powered research direction suggestions.",
    problem:
      "Research papers are dense and plentiful; finding the passage that answers a specific question means reading everything around it first.",
    solution:
      "Papers are ingested from ArXiv, extracted to text, embedded with Sentence-BERT and indexed in FAISS. A query retrieves and ranks the relevant passages, which Meta Llama 3 8B answers through the Groq API. Neo4j holds paper metadata as the knowledge layer.",
    architecture: {
      nodes: [
        { id: "arxiv", label: "ArXiv", meta: "External API", tier: 0 },
        { id: "extract", label: "Document Extraction", meta: "Text extraction", tier: 1 },
        { id: "embed", label: "Embeddings", meta: "Sentence-BERT", tier: 2 },
        { id: "faiss", label: "Vector Store", meta: "FAISS", tier: 3 },
        { id: "neo4j", label: "Knowledge Layer", meta: "Neo4j metadata", tier: 3 },
        { id: "retrieve", label: "Retrieval + Ranking", tier: 4 },
        { id: "llm", label: "LLM", meta: "Llama 3 8B · Groq API", tier: 5 },
        { id: "ui", label: "Streamlit App", meta: "Answer + suggestions", tier: 6 },
      ],
      edges: [
        { from: "arxiv", to: "extract" },
        { from: "extract", to: "embed" },
        { from: "extract", to: "neo4j" },
        { from: "embed", to: "faiss" },
        { from: "faiss", to: "retrieve" },
        { from: "neo4j", to: "retrieve" },
        { from: "retrieve", to: "llm" },
        { from: "llm", to: "ui" },
      ],
    },
    technologies: [
      "Streamlit",
      "Sentence-BERT",
      "FAISS",
      "Neo4j",
      "Meta Llama 3 8B",
      "Groq API",
      "RAG",
    ],
    dataFlow: [
      "ArXiv ingest",
      "Document extraction",
      "Sentence-BERT embeddings",
      "FAISS retrieval",
      "LLM via Groq",
      "Answer",
    ],
    services: [
      "ArXiv paper fetching",
      "Groq API serving Meta Llama 3 8B",
      "FAISS vector similarity search",
      "Neo4j graph metadata store",
    ],
    decisions: [
      "Retrieval-augmented generation over fine-tuning, so answers stay grounded in the fetched papers.",
      "Neo4j as a separate metadata layer, keeping paper relationships queryable alongside vector similarity.",
      "Sentence-BERT for both embedding and ranking, so retrieval and ordering share one representation.",
    ],
    features: [
      "ArXiv paper ingestion",
      "Automated text extraction",
      "Sentence-BERT embeddings and document ranking",
      "FAISS vector retrieval",
      "Neo4j metadata graph",
      "Llama 3 8B answers via Groq API",
      "NLP-powered research direction suggestions",
    ],
    outcome:
      "Academic research workflows streamlined through NLP querying, with relevant papers retrieved efficiently.",
    links: [
      { label: "GitHub", url: "https://github.com/Shubham07badgujar/Arxiv-Research-Paper-Assistant" },
      { label: "Live Demo", url: "[Live Demo]" },
    ],
    featured: true,
    visual: "pipeline",
    accent: "#a26bff",
  },
  {
    slug: "drone-vision",
    title: "Drone Vision & Object Detection System",
    shortTitle: "Drone Vision",
    subtitle: "Drone Club — 2024",
    category: "Computer Vision · Edge AI",
    tagline: "YOLOv8 running on-board a Raspberry Pi, classifying targets from the air.",
    description:
      "YOLOv8n and YOLOv8m models trained on a custom dataset created and annotated with LabelImg, then deployed on a drone running Raspberry Pi OS and integrated with the drone's V3 camera. The system processes real-time aerial field images to detect and classify target shapes.",
    problem:
      "Aerial imagery is only useful if something interprets it while the drone is still flying — sending frames to a ground station adds latency the mission cannot spend.",
    solution:
      "A custom dataset annotated in LabelImg trains YOLOv8n and YOLOv8m. The trained models are deployed onto the drone's Raspberry Pi, reading the V3 camera directly so detection and classification happen on-board in real time.",
    architecture: {
      nodes: [
        { id: "dataset", label: "Custom Dataset", meta: "LabelImg annotation", tier: 0 },
        { id: "train", label: "Model Training", meta: "YOLOv8n · YOLOv8m", tier: 1 },
        { id: "camera", label: "Drone V3 Camera", meta: "Hardware", tier: 2 },
        { id: "pi", label: "Edge Compute", meta: "Raspberry Pi OS", tier: 3 },
        { id: "infer", label: "YOLOv8 Inference", meta: "Real-time", tier: 4 },
        { id: "detect", label: "Object Detection", tier: 5 },
        { id: "classify", label: "Target Classification", meta: "Shape classes", tier: 6 },
      ],
      edges: [
        { from: "dataset", to: "train" },
        { from: "train", to: "infer" },
        { from: "camera", to: "pi" },
        { from: "pi", to: "infer" },
        { from: "infer", to: "detect" },
        { from: "detect", to: "classify" },
      ],
    },
    technologies: ["YOLOv8n", "YOLOv8m", "LabelImg", "Raspberry Pi OS", "Computer Vision"],
    dataFlow: [
      "Drone V3 camera",
      "Raspberry Pi (on-board)",
      "YOLOv8 inference",
      "Object detection",
      "Target classification",
    ],
    services: [
      "On-board real-time inference on Raspberry Pi OS",
      "Drone V3 camera integration",
      "Custom annotated training dataset",
    ],
    decisions: [
      "Inference on-board rather than at a ground station, removing the transmission round trip from the loop.",
      "Two model sizes trained (YOLOv8n and YOLOv8m) to trade accuracy against what the Pi can sustain.",
      "A purpose-built annotated dataset, since the target shapes do not appear in general-purpose datasets.",
    ],
    features: [
      "Custom dataset created and annotated with LabelImg",
      "YOLOv8n and YOLOv8m model training",
      "Deployment on Raspberry Pi OS",
      "Drone V3 camera integration",
      "Real-time aerial image processing",
      "Target shape detection and classification",
    ],
    outcome:
      "AI-powered computer vision running on the drone itself, classifying targets from live aerial imagery.",
    links: [{ label: "GitHub", url: "[GitHub Link]" }],
    visual: "pipeline",
    accent: "#6d7cff",
  },
  {
    slug: "drone-club-website",
    title: "Drone Club Website & Admin CMS",
    shortTitle: "Drone Club Website",
    subtitle: "Team Third Axis — Drone Club",
    category: "Full-stack · MERN",
    tagline: "A public club site and a JWT-protected admin CMS over one Express API.",
    description:
      "A full-stack platform for the drone club: a React 18 + Vite public site covering projects, events, blog, team, achievements and departments, backed by an Express/MongoDB API. A JWT-protected admin dashboard lets the club manage every one of those content types itself, with image uploads handled server-side.",
    problem:
      "A club's site goes stale the moment publishing anything — a new event, a team roster, an achievement — requires a developer and a redeploy.",
    solution:
      "Eight content domains each get a Mongoose model, an Express route and admin CRUD, so the club edits its own content through a dashboard while the public site reads the same API. Auth, rate limiting and upload handling sit in middleware rather than in each route.",
    architecture: {
      nodes: [
        { id: "public", label: "Public Site", meta: "React 18 · Vite", tier: 0 },
        { id: "admin", label: "Admin Dashboard", meta: "JWT-protected", tier: 0 },
        { id: "router", label: "Client Routing", meta: "React Router", tier: 1 },
        { id: "api", label: "REST API Layer", meta: "Express · 8 resources", tier: 2 },
        { id: "mw", label: "Middleware", meta: "JWT · Helmet · rate limit", tier: 3 },
        { id: "uploads", label: "File Uploads", meta: "Multer", tier: 3 },
        { id: "models", label: "Data Models", meta: "Mongoose · 8 schemas", tier: 4 },
        { id: "db", label: "Database", meta: "MongoDB Atlas", tier: 5 },
      ],
      edges: [
        { from: "public", to: "router" },
        { from: "admin", to: "router" },
        { from: "router", to: "api" },
        { from: "api", to: "mw" },
        { from: "api", to: "uploads" },
        { from: "mw", to: "models" },
        { from: "uploads", to: "models" },
        { from: "models", to: "db" },
      ],
    },
    technologies: [
      "React 18",
      "Vite",
      "Tailwind CSS",
      "React Router",
      "Framer Motion",
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose",
      "JWT",
      "Multer",
      "Render",
    ],
    dataFlow: [
      "Browser",
      "React Router page",
      "Express route",
      "Auth + validation middleware",
      "Mongoose model",
      "MongoDB Atlas",
    ],
    services: [
      "8 REST resources: projects, events, blogs, team, teamYears, departments, achievements, auth",
      "JWT authentication with bcrypt-hashed admin credentials",
      "Multer image uploads",
      "Helmet, CORS, rate limiting and response compression",
      "Event registration tracking",
    ],
    decisions: [
      "One API serving both the public site and the admin console, so published content and edited content can never drift apart.",
      "A schema, route and CRUD surface per content domain, which keeps the admin dashboard uniform as new domains are added.",
      "Security concerns — auth, rate limiting, headers — handled in middleware rather than repeated per route.",
      "Frontend and backend deployed as separate Render services, so the static client scales independently of the API.",
    ],
    features: [
      "Projects showcase with technology tags and status",
      "Events with registration and capacity tracking",
      "Blog with authors and tag filtering",
      "Year-based team directory",
      "Achievements gallery",
      "Department and leadership structure",
      "JWT admin login and dashboard",
      "Server-side image uploads",
    ],
    outcome:
      "The club publishes and maintains its own content through the dashboard, with no code change or redeploy per update.",
    links: [
      { label: "GitHub", url: "https://github.com/Shubham07badgujar/Drone-Club-Website" },
      { label: "Live Demo", url: "[Live Demo]" },
    ],
    visual: "layered",
    accent: "#8b6cff",
  },
  {
    slug: "ai-club-website",
    title: "AI Club Website",
    shortTitle: "AI Club Website",
    subtitle: "AI Club — Captain",
    category: "Full-stack · React SPA",
    tagline: "A React SPA and a JSON API, deployed as two independent services.",
    description:
      "The AI Club's public platform: a React single-page application built with Vite, routing across home, about, projects, events, team and blog, with a separate admin area behind a login. It talks to a versioned JSON API deployed as its own service, so the client and the API scale and ship independently.",
    problem:
      "The club needed a public home for its projects, events and members that its own committee could keep current, rather than a static page needing a developer for every change.",
    solution:
      "A Vite-built React SPA handles all public routes on the client, while a separate JSON API service owns the data and the admin authentication. Splitting the two means the static client is cheap to serve and the API can be restarted or scaled on its own.",
    architecture: {
      nodes: [
        { id: "client", label: "Client", meta: "React · Vite SPA", tier: 0 },
        { id: "router", label: "Client Routing", meta: "React Router · 8 routes", tier: 1 },
        { id: "auth", label: "Admin Auth", meta: "JWT · /admin/login", tier: 2 },
        { id: "api", label: "REST API", meta: "JSON service · v1.0.0", tier: 3 },
        { id: "health", label: "Health Endpoint", meta: "/api/health", tier: 4 },
      ],
      edges: [
        { from: "client", to: "router" },
        { from: "router", to: "auth" },
        { from: "router", to: "api" },
        { from: "auth", to: "api" },
        { from: "api", to: "health" },
      ],
    },
    technologies: ["React", "Vite", "React Router", "JWT", "REST API", "Render"],
    dataFlow: [
      "Browser",
      "React SPA (Vite bundle)",
      "Client route",
      "REST API service",
      "JSON response",
    ],
    services: [
      "Public routes: home, about, projects, events, team, blog",
      "Admin area behind a dedicated login route",
      "Versioned JSON API on its own Render service",
      "Health endpoint for uptime checks",
    ],
    decisions: [
      "Client and API split across two deployments rather than one server rendering both, so a static bundle serves the public site.",
      "Client-side routing for every public view, keeping navigation instant once the bundle loads.",
      "Admin access gated behind its own route and token check rather than mixed into the public surface.",
    ],
    features: [
      "Home, about, projects, events, team and blog routes",
      "Admin login and admin area",
      "Single-page client-side navigation",
      "Separate API service with health reporting",
    ],
    outcome: "Live and publicly reachable, with the client and API running as independent services.",
    links: [
      { label: "Live Demo", url: "https://ai-club-frontend.onrender.com/" },
      { label: "GitHub", url: "[GitHub Link]" },
    ],
    visual: "layered",
    accent: "#4fd1a5",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const featuredProjects = projects.filter((p) => p.featured);
