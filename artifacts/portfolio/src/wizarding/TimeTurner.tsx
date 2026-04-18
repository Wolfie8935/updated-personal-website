import { useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";

export function TimeTurner() {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();

  const rewindToHero = useCallback(() => {
    const hero = document.getElementById("home");
    if (!hero) return;
    hero.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    hero.classList.remove("time-turner-flash");
    void hero.offsetWidth;
    hero.classList.add("time-turner-flash");
    window.setTimeout(() => hero.classList.remove("time-turner-flash"), 900);
  }, [reducedMotion]);

  if (theme !== "wizarding") return null;

  return (
    <button
      type="button"
      className={`wizard-time-turner ${reducedMotion ? "is-reduced-motion" : ""}`}
      aria-label="Time-Turner: return to the beginning of the page"
      title="Spin the Time-Turner to return to the hero"
      onClick={rewindToHero}
    >
      <span className="wizard-time-turner__ring wizard-time-turner__ring--outer" />
      <span className="wizard-time-turner__ring wizard-time-turner__ring--mid" />
      <span className="wizard-time-turner__ring wizard-time-turner__ring--inner" />
      <span className="wizard-time-turner__hourglass">
        <span className="wizard-time-turner__sand wizard-time-turner__sand--top" />
        <span className="wizard-time-turner__sand wizard-time-turner__sand--bottom" />
      </span>
    </button>
  );
}
