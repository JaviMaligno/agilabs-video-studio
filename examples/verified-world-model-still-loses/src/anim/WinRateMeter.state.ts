// Pure state of the verdict figure: the sequel's meter grown into the article's own CI figure.
// Two rows on a 0.35-0.55 win-rate axis, dot + 95% whiskers, the gap bracket "play cost 0.091".
// Values exactly as the article writes them. No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Row = { id: 'fair' | 'model'; label: string; value: number; text: string; lo: number; hi: number };

export const ROWS: Row[] = [
  { id: 'fair', label: 'fair baseline', value: 0.495, text: '0.495', lo: 0.475, hi: 0.515 },
  { id: 'model', label: 'this model', value: 0.404, text: '0.404', lo: 0.384, hi: 0.424 },
];
export const AXIS = { min: 0.35, max: 0.55, ticks: [0.35, 0.4, 0.45, 0.5, 0.55] } as const;
export const GAP_TEXT = '0.091';

export type WinRateProps = {
  /** Seconds after each row's beat at which it lands (the number is spoken near the line end). */
  delays?: { model?: number; fair?: number };
};

/** Axis position in [0, 1]. */
export const axisPos = (v: number): number => (v - AXIS.min) / (AXIS.max - AXIS.min);

export function frameState(p: WinRateProps, t: number, beats: number[], dur: number) {
  const T = sceneTime(t, dur);
  const d = Number.isFinite(dur) ? Math.max(0, dur) : 1e6;
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 2;
  const axis = easeOutCubic(progress(T, fit(0.05, 0.5, d), 0.5));
  const modelAt = fit(b0 + (p.delays?.model ?? 1.2), 0.5, d);
  const fairAt = fit(b1 + (p.delays?.fair ?? 1.0), 0.5, d);
  const gapAt = fit(Math.max(modelAt, fairAt) + 0.7, 0.6, d);
  const rows = ROWS.map((r) => {
    const at = r.id === 'model' ? modelAt : fairAt;
    return { ...r, pos: axisPos(r.value), lo: axisPos(r.lo), hi: axisPos(r.hi), appear: progress(T, at, 0.25), pop: easeOutCubic(progress(T, at, 0.45)), whisker: easeOutCubic(progress(T, at + 0.2, 0.4)) };
  });
  return {
    axis,
    rows,
    gap: { draw: easeOutCubic(progress(T, gapAt, 0.6)), opacity: progress(T, gapAt + 0.2, 0.3), text: GAP_TEXT },
    footnote: progress(T, fit(gapAt + 0.6, 0.4, d), 0.4),
  };
}

export type WinRateState = ReturnType<typeof frameState>;
