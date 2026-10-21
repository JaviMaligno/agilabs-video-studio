// Pure state of the CipherCard scenes (carried over from the ciphers video; data from the repo's
// own cipher code, src/data/ciphers.json). Modes:
// - ladder: the hook's banana task in all ten ciphers, one row each, popping in turn (base64,
//   the hook's row, highlighted), with a counter up to 696 conversations.
// - mimic (new): beat 0 a real task card in binary arrives at the Qwen-7B Base chip and the chip
//   types back a long, flawless line of binary (illustrative: a stock sentence re-encoded with
//   the same code, not a model output); beat 1 three rows (binary, Cyrillic homoglyphs, block
//   permutation): "in code ✓" but "task done: 0", stamped MIMICRY, then 36% / 56%.
// No Remotion or React here.
import { clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { clip, morph, type Glyph } from './glyphs.ts';
import { NO_SLAM, beatOr, slam, type Slam } from './stamp.ts';

export type CipherMode = 'ladder' | 'mimic';
export type CipherProps = { mode: CipherMode };

export type VideoCipherData = {
  plain: string;
  ciphers: Record<string, string>;
  task: { plain: string; ciphers: Record<string, string> };
  mimic: Record<string, string>;
};

/** Ten ladder rows, in the article's order, with their on-screen names. */
export const LADDER: { key: string; name: string }[] = [
  { key: 'rot13', name: 'ROT13' },
  { key: 'random_substitution', name: 'Keyed substitution' },
  { key: 'letters_to_digits', name: 'Letters → digits' },
  { key: 'morse', name: 'Morse' },
  { key: 'binary', name: 'Binary' },
  { key: 'base64', name: 'Base64' },
  { key: 'reverse_all', name: 'Reversal' },
  { key: 'block_permutation', name: 'Block permutation' },
  { key: 'cyrillic_homoglyph', name: 'Cyrillic homoglyphs' },
  { key: 'disemvowel', name: 'Disemvowel' },
];

/** The three cells where the base model wrote in code and never did the task. */
export const MIMIC_ROWS: { key: string; name: string }[] = [
  { key: 'binary', name: 'Binary' },
  { key: 'cyrillic_homoglyph', name: 'Cyrillic homoglyphs' },
  { key: 'block_permutation', name: 'Block permutation' },
];

export const ROW_MAX = 27;
export const CONVERSATIONS = 696;

export type LadderState = {
  mode: 'ladder';
  counter: { appear: number; value: number };
  sub: { appear: number };
  rows: { name: string; text: string; pop: number; glyphs: Glyph[] | null; hot: number }[];
};

export type MimicState = {
  mode: 'mimic';
  hero: { opacity: number; card: number; chip: number; typed: number; caret: number };
  rows: { appear: number; tick: number; zero: number }[];
  stamp: Slam;
  tag: { pop: number };
};

export type CipherState = LadderState | MimicState;

export const sameLength = (a: string, b: string) => [...a].length === [...b].length;

export function frameState(props: CipherProps, t0: number, beats: number[], dur: number, data: VideoCipherData): CipherState {
  const t = sceneTime(t0, dur);
  const b0 = beatOr(beats, 0, 0);

  if (props.mode === 'ladder') {
    const start = Math.max(0, b0 + 0.05);
    const pop = 0.32;
    const room = Math.max(0.5, dur - 0.9 - start - pop);
    const sp = Math.min(0.3, room / (LADDER.length + 1));
    const rows = LADDER.map((r, i) => {
      const at = fit(start + 0.2 + i * sp, pop, dur);
      const text = data.ciphers[r.key] ?? '';
      const same = sameLength(data.plain, text);
      return {
        name: r.name,
        text: clip(text, ROW_MAX),
        pop: easeOutCubic(progress(t, at, pop)),
        glyphs: same ? morph(data.plain, text, progress(t, at, pop + 0.25), t, 0.5, 20 + i) : null,
        hot: r.key === 'base64' ? 1 : 0,
      };
    });
    const cp = easeOutCubic(progress(t, start, 1.4));
    return {
      mode: 'ladder',
      counter: { appear: easeOutCubic(progress(t, start - 0.15, 0.3)), value: Math.round(CONVERSATIONS * cp) },
      sub: { appear: easeOutCubic(progress(t, start + 1.0, 0.4)) },
      rows,
    };
  }

  // mimic
  const b1 = fit(beatOr(beats, 1, b0 + 3.2), 2.6, dur);
  const typeStart = b0 + 0.9;
  const typeEnd = Math.max(typeStart + 0.6, b1 - 0.4);
  const rows = MIMIC_ROWS.map((_, i) => {
    const at = b1 + 0.15 + i * 0.3;
    return {
      appear: easeOutCubic(progress(t, at, 0.35)),
      tick: easeOutCubic(progress(t, at + 0.35, 0.3)),
      zero: easeOutCubic(progress(t, b1 + 1.6 + i * 0.2, 0.3)),
    };
  });
  const stampAt = fit(b1 + 2.5, 0.6, dur);
  return {
    mode: 'mimic',
    hero: {
      opacity: 1 - easeOutCubic(progress(t, b1 - 0.25, 0.3)),
      card: easeOutCubic(progress(t, b0 - 0.1, 0.4)),
      chip: easeOutCubic(progress(t, b0 + 0.2, 0.4)),
      typed: clamp01(progress(t, typeStart, typeEnd - typeStart)),
      caret: Math.floor((Number.isFinite(t) ? t : 0) * 3) % 2,
    },
    rows,
    stamp: t >= stampAt ? slam(t, stampAt) : NO_SLAM,
    tag: { pop: easeOutCubic(progress(t, stampAt + 0.5, 0.4)) },
  };
}
