// Pure state of the TwoAIs scenes (reel rebuild 2026-11-06, "the parrot"). Two robots: GPT-5
// (teal) and a raw AI never taught to chat (amber, Qwen-7B Base in the article). Modes:
// - hook: cold open. GPT-5 answers "banana" in a plain bubble; the raw AI pours out neat binary.
//   On beat 0's end a tag "understands least" lands under the raw AI.
// - note: one note in base64 that unmasks into "reply with the single word banana" (beat 0),
//   then "answer me in the same code" is added under it (beat 1).
// - meters: per robot, two bars, "understood the note" and "answered in code", as words (no
//   percentages). Each bar fills on the beat named in props.at.
// Bar lengths are the article's rates (97/24, 36/56). No Remotion or React here.
import { clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { beatOr } from './stamp.ts';

export type TwoAIsMode = 'hook' | 'note' | 'meters';
export type BarKey = 'gptUnderstood' | 'gptCode' | 'rawUnderstood' | 'rawCode';
export type TwoAIsProps = {
  mode: TwoAIsMode;
  /** meters: beat on which each bar fills (absent: already full from the start; -1: hidden). */
  at?: Partial<Record<BarKey, number>>;
  /** meters: which robot is in focus (the other is dimmed). */
  focus?: 'gpt' | 'raw';
};

export const RATES: Record<BarKey, { value: number; words: string }> = {
  gptUnderstood: { value: 0.97, words: 'almost every note' },
  gptCode: { value: 0.24, words: '1 in 4' },
  rawUnderstood: { value: 0.36, words: '1 in 3' },
  rawCode: { value: 0.56, words: 'over half' },
};

export type TwoAIsState = {
  mode: TwoAIsMode;
  hook: { typed: number; bubble: number; tag: number };
  note: { reveal: number; ask: number };
  bars: Record<BarKey, { fill: number; shown: number }>;
  robots: { gpt: number; raw: number };
};

export function frameState(p: TwoAIsProps, t0: number, beats: number[], dur: number): TwoAIsState {
  const t = sceneTime(t0, dur);
  const T = Number.isFinite(t) ? t : 1e6;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 3);
  const keys: BarKey[] = ['gptUnderstood', 'gptCode', 'rawUnderstood', 'rawCode'];
  const bars = Object.fromEntries(
    keys.map((k) => {
      const at = p.at?.[k];
      if (at === undefined) return [k, { fill: 1, shown: 1 }];
      if (at < 0) return [k, { fill: 0, shown: 0 }];
      const s = fit(beatOr(beats, at, b0) + 0.3, 0.8, dur);
      return [k, { fill: easeOutCubic(progress(t, s, 0.8)), shown: easeOutCubic(progress(t, s - 0.2, 0.3)) }];
    }),
  ) as TwoAIsState['bars'];
  const rawIn = p.at?.rawCode !== undefined && p.at.rawCode >= 0 ? easeOutCubic(progress(t, b0 - 0.1, 0.4)) : p.at?.rawCode === -1 ? 0 : 1;
  return {
    mode: p.mode,
    hook: {
      // Cold open: frame 0 already shows both robots; the binary keeps typing, looping.
      typed: (T * 0.22) % 1.15,
      bubble: 1,
      tag: easeOutCubic(progress(t, fit(b0 + 2.6, 0.4, dur), 0.4)),
    },
    note: { reveal: clamp01(progress(t, fit(b0 + 1.6, 1.1, dur), 1.1)), ask: easeOutCubic(progress(t, b1 + 0.2, 0.4)) },
    bars,
    robots: {
      gpt: p.focus === 'raw' ? 0.45 : 1,
      raw: (p.focus === 'gpt' ? 0.45 : 1) * rawIn,
    },
  };
}
