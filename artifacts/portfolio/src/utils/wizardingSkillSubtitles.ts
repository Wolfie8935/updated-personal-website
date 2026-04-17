export type AppTheme = "light" | "dark" | "wizarding";

export type WizardingSkillSubtitleMap = Record<string, string>;

export const defaultWizardingSkillSubtitles: WizardingSkillSubtitleMap = {
  "Programming Languages": "Frontend - Charms",
  "Backend Engineering": "Backend - Transfiguration",
  "Machine Learning & AI": "AI/ML - Divination",
  "Research & Probabilistic Methods": "Research - Ancient Runes",
  "Cloud & DevOps": "DevOps/Infra - Potions",
};

export function getWizardingSkillSubtitle(
  title: string,
  map: WizardingSkillSubtitleMap = defaultWizardingSkillSubtitles,
) {
  return map[title];
}

export function shouldShowWizardingSubtitle(theme: AppTheme) {
  return theme === "wizarding";
}
