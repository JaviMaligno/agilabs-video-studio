// Pure state of the fine-tune that failed without telling you (row 45).
// From frame 0: the robot before a quiz (a screen of moving dots and four answer buttons A-D), an
// empty chart, the recipe card and a "Training" banner that starts filling on the first beat while
// the chart's line draws along, flat.
// - recipe: the recipe card lights; its "made for" stack grows tall, "my data" stays short.
// - nothing: the four buttons settle all lit the same, the flat line turns rose and its label
//   "guessing" pops, a "?" rises over the robot.
// - tick: the banner fills and turns into "Training complete" with a tick.
// Marks: [recipe, nothing, tick].
// No Remotion or React here.
import { beatOr, blinkAt, ease, lerp, loopTime, mark } from './memory.ts';
import { clamp01, fit, progress, sceneTime } from './steps.ts';

export type FlatLineProps = { marks?: number[] };

export const BANNER_RUNNING = 'Training';
export const BANNER_DONE = 'Training complete';
export const RECIPE_TITLE = 'the recipe it came with';
export const STACKS = ['made for', 'my data'] as const;
export const GUESSING = 'guessing';
export const AXES = { y: 'right answers', x: 'training' } as const;
export const LETTERS = ['A', 'B', 'C', 'D'] as const;

export type FlatLineState = {
  /** Banner fill while training, and the "complete" state. */
  fill: number;
  done: number;
  /** Recipe card shown, lit; the two stacks' heights (0..1 of their full size). */
  recipe: number;
  recipeLit: number;
  stacks: number[];
  /** How far the chart's line has drawn, and its "guessing" verdict. */
  draw: number;
  verdict: number;
  /** The four buttons' light levels; all equal once settled. */
  buttons: number[];
  settle: number;
  puzzled: number;
  blink: number;
  bob: number;
  /** Loop time for the moving dots, in [0, dur]. */
  tm: number;
};

export function frameState(props: FlatLineProps, t: number, beats: number[], dur: number): FlatLineState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const recipe = Math.max(b0 + 0.3, mark(m, 0, b0 + 5));
  const nothing = Math.max(recipe + 0.4, mark(m, 1, b0 + 9));
  const tick = Math.max(nothing + 0.4, mark(m, 2, b0 + 12.4));
  const tickAt = fit(tick - 0.1, 0.4, dur);
  const settle = ease(T, fit(nothing - 0.1, 0.6, dur), 0.6);
  const flicker = (i: number) => clamp01(0.45 + 0.3 * Math.sin(tm * (2.3 + 0.7 * i) + i * 1.9));
  return {
    fill: progress(T, b0, Math.max(0.5, tickAt - b0)),
    done: ease(T, tickAt, 0.4),
    recipe: ease(T, b0, 0.5),
    recipeLit: ease(T, fit(recipe - 0.1, 0.4, dur), 0.4),
    stacks: [ease(T, fit(recipe + 0.2, 0.9, dur), 0.9), ease(T, fit(recipe + 0.9, 0.5, dur), 0.5)],
    draw: progress(T, b0, Math.max(0.5, tickAt - b0)),
    verdict: ease(T, fit(nothing - 0.1, 0.5, dur), 0.5),
    buttons: [0, 1, 2, 3].map((i) => lerp(flicker(i), 0.75, settle)),
    settle,
    puzzled: ease(T, fit(nothing + 0.2, 0.5, dur), 0.5),
    blink: blinkAt(tm),
    bob: clamp01(0.5 + 0.5 * Math.sin(tm * 1.8)),
    tm,
  };
}
