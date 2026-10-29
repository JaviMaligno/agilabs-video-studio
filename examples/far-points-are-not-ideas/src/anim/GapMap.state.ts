// GapMap: the bespoke scenes of "The Gaps in the Map Are Not Ideas". One component, one `mode` per
// scene. The state is a list of step progresses (each step eases in over STEP_LEN from its beat or
// its `at`) plus a slow wobble for things that idle (the thermometer, the star's pulse).
import { easeOutCubic, progress, sceneTime, stepTimes } from './steps.ts';

export type GapMode = 'tweet' | 'friend' | 'mix' | 'three' | 'hotcold' | 'blend' | 'stamp' | 'search' | 'cap' | 'museums' | 'diverse';

export type GapProps = {
  mode: GapMode;
  /** Scene seconds for each step, overriding the narration beats. */
  at?: (number | undefined)[];
};

export type GapState = {
  mode: GapMode;
  /** Progress of each step, 0..1. */
  appear: number[];
  /** Linear progress of the mode's long move (the search probe, the museum pile), 0..1. */
  progress: number;
  /** -1..1, slow idle oscillation. */
  wobble: number;
};

/** Steps per mode. */
export const STEPS: Record<GapMode, number> = {
  tweet: 3,
  friend: 2,
  mix: 3,
  three: 3,
  hotcold: 2,
  blend: 2,
  stamp: 1,
  search: 2,
  cap: 2,
  museums: 2,
  diverse: 2,
};

export const STEP_LEN = 0.7;
/** Length of the long move, started on step 0. */
export const MOVE_LEN: Partial<Record<GapMode, number>> = { search: 2.4, museums: 2.6, hotcold: 3 };

export function frameState(props: GapProps, t: number, beats: number[], dur: number): GapState {
  const mode = props.mode;
  const n = STEPS[mode] ?? 1;
  const times = stepTimes(n, beats, props.at ?? [], STEP_LEN, dur);
  const tt = sceneTime(t, dur);
  const appear = times.map((s) => easeOutCubic(progress(tt, s, STEP_LEN)));
  const len = MOVE_LEN[mode] ?? 0;
  // The museum pile fills while its second line is spoken; other long moves start on step 0.
  const moveStart = mode === 'museums' ? (times[1] ?? times[0] ?? 0) : (times[0] ?? 0);
  const prog = len > 0 ? progress(tt, Math.min(moveStart, Math.max(0, dur - len)), len) : appear[0] ?? 0;
  const wobble = Number.isFinite(t) ? Math.sin(t * 2.4) : 0;
  return { mode, appear, progress: prog, wobble };
}
