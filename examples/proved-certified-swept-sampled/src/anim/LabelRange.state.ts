// LabelRange: one claim's label over its range. A PROVED stamp spans the whole α axis; the reviewer
// drops a marker at α = 1; the stamp shrinks to α ≥ 1 and the left half becomes a hatched gap,
// "α < 1: no argument". Mode `quote` moves the range up and writes the key sentence under it.
// Pure: no Remotion or React.
import { easeOutCubic, progress, sceneTime } from './steps.ts';

export const W = 960;
export const H = 1090;
export const AXIS = { x0: 60, x1: 900, y: 600 };
export const ONE = (AXIS.x0 + AXIS.x1) / 2;
export const QUOTE = "A wrong label is worse than a weak one, because it's trusted.";
export const QUOTE_EMPHASIS = ['wrong', "trusted."];

export type RangeProps = {
  mode: 'range' | 'quote';
  blend?: boolean;
  cue?: Record<string, number>;
  /** Quote mode: each word's spoken start (scene seconds), so the written quote follows the voice. */
  words?: number[];
  /** The quote is written on screen, so the captions skip it (read by Video.tsx). */
  titleLine?: boolean;
};

const E = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const beat = (beats: number[], i: number, fallback: number) => {
  const b = beats[i];
  return b !== undefined && Number.isFinite(b) ? b : fallback;
};
const cueOf = (p: RangeProps, k: string, fallback: number) => {
  const v = p.cue?.[k];
  return v !== undefined && Number.isFinite(v) ? v : fallback;
};

export type RangeState = {
  reviewer: number;
  axis: number;
  stamp: { pop: number; x0: number; x1: number; ge: number };
  marker: { drop: number };
  gap: number;
  /** Vertical shift of the whole range group (quote mode moves it up). */
  shift: number;
  scale: number;
  quote: null | { words: { text: string; opacity: number; emphasis: boolean }[]; sampled: number };
};

export function frameState(p: RangeProps, time: number, beats: number[], dur: number): RangeState {
  const t = sceneTime(time, dur);
  const b0 = beat(beats, 0, 0);
  if (p.mode === 'quote') {
    // Hold still through the cross-blend from 'range', then move up and write the quote.
    const up = E(t, 0.6, 0.55);
    const w0 = p.words ? 0.95 : Math.max(b0 + 0.1, 0.95);
    const words = QUOTE.split(' ');
    return {
      reviewer: 1 - E(t, 0.45, 0.2),
      axis: 1,
      stamp: { pop: 1, x0: ONE, x1: AXIS.x1, ge: 1 },
      marker: { drop: 1 },
      gap: 1,
      shift: -400 * up,
      scale: 1 - 0.12 * up,
      quote: {
        words: words.map((text, i) => ({
          text,
          // On the spoken word when timings exist (never before the range has moved up).
          opacity: progress(t, Math.max(w0, p.words?.[i] ?? w0 + (i / words.length) * 1.3), 0.3),
          emphasis: QUOTE_EMPHASIS.includes(text),
        })),
        sampled: E(t, cueOf(p, 'sampled', b0 + 2.4), 0.5),
      },
    };
  }
  const b1 = beat(beats, 1, b0 + 3);
  const shrink = E(t, b1 + 0.2, 0.9);
  return {
    reviewer: E(t, 0, 0.4),
    axis: E(t, 0.1, 0.5),
    stamp: { pop: E(t, cueOf(p, 'stamp', b0 + 1.4), 0.3), x0: AXIS.x0 + (ONE - AXIS.x0) * shrink, x1: AXIS.x1, ge: shrink },
    marker: { drop: E(t, cueOf(p, 'drop', b0 + 1.9), 0.5) },
    gap: E(t, b1 + 0.9, 0.5),
    shift: 0,
    scale: 1,
    quote: null,
  };
}

