// Pure state of the SwarmToVortex scene: a cloud of drawn dots standing for the agent swarm
// (~1,800 dots; the label carries the article's "~10,000 agents"), drifting and flickering as if
// messaging, then streaming onto the vortex threads so the hand-off to the drain is seamless.
// Illustrative: the agents did not literally draw the vortex. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';
import { frameState as vortexState, type VortexProps, type VortexState } from './VortexCore.state.ts';

export const DOTS = 1800;

export type SwarmState = {
  vortex: VortexState;
  /** Label "~10,000 agents · ~88 h". */
  label: { opacity: number };
  /** Message flickers between nearby dots, 0..1. */
  links: { opacity: number };
  /** Global settle progress, 0..1 (each dot has its own stagger within it). */
  settle: number;
  /** Threads drawn under the settled dots, 0..1. */
  threads: { opacity: number };
  /** Drift time for the random walk. */
  drift: number;
};

const fin = (x: number, d = 0) => (Number.isFinite(x) ? x : d);

/** Deterministic pseudo-random in [0, 1) for dot i and channel k. */
export const rnd = (i: number, k: number): number => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Settle window: starts shortly after the line starts, ends well before the scene does. */
export const settleWindow = (beats: number[], dur: number): [number, number] => {
  const b0 = beatAt(beats, 0);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 5;
  const start = Math.min(b0 + 1.3, d * 0.35);
  const end = Math.max(start + 0.4, d - 0.9);
  return [start, end];
};

export function frameState(props: VortexProps, t: number, beats: number[], dur: number): SwarmState {
  const st = sceneTime(fin(t), dur);
  const [a, b] = settleWindow(beats, dur);
  const settle = progress(st, a, b - a);
  return {
    vortex: vortexState({ ...props, mode: 'swarm' }, t, beats, dur),
    label: { opacity: progress(st, beatAt(beats, 0) + 0.5, 0.35) }, // after the 0.6 s hand-off, so it never ghosts over the fading title
    links: { opacity: clamp01(Math.min(progress(st, 0, 0.3), 1 - settle * 1.6)) },
    settle,
    threads: { opacity: easeOutCubic(progress(st, a + (b - a) * 0.45, (b - a) * 0.55)) },
    drift: Math.max(0, Math.min(fin(t), Number.isFinite(dur) ? dur : fin(t))),
  };
}

/** Own settle progress of dot i (staggered), 0..1. */
export const dotSettle = (i: number, settle: number): number => {
  const delay = rnd(i, 3) * 0.55;
  return easeOutCubic(clamp01((settle - delay) / 0.45));
};

/** Cloud position of dot i at drift time d, in stage pixels (w x h). */
export const cloudAt = (i: number, d: number, w: number, h: number): { x: number; y: number } => {
  const bx = rnd(i, 1);
  const by = rnd(i, 2);
  const sp = 0.6 + rnd(i, 4);
  return {
    x: w * (0.04 + 0.92 * bx) + 26 * Math.sin(d * sp + i) + 14 * Math.sin(d * 2.3 * sp + i * 0.7),
    y: h * (0.12 + 0.8 * by) + 26 * Math.cos(d * sp * 0.8 + i * 1.3) + 14 * Math.sin(d * 1.9 * sp + i),
  };
};
