// Pure state of the replay experiment (rows 9-10): a small model trained to be a terminal.
// - line 0: a terminal window types its session; a training stream of terminal blocks flows into
//   the robot's head (its shelf lights); the "terminal task" bar rises while the four "general
//   knowledge" bars sink below their dashed starting level.
// - line 1: one block in ten turns into "old reading" (teal) in the stream; the sunk bars climb back
//   most of the way (~73 % of what each lost) while the terminal bar stays up; the label
//   "10% old reading" then "→ ~73% of the loss recovered".
// Marks: [terminal, learned, worse, mixing, won].
// No Remotion or React here.
import { beatOr, blinkAt, ease, lerp, loopTime, mark } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

export type ReplayBarsProps = { marks?: number[] };

/** Terminal task, exact match on held-out outputs: ~0.36 before, ~0.90 after (source). */
export const TERMINAL = { before: 0.36, after: 0.9 } as const;
/** The general-knowledge bars (illustrative heights) and how much each loses without replay. */
export const GENERAL_BASE = [0.78, 0.7, 0.82, 0.74] as const;
export const GENERAL_DROP = [0.3, 0.18, 0.36, 0.22] as const;
/** Share of the loss won back with 10 % replay (source: "about 73% of the average forgetting"). */
export const RECOVERED = 0.73;
/** One block in this many is old reading once replay is mixed in (10 %). */
export const OLD_EVERY = 10;
export const LABEL_MIX = '10% old reading';
export const LABEL_WON = '→ ~73% of the loss recovered';
export const TERMINAL_LABEL = 'terminal task';
export const GENERAL_LABEL = 'general knowledge';
export const OLD_TAG = 'old reading';
/** The terminal session, typed line by line. */
export const TERMINAL_LINES = ['$ ls', 'notes.txt  plan.md  src/', '$ cat plan.md', '1. sort the inbox', '$ _'] as const;

export type ReplayBarsState = {
  terminal: { opacity: number; typed: number };
  /** The robot whose head takes the stream; `shelf` lights its head shelf. */
  robot: { opacity: number; shelf: number; blink: number };
  /** The training stream: shown, how far it has scrolled (px-free seconds), old reading mixed in. */
  stream: { opacity: number; scroll: number; old: number };
  bars: { opacity: number; terminal: number; general: number[]; ref: number };
  labelMix: number;
  labelWon: number;
};

export function frameState(props: ReplayBarsProps, t: number, beats: number[], dur: number): ReplayBarsState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 9.5);
  const terminal = mark(m, 0, b0 + 3.4);
  const learned = Math.max(terminal + 0.4, mark(m, 1, b0 + 6.2));
  const worse = Math.max(learned + 0.4, mark(m, 2, b0 + 7.6));
  const mixing = mark(m, 3, b1 + 0.1);
  const won = Math.max(mixing + 0.8, mark(m, 4, b1 + 3.6));
  const sink = ease(T, worse - 0.2, 1.2);
  const climb = ease(T, won - 0.2, 1.4);
  return {
    terminal: { opacity: ease(T, b0 - 0.3, 0.4), typed: progress(T, b0 + 0.2, Math.max(1, terminal + 0.6 - b0)) },
    robot: { opacity: 1, shelf: 0.35 + 0.65 * ease(T, terminal, 0.6), blink: blinkAt(tm, 2.7) },
    stream: { opacity: ease(T, terminal - 0.2, 0.5), scroll: tm, old: ease(T, mixing - 0.1, 0.6) },
    bars: {
      opacity: ease(T, b0 - 0.3, 0.5),
      terminal: lerp(TERMINAL.before, TERMINAL.after, ease(T, learned - 0.2, 1.2)),
      general: GENERAL_BASE.map((g, i) => g - GENERAL_DROP[i] * sink + GENERAL_DROP[i] * RECOVERED * climb),
      ref: ease(T, worse, 0.5),
    },
    labelMix: ease(T, mixing + 0.3, 0.4),
    labelWon: ease(T, won, 0.4),
  };
}
