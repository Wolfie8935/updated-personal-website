import { RESUME_URL } from "@/components/modern/content";
import { ACCENT, MONO, SERIF, bg, fg, mono } from "@/components/modern/design/ui";

/**
 * Fixed navbar + full-screen mobile menu. The engine handles the glass state,
 * scroll-spy coloring, gravity hover, theme wipe and menu open/close.
 */

const NAV_ITEMS = [
  { id: "work", label: "WORK" },
  { id: "engine", label: "ENGINE" },
  { id: "about", label: "ABOUT" },
  { id: "contact", label: "CONTACT" },
];

export function Navbar() {
  return (
    <nav
      data-navbar
      data-intro="1.55"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "26px 40px",
        ...mono(11, "0.22em"),
        opacity: 0,
        transform: "translateY(-14px)",
      }}
    >
      <a
        href="#top"
        data-grav
        style={{
          display: "inline-block",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 22,
          letterSpacing: 0,
          color: "var(--fg)",
          textDecoration: "none",
        }}
      >
        A—G
      </a>
      <div data-navlinks style={{ display: "flex", gap: 40, alignItems: "center" }}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            data-navlink={item.id}
            data-grav
            className="m-hover-accent"
            style={{ display: "inline-block", color: fg(0.55), textDecoration: "none" }}
          >
            {item.label}
          </a>
        ))}
        <a
          href={RESUME_URL}
          download="Aman_Goel_Resume.pdf"
          data-grav
          className="m-hover-accent"
          style={{ display: "inline-block", color: fg(0.55), textDecoration: "none" }}
        >
          CV&nbsp;↓
        </a>
        <button
          data-themetoggle
          aria-label="Switch theme"
          style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "transparent", border: "none", padding: 0, marginLeft: 6 }}
        >
          <span data-themelabel style={{ ...mono(11, "0.22em", fg(0.5)), width: 36, textAlign: "right" }}>
            NIGHT
          </span>
          <span
            style={{
              position: "relative",
              width: 44,
              height: 23,
              borderRadius: 999,
              border: `1px solid ${fg(0.28)}`,
              background: fg(0.05),
              transition: "border-color 0.5s ease, background 0.5s ease",
            }}
          >
            <span
              data-themeknob
              style={{
                position: "absolute",
                top: 2,
                left: 2,
                width: 17,
                height: 17,
                borderRadius: "50%",
                background: ACCENT,
                boxShadow: "inset -5px -3px 0 0 var(--bg), 0 0 9px rgba(201,166,107,0.45)",
                transition: "transform 0.55s cubic-bezier(0.5,1.7,0.4,1), box-shadow 0.5s ease",
              }}
            />
          </span>
        </button>
      </div>
      <button
        data-hamburger
        aria-label="Open menu"
        style={{
          display: "none",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 7,
          width: 44,
          height: 44,
          background: "transparent",
          border: "none",
          padding: 0,
        }}
      >
        <span data-hline="1" style={{ width: 22, height: 1.5, background: "var(--fg)", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)" }} />
        <span data-hline="2" style={{ width: 22, height: 1.5, background: "var(--fg)", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)" }} />
      </button>
    </nav>
  );
}

const MENU_ITEMS: Array<{ num: string; label: string; href: string; italic?: boolean; download?: string }> = [
  { num: "01", label: "Work", href: "#work" },
  { num: "02", label: "Engine", href: "#engine", italic: true },
  { num: "03", label: "About", href: "#about" },
  { num: "04", label: "Contact", href: "#contact", italic: true },
  { num: "05", label: "CV", href: RESUME_URL, download: "Aman_Goel_Resume.pdf" },
];

export function MobileMenu() {
  return (
    <div
      data-mmenu
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 58,
        background: bg(0.98),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 10vw",
        opacity: 0,
        pointerEvents: "none",
        transition: "opacity 0.45s ease",
      }}
    >
      <div style={{ ...mono(10, "0.35em", fg(0.4)), marginBottom: "5vh" }}>MENU — AMAN GOEL</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {MENU_ITEMS.map((item) => (
          <a
            key={item.num}
            href={item.href}
            data-mlink
            {...(item.download ? { download: item.download } : {})}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 18,
              textDecoration: "none",
              color: "var(--fg)",
              opacity: 0,
              transform: "translateY(18px)",
            }}
          >
            <span data-ac="c" style={{ ...mono(11, "0.25em", ACCENT) }}>
              {item.num}
            </span>
            <span
              style={{
                fontFamily: SERIF,
                fontStyle: item.italic ? "italic" : "normal",
                fontSize: "clamp(38px,9vw,64px)",
                lineHeight: 1.1,
              }}
            >
              {item.label}
            </span>
          </a>
        ))}
      </div>
      <button
        data-mtheme
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "transparent",
          border: "none",
          padding: 0,
          marginTop: "7vh",
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.28em",
          color: fg(0.55),
        }}
      >
        <span data-ac="b" style={{ width: 8, height: 8, borderRadius: "50%", background: ACCENT }} />
        <span data-mthemelabel>SWITCH TO DAY</span>
      </button>
    </div>
  );
}
