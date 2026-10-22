// Pure state of the results: the small library (separate files, bars that barely move), the large
// library (a web of linked files, 54% -> 24%), the split between the two families, and the habits
// given back to destroyed code (readable names alone clear the baseline). Every figure is the
// article's (see factcheck.md). No Remotion or React here.
import { easeOutCubic, progress, sceneTime } from './steps.ts';

export type ResultMode = 'small' | 'large' | 'split' | 'names';
export type RepoResultProps = { mode: ResultMode; marks?: number[] };

/** Summary table "It is paid in turns…" (high tier) and the low-tier "both" row. */
export const SMALL_BARS = [
  { group: 'strong model', label: 'untouched', value: 98, display: '98%', dirty: false },
  { group: 'strong model', label: 'fully degraded', value: 93, display: '93%', dirty: true },
  { group: 'weaker model', label: 'untouched', value: 83, display: '83%', dirty: false },
  { group: 'weaker model', label: 'fully degraded', value: 81, display: '81%', dirty: true },
];
/** "From 54% to 24%." */
export const LARGE_BARS = [
  { label: 'untouched', value: 54, display: '54%', dirty: false },
  { label: 'everything degraded', value: 24, display: '24%', dirty: true },
];
/** "Which practice pays", column "Given back to destroyed code"; baseline 49/59 — 83%. */
export const GIVEN_BACK = [
  { label: 'types', value: 80 },
  { label: 'readable names', value: 97 },
  { label: 'formatting', value: 80 },
  { label: 'comments', value: 85 },
  { label: 'cohesion', value: 78 },
  { label: 'hierarchy', value: 82 },
  { label: 'README', value: 86 },
  { label: 'visible tests', value: 86 },
];
export const BASELINE = 83;
export const NAMES = 1;

export type ResultState = {
  /** Small library: separate file tiles; large library: linked tiles with highlighted links. */
  files: { opacity: number; tiles: number[]; links: number; focus: number };
  bars: { opacity: number; grow: number[]; ns: number };
  /** split: how far the large-library bars have moved up (0 where `large` left them). */
  lift: number;
  tiles: { pop: number[] };
  /** names: bars, the highlight on readable names, the baseline line, the f1 -> parse_vat chip. */
  names: { opacity: number; grow: number[]; highlight: number; baseline: number; rename: number };
};

const e = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};
const beat = (beats: number[], i: number, fallback: number) => {
  const b = beats[i];
  return b !== undefined && Number.isFinite(b) ? b : fallback;
};

const MODES: ResultMode[] = ['small', 'large', 'split', 'names'];
export const FILE_TILES = 12;

export function frameState(props: RepoResultProps, t: number, beats: number[], dur: number): ResultState {
  const mode: ResultMode = MODES.includes(props.mode) ? props.mode : 'small';
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beat(beats, 0, 0);
  const b1 = beat(beats, 1, b0 + 2.5);
  const none = (n: number) => Array.from({ length: n }, () => 0);
  const s: ResultState = {
    files: { opacity: 0, tiles: none(FILE_TILES), links: 0, focus: 0 },
    bars: { opacity: 0, grow: none(4), ns: 0 },
    lift: 0,
    tiles: { pop: [0, 0] },
    names: { opacity: 0, grow: none(GIVEN_BACK.length), highlight: 0, baseline: 0, rename: 0 },
  };

  if (mode === 'small') {
    const files = mk(m, 0, b0 + 0.6);
    const hi = mk(m, 1, b1 + 1.5);
    const lo = mk(m, 2, b1 + 2.6);
    s.files = { opacity: e(T, files - 0.4, 0.4), tiles: s.files.tiles.map((_, i) => e(T, files - 0.3 + i * 0.06, 0.35)), links: 0, focus: 0 };
    // Strong model on the voice ("98%" then "93%"); the weaker pair follows, on screen only.
    const starts = [hi - 0.15, lo - 0.15, lo + 0.75, lo + 1.05];
    s.bars = { opacity: e(T, Math.min(hi - 0.6, b1), 0.4), grow: starts.map((st) => e(T, st, 0.6)), ns: e(T, lo + 1.6, 0.35) };
    return s;
  }

  if (mode === 'large' || mode === 'split') {
    if (mode === 'large') {
      const web = mk(m, 0, b0 + 0.6);
      const several = mk(m, 1, b0 + 2.5);
      const hi = mk(m, 2, b1 + 1.6);
      const lo = mk(m, 3, b1 + 2.3);
      s.files = { opacity: e(T, web - 0.4, 0.4), tiles: s.files.tiles.map((_, i) => e(T, web - 0.3 + i * 0.05, 0.35)), links: e(T, web, 0.7), focus: e(T, several - 0.1, 0.5) };
      s.bars = { opacity: e(T, Math.min(hi - 0.6, b1), 0.4), grow: [e(T, hi - 0.15, 0.6), e(T, lo - 0.15, 0.7), 0, 0], ns: e(T, lo + 0.7, 0.35) };
      return s;
    }
    const text = mk(m, 0, b0 + 1);
    const hide = mk(m, 1, b0 + 3);
    // The lift waits for the blend from `large` (0.6 s) to finish, so the two never show at once.
    const lift = e(T, 0.65, 0.7);
    s.files = { opacity: 1 - lift, tiles: s.files.tiles.map(() => 1), links: 1, focus: 1 };
    s.bars = { opacity: 1, grow: [1, 1, 0, 0], ns: 1 };
    s.lift = lift;
    s.tiles = { pop: [e(T, text - 0.2, 0.4), e(T, hide - 0.2, 0.4)] };
    return s;
  }

  // names
  const names = mk(m, 0, b0 + 1.3);
  const n97 = mk(m, 1, b0 + 3.4);
  const base = mk(m, 2, b0 + 5);
  s.names = {
    opacity: e(T, 0, 0.35),
    grow: GIVEN_BACK.map((_, i) => (i === NAMES ? e(T, n97 - 0.5, 0.7) : e(T, 0.15 + i * 0.08, 0.6))),
    highlight: e(T, names - 0.1, 0.4),
    baseline: e(T, base - 0.15, 0.4),
    rename: e(T, names + 0.1, 0.5),
  };
  return s;
}
