import { motion } from "framer-motion";
import { Award, Trophy, Medal, Star, Code2 } from "lucide-react";
import { SectionHeading } from "@/components/modern/SectionHeading";
import { GlassCard } from "@/components/modern/GlassCard";

const achievements = [
  { icon: <Medal className="h-6 w-6 text-yellow-400" />, title: "2nd Place", subtitle: "IIT BHU Vista Codefest 2024" },
  { icon: <Trophy className="h-6 w-6 text-indigo-400" />, title: "Rank 77", subtitle: "ICPC Asia Regional" },
  { icon: <Award className="h-6 w-6 text-cyan-400" />, title: "Rank 27", subtitle: "Zindi Air Quality Challenge" },
  { icon: <Star className="h-6 w-6 text-violet-400" />, title: "Top 200", subtitle: "Amazon ML Challenge" },
  { icon: <Code2 className="h-6 w-6 text-emerald-400" />, title: "400+ Solved", subtitle: "DSA — Python, C++ & notebooks" },
];

export function AchievementsModern() {
  return (
    <section id="achievements" className="cv-auto relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="06" title="Awards &" accent="Honors" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {achievements.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <GlassCard className="group flex h-full flex-col items-center justify-center gap-4 p-6 text-center" tiltMax={9}>
                <span className="icon-tile grid h-14 w-14 place-items-center rounded-full glass">{a.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.subtitle}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
