// Checklist: how the community attacked the checking. A chalk checklist with seven rows next to
// the checker robot and the stack of files: five rows tick green on their lines, "about a day" is
// stamped across them, the last two stay amber ("not yet"), and a two-word contrast closes it.
// Pure numbers and strings (no Remotion or React), so `node --test` can check it.
import { beatAt, clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type ChecklistProps = { mode: 'checks' };

export const ROWS = [
  'Compiles',
  'Right statement',
  'No hidden assumptions',
  'Second checker agrees',
  'Rebuilt by others',
  'Readable proof',
  'Understood why',
] as const;

/** Small chalk notes beside the five green rows (one or two lines each). */
export const NOTES: readonly (readonly string[])[] = [
  ['every file'],
  ['written by others,', 'before the proof'],
  ["only Lean's 3 basic rules"],
  ['written independently'],
  ['same result'],
];
export const NOT_YET = 'not yet';
export const STAMP = 'about a day';

const LINES = 11;

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
 * Moments of the scene, from the beats plus word offsets inside each line (TTS word timings,
 * 2026-11-23): "compile?" +0.95, "Every file" +1.44, "Lean community" +2.2, "easier" +1.7,
 * "No," +2.03, "only the three" +2.66, "A second checker" +1.77, "written" +2.9, "accepts" +4.18,
 * "rebuilt" +0.44, "same result" +1.6, "about a day" +3.24, "a proof a person" +1.64,
 * "mathematicians" +3.88, "follows" +1.4, "why" +0.68.
 */
export const moments = (beats: number[]) => {
  const b = ordered(beats, LINES);
  return {
    b,
    draw: ROWS.map((_, i) => b[0] + 0.5 + i * 0.32),
    tick: [b[1] + 0.95, b[3] + 0.4, b[5] + 2.03, b[6] + 4.18, b[7] + 0.44],
    note: [b[1] + 1.44, b[3] + 2.2, b[5] + 2.66, b[6] + 2.9, b[7] + 1.6],
    circle: b[4] + 1.7,
    second: b[6] + 1.77,
    stamp: b[7] + 3.24,
    amber: [b[8] + 1.64, b[8] + 3.88],
    follows: b[9] + 1.4,
    why: b[10] + 0.2,
    /** Where the focus band moves: [scene second, row]. */
    focus: [
      [b[1], 0],
      [b[2], 1],
      [b[5], 2],
      [b[6], 3],
      [b[7], 4],
      [b[8] + 1.4, 5],
      [b[8] + 3.6, 6],
    ] as [number, number][],
  };
};

export function frameState(_p: ChecklistProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const T = Number.isFinite(time) ? Math.min(Math.max(0, time), 1e5) : 0;
  const m = moments(beats);
  const tick = m.tick.map((s) => progress(t, s, 0.45));
  let focusRow = m.focus[0][1];
  for (let i = 1; i < m.focus.length; i++) focusRow += (m.focus[i][1] - m.focus[i - 1][1]) * smooth(progress(t, m.focus[i][0], 0.4));
  const hop = Math.max(0, ...m.tick.map((s) => Math.sin(Math.PI * progress(t, s, 0.5))));
  return {
    T,
    /** Board and rows drawing in, one after another. */
    board: easeOutCubic(progress(t, m.b[0], 0.6)),
    draw: m.draw.map((s) => progress(t, s, 0.55)),
    tick,
    note: m.note.map((s) => easeOutCubic(progress(t, s, 0.4))),
    /** Chalk circle drawn round the "written before" note on "easier". */
    circle: progress(t, m.circle, 0.7),
    /** The ring is wiped once the next question starts. */
    ring: 1 - progress(t, m.b[5], 0.5),
    /** The second, independent checker robot. */
    second: easeOutCubic(progress(t, m.second, 0.5)),
    stamp: easeOutCubic(progress(t, m.stamp, 0.35)),
    amber: m.amber.map((s) => easeOutCubic(progress(t, s, 0.4))),
    follows: easeOutCubic(progress(t, m.follows, 0.4)),
    /** "why ?" waits dimly next to "follows", then lights on its own line. */
    whyDim: easeOutCubic(progress(t, m.follows + 0.3, 0.4)),
    why: easeOutCubic(progress(t, m.why, 0.35)),
    focusRow,
    focusOn: progress(t, m.b[1] - 0.1, 0.3) * (1 - progress(t, m.follows - 0.4, 0.5)),
    /** Share of the five machine rows already ticked: tints the file stack. */
    checked: tick.reduce((a, v) => a + v, 0) / 5,
    hop,
  };
}
