// Pure state of the clipboard form with fixed boxes (rows 36-44).
// - replace: the fixed boxes light up; the red slip slides into the SHELF 0 box; "pallet" is struck
//   and "empty" written in the same box; a step counter runs from 10 to 200 while the form keeps
//   its size and a ghost stack (the record it does not keep) grows beside it. Between "step" and
//   "thrown" the robot's pages go through a shredder beside the form, one per step.
//   Marks: [form, boxes, shelf, new, replaces, ten, hundred, step, thrown].
// - margin: the form has no box for the fact: "shelf 4: quarantine" is jotted next to the last
//   entry, the next entry wipes it ("0/24"); a box named after it appears ("quarantined") and a
//   grid of 24 runs fills with ticks ("24/24", "16/24" for a second model); a generic notes box,
//   half-filled ("10/24"), then dims while the named box glows. Marks: [jotted, wipes, named,
//   every, notes, say].
// - wrong: "full" is written in the box by mistake and gets a confident tick; the record behind
//   fades away; the real shelf 0 (empty) shows beside it; about 25 mistakes cascade from it; then
//   the day's record comes back beside the form, the mismatch flashes and the record is followed.
//   Marks: [misremembers, full, mistake, sure, cascade, record, follow].
// No Remotion or React here.
import { beatOr, bump, ease, lerp, mark, pickMode } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

export const FORM_MODES = ['replace', 'margin', 'wrong'] as const;
export type FormMode = (typeof FORM_MODES)[number];
export type ClipboardFormProps = { mode: FormMode; marks?: number[] };

/** The figures on screen, as the article gives them. */
export const ZERO_TEXT = '0/24';
export const FULL_TEXT = '24/24';
export const SECOND_TEXT = '16/24';
export const NOTES_TEXT = '10/24';
export const RUNS = 24;
/** The fact with no box, jotted next to the last entry. */
export const MARGIN_TEXT = 'shelf 4: quarantine';
/** The box named after it, and what it holds. */
export const NAMED_LABEL = 'QUARANTINED';
export const NAMED_VALUE = 'shelf 4';
/** Steps on the counter: the form is the same size at both. */
export const STEPS = { from: 10, to: 200 } as const;
/** Pages shredded while "everything else is thrown away" (one per step). */
export const SHREDS = 3;
/** Label of the ghost stack: the day's record the form does not keep. */
export const GHOST_LABEL = "day's record, not kept";
/** Mistakes that followed from the one wrong box. */
export const CASCADE = 25;

export type ClipboardFormState = {
  boxes: number;
  /** The SHELF 0 row (opacity). */
  shelfRow: number;
  rowLit: number;
  value: { text: string; next: string; strike: number; write: number };
  pen: { opacity: number; prog: number };
  slip: { opacity: number; fly: number };
  margin: { write: number; erase: number };
  eraser: number;
  /** The next entry being written into the last-event row. */
  scribble: number;
  zero: number;
  grid: { opacity: number; fill: number };
  /** Ticks shown in the grid of runs (whole number, 0..RUNS). */
  ticks: number;
  full: number;
  tick: number;
  pages: number;
  inset: number;
  /** The step counter (replace): shown, and the step on it (whole number). */
  counter: { opacity: number; step: number };
  /** The ghost stack beside the form (replace), 0..1 of its height. */
  ghost: number;
  /** The shredder (replace): shown, and how many pages have gone through (float, 0..SHREDS). */
  shred: { opacity: number; run: number };
  /** The box named after the fact (margin): shown, its value written, its glow. */
  named: { opacity: number; write: number; glow: number };
  second: number;
  /** The generic notes box (margin): shown, how full, dimmed. */
  notes: { opacity: number; fill: number; dim: number; label: number };
  /** Red marks cascading from the wrong box (wrong): whole number, 0..CASCADE. */
  cascade: number;
  record: number;
  mismatch: number;
  follow: number;
};

const base = (): ClipboardFormState => ({
  boxes: 1,
  shelfRow: 1,
  rowLit: 0,
  value: { text: 'empty', next: '', strike: 0, write: 1 },
  pen: { opacity: 0, prog: 0 },
  slip: { opacity: 0, fly: 0 },
  margin: { write: 0, erase: 0 },
  eraser: 0,
  scribble: 1,
  zero: 0,
  grid: { opacity: 0, fill: 0 },
  ticks: 0,
  full: 0,
  tick: 0,
  pages: 0,
  inset: 0,
  counter: { opacity: 0, step: STEPS.from },
  ghost: 0,
  shred: { opacity: 0, run: 0 },
  named: { opacity: 0, write: 0, glow: 0 },
  second: 0,
  notes: { opacity: 0, fill: 0, dim: 0, label: 0 },
  cascade: 0,
  record: 0,
  mismatch: 0,
  follow: 0,
});

export function frameState(props: ClipboardFormProps, t: number, beats: number[], dur: number): ClipboardFormState {
  const mode = pickMode(props.mode, FORM_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 3.4);
  const s = base();

  if (mode === 'replace') {
    const boxes = mark(m, 1, b0 + 1.5);
    const shelf = mark(m, 2, b0 + 2.8);
    const fresh = mark(m, 3, b1 + 0.3);
    const replaces = Math.max(mark(m, 4, b1 + 1.4), fresh + 0.7);
    const b2 = beatOr(beats, 2, replaces + 1.5);
    const ten = Math.max(replaces + 0.9, mark(m, 5, b2 + 2.0));
    const hundred = Math.max(ten + 0.8, mark(m, 6, ten + 1.6));
    const write = progress(T, replaces, 0.7);
    const run = progress(T, ten, hundred - ten + 0.4);
    const each = mark(m, 7, b0 + 6.0);
    const thrown = Math.max(each + 1.2, mark(m, 8, b0 + 9.0));
    const shredEnd = Math.min(thrown + 1.0, fresh - 0.9);
    const shredRun = SHREDS * progress(T, each, Math.max(0.9, shredEnd - each));
    return {
      ...s,
      boxes: 0.35 + 0.65 * ease(T, boxes - 0.1, 0.4),
      rowLit: ease(T, shelf, 0.4),
      value: { text: 'pallet', next: 'empty', strike: ease(T, fresh + 0.3, 0.4), write },
      pen: { opacity: ease(T, fresh, 0.2) * (1 - ease(T, replaces + 0.8, 0.3)), prog: write },
      slip: { opacity: ease(T, fresh - 0.3, 0.3) * (1 - ease(T, replaces + 0.2, 0.4)), fly: ease(T, fresh - 0.2, 0.7) },
      counter: { opacity: ease(T, ten - 0.5, 0.4), step: Math.round(lerp(STEPS.from, STEPS.to, run)) },
      ghost: run,
      shred: { opacity: ease(T, each - 0.4, 0.4) * (1 - ease(T, Math.max(each + 0.9, shredEnd) + 0.2, 0.4)), run: shredRun },
    };
  }

  if (mode === 'margin') {
    const jotted = mark(m, 0, b0 + 2.4);
    const wipes = Math.max(mark(m, 1, b0 + 3.6), jotted + 0.4);
    const named = Math.max(wipes + 0.5, mark(m, 2, b1 + 2.4));
    const every = Math.max(named + 0.6, mark(m, 3, b1 + 4.0));
    const b2 = beatOr(beats, 2, every + 2.0);
    const notes = Math.max(named + 0.8, mark(m, 4, b2 + 1.2));
    const say = Math.max(notes + 0.6, mark(m, 5, b2 + 3.0));
    const fillAt = named + 0.6;
    // Fill fast and never wait past the named beat: with estimated marks the 'every' mark can
    // fall late, and 24/24 must be on screen.
    const fillLen = Math.max(0.6, Math.min(1.2, every - fillAt));
    const fill = progress(T, fillAt, fillLen);
    return {
      ...s,
      margin: { write: progress(T, jotted - 0.6, 0.8), erase: ease(T, wipes, 0.6) },
      eraser: bump(T, wipes - 0.2, 1.0),
      scribble: progress(T, wipes - 0.6, 0.6),
      zero: ease(T, wipes + 0.5, 0.35),
      grid: { opacity: ease(T, named + 0.4, 0.4), fill },
      ticks: Math.floor(RUNS * fill + 1e-9),
      full: ease(T, fillAt + fillLen, 0.35),
      named: { opacity: ease(T, named - 0.2, 0.5), write: progress(T, named + 0.1, 0.6), glow: ease(T, say - 0.2, 0.5) },
      second: ease(T, every + 0.3, 0.4),
      notes: { opacity: ease(T, notes - 0.2, 0.4), fill: ease(T, notes + 0.2, 0.6) * 0.5, dim: ease(T, say - 0.2, 0.5), label: ease(T, notes + 0.6, 0.4) },
    };
  }

  // wrong
  const misremembers = mark(m, 0, b0 + 1.6);
  const full = mark(m, 1, b1 + 1.8);
  const mistake = mark(m, 2, b1 + 1.0);
  const sure = Math.max(mark(m, 3, full + 0.8), full + 0.5);
  const cascadeAt = Math.max(sure + 0.4, mark(m, 4, b1 + 5.0));
  const b2 = beatOr(beats, 2, cascadeAt + 2.5);
  const recordAt = Math.max(cascadeAt + 1.0, mark(m, 5, b2 + 4.0));
  const followAt = Math.max(recordAt + 0.8, mark(m, 6, b2 + 8.0));
  const write = progress(T, full, 0.5);
  return {
    ...s,
    value: { text: 'empty', next: 'full', strike: ease(T, full - 0.2, 0.3), write },
    pen: { opacity: ease(T, full - 0.3, 0.2) * (1 - ease(T, full + 0.8, 0.3)), prog: write },
    tick: ease(T, sure, 0.35),
    pages: Math.max(1 - ease(T, misremembers, 1.5), ease(T, recordAt - 0.2, 0.6)),
    inset: ease(T, mistake - 0.2, 0.4),
    cascade: Math.floor(CASCADE * progress(T, cascadeAt, 1.6) + 1e-9),
    record: ease(T, recordAt - 0.2, 0.6),
    mismatch: bump(T, recordAt + 0.5, 1.0),
    follow: ease(T, followAt, 0.4),
  };
}
