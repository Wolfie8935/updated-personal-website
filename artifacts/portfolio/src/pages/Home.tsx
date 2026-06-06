import { useTheme } from "@/context/ThemeContext";
import { WizardingHome } from "@/pages/WizardingHome";
import { ModernHome } from "@/components/modern/ModernHome";

/**
 * Home is a thin theme fork.
 *
 *  - "wizarding"      -> WizardingHome (original layout, untouched)
 *  - "dark" / "light" -> ModernHome   (Liquid Glass / Aurora redesign)
 *
 * Forking at the page level guarantees total isolation: the modern components are never
 * mounted in the wizarding theme, and the wizarding components/CSS never reach the modern UI.
 */
export default function Home() {
  const { theme } = useTheme();
  return theme === "wizarding" ? <WizardingHome /> : <ModernHome />;
}
