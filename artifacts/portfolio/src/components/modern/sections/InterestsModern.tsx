import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, UtensilsCrossed, Code2, BrainCog, Compass, RotateCw } from "lucide-react";
import { SectionHeading } from "@/components/modern/SectionHeading";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";

/**
 * Section 07 — "Off the Clock", the 3D moment of the page.
 *
 * Every card is a real 3D object: it floats idly in space (gentle y-drift with
 * its own phase), enters with a perspective flip-up, and turns over in 3D on
 * hover/tap to reveal a playful back face with its own looping animation
 * (bouncing tennis ball, plane on a lap, rising steam, live typing, thinking
 * dots, spinning compass). Behind the whole section, the WebGL journey galaxy
 * sweeps centre-stage (see journey/stages.ts @0.86) — so the section reads as
 * one continuous 3D scene, DOM and WebGL together.
 */

interface Interest {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  back: {
    label: string;
    line: string;
    quirk: "think" | "serve" | "fly" | "steam" | "type" | "spin";
  };
  span?: string;
}

const interests: Interest[] = [
  {
    icon: <BrainCog className="h-6 w-6 text-indigo-400" />,
    title: "Tinkering with AI",
    blurb:
      "Weekends disappear into half-baked agents, tiny models, and “what if I just try this…” experiments.",
    back: {
      label: "current obsession",
      line: "Agents that plan before they act — and admit when they don't know.",
      quirk: "think",
    },
    span: "md:col-span-2",
  },
  {
    icon: <span aria-hidden="true" className="tennis-ball-icon" />,
    title: "Tennis",
    blurb: "Former Indian tennis player. Still chasing aces — now mostly against a backboard.",
    back: {
      label: "career stat",
      line: "Aces served: countless. Rallies lost to a wall: also countless.",
      quirk: "serve",
    },
  },
  {
    icon: <Plane className="h-6 w-6 text-cyan-400" />,
    title: "Travel",
    blurb: "New cities, new context-switches. The best debugging happens far from the desk.",
    back: {
      label: "boarding pass",
      line: "Cities collected and counting. Window seat, always.",
      quirk: "fly",
    },
  },
  {
    icon: <UtensilsCrossed className="h-6 w-6 text-pink-400" />,
    title: "Food",
    blurb: "Will optimize a pipeline and a plate of biryani with equal seriousness.",
    back: {
      label: "benchmark",
      line: "Biryani evaluation protocol: rigorous, repeatable, delicious.",
      quirk: "steam",
    },
    span: "md:col-span-2",
  },
  {
    icon: <Code2 className="h-6 w-6 text-violet-400" />,
    title: "Coding for fun",
    blurb: "Side projects, CP grind, and the occasional rabbit hole that ships nothing — and that's fine.",
    back: {
      label: "runtime",
      line: "",
      quirk: "type",
    },
  },
  {
    icon: <Compass className="h-6 w-6 text-emerald-400" />,
    title: "Exploring everything",
    blurb: "Not afraid to try new things. Curiosity first, mastery later, goofiness always.",
    back: {
      label: "heading",
      line: "Next destination: everything. ETA: eventually.",
      quirk: "spin",
    },
  },
];

const marqueeTop = [
  "build · break · learn · repeat",
  "ace energy",
  "biryani-driven development",
  "Bayesian by day",
  "always one more side project",
];

const marqueeBottom = [
  "collecting cities",
  "ToT > brute force",
  "curiosity > comfort",
  "serve. rally. ship.",
  "sleep is a hyperparameter",
];

/** Looping decorative animation on the back face (visible only when flipped). */
function BackQuirk({ quirk }: { quirk: Interest["back"]["quirk"] }) {
  switch (quirk) {
    case "serve":
      return <span aria-hidden="true" className="flip-quirk-ball" />;
    case "fly":
      return (
        <span aria-hidden="true" className="flip-quirk-plane">
          <Plane className="h-5 w-5" />
        </span>
      );
    case "steam":
      return (
        <span aria-hidden="true" className="flip-quirk-steam">
          <i />
          <i />
          <i />
        </span>
      );
    case "type":
      return (
        <span aria-hidden="true" className="flip-quirk-type font-mono">
          while(alive)&#123; learn(); &#125;<span className="type-caret">▋</span>
        </span>
      );
    case "think":
      return (
        <span aria-hidden="true" className="flip-quirk-think">
          <i />
          <i />
          <i />
        </span>
      );
    case "spin":
      return (
        <span aria-hidden="true" className="flip-quirk-compass">
          <Compass className="h-8 w-8" />
        </span>
      );
    default:
      return null;
  }
}

function FlipCard({ item, index, reduced }: { item: Interest; index: number; reduced: boolean }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className={item.span ?? ""}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 60, rotateX: -32 }}
      whileInView={reduced ? { opacity: 1 } : { opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* idle 3D float — each card drifts on its own rhythm; whileInView so the
          loops only run when the section is on screen */}
      <motion.div
        className="h-full"
        whileInView={reduced ? undefined : { y: [0, -6, 0] }}
        viewport={{ margin: "-10%" }}
        transition={{
          duration: 4.5 + (index % 3) * 0.9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.55,
        }}
      >
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          aria-label={`${item.title} — flip card`}
          className={`flip-scene block h-full w-full text-left ${flipped ? "is-flipped" : ""}`}
        >
          <span className="flip-inner block h-full">
            {/* front */}
            <span className="flip-face flip-front glass-card block h-full p-6">
              <span className="icon-tile mb-4 grid h-12 w-12 place-items-center rounded-xl glass">
                {item.icon}
              </span>
              <span className="block text-lg font-semibold text-foreground">{item.title}</span>
              <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                {item.blurb}
              </span>
              <span className="flip-hint absolute bottom-4 right-4 text-muted-foreground/60">
                <RotateCw className="h-3.5 w-3.5" />
              </span>
            </span>
            {/* back */}
            <span className="flip-face flip-back glass-card block h-full p-6">
              <BackQuirk quirk={item.back.quirk} />
              <span className="block font-mono text-xs uppercase tracking-[0.25em] text-indigo-300">
                {item.back.label}
              </span>
              {item.back.line && (
                <span className="mt-3 block text-base font-medium leading-relaxed text-foreground">
                  {item.back.line}
                </span>
              )}
            </span>
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
}

export function InterestsModern() {
  const reduced = useReducedMotion();

  return (
    <section id="interests" className="cv-auto relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading index="07" title="Off the" accent="Clock" />

        <div className="swing-3d grid grid-cols-1 gap-5 md:grid-cols-3">
          {interests.map((item, i) => (
            <FlipCard key={item.title} item={item} index={i} reduced={reduced} />
          ))}
        </div>
      </div>

      {/* dual-direction personality marquee with soft edge fades */}
      <div className="marquee-band relative mt-14 border-y border-white/10 py-4">
        <div className="marquee">
          {[...marqueeTop, ...marqueeTop].map((m, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap font-mono text-sm text-muted-foreground">
              {m}
              <span className="text-indigo-400">✦</span>
            </span>
          ))}
        </div>
        <div className="marquee marquee--reverse mt-3">
          {[...marqueeBottom, ...marqueeBottom].map((m, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap font-mono text-sm text-muted-foreground">
              {m}
              <span className="text-cyan-400">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
