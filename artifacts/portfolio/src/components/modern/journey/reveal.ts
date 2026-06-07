import type { Variants } from "framer-motion";

/**
 * Shared, restrained scroll-reveal used across the modern sections so every
 * section enters with the same rhythm as the 3D journey rather than ad-hoc
 * one-off animations. Rises + fades, with staggered children.
 *
 * Usage:
 *   <motion.div variants={revealContainer} initial="hidden" whileInView="show"
 *               viewport={{ once: true, margin: "-80px" }}>
 *     <motion.div variants={revealItem}>…</motion.div>
 *   </motion.div>
 */
export const revealContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};
