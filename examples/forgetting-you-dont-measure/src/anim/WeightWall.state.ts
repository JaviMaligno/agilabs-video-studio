// Pure state of the WeightWall scenes: the model as a wall of lit tiles, fed by a conveyor of
// batch cards (gradient = terminal data, white = general text). One component, one mode per
// scene of the script:
// - hook: a terminal chip answers, the accent stain spreads, then tiles quietly go dark (forgetAt).
// - paper: a huge wall rises behind the small one; "general text mixed in ✓"; "forgetting: ?".
// - test: chip "0.5B model · toy scale"; four benchmark gauges light one by one.
// - knob: the replay dial sweeps 0 → 50 % and back; the white-card share follows it.
// - zero (2 lines): 0 % replay; the skill spreads, tiles go dark, the task meter climbs, gauges
//   drop. Line 2: the wall dims under "−0.078 average" and "−0.15 worst: ARC-Easy".
// - replay (2 lines): 10 %: white cards relight dark tiles. Line 2: the wall shrinks to the top
//   and the replay curve draws 0 % → 10 %, "≈73% back", then 25 %, 50 %.
// - methods (2 lines): full fine-tuning (every tile loose) and LoRA (glass + adapter column).
// - close: six capabilities light up; "pick the method on purpose" over the two walls.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { tilesAt, cardsAt, whiteLandings, ratioAtDial, rng, COLS, ROWS, N, type CardState, type TileState, type Stream } from './wall.ts';

export type WallMode = 'hook' | 'paper' | 'test' | 'knob' | 'zero' | 'replay' | 'methods' | 'close';

export type WallProps = {
  mode: WallMode;
  /** Hook: scene second at which tiles start going dark ("quietly forgot"). */
  forgetAt?: number;
  /** Paper: scene second the "forgetting: ?" gauge lights ("never measures the forgetting"). */
  askAt?: number;
  /** Zero: scene second "−0.15 at worst" is spoken. Replay: scene second of the 25 % / 50 % points. */
  secondAt?: number;
  /** Close: scene second "pick the method" is spoken. */
  pickAt?: number;
  /** Read by Video.tsx: draw the first narration line as the hook title (no caption for it). */
  titleLine?: boolean;
};

const E = (t: number, at: number, len: number) => easeOutCubic(progress(t, at, len));

export type FallingCard = { col: number; p: number; opacity: number };

export type WallState = {
  mode: WallMode;
  tiles: TileState[];
  wall: { appear: number; dim: number; shrink: number; jitter: number };
  cards: CardState[];
  /** Hook terminal chip. */
  chip: { appear: number; typed: number; out: number; tick: number };
  /** Paper: the big wall and its tags. */
  big: { rise: number; tag: number; mixed: number; gauge: number; pulse: number };
  /** Test: the model chip and the before → after tag. */
  model: { appear: number; tag: number };
  gauges: { appear: number; drop: number; highlight: number }[];
  dial: { appear: number; pos: number; seeds: number };
  /** Terminal task meter (0.36 → 0.90). */
  meter: { appear: number; fill: number; done: number };
  stats: { avg: number; worst: number };
  curve: { appear: number; seg: number; p0: number; stamp: number; sub: number; more: number; known: number };
  methods: {
    left: { appear: number; jitter: number };
    leftTiles: TileState[];
    leftCards: FallingCard[];
    right: { appear: number; glass: number; column: number; fill: number };
    rightCards: FallingCard[];
    notes: number;
  };
  close: { quote: number; caps: number[]; pick: number };
};

const ZERO_TILES: TileState[] = Array.from({ length: N }, () => ({ paint: 0, dark: 0, flash: 0 }));

/** A scattered remap of the tiles for the full fine-tuning wall: paint lands anywhere. */
const PERM: number[] = (() => {
  const r = rng(11);
  const a = Array.from({ length: N }, (_, i) => i);
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(r() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
})();

/** Falling cards for the methods walls: column per card, seeded. */
const falling = (s: Stream, t: number, colOf: (k: number) => number): FallingCard[] =>
  cardsAt(s, t).map((c) => ({ col: colOf(c.k), p: c.p, opacity: c.opacity }));

const LEFT_COL = (() => {
  const r = rng(5);
  return Array.from({ length: 400 }, () => Math.floor(r() * (COLS - 1)));
})();

export function frameState(props: WallProps, t0: number, beats: number[], dur: number): WallState {
  const t = sceneTime(t0, dur);
  const mode = props.mode;
  const D = Number.isFinite(dur) && dur > 0 ? dur : 0.01;
  const b0 = Math.min(beatAt(beats, 0), D);
  const raw1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + (D - b0) * 0.5;
  const b1 = fit(raw1, 0.8, D);
  /** Approximate end of the narration (the scene tail is 0.8 s). */
  const end = Math.max(b0 + 0.4, D - 0.8);

  const s: WallState = {
    mode,
    tiles: ZERO_TILES,
    wall: { appear: E(t, 0, 0.5), dim: 0, shrink: 0, jitter: 0 },
    cards: [],
    chip: { appear: 0, typed: 0, out: 0, tick: 0 },
    big: { rise: 0, tag: 0, mixed: 0, gauge: 0, pulse: 0 },
    model: { appear: 0, tag: 0 },
    gauges: [0, 1, 2, 3].map(() => ({ appear: 0, drop: 0, highlight: 0 })),
    dial: { appear: 0, pos: 0, seeds: 0 },
    meter: { appear: 0, fill: 0, done: 0 },
    stats: { avg: 0, worst: 0 },
    curve: { appear: 0, seg: 0, p0: 0, stamp: 0, sub: 0, more: 0, known: 0 },
    methods: {
      left: { appear: 0, jitter: 0 },
      leftTiles: ZERO_TILES,
      leftCards: [],
      right: { appear: 0, glass: 0, column: 0, fill: 0 },
      rightCards: [],
      notes: 0,
    },
    close: { quote: 0, caps: [0, 0, 0, 0, 0, 0], pick: 0 },
  };

  if (mode === 'hook') {
    const forgetAt = fit(props.forgetAt ?? b0 + (end - b0) * 0.6, 1.4, D);
    const stream: Stream = { start: 0.3, end: Math.max(0.3, D - 0.9), dt: 0.22, travel: 0.85, ratio: () => 0 };
    s.cards = cardsAt(stream, t);
    s.tiles = tilesAt({ paintStart: 0.9, paintLen: Math.max(0.5, forgetAt - 0.4), darkStart: forgetAt, darkLen: 1.3 }, t);
    s.chip = {
      appear: E(t, 0.1, 0.4),
      typed: clamp01(progress(t, 0.35, 0.7)),
      out: E(t, 1.15, 0.3),
      tick: E(t, 1.45, 0.3),
    };
    return s;
  }

  if (mode === 'paper') {
    const askAt = fit(props.askAt ?? b0 + (end - b0) * 0.62, 0.5, D);
    s.big = {
      rise: E(t, b0, 0.9),
      tag: E(t, b0 + 0.5, 0.4),
      mixed: E(t, fit(b0 + (end - b0) * 0.3, 0.4, D), 0.4),
      gauge: E(t, askAt, 0.45),
      pulse: t > askAt + 0.45 ? 0.5 + 0.5 * Math.sin((t - askAt) * 7) : 0,
    };
    return s;
  }

  // Single-wall modes from here on share the layout: dial, wall + conveyor, meter, gauges.
  if (mode === 'test') {
    s.model = { appear: E(t, b0, 0.4), tag: E(t, fit(end - 0.2, 0.4, D), 0.4) };
    const span = Math.max(0.4, end - b0 - 0.3);
    s.gauges = s.gauges.map((_, i) => ({ appear: E(t, fit(b0 + 0.3 + (i / 4) * span, 0.35, D), 0.35), drop: 0, highlight: 0 }));
    return s;
  }

  const gaugesOn = s.gauges.map(() => ({ appear: 1, drop: 0, highlight: 0 }));

  if (mode === 'knob') {
    // The dial clicks up 10 % → 25 % → 50 % across the line and rests on each stop long enough
    // for the conveyor to show that share of white cards (1 in 10, 1 in 4, 1 in 2). The next
    // scene opens back on 0 %.
    const up0 = b0 + 0.5;
    const step = Math.max(0.5, (end - up0) / 3);
    const posAt = (x: number) => [0, 1, 2].reduce((acc, i) => acc + E(x, up0 + i * step, 0.3), 0);
    const pos = posAt(t);
    s.dial = { appear: E(t, b0 - 0.2, 0.4), pos, seeds: E(t, fit(b0 + (end - b0) * 0.55, 0.4, D), 0.4) };
    const stream: Stream = {
      start: b0,
      end: D,
      dt: 0.2,
      travel: 0.8,
      // A card's share is the dial's while it is mid-conveyor, so the lane matches the dial.
      ratio: (ts) => ratioAtDial(posAt(ts + 0.4)),
    };
    s.cards = cardsAt(stream, t);
    s.gauges = s.gauges.map(() => ({ appear: 0.35, drop: 0, highlight: 0 }));
    return s;
  }

  if (mode === 'zero') {
    // Lines: "With none, it learned the terminal," / "but its general scores all fell." /
    // "Down 0.078 on average, 0.15 at worst." The stats come on the last line.
    const rawS = beats[2] !== undefined && Number.isFinite(beats[2]) ? beats[2] : raw1;
    const b1 = fit(rawS, 0.8, D);
    s.dial = { appear: 1, pos: 0, seeds: 0 };
    const stopAt = b1 + 0.3;
    s.cards = cardsAt({ start: Math.max(0, b0 - 0.6), end: stopAt, dt: 0.2, travel: 0.8, ratio: () => 0 }, t);
    const grow = Math.max(0.6, b1 - b0 - 0.2);
    s.tiles = tilesAt({ paintStart: b0, paintLen: grow * 0.8, darkStart: b0 + 0.4, darkLen: grow * 0.75 }, t);
    s.meter = { appear: E(t, b0 - 0.2, 0.4), fill: E(t, b0 + 0.2, grow * 0.7), done: E(t, b0 + 0.2 + grow * 0.7, 0.3) };
    s.gauges = s.gauges.map((_, i) => ({ appear: 1, drop: E(t, fit(b0 + 0.6 + (i / 4) * grow * 0.75, 0.5, D), 0.5), highlight: 0 }));
    const worstAt = fit(props.secondAt ?? b1 + (end - b1) * 0.55, 0.4, D);
    s.wall.dim = E(t, b1, 0.4);
    s.stats = { avg: E(t, b1 + 0.05, 0.4), worst: E(t, worstAt, 0.4) };
    s.gauges[1].highlight = E(t, worstAt, 0.4);
    return s;
  }

  if (mode === 'replay') {
    s.dial = { appear: 1, pos: 1 * E(t, b0 + 0.1, 0.35), seeds: 0 };
    const stream: Stream = { start: b0 + 0.2, end: b1 + 1.4, dt: 0.2, travel: 0.8, ratio: () => 0.1, phase: 5 };
    s.cards = cardsAt(stream, t);
    const lands = whiteLandings(stream);
    const lastWhite = lands.at(-1) ?? b1;
    s.tiles = tilesAt(
      { paintStart: b0 + 0.3, paintLen: Math.max(0.6, lastWhite - b0 - 0.3), darkStart: b0 + 0.6, darkLen: Math.max(0.4, lastWhite - b0 - 1.1), relight: lands },
      t,
    );
    s.meter = { appear: 1, fill: 1, done: 1 };
    s.gauges = gaugesOn;
    // Line 2: the wall shrinks to the top; the curve takes the lower part.
    s.wall.shrink = E(t, b1, 0.6);
    const secondAt = fit(props.secondAt ?? b1 + (end - b1) * 0.62, 0.9, D);
    s.curve = {
      appear: E(t, b1 + 0.1, 0.4),
      p0: E(t, b1 + 0.35, 0.3),
      // 0 → 10 % first (seg 0..1), then 25 % and 50 % (seg 1..3).
      seg: clamp01(progress(t, b1 + 0.6, 0.6)) + 2 * clamp01(progress(t, secondAt, 0.8)),
      stamp: E(t, fit(b1 + 1.2, 0.35, D), 0.35),
      sub: E(t, fit(b1 + 1.7, 0.35, D), 0.35),
      more: E(t, fit(secondAt + 0.8, 0.35, D), 0.35),
      known: E(t, fit(secondAt + 1.3, 0.35, D), 0.35),
    };
    return s;
  }

  if (mode === 'methods') {
    const lStream: Stream = { start: b0 + 0.4, end: D, dt: 0.32, travel: 0.7, ratio: () => 0 };
    const rStream: Stream = { start: b1 + 1.0, end: D, dt: 0.32, travel: 0.7, ratio: () => 0 };
    const leftRaw = tilesAt({ paintStart: b0 + 1.0, paintLen: Math.max(1, D - b0 - 1.6), darkStart: b0 + 1.3, darkLen: Math.max(1, D - b0 - 2) }, t);
    s.methods = {
      left: { appear: E(t, b0 - 0.2, 0.45), jitter: E(t, b0 + 0.3, 0.5) },
      leftTiles: PERM.map((j) => leftRaw[j]),
      leftCards: falling(lStream, t, (k) => LEFT_COL[k % LEFT_COL.length]),
      right: {
        appear: E(t, b1 - 0.1, 0.45),
        glass: E(t, b1 + 0.3, 0.5),
        column: E(t, b1 + 0.7, 0.4),
        fill: clamp01(progress(t, b1 + 1.6, Math.max(0.6, D - b1 - 2.2))),
      },
      rightCards: falling(rStream, t, () => COLS - 1),
      notes: 0,
    };
    s.methods.notes = s.methods.right.column;
    return s;
  }

  // close
  const pickAt = fit(props.pickAt ?? b0 + (end - b0) * 0.55, 0.6, D);
  const capSpan = Math.max(0.6, pickAt - b0 - 0.4);
  s.close = {
    quote: E(t, b0 - 0.1, 0.4),
    caps: [0, 1, 2, 3, 4, 5].map((i) => E(t, fit(b0 + 0.2 + (i / 6) * capSpan, 0.3, D), 0.3)),
    pick: E(t, pickAt, 0.5),
  };
  return s;
}

/** Wall grid size, re-exported for the drawing. */
export const GRID = { cols: COLS, rows: ROWS } as const;
