import { ACCENT, MONO, SERIF, bg, fg, mono } from "@/components/modern/design/ui";

/**
 * Fixed chrome of the Court & Terminal design: preloader, idle screensaver,
 * starfield canvas, progress bar / grain / cursor glow / hover chip, device
 * tilt chip, theme-wipe overlay, elastic cursor and the letterbox bars.
 * All elements are inert markup driven by engine.ts via data-* attributes.
 */

function TennisBallSvg({ size, gradientId }: { size: number; gradientId: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ display: "block", filter: "drop-shadow(0 12px 26px rgba(0,0,0,0.45))" }}
    >
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#EDD5A3" />
          <stop offset="55%" stopColor="#C9A66B" />
          <stop offset="100%" stopColor="#7E653C" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={`url(#${gradientId})`} />
      <path d="M 11 11 C 28 23 28 41 11 53" fill="none" stroke="rgba(28,20,10,0.42)" strokeWidth="2" />
      <path d="M 53 11 C 36 23 36 41 53 53" fill="none" stroke="rgba(28,20,10,0.42)" strokeWidth="2" />
    </svg>
  );
}

export function Preloader() {
  return (
    <div
      data-preloader
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "30px 40px 34px",
        transition: "transform 1s cubic-bezier(0.76,0,0.24,1)",
        willChange: "transform",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", ...mono(10, "0.3em", fg(0.45)) }}>
        <span>AMAN GOEL — PORTFOLIO</span>
        <span>MMXXVI</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
        <div style={{ flex: 1, maxWidth: 260 }}>
          <div style={{ ...mono(10, "0.3em", fg(0.45)), marginBottom: 14 }}>LOADING — SYSTEMS ONLINE</div>
          <div style={{ height: 1, background: fg(0.14) }}>
            <div data-plline data-ac="b" style={{ height: 1, width: "0%", background: ACCENT }} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            data-plcount
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: "clamp(96px,15vw,200px)",
              lineHeight: 0.8,
              color: "var(--fg)",
            }}
          >
            00
          </span>
          <span style={{ ...mono(14, "0.2em", fg(0.4)), marginLeft: 10 }}>%</span>
        </div>
      </div>
    </div>
  );
}

export function Screensaver() {
  return (
    <div
      data-saver
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        background: "var(--bg)",
        opacity: 0,
        pointerEvents: "none",
        transition: "opacity 1.4s ease",
        overflow: "hidden",
      }}
    >
      <div
        data-savertime
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          fontFamily: SERIF,
          fontSize: "clamp(80px,18vw,260px)",
          lineHeight: 1,
          color: fg(0.16),
          letterSpacing: "-0.02em",
        }}
      >
        —:—
      </div>
      <div data-saverball style={{ position: "absolute", left: 0, top: 0, width: 72, height: 72, willChange: "transform" }}>
        <TennisBallSvg size={72} gradientId="orbg2" />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: 40,
          right: 40,
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          ...mono(10, "0.3em", fg(0.4)),
        }}
      >
        <span>IDLE — THE COURT IS QUIET</span>
        <span>MOVE TO RETURN</span>
      </div>
    </div>
  );
}

export function FixedChrome() {
  return (
    <>
      {/* physics starfield (persistent world) */}
      <canvas
        data-stars
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, display: "block", pointerEvents: "none" }}
      />
      {/* scroll progress bar, film grain, cursor glow, recognition hover chip */}
      <div data-bar data-ac="b" style={{ position: "fixed", top: 0, left: 0, height: 2, width: "0%", background: ACCENT, zIndex: 80 }} />
      <div data-grain style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 70, opacity: 0.05, backgroundRepeat: "repeat" }} />
      <div
        data-glow
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 640,
          height: 640,
          pointerEvents: "none",
          zIndex: 1,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}2E 0%, transparent 65%)`,
          filter: "blur(10px)",
          mixBlendMode: "screen",
        }}
      />
      <div
        data-chip
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 75,
          pointerEvents: "none",
          opacity: 0,
          ...mono(10, "0.25em", ACCENT),
          background: bg(0.92),
          border: "1px solid rgba(201,166,107,0.4)",
          padding: "9px 16px",
          whiteSpace: "nowrap",
          transition: "opacity 0.3s",
        }}
      />
      {/* device-tilt enable chip (iOS) */}
      <button
        data-tiltchip
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 76,
          display: "none",
          alignItems: "center",
          gap: 10,
          background: bg(0.92),
          border: "1px solid rgba(201,166,107,0.4)",
          color: ACCENT,
          ...mono(9, "0.28em"),
          padding: "13px 16px",
          transition: "opacity 0.5s",
        }}
      >
        TAP — ENABLE TILT
      </button>
      {/* theme wipe overlay (styled in modern.css) */}
      <div data-wipe />
      <div data-wipering />
      {/* elastic cursor */}
      <div
        data-cring
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 95,
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: "1px solid rgba(201,166,107,0.6)",
          pointerEvents: "none",
          opacity: 0,
          willChange: "transform",
        }}
      />
      <div
        data-cdot
        data-ac="b"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 95,
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: ACCENT,
          pointerEvents: "none",
          opacity: 0,
          willChange: "transform",
        }}
      />
    </>
  );
}

/** cinematic set: curved grid stage + drifting markers (pure CSS — cheap on mobile) */
export function EnvStage() {
  const markers: Array<[string, string, number, number, number]> = [
    ["11%", "16%", 15, 0.4, 8],
    ["46%", "9%", 12, 0.3, 11],
    ["84%", "22%", 17, 0.35, 9],
    ["7%", "64%", 13, 0.3, 10],
    ["38%", "84%", 16, 0.35, 12],
    ["70%", "72%", 12, 0.3, 9],
    ["93%", "52%", 14, 0.35, 11],
    ["24%", "40%", 11, 0.25, 13],
  ];
  const delays = [0, 1.4, 0.7, 2.2, 0.4, 3, 1.8, 2.6];
  const gridLayer = (flip: boolean) => ({
    position: "absolute" as const,
    inset: "-14% -8%",
    background: `linear-gradient(${fg(flip ? 0.045 : 0.06)} 1px, transparent 1px), linear-gradient(90deg, ${fg(flip ? 0.045 : 0.06)} 1px, transparent 1px)`,
    backgroundSize: "120px 120px",
    transform: `perspective(1100px) rotateX(${flip ? -18 : 18}deg)`,
    transformOrigin: flip ? "50% 112%" : "50% -12%",
    maskImage: `linear-gradient(to ${flip ? "top" : "bottom"}, black 26%, transparent 70%)`,
    WebkitMaskImage: `linear-gradient(to ${flip ? "top" : "bottom"}, black 26%, transparent 70%)`,
  });
  return (
    <div
      data-env
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.45, overflow: "hidden" }}
    >
      <div style={gridLayer(false)} />
      <div style={gridLayer(true)} />
      {markers.map(([left, top, size, alpha, dur], i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left,
            top,
            fontFamily: MONO,
            fontSize: size,
            color: `rgba(201,166,107,${alpha})`,
            animation: `m-breathe ${dur}s ease-in-out ${delays[i]}s infinite`,
          }}
        >
          +
        </span>
      ))}
    </div>
  );
}

/** letterbox bars — close in during the works rail */
export function LetterboxBars() {
  const bar = {
    position: "fixed" as const,
    left: 0,
    right: 0,
    height: "6vh",
    background: "var(--bg)",
    zIndex: 60,
    pointerEvents: "none" as const,
    willChange: "transform",
  };
  return (
    <>
      <div data-cine="t" style={{ ...bar, top: 0, transform: "translateY(-101%)" }} />
      <div data-cine="b" style={{ ...bar, bottom: 0, transform: "translateY(101%)" }} />
    </>
  );
}

export { TennisBallSvg };
