// Pure state of the DepthWell scenes: the game as a vertical shaft, depth = moves played. At the
// lip a small 5x5 board (move 0); at the bottom the move limit (100). Random games are dashed
// rays that stop where the real game ended; competent games are an indigo glow that pours down
// and pools on the floor. The rule lives on the floor: a gold crown in the truth, a rose overlay
// ("draw") in the model. Ray and glow lengths are the real army5x5a game lengths
// (src/data/lengths.ts); positions, order and timing are illustrative. No Remotion or React here.
import type { Label } from '../types.ts';
import { COMPETENT_LENGTHS, MOVE_LIMIT, RANDOM_LENGTHS } from '../data/lengths.ts';
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { easeInOut, lerp } from './motion.ts';

export type Mode =
  | 'hook'
  | 'gate'
  | 'rule'
  | 'ruleCap'
  | 'random'
  | 'competent'
  | 'omit'
  | 'accuracy'
  | 'mechanism'
  | 'repair'
  | 'lesson'
  | 'fix'
  | 'still';

export type FloorKind = 'none' | 'truth' | 'model';

export type DepthProps = {
  mode: Mode;
  /** Corner chip naming what is on screen (truth / the model). */
  chip?: Label;
  /** The chip text differs from the previous (blended) scene: fade it in after the blend. */
  chipIn?: boolean;
  /** fix: the chip changes to this label once the rule is back in the spec. */
  chipTo?: Label;
  /** What the floor shows (where the rule lives). Default per mode. */
  floor?: FloorKind;
  /** gate: the stamp that lands once every sampled move matched. */
  stamp?: { text: string; sub?: string; beat?: number; delay?: number };
  /** gate: 'missed' replays only the sampled games that never reached the floor. */
  sample?: 'all' | 'missed';
  /** random / competent: the headline figure in the top slot. */
  counter?: { to: number; decimals: number; prefix?: string; suffix: string; text: string; label: string; beat?: number; delay?: number };
  /** still: which end state to freeze (as a dimmed backdrop under a card). */
  of?: Mode;
};

// ---------------------------------------------------------------------------------------------
// Geometry, in frame pixels (1080x1920 vertical; the stage runs from y 236 to 1326).

export const G = {
  topSlot: { top: 238, h: 202 },
  lip: 560,
  floor: 1170,
  x0: 250,
  x1: 830,
  band: 54,
  chipTop: 1250,
  lipBoard: { cx: 540, cy: 500, cell: 15 },
  floorBoard: { cx: 540, cell: 68 },
} as const;

export const SHAFT_W = G.x1 - G.x0;
export const depthY = (moves: number): number => G.lip + (Math.min(MOVE_LIMIT, Math.max(0, moves)) / MOVE_LIMIT) * (G.floor - G.lip);
export const floorBoardCy = G.floor - 16 - (G.floorBoard.cell * 5) / 2;

/** Column of the i-th of n lines across the shaft, spread with a fixed permutation (no overlap). */
const column = (i: number, n: number, step: number, pad: number): number => {
  const k = (i * step) % n;
  return G.x0 + pad + ((k + 0.5) / n) * (SHAFT_W - 2 * pad);
};

const RANDOM = RANDOM_LENGTHS.map((len, i) => ({ len, x: column(i, RANDOM_LENGTHS.length, 7, 26) }));
const MISSED = RANDOM_LENGTHS.filter((l) => l < MOVE_LIMIT).map((len, i, a) => ({ len, x: column(i, a.length, 7, 26) }));
const COMPETENT = COMPETENT_LENGTHS.map((len, i) => ({ len, x: column(i, COMPETENT_LENGTHS.length, 11, 70) }));

/** Positions the planner visits: one every 10 moves down each competent game; the floor ones are where the rule decides. */
export const VISITS = COMPETENT.flatMap((g, gi) => {
  const out: { x: number; y: number; floor: boolean; order: number }[] = [];
  for (let m = 6 + (gi % 4) * 2; m < g.len; m += 11) out.push({ x: g.x, y: depthY(m), floor: false, order: m / MOVE_LIMIT });
  if (g.len >= MOVE_LIMIT) out.push({ x: g.x, y: depthY(MOVE_LIMIT) + G.band / 2, floor: true, order: 1 });
  return out;
});

/** The wrong squares on the floor (mechanism): under the glow's pool. */
export const FLOOR_SQUARES = 7;

// ---------------------------------------------------------------------------------------------
// The board: generals, infantry and cavalry for both sides. Illustrative positions: the start of
// a game, and a position at the move limit with both generals alive and white ahead 5 to 3.

export type PieceKind = 'general' | 'infantry' | 'cavalry';
type Piece = { side: 0 | 1; kind: PieceKind; start: [number, number]; cap: [number, number] | null };
export const PIECES: Piece[] = [
  { side: 0, kind: 'cavalry', start: [0, 4], cap: [0, 2] },
  { side: 0, kind: 'infantry', start: [1, 4], cap: [1, 2] },
  { side: 0, kind: 'general', start: [2, 4], cap: [2, 3] },
  { side: 0, kind: 'infantry', start: [3, 4], cap: [3, 3] },
  { side: 0, kind: 'cavalry', start: [4, 4], cap: [4, 1] },
  { side: 1, kind: 'cavalry', start: [0, 0], cap: null },
  { side: 1, kind: 'infantry', start: [1, 0], cap: [1, 1] },
  { side: 1, kind: 'general', start: [2, 0], cap: [2, 0] },
  { side: 1, kind: 'infantry', start: [3, 0], cap: null },
  { side: 1, kind: 'cavalry', start: [4, 0], cap: [3, 1] },
];

// ---------------------------------------------------------------------------------------------

export type Ray = { x: number; yEnd: number; draw: number; end: number; tick: number; floor: number; opacity: number };
export type Strand = { x: number; yEnd: number; draw: number };
export type Square = { x: number; y: number; pop: number; rose: number };
export type TextMark = { id: string; text: string; accent?: string; x: number; y: number; size: number; tone: 'text' | 'muted' | 'ok' | 'rose' | 'accent' | 'gold'; opacity: number };

/** Scene transition (0.6 s): on a blend, what is new in the top slot waits until the old one has gone. */
export const AFTER_BLEND = 0.62;

const FALL = (len: number) => 0.22 + 0.62 * (len / MOVE_LIMIT);

function raysOf(set: { len: number; x: number }[], T: number, t0: number, stagger: number, d: number, tick: boolean): Ray[] {
  const total = (set.length - 1) * stagger + FALL(MOVE_LIMIT) + 0.3;
  const s0 = fit(t0, total, d);
  return set.map((g, i) => {
    const s = s0 + i * stagger;
    const draw = easeOutCubic(progress(T, s, FALL(g.len)));
    const landed = s + FALL(g.len);
    return {
      x: g.x,
      yEnd: depthY(g.len),
      draw,
      end: progress(T, landed, 0.18),
      tick: tick ? progress(T, landed + 0.05, 0.22) : 0,
      floor: g.len >= MOVE_LIMIT ? progress(T, landed, 0.3) : 0,
      opacity: 1,
    };
  });
}

const drawnRays = (set: { len: number; x: number }[], opacity: number): Ray[] =>
  set.map((g) => ({ x: g.x, yEnd: depthY(g.len), draw: 1, end: 1, tick: 0, floor: g.len >= MOVE_LIMIT ? 1 : 0, opacity }));

/** The glow pours down every competent game at the same pace; returns the strands and how much has pooled. */
function pour(T: number, t0: number, len: number, d: number): { strands: Strand[]; pool: number; arrived: number } {
  const s0 = fit(t0, len + 0.3, d);
  let floorN = 0;
  let arrivedN = 0;
  const strands = COMPETENT.map((g, i) => {
    const s = s0 + (i % 5) * 0.04;
    const need = (len * g.len) / MOVE_LIMIT;
    const draw = easeInOut(progress(T, s, need));
    if (g.len >= MOVE_LIMIT) {
      floorN++;
      if (T >= s + need) arrivedN++;
    }
    return { x: g.x, yEnd: depthY(g.len), draw };
  });
  const arrived = floorN ? arrivedN / floorN : 0;
  return { strands, pool: easeOutCubic(progress(T, s0 + len, 0.6)), arrived };
}

const fullGlow = () => ({ strands: COMPETENT.map((g) => ({ x: g.x, yEnd: depthY(g.len), draw: 1 })), pool: 1, arrived: 1 });

export type World = {
  rays: Ray[];
  glow: { strands: Strand[]; pool: number; opacity: number; red: number };
  floor: { truth: number; model: number; red: number; squares: number[]; probe: number; label: number };
  board: { cx: number; cy: number; cell: number; opacity: number; morph: number; crown: number; pieces: number };
  moveCounter: { opacity: number; value: number; alive: number };
  probe: { draw: number; tick: number };
  squares: Square[];
  bands: { sample: number; used: number };
  stamp: { text: string; sub: string; pop: number; opacity: number; tone: 'ok' | 'rose' };
  marks: TextMark[];
  top: {
    meter: { opacity: number; text: string; needle: number; rose: number };
    spec: { opacity: number; extra: number; typed: number; strike: number; retype: number };
    counter: { opacity: number; pop: number; text: string; label: string };
    match: { opacity: number; pairs: number[] };
    tile: { opacity: number; pop: number };
    code: { opacity: number; passes: number; cards: { x: number; y: number; opacity: number; scale: number }[] };
  };
  dim: number;
};

const base = (): World => ({
  rays: [],
  glow: { strands: [], pool: 0, opacity: 1, red: 0 },
  floor: { truth: 0, model: 0, red: 0, squares: Array.from({ length: FLOOR_SQUARES }, () => 0), probe: 0, label: 1 },
  board: { cx: G.lipBoard.cx, cy: G.lipBoard.cy, cell: G.lipBoard.cell, opacity: 1, morph: 0, crown: 0, pieces: 1 },
  moveCounter: { opacity: 0, value: 0, alive: 0 },
  probe: { draw: 0, tick: 0 },
  squares: [],
  bands: { sample: 0, used: 0 },
  stamp: { text: '', sub: '', pop: 0, opacity: 0, tone: 'ok' },
  marks: [],
  top: {
    meter: { opacity: 0, text: '', needle: 0, rose: 0 },
    spec: { opacity: 0, extra: 0, typed: 0, strike: 0, retype: 0 },
    counter: { opacity: 0, pop: 0, text: '', label: '' },
    match: { opacity: 0, pairs: Array.from({ length: 10 }, () => 0) },
    tile: { opacity: 0, pop: 0 },
    code: { opacity: 0, passes: 0, cards: [] },
  },
  dim: 1,
});

/** Win-rate HUD: needle position on a 0.35..0.55 scale. */
export const meterPos = (v: number): number => clamp01((v - 0.35) / 0.2);

const floorOf = (p: DepthProps, mode: Mode): FloorKind =>
  p.floor ?? (mode === 'gate' || mode === 'rule' || mode === 'ruleCap' ? 'none' : mode === 'random' || mode === 'competent' ? 'truth' : 'model');

const setFloor = (w: World, kind: FloorKind) => {
  w.floor.truth = kind === 'truth' ? 1 : 0;
  w.floor.model = kind === 'model' ? 1 : 0;
};

function world(p: DepthProps, mode: Mode, T: number, beats: number[], d: number): World {
  const w = base();
  const b0 = beatAt(beats, 0);
  const b1 = beatAt(beats, 1);
  setFloor(w, floorOf(p, mode));

  switch (mode) {
    case 'hook': {
      // Already falling on the first frame (a strong first frame): the rays run 0.7 s ahead.
      // This is the rule-blind model on a rose floor that "passed at 100%": only the sampled games
      // that never reached the floor (as in gate2), or a ray landing on the rule would contradict it.
      w.rays = raysOf(MISSED, T + 0.7, 0, 0.07, Math.min(d, Math.max(3.4, b1)), true);
      const stampAt = fit(b0 + 2.85, 0.4, d);
      w.stamp = { text: 'CHECK PASSED · 100%', sub: '', pop: easeOutCubic(progress(T, stampAt, 0.35)), opacity: progress(T, stampAt, 0.12), tone: 'ok' };
      // The glow starts pouring just before "It still lost" and reaches the floor on "lost": the
      // floor flushes red and the needle drops to 0.404 on that word, then holds.
      const pourAt = fit(b1 - 0.3, 1.4, d);
      const g = pour(T, pourAt, 0.65, d);
      w.glow = { strands: g.strands, pool: g.pool, opacity: 1, red: 0 };
      w.floor.red = progress(T, fit(pourAt + 0.65, 0.3, d), 0.3);
      const fade = progress(T, pourAt, 0.5);
      w.rays.forEach((r) => (r.opacity = 1 - 0.55 * fade));
      w.stamp.opacity *= 1 - 0.45 * fade;
      const showAt = fit(b1 - 0.55, 1.6, d);
      const dropAt = fit(pourAt + 0.6, 0.5, d);
      const dp = easeInOut(progress(T, dropAt, 0.5));
      w.top.meter = {
        opacity: progress(T, showAt, 0.35),
        text: dp >= 0.5 ? '0.404' : '0.495',
        needle: meterPos(lerp(0.495, 0.404, dp)),
        rose: dp,
      };
      break;
    }
    case 'gate': {
      const missed = p.sample === 'missed';
      const set = missed ? MISSED : RANDOM;
      w.rays = raysOf(set, T, b0 + 0.15, 0.085, d, true);
      const st = p.stamp ?? { text: 'GATE · 100%' };
      const at = fit(beatAt(beats, st.beat ?? 1) + (st.delay ?? 1.0), 0.45, d);
      w.stamp = { text: st.text, sub: st.sub ?? '', pop: easeOutCubic(progress(T, at, 0.35)), opacity: progress(T, at, 0.12), tone: 'ok' };
      const in0 = Math.max(b0, missed ? AFTER_BLEND : 0);
      w.top.match.opacity = progress(T, fit(in0, 0.4, d), 0.4);
      const m0 = fit(in0 + 0.35, 0.3, d);
      const m1 = Math.max(m0 + 0.5, at - 0.15);
      w.top.match.pairs = w.top.match.pairs.map((_, i) => progress(T, m0 + ((m1 - m0) * i) / 10, 0.25));
      break;
    }
    case 'rule': {
      const mv = easeInOut(progress(T, fit(b0 + 0.25, 1.3, d), 1.3));
      w.board.cx = G.lipBoard.cx;
      w.board.cy = lerp(G.lipBoard.cy, floorBoardCy, mv);
      w.board.cell = lerp(G.lipBoard.cell, G.floorBoard.cell, mv);
      w.top.spec.opacity = progress(T, fit(b0, 0.4, d), 0.4);
      w.top.spec.extra = progress(T, fit(b0 + 1.4, 0.4, d), 0.4);
      break;
    }
    case 'ruleCap': {
      w.board.cy = floorBoardCy;
      w.board.cell = G.floorBoard.cell;
      w.top.spec.opacity = 1;
      w.top.spec.extra = 1;
      w.top.spec.typed = progress(T, fit(b0 + 0.1, 2.0, d), 2.0);
      const roll = progress(T, fit(b0 + 0.15, 1.5, d), 1.5);
      w.board.morph = easeInOut(roll);
      w.moveCounter = { opacity: progress(T, fit(b0, 0.3, d), 0.3), value: Math.round(lerp(0, 100, easeInOut(roll))), alive: progress(T, fit(b0 + 1.7, 0.35, d), 0.35) };
      w.board.crown = easeOutCubic(progress(T, fit(b0 + 2.2, 0.4, d), 0.4));
      w.floor.truth = progress(T, fit(d - 0.9, 0.5, d), 0.5);
      w.floor.label = w.floor.truth;
      break;
    }
    case 'random': {
      const back = easeInOut(progress(T, fit(AFTER_BLEND, 0.7, d), 0.7));
      w.board.cy = lerp(floorBoardCy, G.lipBoard.cy, back);
      w.board.cell = lerp(G.floorBoard.cell, G.lipBoard.cell, back);
      w.board.morph = 1 - back;
      w.board.crown = 1 - back;
      w.rays = raysOf(RANDOM, T, b0 + 0.3, 0.06, d, false);
      counterInto(w, p, T, beats, d);
      break;
    }
    case 'competent': {
      w.rays = drawnRays(RANDOM, 0.3);
      const g = pour(T, b0 + 0.15, 2.0, d);
      w.glow = { strands: g.strands, pool: g.pool, opacity: 1, red: 0 };
      counterInto(w, p, T, beats, d);
      break;
    }
    case 'omit': {
      w.top.spec = { opacity: progress(T, fit(AFTER_BLEND, 0.3, d), 0.3), extra: 1, typed: 1, strike: progress(T, fit(Math.max(b0 + 0.6, AFTER_BLEND + 0.4), 0.6, d), 0.6), retype: 0 };
      const sw = easeInOut(progress(T, fit(Math.max(b0 + 1.0, AFTER_BLEND + 0.8), 0.8, d), 0.8));
      w.floor.truth = 1 - sw;
      w.floor.model = sw;
      break;
    }
    case 'accuracy': {
      w.glow = { ...fullGlow(), opacity: 0.55, red: 0 };
      const s0 = fit(b0 + 0.2, 2.6, d);
      w.squares = VISITS.map((v) => ({ x: v.x, y: v.y, pop: easeOutCubic(progress(T, s0 + 2.0 * v.order, 0.3)), rose: v.floor ? 1 : 0 }));
      const tileAt = Math.max(b0 + 0.3, AFTER_BLEND);
      w.top.tile = { opacity: progress(T, fit(tileAt, 0.4, d), 0.4), pop: easeOutCubic(progress(T, fit(tileAt, 0.5, d), 0.5)) };
      break;
    }
    case 'mechanism': {
      w.rays = drawnRays(RANDOM, 0.55);
      const g = pour(T, b0 + 0.1, 1.3, d);
      w.glow = { strands: g.strands, pool: g.pool, opacity: 1, red: 0 };
      const at = fit(b0 + 0.1 + 1.3, 0.9, d);
      w.floor.squares = w.floor.squares.map((_, i) => progress(T, at + 0.1 * Math.abs(i - 3), 0.4));
      w.marks.push({ id: 'checked', text: 'checked', x: 540, y: depthY(18), size: 46, tone: 'ok', opacity: progress(T, fit(b0 + 0.2, 0.4, d), 0.4) });
      w.marks.push({ id: 'decides', text: 'decides games', x: 540, y: G.floor - 58, size: 50, tone: 'rose', opacity: progress(T, at + 0.2, 0.4) });
      break;
    }
    case 'repair': {
      w.dim = 0.6;
      w.top.code.opacity = progress(T, fit(b0, 0.4, d), 0.4);
      // Cards fly quicker (0.3 s apart) and the two tags land after the last card has crossed
      // the shaft, so no card passes over them: data ✓ on "it stayed", code ✗ on "blind".
      const s0 = fit(b0 + 0.25, 5 * 0.3 + 0.6, d);
      let passes = 0;
      w.top.code.cards = Array.from({ length: 6 }, (_, k) => {
        const s = s0 + k * 0.3;
        const q = easeInOut(progress(T, s, 0.6));
        if (T >= s + 0.6) passes++;
        return {
          x: lerp(400 + k * 56, 760, q),
          y: lerp(G.floor - 70, G.topSlot.top + 120, q),
          opacity: progress(T, s, 0.12) * (1 - progress(T, s + 0.5, 0.12)),
          scale: lerp(1, 0.55, q),
        };
      });
      w.top.code.passes = passes;
      w.marks.push({ id: 'tagData', text: 'rule in the data ✓', x: 540, y: depthY(30), size: 46, tone: 'ok', opacity: progress(T, fit(s0 + 5 * 0.3 + 0.62, 0.3, d), 0.3) });
      w.marks.push({ id: 'tagCode', text: 'rule in the code ✗', x: 540, y: depthY(48), size: 46, tone: 'rose', opacity: progress(T, fit(s0 + 5 * 0.3 + 0.95, 0.3, d), 0.3) });
      break;
    }
    case 'lesson': {
      w.rays = drawnRays(RANDOM, 0.55);
      w.glow = { ...fullGlow(), opacity: 0.8, red: 0 };
      w.floor.squares = w.floor.squares.map(() => 1);
      w.bands.sample = progress(T, fit(b0 + 1.3, 0.5, d), 0.5);
      w.bands.used = progress(T, fit(b0 + 3.0, 0.5, d), 0.5);
      w.marks.push({ id: 'sample', text: 'where you ', accent: 'sample', x: 540, y: depthY(26), size: 58, tone: 'text', opacity: w.bands.sample });
      w.marks.push({ id: 'used', text: "where it's ", accent: 'used', x: 540, y: G.floor - 60, size: 58, tone: 'text', opacity: w.bands.used });
      break;
    }
    case 'fix': {
      w.glow = { ...fullGlow(), opacity: 0.8, red: 0 };
      const fallAt = fit(b0 + 0.2, 1.4, d);
      w.probe = { draw: easeInOut(progress(T, fallAt, 1.0)), tick: easeOutCubic(progress(T, fallAt + 1.0, 0.35)) };
      w.marks.push({ id: 'tested', text: 'tested where it’s used', x: 540, y: G.floor - 62, size: 44, tone: 'ok', opacity: progress(T, fallAt + 1.1, 0.4) });
      const rt = fit(b1 + 0.1, 1.6, d);
      w.top.spec = { opacity: progress(T, fit(AFTER_BLEND, 0.3, d), 0.3), extra: 1, typed: 1, strike: 1 - progress(T, rt, 0.3), retype: progress(T, rt + 0.2, 1.2) };
      const sw = easeInOut(progress(T, fit(b1 + 0.5, 0.7, d), 0.7));
      w.floor.model = 1 - sw;
      w.floor.truth = sw;
      break;
    }
    case 'still':
      break;
  }
  return w;
}

function counterInto(w: World, p: DepthProps, T: number, beats: number[], d: number) {
  const c = p.counter;
  if (!c) return;
  const at = fit(beatAt(beats, c.beat ?? 1) + (c.delay ?? 0.15), 0.9, d);
  const q = easeOutCubic(progress(T, at, 0.9));
  w.top.counter = {
    opacity: progress(T, at, 0.25),
    pop: q,
    // The article's figure from the first frame it shows: no in-between number ever on screen.
    text: c.text,
    label: c.label,
  };
}

export function frameState(p: DepthProps, t: number, beats: number[], dur: number) {
  const T = sceneTime(t, dur);
  const d = Number.isFinite(dur) ? Math.max(0, dur) : 1e6;
  const mode = p.mode === 'still' ? (p.of ?? 'still') : p.mode;
  // A still is the end state of another mode, frozen.
  const w = p.mode === 'still' ? world({ ...p, mode }, mode, Number.MAX_SAFE_INTEGER, [], 1e6) : world(p, mode, T, beats, d);
  if (p.mode === 'still') {
    // A backdrop under a card: the shaft only, without the top slot, stamps or labels.
    w.top = base().top;
    w.stamp = base().stamp;
    w.marks = [];
  }
  const b1 = beatAt(beats, 1);
  const chipIn = p.chipIn ? easeInOut(progress(T, 0.6, 0.3)) : 1;
  const swap = p.chipTo ? easeInOut(progress(T, fit(b1 + 0.5, 0.7, d), 0.7)) : 0;
  return {
    mode,
    world: w,
    chip: {
      a: p.chip ?? null,
      aOpacity: p.chip ? chipIn * (1 - Math.min(1, swap * 2)) : 0,
      b: p.chipTo ?? null,
      bOpacity: p.chipTo ? Math.max(0, swap * 2 - 1) : 0,
    },
  };
}

export type DepthState = ReturnType<typeof frameState>;
export { RANDOM, MISSED, COMPETENT };
