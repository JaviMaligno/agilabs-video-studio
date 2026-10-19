// Pure state of the ReportDesk scenes: an inspection desk seen from above. Reports arrive as
// sealed envelopes through three mail slots ("doors"); the main agent's tools are a letter opener,
// a magnifier and a VERIFIED rubber stamp. A stamp on an unbroken seal = answered without checking.
// Tray ratios are illustrative of the article's percentages (about 1 in 4, about half, nearly
// all, none), not a replay of the episodes; the exact figure is the chip on each slot.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode = 'slam' | 'context' | 'setup' | 'doors' | 'split' | 'fact' | 'nofact' | 'check' | 'long' | 'flood' | 'quote' | 'inverted' | 'open';

export type DeskProps = {
  mode: Mode;
  /** Read by Video.tsx: draw the first narration line as the hook title (no caption for it). */
  titleLine?: boolean;
  /** Read by Video.tsx: cross-blend from the previous scene instead of dipping through black. */
  blend?: boolean;
  /**
   * Optional scene seconds for named moments, taken from the TTS word timestamps (e.g. the doors
   * mode drops one copy per slot as it is named: `cue: { drop0, drop1, drop2, chips }`).
   */
  cue?: Record<string, number>;
  /** doors: leave the model chips off (they come later, in the split scene). */
  noChips?: boolean;
};

// ---------------------------------------------------------------- geometry (stage px, 960x1090)

export const W = 960;
export const H = 1090;
/** Mail slot panels across the top: subagent, teammate's file, user's message. */
export const SLOT_X = [145, 480, 815] as const;
export const PANEL = { top: 108, h: 190, w: 290 } as const;
export const SLIT_Y = PANEL.top + 22;
export const CHIP_Y = 306;
export const TRAY = { top: 396, cols: 4, rows: 5, cw: 68, rh: 42, mw: 58, mh: 36 } as const;
export const TRAY_N = TRAY.cols * TRAY.rows;
/** Envelope artwork size at scale 1. */
export const ENV = { w: 380, h: 240 } as const;
/** The featured envelope's home on the desk. */
export const DESK = { x: 560, y: 800 } as const;
export const NOTEBOOK = { x: 14, y: 660, w: 180, notes: 9 } as const;
/** Where the stamp, letter opener and magnifier rest. */
export const REST = { stamp: { x: 860, y: 1070 }, opener: { x: 360, y: 1052 }, mag: { x: 600, y: 1046 } } as const;
export const STAMP_LIFT = 190;

export const SLOT_LABELS = [
  ['its own', 'subagent'],
  ["a teammate's", 'file'],
  ["the user's", 'message'],
] as const;
export const MODELS = ['Opus 5.5', 'Gemini 3 Flash', 'GPT-5.6'] as const;
export const REPORT = ['No automation found.', 'Open a ticket with DevOps.'] as const;
export const FACT_NOTE = ['New services:', 'self-service', 'pipeline'] as const;
export const QUOTES = ['“it couldn’t see my notes”'] as const;
export const LOOK_TAG = ['check = any look before answering', '(a file, a command)'] as const;
export const KEY_SENTENCE = 'Once the work has been delegated, it counts as done.';
export const KEY_EMPHASIS = ['delegated', 'done'];
export const TITLE = "My agent tends to take its subagent's report as fact.";
export const TITLE_KEY = ['as', 'fact.'];

/** Chip texts, exactly as the article writes them (factcheck.md). */
export const CHIPS = {
  opus: ['25 %', '0 %', '0 %'],
  opusLong: '47 %',
  gemini: ['88 %', '3 %', '0 %'],
  geminiAdopt: '95 %',
  gptFact: { subagent: '10 %', message: '36 %' },
  factCounter: '4 / 791',
  factBySlot: ['0', '4', '0'],
} as const;

/** Illustrative trays: how many of the 20 envelopes per tray are stamped sealed. */
export const SEALED = {
  opus: [5, 0, 0],
  opusLong: 9,
  gemini: [18, 1, 0],
  gptFact: [2, 1, 7],
} as const;

// ---------------------------------------------------------------- helpers

export type Kind = 'sealed' | 'opened' | 'rejected' | 'adopted';
export type TrayItem = { kind: Kind; appear: number };
export type Tray = { items: TrayItem[]; opacity: number; sealed: number; opened: number };

export type Env = {
  x: number;
  y: number;
  scale: number;
  rot: number;
  opacity: number;
  /** Flap open, 0..1 (a slit envelope has been checked). */
  slit: number;
  /** VERIFIED ink on the envelope, 0..1. */
  print: number;
  /** Wax seal split apart, 0..1. */
  crack: number;
  /** Magnifier sweep across the page, 0..1 (only while `sweeping`). */
  sweep: number;
  sweeping: number;
  /** Faded and pushed aside: the report is not believed. */
  dim: number;
  label: boolean;
};

export type Tool = { x: number; y: number; opacity: number; glow: number };
export type Stamp = Tool & { down: number };

export type Chip = { text: string; tag: string; appear: number };

const DROP = 0.24;

const pulse = (t: number, start: number, len: number) => {
  const p = progress(t, start, len);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

const scramble = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Evenly spread indices of the k sealed envelopes among n. */
export const sealedSet = (n: number, k: number): Set<number> => {
  const s = new Set<number>();
  // Evenly spaced along a fixed pseudo-random order, so they do not line up in one column.
  const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => scramble(x) - scramble(y));
  for (let j = 0; j < k; j++) s.add(order[Math.min(n - 1, Math.floor(((j + 0.5) * n) / k))]);
  return s;
};

const emptyTray = (): Tray => ({ items: [], opacity: 1, sealed: 0, opened: 0 });

const countTray = (items: TrayItem[], opacity = 1): Tray => ({
  items,
  opacity: clamp01(opacity),
  sealed: items.filter((i) => i.appear >= 1 && (i.kind === 'sealed' || i.kind === 'adopted')).length,
  opened: items.filter((i) => i.appear >= 1 && (i.kind === 'opened' || i.kind === 'rejected')).length,
});

/** A tray that fills one envelope after another over [start, start + len], fitted into the scene. */
const fillTray = (t: number, dur: number, n: number, kindOf: (k: number) => Kind, start: number, len: number) => {
  const s = fit(start, len, dur);
  const items = Array.from({ length: n }, (_, k) => ({
    kind: kindOf(k),
    appear: progress(t, s + (n > 1 ? (k * Math.max(0, len - DROP)) / (n - 1) : 0), DROP),
  }));
  return { tray: countTray(items), done: s + len };
};

const fullTray = (n: number, kindOf: (k: number) => Kind, opacity = 1): Tray =>
  countTray(
    Array.from({ length: n }, (_, k) => ({ kind: kindOf(k), appear: 1 })),
    opacity,
  );

const mix = (n: number, sealed: number, other: Kind = 'opened') => {
  const set = sealedSet(n, sealed);
  return (k: number): Kind => (set.has(k) ? 'sealed' : other);
};

const env = (o: Partial<Env> = {}): Env => ({
  x: DESK.x,
  y: DESK.y,
  scale: 0.85,
  rot: 0,
  opacity: 1,
  slit: 0,
  print: 0,
  crack: 0,
  sweep: 0,
  sweeping: 0,
  dim: 0,
  label: true,
  ...o,
});

const restStamp = (opacity = 1): Stamp => ({ ...REST.stamp, opacity, glow: 0, down: 0 });
const restOpener = (opacity = 1, glow = 0): Tool => ({ ...REST.opener, opacity, glow });
const restMag = (opacity = 1, glow = 0): Tool => ({ ...REST.mag, opacity, glow });

/**
 * The stamp coming down on (x, y) at time T: from rest to a hover over the target, a fast drop,
 * a short hold, then back to rest. `down` is 1 while it touches the paper.
 */
export const slam = (t: number, T: number, x: number, y: number): Stamp => {
  const toHover = easeOutCubic(progress(t, T - 0.38, 0.3));
  const drop = progress(t, T - 0.08, 0.08);
  const back = easeOutCubic(progress(t, T + 0.16, 0.36));
  const hoverY = y - STAMP_LIFT;
  let px = lerp(REST.stamp.x, x, toHover);
  let py = lerp(REST.stamp.y, hoverY, toHover);
  py = lerp(py, y, drop);
  if (back > 0) {
    px = lerp(x, REST.stamp.x, back);
    py = lerp(y, REST.stamp.y, back);
  }
  return { x: px, y: py, opacity: 1, glow: 0, down: t >= T && t < T + 0.16 ? 1 : 0 };
};

/** Ink print of a slam at T. */
const ink = (t: number, T: number) => progress(t, T, 0.22);

/** Desk shake (px) after impacts at the given times. */
const shakeOf = (t: number, impacts: number[], amp = 12) => {
  let s = 0;
  for (const T of impacts) {
    const d = t - T;
    if (d >= 0 && d < 0.35) s += amp * Math.exp(-d * 9) * Math.sin(d * 70);
  }
  return s;
};

/** Slit, magnifier sweep and stamp of a checked envelope, starting at T. Returns envelope + tools. */
const checkCycle = (t: number, T: number, e: Env) => {
  const slit = easeOutCubic(progress(t, T + 0.1, 0.35));
  const sweep = progress(t, T + 0.5, 0.7);
  const sweeping = sweep > 0 && sweep < 1 ? 1 : 0;
  const S = T + 1.35;
  const w = ENV.w * e.scale;
  const opener: Tool =
    progress(t, T, 0.5) > 0 && progress(t, T + 0.5, 0.3) < 1
      ? { x: e.x - w * 0.45 + w * 0.9 * slit, y: e.y - ENV.h * e.scale * 0.5 - 6, opacity: 1, glow: 1 }
      : restOpener(1, 0.4);
  const mag: Tool = sweeping ? { x: e.x - w * 0.32 + w * 0.64 * sweep, y: e.y + 6, opacity: 1, glow: 1 } : restMag(1, 0.4);
  return { env: { ...e, slit, crack: slit > 0 ? 1 : 0, sweep, sweeping, print: ink(t, S) }, opener, mag, stamp: t > S - 0.5 ? slam(t, S, e.x, e.y) : restStamp(), impact: S };
};

/** End of the last narration line (the scene lasts until it + TAIL, or its `min`). */
const lineEnd = (beats: number[], dur: number) => {
  const last = beats.length ? beatAt(beats, beats.length - 1) : 0;
  return Number.isFinite(dur) ? Math.max(last + 0.5, Math.min(dur - 0.8, last + 4)) : last + 2;
};

// ---------------------------------------------------------------- frame state

export function frameState(p: DeskProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const end = lineEnd(beats, dur);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + Math.max(0.6, (end - b0) / 2);
  const b2 = beats.length > 2 ? beatAt(beats, 2) : b1 + Math.max(0.6, (end - b1) / 2);
  const cue = (k: string, fallback: number) => {
    const v = p.cue?.[k];
    return v !== undefined && Number.isFinite(v) ? v : fallback;
  };
  const E = (start: number, len: number) => easeOutCubic(progress(t, fit(start, len, dur), len));
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);

  // ------------------------------------------------ cold open
  if (p.mode === 'slam') {
    const T = fit(cue('slam', 0.5), 0.6, dur);
    const words = TITLE.split(' ');
    const span = Math.max(0.6, end - b0);
    // Where the envelope lands and is stamped (stage px).
    const target = { x: 480, y: 840 };
    const out = 0.32 + 0.68 * easeOutCubic(progress(t, 0, Math.max(0.05, T - 0.05)));
    // Before the slam the stamp hovers to the right, already raised (drawn from the first frame).
    const hover = { x: 800, y: target.y - 40 };
    const st: Stamp =
      t < T - 0.2
        ? { x: hover.x, y: hover.y, opacity: 1, glow: 0, down: 0 }
        : t < T
          ? { x: lerp(hover.x, target.x, progress(t, T - 0.2, 0.2)), y: lerp(hover.y, target.y, easeOutCubic(progress(t, T - 0.2, 0.2)) ** 2), opacity: 1, glow: 0, down: 0 }
          : slam(t, T, target.x, target.y);
    return {
      view: 'hook' as const,
      title: words.map((text, i) => ({ text, key: TITLE_KEY.includes(text), lit: progress(t, b0 + (i / words.length) * span * 0.85, 0.2) })),
      titleKey: E(T, 0.3),
      env: { ...env({ x: target.x, y: lerp(470, target.y, out), scale: 1.4, label: false }), print: ink(t, T) },
      stamp: st,
      stampScale: 1.3,
      flash: pulse(t, T, 0.25),
      shake: shakeOf(t, [T], 16),
    };
  }

  // ------------------------------------------------ the desk
  const chips = { appear: 1, active: [0, 0, 0] as number[], tag: '', tagAppear: 0, dim: 0 };
  const slots = [0, 1, 2].map(() => ({ lit: 0, chip: { text: '', tag: '', appear: 0 } as Chip }));
  let trays: Tray[] = [emptyTray(), emptyTray(), emptyTray()];
  let trayDim = 0;
  const notebook = { appear: 1, dim: 0, fOut: 0, fGlow: 0.35, fGone: 0 };
  const subagent = { appear: 0, link: 0, broken: 0 };
  let envs: Env[] = [];
  let stamp: Stamp = restStamp();
  let opener: Tool = restOpener();
  let mag: Tool = restMag();
  const counter = { appear: 0, text: CHIPS.factCounter, dim: 0 };
  const quotes = [0];
  let stack58k = 0;
  const conseq = { appear: 0, ticket: 0, toggle: 0, on: 0, crackA: 0, crackB: 0, chip: 0 };
  const setup = { report: 0, note: 0, sub: 0, clash: 0 };
  const split = { left: 0, fGlow: 0, neq: 0, right: 0, noTag: 0 };
  const look = { tag: 0 };
  let quote = { dim: 0, words: [] as { text: string; emphasis: boolean; opacity: number }[], emphasis: 0, back: 0 };
  let shake = 0;
  let toolsOn = 1;
  let slip = 0;
  let deskIn = 1;
  let chipsShown = 1;

  switch (p.mode) {
    case 'context': {
      deskIn = E(0, 0.45);
      chipsShown = 0;
      toolsOn = 0;
      subagent.appear = E(b0, 0.4);
      subagent.link = P(b0 + 0.35, 0.5);
      subagent.broken = E(b0 + 0.95, 0.35);
      notebook.fGlow = 0.35;
      break;
    }
    case 'setup': {
      // The planted report against the fact the main agent may know; the desk stays faint behind.
      deskIn = 0;
      chipsShown = 0;
      toolsOn = 0;
      notebook.appear = 0;
      setup.report = E(b0 + 0.1, 0.5);
      const noteAt = cue('note', b1 + 1.4);
      setup.sub = E(cue('sub', b1 + 0.3), 0.45);
      setup.note = E(noteAt, 0.5);
      setup.clash = E(noteAt + 0.65, 0.4);
      break;
    }
    case 'split': {
      // Two conditions side by side: the fact known (left) or absent (right). Then, silent, the
      // three models and the size of the run.
      deskIn = 0;
      toolsOn = 0;
      notebook.appear = 0;
      split.left = E(b0, 0.45);
      split.fGlow = E(cue('knew', b1 + 1.1), 0.45);
      split.neq = E(cue('wrong', b1 + 2.3), 0.4);
      const third = beats.length > 2 ? b2 : b1 + 2;
      split.right = E(third, 0.45);
      split.noTag = E(cue('nofact', third + 0.9), 0.35);
      const chipsAt = cue('chips', end + 0.15);
      chipsShown = E(chipsAt, 0.4);
      chips.tag = '6 scenarios · ~2,800 episodes';
      chips.tagAppear = E(chipsAt + 0.25, 0.4);
      break;
    }
    case 'nofact': {
      // Line 1: the fact is taken away. Line 2: the only way left is to look.
      chips.active = [1, 0, 0];
      chips.tag = 'no fact';
      chips.tagAppear = E(b0 + 0.3, 0.3);
      notebook.fGone = E(b0 + 0.25, 0.5);
      notebook.dim = E(b0 + 0.25, 0.5);
      envs = [env({ opacity: E(0, 0.4) })];
      const toolsIn = E(b1 + 0.1, 0.5);
      opener = { x: lerp(REST.opener.x, 420, toolsIn), y: lerp(REST.opener.y, 1030, toolsIn), opacity: 1, glow: toolsIn };
      mag = { x: lerp(REST.mag.x, 600, toolsIn), y: lerp(REST.mag.y, 1030, toolsIn), opacity: 1, glow: toolsIn };
      look.tag = E(cue('look', b1 + 0.6), 0.4);
      break;
    }
    case 'doors': {
      chipsShown = 0;
      toolsOn = 0;
      notebook.appear = 0;
      slip = E(b0 + 0.1, 0.4);
      const split = E(b0 + 0.9, 0.45);
      const fan = [160, 480, 800];
      const drop = [cue('drop0', b1 + 0.05), cue('drop1', b1 + 0.75), cue('drop2', b1 + 1.45)];
      envs = [0, 1, 2].map((i) => {
        const go = E(drop[i], 0.45);
        const x0 = lerp(480, fan[i], split);
        const y0 = lerp(870, 900, split);
        const s0 = lerp(1.0, 0.58, split);
        const x = lerp(x0, SLOT_X[i], go);
        const y = lerp(y0, SLIT_Y, go);
        const fade = progress(t, fit(drop[i], 0.45, dur) + 0.3, 0.15);
        return env({ x, y, scale: lerp(s0, 0.3, go), opacity: clamp01(1 - fade), label: true });
      });
      // Before the split the three copies sit on top of each other: draw only the middle one.
      envs = split <= 0 ? [envs[1]] : envs;
      for (let i = 0; i < 3; i++) slots[i].lit = E(fit(drop[i], 0.45, dur) + 0.4, 0.3);
      if (!p.noChips) {
        const chipsAt = cue('chips', end + 0.15);
        chipsShown = E(chipsAt, 0.4);
        chips.tag = '6 scenarios · ~2,800 episodes';
        chips.tagAppear = E(chipsAt + 0.25, 0.4);
      }
      break;
    }
    case 'fact': {
      // Lines: the fact (b0), the count (b1), the quote (last beat).
      const qb = beats.length > 2 ? b2 : b1;
      chips.active = [E(0, 0.3), 0, 0];
      chips.tag = 'fact in plain sight';
      chips.tagAppear = E(0.6, 0.3);
      notebook.fOut = E(b0 + 0.1, 0.6);
      notebook.fGlow = 0.35 + 0.65 * notebook.fOut;
      const rain = b0 + 0.6;
      const len = Math.max(1, (qb - b0) * 0.6);
      const fileSet = sealedSet(TRAY_N, 1);
      const t0 = fillTray(t, dur, TRAY_N, () => 'rejected', rain, len);
      const t1 = fillTray(t, dur, TRAY_N, (k) => (fileSet.has(k) ? 'adopted' : 'rejected'), rain + 0.15, len);
      const t2 = fillTray(t, dur, TRAY_N, () => 'rejected', rain + 0.3, len);
      trays = [t0.tray, t1.tray, t2.tray];
      const chipAt = [t0.done, t1.done, t2.done];
      for (let i = 0; i < 3; i++) slots[i].chip = { text: CHIPS.factBySlot[i], tag: '', appear: E(chipAt[i] + 0.05, 0.3) };
      const push = E(b0 + 0.9, 0.5);
      envs = [env({ x: lerp(DESK.x + 80, 790, push), y: lerp(DESK.y, 900, push), scale: 0.62, rot: 12 * push, dim: push })];
      counter.appear = E(cue('counter', beats.length > 2 ? b1 + Math.max(0.6, (qb - b1) * 0.55) : b0 + Math.max(0.8, (qb - b0) * 0.6)), 0.4);
      quotes[0] = E(qb + 0.05, 0.4);
      counter.dim = quotes[0];
      break;
    }
    case 'check': {
      // Line 1 (b0): file and message reports are all opened and checked.
      // Line 2 (b1): about 1 in 4 of the subagent's reports is stamped sealed.
      chips.active = [1, 0, 0];
      chips.tag = 'no fact · % answered without a single check';
      chips.tagAppear = E(0.3, 0.3);
      notebook.fGone = 1;
      notebook.dim = 1;
      opener = { x: 420, y: 1030, opacity: 1, glow: 1 };
      mag = { x: 600, y: 1030, opacity: 1, glow: 1 };
      const f1 = fillTray(t, dur, TRAY_N, () => 'opened', b0 + 0.3, 2.0);
      const f2 = fillTray(t, dur, TRAY_N, () => 'opened', b0 + 0.45, 2.0);
      const f0 = fillTray(t, dur, TRAY_N, mix(TRAY_N, SEALED.opus[0]), b1 + 0.3, 1.7);
      trays = [f0.tray, f1.tray, f2.tray];
      slots[1].chip = { text: CHIPS.opus[1], tag: '', appear: E(f1.done + 0.05, 0.3) };
      slots[2].chip = { text: CHIPS.opus[2], tag: '', appear: E(f2.done + 0.05, 0.3) };
      slots[0].chip = { text: CHIPS.opus[0], tag: '', appear: E(cue('chip0', f0.done + 0.05), 0.3) };
      slots[1].lit = pulse(t, b0, 2.2);
      slots[2].lit = pulse(t, b0 + 0.15, 2.2);
      slots[0].lit = E(b1, 0.3);
      if (t < b1) {
        const c = checkCycle(t, fit(b0 + 0.3, 1.9, dur), env({ x: DESK.x, y: DESK.y, scale: lerp(0.5, 0.85, E(b0, 0.35)), opacity: E(b0, 0.3) }));
        envs = [c.env];
        opener = c.opener.glow === 1 ? c.opener : opener;
        mag = c.mag.glow === 1 ? c.mag : mag;
        stamp = c.stamp;
        shake = shakeOf(t, [c.impact], 6);
      } else {
        const enter = E(b1, 0.4);
        const T = fit(b1 + 0.55, 0.6, dur);
        envs = [env({ x: lerp(SLOT_X[0], DESK.x, enter), y: lerp(SLIT_Y + 60, DESK.y, enter), scale: lerp(0.3, 0.85, enter), print: ink(t, T) })];
        stamp = slam(t, T, DESK.x, DESK.y);
        shake = shakeOf(t, [T], 12);
      }
      break;
    }
    case 'long': {
      chips.active = [1, 0, 0];
      chips.tag = 'no fact · % answered without a single check';
      chips.tagAppear = 1;
      notebook.fGone = 1;
      notebook.dim = 1;
      stack58k = E(0.05, 0.55);
      const f0 = fillTray(t, dur, TRAY_N, mix(TRAY_N, SEALED.opusLong), 0.25, 1.0);
      trays = [f0.tray, fullTray(TRAY_N, () => 'opened'), fullTray(TRAY_N, () => 'opened')];
      slots[0].lit = 1;
      slots[0].chip = { text: CHIPS.opusLong, tag: 'long context', appear: E(cue('chip0', f0.done + 0.05), 0.3) };
      slots[1].chip = { text: CHIPS.opus[1], tag: '', appear: 1 };
      slots[2].chip = { text: CHIPS.opus[2], tag: '', appear: 1 };
      const T = fit(0.75, 0.6, dur);
      envs = [env({ x: 640, y: DESK.y, scale: 0.75, print: ink(t, T) })];
      stamp = slam(t, T, 640, DESK.y);
      opener = restOpener(1, 0.4);
      mag = restMag(1, 0.4);
      shake = shakeOf(t, [T], 10);
      break;
    }
    case 'flood': {
      chips.active = [0, E(0, 0.3), 0];
      chips.tag = 'no fact · % answered without a single check';
      chips.tagAppear = 1;
      notebook.fGone = 1;
      notebook.dim = 1;
      const f0 = fillTray(t, dur, TRAY_N, mix(TRAY_N, SEALED.gemini[0]), b0 + 0.1, 1.0);
      const f1 = fillTray(t, dur, TRAY_N, mix(TRAY_N, SEALED.gemini[1]), b0 + 0.35, 1.3);
      const f2 = fillTray(t, dur, TRAY_N, mix(TRAY_N, SEALED.gemini[2]), b0 + 0.5, 1.3);
      trays = [f0.tray, f1.tray, f2.tray];
      slots[0].lit = 1;
      slots[0].chip = { text: CHIPS.gemini[0], tag: '', appear: E(cue('chip0', f0.done + 0.05), 0.3) };
      slots[1].chip = { text: CHIPS.gemini[1], tag: '', appear: E(cue('chip1', f1.done + 0.05), 0.3) };
      slots[2].chip = { text: CHIPS.gemini[2], tag: '', appear: E(cue('chip2', f2.done + 0.1), 0.3) };
      // The stamp hammers sealed envelopes until the second line.
      const hammerEnd = b1 - 0.3;
      const impacts: number[] = [];
      for (let T = b0 + 0.3; T < hammerEnd - 0.2; T += 0.42) impacts.push(T);
      const cur = impacts.filter((T) => T <= t).at(-1);
      const fadeEnv = E(b1 - 0.2, 0.35);
      const last = impacts.at(-1);
      if (impacts.length && t >= impacts[0] - 0.4 && last !== undefined && t < last + 0.16) {
        // Hammering: first approach as a normal slam, then short bounces over the envelope.
        if (cur === undefined) stamp = slam(t, impacts[0], DESK.x, DESK.y);
        else {
          const ph = t - cur;
          const lift = ph < 0.1 ? 0 : Math.sin(Math.PI * clamp01((ph - 0.1) / 0.32));
          stamp = { x: DESK.x, y: DESK.y - STAMP_LIFT * 0.55 * lift, opacity: 1, glow: 0, down: ph < 0.1 ? 1 : 0 };
        }
      } else if (last !== undefined && t >= last) stamp = slam(t, last, DESK.x, DESK.y);
      else stamp = restStamp();
      envs = impacts.length && t >= b0 ? [env({ print: cur !== undefined ? ink(t, cur) : 0, opacity: 1 - fadeEnv, label: false })] : [];
      // Line 2: the sealed reports turn into actions.
      conseq.appear = E(b1, 0.35);
      toolsOn = 1 - conseq.appear;
      const A = cue('ticket', b1 + 0.2);
      const B = cue('toggle', b1 + 1.1);
      conseq.ticket = E(A, 0.6);
      conseq.crackA = E(A + 0.6, 0.25);
      conseq.toggle = E(B - 0.2, 0.3);
      conseq.on = E(B, 0.15);
      conseq.crackB = E(B + 0.2, 0.25);
      conseq.chip = E(cue('adopt', b1 + Math.max(1, (end - b1) * 0.75)), 0.35);
      shake = shakeOf(t, impacts.filter((T) => T < hammerEnd), 7) + shakeOf(t, [fit(A + 0.6, 0.3, dur), fit(B, 0.3, dur)], 16);
      break;
    }
    case 'quote': {
      chips.active = [0, 1, 0];
      chips.tag = 'no fact · % answered without a single check';
      chips.tagAppear = 1;
      notebook.fGone = 1;
      notebook.dim = 1;
      trays = [fullTray(TRAY_N, mix(TRAY_N, SEALED.gemini[0])), fullTray(TRAY_N, mix(TRAY_N, SEALED.gemini[1])), fullTray(TRAY_N, () => 'opened')];
      for (let i = 0; i < 3; i++) slots[i].chip = { text: CHIPS.gemini[i], tag: '', appear: 1 };
      const words = KEY_SENTENCE.split(' ');
      const span = Math.max(0.8, end - b0);
      quote = {
        dim: E(0, 0.4),
        back: E(0.1, 0.5),
        words: words.map((text, i) => ({
          text,
          emphasis: KEY_EMPHASIS.includes(text.replace(/[^a-z]/gi, '').toLowerCase()),
          opacity: progress(t, fit(b0 + (i / words.length) * span * 0.8, 0.3, dur), 0.3),
        })),
        emphasis: E(b0 + span * 0.85, 0.4),
      };
      break;
    }
    case 'inverted': {
      chips.active = [0, 0, E(0, 0.3)];
      chips.tag = 'fact in context · % answered without a single check';
      chips.tagAppear = E(0.6, 0.3);
      notebook.fGlow = 0.6;
      const f0 = fillTray(t, dur, TRAY_N, mix(TRAY_N, SEALED.gptFact[0]), b0 + 0.1, 1.4);
      const f1 = fillTray(t, dur, TRAY_N, mix(TRAY_N, SEALED.gptFact[1]), b0 + 0.2, 1.4);
      const f2 = fillTray(t, dur, TRAY_N, mix(TRAY_N, SEALED.gptFact[2]), b0 + 0.3, 1.4);
      trays = [f0.tray, f1.tray, f2.tray];
      slots[0].chip = { text: CHIPS.gptFact.subagent, tag: '', appear: E(cue('chip0', f0.done + 0.05), 0.3) };
      slots[2].chip = { text: CHIPS.gptFact.message, tag: '', appear: E(cue('chip2', f2.done + 0.05), 0.3) };
      slots[2].lit = E(cue('chip2', f2.done), 0.4);
      // Left: the subagent's report is slit and checked. Right: the message's report is stamped sealed.
      const c = checkCycle(t, fit(cue('check', b0 + 0.2), 1.9, dur), env({ x: 360, y: DESK.y, scale: 0.6 }));
      const T = fit(cue('slam', b0 + 2.2), 0.6, dur);
      const enter = E(T - 0.9, 0.4);
      envs = [c.env, env({ x: lerp(SLOT_X[2], 760, enter), y: lerp(SLIT_Y + 60, DESK.y, enter), scale: lerp(0.3, 0.6, enter), print: ink(t, T), opacity: enter })];
      opener = c.opener;
      mag = c.mag;
      // The check's stamp finishes going home before the slam on the message's report begins.
      stamp = t < Math.max(T - 0.45, c.impact + 0.5) ? c.stamp : slam(t, T, 760, DESK.y);
      shake = shakeOf(t, [c.impact], 5) + shakeOf(t, [T], 12);
      break;
    }
    case 'open': {
      chips.active = [0, 0, 0];
      chipsShown = 1 - E(0, 0.4) * 0.6;
      trayDim = E(0, 0.4);
      trays = [fullTray(TRAY_N, mix(TRAY_N, SEALED.gptFact[0])), fullTray(TRAY_N, mix(TRAY_N, SEALED.gptFact[1])), fullTray(TRAY_N, mix(TRAY_N, SEALED.gptFact[2]))];
      slots[0].lit = E(0, 0.4);
      const span = Math.max(1, end - b0);
      const enter = E(b0, 0.5);
      const e = env({ x: lerp(SLOT_X[0], 480, enter), y: lerp(SLIT_Y + 60, 850, enter), scale: lerp(0.3, 1.05, enter) });
      const hover = E(b0 + 0.35, 0.45);
      const stopAt = b0 + span * 0.45;
      const away = E(stopAt + 0.2, 0.5);
      const tremble = hover >= 1 && away <= 0 ? Math.sin(t * 40) * 3 : 0;
      stamp = {
        x: lerp(lerp(REST.stamp.x, e.x + 40, hover), REST.stamp.x, away),
        y: lerp(lerp(REST.stamp.y, e.y - 140 + tremble, hover), REST.stamp.y, away),
        opacity: 1,
        glow: 0,
        down: 0,
      };
      const slide = E(stopAt + 0.4, 0.5);
      const crack = E(stopAt + 0.9, 0.3);
      const slit = E(stopAt + 1.15, 0.45);
      const w = ENV.w * e.scale;
      opener = { x: lerp(REST.opener.x, e.x - w * 0.42 + w * 0.84 * slit, slide), y: lerp(REST.opener.y, e.y - ENV.h * e.scale * 0.5 - 6, slide), opacity: 1, glow: slide };
      mag = restMag(1, 0);
      envs = [{ ...e, crack, slit }];
      shake = shakeOf(t, [fit(stopAt + 0.9, 0.3, dur)], 6);
      break;
    }
  }

  return {
    view: 'desk' as const,
    deskIn,
    toolsOn: clamp01(toolsOn),
    slip,
    chipsShown: clamp01(chipsShown),
    chips,
    slots,
    trays,
    trayDim,
    notebook,
    subagent,
    envs,
    stamp,
    opener,
    mag,
    counter,
    quotes,
    stack58k,
    conseq,
    setup,
    split,
    look,
    quote,
    shake,
  };
}

export type DeskState = ReturnType<typeof frameState>;
export type HookState = Extract<DeskState, { view: 'hook' }>;
export type BoardState = Extract<DeskState, { view: 'desk' }>;
