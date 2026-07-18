import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { PortfolioEngine } from "@/components/modern/engine";
import { EnvStage, FixedChrome, LetterboxBars, Preloader, Screensaver } from "@/components/modern/design/Chrome";
import { MobileMenu, Navbar } from "@/components/modern/design/Nav";
import { CaseStudies, RetroRally, Terminal } from "@/components/modern/design/Overlays";
import {
  About,
  Capabilities,
  Contact,
  Experience,
  FirstCourt,
  Hero,
  Principles,
  Recognition,
  ReasoningEngine,
  Ticker,
  WorkRail,
} from "@/components/modern/design/Sections";
import { mono } from "@/components/modern/design/ui";

/**
 * ModernHome — the "Court & Terminal" experience (Claude Design port) for the
 * dark & light themes. Rendered only when the theme is NOT wizarding (see
 * pages/Home.tsx), so the engine, its wheel hijack and canvases never touch
 * the wizarding theme.
 *
 * The markup is static; PortfolioEngine drives everything through data-*
 * attributes in one rAF loop. Theme flips route through ThemeContext so the
 * dark/light preference persists site-wide (wizarding stays reachable via the
 * footer "third theme" button and the terminal).
 */
export function ModernHome() {
  const { theme, setTheme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const engineRef = useRef<PortfolioEngine | null>(null);

  useEffect(() => {
    const engine = new PortfolioEngine({
      isLight: () => themeRef.current === "light",
      setLight: (light) => setTheme(light ? "light" : "dark"),
      setWizarding: () => setTheme("wizarding"),
    });
    engineRef.current = engine;
    engine.mount();
    return () => {
      engine.unmount();
      engineRef.current = null;
    };
    // mount once — the engine reads theme changes via syncTheme below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.syncTheme(theme === "light");
  }, [theme]);

  // The page behind the scope (overscroll glow, address-bar collapse areas)
  // must match the theme background.
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const prevBg = root.style.backgroundColor;
    const prevOverscroll = body.style.overscrollBehavior;
    root.style.backgroundColor = theme === "light" ? "#E8DECB" : "#0A0908";
    body.style.overscrollBehavior = "none";
    return () => {
      root.style.backgroundColor = prevBg;
      body.style.overscrollBehavior = prevOverscroll;
    };
  }, [theme]);

  return (
    <div className="modern-scope" style={{ position: "relative" }}>
      {/* skip link (keyboard) */}
      <a
        href="#work"
        data-skiplink
        style={{
          position: "fixed",
          top: -80,
          left: 24,
          zIndex: 210,
          ...mono(11, "0.25em"),
          color: "var(--fg)",
          background: "var(--panel)",
          border: "1px solid rgba(201,166,107,0.5)",
          padding: "12px 18px",
          textDecoration: "none",
          transition: "top 0.3s ease",
        }}
      >
        SKIP TO WORK ↓
      </a>

      <Preloader />
      <Screensaver />
      <FixedChrome />
      <CaseStudies />
      <RetroRally />
      <Terminal />
      <Navbar />
      <MobileMenu />

      {/* page content (velocity-skewed) */}
      <div data-pagewrap style={{ position: "relative", zIndex: 2, willChange: "transform" }}>
        <EnvStage />
        <LetterboxBars />
        <Hero />
        <Ticker />
        <About />
        <WorkRail />
        <ReasoningEngine />
        <Principles />
        <Experience />
        <Capabilities />
        <Recognition />
        <FirstCourt />
        <Contact />
      </div>
    </div>
  );
}
