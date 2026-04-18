import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Research } from "@/components/sections/Research";
import { Achievements } from "@/components/sections/Achievements";
import { Contact } from "@/components/sections/Contact";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { HorcruxHunt } from "@/wizarding/HorcruxHunt";
import {
  ChapterDivider,
  MaraudersMap,
  WizardingCinematicIntro,
  WizardingPhase4Effects,
} from "@/components/wizarding";
import { ChamberOfSecrets } from "@/wizarding/ChamberOfSecrets";
import { RestrictedSection } from "@/wizarding/RestrictedSection";
import { DailyProphetTicker } from "@/wizarding/DailyProphet";

export default function Home() {
  const { theme } = useTheme();
  const isWizarding = theme === "wizarding";

  return (
    <HorcruxHunt enabled={isWizarding}>
      <div
        className={cn(
          "min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground",
          isWizarding && "wizarding-scrollbar-scope",
        )}
      >
      <WizardingPhase4Effects enabled={isWizarding} />
      <RestrictedSection />
      {isWizarding && (
        <>
          <WizardingCinematicIntro
            title="Aman Goel"
            subtitle="Hogwarts Department of Computing"
            sigil="⚡"
            durationMs={2500}
          />
        </>
      )}
      <Navbar />
      {isWizarding && <DailyProphetTicker />}
      
      <main>
        <Hero />
        {isWizarding && <ChapterDivider symbol="✦" className="my-10 md:my-12" />}
        <About />
        {isWizarding && <ChapterDivider symbol="✦" className="my-10 md:my-12" />}
        <Skills />
        {isWizarding && <MaraudersMap />}
        {isWizarding && <ChapterDivider symbol="✦" className="my-10 md:my-12" />}
        <Experience />
        {isWizarding && <ChapterDivider symbol="✦" className="my-10 md:my-12" />}
        <Projects />
        {isWizarding && <ChapterDivider symbol="✦" className="my-10 md:my-12" />}
        <Research />
        {isWizarding && <ChapterDivider symbol="✦" className="my-10 md:my-12" />}
        <Achievements />
        {isWizarding && <ChapterDivider symbol="✦" className="my-10 md:my-12" />}
        <Contact />
        {isWizarding && <ChapterDivider symbol="✦" className="my-10 md:my-12" />}
        {isWizarding && <ChamberOfSecrets enabled={isWizarding} />}
      </main>

      <Footer />
      </div>
    </HorcruxHunt>
  );
}
