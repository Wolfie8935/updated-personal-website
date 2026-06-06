import { motion } from "framer-motion";
import { Code, Cpu, Database, Cloud, BrainCircuit, FlaskConical } from "lucide-react";
import { SectionHeading } from "@/components/modern/SectionHeading";
import { GlassCard } from "@/components/modern/GlassCard";

const skillCategories = [
  {
    title: "Programming Languages",
    icon: <Code className="h-5 w-5 text-indigo-400" />,
    skills: ["Python", "C++", "Java", "JavaScript"],
  },
  {
    title: "Core Computer Science",
    icon: <Cpu className="h-5 w-5 text-violet-400" />,
    skills: [
      "Data Structures & Algorithms",
      "Dynamic Programming",
      "Graphs",
      "Trees",
      "Greedy Algorithms",
      "Backtracking",
      "Object Oriented Design",
      "Complexity Analysis",
    ],
  },
  {
    title: "Backend Engineering",
    icon: <Database className="h-5 w-5 text-cyan-400" />,
    skills: [
      "FastAPI",
      "REST API Design",
      "Asynchronous Programming",
      "Modular Architecture",
      "Algorithm Optimization",
      "System Design",
      "Distributed Systems",
      "API Lifecycle Management",
      "SDLC",
    ],
  },
  {
    title: "Cloud & DevOps",
    icon: <Cloud className="h-5 w-5 text-sky-400" />,
    skills: [
      "AWS (EC2, S3, Lambda, RDS, SageMaker)",
      "Docker",
      "Jenkins",
      "CI/CD",
      "Git & GitHub",
      "Version Control",
      "SQL",
      "NoSQL",
    ],
  },
  {
    title: "Machine Learning & AI",
    icon: <BrainCircuit className="h-5 w-5 text-emerald-400" />,
    skills: [
      "Machine Learning",
      "Deep Learning",
      "Neural Networks",
      "Few-shot Calibration",
      "Natural Language Processing",
      "Bayesian Estimation",
      "Probabilistic Modeling",
      "Statistical ML",
      "PyTorch",
      "TensorFlow",
      "Keras",
      "NumPy",
      "Pandas",
    ],
  },
  {
    title: "Research & Probabilistic Methods",
    icon: <FlaskConical className="h-5 w-5 text-pink-400" />,
    skills: [
      "Bayesian Inference",
      "Gibbs Sampling",
      "Variational Inference",
      "Laplace Approximation",
      "Monte Carlo Methods",
      "Uncertainty Quantification",
      "Posterior Estimation",
      "PEFT Fine-tuning",
    ],
  },
];

export function SkillsModern() {
  return (
    <section id="skills" className="cv-auto relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="02" title="Technical" accent="Arsenal" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((category, i) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            >
              <GlassCard className="group h-full p-6" tiltMax={7}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="icon-tile grid h-10 w-10 place-items-center rounded-xl glass">{category.icon}</span>
                  <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-muted-foreground transition-colors group-hover:border-white/15"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
