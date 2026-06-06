import { motion } from "framer-motion";
import { Brain, Server, FlaskConical } from "lucide-react";
import { SectionHeading } from "@/components/modern/SectionHeading";
import { GlassCard } from "@/components/modern/GlassCard";

const highlights = [
  {
    icon: <Brain className="h-5 w-5 text-indigo-400" />,
    label: "AI / ML Focus",
    desc: "Reasoning systems, probabilistic ML, LLM pipelines",
  },
  {
    icon: <Server className="h-5 w-5 text-cyan-400" />,
    label: "Backend Engineering",
    desc: "FastAPI, async architecture, distributed systems",
  },
  {
    icon: <FlaskConical className="h-5 w-5 text-violet-400" />,
    label: "Research",
    desc: "Bayesian inference, uncertainty modeling at IISc Bangalore",
  },
];

const quickStats = [
  ["institution", "SRMIST"],
  ["degree", "B.Tech CSE"],
  ["cgpa", "9.79 / 10"],
  ["batch", "2022 – 2026"],
];

export function AboutModern() {
  return (
    <section id="about" className="cv-auto relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="01" title="About" accent="Me" />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <GlassCard tilt={false} className="space-y-5 p-7 text-lg leading-relaxed text-muted-foreground md:p-9">
              <p>
                I&apos;m a Computer Science undergraduate who likes building high-leverage systems at the
                intersection of <span className="font-medium text-indigo-400">artificial intelligence</span>,{" "}
                <span className="font-medium text-violet-400">reasoning engines</span>, and{" "}
                <span className="font-medium text-cyan-400">backend architecture</span>. I care most about
                taking strong ideas from paper and turning them into reliable, measurable software once it
                ships to production.
              </p>
              <p>
                Most of my work circles one question:{" "}
                <span className="font-medium text-foreground">
                  &ldquo;How do we make intelligent systems dependable at scale?&rdquo;
                </span>{" "}
                That means working across the full stack — from model behavior and evaluation loops to async
                backends, observability, and API layers that expose intelligence safely.
              </p>
              <p>
                Recently that&apos;s meant building CERAS — a reasoning-alignment framework with
                telemetry-backed evaluation, failure-mode tracking, and iterative guardrails — alongside
                research in probabilistic ML and Bayesian inference for uncertainty-aware decision making.
              </p>
              <div className="rounded-2xl border-l-2 border-indigo-400 bg-indigo-500/5 p-4 text-base text-foreground">
                Selected for a research internship at{" "}
                <strong className="text-indigo-400">Indian Institute of Science (IISc) Bangalore</strong>,
                working on probabilistic machine learning and Bayesian inference for uncertainty-aware decision
                making.
              </div>
            </GlassCard>
          </motion.div>

          <div className="space-y-4 lg:col-span-5">
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="flex items-start gap-4 p-5" tiltMax={6}>
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl glass">
                    {h.icon}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-foreground">{h.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{h.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GlassCard tilt={false} className="p-5">
                <p className="mb-3 font-mono text-sm text-muted-foreground">&gt; quick_stats</p>
                <div className="space-y-2 font-mono text-sm">
                  {quickStats.map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span className={k === "cgpa" ? "font-bold text-indigo-400" : "text-foreground"}>{v}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
