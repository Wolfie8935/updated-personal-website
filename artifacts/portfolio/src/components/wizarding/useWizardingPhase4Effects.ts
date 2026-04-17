import { useEffect } from "react";
import { enableWizardingParticles } from "@/utils/particles";
import { useHeroTypewriterSpell } from "./useHeroTypewriterSpell";
import { useNavSpellPopup } from "./useNavSpellPopup";
import { useProjectHoverSpell } from "./useProjectHoverSpell";
import { useReducedMotion } from "./useReducedMotion";
import { useSectionEntrySpells } from "./useSectionEntrySpells";

interface UseWizardingPhase4EffectsOptions {
  enabled: boolean;
}

export function useWizardingPhase4Effects({ enabled }: UseWizardingPhase4EffectsOptions) {
  const reducedMotion = useReducedMotion();

  useSectionEntrySpells({ enabled, reducedMotion });
  useNavSpellPopup({ enabled, reducedMotion });
  useHeroTypewriterSpell({ enabled, reducedMotion });
  useProjectHoverSpell({ enabled, reducedMotion });

  useEffect(() => {
    if (!enabled) return;

    const cleanupParticles = enableWizardingParticles({
      reducedMotion,
      zIndex: 0,
    });
    return cleanupParticles;
  }, [enabled, reducedMotion]);
}
