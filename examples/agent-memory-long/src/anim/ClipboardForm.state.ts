// Pure state of the clipboard form with fixed boxes (rows 28-34).
// - replace (rows 28-29): the boxes FLIGHT / HOTEL / DESTINATION light up and fill in as it goes;
//   the red slip slides into the FLIGHT box, "Thursday" is struck and "Friday" written in the same
//   box; then morning light: the next day, the form unchanged.
//   Marks: [form, boxes, apart, correct, Friday, tomorrow].
// - margin (rows 30-32): the form has no box for the fact: "allergic to feathers" is scribbled in
//   the margin next to the last entry, the next entry wipes it; "0/24"; a box named after it
//   appears (ALLERGIES: feathers) and a grid of 24 runs fills with ticks ("24/24", "16/24" for a
//   second model); a generic NOTES box, half-filled, then dims while the named box glows.
//   Marks: [scribbled, wipes, named, every, notes, say, never].
// - wrong (row 33): the FLIGHT box says Friday; the hotel is booked right (Friday night, tick); then
//   the pen writes "Thursday" back into the box, ticked as confidently, and a cascade of red marks
//   follows. Marks: [misremembers, right, wrong, everything].
// - panel (row 34): beside the clipboard, the app's "Memory" panel, a list of notes kept outside
//   the chat; "flight is Friday" is on it, "allergic to feathers" is not (dashed, crossed).
//   Marks: [list, tomorrow, written].
// No Remotion or React here.
import { beatOr, bump, ease, mark, pickMode } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

export const FORM_MODES = ['replace', 'margin', 'wrong', 'panel'] as const;
export type FormMode = (typeof FORM_MODES)[number];
export type ClipboardFormProps = { mode: FormMode; marks?: number[] };

/** The figures on screen, as the article gives them. */
export const ZERO_TEXT = '0/24';
export const FULL_TEXT = '24/24';
export const SECOND_TEXT = '16/24';
export const RUNS = 24;
/** The form's fixed boxes, and the row the next entry goes in. */
export const BOXES = ['FLIGHT', 'HOTEL', 'DESTINATION'] as const;
export const LAST_ROW = 'LAST ENTRY';
/** The fact with no box, scribbled in the margin. */
export const MARGIN_TEXT = 'allergic to feathers';
/** The box named after it, and what it holds. */
export const NAMED_LABEL = 'ALLERGIES';
export const NAMED_VALUE = 'feathers';
/** The generic box. */
export const NOTES_LABEL = 'NOTES';
/** The right action (wrong): the hotel booked for the right night. */
export const RIGHT_BOOKING = 'Booked your hotel for Friday night';
/** Mistakes that followed from the one wrong box. */
export const CASCADE = 25;
/** The app's Memory panel (panel): what is on it, and the fact that never got written down. */
export const PANEL_NOTES = ['prefers a window seat', 'flight is Friday'] as const;
export const NOT_SAVED = 'allergic to feathers';

export type ClipboardFormState = {
  boxes: number;
  /** The FLIGHT row lit. */
  rowLit: number;
  /** The FLIGHT value: shown text, the text being written over it, strike and write progress. */
  value: { text: string; next: string; strike: number; write: number };
  pen: { opacity: number; prog: number };
  slip: { opacity: number; fly: number };
  /** HOTEL / DESTINATION / LAST ENTRY filled in (scribbles), 0..1. */
  filled: number;
  margin: { write: number; erase: number };
  eraser: number;
  /** The next entry being written into the last row. */
  scribble: number;
  zero: number;
  grid: { opacity: number; fill: number };
  /** Ticks shown in the grid of runs (whole number, 0..RUNS). */
  ticks: number;
  full: number;
  tick: number;
  /** The box named after the fact (margin): shown, its value written, its glow. */
  named: { opacity: number; write: number; glow: number };
  second: number;
  /** The generic notes box (margin): shown, how full, dimmed. */
  notes: { opacity: number; fill: number; dim: number };
  /** The next morning (replace): the light, and the label. */
  morning: number;
  /** The right booking (wrong): shown, its tick. */
  booking: { opacity: number; tick: number };
  /** Red marks cascading from the wrong box (wrong): whole number, 0..CASCADE. */
  cascade: number;
  /** The Memory panel (panel): shown, its glow, the saved note lit, the missing note (dashed, crossed). */
  panel: { opacity: number; glow: number; lit: number; missing: number; cross: number };
  /** The form dimmed behind the panel. */
  dim: number;
};

const base = (): ClipboardFormState => ({
  boxes: 1,
  rowLit: 0,
  value: { text: 'Friday', next: '', strike: 0, write: 1 },
  pen: { opacity: 0, prog: 0 },
  slip: { opacity: 0, fly: 0 },
  filled: 1,
  margin: { write: 0, erase: 0 },
  eraser: 0,
  scribble: 1,
  zero: 0,
  grid: { opacity: 0, fill: 0 },
  ticks: 0,
  full: 0,
  tick: 0,
  named: { opacity: 0, write: 0, glow: 0 },
  second: 0,
  notes: { opacity: 0, fill: 0, dim: 0 },
  morning: 0,
  booking: { opacity: 0, tick: 0 },
  cascade: 0,
  panel: { opacity: 0, glow: 0, lit: 0, missing: 0, cross: 0 },
  dim: 0,
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
    const apart = Math.max(boxes + 0.3, mark(m, 2, b0 + 2.8));
    const correct = mark(m, 3, b1 + 0.3);
    const friday = Math.max(mark(m, 4, b1 + 1.4), correct + 0.7);
    const tomorrow = Math.max(friday + 0.8, mark(m, 5, b1 + 5));
    const write = progress(T, friday, 0.7);
    return {
      ...s,
      boxes: 0.35 + 0.65 * ease(T, boxes - 0.1, 0.4),
      rowLit: ease(T, correct - 0.2, 0.4),
      filled: progress(T, apart, 1.4),
      value: { text: 'Thursday', next: 'Friday', strike: ease(T, correct + 0.3, 0.4), write },
      pen: { opacity: ease(T, friday - 0.1, 0.2) * (1 - ease(T, friday + 0.8, 0.3)), prog: write },
      slip: { opacity: ease(T, correct - 0.3, 0.3) * (1 - ease(T, friday + 0.2, 0.4)), fly: ease(T, correct - 0.2, 0.7) },
      morning: ease(T, tomorrow - 0.2, 0.8),
      tick: ease(T, tomorrow + 0.6, 0.35),
    };
  }

  if (mode === 'margin') {
    const jotted = mark(m, 0, b0 + 2.4);
    const wipes = Math.max(mark(m, 1, b0 + 3.6), jotted + 0.4);
    const never = Math.max(wipes + 0.4, mark(m, 6, b1 + 1.6));
    const named = Math.max(never + 0.5, mark(m, 2, b1 + 2.4));
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
      zero: ease(T, never - 0.1, 0.35),
      grid: { opacity: ease(T, named + 0.4, 0.4), fill },
      ticks: Math.floor(RUNS * fill + 1e-9),
      full: ease(T, fillAt + fillLen, 0.35),
      named: { opacity: ease(T, named - 0.2, 0.5), write: progress(T, named + 0.1, 0.6), glow: ease(T, say - 0.2, 0.5) },
      second: ease(T, every + 0.3, 0.4),
      notes: { opacity: ease(T, notes - 0.2, 0.4), fill: ease(T, notes + 0.2, 0.6) * 0.5, dim: ease(T, say - 0.2, 0.5) },
    };
  }

  if (mode === 'wrong') {
    const right = mark(m, 1, b0 + 4.4);
    const wrong = Math.max(right + 0.6, mark(m, 2, b0 + 6.2));
    const cascadeAt = Math.max(wrong + 0.8, mark(m, 3, b0 + 7.6));
    const write = progress(T, wrong, 0.6);
    return {
      ...s,
      rowLit: ease(T, wrong - 0.3, 0.3),
      value: { text: 'Friday', next: 'Thursday', strike: ease(T, wrong - 0.2, 0.3), write },
      pen: { opacity: ease(T, wrong - 0.3, 0.2) * (1 - ease(T, wrong + 0.9, 0.3)), prog: write },
      tick: ease(T, wrong + 0.7, 0.35),
      booking: { opacity: ease(T, right - 0.3, 0.4), tick: ease(T, right + 0.3, 0.35) },
      cascade: Math.floor(CASCADE * progress(T, cascadeAt, 1.6) + 1e-9),
    };
  }

  // panel
  const list = mark(m, 0, b0 + 3.6);
  const tomorrow = Math.max(list + 0.6, mark(m, 1, b0 + 7.2));
  const written = Math.max(tomorrow + 0.6, mark(m, 2, b0 + 9.6));
  return {
    ...s,
    dim: ease(T, b0, 0.6),
    panel: {
      opacity: ease(T, b0 + 0.2, 0.5),
      glow: Math.max(bump(T, list - 0.1, 1.0), bump(T, tomorrow - 0.1, 1.0)),
      lit: ease(T, list + 0.4, 0.4),
      missing: ease(T, written - 0.3, 0.4),
      cross: ease(T, written + 0.3, 0.35),
    },
  };
}
