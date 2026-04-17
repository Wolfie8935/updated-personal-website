import { useEffect, useRef } from "react";
import { isWizardingThemeActive } from "./spellMap";

interface UseHeroTypewriterSpellOptions {
  enabled: boolean;
  reducedMotion?: boolean;
  selector?: string;
}

export function useHeroTypewriterSpell({
  enabled,
  reducedMotion = false,
  selector = ".hero-site-title",
}: UseHeroTypewriterSpellOptions) {
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const heading = document.querySelector(selector) as HTMLElement | null;
    if (!heading) return;

    const originalText = (heading.dataset.wizardOriginalText ?? heading.textContent ?? "").trim();
    heading.dataset.wizardOriginalText = originalText;

    const clearTimers = () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current = [];
    };

    const restoreHeading = () => {
      clearTimers();
      heading.classList.remove("wizard-hero-typewriter", "wizard-hero-typewriter-active");
      heading.textContent = originalText;
    };

    if (!enabled || reducedMotion || !isWizardingThemeActive()) {
      restoreHeading();
      return () => restoreHeading();
    }

    heading.classList.add("wizard-hero-typewriter", "wizard-hero-typewriter-active");
    heading.textContent = "";

    originalText.split("").forEach((character, index) => {
      const timerId = window.setTimeout(() => {
        const span = document.createElement("span");
        span.className = "wizard-type-char";
        span.style.animationDelay = `${index * 45}ms`;
        span.textContent = character === " " ? "\u00A0" : character;
        heading.appendChild(span);
      }, index * 80);

      timersRef.current.push(timerId);
    });

    const deactivateTimer = window.setTimeout(() => {
      heading.classList.remove("wizard-hero-typewriter-active");
    }, originalText.length * 80 + 1000);
    timersRef.current.push(deactivateTimer);

    return () => restoreHeading();
  }, [enabled, reducedMotion, selector]);
}
