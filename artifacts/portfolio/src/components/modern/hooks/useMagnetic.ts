import { useCallback, useRef } from "react";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";

/**
 * Magnetic hover: the element gently follows the cursor, then springs back on leave.
 * rAF-throttled so rapid pointer moves don't thrash layout/style. Returns a ref plus
 * handlers to spread onto a button or link.
 */
export function useMagnetic(strength = 0.35) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const frame = useRef(0);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduced) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) * strength;
      const y = (e.clientY - (rect.top + rect.height / 2)) * strength;

      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
    },
    [strength, reduced],
  );

  const onMouseLeave = useCallback(() => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    const el = ref.current;
    if (el) el.style.transform = "translate(0px, 0px)";
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
