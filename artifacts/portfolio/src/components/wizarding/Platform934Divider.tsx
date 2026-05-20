import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import "./Platform934Divider.css";

const ROWS = 4;
const BRICKS_PER_ROW = 14;

function WallHalf({ side }: { side: "left" | "right" }) {
  return (
    <div className={`p934-bricks p934-bricks--${side}`}>
      {Array.from({ length: ROWS }, (_, row) => (
        <div key={row} className={`p934-row${row % 2 === 1 ? " p934-row--offset" : ""}`}>
          {Array.from({ length: BRICKS_PER_ROW }, (_, i) => (
            <span key={i} className={`p934-brick p934-brick--v${(row * 3 + i) % 4}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Platform934Divider({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });

  return (
    <div className={`p934-divider ${className}`} ref={ref} aria-hidden>
      {/* Left brick wall half */}
      <motion.div
        className="p934-half p934-half--left"
        initial={{ x: 0 }}
        animate={inView ? { x: "-100%" } : { x: 0 }}
        transition={{ duration: 0.7, ease: [0.42, 0, 0.18, 1], delay: 0.15 }}
      >
        <WallHalf side="left" />
      </motion.div>

      {/* Right brick wall half */}
      <motion.div
        className="p934-half p934-half--right"
        initial={{ x: 0 }}
        animate={inView ? { x: "100%" } : { x: 0 }}
        transition={{ duration: 0.7, ease: [0.42, 0, 0.18, 1], delay: 0.15 }}
      >
        <WallHalf side="right" />
      </motion.div>

      {/* Portal revealed at center seam */}
      <motion.div
        className="p934-portal"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={inView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.72 }}
      >
        <motion.span
          className="p934-label"
          initial={{ opacity: 0, y: 4 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
          transition={{ duration: 0.35, delay: 1.0 }}
        >
          9¾
        </motion.span>
      </motion.div>
    </div>
  );
}
