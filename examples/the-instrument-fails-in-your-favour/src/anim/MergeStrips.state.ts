// Pure state of case 2, the inherited benchmark. One phase per narration beat:
//   0 two agents' patch strips slide into one file, the overlap sparks, FAIL; then the 29
//     conflicted pairs, every one a FAIL
//   1 the gauge (pass rate) leans into the "two agents at once fail" arc
//   2 the magnet "missing conflict resolver" is plucked: about half the sparks heal (illustrative
//     of "roughly half"), one pair turns PASS; readouts 7% -> 7% and 7% -> 9%, +1 task
//   3 stamp CONCLUSION HELD
// No Remotion or React here.
import { clamp01, sceneTime } from './steps.ts';
import { ease, fillBeats, lerp, popScale, window01 } from './gauge.ts';

export type MergeProps = Record<string, never> | { [k: string]: unknown };

export const PAIRS = 29;
/** Pairs whose conflict was trivial (heals once resolved): every other one, 14 of 29. */
export const HEALS = (i: number): boolean => i % 2 === 0 && i < 28;
/** The one pair that becomes a pass. */
export const PASS = 12;
/** Pass rate of the stronger model, before and after (needle readings). */
export const BEFORE = 0.07;
export const AFTER = 0.09;

export type MergeState = {
  tag: number;
  file: number;
  stripA: number;
  stripB: number;
  spark: number;
  fail: { scale: number; opacity: number };
  pairs: { pop: number; heal: number; pass: number }[];
  pairsLabel: number;
  top: number;
  gauge: { opacity: number; value: number; lift: number; magnetOut: number; expected: number; after: number };
  bug: number;
  half: number;
  rows: number[];
  plus: number;
  held: { scale: number; opacity: number };
};

export function frameState(_props: MergeProps, t0: number, beats: number[], dur: number): MergeState {
  const t = sceneTime(t0, dur);
  const b = fillBeats(beats, [4.0, 2.6, 2.0, 2.4], dur);
  const top = 1 - ease(t, b[1] - 0.2, 0.4);
  const fix = b[2];
  return {
    tag: ease(t, -0.2, 0.4),
    file: ease(t, b[0] - 0.1, 0.4) * top,
    stripA: ease(t, b[0] + 0.2, 0.6),
    stripB: ease(t, b[0] + 0.45, 0.6),
    spark: window01(t, b[0] + 1.0, b[1] + 5, 0.2),
    fail: { scale: popScale(t, b[0] + 1.3), opacity: clamp01((t - (b[0] + 1.3)) / 0.12) * top },
    pairs: Array.from({ length: PAIRS }, (_, i) => ({
      pop: ease(t, b[0] + 1.7 + i * 0.035, 0.25),
      heal: HEALS(i) ? ease(t, fix + 0.6 + i * 0.03, 0.3) : 0,
      pass: i === PASS ? ease(t, fix + 1.35, 0.3) : 0,
    })),
    pairsLabel: ease(t, b[0] + 1.8, 0.35),
    top,
    gauge: {
      opacity: ease(t, b[1] - 0.1, 0.4),
      value: lerp(lerp(0.45, BEFORE, ease(t, b[1] + 0.2, 0.7)), AFTER, ease(t, fix + 1.0, 0.6)),
      lift: window01(t, fix - 0.05, fix + 1.3, 0.3),
      magnetOut: ease(t, fix + 0.35, 0.5),
      expected: ease(t, b[1], 0.4),
      after: t >= fix + 1.1 ? 1 : 0,
    },
    bug: ease(t, fix + 0.25, 0.35),
    half: ease(t, fix + 0.9, 0.35),
    rows: [ease(t, fix + 1.2, 0.35), ease(t, fix + 1.45, 0.35)],
    plus: ease(t, fix + 1.7, 0.3),
    held: { scale: popScale(t, b[3] + 0.6), opacity: clamp01((t - (b[3] + 0.6)) / 0.12) },
  };
}
