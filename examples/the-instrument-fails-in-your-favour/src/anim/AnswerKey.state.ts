// Pure state of case 3, the reference. One phase per narration beat:
//   0 an external report: accuracy 54% over 500 companies; the gauge points at 54%
//   1 the answer key unrolls (fictional companies): the giveaway word in each name lights up and
//     an arrow jumps from it straight to the label
//   2 the gauge's lid lifts: three magnets, each a "−": order-sensitive, blind to compatible
//     codes, all-or-nothing; nothing on the other side
//   3 the magnets come out, the needle swings up into a band 75%-85%, "~20 points"
// No Remotion or React here.
import { sceneTime } from './steps.ts';
import { ease, fillBeats, lerp } from './gauge.ts';

export type AnswerKeyProps = {
  /** Indices of beats that continue the previous line (no phase of their own). */
  cont?: number[];
};

/** Fictional rows: [before, giveaway, after, label]. */
export const ROWS: [string, string, string, string][] = [
  ['Northgate ', 'Logistics', '', 'Transport'],
  ['Brightfield ', 'Solar', '', 'Energy'],
  ['', 'JRK', ' Holdings', 'General services'],
];
export const FLAWS = ['order-sensitive', 'blind to compatible codes', 'all-or-nothing'] as const;
export const MAGNET_AT = [0.1, 0.27, 0.44] as const;
export const REPORTED = 0.54;
export const BAND = { from: 0.75, to: 0.85 } as const;
export const SETTLED = 0.8;

export type AnswerKeyState = {
  tag: number;
  report: number;
  key: number;
  rows: { show: number; tell: number; jump: number }[];
  flaws: number[];
  lift: number;
  magnets: { opacity: number; out: number; minus: number; glow: number }[];
  value: number;
  band: number;
  bracket: number;
  after: number;
  gauge: number;
};

export function frameState(props: AnswerKeyProps, t0: number, beats: number[], dur: number): AnswerKeyState {
  const t = sceneTime(t0, dur);
  const skip = props.cont ?? [];
  const b = fillBeats(beats.filter((_, i) => !skip.includes(i)), [3.6, 3.8, 4.2, 3.0], dur);
  const outAt = b[3] + 0.1;
  return {
    tag: ease(t, -0.2, 0.4),
    report: ease(t, b[0] - 0.1, 0.4) * (1 - ease(t, b[1] - 0.2, 0.35)),
    key: ease(t, b[1] - 0.05, 0.35) * (1 - ease(t, b[2] - 0.15, 0.35)),
    rows: ROWS.map((_, i) => ({
      show: ease(t, b[1] + 0.1 + i * 0.35, 0.3),
      tell: ease(t, b[1] + 1.2 + i * 0.45, 0.25),
      jump: ease(t, b[1] + 1.35 + i * 0.45, 0.4),
    })),
    flaws: FLAWS.map((_, i) => ease(t, b[2] + 0.5 + i * 0.7, 0.3)),
    lift: ease(t, b[2] + 0.1, 0.4) * (1 - ease(t, outAt + 0.9, 0.4)),
    magnets: MAGNET_AT.map((_, i) => ({
      opacity: 1,
      out: ease(t, outAt + i * 0.12, 0.5),
      minus: ease(t, b[2] + 0.55 + i * 0.7, 0.3),
      glow: ease(t, b[2] + 0.5 + i * 0.7, 0.3),
    })),
    value: lerp(lerp(0.5, REPORTED, ease(t, b[0], 0.6)), SETTLED, ease(t, outAt + 0.45, 0.8)),
    band: ease(t, outAt + 0.5, 0.5),
    bracket: ease(t, outAt + 1.1, 0.4),
    after: t >= outAt + 0.7 ? 1 : 0,
    gauge: ease(t, b[0] + 0.2, 0.4),
  };
}
