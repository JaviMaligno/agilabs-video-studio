// CoverageTiles: one region drawn four times. Each tile is a card (the same serif sentence and the
// same green tick) lying over a coverage pattern: proved (solid + one pen stroke), box-certified
// (boxes edge to edge), grid-swept (a lattice with dark gaps), sampled (a random scatter).
// Lifting a card shows what is underneath. The "region" modes zoom into the box-certified tile and
// tell the certificate story on it (boxes, reviewer, refutation, version two).
// Pure: no Remotion or React. Every position is in stage pixels (W x H).
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export const W = 960;
export const H = 1090;

export type TilesMode = 'same' | 'lift' | 'stamp' | 'focus' | 'boxes' | 'reviewer' | 'refute' | 'v2' | 'software' | 'close';

export type TilesProps = {
  mode: TilesMode;
  /** Read by Video.tsx: the first narration line is drawn as the hook title (no caption for it). */
  titleLine?: boolean;
  /** Read by Video.tsx: cross-blend from the previous scene on the same component. */
  blend?: boolean;
  /** Scene seconds of word cues taken from the narration's word timestamps. */
  cue?: Record<string, number>;
};

export const HOOK_TITLE = 'These four claims print the same way.';
export const SENTENCE = 'The inequality holds on the whole domain.';
export const STAMPS = ['PROVED', 'BOX-CERTIFIED', 'GRID-SWEPT', 'SAMPLED'] as const;
export const SUBS = ['written proof\nLean can re‑check it', 'exact rational arithmetic', 'checked on a mesh · silent between', 'samples · none broke it'] as const;
export const SOFTWARE = ['careful read ≈ proved, when it fits in a head', 'type ≈ box-certified', 'property test ≈ grid-swept', 'a test at the inputs you chose ≈ sampled'] as const;
export const SAMPLES = 10_000_000;

export type Rect = { x: number; y: number; w: number; h: number };
export const TILE_W = 460;
export const TILE_H = 400;
export const HEADER = 96;
export const GRID: Rect[] = [
  { x: 0, y: 200, w: TILE_W, h: TILE_H },
  { x: 500, y: 200, w: TILE_W, h: TILE_H },
  { x: 0, y: 630, w: TILE_W, h: TILE_H },
  { x: 500, y: 630, w: TILE_W, h: TILE_H },
];
/** The box-certified region, zoomed in. */
export const BIG: Rect = { x: 60, y: 430, w: 840, h: 570 };
export const PAN = { cx: 190, cy: 205, R: 150 };
export const NX = 8;
export const NY = 6;
export const LATTICE = { nx: 7, ny: 5 };
export const SCATTER_N = 46;

/** Deterministic scatter in the unit square (a fixed LCG), the same every frame. */
export const scatter = (n: number, seed = 7): { x: number; y: number; d: number }[] => {
  let s = seed;
  const r = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  return Array.from({ length: n }, () => ({ x: 0.05 + 0.9 * r(), y: 0.06 + 0.88 * r(), d: r() }));
};

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpRect = (a: Rect, b: Rect, p: number): Rect => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), w: lerp(a.w, b.w, p), h: lerp(a.h, b.h, p) });
const E = (t: number, start: number, len: number) => easeOutCubic(progress(t, start, len));
const cueOf = (p: TilesProps, k: string, fallback: number) => {
  const v = p.cue?.[k];
  return v !== undefined && Number.isFinite(v) ? v : fallback;
};
const beat = (beats: number[], i: number, fallback: number) => {
  const b = beats[i];
  return b !== undefined && Number.isFinite(b) ? b : fallback;
};
/** Count shown on the sampled tile: rounds up to exactly 10,000,000 at the end. */
export const fmtCount = (p: number) => Math.round(SAMPLES * easeOutCubic(p)).toLocaleString('en-US');

export type Cell = { fill: number; green: number; rose: number; corner: number; pulse: number };
export type Tile = {
  rect: Rect;
  opacity: number;
  /** 1 = the card covers the whole tile; 0 = only its header strip is left. */
  cover: number;
  /** The card slides up and away (region modes). */
  away: number;
  card: { serif: number; software: number; text: string; swText: string };
  tick: { appear: number; lift: number; ci: number };
  sub: { text: string; appear: number };
  stamp: { text: string; pop: number; tone: number };
  pattern: { kind: 0 | 1 | 2 | 3; reveal: number; stroke: number; pulse: number; count: string; cells: Cell[] };
};

const emptyCells = (): Cell[] => Array.from({ length: NX * NY }, () => ({ fill: 0, green: 0, rose: 0, corner: 0, pulse: 0 }));

const baseTile = (i: number, rect: Rect): Tile => ({
  rect,
  opacity: 1,
  cover: 1,
  away: 0,
  card: { serif: 1, software: 0, text: SENTENCE, swText: SOFTWARE[i] },
  tick: { appear: 1, lift: 0, ci: 0 },
  sub: { text: SUBS[i], appear: 0 },
  stamp: { text: STAMPS[i], pop: 0, tone: i },
  pattern: { kind: i as 0 | 1 | 2 | 3, reveal: 1, stroke: 1, pulse: 0, count: fmtCount(1), cells: emptyCells().map(() => ({ fill: 1, green: 0, rose: 0, corner: 0, pulse: 0 })) },
});

export type Chip = { text: string; pop: number; hot: number };
export type TilesState = {
  title: null | { words: { text: string; lit: number }[]; appear: number };
  topTag: null | { text: string; appear: number };
  topLine: null | { text: string; appear: number };
  ci: null | { appear: number };
  quote: null | { words: { text: string; opacity: number; emphasis: boolean }[] };
  tiles: Tile[];
  regionLabel: null | { text: string; appear: number };
  tally: null | { value: number; appear: number; pulse: number };
  pan: null | { appear: number; wobble: number };
  reviewer: null | { appear: number; card: number; cardAppear: number; arrow: number; dim: number };
  refuted: null | { pop: number };
  chips: Chip[];
  chipStamp: number;
  exact: null | { appear: number };
  test: null | { appear: number; eps: number };
};

/** Box cells filling one after another, row by row, from `start` over `len` seconds. */
const wave = (t: number, start: number, len: number, k: number, n: number, each = 0.25) => progress(t, start + (k / Math.max(1, n - 1)) * Math.max(0, len - each), each);
/** Diagonal wave index for cell k (0..1). */
const diag = (k: number) => {
  const cx = k % NX;
  const cy = Math.floor(k / NX);
  return (cx + cy) / (NX - 1 + NY - 1);
};

export function frameState(p: TilesProps, time: number, beats: number[], dur: number): TilesState {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) ? dur : 0;
  const b0 = beat(beats, 0, 0);
  const s: TilesState = {
    title: null,
    topTag: null,
    topLine: null,
    ci: null,
    quote: null,
    tiles: GRID.map((r, i) => baseTile(i, r)),
    regionLabel: null,
    tally: null,
    pan: null,
    reviewer: null,
    refuted: null,
    chips: [],
    chipStamp: 0,
    exact: null,
    test: null,
  };
  const tiles = s.tiles;

  if (p.mode === 'same') {
    const words = HOOK_TITLE.split(' ');
    const end = Math.max(b0 + 0.6, d - 0.9);
    s.title = { appear: E(t, 0, 0.4), words: words.map((text, i) => ({ text, lit: progress(t, b0 + (i / words.length) * (end - b0), 0.2) })) };
    tiles.forEach((tl, i) => {
      const at = 0.25 + 0.32 * i;
      tl.opacity = E(t, at, 0.4);
      tl.tick.appear = E(t, at + 0.25, 0.3);
      tl.rect = { ...tl.rect, y: tl.rect.y + 40 * (1 - tl.opacity) };
    });
    return s;
  }

  if (p.mode === 'lift') {
    // The cards drop back on (identical again) at `drop`; by default in the next scene (stamp).
    const drop = cueOf(p, 'drop', Number.MAX_SAFE_INTEGER / 2);
    tiles.forEach((tl, i) => {
      const at = beat(beats, i, b0 + 1.4 * i) + 0.05;
      const up = E(t, at, 0.6);
      const down = E(t, drop + 0.08 * i, 0.5);
      tl.cover = clamp01(1 - up + down);
      tl.sub.appear = E(t, at + 0.35, 0.4) * (1 - down);
      const pat = tl.pattern;
      if (i === 0) {
        pat.reveal = E(t, at + 0.1, 0.5);
        pat.stroke = progress(t, at + 0.35, 0.9);
      } else if (i === 1) {
        pat.reveal = 1;
        pat.cells = emptyCells().map((c, k) => ({ ...c, fill: wave(t, at + 0.2, 1.3, k, NX * NY) }));
      } else if (i === 2) {
        pat.reveal = E(t, at + 0.15, 0.6);
        const silent = cueOf(p, 'silent', at + 1.0);
        pat.pulse = clamp01(Math.sin(Math.PI * progress(t, silent, 0.9)));
      } else {
        const rain = progress(t, at + 0.15, 1.5);
        pat.reveal = rain;
        pat.count = fmtCount(progress(t, at + 0.15, 1.6));
      }
      if (i > 0) pat.stroke = 1;
    });
    return s;
  }

  if (p.mode === 'stamp') {
    s.topTag = { text: '60-page preprint', appear: E(t, b0 + 0.1, 0.4) };
    const first = cueOf(p, 'stamp', b0 + 1.6);
    tiles.forEach((tl, i) => {
      // Enters lifted (end of 'lift'), drops back on: four identical cards again.
      tl.cover = E(t, 0.15 + 0.08 * i, 0.5);
      tl.stamp.pop = E(t, first + 0.25 * i, 0.3);
    });
    s.topLine = { text: 'a label per claim, not a tick for the paper', appear: E(t, first + 0.25 * 3 + 0.3, 0.45) };
    return s;
  }

  if (p.mode === 'software' || p.mode === 'close') {
    const green = cueOf(p, 'green', b0 + 2.2);
    tiles.forEach((tl, i) => {
      tl.cover = 0;
      tl.card.serif = 0;
      tl.card.software = 1;
      tl.sub.appear = 0;
      tl.stamp.pop = 0;
      if (p.mode === 'software') {
        tl.opacity = E(t, 0.1 + 0.15 * i, 0.4);
        tl.tick.appear = E(t, green, 0.3);
        tl.tick.ci = tl.tick.appear;
      } else {
        tl.tick.ci = 1;
        const lift = E(t, b0 + 0.1, 0.6);
        tl.tick.lift = lift;
        tl.tick.appear = 1 - lift;
        tl.stamp.pop = E(t, b0 + 0.45 + 0.22 * i, 0.3);
      }
    });
    if (p.mode === 'software') s.ci = { appear: E(t, green, 0.35) };
    else {
      const words = 'Label the claim, not the system.'.split(' ');
      s.quote = { words: words.map((text, i) => ({ text, opacity: progress(t, b0 + 0.05 + 0.07 * i, 0.35), emphasis: /claim/.test(text) })) };
    }
    return s;
  }

  // Region modes: the box-certified tile zoomed in.
  const box = tiles[1];
  const others = [0, 2, 3];
  // Focus enters as the stamp scene ends (four stamped cards), holds through the blend, then zooms.
  const focusIn = p.mode === 'focus' ? E(t, 0.75, 0.9) : 1;
  const away = p.mode === 'focus' ? E(t, 1.1, 0.6) : 1;
  others.forEach((i) => {
    const o = p.mode === 'focus' ? E(t, 0.65, 0.55) : 1;
    tiles[i].stamp.pop = 1;
    tiles[i].opacity = 1 - o;
    tiles[i].rect = { ...tiles[i].rect, x: tiles[i].rect.x + (i === 2 ? -160 : 160) * o };
  });
  box.rect = lerpRect(GRID[1], BIG, focusIn);
  box.away = away;
  box.cover = 1 - away;
  box.tick.appear = 1 - away;
  box.stamp.pop = 1 - away;
  box.sub.appear = 0;
  s.regionLabel = { text: 'BOX-CERTIFIED', appear: p.mode === 'focus' ? E(t, 1.4, 0.4) : 1 };
  s.tally = { value: 0, appear: p.mode === 'focus' ? E(t, cueOf(p, 'tally', b0 + 1.6), 0.4) : 1, pulse: 0 };

  const cells = box.pattern.cells;
  if (p.mode === 'focus') return s;

  s.regionLabel = { text: '4-D parameter domain · one slice shown', appear: p.mode === 'boxes' ? E(t, 0.15, 0.4) : 1 };
  s.pan = { appear: p.mode === 'boxes' ? E(t, 0.1, 0.5) : 1, wobble: p.mode === 'boxes' ? Math.sin(t * 2.4) : 0 };

  if (p.mode === 'boxes') {
    const start = cueOf(p, 'wave', b0 + 1.0);
    cells.forEach((c, k) => {
      c.green = progress(t, start + diag(k) * 1.5, 0.3);
    });
    return s;
  }
  cells.forEach((c) => {
    c.green = 1;
  });

  if (p.mode === 'reviewer') {
    const send = cueOf(p, 'send', b0 + 1.2);
    const brk = cueOf(p, 'break', b0 + 2.6);
    s.reviewer = { appear: E(t, b0 + 0.05, 0.5), cardAppear: E(t, b0 + 0.4, 0.3), card: E(t, send, 0.8), arrow: progress(t, brk, 0.5), dim: 0 };
    return s;
  }

  if (p.mode === 'refute') {
    const hit = cueOf(p, 'refute', b0 + 0.3);
    const chips = cueOf(p, 'chips', b0 + 1.6);
    s.reviewer = { appear: 1, cardAppear: 0, card: 1, arrow: 1, dim: E(t, 0, 0.4) };
    s.refuted = { pop: E(t, hit, 0.3) };
    s.tally = { value: t >= hit + 0.15 ? 1 : 0, appear: 1, pulse: clamp01(Math.sin(Math.PI * progress(t, hit + 0.15, 0.6))) };
    cells.forEach((c) => {
      c.rose = E(t, hit, 0.4);
    });
    const texts = ['no Lipschitz bound between mesh points', 'LP with tolerances', 'one inequality: sampled'];
    s.chips = texts.map((text, i) => ({ text, pop: E(t, chips + 0.3 * i, 0.3), hot: i === 2 ? E(t, chips + 0.9, 0.4) : 0 }));
    s.chipStamp = E(t, chips + 1.1, 0.3);
    return s;
  }

  // v2: the boxes rebuild with exact corners; one tolerance settles on the acceptance test.
  const rebuild = b0 + 0.2;
  s.tally = { value: 1, appear: 1, pulse: 0 };
  s.refuted = { pop: 1 - E(t, 0, 0.35) };
  cells.forEach((c, k) => {
    const r = progress(t, rebuild + diag(k) * 1.2, 0.3);
    c.rose = 1 - r;
    c.green = r;
    c.corner = r;
  });
  s.exact = { appear: E(t, rebuild + 0.6, 0.4) };
  s.test = { appear: E(t, rebuild + 1.0, 0.4), eps: E(t, cueOf(p, 'eps', b0 + 2.8), 0.5) };
  return s;
}
