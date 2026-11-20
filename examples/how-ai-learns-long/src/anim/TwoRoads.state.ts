// Pure state of the fork in the road (script rows 7-8). No Remotion or React here.
// - From frame 0: the road from the robot's feet and the robot standing at the fork.
// - beat 0: the road splits in two, each branch ending at two closed doors.
// - mark 0 ("leave"): the left branch lights, its sign "hand it what it needs", a note and a binder pop.
// - mark 1 ("change"): the right branch lights, its sign "change the model", the book with a pen that
//   writes on it; on "fine-tuning" (end of line 1) the tag "fine-tuning" appears by the book.
// - beat 1: the four doors light one after another ("every one of them"), the policy card hovers in
//   over the fork: "Returns: 30 days, unworn, in the box".
// - mark 2 ("fourteen"): "30" is struck and "14" written; a question mark pops over the fork.
import { beatOr, bump, ease, mark } from './memory.ts';
import { clamp01, progress, sceneTime } from './steps.ts';

export type TwoRoadsProps = { marks?: number[] };

export const LEFT_SIGN = 'hand it what it needs';
export const RIGHT_SIGN = 'change the model';
export const FT_TAG = 'fine-tuning';
export const POLICY = ['Returns: 30 days,', 'unworn, in the box'] as const;
export const OLD_DAYS = '30';
export const NEW_DAYS = '14';

export type TwoRoadsState = {
  /** The road and the robot (on screen from frame 0). */
  road: number;
  /** The fork: how far the two branches have grown out of the road. */
  split: number;
  left: { lit: number; sign: number; note: number; binder: number };
  right: { lit: number; sign: number; book: number; pen: number; write: number; tag: number };
  /** Each door's glow, left pair then right pair (0..1, 1 at its pulse, settles to 0.35). */
  doors: number[];
  /** The policy card: shown, its bob phase source, "30" struck, "14" written, the question mark. */
  card: { opacity: number; strike: number; write: number; question: number };
  /** Where the robot looks: -1 left, 0 ahead, 1 right; and its raised arm. */
  look: number;
  armUp: number;
};

export function frameState(props: TwoRoadsProps, t: number, beats: number[], dur: number): TwoRoadsState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = Math.max(b0 + 1.2, beatOr(beats, 1, b0 + 9));
  const leave = Math.max(b0 + 0.6, mark(m, 0, b0 + 3.6));
  const change = Math.max(leave + 0.8, mark(m, 1, b0 + 7.3));
  // "That's fine-tuning": the last words of line 1.
  const ft = Math.max(change + 0.9, b1 - 1.3);
  const fourteen = Math.max(b1 + 1.2, mark(m, 2, b1 + 4.7));
  const cardIn = Math.min(b1 + 2.0, fourteen - 0.9);

  const doors = [0, 1, 2, 3].map((i) => {
    const at = b1 + 0.15 + i * 0.45;
    return clamp01(0.35 * ease(T, at, 0.3) + 0.65 * bump(T, at, 0.9));
  });

  const toLeft = ease(T, leave - 0.2, 0.4) * (1 - ease(T, change - 0.2, 0.4));
  const toRight = ease(T, change - 0.2, 0.4) * (1 - ease(T, b1, 0.5));
  return {
    road: 1,
    split: ease(T, b0, 1.2),
    left: {
      lit: ease(T, leave - 0.1, 0.5),
      sign: ease(T, leave, 0.5),
      note: ease(T, leave + 0.3, 0.45),
      binder: ease(T, leave + 0.8, 0.45),
    },
    right: {
      lit: ease(T, change - 0.1, 0.5),
      sign: ease(T, change, 0.5),
      book: ease(T, change + 0.3, 0.45),
      pen: ease(T, change + 0.7, 0.4),
      write: progress(T, change + 1.0, 1.6),
      tag: ease(T, ft, 0.45),
    },
    doors,
    card: {
      opacity: ease(T, cardIn, 0.6),
      strike: ease(T, fourteen - 0.25, 0.35),
      write: progress(T, fourteen + 0.05, 0.7),
      question: ease(T, fourteen + 0.9, 0.4),
    },
    look: toRight - toLeft,
    armUp: ease(T, fourteen + 0.6, 0.5),
  };
}
