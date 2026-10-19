// Pure state of the HandoffShaft scenes: a client's request as a paper strip with amber
// "because" tabs, dropping down a shaft of four desks (lead, PM, architect, implementer).
// Scissors cut the tabs at the last desk and they pile up beside the implementer.
// Visuals are illustrative, chosen for impact; the lines on the strip are real hand-off lines
// (src/data/handoff.json) and the numbers come from the article. No Remotion or React here.
import type { Label } from '../types.ts';
import { frameState as counterState } from './Counter.state.ts';
import { frameState as quoteState } from './KeyQuote.state.ts';
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode = 'cold' | 'unroll' | 'facts' | 'reasons' | 'arrive' | 'snip' | 'shortcut' | 'quote' | 'code' | 'reattach';

export type ShaftProps = {
  mode: Mode;
  /**
   * Story position at the scene start and end. Only read by Video.tsx: two scenes in a row
   * whose positions meet blend into each other instead of dipping through black.
   */
  play?: [number, number];
  /** Small corner chip (snip: "8–31% · Claude, software teams"). */
  chip?: Label;
  /** Shortcut: the figure counted up on the second line. */
  counter?: { value: number; suffix?: string; label: Label; delay?: number };
  /** Quote: one sentence per narration line. */
  quote?: { lines: Label[]; emphasis?: string[] };
};

/** Close view: world distance between two desks, and the stage y the current desk sits at. */
export const FLOOR = 560;
export const CAM_Y = 110;
/** Close view strip geometry, relative to its desk (world px). */
export const STRIP = { top: 64, bodyH: 150, gap: 14, tabH: 104, x0: 30, x1: 930, tabX0: 90, tabX1: 840, cutX: 104 } as const;
/** Top of tab `i` under a strip whose top is at `y`. */
export const tabTop = (y: number, i: number): number => y + STRIP.bodyH + STRIP.gap + i * (STRIP.tabH + STRIP.gap);

/** The pile of cut tabs beside the implementer (close view, relative to the implementer's desk). */
export const PILE_CENTER = { x: 470, y: 790 } as const;
export const PILE = [
  { dx: -150, dy: 40, rot: -9 },
  { dx: 120, dy: 70, rot: 7 },
  { dx: -10, dy: -40, rot: 3 },
  { dx: 210, dy: -20, rot: -6 },
  { dx: -230, dy: -30, rot: 11 },
  { dx: 40, dy: 100, rot: -3 },
  { dx: -90, dy: 120, rot: 6 },
  { dx: 250, dy: 110, rot: -12 },
  { dx: 80, dy: 10, rot: 14 },
] as const;
/** What each pile slot is: the two real tabs, then stand-ins for every other cut reason. */
export const GHOSTS = ['because …', 'so that …', 'since …', 'because …', 'because …', 'so …', 'because …'] as const;

/** Overview layout (stage coordinates). */
export const OVERVIEW = { nodeX: 110, ys: [330, 510, 690, 870], labelX: 176, cardX0: 480, cardX1: 930, cardH: 168 } as const;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** A short flash, 0 → 1 → 0 over `len` seconds from `start`. */
const pulse = (t: number, start: number, len: number) => {
  const p = progress(t, start, len);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};
/** End of the last line, estimated from the scene length (the scene lasts until it + 0.8 s). */
const lineEnd = (beats: number[], dur: number) => {
  const last = beats.length ? beatAt(beats, beats.length - 1) : 0;
  return Number.isFinite(dur) ? Math.max(last + 0.5, dur - 0.8) : last + 2;
};
const at = (t: number, start: number, len: number, dur: number) => progress(t, fit(start, len, dur), len);

const TITLE = 'Nobody tells the implementer why.';

export function frameState(p: ShaftProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : lineEnd(beats, dur);
  const end = lineEnd(beats, dur);
  const P = (start: number, len: number) => at(t, start, len, dur);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));

  // --- Cold open: close-up of one strip and its tab; scissors snip, the tab drops out.
  if (p.mode === 'cold') {
    const words = TITLE.split(' ');
    const window = Math.max(0.6, end - b0) * 0.85;
    return {
      view: 'cold' as const,
      title: words.map((text, i) => ({ text, why: /^why/i.test(text), lit: P(b0 + (i / words.length) * window, 0.2) })),
      // Scissors: 1 = parked at the right edge, 0 = at the cut.
      scissorsTravel: 1 - E(0, 0.9),
      open: 1 - P(0.9, 0.14),
      tabFall: P(1.05, 1.0),
      flash: pulse(t, fit(1.0, 0.3, dur), 0.3),
    };
  }

  // --- Overview: the client request and the four desks, all in the frame.
  if (p.mode === 'unroll' || p.mode === 'facts' || p.mode === 'shortcut') {
    const nodeAt = [0.3, 0.45, 0.6, 0.8];
    const span = Math.max(0.8, end - b0);
    const nodes = nodeAt.map((f) => (p.mode === 'unroll' ? E(b0 + f * span, 0.4) : 1));
    let dim = [0, 0, 0, 0];
    let card = { appear: 0, desk: 0, flicker: 0, ticks: [0, 0, 0], flash: 0 };
    let shortcut = { travel: 0, scissors: 0, open: 1, falls: [0, 0, 0], appear: 0 };
    let counter: ReturnType<typeof counterState> | null = null;

    if (p.mode === 'facts') {
      const step = Math.min(1.1, Math.max(0.45, (end - b0 - 0.4) / 3.2));
      const arrive = [0, 1, 2, 3].map((k) => fit(b0 + 0.2 + k * step, 0.45 + (3 - k) * step, dur));
      let desk = 0;
      for (let k = 1; k < 4; k++) desk += easeOutCubic(progress(t, arrive[k] - 0.4, 0.4));
      const flicker = Math.max(...arrive.slice(1).map((a) => pulse(t, a - 0.12, 0.3)));
      card = {
        appear: E(b0, 0.35),
        desk,
        flicker,
        // The chips flash at every desk; at the last desk each one gets its tick.
        ticks: [0, 1, 2].map((j) => progress(t, arrive[3] + j * 0.1, 0.25)),
        flash: Math.max(...arrive.map((a) => pulse(t, a, 0.35))),
      };
    }

    if (p.mode === 'shortcut') {
      // The cut lands on the LAST line ("kept the reason only 24%…"), however many lines lead into it.
      const b1 = beats.length > 1 ? beatAt(beats, beats.length - 1) : end;
      const fade = E(b0, 0.6);
      dim = [0, 0.78 * fade, 0.78 * fade, 0];
      shortcut = {
        appear: E(b0 + 0.1, 0.4),
        travel: easeOutCubic(P(b0 + 0.5, 1.8)),
        scissors: E(b1 - 0.35, 0.3) * (1 - P(b1 + 0.9, 0.3)),
        open: 1 - P(b1 + 0.05, 0.15),
        falls: [0, 1, 2].map((i) => P(b1 + 0.22 + i * 0.12, 0.9)),
      };
      const c = p.counter ?? { value: 24, suffix: '%', label: '' };
      counter = counterState({ value: c.value, suffix: c.suffix, label: c.label, beat: 0 }, t, [b1 + (c.delay ?? 1)], dur);
    }

    return {
      view: 'overview' as const,
      client: E(0, 0.45),
      unroll: p.mode === 'unroll' ? E(0.1, 1.0) : 1,
      nodes,
      dim,
      card,
      shortcut,
      counter,
    };
  }

  // --- Close view: the camera rides with the strip down the shaft.
  let f = 3;
  let desk = 3;
  let flicker = 0;
  let tabs = [
    { attached: 1, fall: 0 },
    { attached: 1, fall: 0 },
  ];
  let scissors = { x: 780, y: 2 * FLOOR + 6, open: 0, opacity: 0, rot: -28 };
  let ghosts = GHOSTS.map(() => 0);
  let settled = 0;
  let hop = 0;
  let rail = 0;
  let chip = 0;
  let dimTop = 0;
  let quote: { words: ReturnType<typeof quoteState>['words']; emphasis: number }[] = [];
  let code = { panel: 0, lines: [0, 0, 0, 0, 0], qmark: 0 };
  let reattach = { lift: 0, stapler: 0, press: 0, flash: 0, page: 0, clip: 0 };

  if (p.mode === 'reasons') {
    const m1 = fit(b0 + 0.2, 0.6, dur);
    const m2 = fit(b0 + 1.1, 0.6, dur);
    f = easeOutCubic(progress(t, m1, 0.6)) + easeOutCubic(progress(t, m2, 0.6));
    desk = Math.round(f);
    flicker = Math.max(pulse(t, m1 + 0.15, 0.35), pulse(t, m2 + 0.15, 0.35));
    hop = f;
  } else if (p.mode === 'arrive') {
    f = 2;
    desk = 2;
    hop = 2;
    scissors = { ...scissors, opacity: E(b0 + 0.5, 0.4) };
    rail = E(b0 + 0.2, 0.8);
  } else if (p.mode === 'snip') {
    const s0 = b0;
    const neck = (i: number) => ({ x: STRIP.cutX, y: tabTop(2 * FLOOR + STRIP.top, i) + STRIP.tabH / 2 });
    const rest = { x: 780, y: 2 * FLOOR + 6 };
    const go1 = E(s0, 0.45);
    const go2 = E(s0 + 0.62, 0.25);
    const a = neck(0);
    const b = neck(1);
    const x = go2 > 0 ? lerp(a.x, b.x, go2) : lerp(rest.x, a.x, go1);
    const y = go2 > 0 ? lerp(a.y, b.y, go2) : lerp(rest.y, a.y, go1);
    const close1 = P(s0 + 0.45, 0.12) * (1 - P(s0 + 0.6, 0.1));
    const close2 = P(s0 + 0.88, 0.12);
    scissors = {
      x,
      y,
      rot: lerp(-28, 0, go1),
      open: go1 < 1 ? 0.15 + 0.85 * go1 : 1 - Math.max(close1, close2),
      opacity: 1 - P(s0 + 1.15, 0.3),
    };
    const cut = [s0 + 0.55, s0 + 0.98];
    tabs = cut.map((c) => ({ attached: t >= fit(c, 1.3, dur) ? 0 : 1, fall: P(c, 1.3) }));
    const pan = fit(s0 + 1.3, 1.0, dur);
    f = 2 + easeOutCubic(progress(t, pan, 1.0));
    desk = f < 2.5 ? 2 : 3;
    flicker = pulse(t, pan + 0.35, 0.35);
    hop = f;
    rail = 1;
    ghosts = GHOSTS.map((_, i) => (i < 4 ? P(s0 + 0.9 + i * 0.22, 1.4) : 0));
    chip = E(s0 + 2.4, 0.4);
  } else {
    // quote, code, reattach: at the implementer's desk, every cut tab on the pile.
    f = 3;
    desk = 3;
    hop = 3;
    rail = 1;
    tabs = [
      { attached: 0, fall: 1 },
      { attached: 0, fall: 1 },
    ];
    ghosts = GHOSTS.map(() => 1);
    settled = 1;
    if (p.mode === 'quote') {
      // The quote clears just before the blend into the next scene, so the next strip never
      // fades in on top of the sentence.
      const out = 1 - P(Math.max(0, dur - 0.9), 0.35);
      dimTop = E(0, 0.4) * out;
      const lines = p.quote?.lines ?? [];
      quote = lines.map((text, i) => {
        const q = quoteState({ text, emphasis: p.quote?.emphasis, beat: i }, t, beats, dur, 'en');
        return { words: q.words.map((w) => ({ ...w, opacity: w.opacity * out })), emphasis: q.emphasis };
      });
    }
    if (p.mode === 'code') {
      code = {
        panel: E(b0, 0.4),
        lines: [0, 1, 2, 3, 4].map((i) => P(b0 + 0.3 + i * 0.4, 0.35)),
        qmark: E(b0 + 2.1, 0.5),
      };
    }
    if (p.mode === 'reattach') {
      const out = 1 - P(0, 0.4);
      code = { panel: out, lines: [1, 1, 1, 1, 1], qmark: out };
      reattach = {
        lift: easeOutCubic(P(b0 + 0.5, 1.0)),
        // The staple stays once it is in.
        stapler: E(b0 + 1.45, 0.3),
        press: pulse(t, fit(b0 + 1.6, 0.3, dur), 0.3),
        flash: pulse(t, fit(b0 + 1.75, 0.4, dur), 0.4),
        page: E(b1, 0.6),
        clip: E(b1 + 0.5, 0.3),
      };
    }
  }

  return {
    view: 'close' as const,
    camY: f * FLOOR - CAM_Y,
    stripY: f * FLOOR + STRIP.top,
    desk,
    flicker,
    tabs,
    scissors,
    ghosts,
    settled,
    hop,
    rail,
    chip,
    dimTop,
    quote,
    code,
    reattach,
  };
}

export type ShaftState = ReturnType<typeof frameState>;
