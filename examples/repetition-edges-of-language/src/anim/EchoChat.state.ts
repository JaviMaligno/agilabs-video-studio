// EchoChat: one chat column. The same user bubble stacks up turn after turn and compresses into a
// striped wall at the top; under it, the model's reply. Modes:
// - wall: the N counter climbs 1 · 3 · 10 · 30 · 100 · 300 · 1000 over "table" bubbles;
// - flat: Sonnet's reply deflates through real replies (montage), a "third hello" inset pops in;
// - final: the wall jumps to ×1000, the reply is "No time access.";
// - meter: same picture, the repetition gauge comes forward and gets a "fine" tick;
// - burst: Opus at ×30 bursts into confetti with its real reply;
// - split: one wall over both outcomes, a flat line on the left and a spiral on the right.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { FLAT } from './rep.ts';

export type EchoMode = 'wall' | 'flat' | 'final' | 'meter' | 'burst' | 'split';
export type EchoChatProps = { mode: EchoMode; blend?: boolean };

export const N_STEPS = [1, 3, 10, 30, 100, 300, 1000];

/** Stage-local layout (vertical stage 960 x 1090). */
export const LAYOUT = { w: 960, wallTop: 40, bubbleH: 78, replyY: 640, chip: 120 } as const;

export type WallRow = { y: number; h: number; opacity: number; text: boolean };

/**
 * The stacked wall for a continuous level L = log10(N): newest bubble at the bottom, older ones
 * compressing into thin stripes; never taller than maxH.
 */
export const wallRows = (level: number, maxH: number, bubbleH: number = LAYOUT.bubbleH): { rows: WallRow[]; height: number } => {
  const L = Math.min(3, Math.max(0, Number.isFinite(level) ? level : 0));
  const nRows = Math.max(1, Math.min(70, Math.round(10 ** L)));
  const dense = clamp01((L - 1.5) / 1.5);
  const hs: number[] = [];
  const gs: number[] = [];
  for (let j = 0; j < nRows; j++) {
    hs.push(j < 2 ? bubbleH : Math.max(4, bubbleH * 0.6 ** (j - 1)));
    gs.push(j < 2 ? 14 : Math.max(1.5 - dense, 14 * 0.6 ** (j - 1)));
  }
  const total = hs.reduce((a, b) => a + b, 0) + gs.reduce((a, b) => a + b, 0);
  // The two newest bubbles keep their size; the stripes above them squeeze to fit.
  const fixed = hs.slice(0, 2).reduce((a, b) => a + b, 0) + gs.slice(0, 2).reduce((a, b) => a + b, 0);
  const k = total > maxH ? Math.max(0, maxH - fixed) / Math.max(1e-9, total - fixed) : 1;
  // Lay out from the bottom (newest) up.
  const rows: WallRow[] = [];
  let y = Math.min(total, maxH);
  for (let j = 0; j < nRows; j++) {
    const h = hs[j] * (j < 2 ? 1 : k);
    y -= h;
    rows.push({ y, h, opacity: j === 0 ? 1 : Math.max(0.35, 0.85 * 0.9 ** j), text: h >= bubbleH * 0.5 });
    y -= gs[j] * (j < 2 ? 1 : k);
  }
  return { rows: rows.reverse(), height: Math.min(total, maxH) };
};

const log = (n: number) => Math.log10(Math.max(1, n));

/** Level that steps through `ns` at the given times, easing 0.35 s into each step. */
const steppedLevel = (t: number, ns: number[], times: number[]): number => {
  let level = log(ns[0]);
  ns.forEach((n, i) => {
    if (i === 0) return;
    const p = easeOutCubic(progress(t, times[i], 0.35));
    level += (log(n) - log(ns[i - 1])) * p;
  });
  return level;
};

/** Which entry of `times` is active at t (last start <= t), -1 before the first. */
const activeIndex = (t: number, times: number[]): number => {
  let k = -1;
  times.forEach((s, i) => {
    if (t >= s) k = i;
  });
  return k;
};

export type EchoState = {
  stimulus: string;
  /** Model on the reply side. */
  model: string;
  shell: boolean;
  level: number;
  /** Count shown in the tag, as text ("×1000"). */
  tag: string;
  tagPop: number;
  wallH: number;
  appear: number;
  /** Reply bubble: text, max lines, opacity of the current text, scale for the deflate. */
  reply: { text: string; lines: number; opacity: number; scale: number };
  inset: { opacity: number };
  gauge: { value: number; opacity: number; zoom: number; tick: number };
  burst: { progress: number; big: number; sub: number; empire: number };
  split: { progress: number };
};

export const frameState = (p: EchoChatProps, t0: number, beats: number[], dur: number): EchoState => {
  const t = sceneTime(t0, dur);
  const b0 = beatAt(beats, 0);
  const base: EchoState = {
    stimulus: 'what time is it?',
    model: 'Claude Sonnet',
    shell: true,
    level: log(30),
    tag: '×30',
    tagPop: 1,
    wallH: 520,
    appear: p.blend ? 1 : easeOutCubic(progress(t, 0, 0.4)),
    reply: { text: '', lines: 1, opacity: 0, scale: 1 },
    inset: { opacity: 0 },
    gauge: { value: 0.04, opacity: 0, zoom: 0, tick: 0 },
    burst: { progress: 0, big: 0, sub: 0, empire: 0 },
    split: { progress: 0 },
  };

  if (p.mode === 'wall') {
    const end = Math.max(b0 + 0.5, Number.isFinite(dur) ? dur - 1.0 : b0 + 3);
    const times = N_STEPS.map((_, i) => fit(b0 + ((end - b0) * i) / (N_STEPS.length - 1), 0.35, dur));
    const k = Math.max(0, activeIndex(t, times));
    const level = steppedLevel(t, N_STEPS, times);
    return {
      ...base,
      stimulus: 'table',
      level,
      tag: `×${N_STEPS[k]}`,
      tagPop: easeOutCubic(progress(t, times[k], 0.25)),
      wallH: 260 + 640 * clamp01(level / 3),
    };
  }

  if (p.mode === 'flat') {
    // Montage of the four deflating replies, the first on the first beat.
    const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1.5;
    const end = Number.isFinite(dur) ? dur - 0.9 : b1 + 2;
    const times = [0, 1, 2, 3].map((i) => fit(b0 + ((end - b0) * i) / 3, 0.3, dur));
    const k = Math.max(0, activeIndex(t, times));
    const swap = progress(t, times[k], 0.3);
    const ns = FLAT.slice(0, 4).map((f) => f.n);
    const ins = Number.isFinite(t) ? clamp01(Math.min(progress(t, b1, 0.25), 1 - progress(t, b1 + 2.0, 0.3))) : 0;
    return {
      ...base,
      level: steppedLevel(t, ns, times),
      tag: `×${ns[k]}`,
      tagPop: easeOutCubic(swap),
      reply: { text: FLAT[k].text, lines: k === 0 ? 3 : k === 1 ? 2 : 1, opacity: easeOutCubic(swap), scale: 0.92 + 0.08 * easeOutCubic(swap) },
      inset: { opacity: ins },
      gauge: { value: 0.04, opacity: 0.85, zoom: 0, tick: 0 },
    };
  }

  if (p.mode === 'final' || p.mode === 'meter') {
    const jump = p.mode === 'final' ? fit(b0 + 1.0, 0.6, dur) : -1;
    const j = p.mode === 'final' ? easeOutCubic(progress(t, jump, 0.6)) : 1;
    const zoom = p.mode === 'meter' ? easeOutCubic(progress(t, fit(b0 + 0.1, 0.6, dur), 0.6)) : 0;
    const tick = p.mode === 'meter' ? easeOutCubic(progress(t, fit(b0 + 1.2, 0.35, dur), 0.35)) : 0;
    return {
      ...base,
      level: log(30) + (3 - log(30)) * j,
      tag: j > 0.5 ? '×1000' : '×30',
      tagPop: p.mode === 'final' && t >= jump + 0.3 ? easeOutCubic(progress(t, jump + 0.3, 0.3)) : 1,
      reply: {
        text: j > 0.5 ? FLAT[4].text : FLAT[3].text,
        lines: 1,
        opacity: j > 0.5 ? easeOutCubic(progress(t, jump + 0.3, 0.3)) : 1,
        scale: 1,
      },
      gauge: { value: 0.04, opacity: 0.85 + 0.15 * zoom, zoom, tick },
    };
  }

  if (p.mode === 'burst') {
    const at = fit(b0 + 0.9, 1.6, dur);
    return {
      ...base,
      model: 'Claude Opus',
      // Before the burst: a typing indicator (empty text), never an invented reply.
      reply: { text: '', lines: 0, opacity: 1 - progress(t, at, 0.2), scale: 1 },
      burst: {
        progress: progress(t, at, 1.6),
        big: progress(t, at + 0.1, 0.45),
        sub: progress(t, at + 0.55, 0.5),
        empire: progress(t, at + 1.1, 0.7),
      },
    };
  }

  // split
  return {
    ...base,
    level: 3,
    tag: '×1000',
    reply: { text: FLAT[4].text, lines: 1, opacity: 1, scale: 1 },
    wallH: 360,
    split: { progress: easeOutCubic(progress(t, 0.1, 0.8)) },
  };
};
