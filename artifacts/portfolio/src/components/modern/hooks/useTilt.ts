import { useCallback, useRef } from "react";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";

/**
 * Pointer-driven 3D tilt + liquid sheen, throttled to one update per animation frame
 * so a flood of mousemove events can't thrash style writes. Spread the handlers onto a
 * `.glass-card`. Writes --rx/--ry (rotation) and --mx/--my (sheen position).
 */
export function useTilt(maxDeg = 8) {
  const reduced = useReducedMotion();
  const frame = useRef(0);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduced) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      if (frame.current) return; // coalesce to one rAF
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const ry = (px - 0.5) * 2 * maxDeg;
        const rx = -(py - 0.5) * 2 * maxDeg;
        el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
        el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
        el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
      });
    },
    [maxDeg, reduced],
  );

  const onMouseLeave = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  return { onMouseMove, onMouseLeave };
}
