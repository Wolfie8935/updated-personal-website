import { caseStudies } from "@/components/modern/content";
import { ACCENT, MONO, SERIF, bg, fg, mono, serif } from "@/components/modern/design/ui";

/**
 * Full-screen layers: case-study panels (slide up over the page), the Konami
 * "Retro Rally" game and the hidden terminal. engine.ts owns open/close,
 * input and the game loop.
 */

export function CaseStudies() {
  return (
    <div data-csroot style={{ position: "fixed", inset: 0, zIndex: 88, pointerEvents: "none", visibility: "hidden" }}>
      {caseStudies.map((cs, i) => (
        <article
          key={cs.idx}
          data-cspanel={i}
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--bg)",
            color: "var(--fg)",
            transform: "translateY(103%)",
            overflowY: "auto",
            overflowX: "hidden",
            overscrollBehavior: "contain",
            willChange: "transform",
          }}
        >
          {/* sticky header */}
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 20,
              padding: "16px 6vw",
              background: bg(0.85),
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderBottom: `1px solid ${fg(0.08)}`,
              ...mono(11, "0.25em"),
            }}
          >
            <span data-ac="c" style={{ color: ACCENT, whiteSpace: "nowrap" }}>
              CASE STUDY — {cs.idx} / 03
            </span>
            <span data-cstags style={{ color: fg(0.4), whiteSpace: "nowrap" }}>
              {cs.tags}
            </span>
            <button
              data-csclose
              className="m-hover-accent-border"
              style={{
                background: "transparent",
                border: `1px solid ${fg(0.22)}`,
                color: "var(--fg)",
                ...mono(10, "0.25em"),
                padding: "10px 16px",
                whiteSpace: "nowrap",
              }}
            >
              CLOSE — ESC
            </button>
          </div>

          {/* title + meta */}
          <div style={{ padding: "11vh 6vw 9vh", borderBottom: `1px solid ${fg(0.08)}` }}>
            <h2 style={{ margin: 0, ...serif("clamp(52px,9.5vw,140px)", { lineHeight: 0.95, letterSpacing: "-0.015em" }) }}>{cs.title}</h2>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(19px,2.2vw,30px)", color: fg(0.55), marginTop: 20 }}>
              {cs.sub}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 34, marginTop: "8vh" }}>
              {cs.meta.map((mt) => (
                <div key={mt.k} style={{ borderTop: `1px solid ${fg(0.14)}`, paddingTop: 18 }}>
                  <div style={mono(10, "0.3em", fg(0.4))}>{mt.k}</div>
                  <div style={{ fontSize: 15, marginTop: 12, color: fg(0.8), lineHeight: 1.6 }}>{mt.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* problem */}
          <div
            data-csgrid
            style={{
              padding: "11vh 6vw",
              borderBottom: `1px solid ${fg(0.08)}`,
              display: "grid",
              gridTemplateColumns: "minmax(150px,0.32fr) 1fr",
              gap: "5vw",
              alignItems: "start",
            }}
          >
            <div data-ac="c" style={mono(11, "0.35em", ACCENT)}>
              THE PROBLEM
            </div>
            <p style={{ margin: 0, maxWidth: 980, fontFamily: SERIF, fontSize: "clamp(24px,2.6vw,40px)", lineHeight: 1.42 }}>{cs.problem}</p>
          </div>

          {/* system flow */}
          <div style={{ padding: "11vh 6vw", borderBottom: `1px solid ${fg(0.08)}` }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: 20,
                flexWrap: "wrap",
                marginBottom: "6vh",
              }}
            >
              <div data-ac="c" style={mono(11, "0.35em", ACCENT)}>
                THE SYSTEM
              </div>
              <div style={mono(11, "0.25em", fg(0.4))}>{cs.flowTitle}</div>
            </div>
            {cs.flow.map((st) => (
              <div
                key={st.s}
                data-csgrid
                className="m-hoverrow-faint"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(150px,0.32fr) 1fr",
                  gap: "5vw",
                  borderTop: `1px solid ${fg(0.1)}`,
                  padding: "30px 0",
                  alignItems: "baseline",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span data-ac="b" style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, flex: "none" }} />
                  <span style={mono(13, "0.3em")}>{st.s}</span>
                </div>
                <div style={{ fontSize: 15.5, lineHeight: 1.75, color: fg(0.55), maxWidth: 760 }}>{st.d}</div>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${fg(0.1)}` }} />
          </div>

          {/* key decisions */}
          <div style={{ padding: "11vh 6vw", borderBottom: `1px solid ${fg(0.08)}` }}>
            <div data-ac="c" style={{ ...mono(11, "0.35em", ACCENT), marginBottom: "6vh" }}>
              SHOT SELECTION — KEY DECISIONS
            </div>
            {cs.decisions.map((dec) => (
              <div
                key={dec.n}
                data-csgrid
                className="m-hoverrow-faint"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(150px,0.32fr) 1fr",
                  gap: "5vw",
                  borderTop: `1px solid ${fg(0.1)}`,
                  padding: "42px 0",
                  alignItems: "baseline",
                }}
              >
                <div data-ac="c" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(24px,2.2vw,34px)", color: ACCENT }}>
                  {dec.n}
                </div>
                <div style={{ maxWidth: 760 }}>
                  <div style={{ fontFamily: SERIF, fontSize: "clamp(24px,2.4vw,36px)", lineHeight: 1.15 }}>{dec.t}</div>
                  <p style={{ margin: "18px 0 0", fontSize: 15.5, lineHeight: 1.75, color: fg(0.55) }}>{dec.b}</p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${fg(0.1)}` }} />
          </div>

          {/* outcomes */}
          <div style={{ padding: "11vh 6vw 9vh" }}>
            <div data-ac="c" style={{ ...mono(11, "0.35em", ACCENT), marginBottom: "6vh" }}>
              THE SCORELINE — OUTCOMES
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 44 }}>
              {cs.outcomes.map((oc) => (
                <div key={oc.l} style={{ borderTop: `1px solid ${fg(0.14)}`, paddingTop: 24 }}>
                  <div style={{ fontFamily: SERIF, fontSize: "clamp(44px,4.2vw,64px)", lineHeight: 1 }}>{oc.v}</div>
                  <div style={{ ...mono(10.5, "0.22em", fg(0.45)), marginTop: 14, lineHeight: 1.9 }}>{oc.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* footer: real links + footnote + next case */}
          <div
            style={{
              margin: "0 6vw",
              padding: "8vh 0 10vh",
              borderTop: `1px solid ${fg(0.1)}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap", ...mono(11, "0.25em") }}>
                {cs.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="m-hover-dim"
                    style={{ color: ACCENT, textDecoration: "none" }}
                  >
                    {l.label}&nbsp;↗
                  </a>
                ))}
              </div>
              <div style={mono(10.5, "0.25em", fg(0.4))}>{cs.footnote}</div>
            </div>
            <button
              data-csnext={cs.nextIdx}
              className="m-hover-accent"
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                textAlign: "right",
                color: "var(--fg)",
                fontFamily: SERIF,
                fontSize: "clamp(24px,2.6vw,40px)",
              }}
            >
              <span style={{ ...mono(10, "0.3em", fg(0.4)), display: "block", marginBottom: 10, textAlign: "right" }}>NEXT CASE</span>
              <span>{cs.nextLabel}</span>{" "}
              <span data-ac="c" style={{ color: ACCENT }}>
                →
              </span>
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export function RetroRally() {
  return (
    <div data-game style={{ position: "fixed", inset: 0, zIndex: 152, background: "#070605", display: "none" }}>
      <canvas data-gamecv style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "repeating-linear-gradient(transparent 0px, transparent 2px, rgba(0,0,0,0.26) 2px, rgba(0,0,0,0.26) 4px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 26,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 56,
          fontFamily: MONO,
          letterSpacing: "0.3em",
          color: "#EAE4D8",
          pointerEvents: "none",
        }}
      >
        <span style={{ fontSize: 12, opacity: 0.65, display: "flex", alignItems: "baseline", gap: 14 }}>
          YOU{" "}
          <span data-gsyou style={{ fontSize: 32, color: ACCENT, letterSpacing: 0 }}>
            0
          </span>
        </span>
        <span style={{ fontSize: 11, opacity: 0.35 }}>COURT ROYALE — FIRST TO 5</span>
        <span style={{ fontSize: 12, opacity: 0.65, display: "flex", alignItems: "baseline", gap: 14 }}>
          <span data-gseng style={{ fontSize: 32, letterSpacing: 0 }}>
            0
          </span>{" "}
          THE ENGINE
        </span>
      </div>
      <div
        data-gmsg
        style={{
          position: "absolute",
          top: "60%",
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "clamp(20px,3vw,34px)",
          color: ACCENT,
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.4s",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 26,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 44,
          ...mono(10, "0.3em", "rgba(234,228,216,0.4)"),
          pointerEvents: "none",
        }}
      >
        <span>MOVE — MOUSE / TOUCH</span>
        <span>ESC — WALK OFF</span>
      </div>
      <button
        data-gexit
        className="m-hover-accent-border"
        style={{
          position: "absolute",
          top: 24,
          right: 28,
          background: "transparent",
          border: "1px solid rgba(234,228,216,0.25)",
          color: "#EAE4D8",
          ...mono(10, "0.25em"),
          padding: "10px 16px",
        }}
      >
        EXIT ✕
      </button>
    </div>
  );
}

export function Terminal() {
  return (
    <div
      data-term
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 154,
        background: "#070605",
        display: "none",
        flexDirection: "column",
        padding: "5vh 6vw 4vh",
        fontFamily: MONO,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          fontSize: 10,
          letterSpacing: "0.3em",
          color: "rgba(234,228,216,0.35)",
          borderBottom: "1px solid rgba(234,228,216,0.12)",
          paddingBottom: 16,
        }}
      >
        <span>AMAN—OS v9.79 — REASONING SHELL</span>
        <span>` OR ESC — EXIT</span>
      </div>
      <div
        data-termlog
        style={{ flex: 1, overflowY: "auto", fontSize: 13, lineHeight: 2.1, color: "#EAE4D8", whiteSpace: "pre-wrap", padding: "3vh 0" }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          borderTop: "1px solid rgba(234,228,216,0.12)",
          paddingTop: 16,
          fontSize: 13,
        }}
      >
        <span style={{ color: ACCENT, whiteSpace: "nowrap" }}>aman@portfolio:~$</span>
        <input
          data-termin
          type="text"
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: MONO,
            fontSize: 13,
            color: "#EAE4D8",
            caretColor: ACCENT,
          }}
        />
      </div>
    </div>
  );
}
