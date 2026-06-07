import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, FileDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { toggleThemeWithTransition } from "@/components/modern/themeTransition";
import { useActiveSection } from "@/components/modern/hooks/useActiveSection";
import { useScrollTo } from "@/components/modern/journey/ScrollContext";

const navItems = [
  { name: "Home", href: "home" },
  { name: "About", href: "about" },
  { name: "Skills", href: "skills" },
  { name: "Experience", href: "experience" },
  { name: "Projects", href: "projects" },
  { name: "Research", href: "research" },
  { name: "Awards", href: "achievements" },
  { name: "Off the Clock", href: "interests" },
  { name: "Contact", href: "contact" },
];

export function NavbarModern() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = useActiveSection(navItems.map((i) => i.href));
  const { theme, toggleTheme } = useTheme();
  const scrollToTarget = useScrollTo();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    scrollToTarget(`#${href}`, -72);
  };

  const downloadResume = () => {
    const a = document.createElement("a");
    a.href = "/Aman_Goel_Resume.pdf";
    a.download = "Aman_Goel_Resume.pdf";
    a.click();
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "glass border-b border-white/10 shadow-[0_8px_30px_-12px_rgba(2,6,23,0.5)]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("home");
            }}
            className="font-mono text-xl font-bold text-foreground"
          >
            Aman<span className="text-aurora">Goel</span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={`#${item.href}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.href);
                }}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active === item.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active === item.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full glass border border-white/15"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {item.name}
              </a>
            ))}

            <div className="ml-2 flex items-center gap-1 border-l border-white/10 pl-2">
              <button
                onClick={downloadResume}
                title="Download Resume"
                className="press flex items-center gap-1.5 rounded-full glass px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-white/30"
              >
                <FileDown size={14} /> Resume
              </button>
              <button
                onClick={(e) => toggleThemeWithTransition(theme, toggleTheme, e)}
                aria-label="Toggle theme"
                title="Toggle theme (psst — keep clicking for a surprise)"
                className="press grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              >
                {theme === "dark" ? <Sun size={18} /> : theme === "light" ? <Moon size={18} /> : <Sparkles size={18} />}
              </button>
            </div>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={downloadResume}
              title="Download Resume"
              className="press flex items-center gap-1 rounded-full glass px-2.5 py-1.5 text-xs font-semibold text-foreground"
            >
              <FileDown size={13} /> CV
            </button>
            <button
              onClick={(e) => toggleThemeWithTransition(theme, toggleTheme, e)}
              aria-label="Toggle theme"
              className="press grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun size={18} /> : theme === "light" ? <Moon size={18} /> : <Sparkles size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu"
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass border-b border-white/10 lg:hidden"
          >
            <div className="space-y-1 px-4 pb-6 pt-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={`#${item.href}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(item.href);
                  }}
                  className={cn(
                    "block rounded-xl px-3 py-3 text-base font-medium transition-colors",
                    active === item.href
                      ? "bg-white/10 text-foreground"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
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
