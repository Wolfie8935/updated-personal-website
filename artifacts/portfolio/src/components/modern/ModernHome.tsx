import { lazy, Suspense, useEffect, useState } from "react";
import { useDeviceTier } from "@/components/modern/hooks/useDeviceTier";
import { useScrollStage } from "@/components/modern/hooks/useScrollStage";
import { useSmoothScroll } from "@/components/modern/hooks/useSmoothScroll";
import { ScrollContext } from "@/components/modern/journey/ScrollContext";

// Code-split three.js + postprocessing: the WebGL journey loads as its own async
// chunk so it doesn't bloat the initial bundle (better LCP/TTI). The aurora
// background covers the gap until it arrives.
const JourneyScene = lazy(() =>
  import("@/components/modern/JourneyScene").then((m) => ({ default: m.JourneyScene })),
);
import { AuroraBackground } from "@/components/modern/AuroraBackground";
import { AmbientParticles } from "@/components/modern/AmbientParticles";
import { EasterEggs } from "@/components/modern/EasterEggs";
import { ScrollProgress } from "@/components/modern/ScrollProgress";
import { BackToTop } from "@/components/modern/BackToTop";
import { NavbarModern } from "@/components/modern/NavbarModern";
import { FooterModern } from "@/components/modern/FooterModern";
import { StatementInterlude } from "@/components/modern/StatementInterlude";
import { HeroModern } from "@/components/modern/sections/HeroModern";
import { AboutModern } from "@/components/modern/sections/AboutModern";
import { SkillsModern } from "@/components/modern/sections/SkillsModern";
import { ExperienceModern } from "@/components/modern/sections/ExperienceModern";
import { ProjectsModern } from "@/components/modern/sections/ProjectsModern";
import { ResearchModern } from "@/components/modern/sections/ResearchModern";
import { AchievementsModern } from "@/components/modern/sections/AchievementsModern";
import { InterestsModern } from "@/components/modern/sections/InterestsModern";
import { ContactModern } from "@/components/modern/sections/ContactModern";

/**
 * ModernHome — the "Liquid Glass / Aurora" experience for the dark & light themes.
 * Rendered only when the theme is NOT wizarding (see pages/Home.tsx).
 *
 * Owns the fixed scroll-driven JourneyScene, the modern-only smooth scroll, and
 * the shared anchor-scroll context. Because this component mounts solely on
 * non-wizarding themes, Lenis and the WebGL journey never run in wizarding.
 */
export function ModernHome() {
  const tier = useDeviceTier();
  const progressRef = useScrollStage(tier !== "static");
  const { scrollTo } = useSmoothScroll(tier);

  // Mount the WebGL journey only after the browser goes idle: its synchronous
  // renderer/bloom initialization is heavy enough to stall the hero's entrance
  // animations mid-flight. The aurora background covers the gap.
  const [journeyReady, setJourneyReady] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let timer: number | undefined;
    const arm = () => {
      setJourneyReady(true);
      // Nudge the animation ticker awake: framer's scheduler can stall during
      // a heavy initial load until the first scroll/pointer event. A synthetic
      // scroll event is enough to resume any mid-flight mount animations
      // (count-ups, entrances) without waiting for real user input.
      window.dispatchEvent(new Event("scroll"));
    };
    const idleId = w.requestIdleCallback
      ? w.requestIdleCallback(arm, { timeout: 1200 })
      : ((timer = window.setTimeout(arm, 600)), undefined);
    return () => {
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  return (
    <ScrollContext.Provider value={scrollTo}>
      <div className="modern-scope relative min-h-screen overflow-x-clip bg-background text-foreground selection:bg-indigo-500/30">
        <AuroraBackground />
        {/* Fixed neural journey behind all content (async chunk; aurora shows until it
            loads, and remains alone if WebGL is unavailable). */}
        {journeyReady && (
          <Suspense fallback={null}>
            <JourneyScene
              tier={tier}
              progressRef={progressRef}
              className="pointer-events-none fixed inset-0 z-0 opacity-90"
            />
          </Suspense>
        )}
        {/* Ambient DOM particles only add value on the low tier (no heavy WebGL there). */}
        {tier === "low" && <AmbientParticles />}
        <EasterEggs />
        <ScrollProgress />
        <NavbarModern />

        <main className="relative z-10">
          <HeroModern />
          <AboutModern />
          {/* Apple-style scroll-scrubbed statement — words ignite as you scroll */}
          <StatementInterlude
            kicker="the thesis"
            segments={[
              { text: "I turn" },
              { text: "research", accent: true },
              { text: "into systems that" },
              { text: "ship.", accent: true },
            ]}
          />
          <SkillsModern />
          <ExperienceModern />
          <ProjectsModern />
          <ResearchModern />
          <AchievementsModern />
          <InterestsModern />
          <StatementInterlude
            kicker="one more thing"
            segments={[
              { text: "Good ideas deserve" },
              { text: "great execution.", accent: true },
            ]}
          />
          <ContactModern />
        </main>

        <FooterModern />
        <BackToTop />
      </div>
    </ScrollContext.Provider>
  );
}
