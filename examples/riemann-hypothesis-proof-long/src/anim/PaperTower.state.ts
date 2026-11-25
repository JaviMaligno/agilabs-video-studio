// PaperTower: what the checkers ran. `tower`: a question over an empty floor, three figure tiles,
// and a tower of paper rising past the top of the frame (the camera tilts up after it). `slop`:
// the tower wobbles and topples into a waste bin, then Alpöge's own words for the long version.
// Pure numbers and strings (no Remotion or React), so `node --test` can check it.
import { beatAt, clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type PaperTowerProps = { mode: 'tower' | 'slop' };

/** Figures exactly as the article writes them. */
export const TILES = [
  { value: '175,187', label: 'Lean files' },
  { value: '17.4 million', label: 'lines, no comments' },
  { value: 'over 250,000', label: "pages, by the author's count" },
] as const;

export const QUESTION = 'So what did they run?';
export const QUOTE_WORDS = ['“some', 'massive', 'unreadable', 'travesty', 'of', 'slop.”'] as const;
export const QUOTE_BY = 'Levent Alpöge';

// Seconds after the start of a line where its words are spoken (TTS word timings, 2026-11-23).
/** Tower line 2: "...seventy-five thousand files." / "Seventeen million lines." */
const TILE_AT_L2 = [0.95, 2.95];
/** Tower line 3: "...over a quarter of a million pages." */
const TILE_AT_L3 = 2.75;
/** Slop line 2: each quoted word. */
const QUOTE_AT = [2.0, 2.44, 3.26, 3.96, 4.6, 4.6];

const smooth = (p: number): number => {
  const x = clamp01(p);
  return x * x * (3 - 2 * x);
};
const easeIn = (p: number): number => clamp01(p) ** 2.2;

/** Ordered beats: each at least the one before, so late or missing lines never run backwards. */
const ordered = (beats: number[], n: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(Math.max(i ? out[i - 1] : 0, beatAt(beats, i)));
  return out;
};

export function frameState(p: PaperTowerProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  /** Ambient clock: keeps running, bounded, never jumps back. */
  const T = Number.isFinite(time) ? Math.min(Math.max(0, time), 1e5) : 0;

  if (p.mode === 'slop') {
    const [b0, b1] = ordered(beats, 2);
    const toppleAt = b0 + 2.3;
    const topple = easeIn(progress(t, toppleAt, 1.05));
    return {
      T,
      mode: 'slop' as const,
      /** The counts leave; the pages tile ("that long version") stays until the tower falls. */
      tiles: [1 - progress(t, 0.15, 0.6), 1 - progress(t, 0.15, 0.6), 1 - progress(t, toppleAt + 0.3, 0.6)],
      question: 0,
      rise: 1,
      /** Camera tilt: starts where the tower scene left it (up), comes back down to the floor. */
      tilt: 1 - smooth(progress(t, 0.1, 1.9)),
      /** Wobble envelope: grows on "He did generate", gone once the tower falls. */
      wobble: smooth(progress(t, b0 + 0.2, 0.9)) * (1 - topple),
      topple,
      /** The tower has gone into the bin. */
      gone: progress(t, toppleAt + 0.85, 0.2),
      bin: easeOutCubic(progress(t, 0.3, 1.1)),
      /** Bin squash when the tower lands (0..1..0). */
      thud: Math.sin(Math.PI * progress(t, toppleAt + 1.0, 0.55)),
      burst: progress(t, toppleAt + 0.95, 1.6),
      quote: easeOutCubic(progress(t, b1 + 0.15, 0.5)),
      lit: QUOTE_AT.map((o) => progress(t, b1 + o, 0.25)),
      by: easeOutCubic(progress(t, b1 + 0.15, 0.6)),
    };
  }

  const [b0, b1, b2] = ordered(beats, 3);
  return {
    T,
    mode: 'tower' as const,
    tiles: [b1 + TILE_AT_L2[0], b1 + TILE_AT_L2[1], b2 + TILE_AT_L3].map((s) => easeOutCubic(progress(t, s, 0.45))),
    /** The question: on before its line (under the chapter card), gone when the figures arrive. */
    question: easeOutCubic(progress(t, Math.max(0, b0 - 0.6), 0.5)) * (1 - progress(t, b1 + 0.2, 0.5)),
    /** Tower height share above the floor: a first storey while the counts arrive, then past the frame on "Written out for people". */
    rise: 0.24 * smooth(progress(t, b1 + 0.5, 2.8)) + 0.76 * smooth(progress(t, b2 + 0.1, 3.6)),
    tilt: smooth(progress(t, b2 + 0.9, 3.6)),
    wobble: 0,
    topple: 0,
    gone: 0,
    bin: 0,
    thud: 0,
    burst: 0,
    quote: 0,
    lit: QUOTE_AT.map(() => 0),
    by: 0,
  };
}
