// Glyph-level text morphing for the cipher scenes: pure, deterministic, no Remotion or React.
import { clamp01 } from './steps.ts';

export type CipherData = {
  plain: string;
  ciphers: Record<string, string>;
  rosetta: [string, string][];
};

/** One glyph slot of a morphing line: the character shown and how settled it is (0..1). */
export type Glyph = { ch: string; settle: number };

const NOISE = 'abcdefghijklmnopqrstuvwxyz0123456789#%&*+=?';

/** Deterministic pseudo-random number in [0, 1) from integers. */
export const hash = (...n: number[]): number => {
  let h = 2166136261;
  for (const x of n) {
    h ^= Math.floor(Number.isFinite(x) ? x : 0) & 0xffffffff;
    h = Math.imul(h, 16777619);
    h ^= h >>> 13;
  }
  return ((h >>> 0) % 100000) / 100000;
};

/** A flickering noise glyph for slot `i`; changes every `1 / rate` seconds. */
export const noiseGlyph = (i: number, t: number, seed = 0, rate = 18): string =>
  NOISE[Math.floor(hash(i, Math.floor((Number.isFinite(t) ? t : 0) * rate), seed) * NOISE.length)];

/**
 * Morph `from` into `to` (same length) slot by slot as `p` goes 0 -> 1. With `wave` > 0 slots
 * turn left to right; a slot in transit shows flickering noise. Spaces stay spaces.
 */
export function morph(from: string, to: string, p: number, t: number, wave = 0.6, seed = 0): Glyph[] {
  const a = [...from];
  const b = [...to];
  const n = Math.max(a.length, b.length);
  const out: Glyph[] = [];
  const pp = clamp01(p);
  for (let i = 0; i < n; i++) {
    const pos = n > 1 ? i / (n - 1) : 0;
    // Slot window: starts at pos * wave, lasts (1 - wave) of the run.
    const q = wave >= 1 ? (pp >= pos ? 1 : 0) : clamp01((pp - pos * wave) / (1 - wave));
    const fa = a[i] ?? ' ';
    const fb = b[i] ?? ' ';
    let ch: string;
    if (q <= 0) ch = fa;
    else if (q >= 1) ch = fb;
    else if (fa === ' ' && fb === ' ') ch = ' ';
    else ch = q < 0.85 ? noiseGlyph(i, t, seed) : fb;
    out.push({ ch, settle: q });
  }
  return out;
}

/** Letters of `s` ranked by how often they occur (ties: first occurrence). Spaces skipped. */
export function byFrequency(s: string): string[] {
  const count = new Map<string, number>();
  const first = new Map<string, number>();
  [...s].forEach((c, i) => {
    if (c === ' ') return;
    count.set(c, (count.get(c) ?? 0) + 1);
    if (!first.has(c)) first.set(c, i);
  });
  return [...count.keys()].sort((x, y) => count.get(y)! - count.get(x)! || first.get(x)! - first.get(y)!);
}

/** Letter counts of `s` in frequency order (for the histogram). */
export function histogram(s: string): { ch: string; n: number }[] {
  const ranked = byFrequency(s);
  return ranked.map((ch) => ({ ch, n: [...s].filter((c) => c === ch).length }));
}

/** Short, row-sized form of a long cipher string ("1101110 1100001 …"). */
export const clip = (s: string, max: number): string => ([...s].length <= max ? s : [...s].slice(0, Math.max(1, max - 1)).join('').trimEnd() + '…');
