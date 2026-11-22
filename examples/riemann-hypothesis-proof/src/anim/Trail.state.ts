// The trail: one world, ten scenes. A walker chooses a route, picks up a sheet everybody walked
// past, a small light runs ahead up the steep stretch, and other people arrive: one with a thick
// manuscript, then many, drawing a map of the stretch nobody has walked.
// A METAPHOR for who did what, never footage of anything measured (see factcheck.md).
//
// Every scene (`mode`) starts exactly where the previous one ended and holds that picture while
// the two scenes blend, so the whole story reads as one continuous shot.
// Pure numbers (no Remotion or React), so `node --test` can check it.
import { beatAt, clamp01, sceneTime } from './steps.ts';

export const MODES = ['open', 'past', 'pick', 'unfold', 'outrun', 'draw', 'second', 'map', 'catchup', 'closer'] as const;
export type TrailMode = (typeof MODES)[number];

export type TrailProps = {
  mode: TrailMode;
  /** Video second this scene starts at: ambient motion (the light's flicker) runs on one clock. */
  clock?: number;
};

// ── Geometry, in vertical frame pixels at zoom 1 (the stage is x 60..1020, y 236..1326) ───────
export type Pt = [number, number];

/** Catmull-Rom through `pts`, `n` samples per segment. */
export const smooth = (pts: Pt[], n = 14): Pt[] => {
  const out: Pt[] = [];
  const at = (i: number): Pt => pts[Math.min(pts.length - 1, Math.max(0, i))];
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let k = 0; k < n; k++) {
      const u = k / n;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

const lengths = (poly: Pt[]): number[] => {
  const acc = [0];
  for (let i = 1; i < poly.length; i++) acc.push(acc[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  return acc;
};

/** Point at fraction `f` (0..1 by length) of a polyline, and which way it heads (1 right, -1 left). */
export const pointAt = (poly: Pt[], f: number): { x: number; y: number; dir: number } => {
  const acc = lengths(poly);
  const total = acc[acc.length - 1];
  const want = clamp01(f) * total;
  let i = 1;
  while (i < poly.length - 1 && acc[i] < want) i++;
  const span = acc[i] - acc[i - 1] || 1;
  const u = clamp01((want - acc[i - 1]) / span);
  const [a, b] = [poly[i - 1], poly[i]];
  return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, dir: b[0] >= a[0] ? 1 : -1 };
};

/** The part of a polyline between fractions `f0` and `f1`, as points. */
export const slice = (poly: Pt[], f0: number, f1: number): Pt[] => {
  const a = clamp01(f0);
  const b = clamp01(f1);
  if (b <= a) return [];
  const acc = lengths(poly);
  const total = acc[acc.length - 1];
  const start = pointAt(poly, a);
  const end = pointAt(poly, b);
  const mid = poly.filter((_, i) => acc[i] > a * total && acc[i] < b * total);
  return [[start.x, start.y], ...mid, [end.x, end.y]];
};

/** Fork point: where the pile of sheets lies. Stop point: where the walker can go no further. */
export const FORK: Pt = [700, 1010];
export const STOP: Pt = [400, 800];
export const SUMMIT: Pt = [590, 318];

/** The route the walker chose, from far back to the fork. */
export const PAST = smooth([[150, 1290], [330, 1235], [250, 1140], [470, 1085], [600, 1110], FORK]);
/** The stretch the sheet unfolds into. */
export const FIRST = smooth([FORK, [610, 930], [470, 900], STOP]);
/** The steep stretch: only the light goes up it. */
export const STEEP = smooth([STOP, [500, 720], [420, 640], [560, 560], [480, 470], [600, 400], SUMMIT]);

/** Where the second figure comes in from, on a path of its own that never joins the summit. */
export const SIDE = smooth([[1060, 960], [940, 930], [860, 880], [790, 870]]);

/** Position on the whole route: 0..1 the past, 1..2 the first stretch, 2..3 the steep one. */
export const onRoute = (pos: number): { x: number; y: number; dir: number } => {
  const p = Number.isFinite(pos) ? Math.min(3, Math.max(0, pos)) : 0;
  if (p <= 1) return pointAt(PAST, p);
  if (p <= 2) return pointAt(FIRST, p - 1);
  return pointAt(STEEP, p - 2);
};

/** The map never reaches the light: understanding is behind (the article's words). */
export const MAP_CEILING = 0.85;

// ── The story as numbers ───────────────────────────────────────────────────────────────────────
export type Vals = {
  camX: number; camY: number; zoom: number;
  /** Walker on the route (see onRoute). */
  pos: number;
  /** Year ticks and the dead-end forks behind the walker. */
  marks: number;
  /** The pile of sheets, the glow of the overlooked one, and it being picked up. */
  pile: number; glow: number; pick: number;
  /** The word on screen, and the sheet unfolding into the first stretch. */
  taste: number; unfold: number;
  /** The steep stretch hinted, the light there, and how far up it has run. */
  steep: number; light: number; run: number;
  /** "out of my element", in his words. */
  quote: number;
  /** The walker's sheet and how much of the steep stretch he has drawn on it. */
  sheet: number; sketch: number;
  /** The second figure arriving, its label, and its message. */
  second: number; years: number; here: number;
  /** The crowd, the map they draw over the steep stretch, and its label. */
  crowd: number; map: number; mapTag: number;
  /** New forks opening and more people on them. */
  forks: number;
};

const ZERO: Vals = {
  camX: 265, camY: 1225, zoom: 2.4, pos: 0.2, marks: 0, pile: 0, glow: 0, pick: 0, taste: 0, unfold: 0, steep: 0, light: 0, run: 0,
  quote: 0, sheet: 0, sketch: 0, second: 0, years: 0, here: 0, crowd: 0, map: 0, mapTag: 0, forks: 0,
};

/** One change inside a scene: `key` goes to `to`, starting `off` seconds after beat `beat`. */
type Tween = { key: keyof Vals; to: number; beat?: number; off?: number; len: number; ease?: 'out' | 'inout' | 'linear' };

export const SCRIPT: Record<TrailMode, Tween[]> = {
  // "But look at what the humans did."
  open: [
    { key: 'pos', to: 0.38, len: 2.2, ease: 'linear' },
    { key: 'camX', to: 300, len: 2.2, ease: 'linear' },
    { key: 'camY', to: 1170, len: 2.2, ease: 'linear' },
  ],
  // "The author had planned his whole career around this problem."
  past: [
    { key: 'zoom', to: 1.45, len: 1.4, ease: 'inout' },
    { key: 'camX', to: 430, len: 1.4, ease: 'inout' },
    { key: 'camY', to: 1075, len: 1.4, ease: 'inout' },
    { key: 'marks', to: 1, off: 0.5, len: 1.6 },
    { key: 'pos', to: 0.74, len: 3.0, ease: 'inout' },
  ],
  // "His clue was a paper almost nobody discussed, in a pile a rival lab had published."
  pick: [
    { key: 'zoom', to: 2.2, len: 1.2, ease: 'inout' },
    { key: 'camX', to: 715, len: 1.2, ease: 'inout' },
    { key: 'camY', to: 1050, len: 1.2, ease: 'inout' },
    { key: 'pile', to: 1, len: 0.5 },
    { key: 'pos', to: 0.97, len: 2.4, ease: 'inout' },
    { key: 'glow', to: 1, off: 0.9, len: 0.6 },
    { key: 'pick', to: 1, off: 3.2, len: 0.9, ease: 'inout' },
  ],
  // "That is taste." / "Nobody automated it."
  unfold: [
    { key: 'taste', to: 1, len: 0.4 },
    // The word leaves before the camera pulls back and the mountain comes under it.
    { key: 'taste', to: 0, beat: 1, off: -0.1, len: 0.3 },
    { key: 'zoom', to: 1.6, beat: 1, off: 0.2, len: 1.1, ease: 'inout' },
    { key: 'camX', to: 540, beat: 1, off: 0.2, len: 1.1, ease: 'inout' },
    { key: 'camY', to: 960, beat: 1, off: 0.2, len: 1.1, ease: 'inout' },
    { key: 'unfold', to: 1, beat: 1, len: 1.2, ease: 'inout' },
    { key: 'pos', to: 1.0, beat: 1, len: 0.5 },
  ],
  // "Then the model went where he couldn't follow." / "He says so himself."
  outrun: [
    { key: 'zoom', to: 1.12, len: 1.2, ease: 'inout' },
    { key: 'camX', to: 500, len: 1.2, ease: 'inout' },
    { key: 'camY', to: 770, len: 1.2, ease: 'inout' },
    { key: 'steep', to: 1, len: 0.6 },
    { key: 'light', to: 1, len: 0.4 },
    { key: 'pos', to: 2.0, len: 1.3, ease: 'inout' },
    { key: 'run', to: 1, off: 1.2, len: 1.9, ease: 'inout' },
    { key: 'quote', to: 1, beat: 1, len: 0.4 },
  ],
  // "Now his job is to understand his own proof."
  draw: [
    { key: 'quote', to: 0, len: 0.3 },
    { key: 'zoom', to: 1.3, len: 1.0, ease: 'inout' },
    { key: 'camX', to: 470, len: 1.0, ease: 'inout' },
    { key: 'camY', to: 650, len: 1.0, ease: 'inout' },
    { key: 'sheet', to: 1, len: 0.5 },
    { key: 'sketch', to: 0.35, off: 0.6, len: 1.8, ease: 'linear' },
  ],
  // "The same afternoon, a mathematician with twelve years of work and no AI published his draft."
  // / "We are still here."
  second: [
    { key: 'zoom', to: 1.2, len: 1.0, ease: 'inout' },
    { key: 'camX', to: 590, len: 1.0, ease: 'inout' },
    { key: 'camY', to: 800, len: 1.0, ease: 'inout' },
    { key: 'second', to: 1, off: 0.3, len: 2.6, ease: 'inout' },
    { key: 'years', to: 1, beat: 1, off: 0.9, len: 0.4 },
    { key: 'here', to: 1, beat: 2, len: 0.4 },
  ],
  // "Within a day there was a public map of the proof, drawn with AI."
  map: [
    { key: 'here', to: 0, len: 0.3 },
    { key: 'years', to: 0, len: 0.3 },
    { key: 'zoom', to: 1.05, len: 1.0, ease: 'inout' },
    { key: 'camX', to: 540, len: 1.0, ease: 'inout' },
    { key: 'camY', to: 790, len: 1.0, ease: 'inout' },
    { key: 'crowd', to: 1, len: 2.0, ease: 'linear' },
    { key: 'map', to: 0.5, off: 1.3, len: 2.2, ease: 'inout' },
    { key: 'mapTag', to: 1, off: 1.5, len: 0.4 },
  ],
  // "Understanding is behind." / "AI is how it catches up."
  catchup: [{ key: 'map', to: MAP_CEILING, beat: 1, len: 1.8, ease: 'inout' }],
  // "My view: mathematics is more alive than it has ever been."
  closer: [
    { key: 'mapTag', to: 0, len: 0.3 },
    { key: 'zoom', to: 1, len: 1.2, ease: 'inout' },
    { key: 'camX', to: 540, len: 1.2, ease: 'inout' },
    { key: 'camY', to: 781, len: 1.2, ease: 'inout' },
    { key: 'forks', to: 1, off: 0.6, len: 2.6, ease: 'inout' },
  ],
};

/** The picture each scene ends on (and the next one starts from). */
export const END: Record<TrailMode, Vals> = (() => {
  const out = {} as Record<TrailMode, Vals>;
  let cur = { ...ZERO };
  for (const m of MODES) {
    for (const tw of SCRIPT[m]) cur = { ...cur, [tw.key]: tw.to };
    out[m] = cur;
  }
  return out;
})();

/** What a scene starts from: the end of the one before it. */
export const startOf = (mode: TrailMode): Vals => {
  const i = MODES.indexOf(mode);
  return i <= 0 ? { ...ZERO } : { ...END[MODES[i - 1]] };
};

/**
 * Seconds at both ends of a scene with nothing moving: two consecutive scenes overlap for 0.6 s
 * while they blend, and both must show the same picture there. The first scene needs no lead-in.
 */
export const HOLD = 0.5;
export const HAND_OVER = 0.6;

const eased = (p: number, ease: Tween['ease']): number => {
  const x = clamp01(p);
  if (ease === 'linear') return x;
  if (ease === 'inout') return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
  return 1 - (1 - x) ** 3;
};

/** What the trail draws at scene second `t`. */
export function frameState(p: TrailProps, time: number, beats: number[], dur: number) {
  const mode: TrailMode = MODES.includes(p.mode) ? p.mode : 'open';
  const t = sceneTime(time, dur);
  const clock = Number.isFinite(p.clock) ? (p.clock as number) : 0;
  const T = clock + (Number.isFinite(time) ? Math.max(0, time) : 0);
  const lead = mode === 'open' ? 0 : HOLD;
  const endBy = Number.isFinite(dur) ? Math.max(lead, dur - HAND_OVER) : Infinity;
  const v = startOf(mode);
  for (const tw of SCRIPT[mode]) {
    const want = Math.max(lead, beatAt(beats, tw.beat ?? 0) + (tw.off ?? 0));
    // Fitted like steps.fit, and shortened when the scene is too short to play it whole.
    const start = Math.min(want, Math.max(lead, endBy - tw.len));
    const len = Math.max(0.01, Math.min(tw.len, endBy - start));
    const prog = t >= dur ? 1 : clamp01((t - start) / len);
    // From wherever the value is: a key may move twice in a scene (the word comes, then goes).
    v[tw.key] = v[tw.key] + (tw.to - v[tw.key]) * eased(prog, tw.ease);
  }
  const walker = onRoute(v.pos);
  const up = pointAt(STEEP, v.run);
  const guide = onRoute(v.pos);
  // The light keeps the walker company until the steep stretch, then leaves him behind.
  const light = v.run > 0 ? { x: up.x, y: up.y } : { x: guide.x + 26 * guide.dir, y: guide.y - 62 };
  const arriving = pointAt(SIDE, v.second);
  return {
    mode,
    T,
    ...v,
    walker,
    /** 0..1 stride phase from the distance walked, so the walker never slides. */
    stride: (v.pos * 9) % 1,
    lightAt: light,
    secondAt: arriving,
  };
}

export type TrailState = ReturnType<typeof frameState>;
