import { motion } from "framer-motion";
import { Plane, UtensilsCrossed, Code2, BrainCog, Compass } from "lucide-react";
import { SectionHeading } from "@/components/modern/SectionHeading";
import { GlassCard } from "@/components/modern/GlassCard";

const interests = [
  {
    icon: <BrainCog className="h-6 w-6 text-indigo-400" />,
    title: "Tinkering with AI",
    blurb: "Weekends disappear into half-baked agents, tiny models, and “what if I just try this…” experiments.",
    span: "md:col-span-2",
  },
  {
    icon: <span className="text-2xl leading-none">🎾</span>,
    title: "Tennis",
    blurb: "Former Indian tennis player. Still chasing aces — now mostly against a backboard.",
  },
  {
    icon: <Plane className="h-6 w-6 text-cyan-400" />,
    title: "Travel",
    blurb: "New cities, new context-switches. The best debugging happens far from the desk.",
  },
  {
    icon: <UtensilsCrossed className="h-6 w-6 text-pink-400" />,
    title: "Food",
    blurb: "Will optimize a pipeline and a plate of biryani with equal seriousness.",
    span: "md:col-span-2",
  },
  {
    icon: <Code2 className="h-6 w-6 text-violet-400" />,
    title: "Coding for fun",
    blurb: "Side projects, CP grind, and the occasional rabbit hole that ships nothing — and that's fine.",
  },
  {
    icon: <Compass className="h-6 w-6 text-emerald-400" />,
    title: "Exploring everything",
    blurb: "Not afraid to try new things. Curiosity first, mastery later, goofiness always.",
  },
];

const marquee = [
  "build · break · learn · repeat",
  "🎾 ace energy",
  "biryani-driven development",
  "Bayesian by day",
  "always one more side project",
  "✈️ collecting cities",
  "ToT > brute force",
  "curiosity > comfort",
];

export function InterestsModern() {
  return (
    <section id="interests" className="cv-auto relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="07" title="Off the" accent="Clock" />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {interests.map((item, i) => (
            <motion.div
              key={item.title}
              className={item.span ?? ""}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            >
              <GlassCard className="group h-full p-6" tiltMax={8}>
                <span className="icon-tile mb-4 grid h-12 w-12 place-items-center rounded-xl glass">{item.icon}</span>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.blurb}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* personality marquee */}
      <div className="relative mt-12 overflow-hidden border-y border-white/10 py-4">
        <div className="marquee">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap font-mono text-sm text-muted-foreground">
              {m}
              <span className="text-indigo-400">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
