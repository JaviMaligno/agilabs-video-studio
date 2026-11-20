// Pure state of the clear sheet, LoRA (rows 31-32, 35-38). No Remotion or React.
// - lay: a transparent sheet lowers onto the open book (on "lay"); only once it has landed does the
//   pen come in, and it writes only on the sheet ("LoRA (the clear sheet)"); line 2: the robot reads through the sheet (its
//   answer changes), then the sheet lifts and the page underneath is unchanged.
//   Marks: [sheet, through, underneath].
// - more: line 1 a dial "learn more, forget more ↔ learn less, forget less"; line 2 a rack of
//   sheets "shop tone", "support", "invoices", one slides onto the book and is swapped, a graphics
//   card and two coffee cups; line 3 a generic "Fine-tune" web form with an upload box next to a
//   terminal; line 4 a research paper cover next to the book with its sheet.
//   Marks: [less, swap, coffees, upload, codes, research].
import { beatOr, bump, ease, fin, mark, pickMode } from './memory.ts';
import { fit, progress, sceneTime } from './steps.ts';

export const CS_MODES = ['lay', 'more'] as const;
export type ClearSheetMode = (typeof CS_MODES)[number];
export type ClearSheetProps = { mode?: string; marks?: number[] };

export const RACK = ['shop tone', 'support', 'invoices'] as const;

export type ClearSheetState = {
  mode: ClearSheetMode;
  label: { pop: number };
  /** lay: the sheet lowering (0 = above, 1 = on the book), its ink, its glow, lifting off. */
  sheet: { opacity: number; lower: number; ink: number; lit: number; lift: number };
  pen: { opacity: number; onSheet: number; write: number; bob: number };
  read: { opacity: number; answer: number };
  unchanged: { pop: number };
  /** more: the four panels' visibility. */
  panels: { dial: number; rack: number; form: number; paper: number };
  dial: { needle: number; right: number; left: number };
  /** Rack sheets: how far each one has moved onto the book (0 = on the rack, 1 = on the book). */
  rack: { on: number[]; gpu: number; cups: number };
  form: { upload: number; bar: number; terminal: number; typed: number };
  paper: { book: number; cover: number; forgets: number; learns: number };
};

const after = (x: number, min: number) => Math.max(x, min);
/** Length of the crossfade between two panels, in seconds. */
export const XF = 0.4;

export function frameState(props: ClearSheetProps, t: number, beats: number[], dur: number): ClearSheetState {
  const mode = pickMode(props?.mode, CS_MODES);
  const D = Number.isFinite(dur) && dur > 0 ? dur : 0;
  const T = sceneTime(Number.isFinite(t) ? t : 0, D);
  const tl = Math.min(Math.max(fin(t, 0), 0), D);
  const m = props?.marks;
  const b0 = beatOr(beats, 0, 0);
  const s: ClearSheetState = {
    mode,
    label: { pop: 0 },
    sheet: { opacity: 0, lower: 0, ink: 0, lit: 0, lift: 0 },
    pen: { opacity: 0, onSheet: 0, write: 0, bob: 0 },
    read: { opacity: 0, answer: 0 },
    unchanged: { pop: 0 },
    panels: { dial: 0, rack: 0, form: 0, paper: 0 },
    dial: { needle: 0.5, right: 0, left: 0 },
    rack: { on: RACK.map(() => 0), gpu: 0, cups: 0 },
    form: { upload: 0, bar: 0, terminal: 0, typed: 0 },
    paper: { book: 0, cover: 0, forgets: 0, learns: 0 },
  };

  if (mode === 'lay') {
    const b1 = after(beatOr(beats, 1, b0 + 8), b0 + 1);
    const sheet = fit(after(mark(m, 0, b0 + 5), b0 + 0.6), 0.9, D);
    const through = fit(after(mark(m, 1, b1 + 0.8), Math.max(b1, sheet + 1)), 0.6, D);
    const under = fit(after(mark(m, 2, through + 3), through + 0.8), 1, D);
    const writeFrom = sheet + 0.95;
    const writeLen = Math.max(0.6, Math.min(2.2, through - 0.3 - writeFrom));
    const write = progress(T, fit(writeFrom, writeLen, D), writeLen);
    // the name lands on "It's called LoRA", just after the line starts
    s.label = { pop: ease(T, fit(Math.min(b0 + 1.4, sheet - 0.2), 0.45, D), 0.45) };
    s.sheet = { opacity: ease(T, sheet - 0.3, 0.3), lower: ease(T, sheet - 0.2, 0.9), ink: write, lit: bump(T, through, 1.6), lift: ease(T, under, 1) };
    // the pen comes in only after the sheet has landed (cause before effect), and writes on the sheet
    s.pen = {
      opacity: ease(T, fit(sheet + 0.35, 0.4, D), 0.3) * (1 - ease(T, writeFrom + writeLen + 0.2, 0.4)),
      onSheet: ease(T, sheet + 0.4, 0.4),
      write,
      bob: (1 - ease(T, sheet + 0.4, 0.4)) * Math.sin(tl * 4),
    };
    s.read = { opacity: ease(T, through - 0.2, 0.4) * (1 - ease(T, under - 0.2, 0.4)), answer: ease(T, through + 0.4, 0.5) };
    s.unchanged = { pop: ease(T, under + 0.7, 0.45) };
    return s;
  }

  // more
  const b1 = after(beatOr(beats, 1, b0 + 9.5), b0 + 1);
  const b2 = after(beatOr(beats, 2, b1 + 11), b1 + 1);
  const b3 = after(beatOr(beats, 3, b2 + 7.5), b2 + 1);
  const less = fit(after(mark(m, 0, b0 + 1.8), b0), 0.8, D);
  const swap = fit(after(mark(m, 1, b1 + 3.6), b1 + 0.6), 0.8, D);
  const coffees = fit(after(mark(m, 2, swap + 5), swap + 1.6), 0.5, D);
  const upload = fit(after(mark(m, 3, b2 + 1.7), b2 + 0.4), 0.8, D);
  const codes = fit(after(mark(m, 4, b2 + 6.6), upload + 1), 1.6, D);
  const research = fit(after(mark(m, 5, b3 + 4.3), b3 + 0.6), 0.7, D);
  // crossfade on each line start: the outgoing panel holds until the next line begins (its last
  // word has been said), then leaves while the next one comes in, so the stage is never empty
  const out = (start: number) => 1 - ease(T, start, XF);
  const inn = (start: number) => ease(T, start - 0.1, XF);
  s.panels = {
    dial: out(b1),
    rack: inn(b1) * out(b2),
    form: inn(b2) * out(b3),
    paper: inn(b3),
  };
  // "it learns less hard … rewriting the book might learn more": the right end, then the left end, light
  const priceAt = fit(less + 2.6, 1.2, D);
  const tougherAt = fit(Math.max(priceAt + 1.2, b1 - 2.6), 1.2, D);
  s.dial = {
    needle: 0.5 + 0.38 * ease(T, less - 0.1, 0.8),
    right: Math.max(ease(T, less, 0.4) * (1 - 0.6 * ease(T, tougherAt, 0.5)), bump(T, priceAt, 1.2)),
    left: ease(T, tougherAt, 0.5),
  };
  const swapBack = fit(swap + 1.6, 0.8, D);
  s.rack = {
    on: [ease(T, swap - 0.2, 0.8) * (1 - ease(T, swapBack, 0.7)), ease(T, swapBack + 0.2, 0.8), 0],
    gpu: ease(T, coffees - 1.6, 0.5),
    cups: ease(T, coffees - 0.1, 0.5),
  };
  s.form = {
    upload: ease(T, upload - 0.2, 0.7),
    bar: progress(T, upload + 0.5, 2),
    terminal: ease(T, fit(codes - 2.2, 0.5, D), 0.5),
    typed: progress(T, codes - 1.2, 1.3),
  };
  const forgetsAt = fit(research + 1.8, 0.5, D);
  const learnsAt = fit(research + 3.6, 0.5, D);
  s.paper = { book: ease(T, b3, 0.5), cover: ease(T, research - 0.15, 0.6), forgets: ease(T, forgetsAt, 0.45), learns: ease(T, learnsAt, 0.45) };
  return s;
}
