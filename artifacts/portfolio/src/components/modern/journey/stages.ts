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
  /** morph target index into journey/shapes.ts (fractional = mid-morph) */
  morph: number;
  /** extra x-tilt for shapes that read better tipped toward camera (wave) */
  tiltX: number;
}

// Ordered by `at`. Stages cross-fade; they never hard-cut.
// The shape vocabulary (journey/shapes.ts):
//   0 torus knot · 1 helix · 2 wave sheet · 3 galaxy
export const STAGES: StageFrame[] = [
  // Hero — an interlocked torus knot slowly tumbling on the right. Not a ball.
  { at: 0.0,  cameraZ: 7.0, scale: 1.0,  offsetX: 1.5,  offsetY: 0.0,  spin: 0.18, spread: 1.0,  bloom: 1.2,  palette: 0.0, converge: 0, morph: 0,   tiltX: 0.3 },
  // About — the knot unwinds into a double helix on the left.
  { at: 0.14, cameraZ: 7.8, scale: 0.92, offsetX: -1.7, offsetY: 0.1,  spin: 0.26, spread: 1.1,  bloom: 1.0,  palette: 0.5, converge: 0, morph: 1,   tiltX: 0.35 },
  // Skills — the helix cascades into a flowing wave sheet, tipped toward camera.
  { at: 0.3,  cameraZ: 8.2, scale: 1.1,  offsetX: 1.2,  offsetY: -0.6, spin: 0.1,  spread: 1.3,  bloom: 1.0,  palette: 1.0, converge: 0, morph: 2,   tiltX: 0.85 },
  // Experience — the sheet keeps rolling, drifting left under the timeline.
  { at: 0.44, cameraZ: 8.8, scale: 1.0,  offsetX: -1.1, offsetY: -0.4, spin: 0.14, spread: 1.2,  bloom: 1.05, palette: 1.5, converge: 0, morph: 2.3, tiltX: 0.7 },
  // Projects — the sheet swirls up into a spiral galaxy on the right.
  { at: 0.58, cameraZ: 8.6, scale: 0.95, offsetX: 1.3,  offsetY: 0.1,  spin: 0.24, spread: 1.35, bloom: 1.05, palette: 2.0, converge: 0, morph: 3,   tiltX: 0.5 },
  // Research — the galaxy holds, drifting left, calmer.
  { at: 0.72, cameraZ: 9.2, scale: 0.9,  offsetX: -1.2, offsetY: 0.0,  spin: 0.18, spread: 1.15, bloom: 1.1,  palette: 2.5, converge: 0, morph: 3,   tiltX: 0.55 },
  // Off the Clock (07) — the galaxy sweeps CENTRE-STAGE, big and playful,
  // spinning up behind the flip cards. The section's own 3D moment.
  { at: 0.86, cameraZ: 7.2, scale: 1.35, offsetX: 0.0,  offsetY: -0.2, spin: 0.55, spread: 1.0,  bloom: 1.35, palette: 3.0, converge: 0, morph: 3,   tiltX: 0.75 },
  // Contact — everything converges to a single glowing point. One idea.
  { at: 1.0,  cameraZ: 6.2, scale: 0.7,  offsetX: 0.0,  offsetY: 0.2,  spin: 0.4,  spread: 0.4,  bloom: 1.5,  palette: 3.5, converge: 1, morph: 3,   tiltX: 0.2 },
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
    morph: lerp(lo.morph, hi.morph, t),
    tiltX: lerp(lo.tiltX, hi.tiltX, t),
  };
}
