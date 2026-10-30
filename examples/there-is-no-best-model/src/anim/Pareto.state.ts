// Pareto: the bespoke scenes of "There Is No Best Model, Only a Frontier". One component, one
// `mode` per scene. Each step eases in over STEP_LEN at a time taken from the narration beats
// (STEP_PLAN: which line, plus a delay into it); `at` overrides any step. Pure: no React/Remotion.
import { easeOutCubic, progress, sceneTime, stepTimes, STEP_SPACING } from './steps.ts';

export type ParetoMode = 'hook' | 'newmodels' | 'parcel' | 'dominated' | 'frontier' | 'reasoning' | 'receipt' | 'seconds' | 'decision';

export type ParetoProps = {
  mode: ParetoMode;
  /** Scene seconds for each step, overriding the plan derived from the narration beats. */
  at?: (number | undefined)[];
  /** Hook only: a concept title card shown from frame 0 (experimental cold-open cover). */
  cover?: boolean;
};

export type ParetoState = {
  mode: ParetoMode;
  /** Progress of each step, 0..1. */
  appear: number[];
  /** Linear progress of the mode's long move (robot stream, slider, receipt paper), 0..1. */
  progress: number;
  /** -1..1, slow idle oscillation. */
  wobble: number;
  /** Reasoning dial: -1 low, 0 default, 1 high. */
  dial: number;
  /** Scale beam angle in degrees; positive = the luna (right) pan goes down. */
  tilt: number;
  /** Position of the "you trade" slider along the frontier, 0 (cheapest) .. 1 (best). */
  slider: number;
};

/** For each step: [index of the narration line it fires on, seconds after that line starts]. */
export const STEP_PLAN: Record<ParetoMode, [number, number][]> = {
  // Steps: terra zooms in from the right, luna fades in on the left, 6/6 under both, terra leaves.
  // A newer model was faster, just as good… / and I didn't switch.
  hook: [[0, 0], [0, 0.5], [0, 1.6], [1, 0]],
  // Every few weeks… / every one claims to be the best. / you rarely get all three.
  newmodels: [[0, 0], [1, 0], [1, 1.6], [2, 0.5]],
  // Think of a delivery. (parcel) / Next-day is fast but expensive. Standard is slow but cheap. (axes, next-day, standard)
  parcel: [[0, 0], [1, 0], [1, 0.4], [1, 2.45]],
  // A courier that's slow AND expensive? / Nobody picks it. It's dominated.
  dominated: [[0, 0.2], [1, 0], [1, 0.8]],
  // The options nobody beats… / form the Pareto frontier. / Between them, no measurement decides. You trade.
  frontier: [[0, 0], [1, 0], [2, 0]],
  // In my case… / Less reasoning: 29% cheaper… Out. / More reasoning: 16% pricier, no better. Dominated.
  reasoning: [[0, 0], [1, 0], [1, 1.6], [2, 0], [2, 1.6]],
  // Most of each task's bill isn't the model. / It's the web searches.
  receipt: [[0, 0], [0, 1.0], [1, 0]],
  // Both pass the gate. / Are 27 seconds worth 2.2 cents? / That's about 3 dollars per hour of waiting.
  seconds: [[0, 0], [1, 0], [2, 0]],
  // Here, it wasn't. I stayed with the cheaper model.
  decision: [[0, 0.3], [0, 1.0]],
};

/** Steps per mode. */
export const STEPS: Record<ParetoMode, number> = Object.fromEntries(
  Object.entries(STEP_PLAN).map(([m, p]) => [m, p.length]),
) as Record<ParetoMode, number>;

/** Narration lines (beats) each mode is written for. */
export const BEATS: Record<ParetoMode, number> = {
  hook: 2, newmodels: 3, parcel: 2, dominated: 2, frontier: 3, reasoning: 3, receipt: 2, seconds: 3, decision: 1,
};

export const STEP_LEN = 0.7;
/** Long moves: [step that starts it, seconds]. */
export const MOVE: Partial<Record<ParetoMode, [number, number]>> = {
  newmodels: [0, 2.4],
  frontier: [2, 2.6],
  receipt: [0, 2.2],
};
export const TILT = 12;

/** Raw step times from the plan: line start + delay; a missing line falls back to the previous step + spacing. */
export function planTimes(mode: ParetoMode, beats: number[]): (number | undefined)[] {
  const out: number[] = [];
  let prev: number | null = null;
  for (const [idx, delay] of STEP_PLAN[mode]) {
    const b = beats[idx];
    const base = b !== undefined && Number.isFinite(b) ? b : idx === 0 ? 0 : null;
    const raw: number = base !== null ? base + delay : (prev ?? 0) + STEP_SPACING;
    out.push(raw);
    prev = raw;
  }
  return out;
}

/** Slider along the frontier: runs from the cheapest point to the best, then settles back mid-way. */
export function sliderAt(p: number): number {
  const x = Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 0;
  return x <= 0.6 ? easeOutCubic(x / 0.6) : 1 - 0.55 * easeOutCubic((x - 0.6) / 0.4);
}

export function frameState(props: ParetoProps, t: number, beats: number[], dur: number): ParetoState {
  const mode = props.mode;
  const plan = planTimes(mode, beats);
  const ats = plan.map((p, i) => props.at?.[i] ?? p);
  const times = stepTimes(ats.length, beats, ats, STEP_LEN, dur);
  const tt = sceneTime(t, dur);
  const appear = times.map((s) => easeOutCubic(progress(tt, s, STEP_LEN)));
  const move = MOVE[mode];
  const prog = move ? progress(tt, Math.min(times[move[0]] ?? 0, Math.max(0, dur - move[1])), move[1]) : appear[0] ?? 0;
  const wobble = Number.isFinite(t) ? Math.sin(t * 2.4) : 0;
  const a = (i: number) => appear[i] ?? 0;
  const dial = mode === 'reasoning' ? -a(1) + 2 * a(3) - a(4) : 0;
  const tilt = mode === 'seconds' ? 2.5 * wobble * a(1) * (1 - a(2) * 0.6) : mode === 'decision' ? TILT * a(0) : 0;
  const slider = mode === 'frontier' ? sliderAt(prog) : 0;
  return { mode, appear, progress: prog, wobble, dial, tilt, slider };
}

// ------------------------------------------------------------------ data (what the pictures claim)

export type Pt = { x: number; y: number };

/**
 * `a` dominates `b`: no worse on both axes and strictly better on one. `better` says, per axis,
 * whether a larger value is better.
 */
export function dominates(a: Pt, b: Pt, better: { x: 'low' | 'high'; y: 'low' | 'high' }): boolean {
  const ge = (u: number, v: number, dir: 'low' | 'high') => (dir === 'low' ? u <= v : u >= v);
  const gt = (u: number, v: number, dir: 'low' | 'high') => (dir === 'low' ? u < v : u > v);
  return ge(a.x, b.x, better.x) && ge(a.y, b.y, better.y) && (gt(a.x, b.x, better.x) || gt(a.y, b.y, better.y));
}

/**
 * Parcel plane, data units: x = cost (0..1, lower better), y = speed (0..1, higher better). Better is
 * up-left here, as on the model plane that follows (cost →, quality ↑), so the dominated region
 * sits down-right on both.
 */
export const VANS = {
  fast: { x: 0.8, y: 0.85, name: 'van-fast', price: '$25', label: 'next day' },
  snail: { x: 0.18, y: 0.3, name: 'van-snail', price: '$4', label: 'standard' },
  pricey: { x: 0.85, y: 0.14, name: 'van-slow-pricey', price: '$22', label: '' },
} as const;
export const VAN_BETTER = { x: 'low', y: 'high' } as const;

/** Model plane, as in the article's figure 1: x = cost per task (lower better), y = quality (higher better). */
export const MODELS: { x: number; y: number; label: string }[] = [
  { x: 0.08, y: 0.2, label: 'small' },
  { x: 0.3, y: 0.58, label: 'mid' },
  { x: 0.52, y: 0.75, label: 'large' },
  { x: 0.88, y: 0.82, label: 'flagship' },
  { x: 0.46, y: 0.36, label: '' },
  { x: 0.78, y: 0.55, label: '' },
];
export const MODEL_BETTER = { x: 'low', y: 'high' } as const;

export const isDominated = (p: Pt, all: readonly Pt[], better: { x: 'low' | 'high'; y: 'low' | 'high' }) =>
  all.some((q) => q !== p && dominates(q, p, better));

/** Frontier points sorted by cost. */
export const frontierOf = (all: readonly Pt[], better: { x: 'low' | 'high'; y: 'low' | 'high' }) =>
  all.filter((p) => !isDominated(p, all, better)).sort((a, b) => a.x - b.x);

/**
 * Staircase through frontier points (data units, y up = better): from the cheapest point
 * across to the next point's cost, then up to it, and so on. Vertices only, from first to last point.
 */
export function staircase(front: readonly Pt[]): Pt[] {
  const out: Pt[] = [];
  front.forEach((p, i) => {
    if (i > 0) out.push({ x: p.x, y: front[i - 1].y });
    out.push({ x: p.x, y: p.y });
  });
  return out;
}

/** The point at fraction f (0..1) of a polyline's length. */
export function pointAlong(poly: readonly Pt[], f: number): Pt {
  if (poly.length === 0) return { x: 0, y: 0 };
  const segs = poly.slice(1).map((p, i) => Math.hypot(p.x - poly[i].x, p.y - poly[i].y));
  const total = segs.reduce((s, l) => s + l, 0);
  let d = (Number.isFinite(f) ? Math.min(1, Math.max(0, f)) : 0) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const k = segs[i] > 0 ? Math.min(1, d / segs[i]) : 0;
      return { x: poly[i].x + (poly[i + 1].x - poly[i].x) * k, y: poly[i].y + (poly[i + 1].y - poly[i].y) * k };
    }
    d -= segs[i];
  }
  return poly[poly.length - 1];
}

/** Robot stream in "newmodels": which of cheap / fast / smart each robot lights. Never all three. */
export const STREAM: { name: string; lit: [boolean, boolean, boolean] }[] = [
  { name: 'robot-sky', lit: [true, true, false] },
  { name: 'robot-rose', lit: [false, true, true] },
  { name: 'robot-violet', lit: [true, false, true] },
  { name: 'robot-graphite', lit: [true, true, false] },
  { name: 'robot-amber', lit: [false, true, true] },
  { name: 'robot-teal', lit: [true, false, true] },
];

/** Arrival of robot i of n in the stream, from the stream progress. */
export const arrival = (p: number, i: number, n: number): number => {
  const span = 0.4;
  const gap = n > 1 ? (1 - span) / (n - 1) : 0;
  const x = (p - i * gap) / span;
  return Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0;
};

/** Reasoning sweep (article §11): cost relative to default, median time in seconds. */
export const REASONING = {
  low: { cost: -0.29, time: 38, label: '−29% · −16 s' },
  default: { cost: 0, time: 54, label: 'default' },
  high: { cost: 0.16, time: 54 * 1.2, label: '+16% · +20%' },
} as const;

/**
 * One classification with luna (article, "Measured per classification" table and "everything else"):
 * model $0.0039, 5.67 paid searches at $0.016, total $0.096; "other" is the remainder.
 */
export const RECEIPT = (() => {
  const total = 0.096;
  const model = 0.0039;
  const web = 5.67 * 0.016;
  return { total, model, web, other: total - model - web };
})();
