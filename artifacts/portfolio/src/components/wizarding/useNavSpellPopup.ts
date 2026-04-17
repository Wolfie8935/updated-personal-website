import { useEffect, useRef } from "react";
import { SECTION_SPELLS, isWizardingThemeActive } from "./spellMap";

interface UseNavSpellPopupOptions {
  enabled: boolean;
  reducedMotion?: boolean;
}

export function useNavSpellPopup({ enabled, reducedMotion = false }: UseNavSpellPopupOptions) {
  const cleanupTimersRef = useRef<number[]>([]);

  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const removePopup = (popup: HTMLElement) => {
      popup.classList.add("is-exiting");
      const timeoutId = window.setTimeout(() => popup.remove(), 200);
      cleanupTimersRef.current.push(timeoutId);
    };

    const showPopup = (triggerElement: HTMLElement, spellText: string) => {
      const popup = document.createElement("div");
      popup.className = "wizard-nav-spell-popup";
      popup.textContent = spellText;

      const rect = triggerElement.getBoundingClientRect();
      popup.style.left = `${rect.left + rect.width / 2}px`;
      popup.style.top = `${Math.max(12, rect.top - 14)}px`;

      document.body.appendChild(popup);

      const visibleForMs = 600;
      const hideTimer = window.setTimeout(() => removePopup(popup), visibleForMs);
      cleanupTimersRef.current.push(hideTimer);
    };

    const onNavClick = (event: MouseEvent) => {
      if (!isWizardingThemeActive()) return;

      const target = event.target as HTMLElement | null;
      const link = target?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link || !link.closest(".site-navbar")) return;

      const sectionId = (link.getAttribute("href") ?? "").replace("#", "") || "home";
      const spellName = SECTION_SPELLS[sectionId];
      if (!spellName) return;

      showPopup(link, spellName);
    };

    document.addEventListener("click", onNavClick, { passive: true });

    return () => {
      document.removeEventListener("click", onNavClick);
      cleanupTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      cleanupTimersRef.current = [];
      document.querySelectorAll(".wizard-nav-spell-popup").forEach((node) => node.remove());
    };
  }, [enabled, reducedMotion]);
}
