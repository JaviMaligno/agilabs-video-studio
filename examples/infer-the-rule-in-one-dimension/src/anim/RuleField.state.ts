// RuleField: the wall the model heals and the circle it never closes. Pure frame state (no
// Remotion, no React), so `node --test` can check it at any t. All times are scene seconds; every
// progress field is clamped to [0, 1] and every animation is fitted to finish by the scene end.
import { RULE_FIELD } from '../data/ruleField.ts';
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode = 'hook' | 'setup' | 'heal' | 'tally1' | 'plane' | 'tally2' | 'reduce' | 'interventions' | 'dose' | 'pin' | 'split';
export type RuleFieldProps = { mode: Mode };

// ---------------------------------------------------------------------------------------------
// Geometry (shared with the renderer)

/** Stage box (vertical cut), in stage pixels. */
export const W = 960;
export const H = 1090;

export type Box = { x: number; y: number; w: number; h: number };
export type Pt = { x: number; y: number };

/** World -> stage pixels: `c` (world) sits at the centre of `box`, `s` pixels per unit, y up. */
export const mapper = (box: Box, c: Pt, s: number) => ({
  X: (x: number) => box.x + box.w / 2 + (x - c.x) * s,
  Y: (y: number) => box.y + box.h / 2 - (y - c.y) * s,
  s,
});

/** The near disc of the plane, from the experiment's PatchField2D defaults. */
export const DISC = { x: RULE_FIELD.plane.p1[0], y: RULE_FIELD.plane.p1[1], R: RULE_FIELD.plane.R };
export const DISC2 = { x: RULE_FIELD.plane.p2[0], y: RULE_FIELD.plane.p2[1], R: RULE_FIELD.plane.R };

/** Contact landings inside the near disc (real, seed per dose arm), world coordinates. */
export const LANDINGS: Pt[][] = RULE_FIELD.doses.map((d) => d.landings.map(([x, y]) => ({ x, y })));
/** Algebraic least-squares circle per dose arm: [cx, cy, r]. */
export const FITS: [number, number, number][] = RULE_FIELD.doses.map((d) => [d.fit[0], d.fit[1], d.fit[2]]);
/** Arm totals (20 samples each) and the arcs the article plots. */
export const LSQ_TOTALS = [RULE_FIELD.lsq_totals.default, RULE_FIELD.lsq_totals.arc120, RULE_FIELD.lsq_totals.arc240];

/** Points of a circle arc from a0 to a1 (world degrees, counter-clockwise when a1 > a0). */
export const arcPoints = (c: Pt, r: number, a0: number, a1: number, step = 3): Pt[] => {
  const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / step));
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) });
  }
  return out;
};

// ---------------------------------------------------------------------------------------------
// Timing helpers

/** A spark: appears at `at`, flashes, then settles to a dim ember. */
const spark = (tt: number, at: number) => {
  if (tt < at) return { appear: 0, glow: 0 };
  const since = Math.min(tt - at, 60);
  return { appear: progress(tt, at, 0.08), glow: clamp01(0.3 + 0.7 * Math.exp(-since / 0.28)) };
};

/** Eased progress of an animation of `len` seconds wanted at `at`, fitted into the scene. */
const run = (tt: number, at: number, len: number, dur: number) => easeOutCubic(progress(tt, fit(at, len, dur), len));
/** A gentle pulse in [0, 1] on real scene time (clamped, so it stays finite and still at the end). */
const pulse = (t: number, dur: number, hz = 1.4) => {
  const s = Number.isFinite(dur) ? Math.min(Math.max(t, 0), Math.max(dur, 0)) : Math.max(t, 0);
  return 0.5 + 0.5 * Math.sin(s * hz * 2 * Math.PI);
};
/** Characters of `text` typed by `p` in [0, 1]. */
const typed = (text: string, p: number) => Math.round(clamp01(p) * text.length);

// ---------------------------------------------------------------------------------------------
// The code lines shown on screen (article snippet and real artifacts; see factcheck.md)

export const CODE = {
  cart: ['if x2 >= 8.0:', '    return [8.0, 0.0]'],
  reduce: ['if x >= 2.0:', '    return [x, y, 0.0, 0.0]'],
  radius: '# radius inferred from the provided transitions',
  spec: ['spec: stop inside', 'circle(centre=(3, 0), R=1.0)'],
} as const;

/** The eight interventions, labels from the article's table, stamps verbatim. */
export const FIXES = [
  { label: 'Region-first prompt, 3× budget', stamp: '0/40', kind: 'disc' },
  { label: 'Square, flat edges', stamp: '0/40', kind: 'square' },
  { label: 'Second model family', stamp: '0/3', kind: 'disc' },
  { label: 'Band in one coordinate', stamp: 'not counted', kind: 'band' },
  { label: 'Variable named', stamp: '0/40', kind: 'disc' },
  { label: 'Stops inside', stamp: '0/40', kind: 'disc' },
  { label: 'Clamped to boundary', stamp: '0/40', kind: 'disc' },
  { label: 'Wider coverage', stamp: '0/40', kind: 'disc' },
] as const;

export const ARCS_DEG = ['111°', '129°', '185°'] as const;

// ---------------------------------------------------------------------------------------------
// Frame states per mode

const HOOK_SPARKS = [-0.05, 0.3, 0.6, 0.9, 1.2];

const hook = (t: number, tt: number, beats: number[], dur: number) => {
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 3.5;
  const healAt = fit(b0 + 1.9, 1.3, dur);
  const heal = run(tt, healAt, 1.3, dur);
  const tryAt = fit(b1 + 0.05, 1.5, dur);
  const attempt = run(tt, tryAt, 1.1, dur);
  const broke = progress(tt, tryAt + 1.1, 0.4);
  return {
    mode: 'hook' as const,
    top: {
      sparks: HOOK_SPARKS.map((at) => spark(tt, at)),
      cartX: 7.25 + 0.75 * easeOutCubic(progress(tt, -0.2, 0.55)),
      heal,
      check: progress(tt, healAt + 1.3, 0.3),
    },
    bot: {
      sparks: LANDINGS[0].map((_, i) => spark(tt, -0.1 + i * 0.06)),
      idleAngle: 180 + 14 * Math.sin(Math.min(Math.max(t, 0), 60) * 2.6),
      attempt,
      broke,
      gap: broke * (0.45 + 0.55 * pulse(t, dur, 1.6)),
      cross: progress(tt, tryAt + 1.2, 0.3),
    },
  };
};

const setup = (tt: number, beats: number[], dur: number) => {
  const b0 = beatAt(beats, 0);
  return {
    mode: 'setup' as const,
    spec: progress(tt, 0, 0.3),
    strike: run(tt, b0 + 0.6, 0.5, dur),
    chips: [b0 + 0.2, b0 + 1.2, b0 + 2.2].map((at) => run(tt, at, 0.4, dur)),
    arrows: [b0 + 0.9, b0 + 1.9].map((at) => run(tt, at, 0.4, dur)),
    // The planner's cart slides toward a wall its model no longer has.
    cartX: 2 + 7.2 * easeOutCubic(progress(tt, b0 + 2.3, 1.6)),
    rail: progress(tt, 0, 0.3),
  };
};

const HEAL_SPARKS = [0.35, 0.65, 0.95, 1.25, 1.55];

const heal = (tt: number, beats: number[], dur: number) => {
  const b0 = beatAt(beats, 0);
  const healAt = b0 + 1.9;
  const code = run(tt, b0 + 2.1, 1.3, dur);
  return {
    mode: 'heal' as const,
    sparks: HEAL_SPARKS.map((d) => spark(tt, fit(b0 + d, 0.1, dur))),
    // The cart keeps knocking at the gap, one knock per spark.
    knock: HEAL_SPARKS.reduce((k, d) => k + (tt >= b0 + d ? 1 : 0), 0),
    heal: run(tt, healAt, 1.2, dur),
    glow: progress(tt, fit(healAt + 1.2, 0.3, dur), 0.3),
    code: [typed(CODE.cart[0], clamp01(code * 1.9)), typed(CODE.cart[1], clamp01(code * 1.9 - 0.9))],
    constant: progress(tt, fit(b0 + 3.0, 0.4, dur), 0.4),
  };
};

const tally1 = (tt: number, beats: number[], dur: number) => {
  const b0 = beatAt(beats, 0);
  // The count lands on 105 as "a hundred and five" is spoken (~1.1-1.9 s into the line).
  const show = run(tt, b0 - 0.2, 1.0, dur);
  const healP = run(tt, b0 + 0.1, 1.6, dur);
  return {
    mode: 'tally1' as const,
    shown: 111 * show,
    healed: 105 * healP,
    count: Math.round(105 * healP),
    total: progress(tt, fit(b0 + 0.2, 0.3, dur), 0.3),
    label: progress(tt, fit(b0 + 0.3, 0.4, dur), 0.4),
  };
};

const TRAILS = [
  { from: { x: 0.2, y: 3.4 }, to: { x: 9.8, y: 1.9 }, at: 2.6 },
  { from: { x: 0.4, y: -3.6 }, to: { x: 9.6, y: -2.0 }, at: 2.75 },
  // The one that enters the near disc and freezes at its edge.
  { from: { x: 0.3, y: 1.2 }, to: { x: 9.6, y: -0.6 }, at: 2.9, stopAt: 0.2 },
];

const plane = (tt: number, beats: number[], dur: number) => {
  const b0 = beatAt(beats, 0);
  return {
    mode: 'plane' as const,
    rail: progress(tt, 0, 0.3),
    tilt: run(tt, b0 + 1.2, 1.0, dur),
    discs: run(tt, b0 + 2.4, 0.5, dur),
    trails: TRAILS.map((tr) => run(tt, b0 + tr.at, tr.stopAt === undefined ? 1.6 : 0.5, dur)),
    freeze: progress(tt, fit(b0 + 2.9 + 0.5, 0.2, dur), 0.2),
    freezeSpark: spark(tt, fit(b0 + 3.4, 0.1, dur)),
  };
};

const tally2 = (tt: number, beats: number[], dur: number) => {
  const b0 = beatAt(beats, 0);
  return {
    mode: 'tally2' as const,
    shown: 156 * run(tt, b0, 1.7, dur),
    count: progress(tt, fit(b0 + 0.9, 0.3, dur), 0.3),
    label: progress(tt, fit(b0 + 0.3, 0.4, dur), 0.4),
  };
};

const reduce = (tt: number, beats: number[], dur: number) => {
  const b0 = beatAt(beats, 0);
  const code = run(tt, b0 + 1.0, 1.3, dur);
  return {
    mode: 'reduce' as const,
    sparks: LANDINGS[0].map((_, i) => spark(tt, fit(b0 - 0.2 + i * 0.035, 0.1, dur))),
    arc: run(tt, b0 + 0.5, 0.5, dur),
    line: run(tt, b0 + 1.0, 1.0, dur),
    arcFade: progress(tt, fit(b0 + 1.9, 0.4, dur), 0.4),
    shade: progress(tt, fit(b0 + 1.8, 0.5, dur), 0.5),
    code: [typed(CODE.reduce[0], clamp01(code * 1.9)), typed(CODE.reduce[1], clamp01(code * 1.9 - 0.9))],
    place: run(tt, b0 + 2.5, 0.35, dur),
    shape: run(tt, b0 + 3.35, 0.35, dur),
  };
};

const interventions = (tt: number, beats: number[], dur: number) => {
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 4.4;
  return {
    mode: 'interventions' as const,
    cards: FIXES.map((_, i) => run(tt, b0 + i * 0.42, 0.35, dur)),
    pens: FIXES.map((_, i) => run(tt, b0 + 0.25 + i * 0.42, 0.9, dur)),
    stamps: FIXES.map((_, i) => run(tt, b1 + 0.05 + i * 0.07, 0.25, dur)),
  };
};

const dose = (t: number, tt: number, beats: number[], dur: number) => {
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 4.9;
  // Three doses: wider arcs of contact; the third locks on "every time".
  const at = [b0 + 0.25, b0 + 1.7, b0 + 3.1];
  const steps = at.map((a) => progress(tt, fit(a, 0.5, dur), 0.5));
  const k = steps[2] > 0 ? 2 : steps[1] > 0 ? 1 : 0;
  return {
    mode: 'dose' as const,
    k,
    steps,
    sparks: LANDINGS.map((pts, d) => pts.map((_, i) => spark(tt, fit(at[d] + i * 0.03, 0.1, dur)))),
    ring: steps.map((s) => easeOutCubic(s)),
    lock: progress(tt, fit(b0 + 3.9, 0.4, dur), 0.4),
    wall: steps.map((_, d) => run(tt, at[d] + 0.3, 0.6, dur)),
    tickers: progress(tt, fit(b0 + 0.1, 0.3, dur), 0.3),
    model: progress(tt, fit(b1, 0.3, dur), 0.3) * (0.6 + 0.4 * pulse(t, dur, 1.2)),
  };
};

const pin = (tt: number, beats: number[], dur: number) => {
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 5;
  const lift = run(tt, b1 + 0.1, 0.6, dur);
  return {
    mode: 'pin' as const,
    sparks: LANDINGS[0].map((_, i) => spark(tt, -0.2 + i * 0.02)),
    drop: run(tt, b0 + 0.5, 0.5, dur),
    given: progress(tt, fit(b0 + 0.9, 0.3, dur), 0.3) * (1 - lift),
    ring: run(tt, b0 + 1.7, 1.5, dur),
    comment: progress(tt, fit(b0 + 2.6, 0.5, dur), 0.5) * (1 - lift),
    yes: run(tt, b0 + 3.4, 0.35, dur) * (1 - lift),
    lift,
    dissolve: run(tt, b1 + 0.3, 0.8, dur),
    shapeOnly: progress(tt, fit(b1 + 0.3, 0.3, dur), 0.3),
    no: run(tt, b1 + 1.2, 0.35, dur),
  };
};

const split = (tt: number, beats: number[], dur: number) => {
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 3.6;
  return {
    mode: 'split' as const,
    appear: progress(tt, 0, 0.35),
    phrase: run(tt, b0 + 1.7, 0.5, dur),
    card: run(tt, b1 + 0.4, 0.6, dur),
    spec: run(tt, b1 + 0.8, 0.9, dur),
    close: run(tt, b1 + 1.6, 1.0, dur),
  };
};

export type RuleFieldState =
  | ReturnType<typeof hook>
  | ReturnType<typeof setup>
  | ReturnType<typeof heal>
  | ReturnType<typeof tally1>
  | ReturnType<typeof plane>
  | ReturnType<typeof tally2>
  | ReturnType<typeof reduce>
  | ReturnType<typeof interventions>
  | ReturnType<typeof dose>
  | ReturnType<typeof pin>
  | ReturnType<typeof split>;

export function frameState(props: RuleFieldProps, t: number, beats: number[], dur: number): RuleFieldState {
  const tt = sceneTime(t, dur);
  switch (props.mode) {
    case 'hook':
      return hook(t, tt, beats, dur);
    case 'setup':
      return setup(tt, beats, dur);
    case 'heal':
      return heal(tt, beats, dur);
    case 'tally1':
      return tally1(tt, beats, dur);
    case 'plane':
      return plane(tt, beats, dur);
    case 'tally2':
      return tally2(tt, beats, dur);
    case 'reduce':
      return reduce(tt, beats, dur);
    case 'interventions':
      return interventions(tt, beats, dur);
    case 'dose':
      return dose(t, tt, beats, dur);
    case 'pin':
      return pin(tt, beats, dur);
    case 'split':
    default:
      return split(tt, beats, dur);
  }
}

export { TRAILS };
