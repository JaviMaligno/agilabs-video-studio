// ShellChips: each model is a chip with a "core" (a token-grid glyph); the aligned ones wear a thin
// glossy shell. Qwen Instruct and Qwen Base share the same core. Modes:
// - roster: four chips drop in; the two Qwen chips slide together, "same weights";
// - peel: the shell on Qwen Instruct peels off, revealing the Base chip; a wall of "table"
//   bubbles comes down on it and its reply opens and never closes;
// - cutaway: the chip cut open edge-on: a hair-thin film over a core where a spiral already turns.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type ShellMode = 'roster' | 'peel' | 'cutaway';
export type ShellChipsProps = { mode: ShellMode };

export type Chip = {
  label: string;
  x: number;
  y: number;
  size: number;
  /** Seed of the core pattern: equal seeds draw the same core. */
  seed: number;
  /** Shell drawn: 1 = whole, 0 = none; `peel` rolls it back from the top-right corner. */
  shell: number;
  peel: number;
  appear: number;
  dim: number;
};

/** Core seeds: the two Qwen chips share one. */
export const SEED = { opus: 11, sonnet: 23, qwen: 37 } as const;

/** Lit cells of a 5x5 core grid for a seed (deterministic). */
export const coreCells = (seed: number): boolean[] => {
  let s = seed * 9301 + 49297;
  return Array.from({ length: 25 }, () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280 > 0.45;
  });
};

export type ShellState = {
  chips: Chip[];
  link: number;
  /** Peel: label switch progress and the falling flap. */
  rename: number;
  flapFall: number;
  /** After the peel: the wall comes down and the reply streams (seconds of streaming). */
  wall: number;
  stream: number;
  streamWords: number;
  cut: { appear: number; film: number; label: number; spiral: number };
};

const empty = { link: 0, rename: 0, flapFall: 0, wall: 0, stream: 0, streamWords: 0, cut: { appear: 0, film: 0, label: 0, spiral: 0 } };

export const frameState = (p: ShellChipsProps, t0: number, beats: number[], dur: number): ShellState => {
  const t = sceneTime(t0, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1.6;

  if (p.mode === 'roster') {
    const together = easeOutCubic(progress(t, fit(b1 + 0.2, 0.6, dur), 0.6));
    const specs = [
      { label: 'Claude Opus', seed: SEED.opus, shell: 1, col: 0, row: 0 },
      { label: 'Claude Sonnet', seed: SEED.sonnet, shell: 1, col: 1, row: 0 },
      { label: 'Qwen 7B Instruct', seed: SEED.qwen, shell: 1, col: 0, row: 1 },
      { label: 'Qwen 7B Base', seed: SEED.qwen, shell: 0, col: 1, row: 1 },
    ];
    const chips = specs.map((s, i) => {
      const appear = easeOutCubic(progress(t, fit(b0 + i * 0.22, 0.45, dur), 0.45));
      const qwen = s.row === 1;
      const x0 = s.col === 0 ? 240 : 720;
      const x = qwen ? x0 + (s.col === 0 ? 1 : -1) * 70 * together : x0;
      return { label: s.label, x, y: (s.row === 0 ? 190 : 640) - (1 - appear) * 90, size: 290, seed: s.seed, shell: s.shell, peel: 0, appear, dim: qwen ? 0 : 0.6 * together };
    });
    return { ...empty, chips, link: together };
  }

  if (p.mode === 'peel') {
    const peelAt = fit(b0 + 0.35, 1.4, dur);
    const q = progress(t, peelAt, 1.4);
    const peel = q * q * (3 - 2 * q);
    const move = easeOutCubic(progress(t, fit(b1 - 0.1, 0.6, dur), 0.6));
    const chip: Chip = {
      label: peel > 0.6 ? 'Qwen 7B Base' : 'Qwen 7B Instruct',
      x: 480 - 360 * move,
      y: 440 + 300 * move,
      size: 400 - 250 * move,
      seed: SEED.qwen,
      shell: 1,
      peel,
      appear: 1,
      dim: 0,
    };
    const streamStart = b1 + 0.45;
    const stream = Math.max(0, Number.isFinite(t) ? Math.min(t, 1e4) - streamStart : 0);
    return {
      ...empty,
      chips: [chip],
      rename: clamp01((peel - 0.5) / 0.3),
      flapFall: progress(t, peelAt + 1.2, 0.8),
      wall: move,
      stream: Math.min(stream, 60),
      streamWords: Math.min(60, Math.floor(stream * 9)),
    };
  }

  // cutaway
  const appear = easeOutCubic(progress(t, 0, 0.6));
  return {
    ...empty,
    chips: [],
    cut: {
      appear,
      film: easeOutCubic(progress(t, 0.3, 0.6)),
      label: easeOutCubic(progress(t, fit(b0 + 1.0, 0.5, dur), 0.5)),
      spiral: easeOutCubic(progress(t, fit(b0 + 1.8, 0.8, dur), 0.8)),
    },
  };
};
