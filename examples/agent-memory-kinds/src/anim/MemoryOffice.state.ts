// Pure state of the robot's office, the whole memory at once (scenes 1, 4, 13, 14).
// Objects: the bookshelf in its head (training), the desk (working memory), the notecard
// (summary), the filing cabinet (searchable notebook), the clipboard form (fixed boxes).
// - cold: the robot at its desk holds up the red slip; the other objects are dim outlines.
// - layers: the slip pulses ("the message"); the objects light up one by one; then all but the
//   head shelf and the desk dim again. Marks: [message, layers, bit, each, way].
// - verdict: pull back; every object on the job shows its crack, one after another.
//   Marks: [job, best, each, different].
// - advice: the cracks heal; the slip goes onto the notecard on the desk, the cabinet and the
//   clipboard light up and are linked to it; a small line: "what my tests point to".
//   Marks: [people, gist, notebook, box, matter].
// No Remotion or React here.
import { beatOr, blinkAt, ease, loopTime, mark, pickMode } from './memory.ts';
import { sceneTime } from './steps.ts';

export const OFFICE_MODES = ['cold', 'layers', 'verdict', 'advice'] as const;
export type OfficeMode = (typeof OFFICE_MODES)[number];
export type MemoryOfficeProps = { mode: OfficeMode; marks?: number[] };

export const OBJECTS = ['head', 'desk', 'card', 'cabinet', 'clipboard'] as const;
export type OfficeObject = (typeof OBJECTS)[number];
export const ADVICE_LINE = 'what my tests point to';

export type OfficeState = {
  /** Per object (OBJECTS order): 0 = dim outline, 1 = lit. */
  lit: number[];
  /** Per object: its crack (how it fails). The head shelf never cracks: it is not on the job. */
  crack: number[];
  robot: { bob: number; armUp: number; blink: number };
  /** onCard: 0 = held up by the robot, 1 = lying on the notecard. */
  slip: { opacity: number; onCard: number; glow: number };
  zoom: number;
  /** Links from the notecard: to the cabinet, to the clipboard. */
  links: number[];
  line: number;
};

const idle = (tm: number) => ({ bob: Math.sin(tm * 2.4), blink: blinkAt(tm, 2.6) });

export function frameState(props: MemoryOfficeProps, t: number, beats: number[], dur: number): OfficeState {
  const mode = pickMode(props.mode, OFFICE_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const tm = loopTime(t, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 2.8);
  const { bob, blink } = idle(tm);

  if (mode === 'cold') {
    return {
      lit: [0, 0.6, 0, 0, 0],
      crack: [0, 0, 0, 0, 0],
      robot: { bob, armUp: 1, blink },
      slip: { opacity: 1, onCard: 0, glow: 0.5 + 0.5 * Math.sin(tm * 3) },
      zoom: 1.04 - 0.04 * ease(T, 0, 3),
      links: [0, 0],
      line: 0,
    };
  }

  if (mode === 'layers') {
    const message = mark(m, 0, b0 + 1.8);
    const layers = mark(m, 1, b1 + 1.2);
    const bit = mark(m, 2, b1 + 1.9);
    const each = mark(m, 3, b1 + 3.0);
    const way = mark(m, 4, b1 + 4.4);
    const restIn = [0, 1, 2].map((k) => ease(T, each + 0.3 * k, 0.4));
    const dim = ease(T, way + 0.3, 0.6);
    return {
      lit: [ease(T, layers - 0.1, 0.4), 0.6 + 0.4 * ease(T, bit - 0.1, 0.4), ...restIn.map((r) => r * (1 - 0.8 * dim))],
      crack: [0, 0, 0, 0, 0],
      robot: { bob, armUp: 1, blink },
      slip: { opacity: 1, onCard: 0, glow: ease(T, message - 0.1, 0.3) * (1 - ease(T, message + 0.6, 0.6)) },
      zoom: 1,
      links: [0, 0],
      line: 0,
    };
  }

  if (mode === 'verdict') {
    const each = mark(m, 2, b1 + 0.3);
    const on = ease(T, 0, 0.5);
    return {
      lit: [1 - 0.75 * on, 1, 0.3 + 0.7 * on, 0.3 + 0.7 * on, 0.3 + 0.7 * on],
      crack: [0, ...[0, 1, 2, 3].map((k) => ease(T, each + 0.35 * k, 0.4))],
      robot: { bob, armUp: 1, blink },
      slip: { opacity: 1, onCard: 0, glow: 0 },
      zoom: 1.12 - 0.12 * ease(T, 0, 1.6),
      links: [0, 0],
      line: 0,
    };
  }

  // advice
  const people = mark(m, 0, b0 + 0.4);
  const gist = mark(m, 1, b0 + 2.4);
  const notebook = mark(m, 2, b0 + 3.6);
  const box = mark(m, 3, b0 + 4.8);
  const heal = 1 - ease(T, 0, 0.6);
  const onCard = ease(T, gist - 0.2, 0.8);
  return {
    lit: [0.25, 0.8, ease(T, gist - 0.1, 0.4), 0.3 + 0.7 * ease(T, notebook - 0.1, 0.4), 0.3 + 0.7 * ease(T, box - 0.1, 0.4)],
    crack: [0, heal, heal, heal, heal],
    robot: { bob, armUp: 1 - onCard, blink },
    slip: { opacity: 1, onCard, glow: 0 },
    zoom: 1,
    links: [ease(T, notebook, 0.6), ease(T, box, 0.6)],
    line: ease(T, people, 0.5),
  };
}
