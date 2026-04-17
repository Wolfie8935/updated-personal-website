import { createContext, useContext, useEffect, useRef, useState } from "react";
import { enableWandTrail } from "@/utils/wandTrail";

type Theme = "dark" | "light" | "wizarding";
const THEME_CYCLE: Theme[] = ["dark", "light", "wizarding"];

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem("theme");
    const legacyTheme = localStorage.getItem("portfolio-theme");
    const resolved = storedTheme || legacyTheme;
    return resolved === "light" || resolved === "dark" || resolved === "wizarding"
      ? resolved
      : "dark";
  });
  const defaultTitle = useRef(document.title);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const cleanupWandTrail = enableWandTrail();
    return () => cleanupWandTrail();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove("light", "dark", "theme-wizarding");
    body.classList.remove("theme-wizarding");

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.add("light");
    } else {
      root.classList.add("dark", "theme-wizarding");
      body.classList.add("theme-wizarding");
      body.classList.remove("wizarding-activate");
      requestAnimationFrame(() => {
        body.classList.add("wizarding-activate");
      });
      window.setTimeout(() => body.classList.remove("wizarding-activate"), 650);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme === "wizarding") {
      document.title = "Aman Goel ⚡ Hogwarts Dept. of Computing";
      return;
    }
    document.title = defaultTitle.current;
  }, [theme]);

  useEffect(() => {
    const sequence = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let index = 0;

    const showSpellToast = () => {
      if (document.getElementById("wizard-konami-toast")) return;
      const toast = document.createElement("div");
      toast.id = "wizard-konami-toast";
      toast.className = "wizard-konami-toast";
      toast.textContent = "Accio Portfolio ✨";
      document.body.appendChild(toast);
      window.setTimeout(() => {
        toast.classList.add("hide");
      }, 2500);
      window.setTimeout(() => {
        toast.remove();
      }, 3200);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === sequence[index]) {
        index += 1;
        if (index === sequence.length) {
          if (themeRef.current === "wizarding") {
            showSpellToast();
          }
          index = 0;
        }
      } else {
        index = 0;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (theme !== "wizarding") return;

    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>("section h2, section h3"),
    );
    const cardTargets = Array.from(document.querySelectorAll<HTMLElement>(".wizard-card"));

    revealTargets.forEach((target) => target.classList.add("wizard-reveal-target"));
    cardTargets.forEach((card, cardIndex) => {
      card.style.setProperty("--wizard-stagger-index", String(cardIndex));
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );

    [...revealTargets, ...cardTargets].forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [theme]);

  const toggleTheme = () =>
    setTheme((currentTheme) => {
      const currentIndex = THEME_CYCLE.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
      return THEME_CYCLE[nextIndex];
    });

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
