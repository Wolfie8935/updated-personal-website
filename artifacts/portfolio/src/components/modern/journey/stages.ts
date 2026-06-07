/**
 * The journey "script": a sorted list of keyframes over normalized scroll
 * progress p ∈ [0,1]. JourneyScene samples sampleStage(p) each frame and applies
 * the result. Tuning the journey means editing this data, not the render loop.
 */
export interface StageFrame {
  /** scroll progress 0..1 where this keyframe is fully active */
  at: number;
  /** camera distance on Z */
  cameraZ: number;
  /** core group uniform scale */
  scale: number;
  /** core group screen-space offset (world units) */
  offsetX: number;
  offsetY: number;
  /** base auto-rotation speed (radians/sec) */
  spin: number;
  /** how far the star field spreads outward (1 = base) */
  spread: number;
  /** additive bloom strength (high tier only) */
  bloom: number;
  /** index into the aurora palette (fractional = blend) */
  palette: number;
  /** 0 = lattice intact, 1 = particles converged to a point */
  converge: number;
}

// Ordered by `at`. Stages cross-fade; they never hard-cut.
export const STAGES: StageFrame[] = [
  { at: 0.0,  cameraZ: 7.0, scale: 1.0,  offsetX: 1.4,  offsetY: 0.0,  spin: 0.12, spread: 1.0,  bloom: 1.15, palette: 0.0, converge: 0 },
  { at: 0.16, cameraZ: 7.6, scale: 0.92, offsetX: -1.6, offsetY: 0.1,  spin: 0.10, spread: 1.1,  bloom: 0.95, palette: 0.5, converge: 0 },
  { at: 0.36, cameraZ: 8.2, scale: 1.05, offsetX: 1.2,  offsetY: -0.1, spin: 0.16, spread: 1.35, bloom: 1.05, palette: 1.2, converge: 0 },
  { at: 0.58, cameraZ: 9.6, scale: 0.8,  offsetX: -1.0, offsetY: 0.0,  spin: 0.08, spread: 1.2,  bloom: 0.7,  palette: 2.0, converge: 0 },
  { at: 0.78, cameraZ: 8.4, scale: 1.1,  offsetX: 0.0,  offsetY: 0.0,  spin: 0.20, spread: 0.9,  bloom: 1.0,  palette: 2.6, converge: 0 },
  { at: 1.0,  cameraZ: 6.4, scale: 0.7,  offsetX: 0.0,  offsetY: 0.0,  spin: 0.30, spread: 0.4,  bloom: 1.4,  palette: 3.0, converge: 1 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smoothstep easing so transitions between keyframes feel organic, not linear. */
const ease = (t: number) => t * t * (3 - 2 * t);

export type SampledStage = Omit<StageFrame, "at">;

/** Interpolate the stage parameters at progress p (clamped to [0,1]). */
export function sampleStage(p: number, stages: StageFrame[] = STAGES): SampledStage {
  const clamped = Math.min(1, Math.max(0, p));
  let lo = stages[0];
  let hi = stages[stages.length - 1];
  for (let i = 0; i < stages.length - 1; i++) {
    if (clamped >= stages[i].at && clamped <= stages[i + 1].at) {
      lo = stages[i];
      hi = stages[i + 1];
      break;
    }
  }
  const span = hi.at - lo.at;
  const t = span <= 0 ? 0 : ease((clamped - lo.at) / span);
  return {
    cameraZ: lerp(lo.cameraZ, hi.cameraZ, t),
    scale: lerp(lo.scale, hi.scale, t),
    offsetX: lerp(lo.offsetX, hi.offsetX, t),
    offsetY: lerp(lo.offsetY, hi.offsetY, t),
    spin: lerp(lo.spin, hi.spin, t),
    spread: lerp(lo.spread, hi.spread, t),
    bloom: lerp(lo.bloom, hi.bloom, t),
    palette: lerp(lo.palette, hi.palette, t),
    converge: lerp(lo.converge, hi.converge, t),
  };
}
