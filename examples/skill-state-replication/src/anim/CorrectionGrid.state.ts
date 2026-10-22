// Pure state of the headline count (line 12): the retroactive correction, applied or not, per
// episode. Two blocks of 3 × 24 cells (Haiku · Sonnet · Gemini), filled exactly as part 2's figure:
// the notepad 24 · 22 · 24 = 70 / 72, the transcript 1 · 9 · 0 = 10 / 72. The notepad block fills
// on "70", the transcript block on "10". No Remotion or React here.
import { easeOutCubic, progress, sceneTime } from './steps.ts';

export type CorrectionGridProps = { marks?: number[] };

export const MODELS = ['Haiku 4.5', 'Sonnet 5', 'Gemini 3 Flash'] as const;
export const PER = 24;
export const ARMS = [
  { id: 'note', label: 'notepad', counts: [24, 22, 24], total: '70 / 72' },
  { id: 'tr', label: 'transcript', counts: [1, 9, 0], total: '10 / 72' },
] as const;

export type GridState = {
  blocks: { opacity: number; fill: number; total: number; rows: { cells: number; label: number }[] }[];
  tag: number;
};

const e = (t: number, s: number, l: number) => easeOutCubic(progress(t, s, l));
const mk = (marks: number[] | undefined, i: number, fallback: number) => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};

/** Seconds a block takes to fill (its rows fill one after another, overlapping). */
export const FILL = 1.2;

export function frameState(props: CorrectionGridProps, t: number, beats: number[], dur: number): GridState {
  const T = sceneTime(Number.isFinite(t) ? t : 0, dur);
  const m = props.marks;
  const b0 = beats[0] !== undefined && Number.isFinite(beats[0]) ? beats[0] : 0;
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 4;
  const show = [mk(m, 0, b0 + 1.4) - 0.4, mk(m, 2, b1 + 0.1) - 0.3];
  const go = [mk(m, 1, b0 + 3), mk(m, 3, b1 + 1.2)];
  return {
    blocks: ARMS.map((arm, a) => {
      const fill = progress(T, go[a] - 0.3, FILL);
      return {
        opacity: e(T, Math.min(show[a], go[a] - 0.6), 0.4),
        fill,
        total: e(T, go[a] - 0.3 + FILL * 0.7, 0.35),
        rows: arm.counts.map((c, r) => {
          const p = Math.max(0, Math.min(1, (fill - r * 0.25) / 0.5));
          return { cells: Math.round(c * easeOutCubic(p)), label: e(T, go[a] - 0.3 + 0.4 * r + 0.4, 0.3) };
        }),
      };
    }),
    tag: e(T, go[1] + 1.0, 0.4),
  };
}
