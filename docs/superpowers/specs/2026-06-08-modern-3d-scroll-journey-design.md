# Modern Theme — Scroll-Driven 3D Journey

**Date:** 2026-06-08
**Status:** Approved (design)
**Scope:** Dark/light "modern" theme only. The wizarding theme is never touched.

## Goal

Elevate the modern (`.dark` / `.light`) portfolio from a good animated page to a
jaw-dropping, clearly-bespoke experience — without making it look "vibe-coded."
The signature moment is a **single continuous neural constellation** that forms,
travels, and resolves as the visitor scrolls, tying the whole page together.

This is **hero-centric**: the 3D journey is the star; section content keeps its
current copy and order and receives motion *polish*, not a redesign.

## Hard constraints (non-negotiable)

- **Never touch the wizarding theme.** No edits under `src/wizarding/**` or
  `src/components/wizarding/**`, except reusing the existing
  `useReducedMotion` hook (already permitted by the isolation pattern).
- All new code lives under `src/components/modern/**`. Styles stay in
  `modern.css` (scoped `:root:not(.theme-wizarding)`).
- `theme-wizarding` occurrence count in `src/index.css` stays constant.
- Smooth-scroll (Lenis) initializes **only** inside `ModernHome`, which mounts
  only on non-wizarding themes (`pages/Home.tsx` fork). Wizarding scroll behavior
  is therefore guaranteed untouched.
- Do not push to GitHub unless asked.

## Engine & dependencies

Build on the **existing raw three.js** approach — do **not** migrate to
react-three-fiber.

Rationale: the current `HeroScene` already handles DPR capping, IntersectionObserver
pause, visibility pause, and full dispose-on-unmount. The journey is one evolving
object, not a large component tree, so r3f buys little while adding bundle weight.
The bloom glow ships in three itself (`EffectComposer` + `UnrealBloomPass`).

**New dependencies (portfolio package only):**
- `gsap` — ScrollTrigger as the single normalized scroll-progress source.
- `lenis` — buttery smooth-scroll on capable devices.

No r3f, no drei. framer-motion (already present) handles section reveals.

## The journey — stages

One neural constellation (existing icosahedron core + particle field + synapses)
becomes a character driven by normalized scroll progress `p` (0 → 1). Stages
cross-fade; they do not hard-cut.

| Scroll region | Core behavior | Content treatment |
|---|---|---|
| Hero | Particles **assemble from chaos** into the lattice on load; slow rotation; cursor-reactive depth; full bloom | Masked text reveal, refined magnetic CTAs |
| About | Drifts off-center; camera dollies; field calms | Parallax + staggered reveal |
| Skills | Nodes **re-cluster into domain groups** (visible rebuild) | Scroll-scrubbed reveal |
| Experience / Projects | Core **recedes in Z**, dims to a backdrop so cards own focus; aurora hue shifts per section | Tilt / parallax cards |
| Research | Morphs into a **denser scientific lattice** | Quiet, precise reveals |
| Contact / Footer | Particles **converge inward to a single glowing point** — a send-off | Final CTA bloom |

Stage mapping is data-driven: an array of keyframes over `p` for camera Z,
group scale/position, rotation rate, particle spread, bloom strength, and palette
index. The render loop interpolates between adjacent keyframes. Adding or tuning a
stage means editing data, not the loop.

## Architecture

### New files (all under `src/components/modern/`)

- **`JourneyScene.tsx`** — fixed, full-viewport WebGL layer behind all content
  (replaces the section-local `HeroScene`). Raw three.js. Owns the scene, the
  `EffectComposer` bloom pass (high tier only), and the rAF loop. Reads smoothed
  scroll progress each frame and interpolates the stage keyframes. Keeps all the
  existing lifecycle safety: DPR cap, IO/visibility pause, resize, full dispose.

- **`hooks/useSmoothScroll.ts`** — initializes Lenis and wires it to GSAP
  ScrollTrigger (Lenis drives `ScrollTrigger.update`). No-ops under reduced-motion
  or low tier (native scroll). Returns a `scrollTo(target)` that both anchor
  navigation and the hero buttons use, so in-page links keep working. Cleans up
  Lenis + kills ScrollTriggers on unmount.

- **`hooks/useDeviceTier.ts`** — returns `"high" | "low" | "static"`. `static`
  when `prefers-reduced-motion`. `low` when `pointer: coarse`, low
  `hardwareConcurrency`/`deviceMemory`, or small viewport. `high` otherwise.

- **`hooks/useScrollStage.ts`** — exposes a smoothed, normalized scroll progress
  signal (a ref updated via GSAP ScrollTrigger / Lenis) that `JourneyScene`
  samples in its loop. Keeps cross-component plumbing minimal — no global state lib.

### Modified files

- **`ModernHome.tsx`** — mount `JourneyScene` as a fixed layer (between
  `AuroraBackground` and content); call `useSmoothScroll`. AmbientParticles stays
  on low tier; on high tier the journey is the primary WebGL layer (confirm during
  implementation that layered GPU cost is acceptable, drop AmbientParticles on high
  if needed).

- **`HeroModern.tsx`** — remove the section-local `HeroScene`/`Suspense`; the
  canvas now lives in `ModernHome`. Sync the hero text entrance to the assembly
  beat. Keep all copy, stats, and buttons.

- **Section components** (`AboutModern`, `SkillsModern`, `ExperienceModern`,
  `ProjectsModern`, `ResearchModern`, `AchievementsModern`, `InterestsModern`,
  `ContactModern`) — add scroll-linked reveal/parallax polish via framer-motion
  `useScroll` / `whileInView` and refined stagger. Light touch; no content changes.

- **`modern.css`** — layering (z-index for the fixed journey canvas), text-reveal
  masks, smooth-scroll `html` setup, bloom canvas blend mode. All within the
  existing `:root:not(.theme-wizarding)` scope.

## Tiered behavior

- **High** — full particle counts, bloom on, synapses, DPR ≤ 1.75, all stages,
  Lenis on.
- **Low** — reduced particle counts, **bloom off**, DPR 1, simplified transforms
  (position/scale only, no heavy morphs), Lenis off (native scroll).
- **Static (reduced-motion)** — single static elegant frame, no rAF loop, no
  scroll-linking, no Lenis. Matches current reduced-motion behavior.

## Error handling & robustness

- WebGL context creation wrapped; on failure the aurora background alone remains
  (graceful — page is fully usable without the canvas).
- `JourneyScene` fully disposes geometries, materials, textures, composer, and
  removes the canvas on unmount (theme switch to wizarding must leave nothing
  running). Verify no rAF loop or Lenis instance survives a switch to wizarding.
- Anchor navigation routes through Lenis `scrollTo` when active, native otherwise,
  so the navbar and hero buttons work in every tier.

## Testing & verification

- `pnpm --filter @workspace/portfolio typecheck` passes.
- `pnpm --filter @workspace/portfolio build` succeeds.
- Manual: dark + light themes — hero assembly plays, scroll transforms the core
  through all stages, smooth-scroll feels buttery, anchor links land correctly.
- Switch to wizarding theme: identical to before; no journey canvas, no Lenis, no
  leftover rAF loop (DevTools performance check).
- Reduced-motion (emulated): static frame, native scroll, no jank.
- Mobile/low-tier emulation: lighter scene, no bloom, native scroll, no overheating.
- **Isolation:** `git diff` shows no edits under `src/wizarding/**` or
  `src/components/wizarding/**`; `theme-wizarding` count in `src/index.css`
  unchanged.

## Out of scope (YAGNI)

- No react-three-fiber / drei migration.
- No section content rewrites, reordering, or layout redesign.
- No new routes or backend work.
- No horizontal-scroll or pinned set-pieces beyond what the stage timeline needs
  (hero-centric, not full-page overhaul).
