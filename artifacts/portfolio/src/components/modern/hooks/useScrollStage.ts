import { useEffect, useRef, type MutableRefObject } from "react";

/**
 * Tracks normalized document scroll progress (0 at top, 1 at bottom) in a ref,
 * read by JourneyScene each frame — so scroll never triggers a React re-render.
 *
 * Pure DOM scroll math, so it works whether or not Lenis is active (Lenis drives
 * the same window scroll position). Disabled entirely when `enabled` is false.
 */
export function useScrollStage(enabled: boolean): MutableRefObject<number> {
  const progressRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      progressRef.current = 0;
      return;
    }

    const read = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      progressRef.current = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [enabled]);

  return progressRef;
}
