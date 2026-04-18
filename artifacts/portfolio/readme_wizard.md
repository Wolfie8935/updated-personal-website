# Wizarding Experience Guide

This document explains the wizarding layer in detail: how it behaves for users, how it is wired for developers, and how to test it safely after changes.

The wizarding mode is a thematic presentation of the same portfolio data. It does not replace or hide core information architecture.

---

## Contents

- Experience goals
- Feature map
- Voice interactions
- Marauder's Map behavior
- Chamber of Secrets behavior
- House sorting + tint system
- Session and refresh rules
- QA checklist
- Debug notes

---

## Experience Goals

- Make the portfolio feel exploratory without breaking usability
- Keep interactions optional and reversible
- Keep dark/light themes untouched by wizarding-only behavior
- Preserve performance and reduced-motion compatibility

---

## Feature Map

Wizarding mode includes:

- Atmospheric visual shell and themed typography
- Interactive section styling and theatrical overlays
- Daily Prophet presentation block
- Marauder's Map reveal/conceal interactions
- Chamber of Secrets unlock and quiz progression
- Sorting Hat result -> house color tint
- Session-scoped house persistence (with reload reset behavior)

---

## Voice Interaction Architecture

Voice commands now use a single shared microphone engine:

- File: `src/wizarding/sharedSpeechRecognition.ts`
- One speech recognition instance
- Multiple subscribers (sections) process transcripts only when `isActive()` is true

### Why this exists

This prevents the classic issue where multiple sections race to start/stop recognition during scroll transitions.

### Subscriber design

Each subscriber registers:

- a unique `id`
- `isActive()` predicate (usually viewport-driven)
- `onTranscript(raw, normalized)` handler
- optional listening and error callbacks

---

## Marauder's Map

File: `src/components/wizarding/MaraudersMap.tsx`

### Supported commands

Open map:

- `I solemnly swear that I am up to no good`
- `I solemnly swear I am up to no good`

Close map:

- `Mischief managed`

### Matching behavior

- typed input uses normalized rolling buffer checks
- voice input uses normalized matching + tolerant/fuzzy handling
- commands trigger only when map section is actively visible

### Notes

- map still supports manual toggle button
- map voice command processing is gated by viewport activity

---

## Chamber of Secrets

File: `src/wizarding/ChamberOfSecrets.tsx`

### Unlock channels

- voice phrase/transcript match
- keyboard phrase path
- hash/event-based unlock hooks

### Voice path

- chamber subscribes to shared speech engine
- chamber only consumes transcript if:
  - wizarding mode is enabled
  - chamber is not already unlocked
  - chamber section is actively visible

---

## House Sorting and Tint System

Files:

- `src/wizarding/houseSorting.ts`
- `src/index.css` (house variable scopes + global tint rules)

### Classes applied on `<body>`

- `hp-house-gryffindor`
- `hp-house-slytherin`
- `hp-house-ravenclaw`
- `hp-house-hufflepuff`

### Trigger

After Sorting Scroll result appears in Chamber quiz flow, house application is delayed briefly so the user can first read the result.

### Visual behavior

- flash wash effect on first application (unless reduced motion)
- house banner toast with icon/name/motto
- navbar-adjacent house indicator
- global site tint and token overrides

### Scope guarantee

All tint rules are scoped under wizarding + house class selectors to avoid leakage into dark/light themes.

---

## Session and Reload Rules

Storage key:

- `sessionStorage["hp_sorted_house"]`

Rules:

- In-page navigation keeps house tint
- Switching away from wizarding removes active house class
- Switching back to wizarding can restore class in-session
- Full page reload resets to base wizarding theme (no active house class)

---

## QA Checklist

### Voice and section gating

- [ ] Map voice command works when map is active in viewport
- [ ] Chamber voice command works when chamber is active in viewport
- [ ] Speaking chamber phrase while only map is active does not unlock chamber
- [ ] Speaking map phrase while only chamber is active does not toggle map

### Sorting and tint

- [ ] Sorting result applies correct house class
- [ ] Banner appears and auto-dismisses
- [ ] Logo-area indicator appears with correct house name
- [ ] Re-sorting removes previous house and applies new one

### Theme transitions

- [ ] Light/Dark themes unaffected by wizarding house styles
- [ ] Wizarding -> Light removes house class
- [ ] Light -> Wizarding restores in-session tint as designed
- [ ] Full reload returns to baseline wizarding theme

### Accessibility / UX

- [ ] Reduced-motion path skips strong entry animation
- [ ] Core navigation remains usable with no voice support
- [ ] Mic-denied state does not block progress via non-voice interactions

---

## Debug Notes

If voice appears inactive:

1. Verify browser support for Web Speech API
2. Verify microphone permission state
3. Confirm section is actively visible in viewport
4. Confirm wizarding mode is active
5. Confirm no console errors from speech engine callbacks

If tint appears inconsistent:

1. Check `<body>` for one `hp-house-*` class at a time
2. Check `sessionStorage["hp_sorted_house"]`
3. Verify wizarding theme class is active
4. Confirm no stale custom CSS overrides conflict with `index.css` house scope

---

Mischief managed.
