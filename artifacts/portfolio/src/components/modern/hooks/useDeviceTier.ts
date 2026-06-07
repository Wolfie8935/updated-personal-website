import { useEffect, useState } from "react";

export type DeviceTier = "high" | "low" | "static";

/**
 * Picks an experience tier for the modern theme's 3D journey.
 * - "static": user prefers reduced motion → single frame, native scroll.
 * - "low": coarse pointer / few cores / little memory / small viewport → lighter
 *   scene, no bloom, native scroll.
 * - "high": everything else → full scene, bloom, smooth scroll.
 *
 * Resolves once on mount (after a paint) and also listens for reduced-motion changes.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("static");

  useEffect(() => {
    const rmQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resolve = (): DeviceTier => {
      if (rmQuery.matches) return "static";
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const cores = navigator.hardwareConcurrency ?? 8;
      // deviceMemory is non-standard; default generously when absent.
      const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
      const small = window.innerWidth < 768;
      if (coarse || small || cores <= 4 || mem <= 4) return "low";
      return "high";
    };

    setTier(resolve());
    const onChange = () => setTier(resolve());
    rmQuery.addEventListener("change", onChange);
    return () => rmQuery.removeEventListener("change", onChange);
  }, []);

  return tier;
}
