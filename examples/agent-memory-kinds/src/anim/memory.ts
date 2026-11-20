// Shared pure helpers and constants for the memory-office world (no Remotion or React here).
// One world throughout: a small robot running a warehouse, a red slip "SHELF 0: EMPTY", and an
// office whose objects are the kinds of memory.
import { clamp01, easeOutCubic, progress } from './steps.ts';

/** The message the robot must keep, as written on the red slip. */
export const SLIP_TEXT = 'SHELF 0: EMPTY';
/** The label of the shelf the message is about (the only shelf with a label). */
export const SHELF0 = 'SHELF 0';

/** A finite number, or the fallback. */
export const fin = (x: unknown, fb: number): number => (typeof x === 'number' && Number.isFinite(x) ? x : fb);

/** Scene second of mark `i` (resolved from [line, word] in timeline.ts), or the fallback. */
export const mark = (marks: number[] | undefined, i: number, fb: number): number => fin(marks?.[i], fb);

/** Beat `i`, or the fallback when the scene has no such beat. */
export const beatOr = (beats: number[], i: number, fb: number): number => fin(beats[i], fb);

/** Eased progress of an animation of `len` seconds starting at `start`, within [0, 1]. */
export const ease = (T: number, start: number, len: number): number => easeOutCubic(progress(T, start, len));

/** 0 → 1 → 0 over `len` seconds from `start` (a flash or a pulse). */
export const bump = (T: number, start: number, len: number): number => clamp01(Math.sin(Math.PI * progress(T, start, len)));

export const lerp = (a: number, b: number, p: number): number => a + (b - a) * clamp01(p);

/**
 * Time for looping motion (bobbing, blinking, hovering): the real scene time held within
 * [0, dur], so it stays finite and smooth even when the states read "finished" past the end.
 */
export const loopTime = (t: number, dur: number): number => {
  const d = Number.isFinite(dur) && dur > 0 ? dur : 0;
  const x = Number.isFinite(t) ? t : 0;
  return Math.min(Math.max(x, 0), d);
};

/** A blink every `every` seconds, 0 (open) → 1 (shut) → 0 over 0.18 s. */
export const blinkAt = (tm: number, every = 2.6): number => {
  const ph = ((tm % every) + every) % every;
  return ph < 0.18 ? clamp01(Math.sin((Math.PI * ph) / 0.18)) : 0;
};

/** Pick the mode, falling back to the first one for anything unknown. */
export const pickMode = <M extends string>(mode: unknown, modes: readonly M[]): M => (modes.includes(mode as M) ? (mode as M) : modes[0]);
