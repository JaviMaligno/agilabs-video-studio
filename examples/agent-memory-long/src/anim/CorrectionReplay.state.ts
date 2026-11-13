// Pure state of the flaw in my own test (rows 45-47).
// - line 0: "same model · same seeds"; bars for the correction taken: form 12/12, the day's record
//   3/12; on "wasn't" a question mark over the gap.
// - line 1: the slip comes up with the pallet it names clipped to it; a replay panel ("earlier")
//   shows that same pallet on shelf 0 leaving the warehouse; the robot, which watched it go,
//   frowns at the slip.
// - line 2: the fixed message (the pallet no longer on it, a tick); the replay clears and the
//   record's bar redraws to 10/12 next to the form's 12/12, tagged "fixed message".
// Marks: [results, form, record, wasnt, message, named, left, doubt, sense, both].
// No Remotion or React here.
import { beatOr, blinkAt, ease, lerp, loopTime, mark } from './memory.ts';
import { sceneTime } from './steps.ts';

export type CorrectionReplayProps = { marks?: number[] };

export const HEADER = 'same model · same seeds';
export const FIXED_TAG = 'fixed message';
/** Corrections taken, out of 12 episodes (source: 12/12 vs 3/12; with the fixed notice 12/12 vs 10/12). */
export const EPISODES = 12;
export const FORM = 12;
export const RECORD = { before: 3, after: 10 } as const;
export const REPLAY_TAG = '◀◀ earlier';

export type CorrectionReplayState = {
  header: number;
  bars: { opacity: number; form: number; record: number; recordValue: number; text: string };
  question: number;
  slip: { opacity: number; icon: number; link: number; tick: number };
  replay: { opacity: number; leave: number };
  robot: { frown: number; question: number; blink: number };
  fixedTag: number;
};

export function frameState(props: CorrectionReplayProps, t: number, beats: number[], dur: number): CorrectionReplayState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 9.5);
  const b2 = beatOr(beats, 2, b1 + 12);
  const results = mark(m, 0, b0 + 2.4);
  const form = Math.max(results, mark(m, 1, b0 + 4.2));
  const record = Math.max(form + 0.6, mark(m, 2, b0 + 6.0));
  const wasnt = Math.max(record + 0.6, mark(m, 3, b0 + 8.4));
  const message = mark(m, 4, b1 + 0.6);
  const named = Math.max(message + 0.4, mark(m, 5, b1 + 2.4));
  const left = Math.max(named + 0.4, mark(m, 6, b1 + 4.0));
  const doubt = Math.max(left + 0.8, mark(m, 7, b1 + 7.6));
  const sense = mark(m, 8, b2 + 1.0);
  const both = Math.max(sense + 0.5, mark(m, 9, b2 + 2.0));
  const fix = ease(T, both - 0.1, 1.0);
  const recordValue = lerp(RECORD.before, RECORD.after, fix);
  const unfix = 1 - ease(T, sense - 0.1, 0.5);
  return {
    header: ease(T, results - 0.3, 0.4),
    bars: {
      opacity: ease(T, results - 0.2, 0.4),
      form: ease(T, form - 0.1, 0.8),
      record: ease(T, record - 0.1, 0.8),
      recordValue,
      text: `${fix >= 0.5 ? RECORD.after : RECORD.before}/${EPISODES}`,
    },
    question: ease(T, wasnt - 0.1, 0.4) * (1 - ease(T, message - 0.3, 0.4)),
    slip: { opacity: ease(T, message - 0.3, 0.4), icon: ease(T, named - 0.2, 0.4) * unfix, link: ease(T, left - 0.2, 0.4) * unfix, tick: ease(T, sense + 0.3, 0.35) },
    replay: { opacity: ease(T, named, 0.4) * unfix, leave: ease(T, left, 1.6) },
    robot: { frown: ease(T, doubt - 0.2, 0.4) * unfix, question: ease(T, doubt, 0.4) * unfix, blink: blinkAt(tm, 2.6) },
    fixedTag: ease(T, both + 0.4, 0.4),
  };
}
