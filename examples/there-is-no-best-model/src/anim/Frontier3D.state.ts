// Frontier3D: the 3D cost x latency x quality cloud of "There Is No Best Model". One component, one
// `mode` per scene:
// - orbit (2 lines): the camera orbits slowly; beat 0 the points pop in grey, beat 1 every
//   non-dominated point turns teal (almost all of them), the dominated I and J stay grey.
// - gate (2 lines): beat 0 a translucent quality floor rises to 80 while the camera dips toward the
//   floor's edge (so points above and below it separate on screen); beat 1 A and B (below it) turn
//   red with a cross and drop out; once they are gone (or on a beat 2, if there is one) the camera
//   tilts to a top view (looking down the quality axis), so the scene becomes the flat cost x
//   latency plane, and the 2D frontier C-E-K is drawn as a staircase. The gate scene opens on the
//   camera the orbit scene ends on.
// Pure numbers: no Remotion or React, so `node --test` can check it.
import { clamp01, easeOutCubic, fit, progress, sceneTime, stepTimes } from './steps.ts';

export type FrontierMode = 'orbit' | 'gate';

export type FrontierProps = {
  mode: FrontierMode;
  /** Scene seconds for each step, overriding the narration beats. */
  at?: (number | undefined)[];
};

/** An illustrative model: cost in $ per task, latency in seconds, quality in %. */
export type Model = { name: string; cost: number; latency: number; quality: number };

export const MODELS: Model[] = [
  { name: 'A', cost: 0.02, latency: 20, quality: 62 },
  { name: 'B', cost: 0.03, latency: 45, quality: 76 },
  { name: 'C', cost: 0.05, latency: 32, quality: 84 },
  { name: 'D', cost: 0.06, latency: 70, quality: 88 },
  { name: 'E', cost: 0.09, latency: 24, quality: 86 },
  { name: 'F', cost: 0.1, latency: 58, quality: 93 },
  { name: 'G', cost: 0.15, latency: 36, quality: 92 },
  { name: 'H', cost: 0.25, latency: 50, quality: 96 },
  { name: 'I', cost: 0.13, latency: 80, quality: 85 },
  { name: 'J', cost: 0.3, latency: 88, quality: 94 },
  { name: 'K', cost: 0.045, latency: 85, quality: 81 },
];

export const QUALITY_FLOOR = 80;

/** Axis ranges mapped onto the box [-1, 1]^3. */
export const RANGE = {
  cost: [0, 0.32],
  latency: [10, 95],
  quality: [55, 100],
} as const;

const norm = (v: number, [lo, hi]: readonly [number, number]) => ((v - lo) / (hi - lo)) * 2 - 1;

/** World coordinates: x = cost (right), y = quality (up), z = latency (away from the viewer). */
export const toWorld = (cost: number, latency: number, quality: number): [number, number, number] => [
  norm(cost, RANGE.cost),
  norm(quality, RANGE.quality),
  norm(latency, RANGE.latency),
];

/** `a` dominates `b`: no worse on every axis given, strictly better on one. */
const dominates = (a: Model, b: Model, axes: ('cost' | 'latency' | 'quality')[]) => {
  let strict = false;
  for (const ax of axes) {
    const better = ax === 'quality' ? a[ax] - b[ax] : b[ax] - a[ax];
    if (better < 0) return false;
    if (better > 0) strict = true;
  }
  return strict;
};

/** Names of the non-dominated models among `models` on `axes`. */
export const paretoSet = (models: Model[], axes: ('cost' | 'latency' | 'quality')[]): string[] =>
  models.filter((m) => !models.some((o) => o !== m && dominates(o, m, axes))).map((m) => m.name);

/** Non-dominated on three axes among all models, before any floor: everything but I and J. */
export const ORBIT_TEAL = new Set(paretoSet(MODELS, ['cost', 'latency', 'quality']));
export const FEASIBLE = MODELS.filter((m) => m.quality >= QUALITY_FLOOR);
/** Non-dominated on three axes among the models that pass the floor: C D E F G H K. */
export const FRONTIER_3D = new Set(paretoSet(FEASIBLE, ['cost', 'latency', 'quality']));
/** With quality as a gate, the cost x latency frontier among the feasible: C E K. */
export const FRONTIER_2D = new Set(paretoSet(FEASIBLE, ['cost', 'latency']));

/** The 2D frontier as a staircase in (cost, latency), from the top edge of the box to its right edge. */
export const staircase = (): [number, number][] => {
  const f = FEASIBLE.filter((m) => FRONTIER_2D.has(m.name)).sort((a, b) => a.cost - b.cost);
  if (!f.length) return [];
  const pts: [number, number][] = [[f[0].cost, RANGE.latency[1]]];
  f.forEach((m, i) => {
    if (i > 0) pts.push([m.cost, f[i - 1].latency]);
    pts.push([m.cost, m.latency]);
  });
  pts.push([RANGE.cost[1], f[f.length - 1].latency]);
  return pts;
};

// ------------------------------------------------------------------ camera

/** Orbit: yaw runs from ORBIT_YAW[0] to ORBIT_YAW[1] over the scene, at a fixed pitch. */
export const ORBIT_YAW = [58, 30] as const;
export const ORBIT_PITCH = 24;
/** Top view: yaw 0, looking straight down the quality axis. */
export const TOP = { yaw: 0, pitch: 90 } as const;
/** Box half-size in board pixels at zoom 1, and the camera distance in box units. */
export const BOX_PX = 250;
export const CAM_DIST = 6;

export type Camera = { yaw: number; pitch: number; zoom: number; /** 0 = perspective, 1 = orthographic. */ ortho: number };

export type Projected = { x: number; y: number; depth: number; scale: number };

/**
 * Projects a world point onto the board, around (cx, cy). Yaw turns the cloud about the quality
 * axis; pitch raises the camera (90 = straight down, cost right and latency up the screen). Larger
 * `depth` is farther from the camera; `scale` is the perspective factor.
 */
export const project = ([x, y, z]: [number, number, number], cam: Camera, cx: number, cy: number): Projected => {
  const yaw = (cam.yaw * Math.PI) / 180;
  const pitch = (cam.pitch * Math.PI) / 180;
  const x1 = x * Math.cos(yaw) - z * Math.sin(yaw);
  const z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
  const up = y * Math.cos(pitch) + z1 * Math.sin(pitch);
  const depth = z1 * Math.cos(pitch) - y * Math.sin(pitch);
  const invD = (1 - clamp01(cam.ortho)) / CAM_DIST;
  const scale = 1 / Math.max(0.2, 1 + depth * invD);
  const px = BOX_PX * cam.zoom * scale;
  return { x: cx + x1 * px, y: cy - up * px, depth, scale };
};

// ------------------------------------------------------------------ state

export type PointState = {
  name: string;
  world: [number, number, number];
  /** Pop-in, 0..1. */
  appear: number;
  /** Grey -> teal, 0..1. */
  teal: number;
  /** -> red with a cross, 0..1. */
  red: number;
  /** Falling out of the box and fading, 0..1. */
  drop: number;
};

export type FrontierState = {
  mode: FrontierMode;
  camera: Camera;
  /** Height of the quality floor, in quality %. */
  floor: number;
  /** Quality floor plane: visibility, 0..1. */
  opacity: number;
  /** Camera tilt to the top view, 0..1. */
  tilt: number;
  /** The 2D staircase, 0..1. */
  draw: number;
  points: PointState[];
};

export const STEPS: Record<FrontierMode, number> = { orbit: 2, gate: 3 };
export const STEP_LEN = 0.7;
const POP_LEN = 0.5;
const POP_STAGGER = 0.07;
const TEAL_LEN = 0.6;
const TEAL_STAGGER = 0.04;
const RISE_LEN = 1.4;
const RED_LEN = 0.45;
const DROP_DELAY = 0.55;
const DROP_LEN = 0.9;
const TILT_LEN = 1.8;
const DRAW_LEN = 1.0;
/** Degrees the camera pitch dips while the floor rises, to show the floor nearly edge-on. */
export const RISE_DIP = 12;

const ease = (p: number) => {
  const c = clamp01(p);
  return c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2;
};

/** The camera the orbit scene ends on, which is the one the gate scene starts on. */
export const ORBIT_END: Camera = { yaw: ORBIT_YAW[1], pitch: ORBIT_PITCH, zoom: 1, ortho: 0 };

export function frameState(props: FrontierProps, t: number, beats: number[], dur: number): FrontierState {
  const mode: FrontierMode = props.mode === 'gate' ? 'gate' : 'orbit';
  const ats = [...(props.at ?? [])];
  // Gate with no third beat: tilt once A and B have dropped out.
  if (mode === 'gate' && ats[2] === undefined && !Number.isFinite(beats[2]) && Number.isFinite(beats[1])) {
    ats[2] = (ats[1] ?? beats[1]) + DROP_DELAY + DROP_LEN * 0.8;
  }
  const times = stepTimes(STEPS[mode], beats, ats, STEP_LEN, dur);
  const tt = sceneTime(t, dur);
  const n = MODELS.length;

  if (mode === 'orbit') {
    const popAt = fit(times[0], POP_LEN + POP_STAGGER * (n - 1), dur);
    const tealAt = fit(times[1], TEAL_LEN + TEAL_STAGGER * (n - 1), dur);
    const orbit = Number.isFinite(dur) && dur > 0 ? clamp01(tt / dur) : 1;
    const camera: Camera = { yaw: ORBIT_YAW[0] + (ORBIT_YAW[1] - ORBIT_YAW[0]) * orbit, pitch: ORBIT_PITCH, zoom: 1, ortho: 0 };
    const points = MODELS.map((m, i) => ({
      name: m.name,
      world: toWorld(m.cost, m.latency, m.quality),
      appear: easeOutCubic(progress(tt, popAt + i * POP_STAGGER, POP_LEN)),
      // With three axes, every non-dominated point survives: all but I and J.
      teal: ORBIT_TEAL.has(m.name) ? easeOutCubic(progress(tt, tealAt + i * TEAL_STAGGER, TEAL_LEN)) : 0,
      red: 0,
      drop: 0,
    }));
    return { mode, camera, floor: RANGE.quality[0], opacity: 0, tilt: 0, draw: 0, points };
  }

  const riseAt = fit(times[0], RISE_LEN, dur);
  const redAt = fit(times[1], DROP_DELAY + DROP_LEN, dur);
  const tiltAt = fit(times[2], TILT_LEN + DRAW_LEN * 0.6, dur);
  const drawAt = fit(tiltAt + TILT_LEN * 0.75, DRAW_LEN, dur);
  const rise = ease(progress(tt, riseAt, RISE_LEN));
  const tilt = ease(progress(tt, tiltAt, TILT_LEN));
  const red = easeOutCubic(progress(tt, redAt, RED_LEN));
  const drop = ease(progress(tt, redAt + DROP_DELAY, DROP_LEN));
  const pitch0 = ORBIT_END.pitch - RISE_DIP * rise;
  const camera: Camera = {
    yaw: ORBIT_END.yaw + (TOP.yaw - ORBIT_END.yaw) * tilt,
    pitch: pitch0 + (TOP.pitch - pitch0) * tilt,
    zoom: 1 + 0.32 * tilt,
    ortho: tilt,
  };
  const points = MODELS.map((m) => {
    const below = m.quality < QUALITY_FLOOR;
    // Starts as the orbit ends: the three-axis survivors teal (I and J grey). In the top view only
    // the cost x latency frontier keeps its teal.
    const tealStart = ORBIT_TEAL.has(m.name) ? 1 : 0;
    const tealEnd = FRONTIER_2D.has(m.name) ? 1 : 0;
    return {
      name: m.name,
      world: toWorld(m.cost, m.latency, m.quality),
      appear: 1,
      teal: below ? tealStart * (1 - red) : tealStart + (tealEnd - tealStart) * tilt,
      red: below ? red : 0,
      drop: below ? drop : 0,
    };
  });
  return {
    mode,
    camera,
    floor: RANGE.quality[0] + (QUALITY_FLOOR - RANGE.quality[0]) * rise,
    opacity: Math.min(clamp01(rise * 3), 1 - tilt),
    tilt,
    draw: easeOutCubic(progress(tt, drawAt, DRAW_LEN)),
    points,
  };
}
