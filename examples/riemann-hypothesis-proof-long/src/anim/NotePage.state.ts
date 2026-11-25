// NotePage: the four-page note on the desk (rows 2-3). Pure numbers and strings (no Remotion or
// React), checked by test/NotePage.test.ts.
//
// note:     line 1 name card ("20 November", then "Levent Alpöge"), line 2 the "Anthropic · makes
//           Claude" tag, line 3 the quoted sentence set on the top page, lit phrase by phrase.
// footnote: line 1 the page body empties ("the proof isn't here") and the camera moves to the
//           footnote, line 2 the footnote glows and unspools into 14 links ("Lean"), line 3 a row
//           of maths steps ticked one by one ("a computer checks every step").
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type NotePageProps = { mode: 'note' | 'footnote' };

/** The sentence as the note writes it, broken into the lines set on the page. */
export const QUOTE_LINES = ['“I believe I have,', 'working with Claude,', 'discovered a proof', 'of the Riemann', 'Hypothesis.”'];
/** Which spoken phrase each quote line belongs to (lit together). */
export const PHRASE_OF_LINE = [0, 1, 2, 3, 3];
/** Seconds after line 3 starts at which each phrase is spoken (TTS word times). */
const PHRASE_AT = [1.2, 2.6, 4.05, 5.2];

export const LINKS = 14;
/** Maths steps the "spell-checker" ticks, one per step. */
export const STEPS = ['x = 3', '2x = 6', '2x + 1 = 7'];

/** Camera: the frame point (fx, fy) drawn at (960, ty), scaled by z. */
export type Camera = { z: number; fx: number; fy: number; ty: number };
export const CAM_START: Camera = { z: 1, fx: 960, fy: 540, ty: 540 };
export const CAM_NOTE_END: Camera = { z: 1.08, fx: 1030, fy: 470, ty: 540 };
export const CAM_FOOTNOTE: Camera = { z: 2, fx: 935, fy: 940, ty: 340 };

const mix = (a: number, b: number, k: number): number => a + (b - a) * clamp01(k);
const mixCam = (a: Camera, b: Camera, k: number): Camera => ({ z: mix(a.z, b.z, k), fx: mix(a.fx, b.fx, k), fy: mix(a.fy, b.fy, k), ty: mix(a.ty, b.ty, k) });
const easeInOut = (p: number): number => {
  const x = clamp01(p);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};

/** Real scene seconds clamped to [0, dur], for slow ambient moves that must not jump. */
const clock = (time: number, dur: number): number => {
  const t = Number.isFinite(time) ? Math.max(0, time) : 0;
  return Number.isFinite(dur) && dur > 0 ? Math.min(t, dur) : t;
};

export function frameState(p: NotePageProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const T = clock(time, dur);
  const b0 = beatAt(beats, 0);
  const b1 = Math.max(b0, beats.length > 1 ? beatAt(beats, 1) : b0 + 3);
  const b2 = Math.max(b1, beats.length > 2 ? beatAt(beats, 2) : b1 + 3);
  const at = (s: number, len: number) => easeOutCubic(progress(t, fit(s, len, d), len));

  if (p.mode === 'footnote') {
    const move = easeInOut(progress(t, fit(b0 + 1.0, 1.5, d), 1.5));
    const cam = mixCam(CAM_NOTE_END, CAM_FOOTNOTE, move);
    const lower = at(b2, 0.6);
    return {
      cam,
      /** The quote carried over from the note scene, fading as the body empties. */
      quote: 1 - at(b0, 0.5),
      empty: at(b0 + 0.3, 0.4) * (1 - at(b2, 0.4)),
      foot: at(b1 + 0.15, 0.5),
      unspool: clamp01(progress(t, fit(b1 + 0.5, 1.6, d), 1.6)),
      lean: at(b1 + 1.6, 0.45),
      /** Links row and its label rise to the top to make room for the checker (line 3). */
      rise: lower,
      scrim: lower,
      maths: at(b2 + 0.15, 0.5),
      checkLabel: at(b2 + 1.0, 0.45),
      ticks: STEPS.map((_, i) => at(b2 + 1.6 + i * 0.5, 0.35)),
      allGood: at(b2 + 3.6, 0.5),
      // Note-mode keys kept at their end state so the two scenes blend.
      card: 1,
      name: 1,
      tag: 1,
      quoteIn: 1,
      hl: PHRASE_AT.map(() => 1),
      breathe: Math.sin(T * 1.3),
    };
  }

  const push = easeInOut(T / d);
  return {
    cam: mixCam(CAM_START, CAM_NOTE_END, push),
    quote: 1,
    empty: 0,
    foot: 0,
    unspool: 0,
    lean: 0,
    rise: 0,
    scrim: 0,
    maths: 0,
    checkLabel: 0,
    ticks: STEPS.map(() => 0),
    allGood: 0,
    card: at(b0 + 0.3, 0.5),
    name: at(b0 + Math.min(2.7, Math.max(0.4, (b1 - b0) * 0.6)), 0.45),
    tag: at(b1 + 0.45, 0.45),
    quoteIn: at(b2, 0.5),
    hl: PHRASE_AT.map((s) => at(b2 + s, 0.45)),
    breathe: Math.sin(T * 1.3),
  };
}
