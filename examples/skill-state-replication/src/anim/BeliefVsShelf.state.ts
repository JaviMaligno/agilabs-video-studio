// Pure state of "where does it break" on Claude Haiku 4.5 (lines 13-16).
// - rank: the three arms at 200 steps; the notepad comes last (0.999 / 0.974 / 0.958).
// - drift: the replay; the notepad's belief (top row) against the shelves (bottom row), step by
//   step: they match until step 132, where a correct Move (7 → 3) gets a wrong patch.
// - slip: the step explained (part 2's figure): shelf 7's SKU-K really goes to 3; the patch writes
//   shelf 6's contents (SKU-J) into shelf 3; at step 137 the agent ships SKU-J from 3 and the
//   environment rejects it; the notepad line is not corrected.
// - check: nothing checks the write (it passes the schema); Haiku 17 / 24 runs, Gemini 0 / 75.
// Each mode starts where the previous one ends. No Remotion or React here.
import { easeOutCubic, progress, sceneTime } from './steps.ts';

export type BvsMode = 'rank' | 'drift' | 'slip' | 'check';
export type BeliefVsShelfProps = { mode: BvsMode; marks?: number[] };

export const RANK = [
  { label: 'notepad + transcript', value: 0.999, text: '0.999', last: false },
  { label: 'transcript', value: 0.974, text: '0.974', last: false },
  { label: 'notepad', value: 0.958, text: '0.958', last: true },
] as const;
/** Bars start at this score (the three are close; the axis says so on screen). */
export const RANK_FROM = 0.9;

export const CELLS = [3, 6, 7, 9, 12] as const;
const BEFORE: Record<number, string> = { 3: '', 6: 'SKU-J', 7: 'SKU-K', 9: 'SKU-B', 12: 'SKU-E' };

export type Cell = { shelf: number; lot: string; tone: 'plain' | 'warm' | 'ok'; flash: number; note: string; noteOp: number };
export type BvsState = {
  rank: { opacity: number; header: number; bars: number[]; hot: number; last: number };
  board: { opacity: number };
  step: { value: number; opacity: number };
  belief: Cell[];
  reality: Cell[];
  /** The pallet moving 7 → 3 on the shelves (0 = at 7, 1 = at 3). */
  move: number;
  match: { sym: '=' | '≠'; pulse: number }[];
  banner: { a: number; b: number; textA: string; textB: string };
  arcs: { move: number; copy: number };
  rejected: number;
  schema: number;
  tiles: number[];
};

const e = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};

const cells = (lots: Record<number, string>, over: (shelf: number) => Partial<Cell> = () => ({})): Cell[] =>
  CELLS.map((shelf) => ({ shelf, lot: lots[shelf] ?? '', tone: 'plain' as const, flash: 0, note: '', noteOp: 0, ...over(shelf) }));

const AFTER_REAL: Record<number, string> = { ...BEFORE, 3: 'SKU-K', 7: '' };
const AFTER_BELIEF: Record<number, string> = { ...BEFORE, 3: 'SKU-J', 7: '' };

const empty = (): BvsState => ({
  rank: { opacity: 0, header: 0, bars: [0, 0, 0], hot: 0, last: 0 },
  board: { opacity: 0 },
  step: { value: 120, opacity: 0 },
  belief: cells(BEFORE),
  reality: cells(BEFORE),
  move: 0,
  match: CELLS.map(() => ({ sym: '=' as const, pulse: 0 })),
  banner: { a: 0, b: 0, textA: 'Move ✓', textB: 'patch ✗' },
  arcs: { move: 0, copy: 0 },
  rejected: 0,
  schema: 0,
  tiles: [0, 0],
});

/** The board after the wrong patch (end of drift). */
const drifted = (s: BvsState): BvsState => ({
  ...s,
  board: { opacity: 1 },
  step: { value: 132, opacity: 1 },
  belief: cells(AFTER_BELIEF, (sh) => (sh === 3 ? { tone: 'warm', note: 'from shelf 6', noteOp: 1 } : {})),
  reality: cells(BEFORE),
  move: 1,
  match: CELLS.map((sh) => ({ sym: sh === 3 ? ('≠' as const) : ('=' as const), pulse: 0 })),
  banner: { a: 1, b: 1, textA: 'Move ✓', textB: 'patch ✗' },
});

export function frameState(props: BeliefVsShelfProps, t: number, beats: number[], dur: number): BvsState {
  const modes: BvsMode[] = ['rank', 'drift', 'slip', 'check'];
  const mode: BvsMode = modes.includes(props.mode) ? props.mode : 'rank';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beats[0] !== undefined && Number.isFinite(beats[0]) ? beats[0] : 0;
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 1.6;
  const s = empty();

  if (mode === 'rank') {
    const hk = mk(m, 0, b0 + 0.5);
    const pad = mk(m, 1, b0 + 2.6);
    const last = mk(m, 2, b0 + 3.4);
    s.rank = {
      opacity: 1,
      header: e(T, 0.1, 0.4),
      bars: [0, 1, 2].map((i) => e(T, hk - 0.3 + 0.35 * i, 0.6)),
      hot: e(T, pad - 0.1, 0.4),
      last: e(T, last, 0.35),
    };
    return s;
  }

  if (mode === 'drift') {
    const rep = mk(m, 0, b0 + 0.3);
    const cor = mk(m, 1, b0 + 2.5);
    const wrong = mk(m, 2, b0 + 3.8);
    const out = e(T, 0, 0.45);
    s.rank = { opacity: 1 - out, header: 1, bars: [1, 1, 1], hot: 1, last: 1 };
    // The board comes in once the ranking has gone, so the two never overlap.
    s.board.opacity = e(T, 0.5, 0.4);
    // The scrub: 120 → 131 from "replaying" to "correct", then 132.
    const scrub = progress(T, rep - 0.2, cor - 0.3 - (rep - 0.2));
    const value = T >= cor - 0.2 ? 132 : 120 + Math.floor(11 * scrub);
    s.step = { value, opacity: s.board.opacity };
    const stepFrac = T >= cor - 0.2 ? 0 : (11 * scrub) % 1;
    s.match = CELLS.map(() => ({ sym: '=' as const, pulse: T < cor - 0.2 && scrub > 0 ? 1 - stepFrac : 0 }));
    s.move = e(T, cor, 0.7);
    const written = progress(T, wrong - 0.1, 0.5);
    s.reality = cells(BEFORE);
    s.belief = cells(written > 0 ? AFTER_BELIEF : BEFORE, (sh) =>
      sh === 3 && written > 0 ? { tone: 'warm', flash: Math.sin(Math.PI * written), note: 'from shelf 6', noteOp: written } : {},
    );
    if (written > 0) s.match = CELLS.map((sh) => ({ sym: sh === 3 ? ('≠' as const) : ('=' as const), pulse: sh === 3 ? written : 0 }));
    s.banner = { a: e(T, cor + 0.1, 0.4), b: e(T, wrong + 0.1, 0.4), textA: 'Move ✓', textB: 'patch ✗' };
    return s;
  }

  const d = drifted(s);
  if (mode === 'slip') {
    const moved = mk(m, 0, b0 + 0.3);
    const noted = mk(m, 2, b0 + 2.1);
    const shipped = mk(m, 4, b0 + 4.0);
    const belief = mk(m, 5, b0 + 5.2);
    d.arcs = { move: progress(T, moved - 0.1, 0.8), copy: progress(T, noted - 0.1, 0.8) };
    const ship = T >= shipped - 0.1;
    d.step = { value: ship ? 137 : 132, opacity: 1 };
    d.banner = {
      a: ship ? 1 - e(T, shipped - 0.1, 0.3) : 1,
      b: ship ? e(T, shipped, 0.35) : 1,
      textA: 'moved 7 → 3 ✓',
      textB: ship ? 'ship SKU-J from shelf 3' : "patch: shelf 6's contents ✗",
    };
    d.rejected = e(T, shipped + 0.5, 0.35);
    d.reality = cells(BEFORE, (sh) => (sh === 3 ? { flash: d.rejected, tone: 'warm' } : {}));
    d.belief = cells(AFTER_BELIEF, (sh) =>
      sh === 3 ? { tone: 'warm', note: T >= belief ? 'not corrected' : 'from shelf 6', noteOp: 1, flash: e(T, belief, 0.35) } : sh === 6 ? { flash: Math.sin(Math.PI * progress(T, noted - 0.2, 1.2)), tone: 'warm' } : {},
    );
    return d;
  }

  // check
  const nothing = mk(m, 0, b0 + 0.2);
  const hk = mk(m, 2, b1 + 0.1);
  const n17 = mk(m, 3, b1 + 0.9);
  d.arcs = { move: 1 - e(T, 0, 0.4), copy: 1 - e(T, 0, 0.4) };
  d.step = { value: 137, opacity: 1 };
  d.banner = { a: 0, b: 1 - e(T, 0, 0.4), textA: 'moved 7 → 3 ✓', textB: 'ship SKU-J from shelf 3' };
  d.rejected = 1 - e(T, 0, 0.4);
  d.reality = cells(BEFORE, (sh) => (sh === 3 ? { flash: d.rejected, tone: 'warm' } : {}));
  d.belief = cells(AFTER_BELIEF, (sh) => (sh === 3 ? { tone: 'warm', note: 'not corrected', noteOp: 1 - e(T, nothing, 0.3) } : {}));
  d.schema = e(T, nothing + 0.1, 0.4);
  d.tiles = [e(T, Math.min(hk, n17 - 0.3), 0.4), e(T, n17 + 0.6, 0.4)];
  return d;
}
