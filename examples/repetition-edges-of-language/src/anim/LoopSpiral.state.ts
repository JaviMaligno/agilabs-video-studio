// LoopSpiral: the base model's reply never closes; its words wind into an inward-turning spiral.
// Modes:
// - table: "table" pours out of the reply bubble, the gauge slams to 99.6%;
// - seeds: "florb" and "you are useless" wind into two spirals, same shape, same speed;
// - stats: one spiral wound from all nine stimuli; three calm aligned replies above it at ~0.10;
//   the spiral's own badge swings to 0.51, then (tighter, faster) to 0.78; p-value tag.
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { spiralWords, type SpiralOpts, type SpiralWord } from './spiral.ts';
import { SEEDS, STIMULI } from './rep.ts';

export type SpiralMode = 'table' | 'seeds' | 'stats';
export type LoopSpiralProps = {
  mode: SpiralMode;
  blend?: boolean;
  /** stats: seconds into the second line when "0.51" and "0.78" are spoken (word timestamps). */
  swing?: [number, number];
};

export type Placed = SpiralWord;
export type Gauge = { value: number; label: string; opacity: number };

export type SpiralState = {
  spirals: { words: Placed[]; label: string; labelOpacity: number; cx: number; cy: number }[];
  gauge: Gauge;
  /** Three aligned replies (stats mode). */
  aligned: { label: string; value: number; opacity: number }[];
  pTag: number;
  bubble: number;
};

const place = (words: string[], o: Omit<SpiralOpts, 'words'>): Placed[] => spiralWords({ ...o, words });

/** Needle overshoot: slams past the value and settles. */
const slam = (q: number): number => {
  const x = clamp01(q);
  return x < 0.6 ? easeOutCubic(x / 0.6) * 1.04 : 1.04 - 0.04 * easeOutCubic((x - 0.6) / 0.4);
};

export const frameState = (p: LoopSpiralProps, t0: number, beats: number[], dur: number): SpiralState => {
  const t = sceneTime(t0, dur);
  const tt = Math.min(t, 1e4);
  const b0 = beatAt(beats, 0);

  if (p.mode === 'table') {
    const grow = easeOutCubic(progress(t, 0, 1.6));
    const at = fit(b0 + 1.3, 0.7, dur);
    const v = slam(progress(t, at, 0.7));
    return {
      spirals: [{ words: place([SEEDS.table], { cx: 480, cy: 650, R: 410, t: tt, grow, perTurn: 8, turns: 3.4 }), label: '', labelOpacity: 0, cx: 480, cy: 650 }],
      gauge: { value: Math.min(1, 0.996 * v), label: v > 0.2 ? '99.6%' : '', opacity: easeOutCubic(progress(t, 0, 0.4)) },
      aligned: [],
      pTag: 0,
      bubble: 1,
    };
  }

  if (p.mode === 'seeds') {
    const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1;
    const g1 = easeOutCubic(progress(t, 0, 1.2));
    const g2 = easeOutCubic(progress(t, fit(Math.min(b0 + 0.9, b1), 1.2, dur), 1.2));
    const o = { R: 232, cy: 560, turns: 2.6, speed: 1.1 };
    return {
      spirals: [
        { words: place([SEEDS.florb], { cx: 245, ...o, t: tt, grow: g1, perTurn: 7 }), label: '“florb”', labelOpacity: g1, cx: 245, cy: o.cy },
        {
          words: place([SEEDS.useless], { cx: 715, ...o, t: tt, grow: g2, perTurn: 4.6 }),
          label: '“you are useless”',
          labelOpacity: g2,
          cx: 715,
          cy: o.cy,
        },
      ],
      gauge: { value: 0, label: '', opacity: 0 },
      aligned: [],
      pTag: 0,
      bubble: 0,
    };
  }

  // stats
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 1.6;
  const [w1, w2] = p.swing ?? [0.9, 3.6];
  const s1 = slam(progress(t, fit(b1 + w1, 0.6, dur), 0.6));
  const s2 = slam(progress(t, fit(b1 + w2, 0.6, dur), 0.6));
  const v = 0.51 * s1 + (0.78 - 0.51) * s2;
  const faster = easeOutCubic(progress(t, fit(b1 + w2 - 0.2, 0.8, dur), 0.8));
  const texts = STIMULI.map((s) => s.text);
  // One spiral wound from all nine stimuli, cycling along it; tighter and faster on "multi-turn".
  const words = place(texts, {
    cx: 390,
    cy: 690,
    R: 330,
    t: tt * (1 + 0.6 * faster),
    turns: 3,
    perTurn: 6,
    tight: 1 + 0.3 * faster,
    maxSize: 52,
  });
  const alignedIn = (i: number) => easeOutCubic(progress(t, fit(b0 + 0.15 + i * 0.15, 0.4, dur), 0.4));
  return {
    spirals: [{ words, label: 'Qwen 7B Base', labelOpacity: 1, cx: 390, cy: 690 }],
    gauge: { value: v, label: s2 > 0.2 ? '0.78' : s1 > 0.2 ? '0.51' : '', opacity: 1 },
    aligned: ['Claude Opus', 'Claude Sonnet', 'Qwen 7B Instruct'].map((label, i) => ({ label, value: 0.1 * alignedIn(i), opacity: alignedIn(i) })),
    pTag: easeOutCubic(progress(t, fit(b1 + w2 + 0.9, 0.5, dur), 0.5)),
    bubble: 0,
  };
};
