import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { NavbarSilhouetteOverlay } from "@/components/wizarding";

const navItems = [
  { name: "Home", href: "#home", spell: "Lumos" },
  { name: "About", href: "#about", spell: "Revelio" },
  { name: "Skills", href: "#skills", spell: "Alohomora" },
  { name: "Experience", href: "#experience", spell: "Tempus" },
  { name: "Projects", href: "#projects", spell: "Accio" },
  { name: "Research", href: "#research", spell: "Legilimens" },
  { name: "Achievements", href: "#achievements", spell: "Expecto Patronum" },
  { name: "Contact", href: "#contact", spell: "Owl Post" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [hasChosenOneBadge, setHasChosenOneBadge] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const offset = window.scrollY + 120;
      let current = "home";
      navItems.forEach((item) => {
        const sectionId = item.href.replace("#", "");
        const element = document.getElementById(sectionId);
        if (element && element.offsetTop <= offset) {
          current = sectionId;
        }
      });
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateChosenOneBadge = () => {
      setHasChosenOneBadge(localStorage.getItem("hp_voldemort_defeated") === "true");
    };
    const onChamberUnlocked = () => updateChosenOneBadge();

    const onStorage = (event: StorageEvent) => {
      if (event.key === "hp_voldemort_defeated") {
        updateChosenOneBadge();
      }
    };

    updateChosenOneBadge();
    window.addEventListener("storage", onStorage);
    window.addEventListener("wizarding:chamber-unlocked", onChamberUnlocked);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("wizarding:chamber-unlocked", onChamberUnlocked);
    };
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const id = href.replace("#", "");
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offsetTop =
        element.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    }
  };

  const downloadResume = () => {
    const a = document.createElement("a");
    a.href = "/Aman_Goel_Resume.pdf";
    a.download = "Aman_Goel_Resume.pdf";
    a.click();
  };

  const themeIcon =
    theme === "dark" ? (
      <Sun size={18} />
    ) : theme === "light" ? (
      <Moon size={18} />
    ) : (
      <span className="text-base leading-none">⚡</span>
    );
  const resumeTooltip = theme === "wizarding" ? "Accio Resume" : "Download Resume";

  return (
    <header
      className={cn(
        "site-navbar fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent relative",
        isScrolled
          ? "bg-background/85 backdrop-blur-md border-border/50 shadow-sm"
          : "bg-transparent",
      )}
    >
      <NavbarSilhouetteOverlay />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("#home");
              }}
              className="site-logo site-title font-mono text-2xl font-bold text-foreground"
            >
              Aman Goel
              {theme === "wizarding" && hasChosenOneBadge && (
                <span className="wizarding-chosen-one-badge" aria-label="Chosen one unlocked">
                  ⚡ Chosen One
                </span>
              )}
            </a>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.href);
                }}
                className={cn(
                  "nav-link spell-hoverable text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-secondary-bg/50",
                  activeSection === item.href.replace("#", "") && "text-primary",
                )}
                data-spell-hover={item.spell}
              >
                {item.name}
              </a>
            ))}
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border/50">
              <button
                onClick={downloadResume}
                title={resumeTooltip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary border border-primary/40 hover:bg-primary/10 transition-all"
              >
                <FileDown size={14} /> Resume
              </button>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                title={theme === "wizarding" ? "Nox / Lumos" : "Toggle theme"}
                className="theme-toggle-btn p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary-bg/50 transition-colors"
              >
                {themeIcon}
              </button>
            </div>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={downloadResume}
              title={resumeTooltip}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary border border-primary/40 hover:bg-primary/10 transition-all"
            >
              <FileDown size={13} /> CV
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={theme === "wizarding" ? "Nox / Lumos" : "Toggle theme"}
              className="theme-toggle-btn p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors"
            >
              {themeIcon}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground hover:text-foreground p-2 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(item.href);
                  }}
                  className={cn(
                    "nav-link spell-hoverable block px-3 py-3 text-base font-medium text-muted-foreground hover:text-primary hover:bg-secondary-bg/50 rounded-md",
                    activeSection === item.href.replace("#", "") && "text-primary",
                  )}
                  data-spell-hover={item.spell}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
