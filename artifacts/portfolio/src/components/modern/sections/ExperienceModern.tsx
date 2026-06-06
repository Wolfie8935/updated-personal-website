import { motion } from "framer-motion";
import { Building2, Calendar, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/modern/SectionHeading";
import { GlassCard } from "@/components/modern/GlassCard";

const experiences = [
  {
    title: "Research Intern",
    company: "Indian Institute of Science (IISc)",
    location: "Bangalore",
    date: "June 2025 – July 2025",
    featured: true,
    bullets: [
      "Implemented Bayesian inference algorithms in Python, translating mathematical formulations into efficient code.",
      "Built modular experimentation chains for posterior estimation, sampling, and evaluation.",
      "Worked on probabilistic machine learning frameworks involving uncertainty modeling and inference.",
      "Optimized numerical computations using vectorized operations to improve scalability.",
    ],
  },
  {
    title: "Industrial Trainee",
    company: "Intel Unnati",
    location: "Remote",
    date: "May 2024 – July 2024",
    featured: false,
    bullets: [
      "Developed ETL pipelines for preprocessing large text datasets used for LLM fine-tuning.",
      "Integrated LLaMA models using Intel Extension for Transformers for efficient CPU-based inference.",
      "Designed end-to-end data-to-model inference workflows.",
      "Improved execution stability for long-running ML workflows.",
    ],
  },
];

export function ExperienceModern() {
  return (
    <section id="experience" className="cv-auto relative py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="03" title="Experience" />

        <div className="relative ml-3 space-y-10 border-l border-white/10 md:ml-6">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.title}
              className="relative pl-8 md:pl-12"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <span
                className={`absolute left-[-6px] top-3 h-3 w-3 rounded-full border-2 ${
                  exp.featured
                    ? "border-indigo-400 bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.9)]"
                    : "border-muted-foreground bg-background"
                }`}
              />
              <GlassCard className="p-6 md:p-7" tiltMax={5}>
                {exp.featured && (
                  <span className="mb-4 inline-block rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                    Featured Experience
                  </span>
                )}
                <h3 className="text-2xl font-bold text-foreground">{exp.title}</h3>
                <div className="mt-2 mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                    <Building2 size={15} /> {exp.company}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} /> {exp.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> {exp.date}
                  </span>
                </div>
                <ul className="space-y-3">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="flex items-start text-[15px] leading-relaxed text-muted-foreground">
                      <span className="mr-3 mt-2 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400/60" />
                      {b}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
