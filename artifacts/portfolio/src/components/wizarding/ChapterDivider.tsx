import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import "./wizarding.css";

type ChapterDividerProps = {
  symbol?: string;
  className?: string;
  symbolClassName?: string;
  once?: boolean;
};

export function ChapterDivider({
  symbol = "✶",
  className,
  symbolClassName,
  once = true,
}: ChapterDividerProps) {
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(dividerRef, { once, amount: 0.6 });

  return (
    <div className={cn("wizarding-chapter-divider", className)} ref={dividerRef}>
      <motion.span
        className="wizarding-chapter-line"
        initial={{ scaleX: 0, opacity: 0.2 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0.2 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />

      <motion.span
        aria-hidden
        className={cn("wizarding-chapter-symbol", symbolClassName)}
        initial={{ rotate: 0, scale: 0.82, opacity: 0.2 }}
        animate={
          inView
            ? { rotate: 360, scale: 1, opacity: 1 }
            : { rotate: 0, scale: 0.82, opacity: 0.2 }
        }
        transition={{ duration: 0.75, ease: "easeOut" }}
      >
        {symbol}
      </motion.span>

      <motion.span
        className="wizarding-chapter-line"
        initial={{ scaleX: 0, opacity: 0.2 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0.2 }}
        transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
      />
    </div>
  );
}
