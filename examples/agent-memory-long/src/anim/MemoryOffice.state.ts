// Pure state of the robot's office, the whole memory at once (scenes 1, 4, 13, 14).
// Objects: the bookshelf in its head (training), the desk (working memory), the notecard
// (summary), the filing cabinet (searchable notebook), the clipboard form (fixed boxes).
// - cold: the robot at its desk holds up the red slip; the other objects are dim outlines.
// - layers: the slip pulses ("the message"); the objects light up one by one; then all but the
//   head shelf and the desk dim again. Marks: [message, layers, bit, each, way].
// - verdict: pull back; each object lights as it is named, the ones on the job with their crack
//   (the head shelf lights and never cracks: it is not on the job); then the human version: a
//   head with a card, a notebook, a note on the fridge.
//   Marks: [job, best, desk, summary, notebook, form, training, life].
// - advice: the cracks heal; the slip goes onto the notecard on the desk, the cabinet and the
//   clipboard light up and are linked to it; "what my tests point to" and the recipe built item by
//   item (summary + notebook, a named box, the record beside it on some models).
//   Marks: [people, gist, notebook, box, record].
// No Remotion or React here.
import { beatOr, blinkAt, ease, loopTime, mark, pickMode } from './memory.ts';
import { sceneTime } from './steps.ts';

export const OFFICE_MODES = ['cold', 'layers', 'verdict', 'advice'] as const;
export type OfficeMode = (typeof OFFICE_MODES)[number];
export type MemoryOfficeProps = { mode: OfficeMode; marks?: number[] };

export const OBJECTS = ['head', 'desk', 'card', 'cabinet', 'clipboard'] as const;
export type OfficeObject = (typeof OBJECTS)[number];
export const ADVICE_LINE = 'what my tests point to';
/** The recipe, built item by item in the advice scene. */
export const RECIPE = ['SUMMARY (+ NOTEBOOK)', 'FORM with a named box', '+ the record (some models)'] as const;

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
  /** The human version (verdict): a head with a card, a notebook, a note on the fridge. */
  human: number[];
  /** Recipe items (advice), 0..1 each. */
  recipe: number[];
  /** The day's record beside the clipboard (advice, "some models"). */
  record: number;
};

const NONE = { human: [0, 0, 0], recipe: [0, 0, 0], record: 0 };

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
      ...NONE,
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
      ...NONE,
    };
  }

  if (mode === 'verdict') {
    // Each object on its own mark, in the order named, never before the previous one.
    const at: number[] = [];
    [0, 1, 2, 3].forEach((k) => {
      const prev = at[k - 1];
      const fb = prev === undefined ? b1 + 1.6 : prev + 1.6;
      at.push(prev === undefined ? mark(m, 2 + k, fb) : Math.max(prev + 0.3, mark(m, 2 + k, fb)));
    });
    const training = Math.min(at[0] - 0.3, mark(m, 6, at[0] - 1.4));
    const b2 = beatOr(beats, 2, at[3] + 2.5);
    const life = Math.max(at[3] + 0.8, mark(m, 7, b2 + 0.4));
    const human = [0, 1, 2].map((k) => ease(T, life + 1.4 * k, 0.5));
    return {
      lit: [0.25 + 0.75 * ease(T, training - 0.1, 0.4) * (1 - 0.7 * ease(T, at[0], 0.5)), ...at.map((a) => 0.3 + 0.7 * ease(T, a - 0.1, 0.4))],
      crack: [0, ...at.map((a) => ease(T, a, 0.4))],
      robot: { bob, armUp: 1, blink },
      slip: { opacity: 1, onCard: 0, glow: 0 },
      zoom: 1.12 - 0.12 * ease(T, 0, 1.6),
      links: [0, 0],
      line: 0,
      ...NONE,
      human,
    };
  }

  // advice
  const people = mark(m, 0, b0 + 0.4);
  const gist = mark(m, 1, b0 + 2.4);
  const notebook = mark(m, 2, b0 + 3.6);
  const box = mark(m, 3, b0 + 4.8);
  const recordAt = Math.max(box + 0.6, mark(m, 4, box + 2.4));
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
    human: [0, 0, 0],
    recipe: [ease(T, gist - 0.1, 0.4), ease(T, box - 0.1, 0.4), ease(T, recordAt - 0.1, 0.4)],
    record: ease(T, recordAt - 0.1, 0.5),
  };
}
