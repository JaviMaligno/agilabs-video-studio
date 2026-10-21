// The code tower, as pure numbers: a stack of code blocks that can collapse to the floor, be
// rebuilt from nothing, or have one block swapped out and a clean one swapped in (the scalpel).
// Every scene of the video does something to a tower like this. No Remotion or React here.
import { clamp01, easeOutCubic } from './steps.ts';

/** One block, drawn at its standing place plus these offsets. */
export type BlockState = {
  dx: number;
  dy: number;
  rot: number;
  opacity: number;
  /** 0..1: the code the failing tests point at. */
  rose: number;
  /** 0..1: a brief teal flash (a patch that seemed to work). */
  teal: number;
};

/** Structural events: the tower falls (`collapse`) or is built again from nothing (`build`). */
export type TowerEvent = { kind: 'collapse' | 'build'; at: number };
/** One block slides out and a clean one slides in, starting at `at`. */
export type Swap = { idx: number; at: number };

export const COLLAPSE = 0.55;
export const BUILD_STEP = 0.07;
export const BUILD_DROP = 0.25;
export const SWAP = 0.5;

const fin = (x: number, d = 0) => (Number.isFinite(x) ? x : d);

/** Seconds a build of `n` blocks takes. */
export const buildLen = (n: number) => (n - 1) * BUILD_STEP + BUILD_DROP;

/**
 * The blocks of a tower of `n` at time `t`. `pitch` is a block's height plus the gap (for the
 * fall). `startEmpty`: nothing stands before the first build. `rose(i)` / `teal(i)` give each
 * block's colour at `t`.
 */
export function towerBlocks(
  n: number,
  pitch: number,
  t: number,
  events: TowerEvent[],
  swaps: Swap[],
  rose: (i: number) => number,
  teal: (i: number) => number = () => 0,
  startEmpty = false,
  /** Scales the sideways motion of a collapse (`spread`) and of a swap (`swapDx` out, `swapIn` back in; px, sign = side). */
  motion: { spread?: number; swapDx?: number; swapIn?: number } = {},
): BlockState[] {
  const spread = motion.spread ?? 1;
  const swapDx = motion.swapDx ?? 170;
  const swapIn = motion.swapIn ?? -swapDx;
  const time = fin(t);
  const evs = events.filter((e) => Number.isFinite(e.at)).sort((a, b) => a.at - b.at);
  let last: TowerEvent | null = null;
  for (const e of evs) if (e.at <= time) last = e;
  const out: BlockState[] = [];
  for (let i = 0; i < n; i++) {
    let dx = 0;
    let dy = 0;
    let rot = 0;
    let opacity = 1;
    const sgn = i % 2 === 0 ? -1 : 1;
    if (!last) {
      if (startEmpty) opacity = 0;
    } else if (last.kind === 'collapse') {
      const u = time - last.at;
      const d = (n - 1 - i) * 0.03;
      const p = clamp01((u - d) / (COLLAPSE - 0.1));
      dy = i * pitch * p * p;
      dx = sgn * (24 + i * 13) * p * spread;
      rot = sgn * (14 + i * 8) * p * spread;
      opacity = 1 - clamp01((u - 0.4) / 0.3);
    } else {
      const u = time - last.at - i * BUILD_STEP;
      const p = easeOutCubic(clamp01(u / BUILD_DROP));
      dy = -(1 - p) * 150;
      opacity = clamp01(u / 0.12);
    }
    for (const s of swaps) {
      if (s.idx !== i || !Number.isFinite(s.at)) continue;
      const u = time - s.at;
      if (u < 0 || u > SWAP) continue;
      const half = SWAP / 2;
      if (u < half) {
        dx += (u / half) * swapDx;
        opacity *= 1 - u / half;
      } else {
        dx += (1 - (u - half) / half) * swapIn;
        opacity *= (u - half) / half;
      }
    }
    out.push({ dx, dy, rot, opacity: clamp01(opacity), rose: clamp01(fin(rose(i))), teal: clamp01(fin(teal(i))) });
  }
  return out;
}

/** 1 while block `i` is in `set` at round `r`, with a short fade at the change. */
export function roundColour(sets: number[][], changes: number[], i: number, t: number, fade = 0.2): number {
  // sets[k] holds from changes[k] on (changes ascending); before changes[0] nothing is coloured.
  let v = 0;
  for (let k = 0; k < sets.length; k++) {
    const at = changes[k];
    if (!Number.isFinite(at)) continue;
    const p = clamp01((t - at) / fade);
    const on = sets[k].includes(i) ? 1 : 0;
    v = v + (on - v) * p;
  }
  return clamp01(v);
}

/** Lights of the test strip: `rose` / `teal` per light (0..1), from a failing count per round. */
export type LightState = { rose: number; teal: number };
const LIGHT_ORDER = [1, 4, 2, 5, 0, 3];
export function stripLights(nLights: number, failing: (number | null)[], changes: number[], t: number): LightState[] {
  const out: LightState[] = [];
  for (let j = 0; j < nLights; j++) {
    const rank = LIGHT_ORDER.indexOf(j % LIGHT_ORDER.length);
    let rose = 0;
    let teal = 0;
    for (let k = 0; k < failing.length; k++) {
      const at = changes[k];
      if (!Number.isFinite(at)) continue;
      const p = clamp01((t - at) / 0.2);
      const f = failing[k];
      const r = f === null ? 0 : rank < f ? 1 : 0;
      const g = f === null ? 0 : 1 - r;
      rose += (r - rose) * p;
      teal += (g - teal) * p;
    }
    out.push({ rose: clamp01(rose), teal: clamp01(teal) });
  }
  return out;
}
