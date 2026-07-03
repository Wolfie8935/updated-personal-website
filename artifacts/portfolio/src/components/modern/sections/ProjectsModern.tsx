import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ExternalLink, Github, Terminal, Zap, FolderGit2 } from "lucide-react";
import { SectionHeading } from "@/components/modern/SectionHeading";
import { GlassCard } from "@/components/modern/GlassCard";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";

const GITHUB_REPOS = "https://github.com/Wolfie8935?tab=repositories";

interface Project {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  description: string;
  features: string[];
  tech: string[];
  demo?: string;
  github?: string;
  featured?: boolean;
}

const projects: Project[] = [
  {
    id: "ceras",
    title: "CERAS",
    subtitle: "Cognitive Efficiency & Reasoning Alignment System",
    tag: "Major Project",
    description:
      "Full-stack AI platform that evaluates and improves cognitive problem solving using a custom Tree-of-Thoughts engine, telemetry, and adaptive learning workflows.",
    features: [
      "Implemented Tree-of-Thoughts data structure from scratch with multi-stage planning and verification-based validation",
      "Designed greedy reasoning path selection to keep inference efficient while preserving answer quality",
      "Built asynchronous FastAPI backend pipelines with dynamic model routing and distributed LLM inference",
      "Captured request latency, processing time, and token usage as first-class telemetry",
      "Computed Cognitive Efficiency (CE) scores from telemetry to quantify reasoning performance",
      "Generated dynamic-programming-based subtask decomposition for adaptive learning workflows",
      "Deployed a React dashboard to monitor runs and reason over CE scores and reasoning traces",
    ],
    tech: ["FastAPI", "React", "Async Python", "LLM Pipelines", "Distributed inference"],
    demo: "https://ceras-frontend.onrender.com/",
    github: "https://github.com/Wolfie8935/CERAS-Cognitive-Efficiency-Reasoning-Alignment-System",
    featured: true,
  },
  {
    id: "cyclone",
    title: "Cyclone Intensity Prediction Pipeline",
    tag: "IEEE Published",
    description:
      "End-to-end ML pipeline predicting cyclone intensity on >1M meteorological data points, published at ICCMC 2025.",
    features: [
      "Processed and cleaned 1M+ spatio-temporal data points into a training-ready dataset",
      "Designed multi-stage feature engineering to capture temporal and atmospheric patterns",
      "Optimized training and inference workflows for reproducibility and faster experimentation",
      "Achieved R² score of 0.993, significantly reducing prediction error vs baseline models",
    ],
    tech: ["Python", "Scikit-Learn", "Pandas", "ERA5 Dataset", "Feature Engineering"],
    github: "https://github.com/Wolfie8935/Cyclone-Intensity-Prediction",
  },
  {
    id: "genai",
    title: "GenAI Chatbot",
    subtitle: "Intel Unnati",
    description:
      "LLM-powered chatbot built during Intel Unnati, focused on CPU-optimized inference and robust data → model → inference pipelines.",
    features: [
      "Engineered Python-based ETL pipelines to preprocess and transform large text datasets",
      "Integrated LLaMA-based models with Intel Extension for Transformers for efficient CPU inference",
      "Designed tokenization and batching workflows for long-running summarization tasks",
      "Stabilized long-running jobs by migrating to batch environments with better monitoring",
    ],
    tech: ["LLaMA", "Intel Extension for Transformers", "ETL", "PEFT", "Python"],
    github: "https://github.com/Wolfie8935/Intel-Unnati-GenAI-Chatbot",
  },
];

function LinkBtn({
  href,
  children,
  primary,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        primary
          ? "press inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.7)] transition-transform hover:-translate-y-0.5"
          : "press inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-white/30"
      }
    >
      {children}
    </a>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <GlassCard
      className={`flex h-full flex-col p-6 md:p-7 ${project.featured ? "conic-border glass-blur" : ""}`}
      tiltMax={project.featured ? 3 : 7}
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-xl glass">
          {project.featured ? (
            <Zap className="h-6 w-6 text-violet-400" />
          ) : (
            <Terminal className="h-5 w-5 text-muted-foreground" />
          )}
        </span>
        {project.tag && (
          <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            {project.tag}
          </span>
        )}
      </div>

      <h3 className={`font-bold text-foreground ${project.featured ? "text-2xl md:text-3xl" : "text-xl"}`}>
        {project.title}
      </h3>
      {project.subtitle && (
        <p className="mt-1 font-mono text-sm text-indigo-400">{project.subtitle}</p>
      )}

      <p className="mt-4 leading-relaxed text-muted-foreground">{project.description}</p>

      <div className="mt-5 flex-grow">
        <h4 className="mb-3 text-sm font-semibold text-foreground">Key Highlights</h4>
        <ul className={`grid gap-2 ${project.featured ? "sm:grid-cols-2" : "grid-cols-1"}`}>
          {project.features.map((f, i) => (
            <li key={i} className="flex items-start text-sm text-muted-foreground">
              <span className="mr-2 text-indigo-400">▹</span> {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        {project.tech.map((t) => (
          <span key={t} className="rounded bg-white/5 px-2 py-1 font-mono text-xs text-muted-foreground">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {project.demo && (
          <LinkBtn href={project.demo} primary>
            <ExternalLink className="h-4 w-4" /> Live Demo
          </LinkBtn>
        )}
        {project.github && (
          <LinkBtn href={project.github}>
            <Github className="h-4 w-4" /> GitHub
          </LinkBtn>
        )}
      </div>
    </GlassCard>
  );
}

/**
 * Normal vertical scroll — no scroll hijacking — but every card arrives with
 * a doorway-style 3D swing: it slides in from its own side of the page while
 * rotating flat from a slight Y-angle (perspective set in modern.css via
 * .swing-3d). Horizontal + vertical motion woven together, intuitively.
 */
export function ProjectsModern() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  // Gentle outer parallax: the whole grid drifts up as the section scrolls past,
  // adding depth over the fixed 3D journey without disturbing each card's reveal.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const gridY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [36, -36]);

  const swingFrom = (side: "left" | "right" | "up") =>
    reduced
      ? { opacity: 0 }
      : side === "up"
        ? { opacity: 0, y: 44, rotateX: 8 }
        : {
            opacity: 0,
            x: side === "left" ? -70 : 70,
            rotateY: side === "left" ? 14 : -14,
          };
  const swingTo = { opacity: 1, x: 0, y: 0, rotateX: 0, rotateY: 0 };

  return (
    <section ref={sectionRef} id="projects" className="cv-auto relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="04" title="Featured" accent="Projects" />

        <motion.div style={{ y: gridY }} className="swing-3d grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            className="md:col-span-2 lg:col-span-3"
            initial={swingFrom("up")}
            whileInView={swingTo}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProjectCard project={projects[0]} />
          </motion.div>

          <motion.div
            initial={swingFrom("left")}
            whileInView={swingTo}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProjectCard project={projects[1]} />
          </motion.div>

          <motion.div
            initial={swingFrom("up")}
            whileInView={swingTo}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <ProjectCard project={projects[2]} />
          </motion.div>

          <motion.div
            initial={swingFrom("right")}
            whileInView={swingTo}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <a href={GITHUB_REPOS} target="_blank" rel="noopener noreferrer" className="block h-full">
              <GlassCard className="flex min-h-[260px] h-full flex-col items-center justify-center gap-5 border-dashed p-8 text-center" tiltMax={7}>
                <span className="grid h-16 w-16 place-items-center rounded-2xl glass">
                  <FolderGit2 className="h-8 w-8 text-muted-foreground" />
                </span>
                <div>
                  <p className="text-lg font-semibold text-foreground">More Projects</p>
                  <p className="text-sm text-muted-foreground">Explore all repositories on GitHub</p>
                </div>
                <span className="flex items-center gap-2 text-sm font-medium text-indigo-400">
                  <Github className="h-4 w-4" /> github.com/Wolfie8935 <ExternalLink className="h-3 w-3" />
                </span>
              </GlassCard>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
