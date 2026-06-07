# Modern Theme — Scroll-Driven 3D Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the section-local WebGL hero with a fixed, full-viewport neural constellation that forms, travels, and resolves as the visitor scrolls — turning the dark/light "modern" theme into a bespoke, jaw-dropping experience.

**Architecture:** A single raw three.js scene (`JourneyScene`) renders behind all content as a fixed layer. Its state is driven by a normalized scroll-progress signal (0→1) produced by GSAP ScrollTrigger and smoothed by Lenis. A data-driven keyframe array maps scroll progress to camera/group/particle/bloom parameters; the render loop interpolates between adjacent keyframes. Device-tier detection scales the experience (high / low / static), and everything is isolated under `src/components/modern/**` so the wizarding theme is never touched.

**Tech Stack:** React, Vite, TypeScript, three.js (raw + `EffectComposer`/`UnrealBloomPass`), GSAP ScrollTrigger, Lenis, framer-motion, Tailwind v4.

---

## Verification model (read first)

This is visual WebGL work. There is no meaningful unit test for "the bloom looks right" or "the core assembles." So every task is verified by:

1. **Typecheck:** `pnpm --filter @workspace/portfolio typecheck` → expect no errors.
2. **Build (at milestones):** `pnpm --filter @workspace/portfolio build` → expect success.
3. **Manual browser check:** `pnpm --filter @workspace/portfolio dev`, open the printed URL, observe the specific behavior the task describes, in **both dark and light** themes.

Run commands from the repo root: `C:/Users/amanc/Desktop/LEARNING/Wolfie8935`.

## Isolation invariants (must hold after EVERY task)

- `git diff --name-only` shows **no** files under `src/wizarding/**` or `src/components/wizarding/**`.
- The number of `theme-wizarding` occurrences in `artifacts/portfolio/src/index.css` is unchanged.
- Switching to the wizarding theme shows the original site with no journey canvas, no Lenis, and no surviving `requestAnimationFrame` loop.

Quick isolation check command (run after milestones):

```bash
cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && \
  git diff --name-only | grep -E "wizarding/" && echo "VIOLATION" || echo "isolation OK" ; \
  grep -c "theme-wizarding" artifacts/portfolio/src/index.css
```

Expected: `isolation OK` and the same count as before work started (record it at Task 0).

---

## File Structure

**New files (all under `artifacts/portfolio/src/components/modern/`):**
- `hooks/useDeviceTier.ts` — returns `"high" | "low" | "static"`.
- `hooks/useScrollStage.ts` — owns a smoothed normalized scroll-progress ref + GSAP ScrollTrigger registration.
- `hooks/useSmoothScroll.ts` — Lenis init + ScrollTrigger wiring + `scrollTo`; no-op on `static`/`low`.
- `JourneyScene.tsx` — the fixed full-viewport three.js scene with stages + bloom.
- `journey/stages.ts` — the keyframe data + interpolation helpers (pure, unit-testable).

**Modified files:**
- `ModernHome.tsx` — mount `JourneyScene` + provide smooth scroll.
- `sections/HeroModern.tsx` — remove local `HeroScene`; sync entrance.
- `sections/AboutModern.tsx`, `SkillsModern.tsx`, `ExperienceModern.tsx`, `ProjectsModern.tsx`, `ResearchModern.tsx`, `AchievementsModern.tsx`, `InterestsModern.tsx`, `ContactModern.tsx` — scroll-reveal polish (light touch).
- `modern.css` — layering, text-reveal masks, smooth-scroll html setup.
- `artifacts/portfolio/package.json` — add `gsap`, `lenis`.

`HeroScene.tsx` is **kept** until Task 7 (its sprite-texture + lifecycle logic is reused/ported into `JourneyScene`), then deleted.

---

## Task 0: Baseline & dependencies

**Files:**
- Modify: `artifacts/portfolio/package.json`

- [ ] **Step 1: Record the wizarding baseline count**

Run:
```bash
cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && grep -c "theme-wizarding" artifacts/portfolio/src/index.css
```
Write the number down. It must never change.

- [ ] **Step 2: Add gsap + lenis**

Run:
```bash
cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935/artifacts/portfolio" && pnpm add gsap lenis
```
Expected: both added to `dependencies` in `artifacts/portfolio/package.json`, lockfile updated.

- [ ] **Step 3: Verify install + typecheck still clean**

Run:
```bash
cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && pnpm --filter @workspace/portfolio typecheck
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add artifacts/portfolio/package.json pnpm-lock.yaml
git commit -m "build: add gsap + lenis to portfolio"
```

---

## Task 1: Device-tier hook

Detects how heavy the experience may be.

**Files:**
- Create: `artifacts/portfolio/src/components/modern/hooks/useDeviceTier.ts`

- [ ] **Step 1: Write the hook**

```typescript
import { useEffect, useState } from "react";

export type DeviceTier = "high" | "low" | "static";

/**
 * Picks an experience tier for the modern theme's 3D journey.
 * - "static": user prefers reduced motion → single frame, native scroll.
 * - "low": coarse pointer / few cores / little memory / small viewport → lighter scene, no bloom, native scroll.
 * - "high": everything else → full scene, bloom, smooth scroll.
 *
 * Resolves once on mount (after a paint) and also listens for reduced-motion changes.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("static");

  useEffect(() => {
    const rmQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resolve = (): DeviceTier => {
      if (rmQuery.matches) return "static";
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const cores = navigator.hardwareConcurrency ?? 8;
      // deviceMemory is non-standard; default generously when absent.
      const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
      const small = window.innerWidth < 768;
      if (coarse || small || cores <= 4 || mem <= 4) return "low";
      return "high";
    };

    setTier(resolve());
    const onChange = () => setTier(resolve());
    rmQuery.addEventListener("change", onChange);
    return () => rmQuery.removeEventListener("change", onChange);
  }, []);

  return tier;
}
```

- [ ] **Step 2: Typecheck**

Run: `cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && pnpm --filter @workspace/portfolio typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add artifacts/portfolio/src/components/modern/hooks/useDeviceTier.ts
git commit -m "feat(modern): device-tier detection hook"
```

---

## Task 2: Stage keyframe data + interpolation (pure, testable)

The journey's "script." Pure functions, so this task DOES get a unit test.

**Files:**
- Create: `artifacts/portfolio/src/components/modern/journey/stages.ts`
- Create: `artifacts/portfolio/src/components/modern/journey/stages.test.ts`

- [ ] **Step 1: Write the keyframe module**

```typescript
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
  { at: 0.0,  cameraZ: 7.0, scale: 1.0,  offsetX: 1.4,  offsetY: 0.0,  spin: 0.12, spread: 1.0, bloom: 1.15, palette: 0.0, converge: 0 },
  { at: 0.16, cameraZ: 7.6, scale: 0.92, offsetX: -1.6, offsetY: 0.1,  spin: 0.10, spread: 1.1, bloom: 0.95, palette: 0.5, converge: 0 },
  { at: 0.36, cameraZ: 8.2, scale: 1.05, offsetX: 1.2,  offsetY: -0.1, spin: 0.16, spread: 1.35, bloom: 1.05, palette: 1.2, converge: 0 },
  { at: 0.58, cameraZ: 9.6, scale: 0.8,  offsetX: -1.0, offsetY: 0.0,  spin: 0.08, spread: 1.2, bloom: 0.7,  palette: 2.0, converge: 0 },
  { at: 0.78, cameraZ: 8.4, scale: 1.1,  offsetX: 0.0,  offsetY: 0.0,  spin: 0.20, spread: 0.9, bloom: 1.0,  palette: 2.6, converge: 0 },
  { at: 1.0,  cameraZ: 6.4, scale: 0.7,  offsetX: 0.0,  offsetY: 0.0,  spin: 0.30, spread: 0.4, bloom: 1.4,  palette: 3.0, converge: 1 },
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
```

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect } from "vitest";
import { sampleStage, STAGES } from "./stages";

describe("sampleStage", () => {
  it("returns the first frame's values at p=0", () => {
    const s = sampleStage(0);
    expect(s.cameraZ).toBeCloseTo(STAGES[0].cameraZ);
    expect(s.converge).toBeCloseTo(0);
  });

  it("returns the last frame's values at p=1", () => {
    const s = sampleStage(1);
    expect(s.cameraZ).toBeCloseTo(STAGES[STAGES.length - 1].cameraZ);
    expect(s.converge).toBeCloseTo(1);
  });

  it("clamps out-of-range progress", () => {
    expect(sampleStage(-5).cameraZ).toBeCloseTo(STAGES[0].cameraZ);
    expect(sampleStage(99).converge).toBeCloseTo(1);
  });

  it("interpolates between keyframes (monotonic converge in last span)", () => {
    const a = sampleStage(0.8).converge;
    const b = sampleStage(0.9).converge;
    expect(b).toBeGreaterThan(a);
  });
});
```

- [ ] **Step 3: Run the test — expect FAIL if vitest absent, else PASS**

Run: `cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935/artifacts/portfolio" && pnpm exec vitest run src/components/modern/journey/stages.test.ts`

If vitest is **not installed** (likely — this repo has no test runner configured), do NOT add one just for this. Instead delete the `.test.ts` file and verify the module compiles via typecheck. Record the decision in the commit message. If vitest **is** present, expect PASS.

- [ ] **Step 4: Typecheck**

Run: `cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && pnpm --filter @workspace/portfolio typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add artifacts/portfolio/src/components/modern/journey/
git commit -m "feat(modern): journey stage keyframes + interpolation"
```

---

## Task 3: Scroll-stage hook

Owns the normalized progress ref the scene samples each frame.

**Files:**
- Create: `artifacts/portfolio/src/components/modern/hooks/useScrollStage.ts`

- [ ] **Step 1: Write the hook**

```typescript
import { useEffect, useRef, type MutableRefObject } from "react";

/**
 * Tracks normalized document scroll progress (0 at top, 1 at bottom) in a ref,
 * smoothed toward the latest target. JourneyScene reads progressRef.current each
 * frame, so this avoids React re-renders on scroll.
 *
 * Pure DOM scroll math — works whether or not Lenis is active (Lenis drives the
 * same window scroll position). Disabled entirely when `enabled` is false.
 */
export function useScrollStage(enabled: boolean): MutableRefObject<number> {
  const progressRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      progressRef.current = 0;
      return;
    }

    const read = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      progressRef.current = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [enabled]);

  return progressRef;
}
```

- [ ] **Step 2: Typecheck + commit**

Run: `cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && pnpm --filter @workspace/portfolio typecheck`
Expected: no errors.

```bash
git add artifacts/portfolio/src/components/modern/hooks/useScrollStage.ts
git commit -m "feat(modern): scroll-progress ref hook"
```

---

## Task 4: Smooth-scroll hook (Lenis + ScrollTrigger)

**Files:**
- Create: `artifacts/portfolio/src/components/modern/hooks/useSmoothScroll.ts`

- [ ] **Step 1: Write the hook**

```typescript
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { DeviceTier } from "@/components/modern/hooks/useDeviceTier";

gsap.registerPlugin(ScrollTrigger);

/**
 * Buttery smooth-scroll for the modern theme, wired to GSAP ScrollTrigger.
 * Active only on the "high" tier; on "low"/"static" the browser's native scroll
 * is used (no Lenis instance is created at all). Returns a scrollTo(target) that
 * routes through Lenis when active and falls back to native smooth scroll.
 *
 * IMPORTANT: only ever mounted inside ModernHome, which renders solely on
 * non-wizarding themes — so the wizarding theme never gets Lenis.
 */
export function useSmoothScroll(tier: DeviceTier) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (tier !== "high") {
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [tier]);

  const scrollTo = (target: string | HTMLElement, offset = -80) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset });
      return;
    }
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    if (el instanceof HTMLElement) {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return { scrollTo };
}
```

- [ ] **Step 2: Typecheck**

Run: `cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && pnpm --filter @workspace/portfolio typecheck`
Expected: no errors. If TS complains it cannot find module `lenis` types, confirm `lenis` ships its own types (it does as of v1); if not, add `// @ts-expect-error` only as a last resort and note it.

- [ ] **Step 3: Commit**

```bash
git add artifacts/portfolio/src/components/modern/hooks/useSmoothScroll.ts
git commit -m "feat(modern): Lenis smooth-scroll wired to ScrollTrigger"
```

---

## Task 5: JourneyScene — port the existing scene to a fixed full-viewport layer

Goal of THIS task: visual parity with today's `HeroScene`, but rendered fixed behind everything and reading the device tier. No journey transforms yet — that's Task 6.

**Files:**
- Create: `artifacts/portfolio/src/components/modern/JourneyScene.tsx`

- [ ] **Step 1: Create JourneyScene with the ported scene**

Port the scene construction from `HeroScene.tsx` (icosahedron lattice, nodes, star field, synapses, `makeSpriteTexture`, pointer parallax, IO/visibility pause, resize, dispose). Differences from `HeroScene`:
- Accept `tier: DeviceTier` and `progressRef: MutableRefObject<number>` props.
- Container is the full fixed layer (sized to `window.innerWidth/innerHeight`, updated on resize) rather than the parent element's box.
- Star count scales with tier: `tier === "low" ? 70 : 150`.
- On `tier === "static"`: render exactly one frame, no rAF loop (as today).

```tsx
import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import type { DeviceTier } from "@/components/modern/hooks/useDeviceTier";

/**
 * JourneyScene — the signature scroll-driven neural constellation for the modern
 * themes. Rendered as a fixed full-viewport WebGL layer behind all content.
 * This task establishes parity with the old HeroScene; Task 6 adds scroll stages.
 */
export function JourneyScene({
  tier,
  progressRef,
  className,
}: {
  tier: DeviceTier;
  progressRef: MutableRefObject<number>;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      return; // WebGL unavailable → aurora background alone remains. Page stays usable.
    }
    renderer.setSize(width, height);
    const maxDpr = tier === "low" ? 1 : 1.75;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    container.appendChild(renderer.domElement);

    const palette = [
      new THREE.Color("#6366f1"),
      new THREE.Color("#22d3ee"),
      new THREE.Color("#8b5cf6"),
      new THREE.Color("#ec4899"),
    ];

    const group = new THREE.Group();
    scene.add(group);

    const icoGeo = new THREE.IcosahedronGeometry(1.7, 1);
    const edges = new THREE.EdgesGeometry(icoGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: palette[0].clone(), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending });
    const lattice = new THREE.LineSegments(edges, lineMat);
    group.add(lattice);

    const nodeTex = makeSpriteTexture();
    const nodeMat = new THREE.PointsMaterial({ color: palette[1].clone(), size: 0.12, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, map: nodeTex });
    const nodes = new THREE.Points(icoGeo, nodeMat);
    group.add(nodes);

    const STAR_COUNT = tier === "low" ? 70 : 150;
    const starBase = new Float32Array(STAR_COUNT * 3); // base positions, scaled by `spread` later
    const starColors = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 2.6 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starBase[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starBase[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starBase[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[i % palette.length];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    const starPositions = starBase.slice();
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starTex = makeSpriteTexture();
    const starMat = new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, map: starTex });
    const stars = new THREE.Points(starGeo, starMat);
    group.add(stars);

    const synapsePositions: number[] = [];
    for (let i = 0; i < 18; i++) {
      const idx = Math.floor(Math.random() * STAR_COUNT);
      synapsePositions.push(0, 0, 0, starBase[idx * 3], starBase[idx * 3 + 1], starBase[idx * 3 + 2]);
    }
    const synGeo = new THREE.BufferGeometry();
    synGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(synapsePositions), 3));
    const synMat = new THREE.LineBasicMaterial({ color: palette[2].clone(), transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending });
    const synapses = new THREE.LineSegments(synGeo, synMat);
    group.add(synapses);

    const pointer = { x: 0, y: 0 };
    const targetP = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      targetP.x = (e.clientX / window.innerWidth - 0.5) * 2;
      targetP.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove);

    const clock = new THREE.Clock();
    const tmpColor = new THREE.Color();

    const renderFrame = () => {
      const t = clock.getElapsedTime();
      pointer.x += (targetP.x - pointer.x) * 0.05;
      pointer.y += (targetP.y - pointer.y) * 0.05;

      group.rotation.y = t * 0.12 + pointer.x * 0.5;
      group.rotation.x = Math.sin(t * 0.18) * 0.15 + pointer.y * 0.35;
      stars.rotation.y = -t * 0.04;
      stars.rotation.z = t * 0.02;

      const cycle = (t * 0.12) % palette.length;
      const i0 = Math.floor(cycle);
      const i1 = (i0 + 1) % palette.length;
      const f = cycle - i0;
      tmpColor.copy(palette[i0]).lerp(palette[i1], f);
      lineMat.color.copy(tmpColor);
      nodeMat.color.copy(tmpColor).offsetHSL(0.08, 0, 0.05);
      synMat.opacity = 0.08 + Math.sin(t * 0.8) * 0.05 + 0.06;

      renderer.render(scene, camera);
    };

    let frameId = 0;
    let running = false;
    const loop = () => { renderFrame(); frameId = requestAnimationFrame(loop); };
    const start = () => { if (running || tier === "static") return; running = true; clock.start(); loop(); };
    const stop = () => { running = false; cancelAnimationFrame(frameId); };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? start() : stop()));
    }, { threshold: 0 });
    io.observe(container);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    };
    window.addEventListener("resize", onResize);

    if (tier === "static") renderFrame();
    else start();

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose();
      icoGeo.dispose();
      edges.dispose();
      starGeo.dispose();
      synGeo.dispose();
      lineMat.dispose();
      nodeMat.dispose();
      starMat.dispose();
      synMat.dispose();
      nodeTex.dispose();
      starTex.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
    // progressRef is intentionally read inside the loop in Task 6; tier re-inits the scene.
  }, [tier, progressRef]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}

function makeSpriteTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.85)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
```

- [ ] **Step 2: Typecheck**

Run: `cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && pnpm --filter @workspace/portfolio typecheck`
Expected: no errors. (`progressRef` is unused this task — it's referenced in the dep array and a comment, so no unused-var error; if the linter complains, keep it, Task 6 consumes it.)

- [ ] **Step 3: Commit**

```bash
git add artifacts/portfolio/src/components/modern/JourneyScene.tsx
git commit -m "feat(modern): JourneyScene fixed-layer scene (parity port)"
```

---

## Task 6: JourneyScene — apply scroll-driven stages + convergence

Now the scene reads `progressRef` and applies the keyframes from Task 2.

**Files:**
- Modify: `artifacts/portfolio/src/components/modern/JourneyScene.tsx`

- [ ] **Step 1: Import the stage sampler**

Add at the top of `JourneyScene.tsx`:
```tsx
import { sampleStage } from "@/components/modern/journey/stages";
```

- [ ] **Step 2: Apply the sampled stage in renderFrame**

Replace the body of `renderFrame` so it samples progress and applies camera/group/spread/convergence. Replace the existing `renderFrame` function with:

```tsx
    const renderFrame = () => {
      const t = clock.getElapsedTime();
      const stage = sampleStage(progressRef.current);

      pointer.x += (targetP.x - pointer.x) * 0.05;
      pointer.y += (targetP.y - pointer.y) * 0.05;

      // Camera dolly + group placement from the journey stage.
      camera.position.z += (stage.cameraZ - camera.position.z) * 0.06;
      group.position.x += (stage.offsetX - group.position.x) * 0.06;
      group.position.y += (stage.offsetY - group.position.y) * 0.06;
      group.scale.setScalar(group.scale.x + (stage.scale - group.scale.x) * 0.06);

      group.rotation.y = t * stage.spin + pointer.x * 0.5;
      group.rotation.x = Math.sin(t * 0.18) * 0.15 + pointer.y * 0.35;
      stars.rotation.y = -t * 0.04;
      stars.rotation.z = t * 0.02;

      // Star field spread + convergence toward a point.
      const conv = stage.converge;
      for (let i = 0; i < STAR_COUNT; i++) {
        const sx = starBase[i * 3] * stage.spread;
        const sy = starBase[i * 3 + 1] * stage.spread;
        const sz = starBase[i * 3 + 2] * stage.spread;
        starPositions[i * 3] = sx * (1 - conv);
        starPositions[i * 3 + 1] = sy * (1 - conv);
        starPositions[i * 3 + 2] = sz * (1 - conv);
      }
      starGeo.attributes.position.needsUpdate = true;

      // Palette driven by stage (not just time) so each region has a hue identity.
      const pIdx = stage.palette % palette.length;
      const i0 = Math.floor(pIdx);
      const i1 = (i0 + 1) % palette.length;
      tmpColor.copy(palette[i0]).lerp(palette[i1], pIdx - i0);
      lineMat.color.copy(tmpColor);
      nodeMat.color.copy(tmpColor).offsetHSL(0.08, 0, 0.05);
      lineMat.opacity = 0.55 * (1 - conv * 0.6);
      synMat.opacity = (0.08 + Math.sin(t * 0.8) * 0.05 + 0.06) * (1 - conv);

      renderer.render(scene, camera);
    };
```

- [ ] **Step 3: Typecheck**

Run: `cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && pnpm --filter @workspace/portfolio typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add artifacts/portfolio/src/components/modern/JourneyScene.tsx
git commit -m "feat(modern): scroll-driven journey stages + convergence"
```

---

## Task 7: Wire JourneyScene into ModernHome; remove HeroScene from hero

**Files:**
- Modify: `artifacts/portfolio/src/components/modern/ModernHome.tsx`
- Modify: `artifacts/portfolio/src/components/modern/sections/HeroModern.tsx`
- Delete: `artifacts/portfolio/src/components/modern/HeroScene.tsx`

- [ ] **Step 1: Mount the journey + smooth-scroll in ModernHome**

Replace `ModernHome.tsx` contents with:

```tsx
import { useDeviceTier } from "@/components/modern/hooks/useDeviceTier";
import { useScrollStage } from "@/components/modern/hooks/useScrollStage";
import { useSmoothScroll } from "@/components/modern/hooks/useSmoothScroll";
import { JourneyScene } from "@/components/modern/JourneyScene";
import { AuroraBackground } from "@/components/modern/AuroraBackground";
import { AmbientParticles } from "@/components/modern/AmbientParticles";
import { EasterEggs } from "@/components/modern/EasterEggs";
import { ScrollProgress } from "@/components/modern/ScrollProgress";
import { BackToTop } from "@/components/modern/BackToTop";
import { NavbarModern } from "@/components/modern/NavbarModern";
import { FooterModern } from "@/components/modern/FooterModern";
import { HeroModern } from "@/components/modern/sections/HeroModern";
import { AboutModern } from "@/components/modern/sections/AboutModern";
import { SkillsModern } from "@/components/modern/sections/SkillsModern";
import { ExperienceModern } from "@/components/modern/sections/ExperienceModern";
import { ProjectsModern } from "@/components/modern/sections/ProjectsModern";
import { ResearchModern } from "@/components/modern/sections/ResearchModern";
import { AchievementsModern } from "@/components/modern/sections/AchievementsModern";
import { InterestsModern } from "@/components/modern/sections/InterestsModern";
import { ContactModern } from "@/components/modern/sections/ContactModern";

/**
 * ModernHome — the "Liquid Glass / Aurora" experience for the dark & light themes.
 * Rendered only when the theme is NOT wizarding (see pages/Home.tsx). Owns the
 * fixed scroll-driven JourneyScene and the modern-only smooth scroll.
 */
export function ModernHome() {
  const tier = useDeviceTier();
  const progressRef = useScrollStage(tier !== "static");
  useSmoothScroll(tier);

  return (
    <div className="modern-scope relative min-h-screen overflow-x-clip bg-background text-foreground selection:bg-indigo-500/30">
      <AuroraBackground />
      {/* Fixed neural journey behind all content. Drops to the aurora alone if WebGL fails. */}
      <JourneyScene
        tier={tier}
        progressRef={progressRef}
        className="pointer-events-none fixed inset-0 z-0 opacity-90"
      />
      {/* Ambient DOM particles only add value on the low tier (no heavy WebGL there). */}
      {tier === "low" && <AmbientParticles />}
      <EasterEggs />
      <ScrollProgress />
      <NavbarModern />

      <main className="relative z-10">
        <HeroModern />
        <AboutModern />
        <SkillsModern />
        <ExperienceModern />
        <ProjectsModern />
        <ResearchModern />
        <AchievementsModern />
        <InterestsModern />
        <ContactModern />
      </main>

      <FooterModern />
      <BackToTop />
    </div>
  );
}
```

- [ ] **Step 2: Remove the local HeroScene from HeroModern**

In `sections/HeroModern.tsx`:
- Delete the `HeroScene` lazy import (lines defining `const HeroScene = lazy(...)` and its `import` thunk).
- Delete the `<Suspense><HeroScene .../></Suspense>` block inside the `<section>`.
- Keep the readability veil `<div>` (it still helps text contrast over the fixed canvas) but change it from `absolute` to stay within the section: it remains `absolute inset-0 z-[1]`. The section keeps `relative`.
- Remove now-unused imports (`lazy`, `Suspense`) if they are no longer referenced.

The hero `<section>` keeps all copy, stats, buttons, and the scroll-down chevron.

- [ ] **Step 3: Delete the old HeroScene file**

```bash
cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && git rm artifacts/portfolio/src/components/modern/HeroScene.tsx
```

- [ ] **Step 4: Typecheck + build**

Run:
```bash
cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && pnpm --filter @workspace/portfolio typecheck && pnpm --filter @workspace/portfolio build
```
Expected: both succeed, no references to the deleted `HeroScene`.

- [ ] **Step 5: Manual check (dark + light)**

Run `pnpm --filter @workspace/portfolio dev`, open the URL.
Expect: constellation now spans the whole viewport behind content; scrolling moves the core through its stages and converges near the footer; text stays readable. Verify in BOTH dark and light themes via the theme toggle.

- [ ] **Step 6: Isolation check + commit**

Run the isolation check command (top of plan). Expect `isolation OK` + unchanged count.

```bash
git add -A artifacts/portfolio/src/components/modern/
git commit -m "feat(modern): mount fixed JourneyScene + smooth scroll; retire HeroScene"
```

---

## Task 8: Route hero + navbar anchor navigation through smooth scroll

So in-page links feel cohesive with Lenis and still work when Lenis is off.

**Files:**
- Modify: `artifacts/portfolio/src/components/modern/sections/HeroModern.tsx`
- Modify: `artifacts/portfolio/src/components/modern/NavbarModern.tsx`

- [ ] **Step 1: Inspect how NavbarModern currently scrolls**

Read `NavbarModern.tsx`. It likely uses its own `scrollTo`/`window.scrollTo` like HeroModern. Note the function it uses for nav links.

- [ ] **Step 2: Provide scrollTo via context (shared, single Lenis instance)**

Create `artifacts/portfolio/src/components/modern/journey/ScrollContext.tsx`:

```tsx
import { createContext, useContext } from "react";

type ScrollToFn = (target: string | HTMLElement, offset?: number) => void;

const nativeScrollTo: ScrollToFn = (target, offset = -80) => {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (el instanceof HTMLElement) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

export const ScrollContext = createContext<ScrollToFn>(nativeScrollTo);
export const useScrollTo = () => useContext(ScrollContext);
```

- [ ] **Step 3: Provide the value from ModernHome**

In `ModernHome.tsx`, destructure `scrollTo` from `useSmoothScroll` and wrap the tree:

```tsx
const { scrollTo } = useSmoothScroll(tier);
// ...
return (
  <ScrollContext.Provider value={scrollTo}>
    <div className="modern-scope ...">
      {/* unchanged */}
    </div>
  </ScrollContext.Provider>
);
```
Add the import: `import { ScrollContext } from "@/components/modern/journey/ScrollContext";`

- [ ] **Step 4: Use the shared scrollTo in HeroModern + NavbarModern**

In both components, replace the local `scrollTo`/`window.scrollTo` calls used by nav buttons with:
```tsx
import { useScrollTo } from "@/components/modern/journey/ScrollContext";
// inside component:
const scrollTo = useScrollTo();
// usage: scrollTo("#projects")  (pass a selector; offset defaults to -80)
```
Adjust call sites: where they previously passed an element id like `"projects"`, pass the selector `"#projects"` instead. Keep external links (e.g. the CERAS button `window.open`) unchanged.

- [ ] **Step 5: Typecheck + manual check**

Run typecheck. Then `dev`: click navbar links and the hero "View Projects" button — they should glide (Lenis) on desktop and still land correctly with the 80px offset. Toggle to a low-tier emulation (DevTools mobile) → native smooth scroll still lands correctly.

- [ ] **Step 6: Commit**

```bash
git add artifacts/portfolio/src/components/modern/
git commit -m "feat(modern): unified smooth scrollTo for nav + hero anchors"
```

---

## Task 9: JourneyScene — bloom postprocessing (high tier only)

The "how is this done" glow.

**Files:**
- Modify: `artifacts/portfolio/src/components/modern/JourneyScene.tsx`

- [ ] **Step 1: Import postprocessing from three examples**

Add imports:
```tsx
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { Vector2 } from "three";
```

- [ ] **Step 2: Build the composer on high tier**

After the renderer is created and sized, add:
```tsx
    const useBloom = tier === "high";
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (useBloom) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new Vector2(width, height), 1.15, 0.6, 0.85);
      composer.addPass(bloomPass);
    }
```

- [ ] **Step 3: Drive bloom strength from the stage + render via composer**

In `renderFrame`, after computing `stage`, before the final render, set:
```tsx
      if (bloomPass) bloomPass.strength = stage.bloom;
```
Replace the final `renderer.render(scene, camera);` with:
```tsx
      if (composer) composer.render();
      else renderer.render(scene, camera);
```

- [ ] **Step 4: Resize + dispose the composer**

In `onResize`, after `renderer.setSize(...)`, add: `composer?.setSize(width, height);`
In the cleanup return, add: `composer?.dispose();`

- [ ] **Step 5: Typecheck + build**

Run:
```bash
cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && pnpm --filter @workspace/portfolio typecheck && pnpm --filter @workspace/portfolio build
```
Expected: success. If the build complains about resolving `three/examples/jsm/...`, confirm the import path matches the installed three version's examples layout (it does for three ≥ 0.150 with the `.js` suffix).

- [ ] **Step 6: Manual check + commit**

`dev`: on desktop (high tier) the core/stars now glow with bloom; brightness swells near the hero and footer. On mobile emulation (low tier) there is no bloom and no errors.

```bash
git add artifacts/portfolio/src/components/modern/JourneyScene.tsx
git commit -m "feat(modern): UnrealBloom glow on the journey (high tier)"
```

---

## Task 10: Hero entrance refinement + text-reveal mask

Make the hero text feel authored, synced to the scene's presence.

**Files:**
- Modify: `artifacts/portfolio/src/components/modern/sections/HeroModern.tsx`
- Modify: `artifacts/portfolio/src/components/modern/modern.css`

- [ ] **Step 1: Add a masked clip-reveal for the H1**

In `modern.css` (inside the existing `:root:not(.theme-wizarding)` scope or the `.modern-scope` block), add:
```css
.modern-scope .reveal-mask {
  overflow: hidden;
  display: inline-block;
}
.modern-scope .reveal-mask > span {
  display: inline-block;
  will-change: transform;
  animation: revealUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes revealUp {
  from { transform: translateY(110%); }
  to { transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .modern-scope .reveal-mask > span { animation: none; }
}
```

- [ ] **Step 2: Wrap the H1 lines**

In `HeroModern.tsx`, wrap the name in the mask:
```tsx
<h1 className="sheen mt-6 text-6xl font-extrabold tracking-tight text-foreground sm:text-8xl">
  <span className="reveal-mask"><span>Aman </span></span>
  <span className="reveal-mask"><span className="text-aurora">Goel.</span></span>
</h1>
```

- [ ] **Step 3: Typecheck + manual check**

Run typecheck. `dev`: on load, the H1 wipes up from a masked baseline; under reduced-motion it simply appears. Confirm both themes.

- [ ] **Step 4: Isolation check + commit**

Run isolation check (count unchanged — these CSS rules are inside the non-wizarding scope).
```bash
git add artifacts/portfolio/src/components/modern/sections/HeroModern.tsx artifacts/portfolio/src/components/modern/modern.css
git commit -m "feat(modern): masked hero headline reveal"
```

---

## Task 11: Section scroll-reveal polish (framer-motion)

Light, consistent reveals so sections feel choreographed with the journey. Do this section by section; commit once at the end.

**Files (modify, one at a time):**
- `sections/AboutModern.tsx`, `SkillsModern.tsx`, `ExperienceModern.tsx`, `ProjectsModern.tsx`, `ResearchModern.tsx`, `AchievementsModern.tsx`, `InterestsModern.tsx`, `ContactModern.tsx`

- [ ] **Step 1: Establish a reusable reveal variant**

Create `artifacts/portfolio/src/components/modern/journey/reveal.ts`:
```tsx
import type { Variants } from "framer-motion";

/** Shared, restrained scroll-reveal: rises + fades, staggered children. */
export const revealContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
```

- [ ] **Step 2: Apply to each section heading/content block**

For each section file, read it first. Where a section currently renders content without an entrance (or with an ad-hoc one), wrap the primary content group:
```tsx
import { motion } from "framer-motion";
import { revealContainer, revealItem } from "@/components/modern/journey/reveal";
// ...
<motion.div
  variants={revealContainer}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, margin: "-80px" }}
>
  <motion.div variants={revealItem}>{/* heading */}</motion.div>
  <motion.div variants={revealItem}>{/* body / cards grid */}</motion.div>
</motion.div>
```
Keep it light — do NOT restructure markup or change content. If a section already has good `whileInView` reveals (e.g. uses `SectionHeading` with motion), leave it and only add the shared variant to cards that currently pop in without animation. The goal is consistency, not churn.

- [ ] **Step 3: Add subtle scroll parallax to one feature element per section (optional, high-value spots only)**

For sections with a hero image/card cluster (Projects, Research), add a gentle parallax using framer-motion `useScroll` + `useTransform`:
```tsx
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
// inside component:
const ref = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
// <motion.div ref={ref} style={{ y }}> ... </motion.div>
```
Apply to at most 2 sections. Skip entirely under reduced-motion is automatic (framer respects it via the transform being tiny; if you want, gate with the existing `useReducedMotion`).

- [ ] **Step 4: Typecheck + manual check**

Run typecheck. `dev`: scroll the whole page — each section rises in cleanly once, no double-triggers, no layout shift. Both themes.

- [ ] **Step 5: Commit**

```bash
git add artifacts/portfolio/src/components/modern/
git commit -m "feat(modern): consistent scroll-reveal polish across sections"
```

---

## Task 12: Final pass — perf, tiers, reduced-motion, isolation

**Files:** none new; verification + fixes only.

- [ ] **Step 1: Reduced-motion**

In DevTools → Rendering → "Emulate prefers-reduced-motion: reduce", reload. Expect: static constellation frame (no animation), native scroll, hero text appears without wipe, section reveals are instant. No console errors.

- [ ] **Step 2: Low tier (mobile)**

DevTools device toolbar → a phone preset, reload. Expect: lighter constellation (fewer stars), no bloom, native scroll, no jank, no overheating warnings. Anchor links land correctly.

- [ ] **Step 3: High tier desktop perf**

DevTools Performance: record a scroll from top to bottom. Expect: sustained ~60fps on a typical laptop; if frame time spikes, reduce `STAR_COUNT` high value (e.g. 120) or bloom resolution, and re-record.

- [ ] **Step 4: Wizarding untouched (critical)**

Toggle to the wizarding theme. Expect: the original wizarding site exactly as before — NO journey canvas, no smooth-scroll inertia (native), and in DevTools Performance no leftover `requestAnimationFrame` loop from JourneyScene (it unmounts because `ModernHome` unmounts). Confirm the page behaves identically to `main`.

- [ ] **Step 5: Isolation invariants**

Run:
```bash
cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && \
  git diff main --name-only | grep -E "src/wizarding/|src/components/wizarding/" && echo "VIOLATION" || echo "isolation OK" ; \
  grep -c "theme-wizarding" artifacts/portfolio/src/index.css
```
Expect: `isolation OK` and the count recorded in Task 0.

- [ ] **Step 6: Full build**

Run:
```bash
cd "C:/Users/amanc/Desktop/LEARNING/Wolfie8935" && pnpm --filter @workspace/portfolio typecheck && pnpm --filter @workspace/portfolio build
```
Expect: success.

- [ ] **Step 7: Final commit (if any fixes were made)**

```bash
git add -A artifacts/portfolio/
git commit -m "perf(modern): tier/reduced-motion tuning + isolation verification"
```

---

## Self-review notes (author)

- **Spec coverage:** engine choice (Task 0/5/9), journey stages (Task 2/6), tiers (Task 1, applied in 5/9/12), Lenis+ScrollTrigger (Task 4), fixed-layer mount (Task 7), anchor scroll (Task 8), hero reveal (Task 10), section polish (Task 11), reduced-motion + isolation + build (Task 12). All spec sections map to a task.
- **Wizarding isolation:** enforced as a per-task invariant + explicit checks in Tasks 7, 10, 12. No task touches `src/wizarding/**` or `src/components/wizarding/**`. `useReducedMotion` reuse is allowed by the existing pattern; this plan instead uses the new `useDeviceTier` (which reads the media query directly), avoiding even that import.
- **Naming consistency:** `useDeviceTier→DeviceTier`, `useScrollStage→progressRef`, `useSmoothScroll→{scrollTo}`, `sampleStage`/`STAGES`/`StageFrame`, `JourneyScene` props `{tier, progressRef, className}` — used consistently across Tasks 1–11.
- **Testing reality:** only `stages.ts` is pure-unit-testable; everything else is typecheck + build + manual. Task 2 handles the "no test runner installed" case explicitly rather than assuming vitest.
```
