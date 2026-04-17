export const SECTION_SPELLS: Record<string, string> = {
  home: "Lumos",
  about: "Revelio",
  skills: "Alohomora",
  experience: "Tempus",
  projects: "Accio",
  research: "Legilimens",
  achievements: "Expecto Patronum",
  contact: "Expecto Patronum",
};

export const WIZARDING_SECTION_ORDER = [
  "home",
  "about",
  "skills",
  "experience",
  "projects",
  "research",
  "achievements",
  "contact",
] as const;

export const isWizardingThemeActive = () =>
  document.documentElement.classList.contains("theme-wizarding");
