// Pure state of the turn budget, the mechanism: a run gets 40 turns, drawn as a track of 40 slots
// with a wall at the end. Reading unreadable code eats turns line by line.
// - track: an open (degraded) file read line by line; every line read fills slots; the wall lands
//   on "40".
// - small: the small library with the strong model: clean and degraded both stop at 6; the empty
//   rest of the track is the margin.
// - large: the large library: clean already needs 30; degraded slams into the wall at 40, OUT OF
//   TURNS.
// - margin: both, the empty parts glow, "How much margin is left?".
// - verdict: ONLY SOMETIMES, then a checklist of what helps, built item by item (readable names;
//   clearly written code, in large code with little margin; folder layout less, search likely
//   covers it), and the caveats.
// 6, 30 and 40 are the article's median turns; the fill between them is illustrative.
import { easeOutCubic, progress, sceneTime } from './steps.ts';

export type BudgetMode = 'track' | 'small' | 'large' | 'margin' | 'verdict';
export type TurnBudgetProps = { mode: BudgetMode; marks?: number[] };

export const BUDGET = 40;
export const SMALL_TURNS = 6;
export const LARGE_TURNS = 30;
export const READ_ROWS = 4;
export const CAVEATS = ['40-turn budget', '1 model per tier', '2 repos carry it'];
/** What helps, in the order the verdict voices it. `sure: false` draws a tilde instead of a tick. */
export const HELPS = [
  { title: 'Readable names', sub: 'given back to destroyed code · 97% vs 83%', sure: true },
  { title: 'Clearly written code', sub: 'in large code with little margin', sure: true },
  { title: 'Tidy folders', sub: 'matter less · the agent likely searches', sure: false },
];

/** One run on a track: slots filled (0..40) and what it is drawn as. */
export type Run = { opacity: number; slots: number; tick: number };

export type BudgetState = {
  /** track: the open file and the row being read (float), the track and its wall. */
  file: { opacity: number; row: number; read: number };
  wall: { pop: number; hit: number };
  readRun: Run;
  small: { opacity: number; dim: number; clean: Run; dirty: Run; margin: number };
  large: { opacity: number; clean: Run; dirty: Run; stamp: number };
  glow: number;
  quote: { pop: number };
  verdict: { pop: number; list: number; items: number[]; caveats: number[] };
};

const e = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};
const beat = (beats: number[], i: number, fallback: number) => {
  const b = beats[i];
  return b !== undefined && Number.isFinite(b) ? b : fallback;
};
const run = (opacity = 0, fill = 0, tick = 0): Run => ({ opacity, slots: fill, tick });

const MODES: BudgetMode[] = ['track', 'small', 'large', 'margin', 'verdict'];

export function frameState(props: TurnBudgetProps, t: number, beats: number[], dur: number): BudgetState {
  const mode: BudgetMode = MODES.includes(props.mode) ? props.mode : 'track';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beat(beats, 0, 0);
  const b1 = beat(beats, 1, b0 + 2.5);
  const s: BudgetState = {
    file: { opacity: 0, row: 0, read: 0 },
    wall: { pop: 0, hit: 0 },
    readRun: run(),
    small: { opacity: 0, dim: 0, clean: run(), dirty: run(), margin: 0 },
    large: { opacity: 0, clean: run(), dirty: run(), stamp: 0 },
    glow: 0,
    quote: { pop: 0 },
    verdict: { pop: 0, list: 0, items: HELPS.map(() => 0), caveats: CAVEATS.map(() => 0) },
  };
  const smallDone = { opacity: 1, dim: 0, clean: run(1, SMALL_TURNS, 1), dirty: run(1, SMALL_TURNS, 1), margin: 1 };

  if (mode === 'track') {
    const crawl = mk(m, 0, b0 + 1.4);
    const turns = mk(m, 1, b0 + 2.6);
    const wall = mk(m, 2, b1 + 1);
    // Rows are read one after another from "line by line" to the end; each row costs a few slots.
    const read = progress(T, crawl - 0.2, Math.max(0.6, wall + 0.6 - crawl));
    s.file = { opacity: e(T, 0, 0.4), row: read * READ_ROWS, read };
    s.readRun = run(e(T, turns - 0.3, 0.4), 16 * read, 0);
    s.wall = { pop: e(T, wall - 0.05, 0.35), hit: 0 };
    return s;
  }

  if (mode === 'small') {
    const six = mk(m, 0, b0 + 2);
    const fill = e(T, six - 0.9, 0.9);
    s.wall = { pop: 1, hit: 0 };
    s.small = {
      opacity: e(T, 0, 0.4),
      dim: 0,
      clean: run(1, SMALL_TURNS * fill, e(T, six + 0.05, 0.3)),
      dirty: run(1, SMALL_TURNS * fill, e(T, six + 0.15, 0.3)),
      margin: e(T, six + 0.4, 0.5),
    };
    return s;
  }

  if (mode === 'large' || mode === 'margin') {
    s.wall = { pop: 1, hit: mode === 'margin' ? 1 : 0 };
    if (mode === 'large') {
      const thirty = mk(m, 0, b0 + 1.6);
      const push = mk(m, 1, b1 + 0.5);
      const forty = mk(m, 2, b1 + 1.4);
      const out = mk(m, 3, b1 + 2.4);
      s.small = { ...smallDone, dim: e(T, 0, 0.5) };
      const cf = e(T, thirty - 1.2, 1.2);
      // The degraded run keeps pace with the clean one, then is pushed through to the wall on "40".
      const df = Math.min(LARGE_TURNS * cf + (BUDGET - LARGE_TURNS) * progress(T, push, Math.max(0.3, forty - push)), BUDGET);
      s.large = {
        opacity: e(T, 0, 0.4),
        clean: run(1, LARGE_TURNS * cf, e(T, thirty + 0.05, 0.3)),
        dirty: run(e(T, Math.min(push - 0.4, thirty), 0.3), df, 0),
        stamp: e(T, out - 0.1, 0.35),
      };
      s.wall.hit = e(T, forty - 0.05, 0.3);
      return s;
    }
    const margin = mk(m, 0, b0 + 1.6);
    s.small = { ...smallDone, dim: 1 - e(T, margin - 0.8, 0.5) };
    s.large = { opacity: 1, clean: run(1, LARGE_TURNS, 1), dirty: run(1, BUDGET, 0), stamp: 1 };
    s.glow = e(T, margin - 0.3, 0.5);
    s.quote = { pop: e(T, margin - 0.6, 0.5) };
    return s;
  }

  // verdict
  const only = mk(m, 0, b0 + 1.8);
  const list = mk(m, 1, b1 + 0.1);
  const items = HELPS.map((_, i) => mk(m, 2 + i, list + 1 + 2.5 * i));
  const caveats = mk(m, 5, items[items.length - 1] + 2.5);
  s.verdict = {
    pop: e(T, only - 0.1, 0.4),
    list: e(T, list - 0.2, 0.45),
    items: items.map((at) => e(T, at - 0.15, 0.4)),
    caveats: CAVEATS.map((_, i) => e(T, caveats + i * 0.2, 0.35)),
  };
  return s;
}
