import { useEffect } from "react";
import { isWizardingThemeActive } from "./spellMap";

interface UseProjectHoverSpellOptions {
  enabled: boolean;
  reducedMotion?: boolean;
}

export function useProjectHoverSpell({
  enabled,
  reducedMotion = false,
}: UseProjectHoverSpellOptions) {
  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const projectCards = Array.from(
      document.querySelectorAll<HTMLElement>("#projects .wizard-card"),
    );

    if (!projectCards.length || !isWizardingThemeActive()) {
      return () => {
        projectCards.forEach((card) => card.classList.remove("wizard-project-card"));
      };
    }

    projectCards.forEach((card) => card.classList.add("wizard-project-card"));

    return () => {
      projectCards.forEach((card) => card.classList.remove("wizard-project-card"));
    };
  }, [enabled, reducedMotion]);
}
