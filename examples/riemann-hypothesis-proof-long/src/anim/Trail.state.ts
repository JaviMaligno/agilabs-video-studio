// The trail: one world, sixteen scenes. A walker chooses a route, picks up a sheet everybody walked
// past, a small light runs ahead up the steep stretch, and other people arrive: one with a thick
// manuscript, then many, drawing a map of the stretch nobody has walked.
// A METAPHOR for who did what, never footage of anything measured (see factcheck.md).
//
// Every scene (`mode`) starts exactly where the previous one ended and holds that picture while
// the two scenes blend, so the whole story reads as one continuous shot.
// Pure numbers (no Remotion or React), so `node --test` can check it.
import { beatAt, clamp01, sceneTime } from './steps.ts';

export const MODES = [
  'overview', 'open', 'past', 'pick', 'unfold', 'outrun', 'draw', 'second', 'twoquote', 'revised',
  'mountain', 'crowd', 'map', 'catchup', 'forks', 'closer',
] as const;
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

// ── Landscape world: the same story laid on the landscape painting (public/bg/bg-mountain-l.jpg),
// in its own pixels (1536x1024). The mountain stands on the right, its summit at SUMMIT_L; the
// walker's long trail runs across the hills on the left. The landscape camera (lx, ly, lz) frames a
// 16:9 window of it: at lz = 1 the painting's width fills the frame (1.25 frame px per painting px).
export const PAINT = { w: 1536, h: 1024 } as const;
export const FORK_L: Pt = [560, 650];
export const STOP_L: Pt = [740, 575];
export const SUMMIT_L: Pt = [1268, 82];
export const PAST_L = smooth([[50, 652], [170, 638], [262, 660], [380, 644], [470, 660], FORK_L]);
export const FIRST_L = smooth([FORK_L, [632, 628], [690, 598], STOP_L]);
export const STEEP_L = smooth([STOP_L, [860, 528], [905, 468], [990, 432], [985, 370], [1075, 318], [1090, 250], [1175, 200], [1185, 140], SUMMIT_L]);
/** The second figure's own way in, along the far ridge: it never touches the walker's route. */
export const SIDE_L = smooth([[-40, 606], [80, 604], [200, 616], [300, 620]]);

export const onRouteL = (pos: number): { x: number; y: number; dir: number } => {
  const p = Number.isFinite(pos) ? Math.min(3, Math.max(0, pos)) : 0;
  if (p <= 1) return pointAt(PAST_L, p);
  if (p <= 2) return pointAt(FIRST_L, p - 1);
  return pointAt(STEEP_L, p - 2);
};

/** The eight chapter stops of the overview, as positions on the whole route (chapter 8 at the summit). */
export const STOPS = [0.4, 0.75, 1.25, 2.12, 2.36, 2.58, 2.8, 3];

/** The core-of-the-proof figure as the article writes it. */
export const CUT = 26.6;

// ── The story as numbers ───────────────────────────────────────────────────────────────────────
export type Vals = {
  camX: number; camY: number; zoom: number;
  /** The landscape camera: centre in painting pixels and zoom (1 = the painting's width). */
  lx: number; ly: number; lz: number;
  /** Walker on the route (see onRoute), and whether he is on screen at all (the overview brings him in). */
  pos: number; walkerIn: number;
  /** Overview: the whole route drawn ahead, and the eight chapter stops lighting up along it. */
  route: number; stops: number;
  /** Year ticks and the dead-end forks behind the walker; "a career" makes them glow. */
  marks: number; career: number;
  /** The pile of sheets, the glow of the overlooked one, its label, and it being picked up. */
  pile: number; glow: number; pileTag: number; pick: number;
  /** The 1969 trick card, the word on screen, the sheet unfolding into the first stretch, and its glow. */
  trick: number; taste: number; unfold: number; chosen: number;
  /** The steep stretch hinted, the light there, and how far up it has run. */
  steep: number; light: number; run: number;
  /** "out of my element", in his words; the model's "internal" lock. */
  quote: number; lock: number;
  /** The walker's sheet and how much of the steep stretch he has drawn on it. */
  sheet: number; sketch: number;
  /** The second figure arriving, its label, its message, the notes on its manuscript and the stamp. */
  second: number; years: number; here: number; notes: number; stamp: number;
  /** The idea's blackboard on the summit, the mountain lighting up under it, and the line count. */
  board: number; rebuilt: number; linesTag: number;
  /** The crowd, the map they draw over the steep stretch, and its label. */
  crowd: number; map: number; mapTag: number;
  /** The leaderboard card: shown, its count (0..1 of CUT), dimmed for "housekeeping". */
  cutOn: number; cut: number; dim: number;
  /** New forks opening and more people on them. */
  forks: number;
  /** The front pages; the last beat, everything alive. */
  news: number; alive: number;
};

const ZERO: Vals = {
  camX: 265, camY: 1225, zoom: 2.4, lx: 340, ly: 600, lz: 2.4, pos: 0.2, walkerIn: 1, route: 0, stops: 0,
  marks: 0, career: 0, pile: 0, glow: 0, pileTag: 0, pick: 0, trick: 0, taste: 0, unfold: 0, chosen: 0,
  steep: 0, light: 0, run: 0, quote: 0, lock: 0, sheet: 0, sketch: 0, second: 0, years: 0, here: 0, notes: 0, stamp: 0,
  board: 0, rebuilt: 0, linesTag: 0, crowd: 0, map: 0, mapTag: 0, cutOn: 0, cut: 0, dim: 0, forks: 0, news: 0, alive: 0,
};

/** One change inside a scene: `key` goes to `to`, starting `off` seconds after beat `beat`. */
type Tween = { key: keyof Vals; to: number; beat?: number; off?: number; len: number; ease?: 'out' | 'inout' | 'linear' };
type When = { beat?: number; off?: number; len: number; ease?: Tween['ease'] };

/** A camera move in both formats: vertical [camX, camY, zoom], landscape [lx, ly, lz]. */
const cam = (v: [number, number, number] | null, l: [number, number, number] | null, w: When): Tween[] => [
  ...(v ? ([['camX', v[0]], ['camY', v[1]], ['zoom', v[2]]] as const).map(([key, to]) => ({ key, to, ease: 'inout' as const, ...w })) : []),
  ...(l ? ([['lx', l[0]], ['ly', l[1]], ['lz', l[2]]] as const).map(([key, to]) => ({ key, to, ease: 'inout' as const, ...w })) : []),
];

/** Landscape shots. WHOLE: the full painting, summit near the top and the foot just above the captions. */
const WHOLE: [number, number, number] = [768, 446, 1];

export const SCRIPT: Record<TrailMode, Tween[]> = {
  // "In this video: why anyone took it seriously, what the humans did," / "and the idea at its heart,
  // which fits in one sentence." / "Because I think "math is dead" points the wrong way."
  overview: [
    { key: 'route', to: 1, len: 1.2 },
    { key: 'stops', to: 0.5, off: 0.5, len: 3.8, ease: 'linear' },
    { key: 'stops', to: 1, beat: 1, len: 2.8, ease: 'linear' },
    { key: 'walkerIn', to: 1, beat: 2, len: 0.6 },
    // A slow push the whole scene long: nothing is ever still.
    ...cam(null, [790, 440, 1.07], { len: 30, ease: 'linear' }),
  ],
  // "So who did what?"
  open: [
    { key: 'pos', to: 0.38, len: 2.2, ease: 'linear' },
    ...cam([300, 1170, 2.4], [400, 596, 2.4], { len: 2.2, ease: 'linear' }),
  ],
  // "Alpöge had planned his whole career around this problem."
  past: [
    ...cam([430, 1075, 1.45], [548, 560, 1.4], { len: 1.4 }),
    { key: 'marks', to: 1, off: 0.5, len: 1.6 },
    { key: 'pos', to: 0.74, len: 3.0, ease: 'inout' },
  ],
  // "His clue was a paper almost nobody discussed," / "in a pile of machine-written papers a rival lab,
  // OpenAI, had released in October."
  pick: [
    ...cam([715, 1050, 2.2], [600, 606, 2.4], { len: 1.2 }),
    { key: 'pile', to: 1, len: 0.5 },
    { key: 'pos', to: 0.97, len: 2.4, ease: 'inout' },
    { key: 'glow', to: 1, off: 0.9, len: 0.6 },
    { key: 'pileTag', to: 1, beat: 1, len: 0.4 },
    { key: 'pick', to: 1, beat: 1, off: 2.6, len: 0.9, ease: 'inout' },
  ],
  // "He recognised in it the skeleton of a 1969 trick by Sergei Stepanov, missing one ingredient."
  // / "Picking that paper out of the pile is taste, and nobody automated it."
  unfold: [
    { key: 'pileTag', to: 0, len: 0.3 },
    { key: 'trick', to: 1, off: 0.3, len: 0.4 },
    ...cam([540, 960, 1.6], [640, 560, 1.6], { off: 3.0, len: 1.2 }),
    { key: 'unfold', to: 1, off: 3.0, len: 1.2, ease: 'inout' },
    { key: 'pos', to: 1.0, off: 3.0, len: 0.5 },
    { key: 'trick', to: 0, beat: 1, off: -0.2, len: 0.3 },
    { key: 'taste', to: 1, beat: 1, len: 0.4 },
    { key: 'chosen', to: 1, beat: 1, off: 0.2, len: 0.6 },
  ],
  // "He set the route. Then, in his words, "Claude began to leave me in awe."" / "The decisive stretch
  // is in an area where he says he's "out of my element."" / "The model is an internal one; you can't run it."
  outrun: [
    { key: 'taste', to: 0, len: 0.3 },
    { key: 'chosen', to: 0, len: 0.6 },
    ...cam([500, 770, 1.12], [768, 392, 1], { len: 1.2 }),
    { key: 'steep', to: 1, len: 0.6 },
    { key: 'light', to: 1, len: 0.4 },
    { key: 'pos', to: 2.0, len: 1.3, ease: 'inout' },
    { key: 'run', to: 1, off: 1.2, len: 1.9, ease: 'inout' },
    { key: 'quote', to: 1, beat: 1, len: 0.4 },
    { key: 'lock', to: 1, beat: 2, len: 0.4 },
  ],
  // "Now his job is to understand his own proof, and write it properly."
  draw: [
    // His words stay up long enough to be read.
    { key: 'quote', to: 0, off: 0.9, len: 0.3 },
    { key: 'lock', to: 0, off: 0.9, len: 0.3 },
    ...cam([470, 650, 1.3], [700, 520, 2], { len: 1.0 }),
    { key: 'sheet', to: 1, len: 0.5 },
    { key: 'sketch', to: 0.35, off: 0.6, len: 1.8, ease: 'linear' },
  ],
  // "The same afternoon, a second proof appeared."
  second: [
    ...cam([590, 800, 1.2], [560, 560, 1.5], { len: 1.0 }),
    { key: 'second', to: 1, off: 0.3, len: 2.6, ease: 'inout' },
  ],
  // "A draft by Alessandro Masullo. Twelve years of work, all human, no AI." / "His message to
  // discouraged mathematicians:" / ""We are still here. We are very much alive.""
  twoquote: [
    { key: 'years', to: 1, off: 0.3, len: 0.4 },
    ...cam([720, 820, 1.5], [520, 520, 2.2], { beat: 1, len: 1.2 }),
    { key: 'years', to: 0, beat: 2, off: -0.3, len: 0.3 },
    { key: 'here', to: 1, beat: 2, len: 0.5 },
  ],
  // "Within hours, people reported problems in it, found with the help of AI." / "It was already being
  // revised, and nobody vouches for it yet."
  revised: [
    { key: 'here', to: 0, len: 0.3 },
    ...cam([760, 830, 1.8], [500, 560, 2.6], { len: 1.0 }),
    { key: 'notes', to: 1, off: 0.6, len: 3.0, ease: 'linear' },
    { key: 'stamp', to: 1, beat: 1, off: 0.2, len: 0.35 },
  ],
  // "Under that simple idea sits a huge amount of modern number theory, rebuilt from scratch."
  // / "That's where most of the seventeen million lines go."
  mountain: [
    ...cam([540, 781, 1], [768, 410, 1], { off: 0.2, len: 2.6 }),
    { key: 'rebuilt', to: 1, off: 1.0, len: 3.5, ease: 'linear' },
    { key: 'linesTag', to: 1, beat: 1, len: 0.4 },
  ],
  // "So, is mathematics dead?" / "I don't think so, and the first reason is how many people are
  // watching." / "A problem about prime numbers made the front pages."
  crowd: [
    { key: 'linesTag', to: 0, len: 0.3 },
    { key: 'rebuilt', to: 0, len: 1.2 },
    ...cam([540, 790, 1], [668, 470, 1.15], { len: 1.4 }),
    { key: 'crowd', to: 1, beat: 1, len: 2.6, ease: 'linear' },
    { key: 'news', to: 1, beat: 2, len: 0.6 },
  ],
  // "The second is that AI isn't only solving. It's helping us understand." / "Within a day there was
  // a public map of the proof, drawn with AI." / "Volunteers and their models have already cut the core
  // of the proof by about a quarter." / "Mostly housekeeping so far, but the work has started."
  map: [
    { key: 'news', to: 0, len: 0.4 },
    ...cam([540, 790, 1.05], [860, 400, 1.15], { off: 0.2, len: 1.4 }),
    { key: 'map', to: 0.5, beat: 1, off: 0.2, len: 2.2, ease: 'inout' },
    { key: 'mapTag', to: 1, beat: 1, off: 0.4, len: 0.4 },
    { key: 'cutOn', to: 1, beat: 2, len: 0.35 },
    { key: 'cut', to: 1, beat: 2, off: 0.2, len: 1.5 },
    { key: 'dim', to: 1, beat: 3, len: 0.6 },
  ],
  // "Understanding is behind, and AI is how it catches up."
  catchup: [
    { key: 'cutOn', to: 0, len: 0.4 },
    { key: 'map', to: MAP_CEILING, off: 0.4, len: 1.8, ease: 'inout' },
  ],
  // "The third is what it opens." / "Trying a new route used to cost a career." / "Now it costs weeks,
  // so far more routes get tried." / "And the bigger questions are still open." / "The real job was
  // always picking what's worth proving, and explaining why it's true."
  forks: [
    { key: 'mapTag', to: 0, len: 0.3 },
    ...cam([540, 781, 1], WHOLE, { len: 1.2 }),
    // a career: down the long trail behind him, its year marks glowing
    ...cam([430, 1075, 1.45], [512, 572, 1.5], { beat: 1, len: 1.2 }),
    { key: 'career', to: 1, beat: 1, off: 0.6, len: 0.5 },
    // weeks: back out, and the new routes open with people on them
    { key: 'career', to: 0, beat: 2, len: 0.4 },
    ...cam([540, 781, 1], WHOLE, { beat: 2, len: 1.0 }),
    { key: 'forks', to: 0.6, beat: 2, off: 0.3, len: 2.4, ease: 'inout' },
    // still open: the forks reach far
    { key: 'forks', to: 1, beat: 3, len: 2.0, ease: 'inout' },
    // the real job: the author drawing his own proof, his chosen sheet glowing
    ...cam([420, 720, 1.6], [700, 520, 2], { beat: 4, len: 1.0 }),
    { key: 'chosen', to: 1, beat: 4, off: 0.3, len: 0.6 },
    { key: 'sketch', to: 0.8, beat: 4, off: 0.5, len: 3.0, ease: 'linear' },
  ],
  // "So no, math isn't dead." / "I think it's more alive than ever."
  closer: [
    ...cam([540, 790, 1], WHOLE, { len: 1.4 }),
    { key: 'alive', to: 1, beat: 1, len: 0.8 },
  ],
};

/**
 * Which scene each one continues from (null: a fresh start). The overview and the chapter-4 opening
 * stand alone; the mountain comes back to the trail after the blackboard chapters, from where the
 * other proof left it, with the camera on the summit.
 */
export const PREV: Record<TrailMode, TrailMode | null> = {
  overview: null, open: null, past: 'open', pick: 'past', unfold: 'pick', outrun: 'unfold', draw: 'outrun',
  second: 'draw', twoquote: 'second', revised: 'twoquote', mountain: 'revised', crowd: 'mountain',
  map: 'crowd', catchup: 'map', forks: 'catchup', closer: 'forks',
};
const FRESH: Partial<Record<TrailMode, Partial<Vals>>> = {
  overview: { camX: 540, camY: 790, zoom: 1, lx: 768, ly: 446, lz: 1, pos: 0.2, walkerIn: 0 },
  mountain: { camX: 590, camY: 380, zoom: 2.2, lx: 1200, ly: 150, lz: 2.6, stamp: 0, board: 1 },
};

const startFrom = (mode: TrailMode, end: Partial<Record<TrailMode, Vals>>): Vals => {
  const prev = PREV[mode];
  const base = prev && end[prev] ? end[prev]! : ZERO;
  return { ...base, ...(FRESH[mode] ?? {}) };
};

/** The picture each scene ends on (and the next one starts from). */
export const END: Record<TrailMode, Vals> = (() => {
  const out = {} as Record<TrailMode, Vals>;
  for (const m of MODES) {
    let cur = startFrom(m, out);
    for (const tw of SCRIPT[m]) cur = { ...cur, [tw.key]: tw.to };
    out[m] = cur;
  }
  return out;
})();

/** What a scene starts from: the end of the one it continues, or its own fresh picture. */
export const startOf = (mode: TrailMode): Vals => startFrom(mode, END);

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
  // The light keeps the walker company until the steep stretch, then leaves him behind.
  const light = v.run > 0 ? { x: up.x, y: up.y } : { x: walker.x + 26 * walker.dir, y: walker.y - 62 };
  const arriving = pointAt(SIDE, v.second);
  const walkerL = onRouteL(v.pos);
  const upL = pointAt(STEEP_L, v.run);
  const lightL = v.run > 0 ? { x: upL.x, y: upL.y } : { x: walkerL.x + 14 * walkerL.dir, y: walkerL.y - 34 };
  const cutValue = CUT * clamp01(v.cut);
  return {
    mode,
    T,
    ...v,
    walker,
    /** 0..1 stride phase from the distance walked, so the walker never slides. */
    stride: (v.pos * 9) % 1,
    lightAt: light,
    secondAt: arriving,
    walkerL,
    lightAtL: lightL,
    secondAtL: pointAt(SIDE_L, v.second),
    /** How many of the eight chapter stops are lit, fractional while one lights up. */
    stopsLit: clamp01(v.stops) * STOPS.length,
    cutText: `−${cutValue.toFixed(1)}%`,
  };
}

export type TrailState = ReturnType<typeof frameState>;
