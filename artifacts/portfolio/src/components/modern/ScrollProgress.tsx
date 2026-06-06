import { motion, useScroll, useSpring } from "framer-motion";
import { useActiveSection } from "@/components/modern/hooks/useActiveSection";

const sections = [
  { id: "home", label: "Top" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "achievements", label: "Awards" },
  { id: "interests", label: "Off the Clock" },
  { id: "contact", label: "Contact" },
];

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const active = useActiveSection(sections.map((s) => s.id));

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />

      <nav className="section-rail" aria-label="Section navigation">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            className={`rail-dot ${active === s.id ? "is-active" : ""}`}
            aria-label={`Go to ${s.label}`}
            aria-current={active === s.id ? "true" : undefined}
          >
            <span className="rail-label">{s.label}</span>
            <span className="rail-bead" />
          </button>
        ))}
      </nav>
    </>
  );
}
