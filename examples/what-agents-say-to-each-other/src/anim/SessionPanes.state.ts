// Pure state of the SessionPanes scenes: a split terminal of session panes that talk through a
// pipe on the left. Acts I and III. Swarm ratios are illustrative (about 1 in 11 bubbles asks,
// about 1 in 3 tells the other something about its work); bubble text is quoted from the article
// (Act III anonymised, see factcheck.md). No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode =
  | 'swarm'
  | 'ask'
  | 'tell'
  | 'thread'
  | 'real-open'
  | 'real-withdraw'
  | 'real-correct'
  | 'real-thanks'
  | 'real-overview';

export type PanesProps = {
  mode: Mode;
  /** Read by Video.tsx: draw the first narration line as the hook title (no caption for it). */
  titleLine?: boolean;
  /** Read by Video.tsx: cross-blend from the previous scene instead of dipping through black. */
  blend?: boolean;
};

// ---------------------------------------------------------------- geometry (stage px, 960x1090)

export const W = 960;
export const PIPE_X = 34;
export const HEADER_H = 96;
export const PANE = { x0: 74, x1: 960, top: 108, step: 246, h: 230 } as const;
export const paneTop = (i: number): number => PANE.top + i * PANE.step;
export const paneMid = (i: number): number => paneTop(i) + PANE.h / 2;

/** Thread mode: two panes, top and bottom, and the four chat slots between them. */
export const THREAD = { aTop: 0, bTop: 850, h: 240, slots: [318, 446, 574, 702], slotH: 104 } as const;

// ---------------------------------------------------------------- swarm

export const SWARM_N = 33;
/** Indices that ask ("?"): 3 of 33, about 1 in 11 (8.9 % delegation). */
export const ASK = [4, 17, 27] as const;
/** Indices that tell the other something about its work: 11 of 33, about 1 in 3. */
export const TELL = [0, 3, 7, 10, 13, 15, 20, 22, 25, 29, 31] as const;
/** Which of the TELL bubbles carry a red flag (the rest carry a tick). */
export const TELL_FLAG = [3, 13, 22, 29] as const;

// Deterministic jitter.
const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Frozen position of swarm bubble k: a jittered 6x6 grid over the panes. */
export const swarmHome = (k: number): { x: number; y: number } => {
  const cols = 6;
  const col = k % cols;
  const row = Math.floor(k / cols);
  const cw = (W - 150) / cols;
  const rh = 960 / 6;
  return { x: 120 + col * cw + cw * 0.5 + (hash(k) - 0.5) * cw * 0.45, y: 130 + row * rh + rh * 0.5 + (hash(k + 50) - 0.5) * rh * 0.5 };
};

/** Unit direction a swarm bubble streams along: mostly up or down, between stacked panes. */
const swarmDir = (k: number): { x: number; y: number } => {
  const a = (hash(k + 99) - 0.5) * 0.9;
  const s = k % 2 === 0 ? 1 : -1;
  return { x: Math.sin(a), y: s * Math.cos(a) };
};

const wrap = (v: number, lo: number, hi: number): number => {
  const span = hi - lo;
  return lo + ((((v - lo) % span) + span) % span);
};

// ---------------------------------------------------------------- Act III cards

export type Glyph = 'tick' | 'flag' | 'none';
export type CardDef = {
  id: string;
  from: number;
  to: number;
  main: string;
  sub?: string;
  glyph: Glyph;
  /** Stage y of the card centre once landed. */
  cy: number;
  small?: boolean;
};

// Quoted from the article's Part III, cropped and anonymised (factcheck.md, "Changes from feedback").
export const CARDS: Record<string, CardDef> = {
  withdraw: {
    id: 'withdraw',
    from: 0,
    to: 2,
    main: "I'm withdrawing the defect I sent you earlier. It isn't the gateway's.",
    sub: 'eight chat-app events in a row, all an auth error in ~0.8\u00a0s',
    glyph: 'tick',
    cy: 600,
  },
  headsA: { id: 'headsA', from: 0, to: 1, main: "Heads up: I've changed a variable you may have set on purpose.", glyph: 'none', cy: paneMid(1), small: true },
  headsB: { id: 'headsB', from: 0, to: 3, main: "Heads up: I've changed a variable you may have set on purpose.", glyph: 'none', cy: paneMid(3), small: true },
  correct: {
    id: 'correct',
    from: 1,
    to: 0,
    main: 'your revert leaves the system in the state that works least',
    sub: "the auth error wasn't the audience: certificate for key •••• not found",
    glyph: 'flag',
    cy: paneMid(0) + 4,
  },
  accept: { id: 'accept', from: 0, to: 1, main: "I accept the correction and I think it's a better fix than mine.", glyph: 'tick', cy: paneMid(1) + 6 },
  thanks: {
    id: 'thanks',
    from: 2,
    to: 0,
    main: 'Thanks for withdrawing the defect instead of leaving it there: I had it written down as the gateway\'s and I would have dragged it along.',
    glyph: 'tick',
    cy: paneMid(0) + 10,
  },
};

/** Where the pre-filed defect sits in pane 3's inbox. */
export const DEFECT = { x: 740, y: paneTop(2) + PANE.h - 64, w: 196, h: 48 } as const;

export const TRAVEL = 0.32;
export const POP = 0.24;

// ---------------------------------------------------------------- helpers

const pulse = (t: number, start: number, len: number) => {
  const p = progress(t, start, len);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};
/** End of the last line (the scene lasts until it + 0.8 s, or its `min`). */
const lineEnd = (beats: number[], dur: number) => {
  const last = beats.length ? beatAt(beats, beats.length - 1) : 0;
  return Number.isFinite(dur) ? Math.max(last + 0.5, Math.min(dur - 0.8, last + 4)) : last + 2;
};

export const TITLE = 'My coding agents almost never ask each other for things.';

type Card = {
  id: string;
  /** Pill travel along the pipe, 0..1. */
  travel: number;
  /** Card scale-in after landing, 0..1. */
  appear: number;
  opacity: number;
};

export function frameState(p: PanesProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const end = lineEnd(beats, dur);
  const span = Math.max(0.6, end - b0);
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));

  // ------------------------------------------------ Act I: swarm, ask, tell
  if (p.mode === 'swarm' || p.mode === 'ask' || p.mode === 'tell') {
    const freezeAt = p.mode === 'swarm' ? fit(b0 + 0.48 * span, 0.01, dur) : -1;
    const frozen = p.mode === 'swarm' ? clamp01(t >= freezeAt ? 1 : 0) : 1;
    const before = Math.max(0, freezeAt - t);
    // Streaming offset: fast near the freeze, so the swarm speeds up and then stops dead.
    const reach = 1500 * (1 - Math.exp(-before / 0.55));
    const askLit = p.mode === 'ask' ? E(b0 + 0.35 * span, 0.35) : 0;
    const askFade = p.mode === 'tell' ? E(b0, 0.4) : 0;
    const bubbles = Array.from({ length: SWARM_N }, (_, k) => {
      const home = swarmHome(k);
      const d = swarmDir(k);
      const isAsk = (ASK as readonly number[]).includes(k);
      const tellIdx = (TELL as readonly number[]).indexOf(k);
      const flip = tellIdx >= 0 && p.mode === 'tell' ? E(b0 + 0.25 + tellIdx * (0.9 / TELL.length) * span * 0.6, 0.35) : 0;
      // How bright the bubble is: the highlighted kind stays bright, the rest dim.
      let opacity = 1;
      if (p.mode === 'ask') opacity = isAsk ? 1 : 1 - 0.72 * askLit;
      if (p.mode === 'tell') opacity = isAsk ? 1 - 0.8 * askFade : tellIdx >= 0 ? 0.28 + 0.72 * flip : 0.28;
      return {
        // Wrapped into the frame, so the streams fill the screen from the first frame.
        x: wrap(home.x - d.x * reach, -80, W + 80),
        y: wrap(home.y - d.y * reach, -60, 1150),
        ask: isAsk,
        /** "?" glyph showing (appears on the freeze in the cold open). */
        glyphQ: isAsk ? (p.mode === 'swarm' ? E(freezeAt, 0.25) : 1) : 0,
        flip,
        flag: (TELL_FLAG as readonly number[]).includes(k),
        opacity: clamp01(opacity),
        streak: p.mode === 'swarm' ? clamp01(1 - frozen) * Math.min(1, before * 1.2 + 0.3) : 0,
        emphasis: isAsk && p.mode === 'ask' ? pulse(t, fit(b0 + 0.35 * span, 0.6, dur), 0.6) : 0,
      };
    });
    const words = TITLE.split(' ');
    return {
      view: 'swarm' as const,
      bubbles,
      flash: p.mode === 'swarm' ? pulse(t, freezeAt, 0.3) : 0,
      title:
        p.mode === 'swarm'
          ? words.map((text, i) => ({
              text,
              key: /^(never|ask)$/i.test(text),
              lit: P(b0 + (i / words.length) * span * 0.9, 0.2),
            }))
          : [],
      titleKey: p.mode === 'swarm' ? E(freezeAt, 0.3) : 0,
      counter: p.mode === 'ask' ? Math.round(179 * easeOutCubic(P(b0 + 0.05, 0.9))) : p.mode === 'tell' ? 179 : 0,
      counterAppear: p.mode === 'ask' ? E(b0, 0.3) : p.mode === 'tell' ? 1 : 0,
      chipAppear: p.mode === 'ask' ? E(b0 + 0.55 * span, 0.35) : 0,
      tellChip: p.mode === 'tell' ? E(b0 + 0.4 * span, 0.35) : 0,
    };
  }

  // ------------------------------------------------ Act I: the venv thread
  if (p.mode === 'thread') {
    const L = span;
    const starts = [b0 + 0.02, b0 + 0.24 * L, b0 + 0.5 * L, b0 + 0.74 * L];
    const msgs = starts.map((s) => ({ appear: E(s, 0.4) }));
    return {
      view: 'thread' as const,
      panes: E(0, 0.35),
      msgs,
      /** The first bubble's red flag flips to a tick on "retracted". */
      retract: E(starts[2] + 0.3, 0.35),
      retractFlash: pulse(t, fit(starts[2] + 0.3, 0.5, dur), 0.5),
    };
  }

  // ------------------------------------------------ Act III: the real nine minutes
  const card = (id: string, start: number, opts: { fadeAt?: number } = {}): Card => {
    const s = fit(start, TRAVEL + POP, dur);
    const fade = opts.fadeAt === undefined ? 0 : P(opts.fadeAt, 0.3);
    return { id, travel: progress(t, s, TRAVEL), appear: easeOutCubic(progress(t, s + TRAVEL, POP)), opacity: clamp01(1 - fade) };
  };

  let cards: Card[] = [];
  let clock = { ring: 0, label: '0:00' as string, big: 0 };
  let defect = { appear: 1, dim: 0, crumble: 0, arrow: 0, snap: 0 };
  let overview = 0;
  let reader = 0;
  let tag = 1;
  let panesIn = 1;

  if (p.mode === 'real-open') {
    panesIn = E(0, 0.4);
    tag = E(0.3, 0.4);
    defect = { appear: E(0.8, 0.35), dim: 0, crumble: 0, arrow: 0, snap: 0 };
    clock = { ring: 0, label: '0:00', big: 0 };
  } else if (p.mode === 'real-withdraw') {
    const c = card('withdraw', b0 + 0.05);
    cards = [c];
    defect = { appear: 1, dim: E(b0 + 0.05 + TRAVEL + POP + 0.5, 0.5), crumble: 0, arrow: 0, snap: 0 };
    clock = { ring: 0.05 + 0.25 * P(0, Math.max(1, dur)), label: '', big: 0 };
  } else if (p.mode === 'real-correct') {
    const b1 = beats.length > 1 ? beatAt(beats, 1) : end - 0.8;
    const corr = Math.max(0.9, b0 + 0.1);
    cards = [
      card('headsA', 0.0, { fadeAt: b1 - 0.35 }),
      card('headsB', 0.35, { fadeAt: b1 - 0.35 }),
      card('correct', corr),
      card('accept', b1 - 0.45),
    ];
    defect = { appear: 1, dim: 1, crumble: 0, arrow: 0, snap: 0 };
    clock = { ring: 0.3 + 0.35 * P(0, Math.max(1, dur)), label: '', big: 0 };
  } else if (p.mode === 'real-thanks') {
    const c = card('thanks', b0 - 0.05);
    cards = [c];
    const snapAt = b0 + 0.55 * span;
    defect = { appear: 1, dim: 1, arrow: E(0.1, 0.4), snap: E(snapAt, 0.25), crumble: P(snapAt + 0.1, 0.8) };
    clock = { ring: 0.65 + 0.2 * P(0, Math.max(1, dur)), label: '', big: 0 };
  } else if (p.mode === 'real-overview') {
    const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1.2;
    defect = { appear: 0, dim: 1, crumble: 1, arrow: 0, snap: 1 };
    clock = { ring: 0.85 + 0.15 * E(b0, 0.6), label: '~9 min', big: E(b0, 0.5) };
    overview = E(b1 - 0.25, 0.7);
    reader = E(b1 + 0.2, 0.5);
  }

  return {
    view: 'real' as const,
    panesIn,
    tag,
    cards,
    clock,
    defect,
    overview,
    reader,
  };
}

export type PanesState = ReturnType<typeof frameState>;
