// Pure state of the desk: working memory, and the summary that replaces it.
// - work (rows 9-10): the desk lights with its instruction card; the conversation piles up as pages
//   under the red slip "FLIGHT: FRIDAY", which stays on top; the robot reads it and, on the small
//   calendar, Friday gets the tick. Marks: [desk, conversation, Friday, use].
// - crowded (rows 11-12): hotel cards, price tags and a map land on top until the slip is buried; a
//   strip of ~600 decisions fills with ticks and one red mark ("1 in ~600"), a second model's strip
//   with one in four red. Marks: [buries, best, another, hotels].
// - wiped (row 13): a new chat: the pile and the slip slide off, the desk is bare in morning light,
//   and a small card says "Hi! How can I help you today?"; a dashed slip (what a memory feature
//   could put back) hovers in and fades. Marks: [new, clean, unless, nothing].
// - full (row 14): the slip on the desk; pages pile over it, the gauge goes amber, pages spill off
//   the edge; a fork names the two ways out (SUMMARY / NOTEBOOK). Marks: [desk, long, room, go, two].
// - summary (rows 15-20): the pile is squeezed into one notecard ("trip plans"); a speech bubble (a
//   meeting) loses its words and keeps the gist; the slip hovers over the card ("will Friday make
//   the cut?"); it drops in and the card gains "flight: Friday", and a row of ticks (one miss) fills
//   for the recent model; an older model (the robot greyed) squeezes a smaller card that loses the
//   line, a clock runs and reds pile up towards the end of its row; back to the recent model, its
//   card ticked. Marks: [writes, gist, meeting, decides, cut, wrote, almost, older, slipped, good].
// No Remotion or React here.
import { beatOr, ease, mark, pickMode } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

export const DESK_MODES = ['full', 'summary', 'work', 'crowded', 'wiped'] as const;
export type DeskMode = (typeof DESK_MODES)[number];
export type MemoryDeskProps = { mode: DeskMode; marks?: number[] };

/** Pages on a full desk. */
export const MAX_PAGES = 11;
/** Pages the conversation reaches while the slip is still on top (work). */
export const WORK_PAGES = 5;
/** Pages on the crowded desk (tall, not yet spilling). */
export const CROWDED_PAGES = 10;
/** What the summary card says about the conversation, and the line it gains: the correction. */
export const CARD_TEXT = 'trip plans';
export const DETAIL_TEXT = 'flight: Friday';
/** The row of ticks for the recent model: cells, and its one miss. */
export const ROW_CELLS = 12;
export const RECENT = { label: 'recent model', miss: 7 } as const;
/** The older summariser's row: reds that pile up as the day gets longer. */
export const OLD_LABEL = 'older model';
export const OLD_REDS = [5, 8, 10, 11] as const;
/** Gauge level of a full desk. */
export const FULL_GAUGE = 0.95;
/** The strip of decisions (crowded): cells, and the misses on each model's strip. */
export const DECISIONS = 600;
export const MISSES_ONE = 1;
/** "Another got a quarter of them wrong": one in four. */
export const MISSES_OTHER = 150;
export const ONE_IN_TEXT = '1 in ~600';
export const OTHER_TEXT = 'another model';
/** The two ways to make room (the fork at the edge of the desk). */
export const FORK = ['SUMMARY', 'NOTEBOOK'] as const;
/** The calendar on the desk (work): the day it was, and the day it is. */
export const DAYS = ['THU', 'FRI'] as const;
/** The greeting of a new chat (wiped). */
export const GREETING = 'Hi! How can I help you today?';

export type MemoryDeskState = {
  deskLit: number;
  /** The instruction card on the desk. */
  rules: number;
  /** The slip: shown, how far the pages hide it, lifted onto the pile, its glow (read). */
  slip: { opacity: number; cover: number; top: number; glow: number };
  /** Pages on the pile, 0..MAX_PAGES (the fraction is the top one landing). */
  pages: number;
  spill: number;
  gauge: number;
  amber: number;
  squeeze: number;
  /** The notecard: shown, line 1 written, line 2 ("flight: Friday") written, its glow, how far it
   *  has shrunk (the older model's card), and its tick. */
  card: { opacity: number; write: number; write2: number; glow: number; shrink: number; tick: number };
  /** The slip hovering over the card (summary): shown, and dropped into it. */
  hover: { opacity: number; drop: number; question: number };
  clock: { opacity: number; spin: number };
  /** The recent model's row of ticks: shown, how far it has filled. */
  rows: { opacity: number; fill: number };
  /** The older model: the robot greyed, and its row of reds (shown, filled). */
  old: number;
  reds: { opacity: number; fill: number };
  bubble: { opacity: number; fade: number };
  /** The calendar (work): shown, and Friday's tick. */
  calendar: { opacity: number; tick: number };
  /** The strips of decisions: how far each one has filled (0..1) and the label opacity. */
  strips: { opacity: number; one: number; other: number; label: number };
  fork: number;
  /** A new chat (wiped): the pile sliding off, the morning light, the greeting, the dashed slip. */
  wipe: number;
  morning: number;
  greet: number;
  ghost: number;
};

const none = {
  rules: 0,
  slip: { opacity: 0, cover: 0, top: 0, glow: 0 },
  pages: 0,
  spill: 0,
  gauge: 0,
  amber: 0,
  squeeze: 0,
  card: { opacity: 0, write: 0, write2: 0, glow: 0, shrink: 0, tick: 0 },
  hover: { opacity: 0, drop: 0, question: 0 },
  clock: { opacity: 0, spin: 0 },
  rows: { opacity: 0, fill: 0 },
  old: 0,
  reds: { opacity: 0, fill: 0 },
  bubble: { opacity: 0, fade: 0 },
  calendar: { opacity: 0, tick: 0 },
  strips: { opacity: 0, one: 0, other: 0, label: 0 },
  fork: 0,
  wipe: 0,
  morning: 0,
  greet: 0,
  ghost: 0,
};

export function frameState(props: MemoryDeskProps, t: number, beats: number[], dur: number): MemoryDeskState {
  const mode = pickMode(props.mode, DESK_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 2.6);

  if (mode === 'work') {
    const desk = mark(m, 0, b0 + 0.3);
    const record = mark(m, 1, b0 + 2.4);
    const uses = mark(m, 2, b1 + 0.6);
    const use = Math.max(uses + 0.4, mark(m, 3, b1 + 2.4));
    const pages = WORK_PAGES * progress(T, record, 3);
    return {
      ...none,
      deskLit: ease(T, desk - 0.1, 0.5),
      rules: ease(T, desk + 0.2, 0.5),
      slip: { opacity: ease(T, b0, 0.4), cover: 0, top: 1, glow: ease(T, uses - 0.1, 0.4) },
      pages,
      gauge: (FULL_GAUGE * pages) / MAX_PAGES,
      calendar: { opacity: ease(T, uses - 0.3, 0.4), tick: ease(T, use, 0.35) },
    };
  }

  if (mode === 'crowded') {
    const crowded = mark(m, 0, b0 + 0.5);
    const best = Math.max(crowded, mark(m, 1, b1 + 4));
    const another = Math.max(best + 0.6, mark(m, 2, b1 + 7));
    const hotels = Math.max(crowded + 0.4, mark(m, 3, b0 + 4));
    // The pages that bury the slip land from "buries" to just after "hotels, prices and plans".
    const pages = WORK_PAGES + (CROWDED_PAGES - WORK_PAGES) * progress(T, crowded, Math.max(1.2, hotels + 1.6 - crowded));
    return {
      ...none,
      deskLit: 1,
      rules: 1,
      slip: { opacity: 1, cover: Math.min(1, (pages - WORK_PAGES) / 2), top: 1, glow: 0 },
      pages,
      gauge: (FULL_GAUGE * pages) / MAX_PAGES,
      strips: {
        opacity: ease(T, best - 0.4, 0.4),
        one: progress(T, best, 1.6),
        other: progress(T, another, 1.2),
        label: ease(T, best + 1.6, 0.4),
      },
    };
  }

  if (mode === 'wiped') {
    const fresh = mark(m, 0, b0 + 1.2);
    const clean = Math.max(fresh + 0.4, mark(m, 1, b0 + 2.4));
    const unless = Math.max(clean + 0.4, mark(m, 2, b0 + 3.4));
    const nothing = Math.max(unless + 0.8, mark(m, 3, b0 + 6.5));
    const wipe = ease(T, fresh - 0.1, 0.9);
    return {
      ...none,
      deskLit: 1,
      rules: 1 - wipe,
      slip: { opacity: 1, cover: 1, top: 1, glow: 0 },
      pages: CROWDED_PAGES,
      gauge: (FULL_GAUGE * CROWDED_PAGES * (1 - wipe)) / MAX_PAGES,
      wipe,
      morning: ease(T, clean - 0.4, 0.8),
      greet: ease(T, clean, 0.4),
      ghost: ease(T, unless - 0.1, 0.4) * (1 - ease(T, nothing, 0.6)),
    };
  }

  if (mode === 'full') {
    const desk = mark(m, 0, b0 + 0.3);
    const long = mark(m, 1, b1 + 0.3);
    const room = mark(m, 2, b1 + 1.6);
    const go = mark(m, 3, b1 + 3.0);
    const two = Math.max(go + 0.4, mark(m, 4, go + 1.4));
    const pages = MAX_PAGES * progress(T, long, Math.max(0.6, go - long));
    return {
      ...none,
      deskLit: ease(T, desk - 0.1, 0.5),
      slip: { opacity: 1, cover: Math.min(1, pages / 3), top: 0, glow: 0 },
      pages,
      spill: ease(T, go - 0.1, 0.8),
      gauge: (FULL_GAUGE * pages) / MAX_PAGES,
      amber: ease(T, room, 0.5),
      fork: ease(T, two - 0.1, 0.5),
    };
  }

  // summary
  const squeezeAt = mark(m, 0, b0 + 0.8);
  const gist = Math.max(squeezeAt + 0.6, mark(m, 1, b1 + 2.6));
  const meeting = Math.max(squeezeAt + 0.4, Math.min(gist - 0.4, mark(m, 2, b1 + 1.2)));
  const b2 = beatOr(beats, 2, gist + 1.2);
  const decides = Math.max(gist + 0.6, mark(m, 3, b2 + 1.4));
  const cut = Math.max(decides + 0.4, mark(m, 4, b2 + 4.4));
  const b3 = beatOr(beats, 3, cut + 1.2);
  const wrote = Math.max(cut + 0.6, mark(m, 5, b3 + 1.8));
  const almost = Math.max(wrote + 0.6, mark(m, 6, b3 + 4.4));
  const b4 = beatOr(beats, 4, almost + 1.6);
  const older = Math.max(almost + 1.0, mark(m, 7, b4 + 2.8));
  const slipped = Math.max(older + 0.5, mark(m, 8, b4 + 4.4));
  const b5 = beatOr(beats, 5, slipped + 3);
  const good = Math.max(slipped + 1.2, mark(m, 9, b5 + 3.4));
  const squeeze = ease(T, squeezeAt - 0.1, 0.9);
  const fresh = 1 - ease(T, good - 0.3, 0.6);
  const old = ease(T, older - 0.2, 0.6) * fresh;
  return {
    ...none,
    deskLit: 1,
    slip: { opacity: 1 - squeeze, cover: 1, top: 0, glow: 0 },
    pages: MAX_PAGES,
    spill: 1 - squeeze,
    gauge: FULL_GAUGE - 0.7 * squeeze,
    amber: 1 - squeeze,
    squeeze,
    card: {
      opacity: ease(T, squeezeAt + 0.5, 0.4),
      write: progress(T, squeezeAt + 0.7, 0.9),
      write2: progress(T, wrote, 0.8),
      glow: ease(T, decides - 0.1, 0.4) * (1 - ease(T, wrote + 0.6, 0.4)),
      shrink: old,
      tick: ease(T, good + 0.2, 0.35),
    },
    hover: {
      opacity: ease(T, decides - 0.2, 0.4) * (1 - ease(T, wrote + 0.3, 0.4)),
      drop: ease(T, wrote - 0.2, 0.6),
      question: ease(T, cut - 0.2, 0.3) * (1 - ease(T, wrote - 0.3, 0.3)),
    },
    bubble: { opacity: ease(T, meeting - 0.1, 0.4) * (1 - ease(T, decides - 0.6, 0.4)), fade: ease(T, gist - 0.1, 0.8) },
    rows: { opacity: ease(T, almost - 0.3, 0.4) * (1 - ease(T, older - 0.4, 0.4)), fill: progress(T, almost, 1.2) },
    clock: { opacity: ease(T, older, 0.4) * fresh, spin: progress(T, older, Math.max(1, good - 0.4 - older)) },
    old,
    reds: { opacity: ease(T, slipped - 0.3, 0.4) * fresh, fill: progress(T, slipped, Math.max(1, Math.min(2.4, good - 0.6 - slipped))) },
  };
}
