import { lazy, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ChevronRight, GraduationCap, Microscope, Code2, Trophy } from "lucide-react";
import { GlassCard } from "@/components/modern/GlassCard";

// Code-split three.js: the WebGL scene loads as its own async chunk so it doesn't
// bloat the initial bundle (better LCP/TTI). The aurora background covers the gap.
const HeroScene = lazy(() =>
  import("@/components/modern/HeroScene").then((m) => ({ default: m.HeroScene })),
);
import { useCountUp } from "@/components/modern/hooks/useCountUp";
import { useMagnetic } from "@/components/modern/hooks/useMagnetic";
import { useTextScramble } from "@/components/modern/hooks/useTextScramble";

const TAGLINES = [
  "building reasoning engines",
  "serving aces 🎾",
  "shipping fast backends",
  "training models @ IISc",
  "chasing curiosity",
];

function LiveStatus() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      try {
        setTime(
          new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",
            hour12: true,
          }).format(new Date()),
        );
      } catch {
        setTime("");
      }
    };
    update();
    const id = window.setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="glass-chip conic-border inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono text-muted-foreground">
      <span className="status-dot" />
      Open to opportunities{time && <span className="text-foreground/70">· {time} IST</span>}
    </span>
  );
}

function MagneticButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "ghost";
}) {
  const mag = useMagnetic(0.25);
  const base =
    "group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-colors duration-300 will-change-transform";
  const styles =
    variant === "primary"
      ? "text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 shadow-[0_8px_30px_-6px_rgba(99,102,241,0.6)] hover:shadow-[0_12px_40px_-6px_rgba(99,102,241,0.8)]"
      : "glass text-foreground hover:border-white/30";
  return (
    <button
      ref={mag.ref as React.Ref<HTMLButtonElement>}
      onMouseMove={mag.onMouseMove}
      onMouseLeave={mag.onMouseLeave}
      onClick={onClick}
      className={`${base} ${styles}`}
    >
      {children}
    </button>
  );
}

type Stat =
  | { kind: "num"; icon: React.ReactNode; label: string; value: number; decimals?: number; prefix?: string; suffix?: string }
  | { kind: "text"; icon: React.ReactNode; label: string; text: string };

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const counter = useCountUp(stat.kind === "num" ? stat.value : 0, {
    decimals: stat.kind === "num" ? stat.decimals ?? 0 : 0,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
    >
      <GlassCard className="glass-blur h-full p-5" tiltMax={10}>
        <div className="flex flex-col items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl glass">{stat.icon}</span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              {stat.label}
            </p>
            {stat.kind === "num" ? (
              <p className="text-2xl font-bold font-mono text-foreground">
                {stat.prefix}
                <span ref={counter.ref as React.Ref<HTMLSpanElement>}>{counter.display}</span>
                {stat.suffix}
              </p>
            ) : (
              <p className="text-lg font-bold text-foreground">{stat.text}</p>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function HeroModern() {
  const scrambled = useTextScramble(TAGLINES);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const stats: Stat[] = [
    { kind: "num", icon: <GraduationCap className="h-5 w-5 text-indigo-400" />, label: "CGPA", value: 9.79, decimals: 2, suffix: " / 10" },
    { kind: "text", icon: <Microscope className="h-5 w-5 text-cyan-400" />, label: "Research", text: "IISc Bangalore" },
    { kind: "num", icon: <Code2 className="h-5 w-5 text-violet-400" />, label: "DSA Solved", value: 400, suffix: "+" },
    { kind: "num", icon: <Trophy className="h-5 w-5 text-pink-400" />, label: "ICPC Asia Regional", value: 77, prefix: "Rank " },
  ];

  return (
    <section id="home" className="relative min-h-screen overflow-hidden pt-24">
      {/* WebGL constellation (async chunk; aurora shows until it loads) */}
      <Suspense fallback={null}>
        <HeroScene className="pointer-events-none absolute inset-0 z-0 opacity-90" />
      </Suspense>
      {/* readability veil */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-background/10 via-transparent to-background/80" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[78vh] flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <LiveStatus />

            <h1 className="sheen mt-6 text-6xl font-extrabold tracking-tight text-foreground sm:text-8xl">
              Aman <span className="text-aurora">Goel.</span>
            </h1>

            <p className="mt-4 font-mono text-sm text-indigo-400 sm:text-base">
              <span className="text-muted-foreground">~ $ aman</span> --status{" "}
              <span className="text-foreground/90">{scrambled}</span>
              <span className="ml-0.5 inline-block w-2 animate-pulse">▋</span>
            </p>

            <div className="mt-5 h-16 sm:h-12">
              <motion.p
                className="text-2xl font-light text-muted-foreground sm:text-3xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.8 }}
              >
                <span className="font-medium text-foreground">Former Indian tennis player</span>{" "}
                who now <span className="text-aurora font-medium">rallies with</span>{" "}
                <span className="font-medium text-cyan-400">AI &amp; ML systems</span>.
              </motion.p>
            </div>

            <motion.p
              className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              I&apos;m a CS undergrad who builds real systems: reasoning engines, ML pipelines,
              and backends that stay fast under load. Recent work includes{" "}
              <span className="text-foreground font-medium">CERAS</span> — a cognitive efficiency
              &amp; reasoning alignment platform — and probabilistic-ML research at IISc Bangalore.
            </motion.p>

            <motion.div
              className="mt-9 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <MagneticButton onClick={() => window.open("https://ceras-frontend.onrender.com/", "_blank")}>
                Explore CERAS
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
              <MagneticButton variant="ghost" onClick={() => scrollTo("projects")}>
                View Projects
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <StatCard key={i} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => scrollTo("about")}
        aria-label="Scroll to about"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowDown className="h-6 w-6 animate-bounce" />
      </button>
    </section>
  );
}
