import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Shared modern section heading: a mono eyebrow index, an aurora-accented title,
 * and a gradient divider rule. Animates in on scroll.
 */
export function SectionHeading({
  index,
  title,
  accent,
  align = "left",
  className,
}: {
  index: string;
  title: string;
  /** trailing word rendered with the aurora gradient */
  accent?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={cn(
        "mb-12 flex items-center gap-4",
        align === "center" && "flex-col text-center",
        className,
      )}
    >
      <div className={cn("flex items-baseline gap-3", align === "center" && "justify-center")}>
        <span className="font-mono text-sm text-indigo-400/80">{index}</span>
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {title.split(" ").map((word, i) => (
            <span key={i} className="word-reveal">
              <motion.span
                initial={{ y: "110%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}&nbsp;
              </motion.span>
            </span>
          ))}
          {accent && (
            <span className="word-reveal">
              <motion.span
                className="text-aurora"
                initial={{ y: "110%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.1 + title.split(" ").length * 0.07,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {accent}
              </motion.span>
            </span>
          )}
        </h2>
      </div>
      {align === "left" && (
        <div className="h-px max-w-xs flex-grow bg-gradient-to-r from-indigo-500/50 via-cyan-400/30 to-transparent" />
      )}
    </motion.div>
  );
}
