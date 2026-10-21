// Small easing helpers shared by the PieceInspector and RepairFork states. Pure, no Remotion.
import { clamp01 } from './steps.ts';

export const lerp = (a: number, b: number, p: number) => a + (b - a) * clamp01(p);
export const easeIn = (p: number) => clamp01(p) ** 2;
export const easeInOut = (p: number) => {
  const x = clamp01(p);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
};
/** A decaying wobble that starts at `at`: 0 before, ±1 at first, ~0 after `len`. */
export const wobble = (t: number, at: number, len: number, freq = 38): number => {
  if (!(t >= at) || t > at + len) return 0;
  const q = (t - at) / len;
  return Math.sin((t - at) * freq) * (1 - q) ** 2;
};
/** A white flash right after `at`, gone after `len`. */
export const flashAt = (t: number, at: number, len = 0.4): number => (t >= at && t < at + len ? 1 - (t - at) / len : 0);
/** cos of a half turn: 1 face up before `at`, -1 (face down / back showing) after `at + len`. */
export const turn = (t: number, at: number, len: number): number => Math.cos(Math.PI * clamp01((t - at) / len));
