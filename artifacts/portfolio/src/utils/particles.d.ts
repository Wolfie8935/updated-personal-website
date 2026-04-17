interface WizardingParticlesOptions {
  reducedMotion?: boolean;
  maxParticles?: number;
  zIndex?: number;
}

export function enableWizardingParticles(
  options?: WizardingParticlesOptions,
): () => void;
