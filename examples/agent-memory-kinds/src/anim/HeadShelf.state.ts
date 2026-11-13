// Pure state of the bookshelf in the robot's head (scene 5): what it learned in training.
// The books light up (training), a school cap lands on the shelf (like school); today's red slip
// flies at the closed glass doors, bounces off, and floats down to the desk.
// Marks: [training, school, message, there, lands]. No Remotion or React here.
import { beatOr, bump, ease, mark } from './memory.ts';
import { sceneTime } from './steps.ts';

export type HeadShelfProps = { marks?: number[] };

/** Where the slip starts, hits the glass, bounces to, and lands (frame pixels, slip centre). */
export const SLIP_PATH = {
  start: { x: 905, y: 330, rot: 10 },
  door: { x: 600, y: 520, rot: -4 },
  out: { x: 850, y: 700, rot: 18 },
  desk: { x: 560, y: 1105, rot: -5 },
} as const;

export const FLY = 0.6;
export const BOUNCE = 0.5;
export const FALL = 0.9;

export type HeadShelfState = {
  books: number;
  cap: number;
  lock: number;
  slip: { opacity: number; x: number; y: number; rot: number };
  /** Flash on the glass where the slip hits it. */
  bounce: number;
  desk: number;
};

export function frameState(props: HeadShelfProps, t: number, beats: number[], dur: number): HeadShelfState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 3.6);
  const b2 = beatOr(beats, 2, b1 + 2.4);
  const training = mark(m, 0, b0 + 1.4);
  const school = mark(m, 1, b0 + 2.8);
  const flyAt = mark(m, 2, b1 + 0.4) - 0.2;
  const bounceAt = Math.max(mark(m, 3, b1 + 1.4), flyAt + FLY);
  const fallAt = Math.max(mark(m, 4, b2 + 0.6), bounceAt + BOUNCE);

  const fly = ease(T, flyAt, FLY);
  const back = ease(T, bounceAt, BOUNCE);
  const fall = ease(T, fallAt, FALL);
  const { start, door, out, desk } = SLIP_PATH;
  const along = (k: 'x' | 'y' | 'rot') => start[k] + (door[k] - start[k]) * fly + (out[k] - door[k]) * back + (desk[k] - out[k]) * fall;

  return {
    books: ease(T, training - 0.2, 0.6),
    cap: ease(T, school - 0.1, 0.45),
    lock: ease(T, bounceAt - 0.1, 0.3),
    slip: { opacity: ease(T, flyAt - 0.15, 0.2), x: along('x'), y: along('y'), rot: along('rot') },
    bounce: bump(T, bounceAt - 0.05, 0.6),
    desk: ease(T, fallAt + FALL * 0.6, 0.4),
  };
}
