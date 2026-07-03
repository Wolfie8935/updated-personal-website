import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";

/**
 * StatementInterlude — an Apple-style scroll-scrubbed statement.
 *
 * A short, huge line of display type between sections. Each word is tied to
 * scroll progress: as the statement passes through the viewport the words
 * ignite one by one (opacity + lift + un-blur), so reading speed is literally
 * scroll speed. Words marked `accent` get the aurora gradient.
 *
 * Pure dark/light (modern) component — never mounted in the wizarding theme.
 */

export interface StatementSegment {
  text: string;
  accent?: boolean;
}

function Word({
  children,
  progress,
  range,
  accent,
  reduced,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  accent?: boolean;
  reduced: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [18, 0]);
  const filter = useTransform(
    progress,
    range,
    ["blur(6px)", "blur(0px)"],
  );

  if (reduced) {
    return (
      <span className={accent ? "text-aurora" : undefined}>{children} </span>
    );
  }

  return (
    <motion.span
      style={{ opacity, y, filter }}
      className={`inline-block will-change-transform ${accent ? "text-aurora" : ""}`}
    >
      {children}&nbsp;
    </motion.span>
  );
}

export function StatementInterlude({
  segments,
  kicker,
}: {
  segments: StatementSegment[];
  /** small mono eyebrow above the statement */
  kicker?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    // start igniting as the block enters, finish shortly after centre — the
    // line completes while it's the hero of the viewport, not after.
    offset: ["start 0.92", "start 0.35"],
  });

  // Flatten segments into words while remembering which are accented.
  const words = segments.flatMap((seg) =>
    seg.text.split(" ").filter(Boolean).map((w) => ({ w, accent: seg.accent })),
  );
  const step = 1 / words.length;

  return (
    <div ref={ref} className="relative mx-auto max-w-5xl px-6 py-28 sm:py-40 md:py-48">
      {kicker && (
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.3em] text-indigo-400/80">
          {kicker}
        </p>
      )}
      <p className="text-balance text-center text-4xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl md:text-6xl">
        {words.map(({ w, accent }, i) => (
          <Word
            key={`${w}-${i}`}
            progress={scrollYProgress}
            // overlapping ranges so the ignition flows like a wave
            range={[i * step * 0.9, i * step * 0.9 + step * 1.6]}
            accent={accent}
            reduced={reduced}
          >
            {w}
          </Word>
        ))}
      </p>
    </div>
  );
}
