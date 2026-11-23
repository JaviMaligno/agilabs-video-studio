// ClaimPile: the pile of announced proofs (rows 11-15). Pure numbers and strings (no Remotion or
// React), checked by test/ClaimPile.test.ts.
//
// history (8 lines): 1 a pile of dated papers drops in; 2-3 the 1885 letter comes forward with an
//   empty "proof?" box, more papers keep landing; 4-6 the 2018 lecture stage, the author's cameo in
//   the audience, a clock that never got an afternoon; 7-8 back to the pile, which dims: "not worth
//   stopping to check".
// runit (3 lines): the dimmed pile slides aside and a stack of files slides in; 1 "nothing to
//   believe"; 2 the checker walks to the stack, which carries a "statement written by others" card;
//   3 "who has the time?" is crossed out and "run it." pops.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type ClaimPileProps = { mode: 'history' | 'runit' };

/** Papers in the pile, in landing order: the first wave (line 1), the second (line 3), the last two (line 7). */
export const FIRST_WAVE = 22;
export const SECOND_WAVE = 14;
export const LAST_WAVE = 2;
export const SHEETS = FIRST_WAVE + SECOND_WAVE + LAST_WAVE;

const YEARS = [1902, 1945, 1989, 2004, 1913, 1957, 1971, 1994, 2008, 1928, 1966, 2000, 2011, 1950, 1979, 1997, 2015, 1936, 1983, 2006, 2013, 1961];
/** Year stamped on sheet k; the last two are the 1885 letter's and Heidelberg's, landing on top. */
export const sheetYear = (k: number): number => (k === SHEETS - 2 ? 1885 : k === SHEETS - 1 ? 2018 : YEARS[k % YEARS.length] + (k >= YEARS.length ? 1 : 0));

/** File stack beside the pile in runit, same tiles as FileStack. */
export const STACK_COLS = 10;
export const STACK_ROWS = 13;

const easeInOut = (p: number): number => {
  const x = clamp01(p);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};

/** Landing progress of each sheet: wave w drops its sheets one after another from `start` over `span`. */
const wave = (t: number, start: number, span: number, n: number, d: number): number[] =>
  Array.from({ length: n }, (_, i) => easeOutCubic(progress(t, fit(start + (n > 1 ? (i / (n - 1)) * span : 0), 0.55, d), 0.55)));

export function frameState(p: ClaimPileProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const T = Number.isFinite(time) ? Math.max(0, Math.min(time, d)) : 0;
  const b = (i: number, fallback: number) => (beats.length > i ? Math.max(beatAt(beats, i), 0) : fallback);
  const at = (s: number, len: number) => easeOutCubic(progress(t, fit(s, len, d), len));

  if (p.mode === 'runit') {
    const b0 = b(0, 0);
    const b1 = Math.max(b0, b(1, b0 + 3));
    const b2 = Math.max(b1, b(2, b1 + 4));
    const aside = easeInOut(progress(t, fit(b0, 1.0, d), 1.0));
    return {
      T,
      sheets: Array.from({ length: SHEETS }, () => 1),
      /** Pile placement: 0 centred (history's end), 1 aside on the left. */
      aside,
      dim: 1,
      letter: 0,
      year1885: 0,
      proofBox: 0,
      blank: 0,
      stage: 0,
      year2018: 0,
      atiyah: 0,
      claim: 0,
      cameo: 0,
      clock: 0,
      clockLabel: 0,
      worth: 1 - at(b0, 0.5),
      stack: easeOutCubic(progress(t, fit(b0 + 0.2, 1.1, d), 1.1)),
      believe: at(b0 + 1.2, 0.45) * (1 - at(b2, 0.4)),
      walk: easeInOut(progress(t, fit(b1 + 0.1, 1.8, d), 1.8)),
      scan: clamp01(progress(t, fit(b1 + 1.8, 2.6, d), 2.6)),
      card: at(b1 + 2.9, 0.45),
      bubble1: at(b2 + 0.2, 0.4),
      strike: clamp01(progress(t, fit(b2 + 1.9, 0.35, d), 0.35)),
      bubble2: at(b2 + 2.2, 0.35),
    };
  }

  const b0 = b(0, 0);
  const b1 = Math.max(b0, b(1, b0 + 3.5));
  const b2 = Math.max(b1, b(2, b1 + 5.5));
  const b3 = Math.max(b2, b(3, b2 + 3.5));
  const b4 = Math.max(b3, b(4, b3 + 7));
  const b5 = Math.max(b4, b(5, b4 + 2.5));
  const b6 = Math.max(b5, b(6, b5 + 3.8));
  const b7 = Math.max(b6, b(7, b6 + 1.6));
  const len3 = Math.max(0.5, b4 - b3);
  const sheets = [
    ...wave(t, b0, 2.6, FIRST_WAVE, d),
    ...wave(t, b2 + 1.5, 1.8, SECOND_WAVE, d),
    ...wave(t, b6 + 0.5, 0.5, LAST_WAVE, d),
  ];
  const letter = at(b1, 0.6) * (1 - at(b6, 0.5));
  const stage = easeInOut(progress(t, fit(b3, 0.7, d), 0.7)) * (1 - easeInOut(progress(t, fit(b6, 0.6, d), 0.6)));
  return {
    T,
    sheets,
    // The pile steps aside for the letter (lines 2-3) and comes back centred (line 7).
    aside: easeInOut(progress(t, fit(b1, 0.7, d), 0.7)) * (1 - easeInOut(progress(t, fit(b6, 0.6, d), 0.6))),
    dim: easeInOut(progress(t, fit(b7 + 0.4, 2.2, d), 2.2)),
    letter,
    year1885: at(b1 + 0.35, 0.45) * (1 - at(b6, 0.5)),
    proofBox: at(b1 + Math.min(3.5, Math.max(0.5, (b2 - b1) * 0.65)), 0.45) * (1 - at(b6, 0.5)),
    /** The empty box pulses on "He never published a proof." */
    blank: Math.sin(Math.PI * clamp01(progress(t, fit(b2 + 0.4, 1.0, d), 1.0))),
    stage,
    year2018: at(b3 + 0.35, 0.45),
    atiyah: at(b3 + 1.7, 0.45),
    claim: at(b3 + Math.min(5.2, len3 * 0.72), 0.5),
    cameo: easeOutCubic(progress(t, fit(b4 + 0.05, 0.75, d), 0.75)),
    clock: at(b5 + 0.2, 0.45),
    clockLabel: at(b5 + 1.9, 0.45),
    worth: at(b7 + 3.0, 0.5),
    stack: 0,
    believe: 0,
    walk: 0,
    scan: 0,
    card: 0,
    bubble1: 0,
    strike: 0,
    bubble2: 0,
  };
}
