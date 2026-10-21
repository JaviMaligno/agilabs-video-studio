// Pure state of the split frame (script scenes 12-16): left the strong model, right the weak one,
// each with its tower and its restart button. Modes:
// - setup:     both sides arrive.
// - strong:    the strong side's 7 restarts, 5 of them one-file scalpel cuts and 2 full wipes.
//              marks: [rarely, usually]
// - strongPay: its 4 feature chips: iterate 0/4, with the button 3/4, "n = 4 · a hint".
//              marks: [four, never, rescued, hint]
// - weak:      the weak side's 34 restarts, 23 of them everything; the wrecking ball swings.
//              marks: [lot, mostly]
// - weakPay:   its 14 chips: with the button 1/14, iterate 2/14, "already lost", "symptom, not cause".
//              marks: [iterating, nearly, wipe, symptom]
// Counts are the article's (logs reproduce them); which tick is which, and the order, are
// illustrative. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { towerBlocks, type BlockState, type Swap, type TowerEvent } from './tower.state.ts';

export type SplitMode = 'setup' | 'strong' | 'strongPay' | 'weak' | 'weakPay';
export type SplitProps = { mode: SplitMode; marks?: number[] };

export const SPLIT = {
  left: { cx: 290, tower: 380, button: 160 },
  right: { cx: 790, tower: 842, button: 668 },
  base: 770,
  w: 160,
  h: 40,
  gap: 6,
  n: 6,
} as const;
// Rest angle 10°: ball centre ~962, r 40 → 922..1002: clear of the tower (≤ 922) and inside the 60 px gutter.
export const PIVOT = { x: 905, y: 392, len: 330, out: 10, hit: -6, r: 40 } as const;
/** Split towers sit next to their scope dials: keep collapses and swaps narrow so blocks never cover the labels. */
const MOTION_STRONG = { spread: 0.45, swapDx: 90, swapIn: 90 };
const MOTION_WEAK = { spread: 0.25 };

/** Restart kinds: f = one file (scalpel), a = everything (wrecking ball). */
export const STRONG_TICKS = ['f', 'f', 'a', 'f', 'f', 'a', 'f'] as const;
const WEAK_F = new Set([2, 6, 9, 13, 16, 19, 22, 25, 28, 31, 33]);
export const WEAK_TICKS = Array.from({ length: 34 }, (_, i) => (WEAK_F.has(i) ? 'f' : 'a'));

/** Chip results (1 = solved): strong 4 feature-runs, weak 14. */
export const STRONG_CHIPS = { iterate: [0, 0, 0, 0], button: [1, 1, 0, 1] };
export const WEAK_CHIPS = {
  button: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  iterate: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
};

export type ChipRow = { appear: number[]; solved: number[]; score: number };
export type SideState = {
  presence: number;
  active: number;
  header: number;
  blocks: BlockState[];
  button: number;
  dial: number;
  dialPop: number;
  ticks: number[];
  count: number;
  readout: number;
  scalpel: { opacity: number; idx: number; slide: number };
  ball: { angle: number; opacity: number };
  rows: ChipRow[];
  stamp: number;
  lost: number;
};

const m = (marks: number[] | undefined, i: number, fallback: number): number => {
  const v = marks?.[i];
  return v !== undefined && Number.isFinite(v) ? v : fallback;
};

const pitch = SPLIT.h + SPLIT.gap;
const SCALPEL_BLOCKS = [4, 2, 5, 1, 3];

/** Tick times for `n` ticks from `a` to `b`. */
const spread = (n: number, a: number, b: number) => Array.from({ length: n }, (_, k) => a + (k * Math.max(0.1, b - a)) / Math.max(1, n - 1));

/** The strong side's tower and scalpel for its 7 restarts at `times`. */
function strongTower(times: number[], t: number) {
  const events: TowerEvent[] = [];
  const swaps: Swap[] = [];
  let f = 0;
  let scalpel = { opacity: 0, idx: 0, slide: 0 };
  STRONG_TICKS.forEach((kind, k) => {
    const at = times[k];
    if (kind === 'a') {
      events.push({ kind: 'collapse', at }, { kind: 'build', at: at + 0.3 });
    } else {
      const idx = SCALPEL_BLOCKS[f++ % SCALPEL_BLOCKS.length];
      swaps.push({ idx, at: at + 0.05 });
      const u = t - at;
      if (u >= 0 && u <= 0.6) scalpel = { opacity: clamp01(Math.min(u / 0.1, (0.6 - u) / 0.15)), idx, slide: clamp01(u / 0.4) };
    }
  });
  return { blocks: towerBlocks(SPLIT.n, pitch, t, events, swaps, () => 0, () => 0, false, MOTION_STRONG), scalpel };
}

/** The weak side's tower and ball: three swings that each knock the tower down. */
function weakTower(hits: number[], t: number) {
  const events: TowerEvent[] = hits.flatMap((h) => [
    { kind: 'collapse' as const, at: h },
    { kind: 'build' as const, at: h + 0.45 },
  ]);
  let angle: number = PIVOT.out;
  for (const h of hits) {
    const u = t - h;
    if (u >= -0.35 && u < 0) angle = PIVOT.out + (PIVOT.hit - PIVOT.out) * easeOutCubic((u + 0.35) / 0.35) ** 2;
    else if (u >= 0 && u < 0.6) angle = PIVOT.hit + (PIVOT.out - PIVOT.hit) * easeOutCubic(u / 0.6);
  }
  return { blocks: towerBlocks(SPLIT.n, pitch, t, events, [], () => 0, () => 0, false, MOTION_WEAK), angle };
}

const chipRow = (results: number[], appearAt: number, solveAt: number, t: number, scoreAt: number, stagger = 0.08): ChipRow => {
  let s = 0;
  return {
    appear: results.map((_, k) => easeOutCubic(progress(t, appearAt + k * stagger, 0.25))),
    solved: results.map((r) => (r ? progress(t, solveAt + 0.2 * s++, 0.25) : 0)),
    score: easeOutCubic(progress(t, scoreAt, 0.3)),
  };
};
const fullRow = (results: number[]): ChipRow => ({ appear: results.map(() => 1), solved: results.map((r) => r), score: 1 });
const noRow = (results: number[]): ChipRow => ({ appear: results.map(() => 0), solved: results.map(() => 0), score: 0 });

export function frameState(props: SplitProps, tIn: number, beats: number[], dur: number) {
  const t = sceneTime(tIn, dur);
  const b0 = beatAt(beats, 0);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 4;
  const mk = (i: number, fb: number, len = 0.4) => fit(m(props.marks, i, fb), len, d);
  const mode = props.mode;
  const standing = towerBlocks(SPLIT.n, pitch, 0, [], [], () => 0);
  const enter = mode === 'setup' ? easeOutCubic(progress(t, 0.1, 0.5)) : 1;

  const idle = (dial: number): SideState => ({
    presence: enter,
    active: 0,
    header: enter,
    blocks: standing,
    button: enter,
    dial,
    dialPop: enter,
    ticks: [],
    count: 0,
    readout: 0,
    scalpel: { opacity: 0, idx: 0, slide: 0 },
    ball: { angle: PIVOT.out, opacity: 0 },
    rows: [],
    stamp: 0,
    lost: 0,
  });

  const strongDone = (): SideState => ({
    ...idle(0),
    ticks: STRONG_TICKS.map(() => 1),
    count: STRONG_TICKS.length,
    readout: 1,
  });
  const strongChipsDone = (): SideState => ({
    ...strongDone(),
    rows: [fullRow(STRONG_CHIPS.iterate), fullRow(STRONG_CHIPS.button)],
    stamp: 1,
  });
  const weakDone = (): SideState => ({
    ...idle(2),
    ticks: WEAK_TICKS.map(() => 1),
    count: WEAK_TICKS.length,
    readout: 1,
    ball: { angle: PIVOT.out, opacity: 1 },
  });

  let left: SideState = idle(-1);
  let right: SideState = idle(-1);
  let focus = 0;

  if (mode === 'strong') {
    const start = mk(0, b0 + 1.0, 2.5);
    const usually = Math.max(start + 0.3, mk(1, b0 + 2.0, 1.0));
    const end = Math.max(start + 2.0, d - 0.9);
    const times = spread(STRONG_TICKS.length, start, end - 0.4);
    const tw = strongTower(times, t);
    left = {
      ...idle(t >= usually ? 0 : -1),
      active: 1,
      blocks: tw.blocks,
      ticks: times.map((a) => easeOutCubic(progress(t, a, 0.25))),
      count: times.filter((a) => t >= a).length,
      readout: progress(t, times[times.length - 1] + 0.2, 0.3),
      scalpel: tw.scalpel,
    };
    right = idle(-1);
    focus = 0;
  } else if (mode === 'strongPay') {
    const four = mk(0, b0 + 0.3, 0.6);
    const never = Math.max(four + 0.3, mk(1, b0 + 1.0, 0.6));
    const rescued = Math.max(never + 0.3, mk(2, b0 + 1.8, 1.0));
    const hint = Math.max(rescued + 0.5, mk(3, b0 + 2.8, 0.4));
    left = {
      ...strongDone(),
      active: 1,
      rows: [chipRow(STRONG_CHIPS.iterate, four - 0.1, Number.POSITIVE_INFINITY, t, never), chipRow(STRONG_CHIPS.button, rescued - 0.35, rescued, t, rescued + 0.65)],
      stamp: easeOutCubic(progress(t, hint - 0.05, 0.35)),
    };
    right = idle(-1);
    focus = 0;
  } else if (mode === 'weak') {
    const start = mk(0, b0 + 0.6, 2.5);
    const mostly = Math.max(start + 0.3, mk(1, b0 + 1.6, 1.0));
    const end = Math.max(start + 2.0, d - 0.9);
    const times = spread(WEAK_TICKS.length, start - 0.4, end - 0.3);
    const hits = [start + 0.15, (start + end) / 2 - 0.1, end - 0.35].map((h) => Math.max(h, mostly - 0.6));
    const tw = weakTower([hits[0], Math.max(hits[1], hits[0] + 1.05), Math.max(hits[2], hits[0] + 2.1)], t);
    left = { ...strongChipsDone() };
    right = {
      ...idle(t >= start ? 2 : -1),
      active: 1,
      blocks: tw.blocks,
      ticks: times.map((a) => easeOutCubic(progress(t, a, 0.2))),
      count: times.filter((a) => t >= a).length,
      readout: progress(t, times[times.length - 1] + 0.15, 0.3),
      ball: { angle: tw.angle, opacity: progress(t, start - 0.5, 0.3) },
    };
    focus = 1;
  } else if (mode === 'weakPay') {
    const iter = mk(0, b0 + 0.2, 1.2);
    const nearly = Math.max(iter + 0.3, mk(1, b0 + 0.9, 1.0));
    const wipe = Math.max(nearly + 0.4, mk(2, b0 + 2.6, 0.8));
    const symptom = Math.max(wipe + 0.4, mk(3, b0 + 3.4, 0.4));
    const first = fit(b0 - 0.2, 0.6, d);
    left = { ...strongChipsDone() };
    right = {
      ...weakDone(),
      active: 1,
      rows: [chipRow(WEAK_CHIPS.button, first, first + 0.5, t, first + 0.6, 0.03), chipRow(WEAK_CHIPS.iterate, iter - 0.1, nearly - 0.1, t, nearly + 0.3, 0.03)],
      ball: { angle: PIVOT.out, opacity: 1 - progress(t, wipe, 0.5) },
      lost: easeOutCubic(progress(t, wipe - 0.05, 0.45)),
      stamp: easeOutCubic(progress(t, symptom - 0.05, 0.35)),
    };
    focus = 1;
  } else {
    // setup: the empty chip rows are not shown yet.
    left = { ...idle(-1), rows: [noRow(STRONG_CHIPS.iterate), noRow(STRONG_CHIPS.button)] };
    right = idle(-1);
    focus = -1;
  }

  // The side not playing steps back.
  if (focus === 0) right.presence *= 0.4;
  if (focus === 1) left.presence *= 0.45;
  return { mode, focus, sides: [left, right] as [SideState, SideState] };
}

export type SplitState = ReturnType<typeof frameState>;
