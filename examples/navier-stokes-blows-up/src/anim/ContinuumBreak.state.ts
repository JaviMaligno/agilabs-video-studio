// Pure state of the ContinuumBreak scene, in four beats:
//  0. the vortex core narrows under a fixed scale bar, "mean free path of air molecules";
//  1. zoom into the core: its smooth threads break into particles that stop following the flow
//     and bounce about (the fluid stops being a fluid);
//  2. pull back: a thin ring marks where the threads end and the particles begin;
//  3. three usage icons (wing, cloud, artery) sit calmly outside the ring.
// Illustrative: sizes, spacing and the zoom are not to scale. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type ContinuumProps = Record<string, never>;

/** Scale bar length (px) and the core's start / end width before the zoom. */
export const BAR = 210;
export const CORE = { from: 560, to: 70 } as const;
export const ZOOM = 10;
export const PARTICLES = 320;
export const STRANDS = 14;
/** Radius of the particle disc (and the continuum ring) after the pull-back, px. */
export const DISC = 150;

const beatOr = (beats: number[], i: number, d: number): number => {
  const b = beats[i];
  return b !== undefined && Number.isFinite(b) ? b : d;
};
const fin = (x: number, d = 0) => (Number.isFinite(x) ? x : d);
const inOut = (p: number) => {
  const q = clamp01(p);
  return q < 0.5 ? 4 * q * q * q : 1 - (-2 * q + 2) ** 3 / 2;
};

export type ContinuumState = {
  /** Core width before the zoom, px. */
  width: number;
  /** Zoom factor applied to the core and the bar. */
  zoom: number;
  bar: { opacity: number; under: number };
  /** Smooth threads (strands) vs particles. */
  strands: { opacity: number };
  particles: { opacity: number; bounce: number };
  /** Pull-back to the ring, 0..1. */
  pull: number;
  ring: { opacity: number };
  outer: { opacity: number };
  icons: { opacity: number }[];
  /** Running time for the motion. */
  time: number;
};

export function frameState(_props: ContinuumProps, t: number, beats: number[], dur: number): ContinuumState {
  const st = sceneTime(fin(t), dur);
  const b0 = beatAt(beats, 0);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 12;
  const b1 = beatOr(beats, 1, b0 + d * 0.35);
  const b2 = beatOr(beats, 2, b1 + d * 0.25);
  const b3 = beatOr(beats, 3, b2 + d * 0.15);
  const narrow = inOut(progress(st, b0 + 0.5, Math.max(0.5, b1 - b0 - 1.0)));
  const zoomP = inOut(progress(st, b1 - 0.1, 1.0));
  const pull = inOut(progress(st, b2, 1.1));
  return {
    width: CORE.from + (CORE.to - CORE.from) * narrow,
    zoom: 1 + (ZOOM - 1) * zoomP,
    bar: { opacity: clamp01(Math.min(progress(st, b0 + 0.6, 0.4), 1 - zoomP * 1.4)), under: progress(st, b0 + 0.5 + Math.max(0.5, b1 - b0 - 1.0) * 0.75, 0.4) },
    strands: { opacity: 1 - progress(st, b1 + 0.3, 0.8) },
    particles: { opacity: progress(st, b1 + 0.2, 0.6), bounce: easeOutCubic(progress(st, b1 + 0.8, 1.2)) },
    pull,
    ring: { opacity: progress(st, b2 + 0.6, 0.5) },
    outer: { opacity: progress(st, b2 + 0.3, 0.9) },
    icons: [0, 1, 2].map((i) => ({ opacity: progress(st, b3 + 0.3 + i * 0.4, 0.5) })),
    time: Math.max(0, Math.min(fin(t), d)),
  };
}

export const rnd = (i: number, k: number): number => {
  const x = Math.sin(i * 91.7 + k * 271.3) * 43758.5453;
  return x - Math.floor(x);
};

/** Triangle wave in [-1, 1]: a particle bouncing between two walls. */
export const bounce1 = (x: number): number => {
  const m = (((x + 1) % 4) + 4) % 4;
  return m < 2 ? m - 1 : 3 - m;
};

/** x of strand k at height y (px from the core's top), core width wd, time tm. */
export const strandX = (k: number, y: number, wd: number, tm: number): { x: number; depth: number } => {
  const ph = (k / STRANDS) * 2 * Math.PI + y * ((2 * Math.PI) / Math.max(40, wd * 1.7)) + tm * 2.6;
  return { x: (wd / 2) * Math.sin(ph), depth: Math.cos(ph) };
};

/**
 * Particle i, relative to the core centre: following its strand (bounce 0) or bouncing freely
 * (bounce 1) inside a box of half sizes hw x hh, which the pull-back turns into a disc.
 */
export function particleAt(i: number, tm: number, hw: number, hh: number, wd: number, bounce: number, disc: number): { x: number; y: number } {
  const k = i % STRANDS;
  const y0 = rnd(i, 1) * 2 - 1;
  const yFlow = bounce1(y0 + tm * 0.12) * hh;
  const sx = strandX(k, yFlow + hh, wd, tm).x;
  const bu = bounce1(rnd(i, 2) * 2 - 1 + tm * (0.5 + rnd(i, 3)) * (rnd(i, 4) > 0.5 ? 1 : -1));
  const bv = bounce1(y0 + tm * (0.5 + rnd(i, 5)) * (rnd(i, 6) > 0.5 ? 1 : -1));
  let u = sx / Math.max(1, hw) + (bu - sx / Math.max(1, hw)) * bounce;
  let v = yFlow / Math.max(1, hh) + (bv - yFlow / Math.max(1, hh)) * bounce;
  u = Math.max(-1, Math.min(1, u));
  v = Math.max(-1, Math.min(1, v));
  // Square -> disc, by `disc`.
  const du = u * Math.sqrt(Math.max(0, 1 - (v * v) / 2));
  const dv = v * Math.sqrt(Math.max(0, 1 - (u * u) / 2));
  return { x: (u + (du - u) * disc) * hw, y: (v + (dv - v) * disc) * hh };
}
