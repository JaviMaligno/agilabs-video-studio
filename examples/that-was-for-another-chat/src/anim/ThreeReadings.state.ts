// Pure state of the ThreeReadings scenes: the article's three-way fork (clipboard junk / a
// deliberate pivot / context I forgot) as three slots a pasted piece can fall into. In the
// verdict, all 24 land in the middle one. No Remotion or React here.
import type { Label } from '../types.ts';
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime, stepTimes } from './steps.ts';

export type ReadingsProps = {
  mode: 'fork' | 'verdict';
  /** The three readings, left to right. */
  slots: [Label, Label, Label];
  /** A short gloss under each (the article's quotes: "ignore it", ...). */
  glosses?: [Label, Label, Label];
  /** verdict: the stamp over the left slot ("0 / 24"), shown on the given beat. */
  stamp?: { value: string; label: Label; beat?: number };
  /** Total pieces in the verdict (the conversations read). */
  total?: number;
  /** Index of the slot every piece lands in. */
  winner?: number;
  /** fork: scene seconds each slot appears (else one per beat). */
  at?: number[];
  continues?: boolean;
};

const lerp = (a: number, b: number, p: number) => a + (b - a) * clamp01(p);

export type ReadingsState = {
  /** The pasted block hovering over the fork. */
  piece: { opacity: number; dy: number; rot: number };
  slots: { appear: number; lit: number; dim: number }[];
  /** Branch lines from the piece to each slot. */
  branches: { draw: number[] };
  /** verdict: pieces raining into the winning slot (0 = above, 1 = landed). */
  rain: number[];
  /** Counts under the slots, as displayed. */
  counts: string[];
  countOpacity: number;
  stamp: { opacity: number; pop: number };
};

export function frameState(p: ReadingsProps, t0: number, beats: number[], dur: number): ReadingsState {
  const t = sceneTime(Number.isFinite(t0) ? t0 : 0, dur);
  const D = Number.isFinite(dur) && dur > 0 ? dur : 0;
  const total = Math.max(1, Math.round(p.total ?? 24));
  const win = Math.min(2, Math.max(0, Math.round(p.winner ?? 1)));

  if (p.mode === 'fork') {
    const starts = stepTimes(3, beats, p.at ?? [], 0.45, D);
    const appear = starts.map((s) => easeOutCubic(progress(t, s, 0.45)));
    // The slot being spoken about is lit; earlier ones settle back.
    const lit = starts.map((s, i) => {
      const on = progress(t, s, 0.2);
      const next = starts[i + 1];
      return next === undefined ? on : on * (1 - 0.55 * progress(t, next, 0.3));
    });
    return {
      piece: { opacity: progress(t, 0, 0.35), dy: 0.012 * Math.sin(t * 3.5), rot: -5 + 2 * Math.sin(t * 2.4) },
      slots: appear.map((a, i) => ({ appear: a, lit: lit[i], dim: 0 })),
      branches: { draw: starts.map((s) => easeOutCubic(progress(t, s - 0.05, 0.4))) },
      rain: Array.from({ length: total - 1 }, () => 0),
      counts: ['', '', ''],
      countOpacity: 0,
      stamp: { opacity: 0, pop: 0 },
    };
  }

  // verdict: the hovering piece drops into the winner, then the other conversations follow.
  const drop0 = fit(0.15, 0.45, D);
  const drop = clamp01(progress(t, drop0, 0.45)) ** 2;
  const rainFrom = drop0 + 0.4;
  const rainSpan = Math.max(0.4, Math.min(2.2, D - rainFrom - 0.6));
  const rain = Array.from({ length: total - 1 }, (_, i) => {
    const s = fit(rainFrom + (i / Math.max(1, total - 2)) * rainSpan, 0.4, D);
    return clamp01(progress(t, s, 0.4)) ** 2;
  });
  const landed = (drop >= 1 ? 1 : 0) + rain.filter((r) => r >= 1).length;
  const stampAt = fit(beatAt(beats, p.stamp?.beat ?? 1), 0.45, D);
  return {
    piece: { opacity: 1, dy: lerp(0, 1, drop), rot: lerp(-5, 0, drop) },
    slots: [0, 1, 2].map((i) => ({ appear: 1, lit: i === win ? 1 : 0, dim: i === win ? 0 : 0.5 * progress(t, drop0, 0.5) })),
    branches: { draw: [1, 1, 1] },
    rain,
    counts: [0, 1, 2].map((i) => (i === win ? String(Math.min(total, landed)) : '0')),
    countOpacity: progress(t, drop0, 0.3),
    stamp: { opacity: progress(t, stampAt, 0.2), pop: easeOutCubic(progress(t, stampAt, 0.45)) },
  };
}
