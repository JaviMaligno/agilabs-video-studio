// Pure state of the desk: working memory (scenes 6-7).
// - full: the red slip on the desk; pages pile over it, the gauge goes amber, pages spill off the
//   edge. Marks: [desk, long, room, go].
// - summary: the pile is squeezed into one notecard with "shelf 0: empty" written on it; a speech
//   bubble (a meeting) loses its words and keeps the gist; on the small rack the new pallet goes to
//   shelf 0, tick. Marks: [squeeze, gist, meeting, without, kept].
// No Remotion or React here.
import { beatOr, ease, mark, pickMode } from './memory.ts';
import { progress, sceneTime } from './steps.ts';

export const DESK_MODES = ['full', 'summary'] as const;
export type DeskMode = (typeof DESK_MODES)[number];
export type MemoryDeskProps = { mode: DeskMode; marks?: number[] };

/** Pages on a full desk. */
export const MAX_PAGES = 11;
/** What the summary keeps, written on the notecard. */
export const CARD_TEXT = 'shelf 0: empty';
/** Gauge level of a full desk. */
export const FULL_GAUGE = 0.95;

export type MemoryDeskState = {
  deskLit: number;
  /** The slip on the desk; `cover` is how far the pages hide it. */
  slip: { opacity: number; cover: number };
  /** Pages on the pile, 0..MAX_PAGES (the fraction is the top one landing). */
  pages: number;
  spill: number;
  gauge: number;
  amber: number;
  squeeze: number;
  card: { opacity: number; write: number };
  bubble: { opacity: number; fade: number };
  inset: { opacity: number; move: number; tick: number };
};

export function frameState(props: MemoryDeskProps, t: number, beats: number[], dur: number): MemoryDeskState {
  const mode = pickMode(props.mode, DESK_MODES);
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beatOr(beats, 0, 0);
  const b1 = beatOr(beats, 1, b0 + 2.6);

  if (mode === 'full') {
    const desk = mark(m, 0, b0 + 0.3);
    const long = mark(m, 1, b1 + 0.3);
    const room = mark(m, 2, b1 + 1.6);
    const go = mark(m, 3, b1 + 3.0);
    const pages = MAX_PAGES * progress(T, long, Math.max(0.6, go - long));
    return {
      deskLit: ease(T, desk - 0.1, 0.5),
      slip: { opacity: 1, cover: Math.min(1, pages / 3) },
      pages,
      spill: ease(T, go - 0.1, 0.8),
      gauge: (FULL_GAUGE * pages) / MAX_PAGES,
      amber: ease(T, room, 0.5),
      squeeze: 0,
      card: { opacity: 0, write: 0 },
      bubble: { opacity: 0, fade: 0 },
      inset: { opacity: 0, move: 0, tick: 0 },
    };
  }

  // summary
  const squeezeAt = mark(m, 0, b0 + 0.8);
  const gist = mark(m, 1, b0 + 2.8);
  const meeting = mark(m, 2, b0 + 3.6);
  const without = mark(m, 3, b0 + 4.8);
  const kept = mark(m, 4, b1 + 0.9);
  const squeeze = ease(T, squeezeAt - 0.1, 0.9);
  return {
    deskLit: 1,
    slip: { opacity: 1 - squeeze, cover: 1 },
    pages: MAX_PAGES,
    spill: 1 - squeeze,
    gauge: FULL_GAUGE - 0.7 * squeeze,
    amber: 1 - squeeze,
    squeeze,
    card: { opacity: ease(T, squeezeAt + 0.5, 0.4), write: progress(T, gist - 0.2, 1.0) },
    bubble: { opacity: ease(T, meeting - 0.1, 0.4), fade: ease(T, without, 0.8) },
    inset: { opacity: ease(T, kept - 0.5, 0.4), move: ease(T, kept, 0.9), tick: ease(T, kept + 0.9, 0.35) },
  };
}
