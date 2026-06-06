import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";

interface CountUpOptions {
  duration?: number;
  decimals?: number;
}

/**
 * Animates a number from 0 to `end` once the element scrolls into view.
 * Returns a ref to attach to the display element and the current display string.
 */
export function useCountUp(end: number, options: CountUpOptions = {}) {
  const { duration = 1600, decimals = 0 } = options;
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reduced) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;

          const startTime = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setValue(end * eased);
            if (progress < 1) requestAnimationFrame(tick);
            else setValue(end);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration, reduced]);

  const display = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return { ref, display };
}
