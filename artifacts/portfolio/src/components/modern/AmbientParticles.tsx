import { useMemo } from "react";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";

/**
 * Drifting ambient "fireflies" behind the content — subtle living texture for both themes.
 * Pure CSS animation; renders nothing under prefers-reduced-motion.
 */
export function AmbientParticles({ count = 11 }: { count?: number }) {
  const reduced = useReducedMotion();

  const flies = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        dx: (Math.random() - 0.5) * 120,
        dy: -(Math.random() * 120 + 30),
        dur: Math.random() * 12 + 12,
        delay: Math.random() * 14,
        scale: Math.random() * 0.8 + 0.6,
      })),
    [count],
  );

  if (reduced) return null;

  return (
    <div className="fireflies" aria-hidden="true">
      {flies.map((f, i) => (
        <span
          key={i}
          className="firefly"
          style={
            {
              left: `${f.left}%`,
              top: `${f.top}%`,
              transform: `scale(${f.scale})`,
              "--dx": `${f.dx}px`,
              "--dy": `${f.dy}px`,
              "--dur": `${f.dur}s`,
              "--delay": `${f.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
