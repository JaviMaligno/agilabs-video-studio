// Pure state of the ReportWall scenes: three columns of 18 report slots, one per episode of the
// capability matrix, filled top to bottom in bucket order (named the problem or its doubt → a false
// "published" → a blank report → no report). Buckets exactly as the article's table:
// Opus 18/0/0/0, Sonnet 16/1/0/1, Haiku 0/14/1/3. Card order inside a bucket means nothing, and
// the wall does not break buckets out by cell. No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type WallMode = 'wall' | 'number';
export type WallProps = { mode: WallMode; blend?: boolean };
export type SlotKind = 'named' | 'false' | 'blank' | 'empty';

export const MODELS = [
  { name: 'Opus 5', price: '$1.62', buckets: { named: 18, false: 0, blank: 0, empty: 0 }, figure: '18' },
  { name: 'Sonnet 5', price: '$0.97', buckets: { named: 16, false: 1, blank: 0, empty: 1 }, figure: '16' },
  { name: 'Haiku 4.5', price: '$0.21', buckets: { named: 0, false: 14, blank: 1, empty: 3 }, figure: '0' },
] as const;

export const SLOTS = 18;
export const COLS_X = [160, 480, 800] as const;
export const GRID = { top: 300, cw: 82, ch: 62, gx: 10, gy: 10, per: 3 } as const;

/** The 18 slots of a column, in bucket order. */
export const slotsOf = (b: { named: number; false: number; blank: number; empty: number }): SlotKind[] => [
  ...Array<SlotKind>(b.named).fill('named'),
  ...Array<SlotKind>(b.false).fill('false'),
  ...Array<SlotKind>(b.blank).fill('blank'),
  ...Array<SlotKind>(b.empty).fill('empty'),
];

const pulse = (t: number, start: number, len: number) => {
  const p = progress(t, start, len);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};

export function frameState(p: WallProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 && Number.isFinite(beats[1]) ? beats[1] : b0 + 3.7;
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));
  const wall = p.mode === 'wall';

  const columns = MODELS.map((m, ci) => {
    const kinds = slotsOf(m.buckets);
    return {
      name: m.name,
      price: m.price,
      head: wall ? E(0.05 * ci, 0.3) : 1,
      slots: kinds.map((kind, i) => ({ kind, appear: wall ? E(b0 + 0.1 + i * 0.07 + 0.03 * ci, 0.2) : 1 })),
      priceIn: wall ? E(b1 + 0.1 + 0.2 * ci, 0.3) : 1,
    };
  });
  const sonnetFalse = slotsOf(MODELS[1].buckets).indexOf('false');
  const ring = wall ? E(b0 + 2.1, 0.3) : 1;
  const ringPulse = wall ? pulse(t, fit(b0 + 2.1, 0.9, dur), 0.9) : 0;

  if (wall) {
    return {
      columns,
      sonnetFalse,
      ring,
      ringPulse,
      legend: E(b0 + 1.5, 0.4),
      bracket: E(b1 + 1.3, 0.35),
      dimWall: 0,
      label: 0,
      figures: [0, 0, 0],
      footnote: 0,
      underline: 0,
    };
  }
  return {
    columns,
    sonnetFalse,
    ring: 1 - E(b0, 0.4),
    ringPulse: 0,
    legend: 1 - E(b0, 0.4),
    bracket: 1 - E(b0, 0.4),
    dimWall: E(b0, 0.45),
    label: E(b0 + 0.3, 0.35),
    figures: [E(b0 + 2.45, 0.3), E(b0 + 3.0, 0.3), E(b0 + 4.25, 0.3)],
    footnote: E(b1 + 0.15, 0.35),
    underline: E(b1 + 2.3, 0.35),
  };
}

export type WallState = ReturnType<typeof frameState>;
