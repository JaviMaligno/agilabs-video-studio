// Pure state of the ask-a-reader notebook (rows 33-35).
// - line 0: the robot at its clean desk asks "what's on each shelf?" (a bubble); a second robot
//   behind it holds the whole day's stack and reads it from the top (a scan bar moving down).
// - line 1: the agent never asks about a correction (a struck "correction?" in its bubble); the
//   reader's scan stops on the red slip inside the stack, which glows; the slip is copied into the
//   answer and flies onto the desk (tick); the table "detail 10/11 · correction 4/6" against
//   "3/8 · 2/6" for keyword search comes in, one row at a time.
// - line 2: the reader goes through the whole day again; the day grows until the stack passes the
//   dashed line of what one reader can hold (amber); it splits into three small readers with a
//   piece each, or squeezes into one card; a question mark over both (back to guessing).
// Marks: [asks, another, reads, never, ran, passed, almost, whole, long, pieces, summarise, guessing].
// No Remotion or React here.
import { beatOr, blinkAt, ease, lerp, loopTime, mark } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

export type AskReaderProps = { marks?: number[] };

export const QUESTION = "what's on each shelf?";
export const UNASKED = 'correction?';
/** Pages in the day's stack, where the slip sits in it (from the bottom), and the long day. */
export const PAGES = 26;
export const SLIP_INDEX = 17;
export const LONG_PAGES = 48;
/** Pages one reader can hold: the dashed line the long day goes past. */
export const CAPACITY = 36;
/** The figures, as the article gives them: [label, ask a reader, keyword search]. */
export const TABLE_HEAD = ['', 'ask a reader', 'keyword search'] as const;
export const TABLE_ROWS = [
  ['detail', '10/11', '3/8'],
  ['correction', '4/6', '2/6'],
] as const;
/** Small readers the long day is split between. */
export const PIECES = 3;

export type AskReaderState = {
  agent: { blink: number };
  bubble: { opacity: number; write: number; unasked: number; strike: number };
  /** The reader behind the agent; fades when the day is split. */
  reader: { opacity: number; blink: number };
  /** The stack in the reader's hands: pages (float, PAGES..LONG_PAGES), the slip's glow, overflow. */
  stack: { opacity: number; pages: number; found: number; over: number };
  /** The scan bar: shown, and the page it is on (counted from the bottom). */
  scan: { opacity: number; index: number };
  /** The slip copied into the answer: its flight from the stack to the desk, and the tick. */
  slip: { opacity: number; fly: number; tick: number };
  table: { opacity: number; rows: number[] };
  limit: number;
  split: number;
  card: number;
  question: number;
};

export function frameState(props: AskReaderProps, t: number, beats: number[], dur: number): AskReaderState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 10.5);
  const b2 = beatOr(beats, 2, b1 + 10.5);
  const asks = mark(m, 0, b0 + 4.5);
  const another = Math.max(asks + 0.3, mark(m, 1, b0 + 6.2));
  const reads = Math.max(another + 0.3, mark(m, 2, b0 + 8.2));
  const never = mark(m, 3, b1 + 1.4);
  const ran = Math.max(reads + 1.2, mark(m, 4, b1 + 5.6));
  const passed = Math.max(ran + 0.6, mark(m, 5, b1 + 7.0));
  const almost = Math.max(passed + 0.4, mark(m, 6, b1 + 8.2));
  const whole = Math.max(almost + 0.6, mark(m, 7, b2 + 2.6));
  const long = Math.max(whole + 0.6, mark(m, 8, b2 + 5.4));
  const pieces = Math.max(long + 1.0, mark(m, 9, b2 + 10.4));
  const summarise = Math.max(pieces + 0.6, mark(m, 10, b2 + 11.6));
  const guessing = Math.max(summarise + 0.5, mark(m, 11, b2 + 13.4));
  const grow = ease(T, long - 0.1, Math.max(0.6, Math.min(1.6, pieces - long - 0.2)));
  const pages = lerp(PAGES, LONG_PAGES, grow);
  const split = ease(T, pieces - 0.1, 0.7);
  // The scan: from the top down to the slip (line 0 to "ran"), then the whole stack again ("whole").
  const first = progress(T, reads, ran - reads);
  const second = progress(T, whole, Math.max(0.6, long - whole + 0.6));
  const index = T < whole ? lerp(PAGES - 1, SLIP_INDEX, first) : lerp(PAGES - 1, 0, second);
  const scanOn = ease(T, reads - 0.2, 0.3) * (T < passed + 0.4 || T >= whole ? 1 : 0) * (second >= 1 ? 0 : 1);
  return {
    agent: { blink: blinkAt(tm, 2.6) },
    bubble: {
      opacity: ease(T, asks - 0.3, 0.35) * (1 - ease(T, guessing, 0.5) * 0.4),
      write: progress(T, asks - 0.2, 0.9),
      unasked: ease(T, never - 0.1, 0.35),
      strike: ease(T, never + 0.4, 0.35),
    },
    reader: { opacity: ease(T, another - 0.2, 0.5) * (1 - split), blink: blinkAt(tm + 1.1, 2.9) },
    stack: { opacity: ease(T, another - 0.2, 0.5) * (1 - split), pages, found: ease(T, ran - 0.1, 0.4) * (1 - ease(T, long, 0.6)), over: ease(T, long + 0.4, 0.6) },
    scan: { opacity: scanOn * (1 - split), index },
    slip: { opacity: ease(T, passed - 0.2, 0.2), fly: ease(T, passed - 0.1, 1.0), tick: ease(T, passed + 1.0, 0.35) },
    table: { opacity: ease(T, almost - 0.2, 0.4), rows: [ease(T, almost - 0.1, 0.4), ease(T, almost + 0.6, 0.4)] },
    limit: ease(T, long, 0.5) * (1 - split),
    split,
    card: ease(T, summarise - 0.1, 0.5),
    question: ease(T, guessing - 0.1, 0.4),
  };
}
