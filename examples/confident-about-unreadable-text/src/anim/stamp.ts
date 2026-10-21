// The confident stamp: one pure timing helper shared by every scene that slams a stamp.
// No Remotion or React here, so the states can be tested with plain `node --test`.
import { clamp01, easeOutCubic, progress } from './steps.ts';

/** A stamp landing at `at`: drops from 1.5x to 1x, then the card under it shudders briefly. */
export type Slam = {
  /** 0..1: how far the slam has gone (1 = landed). */
  pop: number;
  opacity: number;
  /** Size multiplier, 1.5 -> 1. */
  scale: number;
  /** -1..1 shake of the stamped card, decaying to 0. */
  shake: number;
};

export const SLAM_LEN = 0.2;

export const slam = (t: number, at: number, len = SLAM_LEN): Slam => {
  const p = easeOutCubic(progress(t, at, len));
  const k = progress(t, at + len * 0.7, 0.4);
  return {
    pop: p,
    opacity: clamp01(progress(t, at, 0.05)),
    scale: 1.5 - 0.5 * p,
    shake: k > 0 && k < 1 ? Math.sin(k * 26) * (1 - k) : 0,
  };
};

/** A slam that has not happened (hidden). */
export const NO_SLAM: Slam = { pop: 0, opacity: 0, scale: 1.5, shake: 0 };

/** Finite beat `i`, else `fallback`. */
export const beatOr = (beats: number[], i: number, fallback: number): number => {
  const b = beats[i];
  return b !== undefined && Number.isFinite(b) ? b : fallback;
};

/** A pulse 0 -> 1 -> 0 centred on `at`, `half` seconds each side. */
export const pulse = (t: number, at: number, half = 0.25): number => clamp01(1 - Math.abs(t - at) / half);
