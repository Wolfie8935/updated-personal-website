# Wolfie8935 — Aman Goel Portfolio

Personal portfolio website for Aman Goel. The whole point of this repo is **`artifacts/portfolio`** — a pure-frontend React + Vite site. It lives inside a pnpm-workspace monorepo scaffolded by Replit; the other packages (`api-server`, `lib/db`, `lib/api-*`, `mockup-sandbox`, `scripts`) are mostly template and are not the active work. `portfolio` only depends on `@workspace/api-client-react`.

> Windows machine, PowerShell 5.1 + Git Bash. See global `~/.claude/CLAUDE.md` for shell rules (absolute forward-slash paths in Bash, no `&&` in PowerShell, etc.).

## Stack & layout
- pnpm workspaces · Node 24 · TypeScript 5.9 (composite project refs). Package manager is pnpm only — `npm`/`yarn` are blocked by a `preinstall` guard.
- Portfolio stack: **React 19, Vite 7, Tailwind CSS v4, three.js (modern engine), Framer Motion (wizarding), Radix UI, wouter, react-hook-form + zod.** (gsap/lenis remain in package.json but are unused since the Court & Terminal port.)
- Key dirs (all under `artifacts/portfolio/src/`):
  - `pages/Home.tsx` — thin theme fork: `theme === "wizarding" ? <WizardingHome/> : <ModernHome/>`
  - `components/modern/**` (+ `modern/modern.css`) — the dark/light "Court & Terminal" theme (Claude Design port, 2026-07-19): static JSX in `design/*` carrying `data-*` attributes, all content strings in `content.ts`
  - `components/modern/engine.ts` — single imperative rAF engine (starfield, inertia scroll, work rail, three.js reasoning tree, terminal/game easter eggs); kept deliberately diffable against the design source — don't refactor it into hooks
  - `wizarding/**` and `components/wizarding/**` — the wizarding theme (**do not touch — see Constraints**)
  - `components/sections/**` — shared section components used by WizardingHome
  - `index.css` — theme CSS vars driven by `<html>` classes `.dark` / `.light` / `.theme-wizarding`
- Entry: `src/main.tsx` → `App.tsx`. Path alias `@` → `src`, `@assets` → repo `attached_assets`.
- Design specs & plans: `docs/superpowers/specs/` and `docs/superpowers/plans/`.

## Run & verify
- Run locally: `pnpm --filter portfolio dev` (Vite on port 3000, host 0.0.0.0). This is the canonical command (`run.txt`).
- Build: `pnpm --filter portfolio build` → `artifacts/portfolio/dist/public`. Root `pnpm run build` runs typecheck first, then every package's build.
- Typecheck (MUST pass before commit):
  - Portfolio only: `pnpm --filter portfolio run typecheck` (`tsc -p tsconfig.json --noEmit`) — verified clean.
  - Whole workspace: `pnpm run typecheck` (`tsc --build` via project refs) — always run from repo root, never `tsc` inside a single package (composite refs won't resolve).
- No env vars required for the portfolio — all content is hardcoded. Vite reads optional `PORT` and `BASE_PATH`.

## Deploy
- No CI/CD in the repo (no `.github/`, `vercel.json`, or `netlify.toml`). Deployment target is **Replit autoscale** (`.replit`: `deploymentTarget = "autoscale"`).
- Git remotes: `origin` → `git@github.com:Wolfie8935/updated-personal-website.git`; `gitsafe-backup` (local backup). Main branch: `main`.
- **Push policy: push to GitHub ONLY when explicitly asked** (hard user rule).
- Health URL / live URL: not found in repo — ask the user if verification is needed.

## Constraints (do not break)
- **Never touch or break the wizarding theme.** Modern components must not import from `@/wizarding/*` or `@/components/wizarding/*` — the only allowed shared import is the generic `useReducedMotion` hook. After any change, `git diff` must show no edits under `src/wizarding/**` or `src/components/wizarding/**`, and `grep -c "theme-wizarding" artifacts/portfolio/src/index.css` must stay **175**.
- **Never push to GitHub without being asked.**
- Theme isolation is by page-level fork (`Home.tsx`): `ModernHome` (with its engine, wheel hijack and canvases) only mounts on dark/light; wizarding gets none of it. Keep it that way. The modern theme toggle flips dark↔light only; wizarding is entered via the footer "⚡ THE THIRD THEME" button or terminal `wizarding` (ThemeContext now exposes `setTheme`).
- `pnpm-workspace.yaml` pins deps via a `catalog:` and platform-specific `overrides` set to `-` (Windows-only native binaries kept, others dropped). Don't hand-edit lockfile platform entries.
- Do not commit `dist/` or `node_modules`.

## graphify
- A knowledge graph may live in `graphify-out/`. For questions about this codebase, run `graphify query "<question>"` FIRST instead of re-reading the tree. Rebuild after big changes with `/graphify --update`.
