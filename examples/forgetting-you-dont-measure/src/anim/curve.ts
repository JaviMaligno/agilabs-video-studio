// The article's replay chart, as data. Change in mean general accuracy (trained − base) at each
// replay share. Full fine-tuning: docs/EXPERIMENTS.md Phase 1; LoRA 0.5B: Phase 2. Same values as
// the article's chart. Only "−0.078" is printed on screen; the other points are just dots.
// No Remotion or React here.

export const X_LABELS = ['0%', '10%', '25%', '50%'] as const;
export const FULL = [-0.078, -0.021, -0.012, -0.015] as const;
export const LORA = [0.002, 0.005, 0.009, 0.009] as const;

export const Y_TOP = 0.02;
export const Y_BOTTOM = -0.09;

export type Box = { x: number; y: number; w: number; h: number };

/** Plot coordinates of point i with value v inside a box (x evenly spaced with margins). */
export const pt = (box: Box, i: number, v: number): [number, number] => {
  const mx = box.w * 0.1;
  const x = box.x + mx + (i / (X_LABELS.length - 1)) * (box.w - 2 * mx);
  const f = (Y_TOP - v) / (Y_TOP - Y_BOTTOM);
  return [x, box.y + Math.min(1, Math.max(0, f)) * box.h];
};

/** A polyline through the first points, drawn up to `draw` (0..n-1 segments as a float). */
export const partialPath = (pts: [number, number][], draw: number): [number, number][] => {
  if (pts.length === 0) return [];
  const d = Math.max(0, Math.min(pts.length - 1, Number.isFinite(draw) ? draw : 0));
  const whole = Math.floor(d);
  const out = pts.slice(0, whole + 1);
  const f = d - whole;
  if (f > 0 && whole + 1 < pts.length) {
    const [x0, y0] = pts[whole];
    const [x1, y1] = pts[whole + 1];
    out.push([x0 + (x1 - x0) * f, y0 + (y1 - y0) * f]);
  }
  return out;
};
