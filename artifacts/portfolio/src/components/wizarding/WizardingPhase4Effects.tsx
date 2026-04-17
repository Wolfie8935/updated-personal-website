import "./wizarding-phase4.css";
import { useWizardingPhase4Effects } from "./useWizardingPhase4Effects";

interface WizardingPhase4EffectsProps {
  enabled: boolean;
}

export function WizardingPhase4Effects({ enabled }: WizardingPhase4EffectsProps) {
  useWizardingPhase4Effects({ enabled });
  return null;
}
