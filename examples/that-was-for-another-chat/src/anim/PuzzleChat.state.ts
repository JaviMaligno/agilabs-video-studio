// Pure state of the PuzzleChat scenes: each conversation is a jigsaw whose picture is its topic,
// and the accidental paste is a piece from another box. Visuals are illustrative, chosen for
// impact; the numbers on screen come from the article. No Remotion or React here.
import type { Label } from '../types.ts';
import { frameState as quoteState } from './KeyQuote.state.ts';
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Topic = 'garden' | 'bill' | 'run' | 'camera' | 'bread' | 'move' | 'school' | 'japan';
export type Mode = 'land' | 'grid' | 'hammer' | 'frames' | 'carve' | 'aside' | 'ceiling' | 'quote';

export type Tally = { value: string; label: Label; beat?: number; delay?: number };

export type PuzzleProps = {
  mode: Mode;
  topic?: Topic;
  /** Title in the chat window's header ("Balcony garden"). */
  title?: Label;
  /** Lines of text printed on the foreign piece (texture: meant to read as "someone else's text"). */
  snippet?: string[];
  chip?: Label;
  tally?: Tally;
  /** frames mode: the three output formats offered. */
  frames?: Label[];
  /** frames mode: the question never asked. */
  ghost?: Label;
  /** carve mode: the two ends of the invented thread, and the two verdict stamps. */
  thread?: [Label, Label];
  stamps?: [Label, Label];
  /** aside mode: tag under the set-aside piece. */
  tag?: Label;
  /** grid / ceiling: small legend under the wall. */
  legend?: Label;
  /** quote mode: two rows, one per narration line. */
  quote?: { rows: [Label, Label]; emphasis?: string[] };
  /** Picks up exactly where the previous scene stopped (no dip at the cut). */
  continues?: boolean;
};

/** Cells of the hole in each single puzzle (row, col). */
export const HOLE = { r: 1, c: 2 } as const;
/** Grid wall: 6 columns x 4 rows of conversations; the one that set the paste aside. */
export const GRID = { cols: 6, rows: 4, good: 15 } as const;
export const GRID_N = GRID.cols * GRID.rows;

const lerp = (a: number, b: number, p: number) => a + (b - a) * clamp01(p);
const easeIn = (p: number) => clamp01(p) ** 2;
const easeInOut = (p: number) => {
  const x = clamp01(p);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
};
/** A decaying wobble that starts at `at`: 0 before, ±1 at first, ~0 after `len`. */
const wobble = (t: number, at: number, len: number, freq = 38): number => {
  if (t < at || t > at + len) return 0;
  const q = (t - at) / len;
  return Math.sin((t - at) * freq) * (1 - q) ** 2;
};
/** Rises to 1 over `rise`, holds, then settles to `rest`. */
const pulse = (t: number, at: number, rise: number, hold: number, rest: number): number => {
  if (t < at) return 0;
  if (t < at + rise) return (t - at) / rise;
  if (t < at + rise + hold) return 1;
  return lerp(1, rest, (t - at - rise - hold) / 0.4);
};

export type PieceState = {
  /** Offset from the seated position, in units of the puzzle side. */
  dx: number;
  dy: number;
  rot: number;
  scale: number;
  opacity: number;
  /** Horizontal flip (cos of the turn): 1 face up, -1 face down. */
  flip: number;
  glow: number;
};

export type PuzzleState = {
  piece: PieceState;
  /** Whole-puzzle jolt in px (impact). */
  shake: number;
  flash: number;
  /** carve: 0 = the piece's own (wrong) shape, 1 = the hole's shape. */
  carve: number;
  knife: { opacity: number; progress: number };
  hammer: { opacity: number; angle: number };
  /** hammer: how far the code has spread over the picture, 0..1. */
  code: number;
  frames: { appear: number[]; lit: number[] };
  /** frames: the piece moves from the hole to the frame row. */
  lift: number;
  ghost: { opacity: number; strike: number };
  thread: { draw: number };
  stamps: { opacity: number[] };
  /** aside: 0 over the hole, 1 in its place beside the puzzle. */
  aside: number;
  gap: { opacity: number };
  /** grid: 0 = the single puzzle, 1 = the wall of 24. */
  zoom: number;
  drops: number[];
  dim: number;
  ceiling: { opacity: number };
  tally: { opacity: number; pop: number };
  chip: { opacity: number };
  quote: { rows: { words: { text: string; opacity: number; emphasis: boolean }[]; emphasis: number }[] };
};

const REST: PieceState = { dx: 0, dy: 0, rot: 0, scale: 1, opacity: 1, flip: 1, glow: 0 };

export function frameState(p: PuzzleProps, t0: number, beats: number[], dur: number, lang: 'en' | 'es' = 'en'): PuzzleState {
  const t = sceneTime(Number.isFinite(t0) ? t0 : 0, dur);
  const D = Number.isFinite(dur) && dur > 0 ? dur : 0;
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1.5;

  const s: PuzzleState = {
    piece: { ...REST },
    shake: 0,
    flash: 0,
    carve: 1,
    knife: { opacity: 0, progress: 0 },
    hammer: { opacity: 0, angle: 0 },
    code: 0,
    frames: { appear: [0, 0, 0], lit: [0, 0, 0] },
    lift: 0,
    ghost: { opacity: 0, strike: 0 },
    thread: { draw: 0 },
    stamps: { opacity: [0, 0] },
    aside: 0,
    gap: { opacity: 0 },
    zoom: 0,
    drops: Array.from({ length: GRID_N }, () => 0),
    dim: 0,
    ceiling: { opacity: 0 },
    tally: { opacity: 0, pop: 0 },
    chip: { opacity: clamp01(progress(t, fit(0.15, 0.4, D), 0.4)) },
    quote: { rows: [] },
  };

  if (p.tally) {
    const at = fit(beatAt(beats, p.tally.beat ?? 0) + (p.tally.delay ?? 0.3), 0.45, D);
    s.tally = { opacity: progress(t, at, 0.25), pop: easeOutCubic(progress(t, at, 0.45)) };
  }

  switch (p.mode) {
    case 'land': {
      // The stray piece hovers over the hole from the first frame, then drops and clacks in.
      const fallAt = fit(0.75, 0.42 + 0.4, D);
      const fall = easeIn(progress(t, fallAt, 0.42));
      const land = fallAt + 0.42;
      const bounce = t > land ? -0.03 * Math.sin(Math.PI * clamp01((t - land) / 0.22)) * (t < land + 0.22 ? 1 : 0) : 0;
      s.piece = {
        ...REST,
        dx: lerp(0.16, 0, fall),
        dy: lerp(-0.27 + 0.01 * Math.sin(t * 4), 0, fall) + bounce,
        rot: lerp(-13 + 2 * Math.sin(t * 3), 0, fall),
        scale: lerp(1.12, 1, fall),
      };
      s.shake = 12 * wobble(t, land, 0.4);
      s.flash = t >= land ? 1 - progress(t, land, 0.45) : 0;
      break;
    }
    case 'grid': {
      // The zoom waits for the cross-fade from the previous scene (same frame), then pulls back.
      s.zoom = easeInOut(progress(t, fit(0.6, 0.9, D), 0.9));
      // The first conversation (the garden) already has its piece; the rest drop row by row.
      const from = 1.5;
      const to = Math.max(from + 0.5, Math.min(D - 0.6, b0 + 3.6));
      s.drops = s.drops.map((_, i) => (i === 0 ? 1 : easeIn(progress(t, fit(from + ((i - 1) / (GRID_N - 2)) * (to - from), 0.35, D), 0.35))));
      break;
    }
    case 'ceiling': {
      s.zoom = 1;
      s.drops = s.drops.map(() => 1);
      s.dim = 0.55 * progress(t, fit(b0 + 0.2, 0.6, D), 0.6);
      s.ceiling = { opacity: progress(t, fit(b0 + 0.1, 0.5, D), 0.5) };
      break;
    }
    case 'quote': {
      s.zoom = 1;
      s.drops = s.drops.map(() => 1);
      s.dim = 0.55 + 0.33 * progress(t, 0, 0.5);
      s.ceiling = { opacity: 1 };
      const rows = p.quote?.rows ?? ['', ''];
      s.quote = {
        rows: rows.map((row, i) => {
          const q = quoteState({ text: row, emphasis: p.quote?.emphasis, beat: i }, t0, beats, dur, lang);
          return { words: q.words, emphasis: q.emphasis };
        }),
      };
      break;
    }
    case 'hammer': {
      // The piece sits crooked in the hole; three blows drive it home.
      const hits = [0, 1, 2].map((k) => fit(b0 + 0.25 + 0.38 * k, 0.4 + 0.38 * (2 - k), D));
      const done = hits.filter((h) => t >= h).length;
      const since = hits.map((h) => t - h);
      // Hammer angle: raised at -55°, slams to 0 at each hit and lifts again.
      let angle = -55;
      for (const h of hits) {
        if (t >= h - 0.12 && t < h) angle = lerp(-55, 0, (t - (h - 0.12)) / 0.12);
        else if (t >= h && t < h + 0.24) angle = lerp(0, -55, (t - h) / 0.24);
      }
      const last = hits[2];
      s.hammer = {
        opacity: progress(t, fit(b0 - 0.1, 0.2, D), 0.2) * (1 - progress(t, last + 0.35, 0.3)),
        angle,
      };
      s.piece = { ...REST, dy: -0.05 * (1 - done / 3), rot: 9 * (1 - done / 3) };
      s.shake = 9 * since.reduce((a, d, k) => a + wobble(t, hits[k], 0.3), 0);
      s.flash = Math.max(0, ...since.map((d) => (d >= 0 && d < 0.3 ? 1 - d / 0.3 : 0)));
      s.code = easeInOut(progress(t, fit(b1 + 0.1, 1.6, D), 1.6));
      break;
    }
    case 'frames': {
      s.lift = easeInOut(progress(t, fit(0.1, 0.7, D), 0.7));
      s.frames.appear = [0, 1, 2].map((i) => easeOutCubic(progress(t, fit(b0 + 0.25 + 0.22 * i, 0.4, D), 0.4)));
      s.frames.lit = [0, 1, 2].map((i) => pulse(t, fit(b0 + 0.9 + 0.42 * i, 0.9, D), 0.15, 0.3, 0.3));
      s.piece = { ...REST, rot: lerp(0, -6, s.lift), scale: lerp(1, 1.15, s.lift) };
      s.ghost = { opacity: progress(t, fit(b1, 0.3, D), 0.3), strike: easeOutCubic(progress(t, fit(b1 + 0.55, 0.4, D), 0.4)) };
      break;
    }
    case 'carve': {
      // A piece from another box: wrong shape, so it bumps; a knife carves it to fit; it snaps in.
      const a0 = fit(b0 + 0.4, 4.6, D);
      const approach = easeInOut(progress(t, a0, 0.6));
      const bump = a0 + 0.6;
      const recoil = easeOutCubic(progress(t, bump, 0.3));
      const cutAt = a0 + 1.1;
      const cut = progress(t, cutAt, 1.8);
      const snap = easeIn(progress(t, a0 + 3.0, 0.35));
      let dy = lerp(-0.36, -0.07, approach);
      if (t >= bump) dy = lerp(-0.07, -0.2, recoil);
      if (t >= a0 + 3.0) dy = lerp(-0.2, 0, snap);
      s.piece = { ...REST, dy, rot: t < a0 + 3.0 ? lerp(7, 3, approach) * (1 - snap) : lerp(3, 0, snap) };
      s.shake = 8 * wobble(t, bump, 0.3) + 10 * wobble(t, a0 + 3.35, 0.35);
      s.flash = t >= a0 + 3.35 ? 1 - progress(t, a0 + 3.35, 0.45) : 0;
      s.carve = easeInOut(cut);
      s.knife = { opacity: progress(t, cutAt - 0.2, 0.2) * (1 - progress(t, cutAt + 1.85, 0.25)), progress: cut };
      s.thread = { draw: easeInOut(progress(t, fit(a0 + 3.5, 1.0, D), 1.0)) };
      s.stamps = { opacity: [progress(t, fit(b1 + 0.05, 0.25, D), 0.25), progress(t, fit(b1 + 0.75, 0.25, D), 0.25)] };
      break;
    }
    case 'aside': {
      // The one reply that got it right: lift the piece, turn it over, compare, set it beside.
      const a0 = fit(b0 + 0.2, 2.9, D);
      const up = easeInOut(progress(t, a0, 0.5));
      const turn = progress(t, a0 + 0.5, 0.6);
      const out = easeInOut(progress(t, a0 + 1.8, 0.7));
      s.piece = {
        ...REST,
        dy: lerp(-0.035, -0.27, up),
        rot: lerp(5, -4, up) * (1 - out),
        flip: Math.cos(turn * Math.PI * 2),
        scale: lerp(1, 1.08, up),
        glow: progress(t, a0 + 2.2, 0.6),
      };
      s.gap = { opacity: pulse(t, a0 + 1.1, 0.2, 0.5, 0.35) };
      s.aside = out;
      break;
    }
  }
  return s;
}
