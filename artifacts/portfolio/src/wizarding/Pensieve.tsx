import type { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";

interface PensieveProps {
  children: ReactNode;
}

export function Pensieve({ children }: PensieveProps) {
  const { theme } = useTheme();

  if (theme !== "wizarding") {
    return <>{children}</>;
  }

  return (
    <div className="wizard-pensieve">
      <div className="wizard-pensieve__bowl" aria-hidden />
      <p className="wizard-pensieve__label">Pensieve Memories</p>
      <div className="wizard-pensieve__content">{children}</div>
    </div>
  );
}
