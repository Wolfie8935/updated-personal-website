# Aman Goel Portfolio

This repository contains the personal portfolio for Aman Goel, built as a modern React + TypeScript site with two presentation layers:

- Standard portfolio experience (dark/light)
- Wizarding presentation mode with immersive UI systems

The content (projects, research, achievements, contact) remains factual in both modes. The wizarding layer changes visual style and interactions without changing the core information architecture.

## Project Goals

- Keep the site fast, responsive, and accessible
- Preserve clear content hierarchy across themes
- Add optional experiential interactions that do not block normal navigation
- Support rich themed interactions with graceful fallbacks when features are unavailable

## Stack

- React + TypeScript
- Vite
- Tailwind CSS + component primitives
- Framer Motion (for selected motion effects)
- Web Speech API (wizarding voice interactions, when available)

## Local Development

### Requirements

- Node.js 18+ recommended
- npm

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Build and Verify

```bash
npm run typecheck
npm run build
npm run serve
```

## Scripts

| Command             | Description |
| ------------------- | ----------- |
| `npm run dev`       | Start local Vite dev server |
| `npm run build`     | Build production assets |
| `npm run serve`     | Preview production build locally |
| `npm run typecheck` | Run TypeScript checks (`noEmit`) |

## Repository Structure

- `src/components/` - reusable UI sections and themed components
- `src/context/ThemeContext.tsx` - global theme state and theme application
- `src/wizarding/` - wizarding systems, themed modules, styles, and utilities
- `src/index.css` - global tokens + theme scopes + cross-feature styling

## Theme System Overview

The app supports three themes:

- `dark`
- `light`
- `wizarding`

Theme classes are applied at runtime via `ThemeContext`. Wizarding mode is explicitly scoped so dark/light styling is not unintentionally affected.

## Wizarding Systems (Engineering Overview)

The wizarding layer includes:

- atmospheric visual overlays
- chapter-like section styling
- themed components (Daily Prophet, Marauder's Map, Chamber of Secrets, etc.)
- voice-triggered interactions for specific sections
- house tint system tied to sorting result

### 1) Shared Voice Recognition Engine

Voice interactions now run through a single shared microphone service:

- File: `src/wizarding/sharedSpeechRecognition.ts`
- One `SpeechRecognition` instance is shared across wizarding subscribers
- Each section registers:
  - `isActive()` viewport predicate
  - transcript handler
  - optional listening/error hooks
- Avoids mic ownership conflicts between sections while scrolling

Current subscribers:

- `MaraudersMap.tsx`
- `ChamberOfSecrets.tsx`

### 2) Marauder's Map Voice + Typed Phrases

The map supports:

- Open:
  - `i solemnly swear that i am up to no good`
  - `i solemnly swear i am up to no good`
- Close:
  - `mischief managed`

Voice matching includes tolerant/fuzzy matching to handle common speech recognition imperfections.

### 3) Chamber of Secrets Voice Unlock

Chamber voice unlock remains phrase-driven and transcript-aware. With the shared mic architecture, chamber activation now depends on:

- the chamber section being actively visible
- the recognized transcript matching chamber unlock criteria

### 4) House Sorting Tint System

Sorting result applies a house class on `<body>`:

- `hp-house-gryffindor`
- `hp-house-slytherin`
- `hp-house-ravenclaw`
- `hp-house-hufflepuff`

Implementation:

- File: `src/wizarding/houseSorting.ts`
- Stores active house in `sessionStorage` key: `hp_sorted_house`
- Applies animated flash + banner on sorting
- Adds subtle house indicator near logo
- Clears house class on theme exit from wizarding

Refresh behavior:

- On full page reload, house tint is intentionally reset to base wizarding appearance

### 5) Full-Site House Color Cast

House tint is applied globally through `src/index.css` under:

- `body.theme-wizarding[class*="hp-house-"]`

This adjusts:

- accent tokens
- card/border treatment
- navbar/nav link emphasis
- map/chapter/prophet/hud accents
- whole-page color cast layers

## Accessibility and UX Notes

- Wizarding features are optional and should not block normal content usage
- Reduced-motion preferences are respected for major visual transitions
- Voice interactions degrade gracefully when speech APIs are unsupported or blocked
- Keyboard interactions remain available for map phrase triggers

## Troubleshooting

### Voice commands not triggering

Check:

- Browser supports Web Speech API
- Mic permissions are granted
- Section is visibly active in viewport
- You are in wizarding theme

### House tint not visible

Check:

- Sorting quiz has been completed in current session
- Theme is wizarding
- Body has one of `hp-house-*` classes

### House tint disappears on refresh

This is intentional behavior. A hard reload resets to baseline wizarding theme.

## Related Docs

- Wizarding-focused guide: [`readme_wizard.md`](./readme_wizard.md)

## License

Copyright (c) 2025 Aman Goel. All Rights Reserved.

This project and its source code may **not** be used, copied, modified, or distributed without the prior written permission of the author. See [LICENSE](./LICENSE) for full terms.

Wizarding presentation elements are fan-inspired visual motifs and interaction design, not an official affiliation with Warner Bros. or the Harry Potter IP.
