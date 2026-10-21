// StoryPaper: the story right after the hook (added 2026-10-21). A stack of pages, a sixty-page
// preprint with the ring-in-a-pan figure on its first page; then three claims on the page, each
// with the same green tick, and beside each one what actually backs it (a written proof, a
// computer check, samples). On "in print" the backing slides away behind the page and only the
// identical ticks are left; on "not worth" it comes back with a weight bar each, strongest first.
// Pure: no Remotion or React. Positions in stage pixels (W x H, as the other components).
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export const W = 960;
export const H = 1090;

export type StoryProps = {
  /** Scene seconds of word cues taken from the narration's word timestamps. */
  cue?: Record<string, number>;
};

/** The front page of the stack. */
export const PAGE = { x: 30, y: 120, w: 470, h: 860 };
/** While the page is alone (first line) it sits centred; it moves left to make room for the backing. */
export const CENTRE_SHIFT = (W - PAGE.w) / 2 - PAGE.x;
/** The ring-in-a-pan figure on the page. */
export const FIG = { cx: PAGE.x + PAGE.w / 2, cy: PAGE.y + 270, R: 118 };
/** Claim rows on the page (y of each row's centre). */
export const ROWS = [PAGE.y + 520, PAGE.y + 645, PAGE.y + 770];
/** What backs each claim, strongest first; `weight` is the length of its bar (schematic). */
export const BACKING = [
  { text: 'written proof', weight: 1 },
  { text: 'computer check', weight: 0.72 },
  { text: 'samples', weight: 0.26 },
] as const;
/** The badge column, right of the page. */
export const BADGE = { x: PAGE.x + PAGE.w + 40, w: 330 };

const E = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const beat = (beats: number[], i: number, fallback: number) => {
  const b = beats[i];
  return b !== undefined && Number.isFinite(b) ? b : fallback;
};
const cueOf = (p: StoryProps, k: string, fallback: number) => {
  const v = p.cue?.[k];
  return v !== undefined && Number.isFinite(v) ? v : fallback;
};

export type StoryState = {
  page: { appear: number; spread: number; shift: number };
  tag: { appear: number };
  fig: { appear: number; spread: number };
  rows: { appear: number; tick: number; pulse: number }[];
  badges: { appear: number; slide: number; bar: number }[];
  heading: { appear: number };
};

export function frameState(p: StoryProps, time: number, beats: number[], dur: number): StoryState {
  const t = sceneTime(time, dur);
  const b0 = beat(beats, 0, 0);
  const b1 = beat(beats, 1, b0 + 3.8);
  const b2 = beat(beats, 2, b1 + 4.2);
  const sixty = cueOf(p, 'sixty', b0 + 0.7);
  const pan = cueOf(p, 'pan', b0 + 2.4);
  const backs = [cueOf(p, 'proved', b1 + 0.9), cueOf(p, 'computer', b1 + 2.0), cueOf(p, 'samples', b1 + 3.0)];
  const print = cueOf(p, 'print', b2 + 0.2);
  const same = cueOf(p, 'same', b2 + 1.3);
  const worth = cueOf(p, 'worth', b2 + 2.3);
  const hide = E(t, print, 0.45) * (1 - E(t, worth, 0.45));
  // Ticks pulse together once on "the same": identical, whatever is behind them.
  const pulse = clamp01(Math.sin(Math.PI * progress(t, same - 0.1, 0.7)));
  return {
    page: { appear: E(t, 0, 0.45), spread: E(t, 0.15, 0.8), shift: E(t, b1 - 0.1, 0.7) },
    tag: { appear: E(t, sixty, 0.4) },
    fig: { appear: E(t, Math.min(pan - 0.9, b0 + 1.2), 0.5), spread: E(t, pan - 0.6, 1.0) },
    rows: ROWS.map((_, i) => ({ appear: E(t, b1 + 0.1 + 0.18 * i, 0.4), tick: E(t, b1 + 0.35 + 0.18 * i, 0.3), pulse })),
    badges: BACKING.map((_, i) => ({ appear: E(t, backs[i], 0.4), slide: hide, bar: E(t, worth + 0.25 + 0.2 * i, 0.6) })),
    heading: { appear: E(t, backs[0] - 0.2, 0.4) * (1 - hide) },
  };
}
