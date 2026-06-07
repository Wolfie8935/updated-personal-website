import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { DeviceTier } from "@/components/modern/hooks/useDeviceTier";

gsap.registerPlugin(ScrollTrigger);

/**
 * Buttery smooth-scroll for the modern theme, wired to GSAP ScrollTrigger.
 * Active only on the "high" tier; on "low"/"static" the browser's native scroll
 * is used (no Lenis instance is created at all). Returns a scrollTo(target) that
 * routes through Lenis when active and falls back to native smooth scroll.
 *
 * IMPORTANT: only ever mounted inside ModernHome, which renders solely on
 * non-wizarding themes — so the wizarding theme never gets Lenis.
 */
export function useSmoothScroll(tier: DeviceTier) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (tier !== "high") {
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [tier]);

  const scrollTo = (target: string | HTMLElement, offset = -80) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset });
      return;
    }
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (el instanceof HTMLElement) {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return { scrollTo };
}
