// Pure state of the context told right after the hook (added 2026-10-21): where the story comes
// from, before the test. Three modes, one per line, each starting where the previous one ended so
// they blend without a jump:
// - `course`: the course card ("68 videos", a grid of 68 tiles) and a month calendar with today
//   ringed and four consecutive studio days highlighted, weeks ahead;
// - `advice`: the course folds into a header chip; two speech bubbles from the coding agents with
//   the article's examples of ordering advice; then they dim with a muted "didn't hold up" stamp;
// - `status`: the bubbles leave; the agent-maintained status file ("Recorded and good 2 /
//   Recorded, to redo 3 / Pending 63") with the good takes lit, then a stamp NOTHING RECORDED and
//   "the studio was still weeks away".
// `marks` are scene seconds of spoken words (timeline.ts resolves them). No Remotion or React here.
import { easeOutCubic, progress, sceneTime } from './steps.ts';

export type ContextMode = 'course' | 'advice' | 'status';
export type CourseContextProps = { mode: ContextMode; marks?: number[] };

export const VIDEOS = 68;
/** A stylised month: 5 weeks x 7 days, numbered 1-31 (cells 31-34 empty). Today and the studio. */
export const CAL = { days: 31, today: 4, studio: [24, 25, 26, 27] } as const;
/** The article's examples of ordering advice that didn't hold up (intro, second paragraph). */
export const ADVICE = ['Leave this piece for the end, because it depends on the others.', 'Record these two together, because the second reuses the first.'];
/** The status file the agent had been maintaining (article, "The anecdote I had to throw away"). */
export const STATUS_ROWS = [
  { label: 'Recorded and good', value: '2' },
  { label: 'Recorded, to redo', value: '3' },
  { label: 'Pending', value: '63' },
];

export type ContextState = {
  course: { opacity: number; card: number; number: number; count: number; tiles: number; calendar: number; studio: number[]; label: number; weeks: number };
  header: { opacity: number };
  agents: { opacity: number; kicker: number; bubbles: number[]; doubt: number; stamp: number };
  status: { opacity: number; card: number; rows: number[]; highlight: number; ghost: number; stamp: number; note: number };
};

const ORDER: ContextMode[] = ['course', 'advice', 'status'];
const e = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};

/**
 * What leaves at the start of a mode waits for the blend from the previous scene (0.6 s, the
 * outgoing scene stays fully drawn for its first half), so the two pictures never double up.
 */
const LEAVE = 0.55;

export function frameState(props: CourseContextProps, t: number, beats: number[], dur: number): ContextState {
  const mode: ContextMode = ORDER.includes(props.mode) ? props.mode : 'course';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beats[0] !== undefined && Number.isFinite(beats[0]) ? beats[0] : 0;
  const course = mode === 'course';
  const advice = mode === 'advice';
  const status = mode === 'status';

  // ---- course: the card, the 68 tiles, the calendar with four studio days weeks ahead ----
  // The card comes in as soon as the dip from the hook is over, not seconds later on "university".
  const cardAt = Math.max(0.35, Math.min(0.5, mk(m, 0, b0 + 0.9) - 0.35));
  const countAt = mk(m, 1, b0 + 2.2) - 0.1;
  const daysAt = mk(m, 2, b0 + 3.4);
  const studioAt = mk(m, 3, b0 + 4.3);
  const courseState = {
    // Only `advice` folds the course away; `status` never shows it.
    opacity: course ? 1 : advice ? 1 - e(T, LEAVE, 0.35) : 0,
    card: course ? e(T, cardAt, 0.45) : 1,
    // The figure shows only once it starts counting (no "0 videos" before "sixty-eight").
    number: course ? e(T, countAt - 0.05, 0.2) : 1,
    count: course ? Math.round(VIDEOS * easeOutCubic(progress(T, countAt, 0.9))) : VIDEOS,
    tiles: course ? easeOutCubic(progress(T, countAt, 0.9)) : 1,
    calendar: course ? e(T, Math.min(countAt + 0.5, daysAt - 0.4), 0.45) : 1,
    studio: CAL.studio.map((_, i) => (course ? e(T, daysAt + i * 0.12, 0.3) : 1)),
    label: course ? e(T, studioAt, 0.35) : 1,
    weeks: course ? e(T, studioAt + 0.35, 0.4) : 1,
  };

  // ---- advice: the header chip, two bubbles, then the muted verdict ----
  const b1At = mk(m, 0, b0 + 1.2);
  const b2At = mk(m, 1, b0 + 2.9);
  const doubtAt = mk(m, 2, b0 + 4.4);
  const header = advice ? e(T, LEAVE + 0.15, 0.4) : status ? 1 : 0;
  const agents = {
    opacity: advice ? e(T, LEAVE + 0.15, 0.4) : status ? 1 - e(T, LEAVE, 0.3) : 0,
    kicker: advice ? e(T, LEAVE + 0.25, 0.4) : 1,
    bubbles: [advice ? e(T, Math.max(LEAVE + 0.35, b1At), 0.4) : 1, advice ? e(T, b2At, 0.4) : 1],
    doubt: advice ? e(T, doubtAt, 0.45) : 1,
    stamp: advice ? e(T, doubtAt + 0.1, 0.35) : 1,
  };

  // ---- status: the file, its rows, the lit good takes, the stamp ----
  const fileAt = Math.max(LEAVE + 0.25, mk(m, 0, b0 + 0.5));
  const twoAt = mk(m, 1, b0 + 1.9);
  const nothingAt = mk(m, 2, b0 + 2.8);
  const statusState = {
    opacity: status ? 1 : 0,
    card: status ? e(T, fileAt, 0.4) : 0,
    rows: STATUS_ROWS.map((_, i) => (status ? e(T, fileAt + 0.2 + i * 0.15, 0.3) : 0)),
    highlight: status ? e(T, twoAt, 0.35) : 0,
    ghost: status ? e(T, nothingAt + 0.2, 0.4) : 0,
    stamp: status ? e(T, nothingAt, 0.35) : 0,
    note: status ? e(T, nothingAt + 0.5, 0.4) : 0,
  };

  return { course: courseState, header: { opacity: header }, agents, status: statusState };
}
