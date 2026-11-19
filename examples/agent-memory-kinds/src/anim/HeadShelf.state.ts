// Pure state of the bookshelf in the robot's head (rows 5-8): what it learned in training.
// Books stream into the shelf and light up (reads ... packed); a school satchel lands beside it
// (school); the glass doors close (frozen); the red slip "FLIGHT: FRIDAY" flies at the closed doors
// and bounces off (flight ... moved); retraining: one bar shoots up ("new") while the others sink
// ("everything else") (again, worse); then the slip floats down to the desk (somewhere else).
// Marks: [reads, school, flight, moved, somewhere, frozen, packed, again, worse].
// No Remotion or React here.
import { beatOr, bump, ease, mark } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

/**
 * `short` (the reel): no school satchel and no retraining bars; the doors close on "frozen" and
 * the slip falls to the desk as soon as it has bounced and "somewhere" is said.
 */
export type HeadShelfProps = { marks?: number[]; short?: boolean };

/**
 * Where the slip starts, hits the glass, bounces to, and lands (vertical frame pixels, slip
 * centre). The landscape layout maps the head points with its head transform and has its own desk;
 * `path` gives the progress of each leg so either format can draw the flight.
 */
export const SLIP_PATH = {
  start: { x: 905, y: 330, rot: 10 },
  door: { x: 600, y: 520, rot: -4 },
  out: { x: 850, y: 700, rot: 18 },
  desk: { x: 560, y: 1105, rot: -5 },
} as const;

export const FLY = 0.6;
export const BOUNCE = 0.5;
export const FALL = 0.9;
/** Books that stream into the shelf. */
export const STREAM_BOOKS = 8;

export type HeadShelfState = {
  books: number;
  /** Books streaming in: 0 = none yet, 1 = all on the shelf. */
  stream: number;
  /** The school satchel landing beside the head. */
  cap: number;
  /** The glass doors closing over the shelf. */
  doors: number;
  lock: number;
  slip: { opacity: number; x: number; y: number; rot: number };
  /** Progress of the slip's three legs: to the glass, bounce out, down to the desk. */
  path: { fly: number; back: number; fall: number };
  /** Flash on the glass where the slip hits it. */
  bounce: number;
  desk: number;
  /** Retraining: the bars shown, the "new" bar rising, the others sinking (each 0..1). */
  bars: { opacity: number; rise: number; sink: number };
};

export function frameState(props: HeadShelfProps, t: number, beats: number[], dur: number): HeadShelfState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 3.6);
  const b2 = beatOr(beats, 2, b1 + 2.4);
  const training = mark(m, 0, b0 + 1.4);
  const packed = Math.max(training + 1.2, mark(m, 6, training + 2.6));
  const short = props.short === true;
  const school = short ? training : mark(m, 1, b0 + 2.8);
  const doorsAt = Math.max(school + 0.3, mark(m, 5, school + 1.0));
  const flyAt = Math.max(mark(m, 2, b1 + 0.4) - 0.2, doorsAt + 0.5);
  const bounceAt = Math.max(mark(m, 3, b1 + 1.4), flyAt + FLY);
  const b3 = beatOr(beats, 3, b2 + 6);
  const again = Math.max(bounceAt + BOUNCE, mark(m, 7, b2 + 1.6));
  const worse = Math.max(again + 0.6, mark(m, 8, b2 + 5));
  const fallAt = Math.max(mark(m, 4, b3 + 1.2), bounceAt + BOUNCE, short ? 0 : worse + 0.6);

  const fly = ease(T, flyAt, FLY);
  const back = ease(T, bounceAt, BOUNCE);
  const fall = ease(T, fallAt, FALL);
  const { start, door, out, desk } = SLIP_PATH;
  const along = (k: 'x' | 'y' | 'rot') => start[k] + (door[k] - start[k]) * fly + (out[k] - door[k]) * back + (desk[k] - out[k]) * fall;
  const stream = progress(T, training - 0.2, packed - training + 0.2);

  return {
    books: ease(T, training - 0.2, 0.6) * (0.4 + 0.6 * stream),
    stream,
    cap: short ? 0 : ease(T, school - 0.1, 0.45),
    doors: ease(T, doorsAt - 0.1, 0.5),
    lock: ease(T, bounceAt - 0.1, 0.3),
    slip: { opacity: ease(T, flyAt - 0.15, 0.2), x: along('x'), y: along('y'), rot: along('rot') },
    path: { fly, back, fall },
    bounce: bump(T, bounceAt - 0.05, 0.6),
    desk: ease(T, fallAt + FALL * 0.6, 0.4),
    bars: short ? { opacity: 0, rise: 0, sink: 0 } : { opacity: ease(T, again - 0.3, 0.4), rise: ease(T, again, 0.9), sink: ease(T, worse - 0.1, 0.9) },
  };
}
