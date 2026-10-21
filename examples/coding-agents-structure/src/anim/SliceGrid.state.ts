// Pure state of the slice grid: every task pair of the benchmark as a tile, the ones the study ran
// lit in the accent, a headline ("19 of 652") and the study's size as chips. No Remotion or React.
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type SliceGridProps = {
  total: number;
  lit: number;
  stats: string[];
  /** Scene seconds: [lit tiles, runs chip, slice (the rest dims)]. */
  marks?: number[];
  cols?: number;
};

/** Tile indices of the lit ones, spread evenly over the grid with a fixed jitter. */
export function litIndices(total: number, lit: number): number[] {
  const n = Math.max(0, Math.min(Math.floor(lit), Math.floor(total)));
  const out = new Set<number>();
  // A fixed pseudo-random scatter (LCG), so the slice reads as "a few, here and there".
  let x = 12345;
  const T = Math.max(1, Math.floor(total));
  for (let k = 0; out.size < n && k < 100000; k++) {
    x = (x * 1103515245 + 12345) % 2147483648;
    out.add(Math.floor((x / 2147483648) * T));
  }
  // Fallback (never needed in practice): fill in order.
  for (let i = 0; out.size < n && i < T; i++) out.add(i);
  return [...out].sort((a, b) => a - b);
}

export function frameState(p: SliceGridProps, time: number, _beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const total = Math.max(0, Math.floor(p.total));
  const cols = p.cols && p.cols > 0 ? Math.floor(p.cols) : 34;
  const rows = Math.ceil(total / cols);
  const m = p.marks ?? [];
  const ok = (x: number | undefined, f: number) => (x !== undefined && Number.isFinite(x) && x >= 0 ? x : f);
  const m0 = ok(m[0], 0.4);
  const m1 = ok(m[1], m0 + 1.2);
  const m2 = ok(m[2], m1 + 1.2);
  const lit = new Set(litIndices(total, p.lit));
  const wave = (r: number) => clamp01(progress(t, (r / Math.max(1, rows)) * 0.5, 0.3));
  const litPop = easeOutCubic(progress(t, m0, 0.4));
  const dimRest = clamp01(progress(t, m2, 0.5));
  return {
    cols,
    rows,
    headline: easeOutCubic(progress(t, m0 - 0.05, 0.35)),
    tiles: Array.from({ length: total }, (_, i) => {
      const r = Math.floor(i / cols);
      const on = lit.has(i);
      return { on, appear: wave(r), pop: on ? litPop : 0, dim: on ? 0 : dimRest };
    }),
    stats: p.stats.map((text, i) => ({ text, appear: easeOutCubic(progress(t, i === 0 ? m0 + 0.45 : i === 1 ? m1 : m1 + 0.3, 0.35)) })),
  };
}
