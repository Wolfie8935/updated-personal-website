/**
 * Site-wide animated aurora field for the modern (dark/light) themes.
 * Fixed, behind all content. Animations auto-disable under prefers-reduced-motion
 * (handled in modern.css).
 */
export function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="aurora-blob aurora-blob--1" />
      <div className="aurora-blob aurora-blob--2" />
      <div className="aurora-blob aurora-blob--3" />
      <div className="aurora-blob aurora-blob--4" />
      <div className="aurora-grain" />
    </div>
  );
}
