// TwoProofs: the two proofs side by side. Left the file stack (checked completely, understood by
// nobody), right the second mathematician and his manuscript (written to be understood, checked
// by nobody). The halves slide together into one sheet ("until this year: checking =
// understanding") and apart again; then the prize medal behind glass with three empty boxes.
// Pure numbers and strings (no Remotion or React), so `node --test` can check it.
import { beatAt, clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type TwoProofsProps = { mode: 'split' };

export const LEFT = [
  { mark: '✓', text: 'checked completely' },
  { mark: '✗', text: 'understood by nobody' },
] as const;
export const RIGHT = [
  { mark: '✓', text: 'written to be understood' },
  { mark: '✗', text: 'checked by nobody' },
] as const;
export const SHEET = { top: 'until this year:', main: 'checking = understanding' } as const;
export const PRIZE = ['published', 'two-year wait', 'accepted by mathematicians'] as const;
export const NOT_YET = 'Prize: not yet';

const LINES = 7;

const smooth = (p: number): number => {
  const x = clamp01(p);
  return x * x * (3 - 2 * x);
};

const ordered = (beats: number[], n: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(Math.max(i ? out[i - 1] : 0, beatAt(beats, i)));
  return out;
};

/**
 * Moments from the beats plus word offsets (TTS word timings, 2026-11-23): "checked completely"
 * +1.0, "understood by nobody" +2.44, "written to be understood" +0.76, "checked by nobody"
 * +2.44, "came together" +1.6, "check" +0.84, "understand it" +2.2, "million dollars" +0.44,
 * "Not yet" +1.46, "publication" +0.92, "two-year wait" +2.04, "mathematicians" +3.48.
 */
export const moments = (beats: number[]) => {
  const b = ordered(beats, LINES);
  return {
    b,
    left: [b[1] + 1.0, b[1] + 2.44],
    right: [b[2] + 0.76, b[2] + 2.44],
    together: b[3] + 1.2,
    sheet: b[3] + 1.9,
    equals: b[4] + 0.84,
    apart: Math.max(b[4] + 0.84, Math.min(b[4] + 2.6, b[5] - 0.75)),
    medal: b[5] + 0.3,
    notYet: b[5] + 1.46,
    boxes: b[6] + 0.1,
    prize: [b[6] + 0.92, b[6] + 2.04, b[6] + 3.48],
  };
};

export function frameState(_p: TwoProofsProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const T = Number.isFinite(time) ? Math.min(Math.max(0, time), 1e5) : 0;
  const m = moments(beats);
  const join = smooth(progress(t, m.together, 1.1));
  const part = smooth(progress(t, m.apart, 0.7));
  const medal = easeOutCubic(progress(t, m.medal, 0.6));
  return {
    T,
    /** The two halves sliding in from the sides on frame 0. */
    split: easeOutCubic(progress(t, 0, 0.9)),
    left: m.left.map((s) => easeOutCubic(progress(t, s, 0.4))),
    right: m.right.map((s) => easeOutCubic(progress(t, s, 0.4))),
    /** 0 apart, 1 together in one sheet. */
    together: clamp01(join - part),
    sheet: easeOutCubic(progress(t, m.sheet, 0.5)) * (1 - part),
    /** Pulse on the "=" when "check" is said, held while together. */
    equals: Math.sin(Math.PI * progress(t, m.equals, 0.6)),
    /** The split picture fades back as the prize takes the stage. */
    fade: medal,
    medal,
    notYet: easeOutCubic(progress(t, m.notYet, 0.4)),
    boxes: easeOutCubic(progress(t, m.boxes, 0.5)),
    prize: m.prize.map((s) => easeOutCubic(progress(t, s, 0.35))),
  };
}
