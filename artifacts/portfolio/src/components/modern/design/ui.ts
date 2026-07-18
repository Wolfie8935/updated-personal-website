import type { CSSProperties } from "react";

/** Shared style vocabulary of the Court & Terminal design. */

export const MONO = "'JetBrains Mono', monospace";
export const SERIF = "'Instrument Serif', serif";
export const ACCENT = "#C9A66B";

/** rgba(var(--fg-rgb), a) — theme ink at an opacity */
export const fg = (a: number) => `rgba(var(--fg-rgb),${a})`;
/** rgba(var(--bg-rgb), a) — theme background at an opacity */
export const bg = (a: number) => `rgba(var(--bg-rgb),${a})`;

/** JetBrains Mono label style */
export const mono = (fontSize: number | string, letterSpacing: string, color?: string): CSSProperties => ({
  fontFamily: MONO,
  fontSize,
  letterSpacing,
  ...(color ? { color } : {}),
});

/** Instrument Serif display style */
export const serif = (fontSize: number | string, extra?: CSSProperties): CSSProperties => ({
  fontFamily: SERIF,
  fontWeight: 400,
  fontSize,
  ...extra,
});

/** default hidden state for [data-reveal] elements (the engine reveals them) */
export const revealHidden: CSSProperties = { opacity: 0, transform: "translateY(30px)" };
