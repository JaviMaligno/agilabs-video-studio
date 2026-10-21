// Pure state of the judge's scale over the task strip: on objective tasks an answer key outweighs
// the judge's own ink; on subjective ones the key dissolves into "taste" and the scale tips towards
// the judge's own card. Under it, the article's bias-by-subjectivity bars, one group per level.
// Stage pixels (960 x 1090). No Remotion or React here.
import { easeOutCubic } from './steps.ts';
import { BIAS, clock, easeInOut, lerp, mark } from './judges.ts';

export type TasteMode = 'intro' | 'objective' | 'subjective';
export type TasteScaleProps = { mode: TasteMode; marks?: number[] };

export const ZERO_Y = 1000;
export const PPX = 5.5;
export const GROUP_X = [180, 480, 780];
export const BAR_W = 66;

export function frameState(props: TasteScaleProps, t: number, beats: number[], dur: number) {
  const { T, p } = clock(t, dur);
  const m = (i: number, fb = 0) => mark(props.marks, i, beats, fb);
  const mode = props.mode;
  const intro = mode === 'intro';
  const obj = mode === 'objective';
  const subj = mode === 'subjective';
  const wobble = 2.2 * Math.sin(Math.min(T, 1e4) * 2.4);
  // Answer key: drops on the right pan (objective), stays, then dissolves into a cloud (subjective).
  const keyDrop = obj ? easeOutCubic(p(m(0, 0.8), 0.45)) : subj ? 1 : 0;
  const cloud = subj ? easeOutCubic(p(m(0, 0.8) - 0.1, 0.6)) : 0;
  const tiltKey = obj ? -11 * easeInOut(p(m(0, 0.8) + 0.35, 0.6)) : subj ? -11 : 0;
  const tiltTaste = subj ? easeInOut(p(m(0, 0.8) + 0.35, 0.9)) : 0;
  const tilt = intro ? wobble * easeOutCubic(p(0.4, 0.5)) : lerp(tiltKey, 16, tiltTaste);
  const morph = subj ? easeOutCubic(p(m(0, 0.8) - 0.2, 0.4)) : 0;
  const grow = (g: number, j: number): number => {
    if (g === 0) return obj ? easeOutCubic(p(m(1, 1.8) + j * 0.15, 0.55)) : subj ? 1 : 0;
    if (!subj) return 0;
    if (g === 1) return easeOutCubic(p(m(0, 0.8) + 0.25 + j * 0.12, 0.55));
    return easeOutCubic(p(m(1, 1.8) + j * 0.12, 0.55));
  };
  const groups = BIAS.map((vals, g) => ({ bars: vals.map((v, j) => ({ value: v, grow: grow(g, j) })) }));
  // The highlighted level follows the narration.
  let focus = intro ? 0 : obj ? 0 : 0;
  let focusIn = intro ? 0 : 1;
  if (subj) focus = lerp(0, 2, easeInOut(p(m(0, 0.8) + 0.2, 1.2)));
  if (obj) focusIn = easeOutCubic(p(0.05, 0.4));
  return {
    chip: intro ? easeOutCubic(p(0.05, 0.35)) : 1,
    scale: intro ? easeOutCubic(p(0.15, 0.45)) : 1,
    cards: intro ? easeOutCubic(p(0.35, 0.4)) : 1,
    /** Code cards (0) → message cards (1). */
    morph,
    own: obj || subj ? easeOutCubic(p(0.1, 0.4)) : 0,
    tilt,
    keyDrop,
    cloud,
    chart: intro ? easeOutCubic(p(m(0, 0.6), 0.45)) : 1,
    arrow: intro ? easeOutCubic(p(m(1, 1.6), 0.5)) : 1,
    focus,
    focusIn,
    groups,
    harder: obj ? easeOutCubic(p(m(1, 1.8) + 0.8, 0.4)) : subj ? 1 : 0,
  };
}
