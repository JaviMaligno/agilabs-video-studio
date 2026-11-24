// Pure state of the four doors (rows 2-4 and 39). Door order, left to right:
// 0 the prompt (smallest), 1 looking it up | robot | 2 full fine-tuning (biggest), 3 LoRA.
// - intro (rows 2-4): from frame 0 the robot stands before ONE big door ("sounds like one thing");
//   on "four" it gives way to four closed, unlabelled doors of different sizes. On "thorough" the
//   biggest door glows and the robot points at it; on "damage" a crack runs across it. On
//   "cheapest" the smallest door gets a price tag "free" and the robot points at it. On
//   "knowledge" the title "How an AI learns" appears above.
//   Marks: [four, thorough, damage, cheapest, knowledge].
// - labelled (row 39): the same four doors (the crack and the "free" tag kept) from frame 0;
//   their labels and the two side headings write in on the first beat; on "which" every door
//   pulses; on "note" the two left doors light and open a little; on "fine" the right two light.
//   Marks: [which, note, fine].
// No Remotion or React here.
import { beatOr, blinkAt, bump, ease, loopTime, mark, pickMode } from './memory.ts';
import { clamp01, fit, sceneTime } from './steps.ts';

export const DOOR_MODES = ['intro', 'labelled'] as const;
export type DoorMode = (typeof DOOR_MODES)[number];
export type FourDoorsProps = { mode?: DoorMode; marks?: number[] };

export const TITLE = 'How an AI learns';
/** The fixed names, term and analogy. */
export const DOOR_LABELS = [
  ['the prompt', '(the note)'],
  ['retrieval', '(the manual)'],
  ['full fine-tuning', '(rewriting the book)'],
  ['LoRA', '(the clear sheet)'],
] as const;
export const SIDES = ['hand it what it needs', 'change the model'] as const;
export const FREE = 'free';

export type DoorState = { appear: number; lit: number; glow: number; open: number; label: number };

export type FourDoorsState = {
  /** The single door of "one thing" (intro), fading as the four arrive. */
  one: number;
  doors: DoorState[];
  /** The crack across the full fine-tuning door, the "free" tag on the prompt door. */
  crack: number;
  tag: number;
  /** A gentle swing of the tag, in degrees (finite, small). */
  swing: number;
  title: number;
  /** The side headings (labelled). */
  sides: number;
  /** Robot: arm raised (pointing), facing right (1) or left (0), blink, bob. */
  arm: number;
  right: number;
  blink: number;
  bob: number;
};

export function frameState(props: FourDoorsProps, t: number, beats: number[], dur: number): FourDoorsState {
  const mode = pickMode(props.mode, DOOR_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const blink = blinkAt(tm);
  const bob = clamp01(0.5 + 0.5 * Math.sin(tm * 1.8));

  if (mode === 'intro') {
    const four = fit(mark(m, 0, b0 + 2.8), 1.2, dur);
    const thorough = Math.max(four + 0.4, mark(m, 1, beatOr(beats, 1, b0 + 7) + 2.8));
    const damage = Math.max(thorough + 0.4, mark(m, 2, thorough + 2.5));
    const cheapest = Math.max(damage + 0.4, mark(m, 3, beatOr(beats, 2, damage + 1.2) + 2.5));
    const knowledge = Math.max(cheapest + 0.4, mark(m, 4, cheapest + 2.9));
    const appear = [0, 1, 2, 3].map((i) => ease(T, four - 0.15 + i * 0.22, 0.4));
    const tag = ease(T, fit(cheapest - 0.1, 0.5, dur), 0.5);
    const pointR = ease(T, fit(thorough - 0.2, 0.4, dur), 0.4) * (1 - ease(T, cheapest - 0.7, 0.3));
    const pointL = ease(T, fit(cheapest - 0.2, 0.4, dur), 0.4);
    return {
      one: 1 - ease(T, four - 0.2, 0.4),
      doors: appear.map((a, i) => ({
        appear: a,
        lit: i === 2 ? ease(T, thorough - 0.15, 0.4) : i === 0 ? ease(T, cheapest - 0.1, 0.4) : 0,
        glow: i === 2 ? Math.max(bump(T, thorough - 0.15, 1.6), 0.5 * ease(T, thorough, 0.4)) : i === 0 ? bump(T, cheapest - 0.1, 1.4) : 0,
        open: 0,
        label: 0,
      })),
      crack: ease(T, fit(damage - 0.1, 0.7, dur), 0.7),
      tag,
      swing: tag > 0 ? 8 * Math.sin(tm * 3) * (1 - 0.7 * tag) : 0,
      title: ease(T, fit(knowledge - 0.2, 0.6, dur), 0.6),
      sides: 0,
      arm: Math.max(pointR, pointL),
      right: pointL > 0 ? 0 : 1,
      blink,
      bob,
    };
  }

  // labelled: a chapter card covers the first seconds; the labels write in on the first beat.
  const which = Math.max(b0 + 0.3, mark(m, 0, b0 + 3.2));
  const note = Math.max(which + 0.4, mark(m, 1, b0 + 4.8));
  const fine = Math.max(note + 0.4, mark(m, 2, b0 + 7));
  const lab = [0, 1, 2, 3].map((i) => ease(T, fit(b0 + 0.4 + i * 0.35, 0.5, dur), 0.5));
  const pulse = bump(T, which - 0.1, 1.0);
  const left = ease(T, note - 0.1, 0.5);
  const right = ease(T, fine - 0.1, 0.5);
  return {
    one: 0,
    doors: [0, 1, 2, 3].map((i) => {
      const on = i < 2 ? left : right * 0.8;
      return { appear: 1, lit: Math.max(pulse, on), glow: Math.max(pulse * 0.7, on * 0.7), open: i < 2 ? 0.35 * left : 0.2 * right, label: lab[i] };
    }),
    crack: 1,
    tag: 1,
    swing: 2.5 * Math.sin(tm * 3),
    title: 0,
    sides: ease(T, fit(b0 + 0.2, 0.5, dur), 0.5),
    arm: 0,
    right: 1,
    blink,
    bob,
  };
}
