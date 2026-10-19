// Shared geometry of the vortex scenes (VortexCore, SwarmToVortex): the integrated threads, the
// global camera/collapse keyframes and the projection. Pure: no Remotion or React.
//
// The threads come from the leading-order field of the article's figure script
// (scripts/extract-threads.py). The core is rescaled with tau, the time left: radius ~ tau^1/2,
// height ~ tau^(1/2 - h). As in the article's figure, h is exaggerated (H_EXAG) so the core visibly
// thins faster than it shortens; at the true h < 1/100 the two would look the same.
// The thread data (src/data/threads.json) is imported by the .tsx components and passed in, so
// this module and the states stay loadable by plain Node (timeline.ts imports them).
import { clamp01 } from './steps.ts';

export type P3 = [number, number, number];
export type Threads = { swirl: P3[][]; axial: P3[][] };

/** Animation components that draw this vortex and share its clock (see timeline.ts). */
export const VORTEX_FAMILY = ['VortexCore', 'SwarmToVortex'];

/** Exaggerated stretching exponent, the article figure's value (on purpose; see the factcheck). */
export const H_EXAG = 0.26;

/** What the camera and the collapse look like at one moment. */
export type Params = {
  /** Time left before the singularity, 1 = start. */
  tau: number;
  /** Camera elevation in degrees: 0 = side view, 90 = looking straight down the drain. */
  elev: number;
  /** 0 = threads straightened into calm streaks (fluid at rest), 1 = the integrated spiral. */
  coil: number;
  /** Thread brightness, 0..1. */
  glow: number;
  /** Spin rate multiplier (the angular speed is also ∝ 1/radius). 0 = still. */
  spin: number;
  /** Visibility of the axial outflow threads (violet), 0..1. */
  axial: number;
  /** Overall scale multiplier of the drawing. */
  zoom: number;
  /** Vertical offset of the vortex centre in the stage, px. */
  dy: number;
  /** Horizontal offset of the vortex centre in the stage, px. */
  dx: number;
};

export type Knot = Params & { T: number };

export const REST: Params = { tau: 1, elev: 62, coil: 0, glow: 0.35, spin: 0, axial: 0, zoom: 1, dy: 0, dx: 0 };

const KEYS = Object.keys(REST) as (keyof Params)[];
const fin = (x: number, d = 0) => (Number.isFinite(x) ? x : d);
const smooth = (p: number) => {
  const q = clamp01(p);
  return q * q * (3 - 2 * q);
};

/** Parameters at video second T: smooth interpolation between the knots (sorted by T). */
export function paramsAt(knots: Knot[] | undefined, T: number): Params {
  if (!knots || knots.length === 0) return { ...REST };
  const ks = sorted(knots);
  const t = fin(T);
  if (t <= ks[0].T) return pick(ks[0]);
  const last = ks[ks.length - 1];
  if (t >= last.T) return pick(last);
  let i = 0;
  while (i < ks.length - 2 && ks[i + 1].T <= t) i++;
  const a = ks[i];
  const b = ks[i + 1];
  const p = b.T > a.T ? smooth((t - a.T) / (b.T - a.T)) : 1;
  const out = {} as Params;
  for (const k of KEYS) out[k] = fin(a[k]) + (fin(b[k]) - fin(a[k])) * p;
  return out;
}

const pick = (k: Knot): Params => {
  const out = {} as Params;
  for (const key of KEYS) out[key] = fin(k[key], REST[key]);
  return out;
};

const sortCache = new WeakMap<Knot[], Knot[]>();
const sorted = (knots: Knot[]): Knot[] => {
  let s = sortCache.get(knots);
  if (!s) {
    s = [...knots].filter((k) => Number.isFinite(k.T)).sort((a, b) => a.T - b.T);
    if (s.length === 0) s = [{ ...REST, T: 0 }];
    sortCache.set(knots, s);
  }
  return s;
};

export const radiusScale = (tau: number) => Math.sqrt(Math.max(1e-4, fin(tau, 1)));
export const heightScale = (tau: number) => Math.max(1e-4, fin(tau, 1)) ** (0.5 - H_EXAG);

/** Base angular speed (radians per second at radius scale 1 and spin 1). */
export const OMEGA = 0.9;
/** Seconds per step of the angle integral. */
const DT = 1 / 60;

const angleCache = new WeakMap<Knot[], number[]>();
/**
 * Spin angle at video second T: the integral of spin · OMEGA / radius, so the vortex speeds up as
 * the core shrinks and the angle is the same function of T in every scene (no jump between them).
 */
export function angleAt(knots: Knot[] | undefined, T: number): number {
  const t = Math.max(0, Math.min(600, fin(T)));
  const omega = (x: number) => {
    const p = paramsAt(knots, x);
    return (p.spin * OMEGA) / radiusScale(p.tau);
  };
  if (!knots || knots.length === 0) return omega(0) * t;
  let table = angleCache.get(knots);
  const need = Math.ceil(t / DT) + 1;
  if (!table) {
    table = [0];
    angleCache.set(knots, table);
  }
  while (table.length <= need) {
    const i = table.length - 1;
    table.push(table[i] + omega((i + 0.5) * DT) * DT);
  }
  const f = t / DT;
  const i = Math.floor(f);
  return table[i] + (table[i + 1] - table[i]) * (f - i);
}

export type Camera = { cx: number; cy: number; scale: number; elev: number; angle: number; tau: number };

/** Projects a vortex point (outer radius 1) to stage pixels; `depth` > 0 is towards the viewer. */
export function project(p: P3, cam: Camera): { x: number; y: number; depth: number } {
  const lr = radiusScale(cam.tau);
  const lz = heightScale(cam.tau);
  const c = Math.cos(cam.angle);
  const s = Math.sin(cam.angle);
  const x1 = (p[0] * c - p[1] * s) * lr;
  const y1 = (p[0] * s + p[1] * c) * lr;
  const z = p[2] * lz;
  const e = (fin(cam.elev) * Math.PI) / 180;
  const sy = y1 * Math.sin(e) - z * Math.cos(e);
  const depth = y1 * Math.cos(e) + z * Math.sin(e);
  return { x: cam.cx + x1 * cam.scale, y: cam.cy + sy * cam.scale, depth };
}

/** Unwrapped polar angle along a thread, so uncoiling follows the real number of turns. */
export function unwrapped(thread: P3[]): number[] {
  const out: number[] = [];
  let prev = Math.atan2(thread[0]?.[1] ?? 0, thread[0]?.[0] ?? 1);
  let acc = prev;
  for (const p of thread) {
    const a = Math.atan2(p[1], p[0]);
    let d = a - prev;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    acc += d;
    prev = a;
    out.push(acc);
  }
  return out;
}

const unwrapCache = new WeakMap<P3[], number[]>();
/** Thread point i after uncoiling, using the unwrapped angle (coil 0: straight radial streak). */
export function threadPoint(thread: P3[], i: number, coil: number): P3 {
  const p = thread[i];
  if (coil >= 1) return p;
  let u = unwrapCache.get(thread);
  if (!u) {
    u = unwrapped(thread);
    unwrapCache.set(thread, u);
  }
  const r = Math.hypot(p[0], p[1]);
  const a = u[0] + (u[i] - u[0]) * clamp01(coil);
  return [r * Math.cos(a), r * Math.sin(a), p[2]];
}
