import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import {
  AppTheme,
  defaultWizardingSkillSubtitles,
  getWizardingSkillSubtitle,
  shouldShowWizardingSubtitle,
  WizardingSkillSubtitleMap,
} from "@/utils/wizardingSkillSubtitles";
import "./wizarding.css";

type WizardingSkillSubtitleProps = {
  title: string;
  map?: WizardingSkillSubtitleMap;
  className?: string;
  theme?: AppTheme;
};

export function WizardingSkillSubtitle({
  title,
  map = defaultWizardingSkillSubtitles,
  className,
  theme,
}: WizardingSkillSubtitleProps) {
  const { theme: contextTheme } = useTheme();
  const resolvedTheme = theme ?? contextTheme;

  if (!shouldShowWizardingSubtitle(resolvedTheme)) {
    return null;
  }

  const subtitle = getWizardingSkillSubtitle(title, map);
  if (!subtitle) {
    return null;
  }

  return <p className={cn("wizarding-skill-subtitle", className)}>{subtitle}</p>;
}
