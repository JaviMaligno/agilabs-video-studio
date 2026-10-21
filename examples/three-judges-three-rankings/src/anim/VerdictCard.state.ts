// Pure state of the verdict card: objective work, close to harmless; subjective work, close to
// unusable. Stage pixels (960 x 1090). No Remotion or React here.
import { easeOutCubic } from './steps.ts';
import { clock, mark } from './judges.ts';

export type VerdictMode = 'objective' | 'subjective';
export type VerdictCardProps = { mode: VerdictMode; marks?: number[] };

export function frameState(props: VerdictCardProps, t: number, beats: number[], dur: number) {
  const { p } = clock(t, dur);
  const m = (i: number, fb = 0) => mark(props.marks, i, beats, fb);
  const obj = props.mode === 'objective';
  return {
    title: obj ? easeOutCubic(p(0.05, 0.4)) : 1,
    sub: obj ? easeOutCubic(p(0.25, 0.4)) : 1,
    left: obj ? easeOutCubic(p(0.4, 0.4)) : 1,
    leftStamp: obj ? easeOutCubic(p(m(0, 2.6) - 0.05, 0.35)) : 1,
    leftText: obj ? easeOutCubic(p(m(0, 2.6) - 0.25, 0.35)) : 1,
    /** The right panel as a dim placeholder until its turn. */
    rightGhost: obj ? easeOutCubic(p(0.6, 0.4)) : 1,
    right: obj ? 0 : easeOutCubic(p(0.05, 0.4)),
    rightStamp: obj ? 0 : easeOutCubic(p(m(0, 1.0) - 0.05, 0.35)),
    rightText: obj ? 0 : easeOutCubic(p(m(0, 1.0) - 0.25, 0.35)),
    foot: obj ? 0 : easeOutCubic(p(m(0, 1.0) + 0.6, 0.4)),
  };
}
