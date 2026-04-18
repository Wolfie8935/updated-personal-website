import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const SHOW_DURATION_MS = 1500;
const STORAGE_PREFIX = "wizard-restricted-warning:";

function getTargetKey(element: Element, index: number) {
  const htmlElement = element as HTMLElement;
  const explicitKey = htmlElement.dataset.restrictedKey;
  if (explicitKey) return explicitKey;
  if (htmlElement.id) return htmlElement.id;
  return `${element.tagName.toLowerCase()}-${index}`;
}

export function RestrictedSection() {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme !== "wizarding") return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("#research, .hp-restricted"),
    );
    if (targets.length === 0) return;

    const timeouts = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          const targetIndex = targets.indexOf(element);
          const targetKey = getTargetKey(element, targetIndex);
          const storageKey = `${STORAGE_PREFIX}${targetKey}`;

          if (sessionStorage.getItem(storageKey)) {
            observer.unobserve(element);
            return;
          }

          sessionStorage.setItem(storageKey, "1");
          element.classList.add("wizard-restricted-warning");
          element.classList.remove("wizard-restricted-warning-dismissed");

          const timeoutId = window.setTimeout(() => {
            element.classList.add("wizard-restricted-warning-dismissed");
            const hideTimeoutId = window.setTimeout(() => {
              element.classList.remove("wizard-restricted-warning");
              element.classList.remove("wizard-restricted-warning-dismissed");
            }, 420);
            timeouts.add(hideTimeoutId);
          }, SHOW_DURATION_MS);

          timeouts.add(timeoutId);
          observer.unobserve(element);
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      targets.forEach((target) => {
        target.classList.remove("wizard-restricted-warning");
        target.classList.remove("wizard-restricted-warning-dismissed");
      });
    };
  }, [theme]);

  return null;
}
