import { motion } from "framer-motion";
import { Brain, Server, FlaskConical } from "lucide-react";

const highlights = [
  {
    icon: <Brain className="w-5 h-5 text-primary" />,
    label: "AI / ML Focus",
    desc: "Reasoning systems, probabilistic ML, LLM pipelines",
  },
  {
    icon: <Server className="w-5 h-5 text-secondary" />,
    label: "Backend Engineering",
    desc: "FastAPI, async architecture, distributed systems",
  },
  {
    icon: <FlaskConical className="w-5 h-5 text-highlight" />,
    label: "Research",
    desc: "Bayesian inference, uncertainty modeling at IISc Bangalore",
  },
];

export function About() {
  return (
    <section id="about" className="py-24 bg-secondary-bg/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">About Me</h2>
            <div className="h-px bg-border flex-grow max-w-xs"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                I'm a Computer Science undergraduate at SRM Institute of Science and Technology with a strong focus on{" "}
                <span className="text-primary font-medium">artificial intelligence</span>,{" "}
                <span className="text-highlight font-medium">reasoning systems</span>, and{" "}
                <span className="text-secondary font-medium">scalable backend engineering</span>.
              </p>
              <p>
                I build AI platforms that connect machine learning models with robust software infrastructure — ensuring models don't just live in research notebooks, but actually scale in production environments.
              </p>
              <p>
                My work spans reasoning-driven AI systems, LLM orchestration platforms, scalable ML pipelines, and probabilistic machine learning research.
              </p>
              <div className="p-4 border-l-2 border-primary bg-primary/5 rounded-r-lg text-foreground mt-6">
                I recently completed a research internship at the{" "}
                <strong className="text-primary">Indian Institute of Science (IISc) Bangalore</strong> — selected from a competitive cohort based on academic merit — where I worked on probabilistic machine learning and Bayesian inference methods.
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              {highlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card/50 hover:border-primary/40 hover:bg-card transition-all"
                >
                  <div className="p-2 rounded-lg bg-secondary-bg border border-border flex-shrink-0">
                    {h.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">{h.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{h.desc}</p>
                  </div>
                </motion.div>
              ))}

              <div className="mt-6 p-5 rounded-xl border border-border bg-card/50">
                <p className="text-sm font-mono text-muted-foreground mb-3">&gt; quick_stats</p>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">institution</span>
                    <span className="text-foreground">SRMIST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">degree</span>
                    <span className="text-foreground">B.Tech CSE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">cgpa</span>
                    <span className="text-primary font-bold">9.79 / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">batch</span>
                    <span className="text-foreground">2022 – 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
