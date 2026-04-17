import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import "./wizarding.css";

const DEFAULT_STORAGE_KEY = "wizarding-cinematic-intro-seen";

type WizardingCinematicIntroProps = {
  active?: boolean;
  storageKey?: string;
  durationMs?: number;
  title?: string;
  subtitle?: string;
  sigil?: string;
  onFinished?: () => void;
};

export function WizardingCinematicIntro({
  active,
  storageKey = DEFAULT_STORAGE_KEY,
  durationMs = 2800,
  title = "Aman Goel",
  subtitle = "Hogwarts Department of Computing",
  sigil = "⚡",
  onFinished,
}: WizardingCinematicIntroProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const isWizardingActive = useMemo(() => active ?? theme === "wizarding", [active, theme]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      document.body.classList.remove("wizarding-cinematic-active");
    };
  }, []);

  useEffect(() => {
    if (!isWizardingActive) {
      setVisible(false);
      document.body.classList.remove("wizarding-cinematic-active");
      return;
    }

    if (typeof window === "undefined") {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (sessionStorage.getItem(storageKey) === "1") {
      return;
    }

    sessionStorage.setItem(storageKey, "1");
    setVisible(true);
    document.body.classList.add("wizarding-cinematic-active");

    timeoutRef.current = window.setTimeout(() => {
      setVisible(false);
      document.body.classList.remove("wizarding-cinematic-active");
      onFinished?.();
    }, durationMs);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      document.body.classList.remove("wizarding-cinematic-active");
    };
  }, [durationMs, isWizardingActive, onFinished, storageKey]);

  if (!visible) {
    return null;
  }

  return (
    <div aria-hidden className="wizarding-cinematic-intro">
      <div className="wizarding-cinematic-intro__content">
        <div className="wizarding-cinematic-intro__sigil">{sigil}</div>
        <p className="wizarding-cinematic-intro__title">{title}</p>
        <p className="wizarding-cinematic-intro__subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
