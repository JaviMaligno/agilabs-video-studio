// Pure state of the 'task' scene: a 19 x 7 heatmap of corrections per task (rows) and model
// (columns). Beat 0 fills the rows top to bottom; beat 1 sweeps a light down the rows, draws a
// bracket along the left and shows "task ≫ model". No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type HeatRow = { label: string; values: number[] };
export type TaskHeatmapProps = {
  /** Model short names, left to right. */
  columns: string[];
  /** Tasks, already sorted from easiest. */
  rows: HeatRow[];
  /** Value that maps to the full colour (8). */
  max?: number;
  /** Column whose header is drawn in amber (DeepSeek). */
  highlightColumn?: number;
};

export const LOW = '#2dd4bf';
export const HIGH = '#f59e0b';
export const TAG = 'task ≫ model';

/** Seconds one row takes to fade in. */
export const ROW_FILL = 0.35;
/** All rows filled this long after beat 0. */
export const FILL_TOTAL = 2.5;
/** Seconds the light takes to sweep down all rows. */
export const SWEEP = 1.6;
/** Header fade-in. */
export const HEAD = 0.3;

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Cell colour for a share of the maximum in [0, 1]: teal to amber, opacity rising with value. */
export function cellColour(share: number): string {
  const s = clamp01(share);
  const a = hex(LOW);
  const b = hex(HIGH);
  const c = a.map((x, i) => Math.round(x + (b[i] - x) * s));
  const op = 0.18 + 0.82 * s;
  return `rgba(${c[0]},${c[1]},${c[2]},${op.toFixed(3)})`;
}

const fmt = (v: number): string => (Number.isFinite(v) ? String(v) : '–');

export function frameState(p: TaskHeatmapProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const nRows = p.rows.length;
  const nCols = p.columns.length;
  const vals = p.rows.flatMap((r) => r.values.filter((v) => Number.isFinite(v)));
  const top = p.max !== undefined && Number.isFinite(p.max) && p.max > 0 ? p.max : Math.max(0, ...vals);
  const max = top > 0 ? top : 1;

  const b0 = beatAt(beats, 0);
  const rawB1 = beats[1];
  const b1raw = rawB1 !== undefined && Number.isFinite(rawB1) ? rawB1 : b0 + FILL_TOTAL + 0.3;
  const stagger = nRows > 1 ? (FILL_TOTAL - ROW_FILL) / (nRows - 1) : 0;

  const headStart = fit(b0, HEAD, dur);
  const sweepStart = fit(b1raw, SWEEP, dur);
  const tagStart = fit(b1raw + 0.2, 0.5, dur);
  const sweep = progress(t, sweepStart, SWEEP);
  // Light position in rows, from just above the first to just below the last.
  const pos = -1 + easeOutCubic(sweep) * (nRows + 1);
  const sweepOn = sweep > 0 && sweep < 1 ? 1 : 0;

  const hl = p.highlightColumn !== undefined && Number.isInteger(p.highlightColumn) ? p.highlightColumn : -1;

  return {
    max,
    head: progress(t, headStart, HEAD),
    columns: p.columns.map((name, i) => ({ name, highlight: i === hl })),
    rows: p.rows.map((r, i) => {
      const start = fit(b0 + i * stagger, ROW_FILL, dur);
      const opacity = progress(t, start, ROW_FILL);
      const glow = sweepOn * clamp01(1 - Math.abs(pos - i) / 1.6);
      return {
        label: r.label,
        start,
        opacity,
        glow,
        cells: Array.from({ length: nCols }, (_, j) => {
          const v = r.values[j];
          const fill = Number.isFinite(v) ? clamp01(v / max) : 0;
          return { text: fmt(v), fill, colour: cellColour(fill) };
        }),
      };
    }),
    /** How far the bracket along the left is drawn, top to bottom. */
    draw: easeOutCubic(sweep),
    /** "task ≫ model" label. */
    appear: progress(t, tagStart, 0.5),
    tag: TAG,
  };
}
