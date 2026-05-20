/** ASR-friendly detection for “Expecto Patronum”. */

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

const SPELL_NORM = "expecto patronum";
const SPELL_ALT = "expecto patronus";

export function speechSaysExpectoPatronum(normalized: string): boolean {
  if (!normalized.includes("expecto")) return false;
  if (/\bpatronum\b/.test(normalized) || /\bpatronus\b/.test(normalized)) return true;
  if (normalized.includes("patronum") || normalized.includes("patronus")) return true;
  if (normalized.includes("petronum")) return true;

  const best = Math.max(
    phraseSimilarityRatio(normalized, SPELL_NORM),
    phraseSimilarityRatio(normalized, SPELL_ALT),
  );
  if (best >= 0.82) return true;

  if (normalized.includes("expecto") && /patron/.test(normalized)) return true;

  return false;
}
