// Pure state of the PullBack scenes: one continuous dolly-out over a nested world. A line of code
// (level 1) is a row of a diff next to a terminal (level 2); that view is one pane of a laptop, then
// one session in an app (level 3); the app is one tile on a conveyor under a dashboard (level 4).
// Each level is drawn in its own local box and placed, scaled, inside the next one, so the camera
// is a single (centre, zoom) over world coordinates. Stylised and chosen for impact: the labels
// come from the article (see factcheck.md); code, sessions and tickets are generic.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode =
  | 'teaser'
  | 'ladder'
  | 'code'
  | 'diff'
  | 'saturate'
  | 'result'
  | 'nested'
  | 'conveyor'
  | 'dashboard'
  | 'contract'
  | 'quote';

export const MODES: Mode[] = ['teaser', 'ladder', 'code', 'diff', 'saturate', 'result', 'nested', 'conveyor', 'dashboard', 'contract', 'quote'];

export type PullBackProps = {
  mode: Mode;
  /**
   * Scene seconds of the spoken words each mode keys off (filled from the TTS word timings in
   * timeline.ts; proportional fallbacks before TTS). Per mode:
   * teaser: code, diff, result · code: I, model, completed · diff: agent, whole · saturate:
   * cloud, several, saturate, end of laptop · result: app, every, sidebar, result · nested:
   * surface, disappeared, editor, centre · conveyor: ticket, agent, nobody · dashboard: metrics,
   * evals, feedback, tests, preview · contract: window, may, receive, return, call.
   */
  cues?: number[];
  /** Conveyor clock at this scene's start, chained across scenes so the belt never jumps. */
  clock0?: number;
  /** Quote: the conveyor clock at which lane A stopped to ring the bell (contract scene). */
  frozenA?: number;
  /** Quote: the sentence and its emphasised words. */
  quote?: string;
  emphasis?: string[];
  /** Read by Video.tsx: the scene draws its first line itself, as the hook title. */
  titleLine?: boolean;
  /** Read by Video.tsx: cross-blend from the previous scene instead of dipping through black. */
  blend?: boolean;
};

// ---------------------------------------------------------------- geometry

/** Stage (px). */
export const SW = 960;
export const SH = 1090;
export type Rect = { x: number; y: number; w: number; h: number };
/** Where the world is shown: the left of the stage, the altitude ladder on the right. */
export const VP_FULL: Rect = { x: 0, y: 0, w: 704, h: 1090 };
/** Teaser: the whole width, below the hook title. */
export const VP_TEASER: Rect = { x: 0, y: 330, w: 960, h: 760 };

/** Every level's local box. */
export const BOX = { w: 744, h: 1090 } as const;

/** A level placed inside its parent: top-left corner and scale. */
export type Place = { x: number; y: number; s: number };

/** Level 3 (the app) inside level 4 (the world): the agent tile of the middle conveyor lane. */
export const P3: Place = { x: 372 - (744 * 0.2) / 2, y: 575, s: 0.2 };
/** Level 2 inside level 3, final: the collapsed diff panel of the app. */
export const P2_FINAL: Place = { x: 582, y: 168, s: 0.2 };

// Level 2 (local): the diff card (an editor at level 1) and the terminal under it.
export const CODE = {
  card: { x: 20, y: 40, w: 704, h: 360 },
  rowH: 56,
  /** Top of the row that holds the line (fixed: the camera at level 1 frames it). */
  lineY: 238,
  textX: 112,
  indent: 34,
  font: 26,
  typed: 'return items',
  ghost: '.map(toRow);',
} as const;
export const TERM = {
  card: { x: 20, y: 430, w: 704, h: 400 },
  lines: ['$ npm test', '✓ 12 passed', '$ git add -A', '$ git commit -m "map rows"', '$ npm install', '✓ done'],
  font: 25,
  lineH: 46,
} as const;
export const TOOLS = { y: 950, r: 46, xs: [112, 292, 452, 632], labels: ['tests', 'git', 'packages', 'CLI'] } as const;

// Level 1 framing, in level 2 coordinates: the line, close up.
export const L1_RECT: Rect = { x: 12, y: 200, w: 530, h: 120 };

// Level 3 (local): laptop (saturate only), cloud, then the app.
export const LAPTOP = { screen: { x: 147, y: 340, w: 450, h: 330 }, bezel: 18 } as const;
export const CLOUD = { x: 100, y: 34, w: 544, h: 270 } as const;
export const APP = {
  win: { x: 0, y: 30, w: 744, h: 690 },
  bar: 50,
  side: { x: 0, w: 240 },
  cards: [140, 245, 350].map((y) => ({ x: 16, y, w: 208, h: 90 })),
  cardLabels: ['chat', 'cloud · fix-auth', 'local · refactor'],
  preview: { x: 260, y: 100, w: 300, h: 360 },
  pr: { x: 260, y: 480, w: 300, h: 120 },
  diff: { x: 574, y: 100, w: 158, h: 500 },
  phone: { x: 520, y: 640, w: 200, h: 420 },
  editor: { x: 14, y: 590, w: 214, h: 100 },
} as const;
const LAPTOP_RECT: Rect = { x: 60, y: 24, w: 624, h: 700 };
const APP_WIN_RECT: Rect = { x: 0, y: 30, w: 744, h: 690 };

// Level 4 (world): dashboard on top, three conveyor lanes, the start button.
export const DASH = {
  panel: { x: 0, y: 0, w: 744, h: 336 },
  gaugeX: [128, 372, 616],
  gaugeY: 150,
  gaugeR: 84,
  labels: ['evals', 'feedback', 'tests'],
  queue: { x: 18, y: 236, w: 708, h: 84 },
} as const;
export const LANES = [
  { y: 470, tile: { x: 372 - 0.16 * 372, y: 470 - 0.16 * 545, s: 0.16 } },
  { y: 684, tile: P3 },
  { y: 898, tile: { x: 372 - 0.16 * 372, y: 898 - 0.16 * 545, s: 0.16 } },
] as const;
/** Belt line of a lane (just under its tile's app window) and where items ride on it. */
export const belt = (li: number) => {
  const tile = LANES[li].tile;
  const y = tile.y + 720 * tile.s + 12;
  return { y, itemY: y - 34 };
};
export const LEGEND_Y = 356;
export const START = { x: 18, y: 1016, w: 170, h: 54 } as const;
export const SLAB = { harness: { x: 8, y: 818, w: 728, h: 196 }, model: { x: 8, y: 1026, w: 728, h: 56 } } as const;
export const CONTRACT = ['permissions', 'inputs', 'outputs', 'escalation to a human'] as const;

// Ladder and stamp (stage px, outside the camera).
export const LADDER = { x: 942, rungs: [600, 450, 300, 150], labels: ['the code', 'the diff', 'the result', 'the metrics'] } as const;

export const TITLE = [
  { text: ['First', 'the', 'code.'], key: 2 },
  { text: ['Then', 'the', 'diff.'], key: 2 },
  { text: ['Then', 'the', 'result.'], key: 2 },
] as const;

// ---------------------------------------------------------------- pure helpers

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeInOut = (p: number) => {
  const x = clamp01(p);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};

export const placeRect = (r: Rect, p: Place): Rect => ({ x: p.x + r.x * p.s, y: p.y + r.y * p.s, w: r.w * p.s, h: r.h * p.s });
const rectOf3 = (r: Rect): Rect => placeRect(r, P3);
const rectOf2 = (r: Rect, p2: Place): Rect => rectOf3(placeRect(r, p2));

export type Cam = { cx: number; cy: number; z: number };
/** Zoom gained by the slow push of each macro scene (ladder, then code). */
const PUSH = 1.03;

/** The camera that fits `r` (world) into the viewport. */
export const frame = (r: Rect, vp: Rect): Cam => ({ cx: r.x + r.w / 2, cy: r.y + r.h / 2, z: Math.min(vp.w / r.w, vp.h / r.h) });

/**
 * Dolly between two framings: zoom is interpolated in log space and the centre so that one world
 * point (the fixed point of the move) stays put on screen, so a pull-back reads as one push of
 * the camera, not as a slide plus a zoom.
 */
export const dolly = (a: Cam, b: Cam, p: number): Cam => {
  const e = clamp01(p);
  if (e <= 0) return a;
  if (e >= 1) return b;
  const z = Math.exp(lerp(Math.log(a.z), Math.log(b.z), e));
  if (Math.abs(b.z - a.z) < 1e-6 * a.z) return { cx: lerp(a.cx, b.cx, e), cy: lerp(a.cy, b.cy, e), z };
  const fx = (b.cx * b.z - a.cx * a.z) / (b.z - a.z);
  const fy = (b.cy * b.z - a.cy * a.z) / (b.z - a.z);
  return { cx: fx - ((fx - a.cx) * a.z) / z, cy: fy - ((fy - a.cy) * a.z) / z, z };
};

/** Pane slots on the laptop screen for n panes (level 3 coordinates). */
export const paneLayout = (n: number): Place[] => {
  const S = LAPTOP.screen;
  const cols = Math.min(n, 4);
  const rows = Math.ceil(n / cols);
  const s = Math.min(S.w / cols / BOX.w, S.h / rows / BOX.h) * 0.92;
  const pw = BOX.w * s;
  const ph = BOX.h * s;
  const gx = (S.w - cols * pw) / (cols + 1);
  const gy = (S.h - rows * ph) / (rows + 1);
  return Array.from({ length: n }, (_, i) => ({ x: S.x + gx + (i % cols) * (pw + gx), y: S.y + gy + Math.floor(i / cols) * (ph + gy), s }));
};
export const P2_LAPTOP: Place = paneLayout(1)[0];
export const cloudSlot = (i: number): Place => ({ x: 150 + (i % 4) * 118, y: 62 + Math.floor(i / 4) * 112, s: 0.085 });

const lerpPlace = (a: Place, b: Place, p: number): Place => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), s: lerp(a.s, b.s, p) });

export type Pane = Place & { opacity: number };
export type Item = { lane: number; kind: 'bubble' | 'ticket' | 'pr'; x: number; y: number; opacity: number; morph: number };

/** The belt: three items per lane, each one bubble → ticket → into the tile → PR out. */
const ITEM_LIFE = 4.2;
const LANE_OFFSET = [0.4, 1.9, 3.1];
export const items = (clocks: number[], show: number): Item[] => {
  const out: Item[] = [];
  LANES.forEach((_lane, li) => {
    const clock = clocks[li] ?? 0;
    for (let k = 0; k < 3; k++) {
      const raw = (clock + LANE_OFFSET[li]) / ITEM_LIFE + k / 3;
      const u = raw - Math.floor(raw);
      const y = belt(li).itemY;
      let it: Item | null = null;
      if (u < 0.28) it = { lane: li, kind: 'bubble', x: lerp(40, 150, u / 0.28), y, opacity: clamp01(u / 0.05), morph: 0 };
      else if (u < 0.38) it = { lane: li, kind: 'ticket', x: lerp(150, 196, (u - 0.28) / 0.1), y, opacity: 1, morph: clamp01((u - 0.28) / 0.1) };
      else if (u < 0.55) {
        const q = (u - 0.38) / 0.17;
        it = { lane: li, kind: 'ticket', x: lerp(196, 330, q), y, opacity: clamp01((1 - q) / 0.35), morph: 1 };
      } else if (u >= 0.68) {
        const q = (u - 0.68) / 0.32;
        it = { lane: li, kind: 'pr', x: lerp(470, 700, q), y, opacity: Math.min(clamp01(q / 0.12), clamp01((1 - q) / 0.15)), morph: 1 };
      }
      if (it) out.push({ ...it, opacity: it.opacity * clamp01(show) });
    }
  });
  return out;
};
/** How busy each lane's agent tile is (an item inside it). */
const working = (clock: number, li: number): number => {
  let w = 0;
  for (let k = 0; k < 3; k++) {
    const raw = (clock + LANE_OFFSET[li]) / ITEM_LIFE + k / 3;
    const u = raw - Math.floor(raw);
    if (u >= 0.5 && u < 0.7) w = Math.max(w, Math.sin(Math.PI * ((u - 0.5) / 0.2)));
  }
  return clamp01(w);
};

// ---------------------------------------------------------------- frame state

export function frameState(p: PullBackProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  // A clock that keeps running to the scene end (sceneTime jumps to "finished" from dur on).
  const clockT = Number.isFinite(time) ? Math.max(0, Math.min(time, Number.isFinite(dur) ? dur : time)) : 0;
  const mode: Mode = MODES.includes(p.mode) ? p.mode : 'code';
  const mi = MODES.indexOf(mode);
  const past = (m: Mode) => mi > MODES.indexOf(m);
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : NaN;
  const end = Number.isFinite(dur) ? Math.max(b0 + 0.6, dur - 0.8) : b0 + 3;
  const S0 = Math.max(0.6, (Number.isFinite(b1) ? b1 - 0.35 : end) - b0);
  const S1 = Number.isFinite(b1) ? Math.max(0.6, end - b1) : 0.6;
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));
  const cue = (i: number, fallback: number): number => {
    const v = p.cues?.[i];
    return v !== undefined && Number.isFinite(v) ? v : fallback;
  };
  const pulse = (start: number, len: number) => {
    const q = P(start, len);
    return q <= 0 || q >= 1 ? 0 : Math.sin(Math.PI * q);
  };

  const vp = mode === 'teaser' ? VP_TEASER : VP_FULL;

  // ------------------------------------------------ level 2 placement and panes (level 3 coords)
  const panes: Pane[] = Array.from({ length: 8 }, () => ({ ...P2_LAPTOP, opacity: 0 }));
  panes[0].opacity = 1;
  let split = 0;
  let lift = 0;
  let dock = 0;
  if (mode === 'teaser' || past('result')) Object.assign(panes[0], P2_FINAL);
  if (mode === 'saturate' || mode === 'result') {
    const L = S0;
    const several = cue(1, b0 + 0.5 * L);
    split = mode === 'result' ? 3 : E(several, 0.32) + E(several + 0.5, 0.32) + E(several + 1.0, 0.32);
    lift = mode === 'result' ? 1 : easeInOut(P(cue(3, b0 + L) - 0.15, 0.75));
    dock = mode === 'result' ? easeInOut(P(cue(1, b0 + 0.25 * L) - 0.15, 1.05)) : 0;
    const lo = Math.floor(Math.min(split, 2.999));
    const f = split - lo;
    const nLo = 2 ** lo;
    const nHi = 2 ** Math.min(3, lo + 1);
    const A = paneLayout(nLo);
    const B = paneLayout(nHi);
    for (let i = 0; i < 8; i++) {
      let pl: Place;
      let op: number;
      if (i < nLo) {
        pl = lerpPlace(A[i], B[i], f);
        op = 1;
      } else if (i < nHi) {
        pl = { ...B[i], s: B[i].s * (0.7 + 0.3 * f) };
        op = f;
      } else {
        pl = B[0];
        op = 0;
      }
      if (split >= 3) {
        pl = paneLayout(8)[i];
        op = 1;
      }
      // Lift off to the cloud, along a small arc.
      const cs = cloudSlot(i);
      const lp = clamp01(lift * 1.15 - (i % 4) * 0.05);
      let q = lerpPlace(pl, cs, lp);
      q = { ...q, y: q.y - Math.sin(Math.PI * lp) * 40 };
      if (dock > 0) {
        const target: Place =
          i === 0 ? P2_FINAL : { x: APP.cards[i % 3].x + 150, y: APP.cards[i % 3].y + 10, s: 0.02 };
        q = lerpPlace(cs, target, clamp01(dock * 1.1 - (i === 0 ? 0 : 0.1)));
        op = i === 0 ? 1 : 1 - clamp01(dock * 1.25);
      }
      panes[i] = { ...q, opacity: clamp01(op) };
    }
  }
  const p2: Place = { x: panes[0].x, y: panes[0].y, s: panes[0].s };

  // ------------------------------------------------ framings
  // The hook shows the whole editor card; later scenes go closer, on the line.
  const F1 = frame(rectOf2(mode === 'teaser' ? { x: 0, y: 40, w: 744, h: 380 } : L1_RECT, p2), vp);
  const F2 = frame(rectOf2({ x: 0, y: 0, w: BOX.w, h: BOX.h }, p2), vp);
  const FLAP = frame(rectOf3(LAPTOP_RECT), vp);
  const F3 = frame(rectOf3({ x: 0, y: 0, w: BOX.w, h: BOX.h }), vp);
  const F3W = frame(rectOf3(APP_WIN_RECT), vp);
  const F4 = frame({ x: 0, y: 0, w: BOX.w, h: BOX.h }, vp);

  const pulls = [0, 1, 2].map((i) => cue(i, [0.6, 1.9, 2.9][i]));

  let cam: Cam;
  let alt: number; // altitude 1..4, drives what is revealed in the teaser
  switch (mode) {
    case 'teaser': {
      const a = easeInOut(P(pulls[1] - 0.12, 0.5));
      const b = easeInOut(P(pulls[2] - 0.12, 0.55));
      // A slow push on the first word, so the macro shot is never static.
      const push = 1 + 0.06 * E(0, pulls[1]);
      const f1 = { ...F1, z: F1.z * push };
      cam = b > 0 ? dolly(F2, F3W, b) : dolly(f1, F2, a);
      alt = 1 + a + b;
      break;
    }
    case 'ladder':
    case 'code': {
      // A slow push, continuous across the two scenes (and into the diff pull-back).
      const f = clamp01(clockT / Math.max(1, Number.isFinite(dur) ? dur : 4));
      const z0 = mode === 'ladder' ? 1 : PUSH;
      cam = { ...F1, z: F1.z * (z0 + (PUSH - 1) * f) };
      alt = 1;
      break;
    }
    case 'diff': {
      const a = easeInOut(P(b0 + 0.05, 1.1));
      cam = dolly({ ...F1, z: F1.z * (2 * PUSH - 1) }, F2, a);
      alt = 1 + a;
      break;
    }
    case 'saturate': {
      const a = easeInOut(P(b0 + 0.05, 1.3));
      cam = dolly(F2, FLAP, a);
      alt = 2 + 0.5 * a;
      break;
    }
    case 'result': {
      const a = easeInOut(P(b0, 1.25));
      cam = dolly(FLAP, F3, a);
      alt = 2.5 + 0.5 * a;
      break;
    }
    case 'nested':
      cam = F3;
      alt = 3;
      break;
    case 'conveyor': {
      const a = easeInOut(P(b0, 1.7));
      cam = dolly(F3, F4, a);
      alt = 3 + a;
      break;
    }
    default:
      cam = F4;
      alt = 4;
  }

  // ------------------------------------------------ title (teaser)
  const title = {
    appear: mode === 'teaser' ? 1 : 0,
    lit: pulls.map((v) => (mode === 'teaser' ? E(v - 0.18, 0.25) : 0)),
  };

  // ------------------------------------------------ ladder and stamp
  const ladderAppear = mode === 'teaser' ? 0 : mode === 'ladder' ? E(b0 + 0.1, 0.6) : 1;
  const rung = (m: Mode, start: number) => (past(m) ? 1 : mode === m ? E(start, 0.45) : 0);
  const lit = [
    rung('code', b0 + 0.1),
    rung('diff', b0 + 0.8),
    rung('result', cue(3, b0 + 0.8 * S0) - 0.1),
    rung('dashboard', cue(0, b0 + 0.25 * S0) - 0.1),
  ];
  // Which rung the camera is at: 0 = the code ... 3 = the metrics (fractional while moving).
  const marker = lit[1] + lit[2] + lit[3];
  const ladder = {
    appear: ladderAppear,
    lit,
    marker,
    dim: mode === 'quote' ? E(b0, 0.5) : 0,
    // Scene 2: the ladder's rungs blink up once, bottom to top ("each jump raised").
    sweep: mode === 'ladder' ? P(b0 + 0.5, 1.4) : 0,
  };
  const stampText = mode === 'code' ? '2021' : mode === 'diff' || mode === 'saturate' ? '2025' : mode === 'result' || mode === 'nested' ? '2026' : '';
  const stamp = {
    text: stampText,
    opacity: !stampText ? 0 : mode === 'code' ? E(b0, 0.5) : mode === 'diff' ? E(b0 + 0.6, 0.5) : mode === 'result' ? E(b0 + 0.35, 0.5) : 1,
  };

  // ------------------------------------------------ level 1 and 2
  const typedFull = CODE.typed.length;
  let typed = typedFull;
  let ghost = 1;
  let accept = 1;
  let tabKey = 0;
  let editor = 1;
  if (mode === 'teaser') editor = 1 - clamp01((alt - 1.15) / 0.6);
  if (mode === 'ladder') {
    typed = 0;
    ghost = 0;
    accept = 0;
  }
  if (mode === 'code') {
    const L = S0;
    const i0 = cue(0, b0 + 0.3 * L);
    const model = cue(1, b0 + 0.6 * L);
    const done = cue(2, b0 + 0.75 * L);
    typed = Math.round(typedFull * P(i0 - 0.3, Math.max(0.4, model - i0)));
    ghost = E(model, 0.3);
    accept = E(done + 0.35, 0.2);
    tabKey = pulse(done + 0.2, 0.7);
  }
  if (mode === 'diff') editor = 1 - easeInOut(P(b0 + 0.25, 0.8));
  if (past('diff')) editor = 0;
  // The cursor blinks while typing is still to come or under way.
  const cursor = mode === 'ladder' || (mode === 'code' && ghost < 0.05) ? (Math.floor(clockT * 2.4) % 2 === 0 ? 1 : 0.15) : 0;

  let chrome = 0;
  if (mode === 'teaser') chrome = clamp01((alt - 1.35) / 0.5);
  else if (mode === 'diff') chrome = E(b0 + 0.45, 0.6);
  else if (past('diff')) chrome = 1;
  const dl = S0;
  const agent = cue(0, b0 + 0.4 * dl);
  const whole = cue(1, b0 + 0.7 * dl);
  const sweep = mode === 'diff' ? P(whole + 0.6, 0.8) : 0;
  const check = mode === 'diff' ? E(whole + 1.3, 0.3) : past('diff') || mode === 'teaser' ? 1 : 0;
  const termLines = mode === 'diff' ? TERM.lines.length * P(agent - 0.1, 1.5) : mode === 'teaser' ? TERM.lines.length * chrome : past('diff') ? TERM.lines.length : 0;
  const wires = mode === 'diff' ? E(whole - 0.1, 0.7) : mode === 'teaser' ? chrome : past('diff') ? 1 : 0;

  // ------------------------------------------------ laptop and cloud
  const laptop = mode === 'saturate' ? E(b0 + 0.15, 0.6) : mode === 'result' ? 1 - E(b0 + 0.05, 0.5) : 0;
  const heat = mode === 'saturate' ? E(cue(1, b0 + 0.5 * S0) + 0.3, Math.max(0.5, cue(3, b0 + S0) - cue(1, b0 + 0.5 * S0) - 0.3)) * (1 - 0.6 * lift) : 0;
  const cloud =
    mode === 'saturate' ? Math.max(0.5 * E(cue(0, b0 + 0.1 * S0) - 0.1, 0.5), E(cue(3, b0 + S0) - 0.3, 0.4)) : mode === 'result' ? 1 - E(cue(1, b0 + 0.25 * S0), 0.8) : 0;

  // ------------------------------------------------ level 3: the app
  const R = (start: number, len: number) => (mode === 'result' ? E(start, len) : past('result') ? 1 : 0);
  const teaserApp = mode === 'teaser' ? clamp01((alt - 2.25) / 0.5) : 0;
  // The window comes in once the camera has mostly left the laptop.
  const app = Math.max(R(Math.max(cue(0, b0 + 0.1 * S0) - 0.25, b0 + 0.75), 0.5), teaserApp);
  const cards = [0, 1, 2].map((i) => Math.max(R(cue(1, b0 + 0.25 * S0) + 0.25 + 0.18 * i, 0.45), teaserApp));
  const resultAt = cue(3, b0 + 0.8 * S0);
  const preview = Math.max(R(resultAt - 0.25, 0.5), teaserApp);
  const pr = Math.max(R(resultAt + 0.15, 0.4), teaserApp);
  const diffPanel = Math.max(R(cue(1, b0 + 0.25 * S0) + 0.2, 0.6), teaserApp);
  const phone = R(cue(2, b0 + 0.5 * S0) + 0.1, 0.6);

  const nb1 = Number.isFinite(b1) ? b1 : b0 + S0 + 0.35;
  const surf = cue(0, b0 + 0.3);
  const gone = cue(1, b0 + 0.8);
  const lightsOn = [surf - 0.1, surf + 0.3, gone + 0.15].map((v) => (mode === 'nested' ? E(v, 0.35) : 0));
  const dimBack = mode === 'nested' ? E(cue(3, nb1 + 1.8), 0.6) : 0;
  const nested = lightsOn.map((v) => v * (1 - dimBack));
  const editorCard = mode === 'nested' ? easeInOut(P(cue(2, nb1 + 0.25) - 0.05, 1.0)) : past('nested') ? 1 : 0;

  // ------------------------------------------------ level 4: conveyor, dashboard, contract
  // The belt fades in once the camera is most of the way out, so it never looms large.
  const conveyor = mode === 'conveyor' ? E(b0 + 1.05, 0.7) : past('conveyor') ? 1 : 0;
  const start = mode === 'conveyor' ? E(cue(2, b0 + 0.72 * S0), 0.5) : past('conveyor') ? 1 : 0;
  const base = { conveyor: 0, dashboard: 7, contract: 14, quote: 22 } as Record<string, number>;
  const clock = (Number.isFinite(p.clock0) ? (p.clock0 as number) : (base[mode] ?? 0)) + clockT;
  const lc = Number.isFinite(b1) ? b1 : b0 + S0 + 0.35;
  const lightAt = [0, 1, 2, 3].map((i) => cue(i + 1, lc + S1 * [0.2, 0.4, 0.58, 0.85][i]));
  const bellAt = lightAt[3] + 0.15;
  const frozenA =
    mode === 'contract' && clockT >= bellAt
      ? clock - clockT + bellAt
      : mode === 'quote'
        ? Number.isFinite(p.frozenA) ? (p.frozenA as number) : clock
        : clock;
  const clocks = [frozenA, clock, clock];

  const D = (start: number, len: number) => (mode === 'dashboard' ? E(start, len) : past('dashboard') ? 1 : 0);
  const dash = D(cue(0, b0 + 0.25 * S0) - 0.6, 0.5);
  const gauges = [0, 1, 2].map((i) => D(cue(i + 1, b0 + (0.5 + 0.16 * i) * S0) - 0.1, 0.4));
  const queue = D(cue(3, b0 + 0.85 * S0) + 0.5, 0.4);
  const tags = [0, 1, 2].map((i) => (mode === 'dashboard' ? E(cue(4, nb1 + 0.4) - 0.1 + 0.22 * i, 0.35) : past('dashboard') ? 1 : 0));
  const needles = [0, 1, 2].map((i) => 0.62 + 0.12 * Math.sin(clock * (0.9 + 0.3 * i) + i * 1.7) + 0.08 * i);

  const C0 = (start: number, len: number) => (mode === 'contract' ? E(start, len) : past('contract') ? 1 : 0);
  const win = cue(0, b0 + 0.75 * S0);
  const windowsFlash = mode === 'contract' ? pulse(win - 0.2, 0.9) : 0;
  const windowsDim = C0(win + 0.35, 0.5);
  const slab = C0(lc - 0.1, 0.6);
  const laneC = 1 - slab;
  const contract = lightAt.map((v) => C0(v - 0.1, 0.3));
  const bell = { appear: C0(bellAt, 0.25), fly: mode === 'contract' ? easeInOut(P(bellAt + 0.35, 0.7)) : past('contract') ? 1 : 0 };
  const queueItems = 2 + (bell.fly >= 1 ? 1 : 0);

  const quote = mode === 'quote' ? { start: b0, show: 1 } : { start: 0, show: 0 };
  const worldDim = mode === 'quote' ? E(b0 - 0.1, 0.45) : 0;

  const busy = [0, 1, 2].map((li) => working(clocks[li], li) * clamp01(conveyor));

  return {
    mode,
    vp,
    cam,
    alt,
    title,
    ladder,
    stamp,
    editor,
    typed,
    ghost,
    accept,
    tabKey,
    cursor,
    chrome,
    sweep,
    check,
    termLines,
    wires,
    panes,
    split: clamp01(split / 3),
    lift: clamp01(lift),
    dock: clamp01(dock),
    laptop: clamp01(laptop),
    heat: clamp01(heat),
    cloud: clamp01(cloud),
    app,
    cards,
    preview,
    pr,
    diffPanel,
    phone,
    nested,
    editorCard,
    conveyor,
    start,
    items: items(clocks, conveyor),
    busy,
    belt: clock,
    dash,
    gauges,
    needles,
    queue,
    queueItems,
    tags,
    windowsFlash,
    windowsDim,
    slab,
    laneC,
    contract,
    bell,
    quote,
    worldDim,
  };
}

export type PullBackState = ReturnType<typeof frameState>;
