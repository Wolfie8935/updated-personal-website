/** Levenshtein distance for fuzzy speech matching (short spells). */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row = new Uint32Array(n + 1);
  for (let j = 0; j <= n; j += 1) row[j] = j;
  for (let i = 1; i <= m; i += 1) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= n; j += 1) {
      const cur = row[j]!;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost);
      prev = cur;
    }
  }
  return row[n]!;
}

function phraseSimilarityRatio(utterance: string, target: string): number {
  if (!utterance.length && !target.length) return 1;
  if (!target.length) return 0;
  const d = levenshtein(utterance, target);
  return 1 - d / Math.max(utterance.length, target.length, 1);
}

const SPELL_WORD_SIM_MIN = 0.72;

function fuzzyWordMatch(word: string, target: string, maxLen: number): boolean {
  if (word.length > maxLen) return false;
  if (Math.abs(word.length - target.length) > 1) return false;
  return phraseSimilarityRatio(word, target) >= SPELL_WORD_SIM_MIN;
}

/** Normalized transcript (from shared speech) → user said “Lumos”. Check before Nox so “nox lumos” ends lit. */
export function speechSaysLumos(normalized: string): boolean {
  if (/\blumos\b/.test(normalized)) return true;
  if (normalized.includes("luminos")) return true;
  for (const w of normalized.split(/\s+/)) {
    if (!w) continue;
    if (fuzzyWordMatch(w, "lumos", 12)) return true;
  }
  return false;
}

/** Normalized transcript → user said “Nox”. */
export function speechSaysNox(normalized: string): boolean {
  if (/\bnox\b/.test(normalized)) return true;
  for (const w of normalized.split(/\s+/)) {
    if (!w) continue;
    if (fuzzyWordMatch(w, "nox", 8)) return true;
  }
  return false;
}
