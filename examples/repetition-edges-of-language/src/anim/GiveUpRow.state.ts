// GiveUpRow: the nine stimuli as bubbles, lit; one by one they dim and droop in Sonnet's give-up
// order (ranking as light, not a bar chart). The two it stays with longest (greeting, praise) stay
// lit. Mode `human`: a generic human silhouette's nine attention dots dim in the same order.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { GIVE_UP_RANK, STIMULI } from './rep.ts';

export type GiveUpMode = 'row' | 'human';
export type GiveUpRowProps = { mode: GiveUpMode; blend?: boolean };

/** How many stimuli dim (the rest, Sonnet's two warmest, stay lit). */
export const DIMMED = 7;

export type Row = { text: string; rate: string; dim: number; tag: number; warm: number; human: number };

export type GiveUpState = { rows: Row[]; appear: number; human: number; note: number };

export const frameState = (p: GiveUpRowProps, t0: number, beats: number[], dur: number): GiveUpState => {
  const t = sceneTime(t0, dur);
  const b0 = beatAt(beats, 0);
  const isRow = p.mode === 'row';
  const appear = isRow ? easeOutCubic(progress(t, 0, 0.5)) : 1;
  // Row mode: the seven dim between the first beat and ~1.4 s before the scene end.
  const end = Number.isFinite(dur) ? Math.max(b0 + 1, dur - 1.6) : b0 + 4;
  const step = (end - (b0 + 0.3)) / (DIMMED - 1);
  const human = isRow ? 0 : easeOutCubic(progress(t, 0, 0.5));
  const rows: Row[] = STIMULI.map((s, i) => {
    const k = GIVE_UP_RANK[i];
    const lit = k >= DIMMED;
    const dimAt = fit(b0 + 0.3 + k * step, 0.45, dur);
    const dim = isRow ? (lit ? 0 : easeOutCubic(progress(t, dimAt, 0.45))) : lit ? 0 : 1;
    const warmAt = fit(end + 0.1, 0.5, dur);
    const warm = lit ? (isRow ? easeOutCubic(progress(t, warmAt, 0.5)) : 1) : 0;
    const tag = s.shown ? (lit ? warm : dim) : 0;
    // Human dots: same order, quicker.
    const hAt = fit(b0 + 0.25 + k * 0.13, 0.3, dur);
    const hDim = lit ? 0 : easeOutCubic(progress(t, hAt, 0.3));
    return { text: s.text, rate: s.shown ? `${s.rate}%` : '', dim, tag, warm, human: isRow ? 0 : 1 - hDim };
  });
  return { rows, appear, human, note: isRow ? 0 : easeOutCubic(progress(t, fit(b0 + 0.6, 0.4, dur), 0.4)) };
};
