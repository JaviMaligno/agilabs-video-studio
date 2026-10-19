// Pure state of the VortexCore scenes: one vortex, seen like water going down a drain, that only
// tightens. The camera and the collapse (tau = time left) follow the global keyframes that
// timeline.ts builds from MODE_KEYS; each mode adds its own overlays (title, push pulses, clock,
// speed gauge, ghost snapshots, flares, skater, labels). Illustrative, chosen for impact; every
// label is written as the article writes it. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';
import { angleAt, paramsAt, radiusScale, type Knot, type Params } from './vortex.ts';

export type VortexMode = 'hook' | 'drain' | 'skater' | 'stretch' | 'collapse' | 'balance' | 'unforced' | 'closer' | 'swarm';

export type VortexProps = {
  mode: VortexMode;
  /** Video second the scene starts at (injected by timeline.ts). */
  clock?: number;
  /** Global camera/collapse keyframes (injected by timeline.ts). */
  knots?: Knot[];
};

/**
 * Keyframes of each mode, placed by timeline.ts: at a scene second (`at`), on a narration beat
 * (`beat`, plus `off` seconds), or at the hand-over to the next scene (`end`). Values left out
 * carry over from the previous keyframe.
 */
export type KeySpec = { at?: number; beat?: number; off?: number; end?: boolean; v: Partial<Params> };

export const MODE_KEYS: Record<string, KeySpec[]> = {
  hook: [
    { at: 0, v: { tau: 1, elev: 62, coil: 0, glow: 0.42, spin: 0.04, axial: 0, zoom: 1, dy: 70, dx: 0 } },
    { beat: 2, v: { coil: 0.05, spin: 0.1, glow: 0.5 } },
    { beat: 2, off: 1.0, v: { coil: 1, spin: 1.3, glow: 1, axial: 0.45 } },
    { end: true, v: { elev: 66, dy: 40 } },
  ],
  swarm: [
    { at: 0, v: { tau: 1, elev: 66, coil: 1, glow: 1, spin: 0.7, axial: 0.3, zoom: 1, dy: 40, dx: 0 } },
    { end: true, v: { elev: 72, dy: 30 } },
  ],
  drain: [{ end: true, v: { elev: 84, zoom: 1.12, dy: 10, spin: 0.85, axial: 0.15 } }],
  skater: [
    { beat: 0, off: 0.4, v: { elev: 50, zoom: 0.92, dx: -150, dy: -40 } },
    { end: true, v: { tau: 0.6, spin: 1.1 } },
  ],
  stretch: [{ end: true, v: { elev: 10, tau: 0.45, axial: 1, dx: 0, dy: 0, zoom: 1.04, spin: 1 } }],
  collapse: [
    { beat: 0, v: { tau: 0.45 } },
    { beat: 1, v: { tau: 0.13 } },
    { end: true, v: { tau: 0.035 } },
  ],
  balance: [{ end: true, v: { tau: 0.025 } }],
  unforced: [
    { at: 0, v: { tau: 0.3, elev: 38, coil: 1, glow: 1, spin: 1, axial: 0.6, zoom: 1, dx: 0, dy: 20 } },
    { beat: 1, v: { spin: 1 } },
    { beat: 1, off: 0.8, v: { spin: 0, glow: 0.55 } },
    { end: true, v: {} },
  ],
  closer: [
    { at: 0.5, v: { tau: 0.3, spin: 0.2, glow: 0.6 } },
    { at: 2.6, v: { tau: 1, elev: 76, spin: 0.35, glow: 0.95, axial: 0.2, dx: -140, dy: -10, zoom: 0.84 } },
    { end: true, v: {} },
  ],
};

/** Snapshot taus for the ghosted t₁ / t₂ / t₃ rings (collapse). */
export const GHOSTS = [
  { tau: 0.42, label: 't₁' },
  { tau: 0.16, label: 't₂' },
  { tau: 0.05, label: 't₃' },
];

const beatOr = (beats: number[], i: number, d: number): number => {
  const b = beats[i];
  return b !== undefined && Number.isFinite(b) ? b : d;
};
const fin = (x: number, d = 0) => (Number.isFinite(x) ? x : d);
const fade = (t: number, a: number, b: number, len = 0.35) => clamp01(Math.min(progress(t, a, len), 1 - progress(t, b - len, len)));

export type LabelId = 'radius' | 'peak' | 'energy' | 'h' | 'pushed' | 'alone';

export type VortexState = {
  T: number;
  params: Params;
  angle: number;
  /** Flow phase along the threads (0..1 wraps), driving the bright tracer dots. */
  flow: number;
  title: { opacity: number; shrink: number };
  pulses: { opacity: number; phase: number };
  clock: { opacity: number; left: number };
  gauge: { opacity: number; needle: number; leave: number; inf: number };
  ghosts: { tau: number; label: string; opacity: number }[];
  flares: { opacity: number; cancel: number };
  skater: { opacity: number; span: number };
  dashed: number;
  question: { opacity: number; pulse: number };
  labels: { id: LabelId; opacity: number }[];
};

/** Video second of a scene second, frozen at the scene end. */
const videoT = (props: VortexProps, t: number, dur: number) => fin(props.clock ?? 0) + Math.min(Math.max(0, fin(t)), Math.max(0, fin(dur)));

export function frameState(props: VortexProps, t: number, beats: number[], dur: number): VortexState {
  const T = videoT(props, t, dur);
  const st = sceneTime(fin(t), dur);
  const knots = props.knots;
  const p = paramsAt(knots, T);
  const angle = angleAt(knots, T);
  const b0 = beatAt(beats, 0);
  const b1 = beatOr(beats, 1, b0 + 1.2);
  const b2 = beatOr(beats, 2, b1 + 1.2);
  const end = Number.isFinite(dur) ? dur : 1e9;
  const mode = props.mode;

  const s: VortexState = {
    T,
    params: p,
    angle,
    flow: ((angle * 0.16) % 1 + 1) % 1,
    title: { opacity: 0, shrink: 0 },
    pulses: { opacity: 0, phase: 0 },
    clock: { opacity: 0, left: clamp01(p.tau) },
    gauge: { opacity: 0, needle: 0, leave: 0, inf: 0 },
    ghosts: GHOSTS.map((g) => ({ ...g, opacity: 0 })),
    flares: { opacity: 0, cancel: 0 },
    skater: { opacity: 0, span: clamp01(radiusScale(p.tau)) },
    dashed: 0,
    question: { opacity: 0, pulse: 0 },
    labels: [],
  };

  if (mode === 'hook') {
    // Title large on the first frame (it carries the hook), then shrinks to the top.
    s.title = { opacity: 1, shrink: easeOutCubic(progress(st, 2.4, 0.8)) };
    s.pulses = { opacity: clamp01(Math.min(progress(st, b1 - 0.1, 0.4), 1 - progress(st, b2 + 0.3, 0.6))), phase: Math.max(0, fin(t)) };
    s.gauge = {
      opacity: progress(st, Math.max(b1, 2.9), 0.4),
      needle: 0.08 + 0.92 * easeOutCubic(progress(st, b2 + 0.4, 0.9)),
      leave: 0,
      inf: progress(st, b2 + 1.1, 0.3),
    };
  }
  if (mode === 'skater') {
    s.skater.opacity = fade(st, b0 + 0.2, end + 1, 0.5);
    // Arms out at the start of the scene, pulled in by its end, in lock-step with the core radius.
    s.skater.span = clamp01((radiusScale(p.tau) - 0.775) / 0.225);
  }
  if (mode === 'stretch') {
    s.clock.opacity = progress(st, Math.max(0, end - 1.4), 0.6);
  }
  if (mode === 'collapse') {
    s.clock.opacity = 1;
    s.ghosts = GHOSTS.map((g) => ({ ...g, opacity: p.tau <= g.tau ? 0.75 * clamp01(1 - progress(st, b1, 0.6) * 0.45) : 0 }));
    s.gauge = {
      opacity: progress(st, b1 - 0.2, 0.4),
      needle: 0.35 + 0.65 * easeOutCubic(progress(st, b1, 1.1)),
      leave: easeOutCubic(progress(st, b1 + 1.0, 0.8)),
      inf: 0,
    };
    s.labels = [
      { id: 'radius', opacity: progress(st, b0 + 0.6, 0.4) },
      { id: 'peak', opacity: progress(st, b1 + 0.2, 0.4) },
      { id: 'energy', opacity: progress(st, b1 + 0.9, 0.4) },
    ];
  }
  if (mode === 'balance') {
    s.clock.opacity = 1;
    // Every arrow flares (everything diverging), then the flares cancel to a calm glow.
    s.flares = { opacity: progress(st, b0, 0.35), cancel: easeOutCubic(progress(st, b1, 0.8)) };
    s.labels = [{ id: 'h', opacity: progress(st, b1 + 0.3, 0.4) }];
  }
  if (mode === 'unforced') {
    s.pulses = { opacity: clamp01(Math.min(progress(st, b0, 0.35), 1 - progress(st, b1 + 0.1, 0.5))), phase: Math.max(0, fin(t)) };
    s.dashed = easeOutCubic(progress(st, b1 + 0.2, 0.8));
    s.question = { opacity: progress(st, b1 + 0.8, 0.4), pulse: 0.5 + 0.5 * Math.sin(Math.max(0, fin(t)) * 3.2) };
    s.labels = [
      { id: 'pushed', opacity: clamp01(Math.min(progress(st, b0 + 0.3, 0.4), 1 - progress(st, b1, 0.35))) },
      { id: 'alone', opacity: progress(st, b1 + 0.5, 0.4) },
    ];
  }
  if (mode === 'closer') {
    s.skater.opacity = progress(st, 2.0, 0.8);
    // The skater holds still with arms pulled in (span of a tight core), not tied to the calm drain.
    s.skater.span = 0.25;
  }
  return s;
}
