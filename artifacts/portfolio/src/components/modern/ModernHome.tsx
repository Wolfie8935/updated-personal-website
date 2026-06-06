import { AuroraBackground } from "@/components/modern/AuroraBackground";
import { AmbientParticles } from "@/components/modern/AmbientParticles";
import { EasterEggs } from "@/components/modern/EasterEggs";
import { ScrollProgress } from "@/components/modern/ScrollProgress";
import { BackToTop } from "@/components/modern/BackToTop";
import { NavbarModern } from "@/components/modern/NavbarModern";
import { FooterModern } from "@/components/modern/FooterModern";
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
 */
export function ModernHome() {
  return (
    <div className="modern-scope relative min-h-screen overflow-x-clip bg-background text-foreground selection:bg-indigo-500/30">
      <AuroraBackground />
      <AmbientParticles />
      <EasterEggs />
      <ScrollProgress />
      <NavbarModern />

      <main className="relative z-10">
        <HeroModern />
        <AboutModern />
        <SkillsModern />
        <ExperienceModern />
        <ProjectsModern />
        <ResearchModern />
        <AchievementsModern />
        <InterestsModern />
        <ContactModern />
      </main>

      <FooterModern />
      <BackToTop />
    </div>
  );
}
