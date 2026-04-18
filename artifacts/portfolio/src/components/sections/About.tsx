import { motion } from "framer-motion";
import { Brain, Server, FlaskConical } from "lucide-react";
import { Pensieve } from "@/wizarding/Pensieve";
import { HorcruxInk } from "@/wizarding/HorcruxInk";

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
            <h2 className="section-title text-3xl md:text-4xl font-bold text-foreground">About Me</h2>
            <div className="section-divider h-px bg-border flex-grow max-w-xs"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6 text-lg text-muted-foreground leading-relaxed text-justify">
              <p>
                I am a Computer Science undergraduate who likes building high-leverage systems at the intersection of{" "}
                <span className="text-primary font-medium">artificial intelligence</span>,{" "}
                <span className="text-highlight font-medium">reasoning engines</span>, and{" "}
                <span className="text-secondary font-medium">backend architecture</span>. I care most about taking strong ideas from paper and turning them into reliable, measurable software that reads like an engineer&apos;s{" "}
                <HorcruxInk id="about">diary</HorcruxInk> once it ships to production.
              </p>
              <p>
                Most of my work is centered around one question:{" "}
                <span className="text-foreground font-medium">"How do we make intelligent systems dependable at scale?"</span>{" "}
                That means working across the full stack, from model behavior and evaluation loops to async backends, observability, and API layers that expose intelligence safely and consistently.
              </p>
              <p>
                Recently, this has included building CERAS, a reasoning alignment framework with telemetry-backed evaluation, failure-mode tracking, and iterative guardrails for model reliability. In parallel, I have contributed to research in probabilistic machine learning and Bayesian inference, with a focus on uncertainty-aware decision making in real-world settings.
              </p>
              <p>
                I enjoy solving problems where clean architecture, mathematical rigor, and product thinking meet. Whether I am designing a reasoning pipeline, shipping a backend service, or testing alignment strategies, my goal is the same: build intelligent systems that are not only capable, but trustworthy.
              </p>
              <div className="p-4 border-l-2 border-primary bg-primary/5 rounded-r-lg text-foreground mt-6">
                Selected for a research internship at{" "}
                <strong className="text-primary">Indian Institute of Science (IISc) Bangalore</strong>, where I worked on probabilistic machine learning and Bayesian inference methods with a focus on uncertainty-aware decision making.
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

              <Pensieve>
                <div className="mt-6 p-5 rounded-xl border border-border bg-card/50">
                <p className="text-sm font-mono text-muted-foreground mb-3">&gt; quick_stats</p>
                  <div className="pensieve-rows space-y-2 text-sm font-mono">
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
              </Pensieve>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
