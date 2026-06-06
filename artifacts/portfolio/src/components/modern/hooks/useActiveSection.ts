import { useEffect, useState } from "react";

/**
 * Scroll-spy via IntersectionObserver — no per-scroll-event layout reads
 * (offsetTop/getBoundingClientRect), which were the main scroll-jank source.
 * Returns the id of the topmost section currently in the active band.
 */
export function useActiveSection(ids: string[], topOffset = 80) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join(",");

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // pick the first section in document order that is currently visible
        const current = ids.find((id) => visible.has(id));
        if (current) setActive(current);
      },
      { rootMargin: `-${topOffset}px 0px -55% 0px`, threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, topOffset]);

  return active;
}
