// Pure state of the robot's office, the whole memory at once (rows 35-38).
// Objects: the bookshelf in its head (training), the desk (working memory), the notecard
// (summary), the filing cabinet (searchable notebook), the clipboard form (fixed boxes).
// - cold: the robot at its desk holds up the red slip; the other objects are dim outlines.
// - layers: the slip pulses ("the message"); the objects light up one by one; then all but the
//   head shelf and the desk dim again. Marks: [message, layers, bit, each, way].
// - verdict (rows 35-37): pull back; each object lights with its crack as it is named (the desk,
//   the summary, the search, the form; the head shelf stays dim: it is not on the job); then the
//   human version, each on its word: a head with a card, an inbox, a note "FLIGHT FRI" on the fridge.
//   Marks: [best, desk, summary, search, form, head, email, fridge].
// - advice (row 38): the cracks heal; the slip goes onto the notecard on the desk; the clipboard
//   lights up and is linked to it; "what my tests point to" and the recipe built item by item
//   (SUMMARY, FORM with a named box), with "not tested together yet" under it.
//   Marks: [tests, summary, named].
// - human (the reel, row 8): the office as it is, every object softly lit and none cracked; the
//   human version comes in on its words: a head with a card, an inbox, the note on the fridge.
//   Marks: [head, email, fridge].
// No Remotion or React here.
import { beatOr, blinkAt, ease, loopTime, mark, pickMode } from './memory.ts';
import { sceneTime } from './steps.ts';

export const OFFICE_MODES = ['cold', 'layers', 'verdict', 'advice', 'human'] as const;
export type OfficeMode = (typeof OFFICE_MODES)[number];
export type MemoryOfficeProps = { mode: OfficeMode; marks?: number[] };

export const OBJECTS = ['head', 'desk', 'card', 'cabinet', 'clipboard'] as const;
export type OfficeObject = (typeof OBJECTS)[number];
export const ADVICE_LINE = 'what my tests point to';
/** The recipe, built item by item in the advice scene. */
export const RECIPE = ['SUMMARY', 'FORM with a named box'] as const;
/** Said in the voice too: the combination was never tested as a pair. */
export const UNTESTED = 'not tested together yet';
/** The note on the fridge (the human version of a named box). */
export const FRIDGE_NOTE = 'FLIGHT FRI';

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
  /** The human version (verdict): a head with a card, an inbox, a note on the fridge. */
  human: number[];
  /** Recipe items (advice), 0..1 each. */
  recipe: number[];
  /** "not tested together yet" under the recipe. */
  untested: number;
};

const NONE = { human: [0, 0, 0], recipe: [0, 0], untested: 0 };

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

  if (mode === 'human') {
    const human: number[] = [];
    [0, 1, 2].forEach((k) => {
      const prev = k === 0 ? b0 : human[k - 1] + 0.3;
      human.push(Math.max(prev, mark(m, k, b0 + 1 + 1.6 * k)));
    });
    return {
      lit: [0.25, 0.55, 0.55, 0.55, 0.55],
      crack: [0, 0, 0, 0, 0],
      robot: { bob, armUp: 1, blink },
      slip: { opacity: 1, onCard: 0, glow: 0 },
      zoom: 1.06 - 0.06 * ease(T, 0, 1.6),
      links: [0, 0],
      line: 0,
      ...NONE,
      human: human.map((h) => ease(T, h - 0.2, 0.5)),
    };
  }

  if (mode === 'verdict') {
    // Each object on its own mark, in the order named, never before the previous one.
    const at: number[] = [];
    [0, 1, 2, 3].forEach((k) => {
      const prev = at[k - 1];
      const fb = prev === undefined ? b1 + 0.4 : prev + 1.6;
      at.push(prev === undefined ? mark(m, 1 + k, fb) : Math.max(prev + 0.3, mark(m, 1 + k, fb)));
    });
    const b2 = beatOr(beats, 2, at[3] + 2.5);
    const human: number[] = [];
    [0, 1, 2].forEach((k) => {
      const prev = human.length ? human[k - 1] : at[3] + 0.6;
      human.push(Math.max(prev + 0.3, mark(m, 5 + k, b2 + 3 + 2.2 * k)));
    });
    return {
      lit: [0.25, ...at.map((a) => 0.3 + 0.7 * ease(T, a - 0.1, 0.4))],
      crack: [0, ...at.map((a) => ease(T, a, 0.4))],
      robot: { bob, armUp: 1, blink },
      slip: { opacity: 1, onCard: 0, glow: 0 },
      zoom: 1.12 - 0.12 * ease(T, 0, 1.6),
      links: [0, 0],
      line: 0,
      ...NONE,
      human: human.map((h) => ease(T, h - 0.2, 0.5)),
    };
  }

  // advice
  const tests = mark(m, 0, b0 + 0.6);
  const summary = Math.max(tests + 0.4, mark(m, 1, b0 + 5.6));
  const named = Math.max(summary + 0.6, mark(m, 2, b0 + 7.6));
  const heal = 1 - ease(T, 0, 0.6);
  const onCard = ease(T, summary - 0.2, 0.8);
  return {
    lit: [0.25, 0.8, ease(T, summary - 0.1, 0.4), 0.3, 0.3 + 0.7 * ease(T, named - 0.1, 0.4)],
    crack: [0, heal, heal, heal, heal],
    robot: { bob, armUp: 1 - onCard, blink },
    slip: { opacity: 1, onCard, glow: 0 },
    zoom: 1,
    links: [0, ease(T, named, 0.6)],
    line: ease(T, tests - 0.1, 0.5),
    human: [0, 0, 0],
    recipe: [ease(T, summary - 0.1, 0.4), ease(T, named - 0.1, 0.4)],
    untested: ease(T, named + 0.8, 0.5),
  };
}
