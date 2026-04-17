import { useEffect } from "react";
import { SECTION_SPELLS, WIZARDING_SECTION_ORDER, isWizardingThemeActive } from "./spellMap";

interface UseSectionEntrySpellsOptions {
  enabled: boolean;
  reducedMotion?: boolean;
}

export function useSectionEntrySpells({
  enabled,
  reducedMotion = false,
}: UseSectionEntrySpellsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const sections = WIZARDING_SECTION_ORDER.map((id) => document.getElementById(id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );

    sections.forEach((section) => {
      section.classList.add("wizard-section-spell-ready");
      section.dataset.wizardSpell = SECTION_SPELLS[section.id] ?? "Incendio";
      section.classList.remove("wizard-section-spell-cast");
    });

    if (!isWizardingThemeActive() || reducedMotion) {
      return () => {
        sections.forEach((section) => {
          section.classList.remove(
            "wizard-section-spell-ready",
            "wizard-section-spell-cast",
            "wizard-section-spell-cast-static",
          );
          delete section.dataset.wizardSpell;
        });
      };
    }

    const observer = new IntersectionObserver(
      (entries, io) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const target = entry.target as HTMLElement;
          target.classList.add("wizard-section-spell-cast");
          io.unobserve(target);
        });
      },
      {
        threshold: 0.4,
        rootMargin: "0px 0px -15% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      sections.forEach((section) => {
        section.classList.remove(
          "wizard-section-spell-ready",
          "wizard-section-spell-cast",
          "wizard-section-spell-cast-static",
        );
        delete section.dataset.wizardSpell;
      });
    };
  }, [enabled, reducedMotion]);
}
