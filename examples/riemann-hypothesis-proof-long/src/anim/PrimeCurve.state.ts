// PrimeCurve — the article's centred prime sum on a blackboard (rows 41-44, scene "waves").
// Small waves (one per zero) collapse into the axis, the real curve r(y) for y from 10 to ten
// million draws left to right, the band the hypothesis allows fades in, its top edge becomes the
// ceiling a louder wave would poke through, and a card says it is evidence, not proof.
// Pure numbers and strings (no Remotion or React), so `node --test` can check it.
import data from '../data/prime-curve.json' with { type: 'json' };
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type PrimeCurveProps = { mode: string };

type CurveData = { band: number; max: number; min: number; argmax: number; points: [number, number][] };

/** src/data/prime-curve.json as made by scripts/prime-curve.py: never altered here. */
export const CURVE = data as unknown as CurveData;

/** Index of the curve's furthest point from zero (the dip at about -0.0227). */
export const FURTHEST = CURVE.points.reduce((best, p, i, all) => (Math.abs(p[1]) > Math.abs(all[best][1]) ? i : best), 0);

/** Labels exactly as the article writes the figures. */
export const BAND_TEXT = '±0.0462';
export const FURTHEST_TEXT = '0.023';
export const TICKS: { at: number; text: string }[] = [
  { at: 1, text: '10' },
  { at: 3, text: '1,000' },
  { at: 5, text: '100,000' },
  { at: 7, text: '10,000,000' },
];

/** The hypothetical louder wave (data units, x = log10 y): amplitude grows, peaks through the top near x = 6.5. */
export const louderWave = (x: number): number => {
  const a = 0.012 + 0.058 * ((x - 1) / 6) ** 2;
  return a * Math.cos(Math.PI * (x - 6.5));
};

/** Small chalk waves of the intro, one per zero: amplitude (px), wavelength (px), speed. */
export const WAVES = [
  { amp: 34, len: 300, speed: 1.1 },
  { amp: 22, len: 170, speed: 1.7 },
  { amp: 40, len: 420, speed: 0.8 },
  { amp: 18, len: 120, speed: 2.1 },
  { amp: 28, len: 230, speed: 1.3 },
];
/** What every intro wave settles to once "every wave stays small". */
export const SMALL_AMP = 14;

/** Typical gap between line starts, used when a beat is missing. */
const GAPS = [5, 4, 4, 5.5, 3.3, 3.5, 5.2, 3.8];

/** Beat i, monotonic, with a sensible fallback when the scene has fewer beats. */
const beatList = (beats: number[]): number[] => {
  const out: number[] = [];
  for (let i = 0; i < 9; i++) {
    const b = beats[i];
    const prev = i === 0 ? 0 : out[i - 1];
    out.push(b !== undefined && Number.isFinite(b) ? Math.max(prev, b) : i === 0 ? 0 : prev + GAPS[i - 1]);
  }
  return out;
};

const ease = (t: number, start: number, len: number) => easeOutCubic(progress(t, start, len));

export function frameState(_p: PrimeCurveProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const T = Number.isFinite(time) ? Math.min(Math.max(0, time), 1e6) : 0;
  const B = beatList(beats);

  // Lines 1-2: one wave per zero, then all small.
  const collapse = ease(t, B[2] + 0.2, 1.2);
  const waves = WAVES.map((_, i) => ({ appear: ease(t, B[0] + 1.9 + i * 0.45, 0.7) * (1 - collapse) }));
  const calm = ease(t, B[1] + 2.3, 1.0);
  const head0 = progress(t, 0, 0.4) * (1 - progress(t, B[0] + 1.6, 0.3));
  const head1 = progress(t, B[0] + 1.9, 0.4) * (1 - progress(t, B[1] + 0.2, 0.4));
  const head2 = progress(t, B[1] + 0.3, 0.5) * (1 - progress(t, B[2] + 0.1, 0.5));
  const lineIn = progress(t, 0, 0.6) * (1 - collapse);
  const lineLabel = progress(t, B[1] + 1.2, 0.5) * (1 - collapse);

  // Lines 3-4: axes, the list of primes, the formula, the real curve.
  const axes = ease(t, B[2] + 0.3, 1.0);
  const ticks = TICKS.map((_, k) => ({ appear: progress(t, B[2] + 0.9 + k * 0.3, 0.4) }));
  const primes = progress(t, B[2] + 2.3, 0.5) * (1 - progress(t, B[3], 0.4));
  const formulaOut = 1 - progress(t, B[6], 0.6);
  const formula = [0.1, 1.7, 3.45].map((d) => ({ appear: progress(t, B[3] + d, 0.4) * formulaOut }));
  const drawLen = Math.min(5, Math.max(1, B[4] - B[3] - 0.3));
  const draw = progress(t, B[3] + 0.15, drawLen);

  // Lines 5-6: the band, the furthest point, "forever?".
  const band = ease(t, B[4] + 0.4, 0.8);
  const bandLabel = progress(t, B[4] + 0.6, 0.5);
  const marker = ease(t, B[4] + 1.9, 0.5);
  const markerLabel = progress(t, B[4] + 2.0, 0.5) * (1 - progress(t, B[6] + 0.2, 0.5));
  const forever = ease(t, B[5] + 1.5, 0.7);

  // Line 7: only the top edge stays lit; a louder (hypothetical) wave pokes through and is crossed out.
  const topOnly = ease(t, B[6] + 0.2, 0.6);
  const louder = progress(t, B[6] + 0.5, 3.4);
  const louderLabel = progress(t, B[6] + 1.0, 0.5) * (1 - progress(t, B[7] + 0.3, 0.6));
  const poke = progress(t, B[6] + 3.7, 0.4);
  const cross = ease(t, Math.max(B[6] + 3.9, Math.min(B[6] + 4.1, B[7] - 0.6)), 0.45);
  const louderFade = progress(t, B[7] + 0.3, 0.8);

  // Line 8: the ceiling over a long stretch.
  const headline = progress(t, B[7] + 0.3, 0.5) * (1 - progress(t, B[8] + 0.1, 0.5));
  const ceiling = progress(t, B[7] + 0.6, 0.5);
  const sweep = progress(t, B[7] + 1.4, 1.6);

  // Line 9: the card.
  const card = ease(t, B[8] + 0.3, 0.6);
  const cardLine2 = progress(t, B[8] + 3.3, 0.5);

  return {
    T,
    waves,
    calm,
    head0,
    head1,
    head2,
    lineLabel,
    lineIn,
    collapse,
    axes,
    ticks,
    primes,
    formula,
    draw,
    band,
    bandLabel,
    marker,
    markerLabel,
    forever,
    topOnly,
    louder,
    louderLabel,
    poke,
    cross,
    louderFade,
    headline,
    ceiling,
    sweep,
    card,
    cardLine2,
    /** How much the curve is dimmed behind the card. */
    dim: clamp01(card * 0.4),
  };
}
