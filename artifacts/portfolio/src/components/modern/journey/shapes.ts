/**
 * Particle shape targets for the morphing journey cloud (JourneyScene).
 *
 * Each generator returns a Float32Array of N xyz triplets laid out so that
 * index i in one shape corresponds to index i in every other shape — the
 * render loop lerps positions directly, giving a fluid morph with no
 * re-indexing. All shapes are sized to fill roughly the same ~2-unit volume
 * so the morph never "pops" in scale.
 *
 * Order matters: stages.ts refers to shapes by index, and the journey morphs
 * monotonically through them (adjacent stages = adjacent indices, so a morph
 * never flashes through unrelated shapes).
 *   0 torusKnot   — the opening statement: an interlocked, unmistakably 3D knot
 *   1 helix       — double helix, the "building blocks" beat (about)
 *   2 wave        — a flowing lattice sheet (skills/experience)
 *   3 galaxy      — spiral arms (projects/research → spins centre-stage at 07)
 */

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Fibonacci sphere — perfectly even, calm, iconic. */
function sphere(n: number): Float32Array {
  const out = new Float32Array(n * 3);
  const r = 1.95;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;
    out[i * 3] = Math.cos(theta) * rad * r;
    out[i * 3 + 1] = y * r;
    out[i * 3 + 2] = Math.sin(theta) * rad * r;
  }
  return out;
}

/** Double helix with connecting rungs — DNA of the work. */
function helix(n: number): Float32Array {
  const out = new Float32Array(n * 3);
  const height = 4.4;
  const radius = 1.05;
  const turns = 2.4;
  const rungEvery = 9; // every Nth point becomes part of a rung between strands
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const angle = t * Math.PI * 2 * turns;
    const y = (t - 0.5) * height;
    if (i % rungEvery === 0) {
      // rung: slide between the two strands at this height
      const k = (i / rungEvery) % 1;
      const blend = ((i / rungEvery) * 0.618) % 1 || k;
      const a1 = angle;
      const a2 = angle + Math.PI;
      out[i * 3] = Math.cos(a1) * radius * (1 - blend) + Math.cos(a2) * radius * blend;
      out[i * 3 + 1] = y;
      out[i * 3 + 2] = Math.sin(a1) * radius * (1 - blend) + Math.sin(a2) * radius * blend;
    } else {
      const strand = i % 2 === 0 ? 0 : Math.PI;
      out[i * 3] = Math.cos(angle + strand) * radius;
      out[i * 3 + 1] = y;
      out[i * 3 + 2] = Math.sin(angle + strand) * radius;
    }
  }
  return out;
}

/** (p,q) torus knot — an endless interlocked loop. */
function torusKnot(n: number): Float32Array {
  const out = new Float32Array(n * 3);
  const p = 2;
  const q = 3;
  // small enough that the knot reads as a sculpted OBJECT in space, not a
  // screen-filling particle wash
  const scale = 0.72;
  const tube = 0.17;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const r = Math.cos(q * t) + 2;
    const cx = r * Math.cos(p * t) * scale;
    const cy = Math.sin(q * t) * scale;
    const cz = r * Math.sin(p * t) * scale;
    // scatter around the tube so the knot reads as a volume, not a wire
    const a = (i * GOLDEN_ANGLE) % (Math.PI * 2);
    const rr = tube * Math.sqrt(((i * 7919) % 1000) / 1000);
    out[i * 3] = cx + Math.cos(a) * rr;
    out[i * 3 + 1] = cy + Math.sin(a) * rr;
    out[i * 3 + 2] = cz + Math.cos(a * 1.7) * rr * 0.6;
  }
  return out;
}

/** A flowing sine sheet — the horizontal "showcase" beat. */
function wave(n: number): Float32Array {
  const out = new Float32Array(n * 3);
  const side = Math.ceil(Math.sqrt(n));
  const extent = 4.6;
  for (let i = 0; i < n; i++) {
    const gx = i % side;
    const gz = Math.floor(i / side);
    const x = (gx / (side - 1) - 0.5) * extent;
    const z = (gz / (side - 1) - 0.5) * extent;
    const y =
      Math.sin(x * 1.6) * 0.42 +
      Math.cos(z * 1.9 + x * 0.7) * 0.34;
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z * 0.72; // compress depth so it reads on screen
  }
  return out;
}

/** Three-armed spiral galaxy with a soft bulge. */
function galaxy(n: number): Float32Array {
  const out = new Float32Array(n * 3);
  const arms = 3;
  const maxR = 2.7;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const arm = i % arms;
    const r = Math.pow(t, 0.72) * maxR;
    const spin = r * 1.9 + (arm * Math.PI * 2) / arms;
    // deterministic pseudo-random scatter (no Math.random → stable morphs)
    const s1 = Math.sin(i * 12.9898) * 43758.5453;
    const s2 = Math.sin(i * 78.233) * 12543.8567;
    const j1 = (s1 - Math.floor(s1) - 0.5) * (0.5 - t * 0.3);
    const j2 = (s2 - Math.floor(s2) - 0.5) * 0.28 * (1 - t * 0.6);
    out[i * 3] = Math.cos(spin) * r + j1;
    out[i * 3 + 1] = j2 * (1.6 - t);
    out[i * 3 + 2] = Math.sin(spin) * r + j1 * 0.7;
  }
  return out;
}

export const SHAPE_COUNT = 4;

/** Build all morph targets for a given particle count (journey order). */
export function buildShapes(n: number): Float32Array[] {
  return [torusKnot(n), helix(n), wave(n), galaxy(n)];
}

// `sphere` intentionally unused in the journey — the "ball" era is over — but
// kept exported for potential future beats.
export { sphere };
