// Pure model of the "wall of lit tiles": which tiles take the new skill (accent), which ones go
// dark (forgetting), and the conveyor of batch cards that feeds the wall. Seeded, so every scene
// reuses the same tiles: the patches that go dark in the hook are the ones that relight with replay.
// Illustrative, not proportional to the measured forgetting (see factcheck.md).
// No Remotion or React here.
import { clamp01, easeOutCubic, progress } from './steps.ts';

export const COLS = 12;
export const ROWS = 9;
export const N = COLS * ROWS;

/** Deterministic PRNG (mulberry32). */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const colOf = (i: number) => i % COLS;
export const rowOf = (i: number) => Math.floor(i / COLS);

/** Skill tiles: an organic stain spreading from the left middle (where the conveyor feeds in). */
export const SKILL: number[] = (() => {
  const r = rng(7);
  const scored = Array.from({ length: N }, (_, i) => {
    const dx = colOf(i) - 0.5;
    const dy = (rowOf(i) - 4) * 1.25;
    return { i, d: Math.sqrt(dx * dx + dy * dy) + r() * 2.2 };
  });
  scored.sort((a, b) => a.d - b.d);
  return scored.slice(0, 24).map((s) => s.i);
})();

/** Forgotten tiles: scattered white tiles, about a quarter of the white ones, in the order they go dark. */
export const FORGET: number[] = (() => {
  const r = rng(42);
  const skill = new Set(SKILL);
  const rest = Array.from({ length: N }, (_, i) => i).filter((i) => !skill.has(i));
  for (let k = rest.length - 1; k > 0; k--) {
    const j = Math.floor(r() * (k + 1));
    [rest[k], rest[j]] = [rest[j], rest[k]];
  }
  return rest.slice(0, 22);
})();

/** Forgotten tiles that stay dark even with replay (illustrative remainder, ~a quarter). */
export const RESIDUAL = new Set(FORGET.filter((_, r) => r % 4 === 1));

const SKILL_RANK = new Map(SKILL.map((i, r) => [i, r]));
const FORGET_RANK = new Map(FORGET.map((i, r) => [i, r]));
export const skillRank = (i: number) => SKILL_RANK.get(i);
export const forgetRank = (i: number) => FORGET_RANK.get(i);

/** Per tile: accent paint, darkness and a relight flash, all within [0, 1]. */
export type TileState = { paint: number; dark: number; flash: number };

export type Stream = {
  /** Scene second the first card spawns. */
  start: number;
  /** No card spawns after this. */
  end: number;
  /** Seconds between two cards. */
  dt: number;
  /** Seconds a card travels before it lands. */
  travel: number;
  /** Share of general-text (white) cards at a spawn time. */
  ratio: (t: number) => number;
  /** Shifts which card index is the first white one. */
  phase?: number;
};

export type CardState = { k: number; p: number; white: boolean; opacity: number };

const finite = (x: number, d = 0) => (Number.isFinite(x) ? x : d);

/**
 * Card k is white when the running total of the white share (summed card by card, so a ratio that
 * changes over time, like the knob's sweep, still yields its share) crosses an integer at k.
 * For a constant ratio r this is floor((k + 1 + phase) r) > floor((k + phase) r).
 */
export const isWhite = (s: Stream, k: number): boolean => {
  const r = clamp01(s.ratio(s.start + k * s.dt));
  if (r <= 0) return false;
  const r0 = clamp01(s.ratio(s.start));
  let acc = r0 > 0 ? (s.phase ?? 0) * r0 : 0.5;
  for (let j = 0; j < k; j++) acc += clamp01(s.ratio(s.start + j * s.dt));
  return Math.floor(acc + r) > Math.floor(acc);
};

export const cardCount = (s: Stream): number => {
  const n = Math.floor((finite(s.end) - finite(s.start)) / Math.max(0.05, s.dt)) + 1;
  return Math.max(0, Math.min(400, n));
};

/** Cards on the conveyor at time t (progress p from 0 at spawn to 1 at landing). */
export const cardsAt = (s: Stream, t: number): CardState[] => {
  const out: CardState[] = [];
  const n = cardCount(s);
  for (let k = 0; k < n; k++) {
    const spawn = s.start + k * s.dt;
    const p = (t - spawn) / s.travel;
    if (p < 0 || p > 1.15) continue;
    out.push({ k, p: clamp01(p), white: isWhite(s, k), opacity: clamp01(Math.min(p * 6, (1.15 - p) / 0.15)) });
  }
  return out;
};

/** Landing times of the white cards. */
export const whiteLandings = (s: Stream): number[] => {
  const out: number[] = [];
  const n = cardCount(s);
  for (let k = 0; k < n; k++) if (isWhite(s, k)) out.push(s.start + k * s.dt + s.travel);
  return out;
};

export type WallPlan = {
  /** Accent paint spreads over the skill tiles from paintStart over paintLen. */
  paintStart: number;
  paintLen: number;
  /** Forgotten tiles go dark from darkStart over darkLen. */
  darkStart: number;
  darkLen: number;
  /** Replay: times at which dark tiles relight (white cards landing). */
  relight?: number[];
  /** Overall share of the skill / forget sets used (1 = all). */
  skillShare?: number;
  forgetShare?: number;
};

/** The state of every tile at time t. */
export const tilesAt = (plan: WallPlan, t: number): TileState[] => {
  const nS = Math.max(1, Math.round(SKILL.length * (plan.skillShare ?? 1)));
  const nF = Math.max(1, Math.round(FORGET.length * (plan.forgetShare ?? 1)));
  const relight = (plan.relight ?? []).filter(Number.isFinite).sort((a, b) => a - b);
  return Array.from({ length: N }, (_, i) => {
    const sr = skillRank(i);
    const fr = forgetRank(i);
    let paint = 0;
    let dark = 0;
    let flash = 0;
    if (sr !== undefined && sr < nS) {
      paint = easeOutCubic(progress(t, plan.paintStart + (sr / nS) * plan.paintLen, 0.35));
    }
    if (fr !== undefined && fr < nF) {
      const at = plan.darkStart + (fr / nF) * plan.darkLen;
      dark = easeOutCubic(progress(t, at, 0.5));
      if (relight.length && !RESIDUAL.has(i)) {
        // Relit by the first white card that lands after this tile went dark.
        const back = relight.find((r) => r >= at + 0.25);
        if (back !== undefined) {
          const p = progress(t, back, 0.45);
          dark *= 1 - easeOutCubic(p);
          flash = p > 0 && p < 1 ? Math.sin(Math.PI * p) : 0;
        }
      }
    }
    return { paint: clamp01(paint), dark: clamp01(dark), flash: clamp01(flash) };
  });
};

/** Benchmarks shown as gauges, with the repo's mean drop at 0 % replay (only −0.15 is printed). */
export const GAUGES = [
  { name: 'ARC-Challenge', drop: 0.048 },
  { name: 'ARC-Easy', drop: 0.153 },
  { name: 'HellaSwag', drop: 0.078 },
  { name: 'WinoGrande', drop: 0.031 },
] as const;

/** Gauge "before" fill (illustrative, the same for all) and the drawn fill after a drop. */
export const GAUGE_BEFORE = 0.82;
export const gaugeAfter = (drop: number) => GAUGE_BEFORE - drop * 2;

/** Replay dial ticks. */
export const DIAL = [0, 0.1, 0.25, 0.5] as const;
export const DIAL_LABELS = ['0%', '10%', '25%', '50%'] as const;

/** Replay share at a (fractional) dial position. */
export const ratioAtDial = (pos: number): number => {
  const p = Math.min(DIAL.length - 1, Math.max(0, finite(pos)));
  const i = Math.min(DIAL.length - 2, Math.floor(p));
  const f = p - i;
  return DIAL[i] + (DIAL[i + 1] - DIAL[i]) * f;
};
