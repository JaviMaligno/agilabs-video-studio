// Pure state of the desk: working memory, and the summary that replaces it.
// - work (rows 13-14): the desk lights with its instruction card; the day's record piles up under
//   the red slip, which stays on top; on the small rack the next pallet goes to shelf 0, tick.
//   Marks: [desk, record, uses, shelf].
// - crowded (rows 15-16): a tall pile, the slip buried; a strip of ~600 decisions fills with
//   ticks and one red mark ("1 in ~600"), a second model's strip with many reds; then the page it
//   needed glows two sheets from the top. Marks: [crowded, whole, another, near].
// - full (row 19): the slip on the desk; pages pile over it, the gauge goes amber, pages spill off
//   the edge; a fork names the two ways out (SUMMARY / NOTEBOOK). Marks: [desk, long, room, go, two].
// - summary: the pile is squeezed into one notecard with "shelf 0: empty" written on it; a speech
//   bubble (a meeting) loses its words and keeps the gist; on the small rack the new pallet goes to
//   shelf 0, tick. Then the rest of the chapter (rows 22-26): the bubble clears and a detail card
//   "shelf 4: quarantine" goes under a new pile, which is squeezed into the card twice while a clock
//   runs; the card gains the line "shelf 4: quarantine"; two rows of ticks, "summary" and "never
//   summarised", nearly equal; the card's "shelf 0: empty" line glows as the pallet goes to shelf 0;
//   an older model (the robot greyed) squeezes a smaller card and a row of reds comes in; back to the
//   recent model, its full card ticked.
//   Marks: [squeeze, gist, meeting, without, kept, detail, two, wrote, often, line, older, lost, good].
// No Remotion or React here.
import { beatOr, ease, mark, pickMode } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

export const DESK_MODES = ['full', 'summary', 'work', 'crowded'] as const;
export type DeskMode = (typeof DESK_MODES)[number];
export type MemoryDeskProps = { mode: DeskMode; marks?: number[] };

/** Pages on a full desk. */
export const MAX_PAGES = 11;
/** Pages the day's record reaches while the slip is still on top (work). */
export const WORK_PAGES = 5;
/** Pages on the crowded desk (tall, not yet spilling). */
export const CROWDED_PAGES = 10;
/** What the summary keeps, written on the notecard. */
export const CARD_TEXT = 'shelf 0: empty';
/** The detail the summary is tested on, and the line it gains on the card. */
export const DETAIL_TEXT = 'shelf 4: quarantine';
/** The two rows of ticks (summary vs never summarised): cells per row and the one miss in each. */
export const ROW_CELLS = 12;
export const ROWS = [
  { label: 'summary', miss: 7 },
  { label: 'never summarised', miss: 3 },
] as const;
/** The older summariser's row: cells marked red (≈ the 0.72-0.75 it fell to). */
export const OLD_LABEL = 'older model';
export const OLD_REDS = [2, 6, 10] as const;
/** Pages piled again between the two summaries of the detail test. */
export const REGROW_PAGES = 6;
/** Gauge level of a full desk. */
export const FULL_GAUGE = 0.95;
/** The strip of decisions (crowded): cells, and the misses on each model's strip. */
export const DECISIONS = 600;
export const MISSES_ONE = 1;
/** "Another missed far more": a quarter of them, as in the source. */
export const MISSES_OTHER = 150;
export const ONE_IN_TEXT = '1 in ~600';
export const OTHER_TEXT = 'another model';
/** The two ways to make room (the fork at the edge of the desk). */
export const FORK = ['SUMMARY', 'NOTEBOOK'] as const;

export type MemoryDeskState = {
  deskLit: number;
  /** The instruction card on the desk. */
  rules: number;
  /** The slip on the desk; `cover` is how far the pages hide it; `top` lifts it onto the pile. */
  slip: { opacity: number; cover: number; top: number };
  /** Pages on the pile, 0..MAX_PAGES (the fraction is the top one landing). */
  pages: number;
  spill: number;
  gauge: number;
  amber: number;
  squeeze: number;
  /** The notecard: shown, line 1 written, line 2 ("shelf 4: quarantine") written, line 1's glow,
   *  how far it has shrunk (the older model's card), and its tick. */
  card: { opacity: number; write: number; write2: number; glow: number; shrink: number; tick: number };
  /** The detail card under the pile, and the clock running through two summaries. */
  detail: number;
  clock: { opacity: number; spin: number };
  /** The rows of ticks (summary vs never summarised): shown, how far they have filled. */
  rows: { opacity: number; fill: number };
  /** The older model: the robot greyed, and its row of reds (shown, filled). */
  old: number;
  reds: { opacity: number; fill: number };
  /** 1 while the detail test piles beside the card (summary, rows 22-23), else 0. */
  aside: number;
  bubble: { opacity: number; fade: number };
  inset: { opacity: number; move: number; tick: number };
  /** The strips of decisions: how far each one has filled (0..1) and the label opacity. */
  strips: { opacity: number; one: number; other: number; label: number };
  /** The page it needed, two sheets from the top, glowing. */
  needed: number;
  fork: number;
};

const none = {
  aside: 0,
  detail: 0,
  clock: { opacity: 0, spin: 0 },
  rows: { opacity: 0, fill: 0 },
  old: 0,
  reds: { opacity: 0, fill: 0 },
  rules: 0,
  strips: { opacity: 0, one: 0, other: 0, label: 0 },
  needed: 0,
  fork: 0,
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
    const shelf = Math.max(uses + 0.4, mark(m, 3, b1 + 2.4));
    return {
      ...none,
      deskLit: ease(T, desk - 0.1, 0.5),
      rules: ease(T, desk + 0.2, 0.5),
      slip: { opacity: ease(T, b0, 0.4), cover: 0, top: 1 },
      pages: WORK_PAGES * progress(T, record, 3),
      spill: 0,
      gauge: (FULL_GAUGE * WORK_PAGES * progress(T, record, 3)) / MAX_PAGES,
      amber: 0,
      squeeze: 0,
      card: { opacity: 0, write: 0, write2: 0, glow: 0, shrink: 0, tick: 0 },
      bubble: { opacity: 0, fade: 0 },
      inset: { opacity: ease(T, uses - 0.3, 0.4), move: ease(T, shelf - 0.6, 0.9), tick: ease(T, shelf + 0.3, 0.35) },
    };
  }

  if (mode === 'crowded') {
    const crowded = mark(m, 0, b0 + 0.5);
    const whole = Math.max(crowded, mark(m, 1, b0 + 4));
    const another = Math.max(whole + 0.6, mark(m, 2, b0 + 8));
    const near = mark(m, 3, b1 + 1.6);
    const pages = WORK_PAGES + (CROWDED_PAGES - WORK_PAGES) * progress(T, crowded, 1.6);
    return {
      ...none,
      deskLit: 1,
      rules: 1,
      slip: { opacity: 1, cover: Math.min(1, (pages - WORK_PAGES) / 2), top: 1 },
      pages,
      spill: 0,
      gauge: (FULL_GAUGE * pages) / MAX_PAGES,
      amber: 0,
      squeeze: 0,
      card: { opacity: 0, write: 0, write2: 0, glow: 0, shrink: 0, tick: 0 },
      bubble: { opacity: 0, fade: 0 },
      inset: { opacity: 0, move: 0, tick: 0 },
      strips: {
        opacity: ease(T, whole - 0.4, 0.4),
        one: progress(T, whole, 1.6),
        other: progress(T, another, 1.2),
        label: ease(T, whole + 1.6, 0.4),
      },
      needed: ease(T, near, 0.5),
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
      slip: { opacity: 1, cover: Math.min(1, pages / 3), top: 0 },
      pages,
      spill: ease(T, go - 0.1, 0.8),
      gauge: (FULL_GAUGE * pages) / MAX_PAGES,
      amber: ease(T, room, 0.5),
      squeeze: 0,
      card: { opacity: 0, write: 0, write2: 0, glow: 0, shrink: 0, tick: 0 },
      bubble: { opacity: 0, fade: 0 },
      inset: { opacity: 0, move: 0, tick: 0 },
      fork: ease(T, two - 0.1, 0.5),
    };
  }

  // summary
  const squeezeAt = mark(m, 0, b0 + 0.8);
  const gist = mark(m, 1, b0 + 2.8);
  const meeting = mark(m, 2, b0 + 3.6);
  const without = mark(m, 3, b0 + 4.8);
  const kept = mark(m, 4, b1 + 0.9);
  const b2 = beatOr(beats, 2, without + 2);
  const b3 = beatOr(beats, 3, b2 + 11);
  const b5 = beatOr(beats, 5, kept + 4);
  const b6 = beatOr(beats, 6, b5 + 8);
  const detailAt = Math.max(without + 1, mark(m, 5, b2 + 6.5));
  const two = Math.max(detailAt + 1.8, mark(m, 6, b2 + 9.5));
  const wrote = Math.max(two + 1.6, mark(m, 7, b3 + 2.6));
  const often = Math.max(wrote + 0.6, mark(m, 8, b3 + 5.5));
  const line = Math.max(often + 1.4, mark(m, 9, kept - 2.5));
  const older = Math.max(line + 0.8, mark(m, 10, b5 + 3.0));
  const lost = Math.max(older + 0.5, mark(m, 11, b5 + 6.0));
  const good = Math.max(lost + 0.8, mark(m, 12, b6 + 3.5));
  const squeeze = ease(T, squeezeAt - 0.1, 0.9);
  const fresh = 1 - ease(T, good - 0.3, 0.6);
  const old = ease(T, older - 0.2, 0.6) * fresh;
  const head = {
    ...none,
    deskLit: 1,
    card: {
      opacity: ease(T, squeezeAt + 0.5, 0.4),
      write: progress(T, gist - 0.2, 1.0),
      write2: progress(T, wrote - 0.2, 0.8),
      glow: ease(T, line - 0.1, 0.4) * (1 - ease(T, older - 0.3, 0.4)),
      shrink: old,
      tick: ease(T, good + 0.2, 0.35),
    },
    bubble: { opacity: ease(T, meeting - 0.1, 0.4) * (1 - ease(T, detailAt - 0.6, 0.4)), fade: ease(T, without, 0.8) },
    inset: { opacity: ease(T, kept - 0.5, 0.4) * (1 - ease(T, older - 0.4, 0.4)), move: ease(T, kept, 0.9), tick: ease(T, kept + 0.9, 0.35) },
    detail: ease(T, detailAt - 0.2, 0.4) * (1 - ease(T, two + 1.0, 0.4)),
    clock: { opacity: ease(T, detailAt, 0.4) * (1 - ease(T, wrote - 0.4, 0.4)), spin: progress(T, detailAt, two + 1.4 - detailAt) },
    rows: { opacity: ease(T, often - 0.3, 0.4) * (1 - ease(T, line - 0.5, 0.4)), fill: progress(T, often, 1.2) },
    old,
    reds: { opacity: ease(T, lost - 0.3, 0.4) * fresh, fill: progress(T, lost, 1.0) },
  };
  if (T < detailAt) {
    // The first summary: the full desk squeezed into the card.
    return {
      ...head,
      slip: { opacity: 1 - squeeze, cover: 1, top: 0 },
      pages: MAX_PAGES,
      spill: 1 - squeeze,
      gauge: FULL_GAUGE - 0.7 * squeeze,
      amber: 1 - squeeze,
      squeeze,
    };
  }
  // The detail test: a new pile over the detail card, squeezed twice (the second on "two").
  const second = T >= two - 0.2;
  const grow = second ? progress(T, two - 0.2, 0.6) : progress(T, detailAt + 0.5, Math.max(0.4, two - 1.3 - detailAt));
  const squeezeN = second ? ease(T, two + 0.6, 0.5) : ease(T, two - 0.8, 0.5);
  return {
    ...head,
    aside: 1,
    slip: { opacity: 0, cover: 1, top: 0 },
    pages: REGROW_PAGES * grow,
    spill: 0,
    gauge: FULL_GAUGE - 0.7 + 0.35 * grow * (1 - squeezeN),
    amber: 0,
    squeeze: squeezeN,
  };
}
