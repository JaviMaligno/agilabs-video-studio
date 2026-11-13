// Pure state of the habit test (rows 11-12).
// - line 0: a plan card says "B doesn't depend on A" (its line lights when the models read it); the
//   robot repeats it in a speech bubble; then, on the schedule board, an arrow A → B is drawn
//   anyway (rose) and tagged "habit".
// - line 1: plan, bubble and board clear; the desk of the next chapter fades in where the desk
//   scene has it, and the red slip floats down onto it.
// Marks: [independent, said, first, habit, lands].
// No Remotion or React here.
import { beatOr, blinkAt, bump, ease, loopTime, mark } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

export type TwoJobsProps = { marks?: number[] };

export const PLAN_LINE = "B doesn't depend on A";
export const HABIT_TAG = 'habit';

export type TwoJobsState = {
  plan: { opacity: number; lit: number };
  bubble: { opacity: number; write: number };
  board: { opacity: number };
  /** The arrow A → B drawn anyway: how far, its flash, and the "habit" tag. */
  arrow: { draw: number; flash: number; tag: number };
  /** Plan, bubble and board clearing for the desk (line 1). */
  clear: number;
  desk: number;
  slip: { opacity: number; drop: number };
  robot: { blink: number };
};

export function frameState(props: TwoJobsProps, t: number, beats: number[], dur: number): TwoJobsState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const independent = mark(m, 0, b0 + 5.5);
  const said = Math.max(independent + 0.4, mark(m, 1, b0 + 7.2));
  const first = Math.max(said + 0.6, mark(m, 2, b0 + 8.8));
  const habit = Math.max(first + 0.5, mark(m, 3, b0 + 10.2));
  const b1 = Math.max(habit + 0.8, beatOr(beats, 1, habit + 2.5));
  const lands = Math.max(b1 + 1.2, mark(m, 4, b1 + 4.5));
  const clear = ease(T, b1 - 0.2, 0.7);
  const fall = Math.max(1.2, lands - b1);
  return {
    plan: { opacity: ease(T, b0 - 0.3, 0.4) * (1 - clear), lit: ease(T, independent - 0.2, 0.5) },
    bubble: { opacity: ease(T, said - 0.3, 0.35) * (1 - clear), write: progress(T, said - 0.2, 0.8) },
    board: { opacity: ease(T, b0 + 0.6, 0.5) * (1 - clear) },
    arrow: { draw: ease(T, first - 0.1, 0.9), flash: bump(T, habit - 0.2, 1.0), tag: ease(T, habit - 0.1, 0.4) },
    clear,
    desk: ease(T, b1, 0.8),
    slip: { opacity: ease(T, b1 + 0.2, 0.3), drop: ease(T, b1 + 0.2, fall) },
    robot: { blink: blinkAt(tm, 2.5) },
  };
}
