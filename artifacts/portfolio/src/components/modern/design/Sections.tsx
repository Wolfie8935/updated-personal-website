import type { CSSProperties } from "react";
import {
  EMAIL,
  LINKS,
  aboutStats,
  aboutWords,
  ascent,
  capabilities,
  experience,
  firstCourtStats,
  mailChars,
  principles,
  publications,
  tickerA,
  tickerB,
} from "@/components/modern/content";
import { TennisBallSvg } from "@/components/modern/design/Chrome";
import { ACCENT, MONO, SERIF, bg, fg, mono, revealHidden, serif } from "@/components/modern/design/ui";

/* ============ HERO ============ */

function HeroWord({ word, italic, accentDot }: { word: string; italic?: boolean; accentDot?: boolean }) {
  const clipPad: CSSProperties = italic
    ? { padding: "0 0.05em 0.08em 0" }
    : { paddingBottom: "0.08em" };
  const letters = word.split("").map((ch, i) => (
    <span
      key={i}
      data-lclip
      style={{ display: "inline-block", overflow: "hidden", ...clipPad, marginBottom: "-0.08em", verticalAlign: "top" }}
    >
      <span data-ltr style={{ display: "inline-block", transform: "translateY(118%)", willChange: "transform" }}>
        {ch}
      </span>
    </span>
  ));
  return (
    <span style={{ display: "block", fontStyle: italic ? "italic" : undefined }}>
      {letters}
      {accentDot && (
        <span
          data-lclip
          style={{ display: "inline-block", overflow: "hidden", ...clipPad, marginBottom: "-0.08em", verticalAlign: "top" }}
        >
          <span data-ltr data-ac="c" style={{ display: "inline-block", transform: "translateY(118%)", willChange: "transform", color: ACCENT }}>
            .
          </span>
        </span>
      )}
    </span>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 640,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div data-plx="0.12" style={{ position: "absolute", top: "-14vh", right: "-12vw", width: "48vw", height: "48vw", pointerEvents: "none" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,166,107,0.10) 0%, transparent 62%)",
            animation: "m-breathe 9s ease-in-out infinite",
          }}
        />
      </div>
      <div data-plx="0.22" style={{ position: "absolute", left: "6vw", bottom: "8vh", width: "30vw", height: "30vw", pointerEvents: "none" }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", overflow: "visible", display: "block", animation: "m-spinslow 90s linear infinite" }}>
          <circle
            cx="50"
            cy="50"
            r="49.5"
            fill="none"
            stroke="rgba(201,166,107,0.20)"
            strokeWidth="0.35"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset="100"
            style={{ animation: "m-draw 3s cubic-bezier(0.16,1,0.3,1) 1s forwards" }}
          />
          <circle cx="50" cy="0.5" r="1.2" fill="rgba(201,166,107,0.55)" />
        </svg>
      </div>

      <div data-heroc style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px" }}>
        <div data-mag>
          <div
            data-intro="0.95"
            data-decode
            data-hfade
            style={{ ...mono(12, "0.45em", fg(0.5)), marginBottom: "4vh", opacity: 0, transform: "translateY(16px)" }}
          >
            PORTFOLIO — MMXXVI
          </div>
          <h1 style={{ margin: 0, ...serif("clamp(88px, 16.5vw, 250px)", { lineHeight: 0.92, letterSpacing: "-0.02em" }) }}>
            <HeroWord word="Aman" />
            <HeroWord word="Goel" italic accentDot />
          </h1>
          <div
            data-intro="1.15"
            data-hfade
            style={{ ...mono(12, "0.32em", fg(0.5)), marginTop: "5vh", opacity: 0, transform: "translateY(16px)" }}
          >
            REASONING ENGINES&nbsp;&nbsp;·&nbsp;&nbsp;ML PIPELINES&nbsp;&nbsp;·&nbsp;&nbsp;SYSTEMS THAT HOLD UNDER LOAD
          </div>
        </div>
      </div>

      {/* throwable tennis ball */}
      <div data-orb style={{ position: "absolute", left: 0, top: 0, zIndex: 3, width: 64, height: 64, willChange: "transform", touchAction: "none" }}>
        <TennisBallSvg size={64} gradientId="orbg" />
      </div>
      <div
        data-orblabel
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 3,
          ...mono(9, "0.32em", fg(0.45)),
          pointerEvents: "none",
          transition: "opacity 0.6s",
          whiteSpace: "nowrap",
        }}
      >
        THROW ME
      </div>

      <div
        data-herobar
        data-intro="1.4"
        data-hfade
        style={{
          position: "absolute",
          bottom: 36,
          left: 40,
          right: 40,
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          ...mono(11, "0.22em", fg(0.45)),
          opacity: 0,
          transform: "translateY(16px)",
        }}
      >
        <div>FORMER INDIAN TENNIS PLAYER</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 10 }}>SCROLL</div>
          <div
            style={{
              width: 1,
              height: 56,
              background: `linear-gradient(${fg(0.6)}, transparent)`,
              animation: "m-scrollline 2.4s ease-in-out infinite",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span data-ac="b" style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, animation: "m-pulse 2.6s ease-in-out infinite" }} />
          <span>OPEN TO 2026 ROLES</span>
        </div>
      </div>
    </section>
  );
}

/* ============ TICKER (velocity-reactive) ============ */

function TickerRowA({ hidden }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} style={{ display: "flex", alignItems: "center", gap: 44, paddingRight: 44 }}>
      {tickerA.map((t) => (
        <span key={t} style={{ display: "contents" }}>
          <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(36px,4.4vw,60px)", color: fg(0.34), whiteSpace: "nowrap" }}>
            {t}
          </span>
          <span data-ac="c" style={{ color: ACCENT, fontSize: 14 }}>
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

function TickerRowB({ hidden }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} style={{ display: "flex", alignItems: "center", gap: 56, paddingRight: 56 }}>
      {tickerB.map((t) => (
        <span key={t} style={{ display: "contents" }}>
          <span style={{ ...mono(12, "0.35em", fg(0.3)), whiteSpace: "nowrap" }}>{t}</span>
          <span style={{ width: 5, height: 5, background: fg(0.25), transform: "rotate(45deg)" }} />
        </span>
      ))}
    </div>
  );
}

export function Ticker() {
  return (
    <section
      style={{
        padding: "9vh 0",
        borderTop: `1px solid ${fg(0.08)}`,
        borderBottom: `1px solid ${fg(0.08)}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <div data-mq="1" style={{ display: "flex", width: "max-content", willChange: "transform" }}>
        <TickerRowA />
        <TickerRowA hidden />
      </div>
      <div data-mq="-1" style={{ display: "flex", width: "max-content", willChange: "transform" }}>
        <TickerRowB />
        <TickerRowB hidden />
      </div>
    </section>
  );
}

/* ============ ABOUT ============ */

export function About() {
  return (
    <section id="about" style={{ padding: "22vh 8vw" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "9vh" }}>
        <div data-reveal data-decode data-ac="c" style={{ ...mono(12, "0.35em", ACCENT), ...revealHidden }}>
          01 — THE WARM-UP · ABOUT
        </div>
        <div data-reveal data-rd="2" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: fg(0.45), ...revealHidden }}>
          Footwork first — in tennis and in systems.
        </div>
      </div>
      <p
        data-wordwrap
        style={{ margin: 0, maxWidth: 1100, fontFamily: SERIF, fontSize: "clamp(30px, 3.4vw, 54px)", lineHeight: 1.3, letterSpacing: "0.005em" }}
      >
        {aboutWords.map((w, i) => (
          <span key={i} data-w style={{ display: "inline-block", marginRight: "0.26em", opacity: 0.13 }}>
            {w}
          </span>
        ))}
      </p>
      <div style={{ marginTop: "14vh", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48 }}>
        {aboutStats.map((s, i) => (
          <div key={s.label} data-reveal data-rd={i || undefined} style={{ borderTop: `1px solid ${fg(0.14)}`, paddingTop: 26, ...revealHidden }}>
            <div data-count={s.count} data-dec={s.dec || undefined} data-suf={s.suf || undefined} style={serif("clamp(48px,4.6vw,70px)", { lineHeight: 1 })}>
              {s.start}
            </div>
            <div style={{ ...mono(11, "0.22em", fg(0.45)), marginTop: 16 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ SELECTED WORK (hidden horizontal rail) ============ */

const wcardStyle: CSSProperties = {
  flex: "none",
  width: "min(74vw, 980px)",
  height: "64vh",
  minHeight: 440,
  border: `1px solid ${fg(0.12)}`,
  background: "var(--panel)",
  padding: "clamp(28px,4vw,56px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  position: "relative",
  overflow: "hidden",
  willChange: "transform",
};

const wcardGhostNum: CSSProperties = {
  position: "absolute",
  right: "-2vw",
  bottom: "-8vh",
  fontFamily: SERIF,
  fontStyle: "italic",
  fontSize: "22vw",
  lineHeight: 1,
  color: fg(0.04),
  pointerEvents: "none",
};

function WcardFooter({ left }: { left: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...mono(11, "0.25em", fg(0.4)) }}>
      <span>{left}</span>
      <span data-ac="c" style={{ ...mono(11, "0.25em", ACCENT) }}>
        OPEN CASE STUDY&nbsp;↗
      </span>
    </div>
  );
}

export function WorkRail() {
  return (
    <div id="work" data-hwrap style={{ position: "relative", height: "560vh" }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div
          data-hhead
          style={{
            position: "absolute",
            top: 40,
            left: "8vw",
            right: "8vw",
            display: "flex",
            justifyContent: "space-between",
            ...mono(12, "0.35em"),
            opacity: 0,
            zIndex: 3,
          }}
        >
          <span data-ac="c" style={{ color: ACCENT }}>
            02 — THE RALLY · SELECTED WORK
          </span>
          <span style={{ color: fg(0.45) }}>
            <span data-hcount>01</span>&nbsp;/&nbsp;03
          </span>
        </div>
        <div data-htrack style={{ display: "flex", alignItems: "center", gap: "5vw", padding: "0 8vw", willChange: "transform" }}>
          {/* 01 — CERAS */}
          <article data-wcard style={wcardStyle}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "repeating-radial-gradient(circle at 82% 22%, rgba(201,166,107,0.075) 0px, rgba(201,166,107,0.075) 1px, transparent 1px, transparent 56px)",
                animation: "m-breathe 11s ease-in-out infinite",
              }}
            />
            <div style={wcardGhostNum}>01</div>
            <div style={{ display: "flex", justifyContent: "space-between", ...mono(11, "0.25em") }}>
              <span data-ac="c" style={{ color: ACCENT }}>
                FEATURED · 01
              </span>
              <span style={{ color: fg(0.4) }}>FASTAPI · ASYNC · DISTRIBUTED LLM</span>
            </div>
            <div>
              <h2 style={{ margin: 0, ...serif("clamp(56px,7.5vw,110px)", { lineHeight: 0.95, letterSpacing: "-0.01em" }) }}>CERAS</h2>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(18px,1.8vw,26px)", color: fg(0.5), marginTop: 14 }}>
                Cognitive Efficiency &amp; Reasoning Alignment System
              </div>
              <p style={{ margin: "28px 0 0", maxWidth: 560, fontSize: 16, lineHeight: 1.75, color: fg(0.55) }}>
                A full-stack reasoning platform: a Tree-of-Thoughts engine built from scratch — multi-stage planning, verification-based
                validation, greedy path selection — behind async pipelines with dynamic model routing. Telemetry becomes a CE score that
                adapts task decomposition to each user.
              </p>
            </div>
            <WcardFooter left="TREE-OF-THOUGHTS — BUILT FROM SCRATCH" />
          </article>

          {/* 02 — Cyclone */}
          <article data-wcard style={wcardStyle}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "repeating-radial-gradient(circle at 12% 82%, rgba(201,166,107,0.08) 0px, rgba(201,166,107,0.08) 1px, transparent 1px, transparent 30px)",
                animation: "m-breathe 13s ease-in-out infinite",
              }}
            />
            <div style={wcardGhostNum}>02</div>
            <div style={{ display: "flex", justifyContent: "space-between", ...mono(11, "0.25em") }}>
              <span data-ac="c" style={{ color: ACCENT }}>
                02 · IEEE
              </span>
              <span style={{ color: fg(0.4) }}>PYTHON · SCALABLE ML · FEATURE ENGINEERING</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "6vw" }}>
              <div>
                <h2 style={{ margin: 0, ...serif("clamp(40px,4.6vw,72px)", { lineHeight: 1, letterSpacing: "-0.01em" }) }}>Cyclone Intensity</h2>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(18px,1.8vw,26px)", color: fg(0.5), marginTop: 12 }}>
                  Prediction at scale
                </div>
                <p style={{ margin: "26px 0 0", maxWidth: 460, fontSize: 16, lineHeight: 1.75, color: fg(0.55) }}>
                  A multi-stage pipeline over 1M+ data points — engineered features, optimized learning workflows, and prediction error
                  below every baseline.
                </p>
              </div>
              <div>
                <div data-ac="c" style={{ fontFamily: SERIF, fontSize: "clamp(72px,8vw,130px)", lineHeight: 1, color: ACCENT }}>
                  0.993
                </div>
                <div style={{ ...mono(11, "0.3em", fg(0.45)), marginTop: 12 }}>R² — COEFFICIENT OF DETERMINATION</div>
              </div>
            </div>
            <WcardFooter left="1,000,000+ DATA POINTS" />
          </article>

          {/* 03 — GenAI Chatbot */}
          <article data-wcard style={wcardStyle}>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(rgba(201,166,107,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,166,107,0.05) 1px, transparent 1px)",
                backgroundSize: "46px 46px",
                animation: "m-breathe 12s ease-in-out infinite",
              }}
            />
            <div style={wcardGhostNum}>03</div>
            <div style={{ display: "flex", justifyContent: "space-between", ...mono(11, "0.25em") }}>
              <span data-ac="c" style={{ color: ACCENT }}>
                03 · INTEL UNNATI
              </span>
              <span style={{ color: fg(0.4) }}>LLAMA · ETL · PEFT</span>
            </div>
            <div>
              <h2 style={{ margin: 0, ...serif("clamp(40px,4.6vw,72px)", { lineHeight: 1, letterSpacing: "-0.01em" }) }}>GenAI Chatbot</h2>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 18,
                  marginTop: 30,
                  fontFamily: MONO,
                  fontSize: "clamp(13px,1.4vw,18px)",
                  letterSpacing: "0.2em",
                  color: fg(0.7),
                }}
              >
                <span>ETL</span>
                <span data-ac="c" style={{ color: ACCENT }}>
                  →
                </span>
                <span>TOKENIZE</span>
                <span data-ac="c" style={{ color: ACCENT }}>
                  →
                </span>
                <span>BATCH</span>
                <span data-ac="c" style={{ color: ACCENT }}>
                  →
                </span>
                <span>INFER</span>
              </div>
              <p style={{ margin: "28px 0 0", maxWidth: 520, fontSize: 16, lineHeight: 1.75, color: fg(0.55) }}>
                An end-to-end LLM inference pipeline running on CPU — LLaMA with Intel Extension for Transformers, tuned for long-running
                summarization workloads.
              </p>
            </div>
            <WcardFooter left="CPU-OPTIMIZED INFERENCE" />
          </article>
        </div>
        <div
          data-doorcue
          style={{ position: "absolute", left: 0, right: 0, bottom: "5vh", display: "flex", justifyContent: "center", opacity: 0, zIndex: 4, pointerEvents: "none" }}
        >
          <span
            style={{
              ...mono(11, "0.3em", ACCENT),
              border: "1px solid rgba(201,166,107,0.45)",
              padding: "14px 24px",
              background: bg(0.82),
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            CLICK ANYWHERE — ENTER THE CASE STUDY&nbsp;↗
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============ THE REASONING ENGINE (interactive 3D) ============ */

export function ReasoningEngine() {
  return (
    <section id="engine" style={{ position: "relative", padding: "16vh 0 6vh", overflow: "hidden", borderTop: `1px solid ${fg(0.08)}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 8vw", marginBottom: "4vh" }}>
        <div data-reveal data-decode data-ac="c" style={{ ...mono(12, "0.35em", ACCENT), ...revealHidden }}>
          03 — THE REASONING ENGINE
        </div>
        <div data-reveal data-rd="2" style={{ ...mono(11, "0.25em", fg(0.4)), ...revealHidden }}>
          DRAG TO ORBIT · CLICK TO TRACE · IT FIRES ON ITS OWN
        </div>
      </div>
      <div data-reveal data-rd="1" style={{ position: "relative", height: "78vh", minHeight: 520, ...revealHidden }}>
        <canvas data-treegl style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }} />
        <canvas data-tree style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", cursor: "grab", touchAction: "none" }} />
        <div
          data-tree-tip
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
            opacity: 0,
            ...mono(10, "0.2em"),
            color: "var(--fg)",
            background: bg(0.92),
            border: "1px solid rgba(201,166,107,0.45)",
            padding: "8px 14px",
            whiteSpace: "nowrap",
            transition: "opacity 0.25s",
          }}
        />
        <div style={{ position: "absolute", left: "8vw", bottom: 24, pointerEvents: "none", maxWidth: 420 }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(19px,1.9vw,26px)", color: fg(0.8) }}>
            The Tree of Thoughts — CERAS&apos; reasoning core, in orbit.
          </div>
          <div style={{ ...mono(10.5, "0.22em", fg(0.4)), marginTop: 14, lineHeight: 1.9 }}>
            EVERY QUERY BRANCHES INTO PLANS, VERIFICATIONS,
            <br />
            AND PATHS — THE GOLD LINE IS THE ONE IT KEEPS.
          </div>
        </div>
        <div style={{ position: "absolute", right: "8vw", bottom: 24, pointerEvents: "none", textAlign: "right", ...mono(11, "0.25em") }}>
          <div data-tree-stage data-ac="c" style={{ color: ACCENT }}>
            GREEDY PATH — AUTO-SELECTED
          </div>
          <div style={{ color: fg(0.35), marginTop: 10 }}>51 NODES · 4 STAGES · WEBGL — LIVE</div>
        </div>
      </div>
    </section>
  );
}

/* ============ HOW I THINK ============ */

export function Principles() {
  return (
    <section style={{ padding: "20vh 8vw 8vh", borderTop: `1px solid ${fg(0.08)}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "9vh" }}>
        <div data-reveal data-decode data-ac="c" style={{ ...mono(12, "0.35em", ACCENT), ...revealHidden }}>
          04 — FOOTWORK · HOW I THINK
        </div>
        <div data-reveal data-rd="2" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 19, color: fg(0.45), ...revealHidden }}>
          Four principles, carried from the court.
        </div>
      </div>
      {principles.map((p, i) => (
        <div
          key={p.num}
          data-prow
          data-reveal
          data-rd={i || undefined}
          className="m-hoverrow"
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr 1.1fr",
            gap: 40,
            alignItems: "baseline",
            borderTop: `1px solid ${fg(0.12)}`,
            padding: "52px 0",
            ...revealHidden,
          }}
        >
          <div data-ac="c" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "clamp(26px,2.4vw,38px)", color: ACCENT }}>
            {p.num}
          </div>
          <div style={{ fontFamily: SERIF, fontSize: "clamp(28px,3vw,48px)", lineHeight: 1.12, letterSpacing: "-0.005em" }}>{p.title}</div>
          <div style={{ fontSize: 15.5, lineHeight: 1.75, color: fg(0.55) }}>{p.gloss}</div>
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${fg(0.12)}` }} />
    </section>
  );
}

/* ============ EXPERIENCE ============ */

export function Experience() {
  return (
    <section style={{ padding: "20vh 8vw 14vh" }}>
      <div data-reveal data-decode data-ac="c" style={{ ...mono(12, "0.35em", ACCENT), marginBottom: "8vh", ...revealHidden }}>
        05 — SEASONS · EXPERIENCE
      </div>
      <div data-exprows style={{ position: "relative" }}>
        <svg data-expsvg style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none", zIndex: 1 }}>
          <path data-exppath fill="none" stroke="rgba(201,166,107,0.55)" strokeWidth="1.3" />
        </svg>
        <div
          data-expball
          data-ac="b"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: ACCENT,
            boxShadow: "0 0 20px rgba(201,166,107,0.55)",
            pointerEvents: "none",
            zIndex: 2,
            willChange: "transform",
            opacity: 0,
          }}
        />
        {experience.map((job, i) => (
          <div
            key={job.org}
            data-exprow
            data-reveal
            data-rd={i || undefined}
            className="m-hoverrow"
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr 1.1fr",
              gap: 40,
              alignItems: "baseline",
              borderTop: `1px solid ${fg(0.12)}`,
              padding: "46px 0 46px 110px",
              ...revealHidden,
            }}
          >
            <div style={mono(12, "0.2em", fg(0.4))}>{job.period}</div>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: "clamp(26px,2.6vw,38px)", lineHeight: 1.1 }}>{job.role}</div>
              <div data-ac="c" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 17, color: ACCENT, marginTop: 10 }}>
                {job.org}
              </div>
            </div>
            <div style={{ fontSize: 15.5, lineHeight: 1.75, color: fg(0.55) }}>{job.desc}</div>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${fg(0.12)}` }} />
      </div>
    </section>
  );
}

/* ============ CAPABILITIES (tilt cards) ============ */

export function Capabilities() {
  return (
    <section style={{ padding: "14vh 8vw" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8vh" }}>
        <div data-reveal data-decode data-ac="c" style={{ ...mono(12, "0.35em", ACCENT), ...revealHidden }}>
          06 — THE KIT · CAPABILITIES
        </div>
        <div data-reveal data-rd="2" style={{ ...mono(11, "0.25em", fg(0.4)), ...revealHidden }}>
          HOVER — THE CARDS HAVE DEPTH
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 36 }}>
        {capabilities.map((col, i) => (
          <div
            key={col.num}
            data-tilt
            data-reveal
            data-rd={i || undefined}
            style={{
              position: "relative",
              border: `1px solid ${fg(0.12)}`,
              background: "var(--panel)",
              padding: "46px 42px 52px",
              ...revealHidden,
              willChange: "transform",
              overflow: "hidden",
            }}
          >
            <div data-glare style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0, transition: "opacity 0.4s" }} />
            <div
              style={{
                position: "absolute",
                top: -28,
                right: 6,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 120,
                lineHeight: 1,
                color: fg(0.05),
                pointerEvents: "none",
              }}
            >
              {col.num}
            </div>
            <div style={{ ...mono(11, "0.3em", fg(0.45)), borderBottom: `1px solid ${fg(0.14)}`, paddingBottom: 18, marginBottom: 28 }}>
              {col.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
              {col.items.map((it) => (
                <span key={it} className="m-capitem" style={{ fontSize: 16, color: fg(0.55) }}>
                  {it}
                </span>
              ))}
            </div>
            <div data-ac="c" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: ACCENT, marginTop: 34 }}>
              {col.note}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ RECOGNITION (the ascent) ============ */

export function Recognition() {
  return (
    <section style={{ padding: "14vh 8vw 16vh", position: "relative", overflow: "hidden" }}>
      <div
        data-plx="0.06"
        style={{
          position: "absolute",
          top: "8vh",
          right: "-4vw",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "16vw",
          lineHeight: 1,
          color: fg(0.028),
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        the ascent
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8vh" }}>
        <div data-reveal data-decode data-ac="c" style={{ ...mono(12, "0.35em", ACCENT), ...revealHidden }}>
          07 — THE ASCENT · RECOGNITION
        </div>
        <div data-reveal data-rd="2" style={{ ...mono(11, "0.25em", fg(0.4)), ...revealHidden }}>
          A STAIRCASE, READ FROM THE SUMMIT — 2025 AT THE TOP
        </div>
      </div>
      {ascent.map((r) => (
        <div
          key={r.event}
          data-reveal
          data-rrow
          data-tag={r.tag}
          data-rd={r.rd || undefined}
          style={{
            position: "relative",
            marginLeft: r.indent,
            display: "flex",
            alignItems: "baseline",
            gap: 32,
            borderTop: `1px solid ${fg(0.14)}`,
            padding: "26px 0 26px 22px",
            ...revealHidden,
            transition: "padding-left 0.5s cubic-bezier(0.16,1,0.3,1), background 0.5s",
            cursor: "default",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: -1,
              width: 1,
              background: "linear-gradient(rgba(201,166,107,0.5), rgba(201,166,107,0.05))",
            }}
          />
          <div
            data-rrank
            data-ac="c"
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "clamp(22px,2vw,32px)",
              color: ACCENT,
              width: 150,
              flex: "none",
              transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {r.rank}
          </div>
          <div style={{ fontSize: 16.5, flex: 1, minWidth: 220, letterSpacing: "0.01em" }}>{r.event}</div>
          <div style={{ ...mono(11, "0.2em", fg(0.4)), flex: "none" }}>{r.year}</div>
        </div>
      ))}
      <div style={{ borderTop: `1px solid ${fg(0.14)}` }} />
      <div
        data-reveal
        style={{
          marginTop: "7vh",
          display: "flex",
          justifyContent: "space-between",
          gap: 40,
          flexWrap: "wrap",
          ...mono(10.5, "0.22em", fg(0.38)),
          lineHeight: 2,
          ...revealHidden,
        }}
      >
        <span>ALSO — SPORTSPERSON OF THE YEAR, CONSECUTIVE YEARS · DISTRICT, STATE &amp; NATIONAL LAWN-TENNIS TITLES</span>
        <span>PROJECT LEAD — SRCC CONSTRUCTION · INTEL UNNATI INDUSTRIAL TRAINING</span>
        <span>
          PUBLISHED —{" "}
          {publications.map((p, i) => (
            <span key={p.label} style={{ display: "contents" }}>
              {i > 0 && " · "}
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="m-hover-accent"
                style={{ color: fg(0.38), textDecoration: "none" }}
                title={p.title}
              >
                {p.label}&nbsp;↗
              </a>
            </span>
          ))}
        </span>
      </div>
    </section>
  );
}

/* ============ THE FIRST COURT ============ */

export function FirstCourt() {
  return (
    <section style={{ padding: "18vh 8vw", borderTop: `1px solid ${fg(0.08)}`, position: "relative", overflow: "hidden" }}>
      <div
        data-plx="0.05"
        style={{
          position: "absolute",
          bottom: "4vh",
          left: "-4vw",
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: "15vw",
          lineHeight: 1,
          color: fg(0.028),
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        baseline
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8vh" }}>
        <div data-reveal data-decode data-ac="c" style={{ ...mono(12, "0.35em", ACCENT), ...revealHidden }}>
          08 — THE FIRST COURT
        </div>
        <div data-reveal data-rd="2" style={{ ...mono(11, "0.25em", fg(0.4)), ...revealHidden }}>
          TEN YEARS BEFORE THE TERMINAL
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "6vw", alignItems: "start" }}>
        <div data-reveal style={revealHidden}>
          <h3 style={{ margin: 0, ...serif("clamp(32px,3.6vw,56px)", { lineHeight: 1.15, letterSpacing: "-0.005em" }) }}>
            The first system I ever optimized was a{" "}
            <span data-ac="c" style={{ fontStyle: "italic", color: ACCENT }}>
              serve
            </span>
            .
          </h3>
          <p style={{ margin: "5vh 0 0", maxWidth: 560, fontSize: 16, lineHeight: 1.85, color: fg(0.55) }}>
            A decade of national courts came before the first line of code — bronze at the Sub-Junior Nationals, silver and bronze at the
            Juniors, gold at the Seniors, and a week in Suncheon, Korea, wearing India colours at the World Soft Tennis Championships.
            Tennis taught what no curriculum could: repeat a motion until it is reliable, respect the opponent&apos;s data, stay calm at
            30–40. The racquet retired. The discipline transferred.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {firstCourtStats.map((s, i) => (
            <div
              key={s.small}
              data-reveal
              data-rd={i || undefined}
              style={{
                borderTop: `1px solid ${fg(0.14)}`,
                borderBottom: i === firstCourtStats.length - 1 ? `1px solid ${fg(0.14)}` : undefined,
                padding: "26px 0",
                ...revealHidden,
              }}
            >
              <div
                {...(s.accent ? { "data-ac": "c" } : {})}
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: "clamp(26px,2.4vw,38px)",
                  ...(s.accent ? { color: ACCENT } : {}),
                }}
              >
                {s.big}
              </div>
              <div style={{ ...mono(11, "0.22em", fg(0.45)), marginTop: 12 }}>{s.small}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ CONTACT (cinematic mask reveal) + footer strip ============ */

export function Contact() {
  return (
    <section id="contact" style={{ position: "relative" }}>
      <div data-cwrap style={{ position: "relative", height: "230vh" }}>
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 8vw",
          }}
        >
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "5vh" }}>
              <div data-decode2 data-ac="c" style={mono(12, "0.35em", ACCENT)}>
                09 — MATCH POINT · CONTACT
              </div>
              <div style={mono(11, "0.25em", fg(0.4))}>REPLIES WITHIN 24H — IST</div>
            </div>
            <h2 style={{ margin: 0, ...serif("clamp(54px,8.5vw,150px)", { lineHeight: 1.0, letterSpacing: "-0.015em" }) }}>
              <span data-cm="1" style={{ display: "block", clipPath: "inset(0 0 100% 0)" }}>
                Let&apos;s build
              </span>
              <span data-cm="2" style={{ display: "block", fontStyle: "italic", clipPath: "inset(0 0 100% 0)" }}>
                something rare
                <span data-ac="c" style={{ color: ACCENT }}>
                  .
                </span>
              </span>
            </h2>
            <div data-cmfade style={{ marginTop: "6vh", opacity: 0, transform: "translateY(40px)" }}>
              <a
                data-mailwave
                href={`mailto:${EMAIL}`}
                style={{
                  display: "inline-flex",
                  textDecoration: "none",
                  color: "var(--fg)",
                  fontFamily: SERIF,
                  fontSize: "clamp(26px,4.4vw,68px)",
                  lineHeight: 1.15,
                  letterSpacing: "0.01em",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {mailChars.map((ch, i) => (
                  <span key={i} data-mch style={{ display: "inline-block", willChange: "transform" }}>
                    {ch}
                  </span>
                ))}
              </a>
              <div data-mailrule data-ac="b" style={{ height: 1, width: "0%", background: ACCENT, marginTop: 12, transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)" }} />
              <div data-copyhint style={{ ...mono(10, "0.3em", fg(0.35)), marginTop: 14, transition: "color 0.3s" }}>
                CLICK TO COPY — DOUBLE-CLICK TO OPEN MAIL
              </div>
              <div style={{ ...mono(10.5, "0.3em", fg(0.4)), margin: "5vh 0 2.5vh" }}>
                OR WRITE THE FIRST LINE HERE — IT LANDS IN MY INBOX
              </div>
              <div
                data-composer
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 26,
                  borderBottom: `1px solid ${fg(0.25)}`,
                  paddingBottom: 12,
                  maxWidth: 860,
                  transition: "border-color 0.4s",
                }}
              >
                <input
                  data-cinput
                  type="text"
                  placeholder="Tell me what we should build…"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: "clamp(20px,2.2vw,32px)",
                    color: "var(--fg)",
                    padding: 0,
                  }}
                />
                <button
                  data-csend
                  data-ac="c"
                  className="m-hover-dim"
                  style={{ background: "transparent", border: "none", padding: 0, ...mono(11, "0.3em", ACCENT), whiteSpace: "nowrap" }}
                >
                  SEND&nbsp;↗
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 36, marginTop: "5vh", ...mono(11, "0.25em") }}>
                {[
                  { label: "GITHUB", href: LINKS.github },
                  { label: "LINKEDIN", href: LINKS.linkedin },
                  { label: "LEETCODE", href: LINKS.leetcode },
                  { label: "ORCID", href: LINKS.orcid },
                ].map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-grav
                    className="m-hover-accent"
                    style={{ display: "inline-block", color: fg(0.55), textDecoration: "none" }}
                  >
                    {l.label}&nbsp;↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* footer strip */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 20,
          borderTop: `1px solid ${fg(0.1)}`,
          margin: "0 8vw",
          padding: "30px 0 34px",
          ...mono(11, "0.2em", fg(0.35)),
        }}
      >
        <span>© MMXXVI — AMAN GOEL</span>
        <span data-clock style={{ color: fg(0.4) }}>
          —:—:— IST
        </span>
        <span>SRM INSTITUTE — B.TECH CSE &apos;26, GRADUATED</span>
        <button
          data-gamehint
          className="m-hover-accent"
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            fontFamily: MONO,
            fontSize: "inherit",
            letterSpacing: "inherit",
            color: fg(0.35),
            cursor: "pointer",
          }}
        >
          ↑↑↓↓←→←→BA — OR CLICK TO RALLY THE ENGINE
        </button>
        <span>` — TERMINAL</span>
        <button
          data-wizhint
          className="m-hover-accent"
          title="There is a third theme."
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            fontFamily: MONO,
            fontSize: "inherit",
            letterSpacing: "inherit",
            color: fg(0.35),
            cursor: "pointer",
          }}
        >
          ⚡ — THE THIRD THEME
        </button>
        <a
          href="https://wolfie8935.github.io/My_Personal_Website/"
          target="_blank"
          rel="noopener noreferrer"
          className="m-hover-accent"
          style={{ color: fg(0.35), textDecoration: "none" }}
        >
          OLD SITE&nbsp;↗
        </a>
        <span>DESIGNED IN THE DARK</span>
      </div>
    </section>
  );
}
