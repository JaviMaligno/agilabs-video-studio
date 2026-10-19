// Pure state of the ReachMap scenes: one top-down map (robot, gold star, rose ring drawn to scale)
// where everything the robot can reach is lit. The model's mistakes sit on top as overlays.
// Paths, glow and timings are illustrative, chosen for impact; the only data are the ring's radii
// and the costs on the meter, which come from the articles. No Remotion or React here.
import type { Label } from '../types.ts';
import { beatAt, clamp01, fit, progress, sceneTime } from './steps.ts';
import { along, charges, easeInOut, lerp, meterState, sparksOf, type Key, type MeterSpec } from './motion.ts';

export type Mode = 'hook' | 'setup' | 'gauge' | 'twin' | 'blind' | 'doorFront' | 'doorBack' | 'split' | 'zoomOut';

export type ReachProps = {
  mode: Mode;
  /** Corner label naming the model on screen. */
  chip?: Label;
  /** The chip's text differs from the previous (blended) scene: hold it back until the blend is
   *  over so the two labels never cross-fade on top of each other. */
  chipIn?: boolean;
  meter?: MeterSpec;
  /** Door (angular gap in the ring), in radians, opening from `from` to `to` on beat `beat`. */
  gap?: { from: number; to: number; beat?: number; delay?: number };
  /** zoomOut: a new goal appears and the reach stretches toward it. */
  newGoal?: boolean;
};

/** The instrument, to scale: inner radius 3.5, outer radius 5.0, the high-value spot at the centre. */
export const RING = { inner: 3.5, outer: 5.0 } as const;
export const ROBOT_R = 0.2;
export const START = { x: -7.6, y: 0 } as const;
/** Robot centre on contact with the outer rim, along the straight route. */
export const CONTACT_X = -RING.outer - ROBOT_R;
/** Reach glow radius (world units) once it has flooded the map. */
export const GLOW_FULL = 13;
export const GLOW_ZOOM = 8.5;

export type View = { x0: number; x1: number; y0: number; y1: number };
export const VIEW: View = { x0: -8.7, x1: 5.9, y0: -5.75, y1: 5.75 };
/** zoomOut: the larger map around the same ring. */
export const VIEW_ZOOM: View = { x0: -17, x1: 13, y0: -12.8, y1: 10.8 };

/** Other places the model is wrong (zoomOut). `hot`: inside the reach from the start. */
export const PATCHES = [
  { x: -12.6, y: -5.2, r: 1.1, hot: true },
  { x: -4.2, y: 6.3, r: 1.15, hot: true },
  { x: 8.0, y: 6.2, r: 1.3, hot: false },
  { x: -15.2, y: 7.8, r: 1.0, hot: false },
  { x: 9.6, y: -5.6, r: 1.2, hot: false },
  // Unvisited until the new goal: the reach stretching toward it swallows this one.
  { x: -0.4, y: -8.4, r: 1.15, hot: false, swallowed: true },
] as const;
export const GOAL2 = { x: 2, y: -11.2 } as const;
/** Fraction of the way to GOAL2 at which the swallowed patch sits. */
const SWALLOW_AT = 0.75;

export type Robot = { x: number; y: number; opacity: number; kind: 'truth' | 'model'; trailX: number; trailY: number; trail: number; label: number };
export type Spark = { x: number; y: number; pop: number };
export type Patch = { x: number; y: number; r: number; opacity: number; heat: number };

export type World = {
  view: View;
  ring: { opacity: number; gap: number; angle: number };
  glow: { radius: number; opacity: number; holeLit: number; pulse: number };
  star: { opacity: number };
  disc: { opacity: number };
  wrong: { opacity: number; sweep: number };
  ticks: { opacity: number; flash: number };
  promised: { draw: number };
  rays: { x0: number; y0: number; x1: number; y1: number; draw: number }[];
  never: { opacity: number; breathe: number };
  robots: Robot[];
  sparks: Spark[];
  ghost: { opacity: number };
  gapLabel: { opacity: number; text: string; x: number; y: number };
  patches: Patch[];
  goal2: { opacity: number };
  lobe: { draw: number };
  cut: { opacity: number };
};

const base = (): World => ({
  view: VIEW,
  ring: { opacity: 1, gap: 0, angle: Math.PI },
  glow: { radius: GLOW_FULL, opacity: 1, holeLit: 0, pulse: 0 },
  star: { opacity: 1 },
  disc: { opacity: 0 },
  wrong: { opacity: 0, sweep: 0 },
  ticks: { opacity: 0, flash: 0 },
  promised: { draw: 0 },
  rays: [],
  never: { opacity: 0, breathe: 0 },
  robots: [],
  sparks: [],
  ghost: { opacity: 0 },
  gapLabel: { opacity: 0, text: '', x: 0, y: 0 },
  patches: [],
  goal2: { opacity: 0 },
  lobe: { draw: 0 },
  cut: { opacity: 0 },
});

const robotOn = (keys: Key[], T: number, kind: Robot['kind'] = 'truth', label = 0): Robot => {
  const [x, y] = along(keys, T);
  const s = keys[0]?.p ?? [START.x, START.y];
  const moving = keys.length > 1 && T > keys[0].t ? 1 : 0;
  return { x, y, opacity: 1, kind, trailX: s[0], trailY: s[1], trail: moving * 0.9, label };
};

const sparks = (keys: Key[], T: number): Spark[] =>
  sparksOf(keys, T).map((s) => ({ x: s.at[0] + ROBOT_R, y: s.at[1], pop: s.pop }));

const still = (x: number = START.x, y: number = START.y): Key[] => [{ t: 0, p: [x, y] }];

/** Where the door's label sits: just outside the gap, a little above it, kept inside the view. */
const gapLabelAt = (angle: number): { x: number; y: number } =>
  // Clear of the rim on either side (the right side has less room before the frame edge).
  Math.cos(angle) < 0 ? { x: -6.3, y: -2.4 } : { x: 4.9, y: -3.4 };

const fmtGap = (g: number, rad: boolean) => `γ = ${(Math.round(g * 10) / 10).toFixed(1)}${rad ? ' rad' : ''}`;

/** Gap ring path (world units, centred on the star): annulus minus a wedge of `gap` radians at `angle`. */
export function annulusPath(ri: number, ro: number, angle: number, gap: number): string {
  const f = (v: number) => +v.toFixed(4);
  if (!(gap > 1e-4)) {
    return `M ${ro} 0 A ${ro} ${ro} 0 1 1 ${-ro} 0 A ${ro} ${ro} 0 1 1 ${ro} 0 Z M ${ri} 0 A ${ri} ${ri} 0 1 1 ${-ri} 0 A ${ri} ${ri} 0 1 1 ${ri} 0 Z`;
  }
  const a0 = angle + gap / 2;
  const a1 = angle + 2 * Math.PI - gap / 2;
  const P = (r: number, a: number) => `${f(r * Math.cos(a))} ${f(r * Math.sin(a))}`;
  return `M ${P(ro, a0)} A ${ro} ${ro} 0 1 1 ${P(ro, a1)} L ${P(ri, a1)} A ${ri} ${ri} 0 1 0 ${P(ri, a0)} Z`;
}

/** The world of one map mode at scene time T. */
function world(p: ReachProps, T: number, beats: number[], d: number): World {
  const w = base();
  const b0 = beatAt(beats, 0);
  const b1 = beatAt(beats, 1);
  const gapSpec = p.gap ?? { from: 0, to: 0 };
  const gapP = easeInOut(progress(T, fit(beatAt(beats, gapSpec.beat ?? 0) + (gapSpec.delay ?? 0), 0.9, d), 0.9));
  const gapNow = lerp(gapSpec.from, gapSpec.to, gapP);

  switch (p.mode) {
    case 'hook': {
      // Strong first frame: the model's filled disc is already over the ring, labelled.
      w.disc.opacity = 1;
      w.ticks.opacity = progress(T, fit(b1, 0.4, d), 0.3);
      w.ticks.flash = progress(T, fit(b1, 1.1, d), 1.1);
      w.robots = [robotOn(still(), T)];
      break;
    }
    case 'setup': {
      w.glow.radius = lerp(0.6, GLOW_FULL, easeInOut(progress(T, fit(0.15, 2.4, d), 2.4)));
      const t0 = fit(b0 + 0.35, 1.5, d);
      const keys: Key[] = [
        { t: t0, p: [START.x, 0] },
        { t: t0 + 1.4, p: [CONTACT_X, 0], hit: true },
      ];
      w.robots = [robotOn(keys, T)];
      w.sparks = sparks(keys, T);
      break;
    }
    case 'gauge': {
      w.disc.opacity = easeInOut(progress(T, fit(b0, 0.5, d), 0.5));
      // Sample rollouts from every side; each stops on the rim.
      const angles = [160, 200, 135, 225, 110, 250, 85, 275, 180];
      w.rays = angles.map((deg, i) => {
        const a = (deg * Math.PI) / 180;
        const s = fit(b0 + 0.75 + i * 0.13, 0.5, d);
        return {
          x0: 9 * Math.cos(a),
          y0: 9 * Math.sin(a),
          x1: (RING.outer + 0.08) * Math.cos(a),
          y1: (RING.outer + 0.08) * Math.sin(a),
          draw: easeInOut(progress(T, s, 0.5)),
        };
      });
      w.never.opacity = progress(T, fit(b1, 0.5, d), 0.5);
      w.never.breathe = 0.5 + 0.5 * Math.sin(Math.min(T, 1e6) * 3.2);
      w.robots = [robotOn(still(), T)];
      break;
    }
    case 'twin': {
      w.disc.opacity = 0.4;
      const t0 = fit(b0 + 0.15, 1.3, d);
      const keys: Key[] = [
        { t: t0, p: [START.x, 0] },
        { t: t0 + 1.2, p: [CONTACT_X, 0], hit: true },
      ];
      const lab = progress(T, fit(b0, 0.4, d), 0.4);
      w.robots = [robotOn(keys, T, 'truth', lab), robotOn(keys, T, 'model', lab)];
      w.sparks = sparks(keys, T);
      break;
    }
    case 'blind': {
      w.disc.opacity = 0.4 * (1 - progress(T, 0, 0.5));
      w.promised.draw = easeInOut(progress(T, fit(b0 + 0.15, 0.7, d), 0.7));
      const keys = charges(fit(b0 + 0.9, 0.75, d), d, [START.x, 0], [CONTACT_X, 0], [-6.7, 0]);
      w.robots = [robotOn(keys, T, 'model')];
      w.sparks = sparks(keys, T);
      break;
    }
    case 'doorFront': {
      w.ring.gap = gapNow;
      w.gapLabel = { opacity: progress(T, fit(beatAt(beats, gapSpec.beat ?? 0), 0.4, d), 0.4), text: fmtGap(gapNow, gapSpec.to < 0.15), ...gapLabelAt(Math.PI) };
      if (gapSpec.to < 0.15) {
        // The knee: a planner step just fits; light leaks in; the robot squeezes through on a retry.
        w.ghost.opacity = progress(T, fit(b0 + 0.9, 0.4, d), 0.4) * (1 - progress(T, fit(b1 + 0.8, 0.4, d), 0.4));
        w.glow.holeLit = 0.5 * easeInOut(progress(T, fit(b1, 1.4, d), 1.4));
        const t0 = fit(b1 + 0.1, 3.0, d);
        const yHit = 0.6;
        const xHit = -Math.sqrt(RING.outer ** 2 - yHit ** 2) - ROBOT_R;
        const keys: Key[] = [
          { t: t0, p: [START.x, 0] },
          { t: t0 + 0.8, p: [xHit, yHit], hit: true },
          { t: t0 + 0.95, p: [xHit, yHit] },
          { t: t0 + 1.3, p: [-6.5, 0.25] },
          { t: t0 + 1.7, p: [-5.6, 0] },
          { t: t0 + 2.9, p: [0, 0] },
        ];
        w.robots = [robotOn(keys, T, 'model')];
        w.sparks = sparks(keys, T);
      } else {
        // Wide open: light floods the hole and the robot glides onto the star.
        w.glow.holeLit = lerp(0.5, 1, gapP);
        const t0 = fit(b0 + 0.35, 2.0, d);
        const keys: Key[] = [
          { t: t0, p: [START.x, 0] },
          { t: t0 + 2.0, p: [0, 0] },
        ];
        w.robots = [robotOn(keys, T, 'model')];
      }
      break;
    }
    case 'doorBack': {
      const gap = gapSpec.to || 0.6;
      const rotS = fit(b0 + 0.1, 1.5, d);
      const rot = easeInOut(progress(T, rotS, 1.5));
      w.ring.gap = gap;
      w.ring.angle = Math.PI + Math.PI * rot;
      w.glow.holeLit = 1 - easeInOut(progress(T, rotS, 0.7));
      w.gapLabel = { opacity: 1, text: fmtGap(gap, false), ...gapLabelAt(w.ring.angle) };
      const keys = charges(fit(b0 + 1.6, 0.9, d), d, [START.x, 0], [CONTACT_X, 0], [-6.7, 0], 0.9, 3);
      w.robots = [robotOn(keys, T, 'model')];
      w.sparks = sparks(keys, T);
      break;
    }
    case 'zoomOut': {
      const z = p.newGoal ? 1 : easeInOut(progress(T, fit(0.1, 1.4, d), 1.4));
      w.view = {
        x0: lerp(VIEW.x0, VIEW_ZOOM.x0, z),
        x1: lerp(VIEW.x1, VIEW_ZOOM.x1, z),
        y0: lerp(VIEW.y0, VIEW_ZOOM.y0, z),
        y1: lerp(VIEW.y1, VIEW_ZOOM.y1, z),
      };
      w.glow.radius = lerp(GLOW_FULL, GLOW_ZOOM, z);
      w.robots = [robotOn(still(), T, 'model')];
      const sw = fit(b1 + 0.6, 1.4, d);
      if (p.newGoal) {
        w.goal2.opacity = progress(T, fit(b0 + 0.15, 0.5, d), 0.5);
        const s0 = fit(b0 + 0.5, 0.5, d);
        w.lobe.draw =
          T < sw ? SWALLOW_AT * easeInOut(progress(T, s0, Math.max(0.3, sw - s0))) : SWALLOW_AT + (1 - SWALLOW_AT) * easeInOut(progress(T, sw, 0.9));
      }
      w.patches = PATCHES.map((q, i) => ({
        x: q.x,
        y: q.y,
        r: q.r,
        opacity: p.newGoal ? 1 : progress(T, fit(0.9 + i * 0.12, 0.4, d), 0.4),
        heat: q.hot
          ? p.newGoal
            ? 1
            : progress(T, fit(b1 + 0.1 + i * 0.1, 0.5, d), 0.5)
          : 'swallowed' in q && q.swallowed && p.newGoal
            ? progress(T, sw, 0.4)
            : 0,
      }));
      break;
    }
    case 'split':
      break;
  }
  return w;
}

/** The two maps of the split scene: the same door in front (lit) and behind the goal (dark). */
function splitWorlds(T: number, beats: number[], d: number): { top: World; bottom: World } {
  const b1 = beatAt(beats, 1);
  const reach = progress(T, fit(b1, 0.8, d), 0.8);
  const top = base();
  top.ring.gap = 0.6;
  top.glow.holeLit = 1;
  top.glow.pulse = Math.sin(Math.PI * reach);
  top.robots = [robotOn(still(0, 0), T, 'model')];
  top.gapLabel = { opacity: 1, text: fmtGap(0.6, false), ...gapLabelAt(Math.PI) };
  const bottom = base();
  bottom.ring.gap = 0.6;
  bottom.ring.angle = 2 * Math.PI;
  bottom.robots = [robotOn(still(CONTACT_X, 0), T, 'model')];
  bottom.cut.opacity = reach;
  bottom.gapLabel = { opacity: 1, text: fmtGap(0.6, false), ...gapLabelAt(2 * Math.PI) };
  return { top, bottom };
}

export function frameState(p: ReachProps, t: number, beats: number[], dur: number) {
  const T = sceneTime(t, dur);
  const d = Number.isFinite(dur) ? Math.max(0, dur) : 1e6;
  const b0 = beatAt(beats, 0);
  const split = p.mode === 'split';
  const worlds = split ? splitWorlds(T, beats, d) : null;
  // Hook headline over the meter's place: revealed by a sweeping gradient, one phrase per beat,
  // until the meter drops in on the third beat.
  const b1 = beatAt(beats, 1);
  const b2 = beatAt(beats, 2);
  const headline =
    p.mode === 'hook'
      ? [
          { text: 'A whole region: wrong', reveal: clamp01(0.35 + T / 0.7), opacity: 1 - progress(T, fit(b1, 0.3, d), 0.3) },
          { text: 'No test can catch it', reveal: progress(T, fit(b1, 0.7, d), 0.7), opacity: 1 - progress(T, fit(b2, 0.3, d), 0.3) },
        ]
      : [];
  return {
    mode: p.mode,
    headline,
    world: split ? worlds!.top : world(p, T, beats, d),
    bottom: worlds?.bottom ?? null,
    split: {
      ticks: [0, 1, 2].map((i) => progress(T, fit(b0 + 0.15 + i * 0.45, 0.4, d), 0.4)),
    },
    meter: meterState(split || p.mode === 'zoomOut' ? undefined : p.meter, t, beats, dur),
    // The model chip slides in when the model changes (blind); elsewhere it holds across the blend.
    chip: {
      opacity: p.chip ? (p.chipIn ? easeInOut(progress(T, 0.6, 0.3)) : 1) : 0,
      slide: p.mode === 'blind' ? 1 - easeInOut(progress(T, 0.6, 0.45)) : 0,
    },
  };
}

export type ReachState = ReturnType<typeof frameState>;
export { clamp01 };
