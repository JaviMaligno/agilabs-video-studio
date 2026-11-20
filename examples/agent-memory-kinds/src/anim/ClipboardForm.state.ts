// Pure state of the clipboard form with fixed boxes (scenes 10-12).
// - replace: the fixed boxes light up; the red slip slides into the SHELF 0 box; "pallet" is struck
//   and "empty" written in the same box. Marks: [form, boxes, shelf, new, replaces].
// - margin: a form with no box for the fact; it is scribbled in the margin, the next entry is
//   written and the margin note is erased ("0/24"); a SHELF 0 box appears, holds the fact, and a
//   grid of 24 runs fills with ticks ("24/24"). Marks: [margin, erased, box, 24].
// - wrong: "full" is written in the box by mistake and gets a confident tick; the pages behind fade
//   away; the real shelf 0 (empty) shows beside it. Marks: [misremembers, full, mistake, sure].
// No Remotion or React here.
import { beatOr, bump, ease, mark, pickMode } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

export const FORM_MODES = ['replace', 'margin', 'wrong'] as const;
export type FormMode = (typeof FORM_MODES)[number];
export type ClipboardFormProps = { mode: FormMode; marks?: number[] };

/** The two figures on screen, as the article gives them. */
export const ZERO_TEXT = '0/24';
export const FULL_TEXT = '24/24';
export const RUNS = 24;
/** The fact as scribbled in the margin. */
export const MARGIN_TEXT = 'shelf 0: empty';

export type ClipboardFormState = {
  boxes: number;
  /** The SHELF 0 row (opacity): fades out for the form without it, comes back as the new box. */
  shelfRow: number;
  rowLit: number;
  value: { text: string; next: string; strike: number; write: number };
  pen: { opacity: number; prog: number };
  slip: { opacity: number; fly: number };
  margin: { write: number; erase: number };
  eraser: number;
  /** The next entry being written into another row. */
  scribble: number;
  zero: number;
  grid: { opacity: number; fill: number };
  /** Ticks shown in the grid of runs (whole number, 0..RUNS). */
  ticks: number;
  full: number;
  tick: number;
  pages: number;
  inset: number;
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
  scribble: 0,
  zero: 0,
  grid: { opacity: 0, fill: 0 },
  ticks: 0,
  full: 0,
  tick: 0,
  pages: 0,
  inset: 0,
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
    const write = progress(T, replaces, 0.7);
    return {
      ...s,
      boxes: 0.35 + 0.65 * ease(T, boxes - 0.1, 0.4),
      rowLit: ease(T, shelf, 0.4),
      value: { text: 'pallet', next: 'empty', strike: ease(T, fresh + 0.3, 0.4), write },
      pen: { opacity: ease(T, fresh, 0.2) * (1 - ease(T, replaces + 0.8, 0.3)), prog: write },
      slip: { opacity: ease(T, fresh - 0.3, 0.3) * (1 - ease(T, replaces + 0.2, 0.4)), fly: ease(T, fresh - 0.2, 0.7) },
    };
  }

  if (mode === 'margin') {
    const margin = mark(m, 0, b0 + 2.4);
    const erased = Math.max(mark(m, 1, b0 + 3.6), margin + 0.4);
    const box = mark(m, 2, b1 + 0.7);
    const runs = mark(m, 3, b1 + 2.8);
    const fillAt = box + 0.6;
    // Fill fast and never wait past the box beat: with estimated marks (no word timestamps) the
    // '24' mark can fall after the scene ends, and 24/24 must be on screen.
    const fillLen = Math.max(0.6, Math.min(1.2, runs - fillAt));
    const fill = progress(T, fillAt, fillLen);
    const gone = 1 - ease(T, 0, 0.5);
    const back = ease(T, box - 0.1, 0.5);
    return {
      ...s,
      shelfRow: Math.max(gone, back),
      rowLit: ease(T, box, 0.4),
      value: { text: 'empty', next: '', strike: 0, write: back > 0 ? progress(T, box + 0.1, 0.6) : 1 },
      margin: { write: progress(T, margin - 0.6, 0.8), erase: ease(T, erased, 0.6) },
      eraser: bump(T, erased - 0.2, 1.0),
      scribble: progress(T, erased - 0.6, 0.6),
      zero: ease(T, erased + 0.5, 0.35) * (1 - ease(T, box, 0.4)),
      grid: { opacity: ease(T, box + 0.4, 0.4), fill },
      ticks: Math.floor(RUNS * fill + 1e-9),
      full: ease(T, fillAt + fillLen, 0.35),
    };
  }

  // wrong
  const misremembers = mark(m, 0, b0 + 1.6);
  const full = mark(m, 1, b0 + 3.4);
  const mistake = mark(m, 2, b0 + 4.0);
  const sure = Math.max(mark(m, 3, b0 + 5.4), full + 0.5);
  const write = progress(T, full, 0.5);
  return {
    ...s,
    value: { text: 'empty', next: 'full', strike: ease(T, full - 0.2, 0.3), write },
    pen: { opacity: ease(T, full - 0.3, 0.2) * (1 - ease(T, full + 0.8, 0.3)), prog: write },
    tick: ease(T, sure, 0.35),
    pages: 1 - ease(T, misremembers, 1.5),
    inset: ease(T, mistake - 0.2, 0.4),
  };
}
