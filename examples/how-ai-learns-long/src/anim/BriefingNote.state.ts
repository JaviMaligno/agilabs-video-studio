// Pure state of "the prompt (the note)" (script rows 9-14). No Remotion or React here.
// Six lines, six marks: [note, employee, code, edit, buried, catalogue].
// - line 0 (mark "note"): the robot by its desk; the note slides onto the desk and its rows light as
//   they are named (policy, tone, one good answer); the tag "the prompt (the note)".
// - line 1 (mark "employee"): a shop counter at opening time; Nadia (the cast cutout) pops up behind it
//   reading a note, the sign flips to OPEN, the sun rises; the robot at its own counter mirrors it,
//   and a highlight runs down both notes, twice ("every time").
// - line 2 (mark "code"): three generic app panels, "Instructions", "Project", "GPT", pop one by one,
//   each with the same note pasted in.
// - line 3 (mark "edit"): the note again: "30" struck, "14" written; a new chat answers "14 days".
// - line 4 (mark "buried"): back at the desk; the note grows into a long scroll that spills off the
//   desk to the floor, grey rows pile in above the policy line and push it down; on "buried" it sinks
//   and dims.
// - line 5 (mark "catalogue"): shoe boxes drop into stacks behind the desk and hundreds of product
//   cards pile up behind them.
import { beatOr, bump, ease, mark } from './memory.ts';
import { clamp01, progress, sceneTime } from './steps.ts';

export type BriefingNoteProps = { marks?: number[] };

export const NOTE_TAG = 'the prompt (the note)';
export const TONE = 'Tone: friendly, short';
export const EXAMPLE_HEAD = 'A good answer:';
export const EXAMPLE = '"Sure! Unworn and boxed? Send them back."';
export const PANELS = ['Instructions', 'Project', 'GPT'] as const;
export const CHAT_Q = 'How long do I have to return shoes?';
export const CHAT_A = '14 days, unworn, in the box.';
/** Shoe boxes in the stacks behind the desk, and product cards piled behind them. */
export const BOXES = 14;
export const CARDS = 180;

export type BriefingNoteState = {
  /** Phase opacities: the desk scene (lines 0, 4, 5), the counters (1), the panels (2), the edit (3). */
  desk: number;
  counters: number;
  panels: number;
  edit: number;
  /** The note on the desk: slid in, its rows lit (policy, tone, example), the tag. */
  note: { slide: number; rows: number[]; tag: number; feed: number };
  /** Line 1: the assistant popping up, the OPEN sign, the sun, the reading highlight (-1 = none). */
  assistant: number;
  open: number;
  sun: number;
  read: number;
  /** Line 2: each panel's pop and the note landing in it. */
  panel: { pop: number; paste: number }[];
  /** Line 3: strike, write, the chat sliding in, the answer typed, its tick. */
  strike: number;
  write: number;
  chat: number;
  answer: number;
  tick: number;
  /** Line 4: the scroll's growth, the policy line's sinking and its dimming, the red ring. */
  scroll: number;
  sink: number;
  dim: number;
  ring: number;
  /** Line 5: boxes landed (0..BOXES), product cards shown (0..CARDS), the robot's alarm. */
  boxes: number;
  cards: number;
  alarm: number;
};

export function frameState(props: BriefingNoteProps, t: number, beats: number[], dur: number): BriefingNoteState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  // Beats, kept in order even when some are missing or out of order.
  const b = [0, 1, 2, 3, 4, 5].reduce<number[]>((acc, i) => {
    const prev = i === 0 ? 0 : acc[i - 1];
    const fb = i === 0 ? 1.2 : prev + 6.5;
    acc.push(Math.max(i === 0 ? 0 : prev + 1.5, beatOr(beats, i, fb)));
    return acc;
  }, []);
  const end = (i: number) => (i < 5 ? b[i + 1] - 0.35 : b[5] + 3.6);
  const at = (i: number, frac: number) => b[i] + frac * Math.max(0.5, end(i) - b[i]);
  const mk = (i: number, frac: number) => Math.min(end(i), Math.max(b[i], mark(m, i, at(i, frac))));

  const noteAt = mk(0, 0.13);
  const employee = mk(1, 0.26);
  const code = mk(2, 0.3);
  const editAt = mk(3, 0.48);
  const buried = Math.min(end(4) + 0.5, Math.max(b[4] + 1.2, mark(m, 4, at(4, 0.92))));
  const catalogue = mk(5, 0.36);

  // Phase cross-fades on the beats.
  const toCounters = ease(T, b[1] - 0.2, 0.5);
  // The counters stay until the first panel pops on "code", so the screen is never empty.
  const toPanels = ease(T, Math.max(b[2] - 0.2, code + 0.1), 0.45);
  const toEdit = ease(T, b[3] - 0.2, 0.5);
  const toDesk = ease(T, b[4] - 0.2, 0.5);
  const desk = clamp01(1 - toCounters + toDesk);
  const counters = clamp01(toCounters - toPanels);
  const panels = clamp01(toPanels - toEdit);
  const edit = clamp01(toEdit - toDesk);

  // The rows light as they are named: "your policy, your tone, one example of a good answer".
  const rowAt = [at(0, 0.55), at(0, 0.66), at(0, 0.76)];
  const rows = rowAt.map((r, i) => {
    const next = i < 2 ? rowAt[i + 1] : at(0, 0.9);
    return clamp01(ease(T, r - 0.1, 0.3) * (1 - 0.6 * ease(T, next, 0.3)));
  });

  // "They read all of it, every time": two sweeps down the note.
  const readFrom = Math.max(employee + 1.2, at(1, 0.5));
  const sweep = (T - readFrom) / 1.3;
  const read = sweep < 0 || sweep >= 2 || T >= end(1) + 0.2 ? -1 : sweep % 1;

  const panel = PANELS.map((_, i) => {
    const p = Math.min(end(2) - 0.6, code + 0.05 + i * 1.15);
    return { pop: ease(T, p, 0.4), paste: ease(T, p + 0.35, 0.4) };
  });

  const nextChat = Math.min(end(3) - 1.6, editAt + 0.9);
  const grow = Math.max(b[4] + 1.0, Math.min(buried - 2.6, at(4, 0.42)));

  return {
    desk,
    counters,
    panels,
    edit,
    note: { slide: ease(T, noteAt - 0.3, 0.7), rows, feed: progress(T, at(0, 0.3), 0.9), tag: ease(T, at(0, 0.88), 0.4) * (1 - ease(T, grow, 0.5)) },
    assistant: ease(T, employee - 0.15, 0.45),
    open: progress(T, employee + 0.5, 0.6),
    sun: ease(T, employee + 0.4, 1.2),
    read,
    panel,
    strike: ease(T, editAt - 0.15, 0.35),
    write: progress(T, editAt + 0.25, 0.7),
    chat: ease(T, nextChat - 0.2, 0.5),
    answer: progress(T, nextChat + 0.2, 0.7),
    tick: ease(T, nextChat + 1.0, 0.35),
    scroll: ease(T, grow, Math.max(0.8, buried - 0.4 - grow)),
    sink: ease(T, grow + 0.3, Math.max(0.8, buried - 0.1 - grow)),
    dim: ease(T, buried - 0.3, 0.5),
    ring: bump(T, buried - 0.1, 1.2),
    boxes: BOXES * progress(T, catalogue - 0.5, 2.2),
    cards: CARDS * progress(T, catalogue, 2.4),
    alarm: ease(T, catalogue + 0.6, 0.5),
  };
}
