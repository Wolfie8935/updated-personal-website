# Claude Design port — "Court & Terminal" dark/light theme (2026-07-19)

Replace the entire modern (dark/light) theme with the Claude Design project
"Beautiful portfolio landing page" → `Aman Goel Portfolio.dc.html`
(https://claude.ai/design/p/c80ba479-0fad-4b82-88b3-2fc21ecbc0fb).
Wizarding theme untouched — page-level fork in `pages/Home.tsx` stays.

## Design summary
Single-page cinematic portfolio: Manrope / Instrument Serif / JetBrains Mono,
gold accent #C9A66B, warm-black dark (#0A0908) & parchment light (#E8DECB).
Systems: preloader (counter + iris reveal), physics starfield canvas, inertia
scroll + velocity skew, hero letter shatter + throwable tennis ball, velocity
marquees, word-brighten about, 560vh horizontal work rail (rotate→settle→
slide→final card expands full-bleed) with letterbox bars, full-screen case
study overlays, interactive 3D "reasoning engine" (canvas2d + three.js WebGL
galaxy), principles/experience (SVG path + rolling ball)/capability tilt
cards/recognition staircase/"The First Court" tennis section, contact mask
reveal + elastic email wave + composer, elastic cursor, cursor glow + grain,
theme wipe toggle (NIGHT/DAY), idle screensaver (DVD tennis ball + clock),
hidden terminal (backtick), Konami "Retro Rally" pong game, device tilt.

## Content policy (user rule)
Design = visual spec, implemented exactly. Information = current site wins on
conflicts; design-only info (tennis history, Fox Trading internship, SRCC) is
kept — Aman supplied it in the design sessions; site-only info woven in
design idiom (publications w/ DOI, ORCID, resume, project links, report).
Corrections applied: CGPA 9.79 (not 9.78), AWS list gains RDS, LeetCode URL
case, "FORMER INDIAN TENNIS PLAYER".

## New file layout (artifacts/portfolio/src/components/modern/)
- `content.ts` — every string/list (tickers, about, work cards, case studies,
  principles, experience, capabilities, ascent, first court, contact, terminal)
- `engine.ts` — ported imperative engine (class PortfolioEngine), three.js from
  npm dep, theme via host callbacks (no localStorage of its own)
- `ModernHome.tsx` — assembly + engine mount + theme sync
- `design/Chrome.tsx`, `design/Nav.tsx`, `design/Overlays.tsx`,
  `design/Sections.tsx` — JSX markup keeping the design's data-* attributes
- `modern.css` — design CSS, all selectors guarded `:root:not(.theme-wizarding)`
  (same convention as before), m- prefixed keyframes
- Old modern components/hooks/journey deleted (only Home.tsx imported ModernHome)

## Integration decisions
- ThemeContext gains `setTheme` (cycle toggle kept for wizarding compat).
  Design toggle wipes dark↔light; wizarding reachable via footer "⚡" entry +
  terminal `wizarding` command.
- Fonts added to index.html (Instrument Serif, Manrope, JetBrains Mono).
- Composer keeps design mailto behavior (site's formsubmit dropped — flagged).
- Extra nav item: CV ↓ (resume download); terminal gains resume/papers/
  research/wizarding commands.

## Verify checklist (all done 2026-07-19)
- [x] `pnpm --filter portfolio run typecheck` clean (+ whole-workspace `pnpm run typecheck`)
- [x] `pnpm --filter portfolio build` clean (three.js now in main bundle — preloader covers it)
- [x] dev server driven headless (Playwright/Chrome): dark hero/about/rail/engine/
  experience/contact, terminal + help, case study open/close, Konami game,
  DAY toggle → light, footer ⚡ → wizarding mounts cleanly. 0 console errors.
- [x] `git diff --stat` shows nothing under `src/wizarding/**`,
  `src/components/wizarding/**`, `src/components/sections/**`, `src/index.css`
- [x] `grep -c "theme-wizarding" src/index.css` == 175
