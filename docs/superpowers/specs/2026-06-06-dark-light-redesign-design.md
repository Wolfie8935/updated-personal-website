# Dark/Light Mode Redesign — "Liquid Glass / Aurora"

**Date:** 2026-06-06
**Project:** `artifacts/portfolio` (Aman Goel portfolio)
**Status:** Approved — implementation in progress

## Goal

A complete, award-worthy redesign of the **dark** and **light** themes with iOS-26-style
liquid glassmorphism, an aurora gradient world, one signature WebGL 3D moment, tasteful
3D card tilts, scroll-linked parallax, and pervasive micro-interactions. It must showcase
Aman's personality (AI/ML builder, former tennis player, competitive coder, curious
explorer of travel/food/coding/AI) with goofy easter eggs.

## Hard Constraints (non-negotiable)

1. **The wizarding theme is never touched or broken.** No edits to any file under
   `src/wizarding/**` or `src/components/wizarding/**`, and the `:root.theme-wizarding` /
   `body.theme-wizarding` blocks in `index.css` stay byte-for-byte identical.
2. **Nothing is pushed to GitHub.** All work stays local for review.

## Architecture — Page-Level Fork

The wizarding theme restyles the *shared* section components via CSS scoped to
`.theme-wizarding`, and `Navbar`/`Footer` carry wizarding logic. Therefore we fork at the
page level:

```
pages/Home.tsx
  const { theme } = useTheme();
  return theme === "wizarding" ? <WizardingHome/> : <ModernHome/>;
```

- `pages/WizardingHome.tsx` — the **current** `Home.tsx` JSX moved verbatim (Navbar, Footer,
  all sections, HorcruxHunt wrapper, cinematic intro, Platform 9¾ dividers, etc.).
- `components/modern/ModernHome.tsx` — all-new tree mounted only when NOT wizarding.

Because the modern components are never mounted in wizarding and use **new class names**
(`glass-card`, never `wizard-card`), there is zero possibility of style bleed in either
direction. The theme toggle keeps cycling dark → light → wizarding.

## Isolation rules

- New styles live in `src/components/modern/modern.css`, imported once from `index.css`
  via a single added `@import` line. All modern selectors are scoped under
  `:root:not(.theme-wizarding)`.
- `index.css` edits are limited to: (a) the one `@import` line, (b) optional additive
  dark/light token refinements. The wizarding block is not modified.
- Modern components MUST NOT import anything from `@/wizarding/*` or
  `@/components/wizarding/*`, **except** the generic `useReducedMotion` hook (theme-agnostic).
- `HorcruxInk`-wrapped words in copy are replaced with plain text in modern components.

## Visual System

- **Aurora field:** drifting multi-stop gradient mesh (indigo `#6366f1` → cyan `#22d3ee`
  → violet `#8b5cf6`). WebGL shader in the hero; CSS-animated blob fallback elsewhere and
  under reduced motion.
- **Liquid glass:** layered `backdrop-filter: blur()+saturate()`, 1px refraction edge,
  inner specular highlight, soft multi-layer shadow, pointer-driven sheen + spring tilt.
  Light = frosted white over warm off-white; dark = smoked glass over deep navy.
- **Type:** Inter + JetBrains Mono (already loaded), pushed scale/contrast; gradient/sheen
  text accents.

## Components

| File | Purpose |
|------|---------|
| `components/modern/ModernHome.tsx` | Non-wizarding page shell + aurora + easter eggs |
| `components/modern/NavbarModern.tsx` | Glass nav, scroll-spy, resume, theme toggle |
| `components/modern/AuroraBackground.tsx` | Site-wide CSS aurora layer |
| `components/modern/HeroScene.tsx` | three.js: aurora shader plane + neural icosahedron |
| `components/modern/GlassCard.tsx` | Reusable glass surface w/ 3D tilt + sheen |
| `components/modern/sections/HeroModern.tsx` | Landing: 3D scene, headline, CTAs, stat count-ups |
| `components/modern/sections/AboutModern.tsx` | Bio + highlights + quick-stats |
| `components/modern/sections/SkillsModern.tsx` | Interactive glass skill grid |
| `components/modern/sections/ExperienceModern.tsx` | Glass timeline |
| `components/modern/sections/ProjectsModern.tsx` | Tilt project cards w/ live links |
| `components/modern/sections/ResearchModern.tsx` | Publications + IISc report + topic explorer |
| `components/modern/sections/AchievementsModern.tsx` | Animated stat/achievement grid |
| `components/modern/sections/InterestsModern.tsx` | NEW "Off the clock" (travel/food/coding/AI/tennis) |
| `components/modern/sections/ContactModern.tsx` | Working contact form (same handler) + socials |
| `components/modern/FooterModern.tsx` | Glass footer (no wizarding hints) |
| `components/modern/hooks/useTilt.ts` | Pointer 3D tilt |
| `components/modern/hooks/useCountUp.ts` | In-view animated counters |
| `components/modern/hooks/useMagnetic.ts` | Magnetic buttons |
| `components/modern/EasterEggs.tsx` | Konami surprise + tennis "ace" gag + cursor glow |
| `components/modern/modern.css` | Glass/aurora styles, reduced-motion fallbacks |

Section anchor IDs and order are preserved: `home, about, skills, experience, projects,
research, achievements, contact` (+ new `interests`) so scroll-spy keeps working.

## Motion & 3D (balanced/performant)

- One WebGL scene (hero), DPR-capped, paused when off-screen.
- framer-motion: scroll reveals, magnetic CTAs, 3D tilt, count-ups, custom glass cursor glow.
- Everything gated behind `prefers-reduced-motion` via the existing `useReducedMotion` hook;
  WebGL replaced by a static CSS aurora on reduced motion.

## Personality

- **AI/ML** — hero 3D object reads as a neural/reasoning constellation; copy leans on
  CERAS / IISc / reasoning engines.
- **Tennis** — motion metaphors + an "ace" easter egg.
- **Competitive** — bold animated stats (ICPC #77, 400+ solved, 9.79 CGPA).
- **Goofy** — non-wizarding konami surprise + witty hover microcopy.
- **Explore** — "Off the clock" interests strip (travel, food, coding, AI).

## Accessibility & Performance

Reduced-motion fallbacks, visible focus states, semantic landmarks, lazy/paused WebGL,
contrast-checked palettes for both modes.

## Verification

After build: (1) `git status`/diff to prove no wizarding files changed and the
`.theme-wizarding` CSS block is untouched; (2) typecheck + build; (3) manual pass through
dark, light, and wizarding (confirm all wizarding toys still work); (4) confirm nothing is
pushed.
