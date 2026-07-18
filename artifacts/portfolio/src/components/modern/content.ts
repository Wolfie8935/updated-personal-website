/**
 * content.ts — every string the modern (dark/light) theme renders.
 *
 * Content policy: the visual copy comes from the Claude Design spec
 * ("Court & Terminal"); facts follow the live site where the two disagreed
 * (CGPA 9.79, AWS list, link URLs), and site-only information the design
 * lacked (publications + DOIs, ORCID, resume, project links, IISc report)
 * is woven into the design's own slots.
 */

export const EMAIL = "goel07.aman@gmail.com";
export const RESUME_URL = "/Aman_Goel_Resume.pdf";
export const REPORT_FILE = "IISc_Research_Report.pdf";

export const LINKS = {
  github: "https://github.com/Wolfie8935",
  githubRepos: "https://github.com/Wolfie8935?tab=repositories",
  linkedin: "https://www.linkedin.com/in/amangoel8935",
  leetcode: "https://leetcode.com/u/Wolfie8935/",
  orcid: "https://orcid.org/0009-0000-0899-9400",
  cerasLive: "https://ceras-frontend.onrender.com/",
  cerasRepo: "https://github.com/Wolfie8935/CERAS-Cognitive-Efficiency-Reasoning-Alignment-System",
  cycloneRepo: "https://github.com/Wolfie8935/Cyclone-Intensity-Prediction",
  cycloneDoi: "https://doi.org/10.1109/ICCMC65190.2025.11140783",
  hotelDoi: "https://doi.org/10.1201/9781003658221-44",
  chatbotRepo: "https://github.com/Wolfie8935/Intel-Unnati-GenAI-Chatbot",
};

export const tickerA = [
  "Python", "C++", "FastAPI", "PyTorch", "TensorFlow",
  "AWS", "Docker", "Bayesian ML", "NLP", "System Design",
];

export const tickerB = [
  "REASONING ENGINES", "ML PIPELINES", "BACKEND SYSTEMS",
  "DISTRIBUTED LLM", "RESEARCH", "CI/CD",
];

export const aboutWords =
  "Systems, not demos. I build reasoning engines, ML pipelines, and backends that stay fast when it matters — a 9.79 CGPA in Computer Science, complete; probabilistic-ML research at IISc Bangalore; and CERAS, a reasoning platform built from first principles. Before any of it there was tennis, played for India. The footwork stayed.".split(" ");

export const aboutStats = [
  { count: 9.79, dec: 2, suf: "", start: "0.00", label: "CGPA — B.TECH CSE, SRMIST" },
  { count: 400, dec: 0, suf: "+", start: "0", label: "DSA PROBLEMS SOLVED" },
  { count: 0.993, dec: 3, suf: "", start: "0.000", label: "R² — CYCLONE MODEL" },
  { count: 97, dec: 0, suf: "%", start: "0%", label: "MODEL ACCURACY, TUNED" },
];

export interface Job {
  period: string;
  role: string;
  org: string;
  desc: string;
}

export const experience: Job[] = [
  {
    period: "JUN — JUL 2025",
    role: "Research Intern",
    org: "IISc Bangalore",
    desc: "Bayesian inference and posterior-estimation pipelines in Python — vectorized, reproducible, and fast. Mathematical formulations translated into efficient, readable code, under Prof. C. Pandurangan.",
  },
  {
    period: "MAY — JUL 2024",
    role: "Industrial Trainee",
    org: "Intel Unnati",
    desc: "ETL pipelines for LLM fine-tuning workflows; LLaMA inference on CPU via Intel Extension for Transformers — tokenization, batching, and generation end to end.",
  },
  {
    period: "AUG — SEP 2024",
    role: "ML Intern",
    org: "Fox Trading · 1stop.ai",
    desc: "Took a stock-price prediction model from 93% to 97% accuracy through feature refinement and hyperparameter tuning.",
  },
];

export const capabilities = [
  {
    num: "01",
    label: "PROGRAMMING LANGUAGES",
    note: "Four languages, one standard.",
    items: ["Python", "C++", "Java", "JavaScript"],
  },
  {
    num: "02",
    label: "CORE COMPUTER SCIENCE",
    note: "400+ problems of footwork.",
    items: [
      "Data structures & algorithms",
      "Dynamic programming · greedy · backtracking",
      "Graphs & trees",
      "Object-oriented design",
      "Complexity analysis",
    ],
  },
  {
    num: "03",
    label: "BACKEND ENGINEERING",
    note: "Fast under load.",
    items: [
      "RESTful API design — FastAPI",
      "Asynchronous programming",
      "System design & modular architecture",
      "Distributed systems",
      "Algorithm optimization",
      "API lifecycle management · SDLC",
    ],
  },
  {
    num: "04",
    label: "CLOUD & DEVOPS",
    note: "Ships reproducibly.",
    items: [
      "AWS — EC2 · S3 · Lambda · RDS · SageMaker",
      "Docker · Jenkins · CI/CD",
      "Git & GitHub — version control",
      "SQL & NoSQL datastores",
    ],
  },
  {
    num: "05",
    label: "MACHINE LEARNING & AI",
    note: "Rigor before scale.",
    items: [
      "PyTorch · TensorFlow · Keras",
      "Deep learning & neural networks",
      "Natural language processing",
      "Bayesian estimation · probabilistic modeling",
      "Statistical ML · few-shot calibration",
      "NumPy · Pandas",
    ],
  },
  {
    num: "06",
    label: "RESEARCH & PROBABILISTIC METHODS",
    note: "Uncertainty, quantified.",
    items: [
      "Bayesian inference · posterior estimation",
      "Gibbs sampling · Monte Carlo methods",
      "Variational inference · Laplace approximation",
      "Uncertainty quantification",
      "PEFT fine-tuning",
    ],
  },
];

export const principles = [
  {
    num: "I",
    title: "Footwork before winners.",
    gloss: "Fundamentals decide matches — data structures, baselines, proofs. Speed comes from position, not from swinging harder.",
  },
  {
    num: "II",
    title: "Verify, then trust.",
    gloss: "CERAS checks every reasoning path before it commits. So do I — tests, baselines, error bars, then conviction.",
  },
  {
    num: "III",
    title: "Play the long point.",
    gloss: "Research is a rally. Iterate past the comfortable stopping point — 93% became 97% in the boring, patient middle.",
  },
  {
    num: "IV",
    title: "Systems, not demos.",
    gloss: "What ships must hold under load, restart cleanly, and read clearly to the next engineer. Anything else is a trick shot.",
  },
];

export const mailChars = EMAIL.split("");

export interface CaseLink {
  label: string;
  href: string;
}

export interface CaseStudy {
  idx: string;
  tags: string;
  title: string;
  sub: string;
  meta: { k: string; v: string }[];
  problem: string;
  flowTitle: string;
  flow: { s: string; d: string }[];
  decisions: { n: string; t: string; b: string }[];
  outcomes: { v: string; l: string }[];
  links: CaseLink[];
  footnote: string;
  nextIdx: number;
  nextLabel: string;
}

export const caseStudies: CaseStudy[] = [
  {
    idx: "01",
    tags: "FASTAPI · ASYNC · DISTRIBUTED LLM",
    title: "CERAS",
    sub: "Cognitive Efficiency & Reasoning Alignment System",
    meta: [
      { k: "ROLE", v: "Architect & sole engineer" },
      { k: "STACK", v: "FastAPI · React · Async Python · Distributed LLM routing" },
      { k: "CORE", v: "Tree-of-Thoughts engine — built from scratch" },
      { k: "SIGNAL", v: "CE score — per-user cognitive adaptation" },
    ],
    problem:
      "Ask a language model a hard question and it answers in one breath — no plan, no self-check, no memory of how you think. CERAS treats reasoning as a system instead: plan the task, branch the possibilities, verify every path, and keep only what survives.",
    flowTitle: "ONE QUERY, END TO END",
    flow: [
      { s: "QUERY", d: "The prompt lands. Telemetry starts recording — latency, depth, and the user's CE profile." },
      { s: "PLAN", d: "A multi-stage planner decomposes the task; decomposition depth adapts to the user's CE score." },
      { s: "BRANCH", d: "The Tree-of-Thoughts engine expands candidate reasoning paths in parallel, on async pipelines." },
      { s: "VERIFY", d: "Validation gates score every path — verification-based checks, not majority voting." },
      { s: "SELECT", d: "Greedy path selection keeps the strongest verified chain. Everything else is pruned." },
      { s: "RESPOND", d: "The surviving path is synthesized into the answer; its telemetry feeds the next CE update." },
    ],
    decisions: [
      {
        n: "I",
        t: "Build Tree-of-Thoughts from scratch",
        b: "Frameworks hide scoring and pruning behind abstractions. Owning the tree meant owning the search — custom expansion, custom verification, greedy selection tuned to real workloads.",
      },
      {
        n: "II",
        t: "Route models dynamically",
        b: "Branching is cheap thinking; synthesis is expensive thinking. Async pipelines route each stage to the right model instead of paying flagship prices for every token.",
      },
      {
        n: "III",
        t: "Verify, don't vote",
        b: "Self-consistency asks the model to agree with itself. CERAS validates each path against explicit checks instead — a wrong answer stays wrong no matter how confidently it repeats.",
      },
      {
        n: "IV",
        t: "Adapt to the human",
        b: "Telemetry becomes a Cognitive Efficiency score per user, and the planner reshapes task decomposition around it. The system learns how you think, not just what you asked.",
      },
    ],
    outcomes: [
      { v: "4", l: "REASONING STAGES — PLAN · BRANCH · VERIFY · SELECT" },
      { v: "Async", l: "PIPELINES WITH DYNAMIC MODEL ROUTING" },
      { v: "CE", l: "PER-USER COGNITIVE EFFICIENCY ADAPTATION" },
    ],
    links: [
      { label: "LIVE — CERAS", href: LINKS.cerasLive },
      { label: "GITHUB", href: LINKS.cerasRepo },
    ],
    footnote: "THE ORBITING TREE IN SECTION 03 IS THIS ENGINE.",
    nextIdx: 1,
    nextLabel: "Cyclone Intensity",
  },
  {
    idx: "02",
    tags: "PYTHON · SCALABLE ML · IEEE",
    title: "Cyclone Intensity",
    sub: "Intensity prediction at scale — published with IEEE",
    meta: [
      { k: "CONTEXT", v: "IEEE — ICCMC 2025, published research" },
      { k: "SCALE", v: "1,000,000+ atmospheric data points — ERA5" },
      { k: "STACK", v: "Python · Scalable ML · Feature engineering" },
      { k: "RESULT", v: "R² 0.993 — error below every baseline" },
    ],
    problem:
      "A million-plus atmospheric records, and baselines that flattened exactly the storms that mattered most. The work was never the model — it was building a pipeline rigorous enough to let the model actually see.",
    flowTitle: "A MILLION ROWS, FIVE STAGES",
    flow: [
      { s: "INGEST", d: "A million-plus records land raw — gaps, sensor noise, and storms of every scale mixed together." },
      { s: "CLEAN", d: "Outlier handling, imputation, leakage checks — the unglamorous work that decides everything downstream." },
      { s: "ENGINEER", d: "Features built from the domain's structure. This stage moved the metric more than any model swap." },
      { s: "TRAIN", d: "Optimized learning workflows, tuned systematically rather than by folklore." },
      { s: "EVALUATE", d: "R² of 0.993 — and prediction error below every baseline it was measured against." },
    ],
    decisions: [
      {
        n: "I",
        t: "Features over parameters",
        b: "When the model plateaued, the answer wasn't a bigger model — it was better features. Domain-driven engineering carried the metric further than any architecture change.",
      },
      {
        n: "II",
        t: "A pipeline, not a notebook",
        b: 'Every stage re-runnable and testable in isolation. At a million-plus rows, "run it again" has to be cheap — or iteration stops.',
      },
      {
        n: "III",
        t: "Measure against everything",
        b: "The result only counts if it beats every baseline on the same split, under the same protocol. It did.",
      },
    ],
    outcomes: [
      { v: "0.993", l: "R² — COEFFICIENT OF DETERMINATION" },
      { v: "1M+", l: "DATA POINTS THROUGH THE PIPELINE" },
      { v: "IEEE", l: "ICCMC 2025 — DOI 10.1109/ICCMC65190.2025.11140783" },
    ],
    links: [
      { label: "PAPER — DOI", href: LINKS.cycloneDoi },
      { label: "GITHUB", href: LINKS.cycloneRepo },
    ],
    footnote: "SCALABLE ML — BUILT TO BE RE-RUN, NOT JUST RUN.",
    nextIdx: 2,
    nextLabel: "GenAI Chatbot",
  },
  {
    idx: "03",
    tags: "LLAMA · ETL · PEFT",
    title: "GenAI Chatbot",
    sub: "CPU-optimized LLM inference — Intel Unnati",
    meta: [
      { k: "CONTEXT", v: "Intel Unnati — industrial training" },
      { k: "CONSTRAINT", v: "CPU-only inference — no GPU anywhere" },
      { k: "STACK", v: "LLaMA · Intel Extension for Transformers · PEFT" },
      { k: "WORKLOAD", v: "Long-running summarization" },
    ],
    problem:
      "Run a large language model with no GPU in the building. The constraint sounds like a limitation — it's actually a deployment story: if inference holds on commodity CPUs, it can run anywhere.",
    flowTitle: "DOCUMENT IN, SUMMARY OUT — NO GPU",
    flow: [
      { s: "ETL", d: "Raw documents become clean training and inference data — extraction, transformation, loading, repeatable." },
      { s: "TOKENIZE", d: "Text becomes tensors; context budgets managed carefully for long documents." },
      { s: "BATCH", d: "Requests grouped to keep every CPU core busy — throughput without a GPU in sight." },
      { s: "INFER", d: "LLaMA runs through Intel Extension for Transformers, optimized for commodity hardware." },
      { s: "DELIVER", d: "Long-running summarization workloads complete end to end, reliably." },
    ],
    decisions: [
      {
        n: "I",
        t: "CPU-first, by design",
        b: "Treat the missing GPU as the spec, not the excuse. Intel Extension for Transformers made LLaMA viable on hardware every organization already owns.",
      },
      {
        n: "II",
        t: "PEFT over full fine-tuning",
        b: "Parameter-efficient fine-tuning fits the compute budget without giving up task quality — the whole model doesn't move, only what needs to.",
      },
      {
        n: "III",
        t: "Batch for throughput",
        b: "Long summarization jobs scheduled to saturate cores. Latency per document matters less than documents per hour.",
      },
    ],
    outcomes: [
      { v: "CPU", l: "ONLY — NO GPU IN THE PIPELINE" },
      { v: "E2E", l: "ETL → TOKENIZE → BATCH → INFER" },
      { v: "LLaMA", l: "VIA INTEL EXTENSION FOR TRANSFORMERS" },
    ],
    links: [{ label: "GITHUB", href: LINKS.chatbotRepo }],
    footnote: "INTEL UNNATI INDUSTRIAL TRAINING — COMPLETED.",
    nextIdx: 0,
    nextLabel: "CERAS",
  },
];

const ascentRaw = [
  { rank: "Top 200", event: "Amazon ML Challenge", year: "2025", tag: "ML AT SCALE" },
  { rank: "27th", event: "Zindi African Air-Quality Prediction", year: "2024", tag: "APPLIED ML — CONTINENTAL" },
  { rank: "77th", event: "ICPC Asia Regional — Tehran", year: "2024", tag: "WORLD-STAGE ALGORITHMICS" },
  { rank: "2nd", event: "IIT BHU Vista Codefest — ML Hackathon", year: "2024", tag: "FIRST PODIUM IN CODE" },
  { rank: "3rd seed", event: "World Soft Tennis Championships — representing India", year: "SUNCHEON", tag: "WORLD STAGE — INDIA COLOURS" },
  { rank: "Gold", event: "Senior Nationals — Lawn Tennis", year: "2019", tag: "NATIONAL CHAMPION" },
  { rank: "Gold", event: "CBSE North Zone Clusters", year: "—", tag: "ZONAL GOLD" },
  { rank: "Silver + Bronze", event: "Junior Nationals", year: "2018", tag: "TWO NATIONAL MEDALS" },
  { rank: "14th", event: "Asian Junior U14 Ranking Tournament", year: "—", tag: "CONTINENTAL CIRCUIT" },
  { rank: "Bronze", event: "SGFI Nationals", year: "2017", tag: "SCHOOL GAMES FEDERATION" },
  { rank: "Bronze", event: "Sub-Junior Nationals", year: "2017", tag: "WHERE THE CLIMB BEGAN" },
];

/** Staircase rows, indented so 2025 sits at the summit. */
export const ascent = ascentRaw.map((r, i, a) => ({
  ...r,
  indent: `${((a.length - 1 - i) * 2.4).toFixed(1)}vw`,
  rd: i % 3,
}));

export const publications = [
  {
    label: "IEEE — ICCMC 2025",
    title: "Cyclone Intensity Prediction using ERA5",
    href: LINKS.cycloneDoi,
  },
  {
    label: "CRC PRESS — BOOK CHAPTER",
    title: "Smart Hotel Automation System",
    href: LINKS.hotelDoi,
  },
];

export const firstCourtStats = [
  { big: "3rd seed — India", accent: true, small: "WORLD SOFT TENNIS CHAMPIONSHIPS — SUNCHEON, KOREA" },
  { big: "No. 14 — Asia", accent: false, small: "ASIAN JUNIOR U14 RANKING TOURNAMENT" },
  { big: "Gold — Nationals", accent: false, small: "SENIOR NATIONALS 2019 · CBSE NORTH ZONE CLUSTERS" },
  { big: "Sportsperson of the Year", accent: false, small: "CONSECUTIVE YEARS — JUNIOR & SENIOR CATEGORY" },
];
