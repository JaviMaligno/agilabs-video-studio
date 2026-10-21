// ToleranceBand: why one tolerance made the certificate "not evidence". Top: the five rings slide
// until they touch. Bottom: a schematic margin curve that comes down to touch zero at one point
// (φ, the golden point), and the boxes' checks along it: near the touch, a box's check dips just
// below zero. An ε band (drawn hugely exaggerated, and tagged so) swallows exactly that stretch, so
// those boxes flip to green; everywhere else the band changes nothing. Then a pull back to the
// whole region, all green, and the verdict card.
// Pure: no Remotion or React. Positions in stage pixels.
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export const W = 960;
export const H = 1090;

export type BandProps = {
  mode: 'mechanism' | 'verdict';
  blend?: boolean;
  cue?: Record<string, number>;
};

export const PAN = { cx: 480, cy: 205, R: 160 };
export const PLOT = { x0: 70, x1: 890, top: 440, zero: 650, unit: 190 };
/** ε band half-width in plot units: 1e-12 drawn ×10¹¹ = 0.1. */
export const BAND = 0.1;
export const NBOX = 12;
export const STRIP = { y: 800, h: 84 };
export const REGION = { x: 120, y: 330, w: 720, h: 480 };
export const RNX = 8;
export const RNY = 6;
/** The region cell holding φ. */
export const PHI_CELL = 3 * RNX + 4;

const phiX = (PLOT.x0 + PLOT.x1) / 2;
const half = (PLOT.x1 - PLOT.x0) / 2;
/** Schematic margin along one parameter: zero exactly at φ, positive elsewhere. */
export const margin = (x: number) => ((x - phiX) / half) ** 2;
/** Each box's check: its lowest margin, less the slack of checking a whole box at once. */
const SLACK = 0.08;
export const boxes = Array.from({ length: NBOX }, (_, j) => {
  const bw = (PLOT.x1 - PLOT.x0) / NBOX;
  const a = PLOT.x0 + j * bw;
  const b = a + bw;
  const nearest = phiX >= a && phiX <= b ? phiX : Math.abs(a - phiX) < Math.abs(b - phiX) ? a : b;
  const floor = margin(nearest) - SLACK;
  return { a, b, floor, below: floor < 0, inBand: floor >= -BAND };
});

const E = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const beat = (beats: number[], i: number, fallback: number) => {
  const b = beats[i];
  return b !== undefined && Number.isFinite(b) ? b : fallback;
};
const cueOf = (p: BandProps, k: string, fallback: number) => {
  const v = p.cue?.[k];
  return v !== undefined && Number.isFinite(v) ? v : fallback;
};

export type BandState = {
  pan: { appear: number; spread: number; glint: number };
  plot: { appear: number; draw: number };
  phi: { appear: number; glow: number };
  zeroTag: number;
  strip: { appear: number; boxes: { a: number; b: number; floor: number; green: number; red: number }[] };
  band: { grow: number; tag: number };
  harmless: number;
  pull: number;
  region: { appear: number; phiPulse: number; greenRun: number; note: number };
  verdict: null | { card: number; stamp: number; sub: number };
  tally: { value: number; appear: number; pulse: number };
};

export function frameState(p: BandProps, time: number, beats: number[], dur: number): BandState {
  const t = sceneTime(time, dur);
  const b0 = beat(beats, 0, 0);
  if (p.mode === 'verdict') {
    const stamp = cueOf(p, 'stamp', b0 + 2.0);
    return {
      pan: { appear: 0, spread: 1, glint: 0 },
      plot: { appear: 0, draw: 1 },
      phi: { appear: 0, glow: 0 },
      zeroTag: 0,
      strip: { appear: 0, boxes: [] },
      band: { grow: 0, tag: 0 },
      harmless: 0,
      pull: 1,
      region: { appear: 1, phiPulse: 0.5 + 0.5 * Math.sin(Math.min(t, 1e6) * 5), greenRun: 1 - E(t, 0, 0.3), note: 0 },
      verdict: { card: E(t, 0.1, 0.45), stamp: E(t, stamp, 0.3), sub: E(t, stamp + 0.6, 0.45) },
      tally: { value: t >= stamp + 0.1 ? 2 : 1, appear: 1, pulse: clamp01(Math.sin(Math.PI * progress(t, stamp + 0.1, 0.6))) },
    };
  }
  const b1 = beat(beats, 1, b0 + 3.4);
  const b2 = beat(beats, 2, b1 + 1.8);
  const b3 = beat(beats, 3, b2 + 3.6);
  const flip = cueOf(p, 'flip', b2 + 2.2);
  const pull = E(t, b3 + 0.05, 0.7);
  const red = E(t, b1 + 1.0, 0.4);
  const flipP = E(t, flip, 0.5);
  return {
    pan: { appear: E(t, 0, 0.4), spread: E(t, b0 + 0.2, 1.8), glint: E(t, cueOf(p, 'touch', b0 + 2.0), 0.3) },
    plot: { appear: E(t, b0 + 0.3, 0.5), draw: progress(t, b0 + 0.5, 1.2) },
    phi: { appear: E(t, cueOf(p, 'phi', b0 + 1.9), 0.4), glow: E(t, b1, 0.4) },
    zeroTag: E(t, cueOf(p, 'zero', b1 + 0.6), 0.35),
    strip: {
      appear: E(t, b1 + 0.8, 0.5),
      boxes: boxes.map((bx) => ({ a: bx.a, b: bx.b, floor: bx.floor, red: bx.below ? red * (1 - flipP) : 0, green: bx.below ? flipP : 1 })),
    },
    band: { grow: E(t, b2 + 0.25, 0.8), tag: E(t, b2 + 0.8, 0.4) },
    harmless: E(t, flip + 0.6, 0.4),
    pull,
    region: { appear: pull, phiPulse: 0.5 + 0.5 * Math.sin(Math.min(t, 1e6) * 5), greenRun: E(t, b3 + 0.6, 0.4), note: E(t, b3 + 1.1, 0.4) },
    verdict: null,
    tally: { value: 1, appear: 1, pulse: 0 },
  };
}
