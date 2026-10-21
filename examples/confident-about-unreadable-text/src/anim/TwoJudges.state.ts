// Pure state of the TwoJudges scenes. Modes:
// - agree: two stamp tools over one card. Beat 0, plain text: both stamps land on the same word,
//   a link joins them, and the plain-text kappa bars grow. Beat 1, cipher: the stamps land on
//   different words, the link snaps, the ciphered bars grow and two dip into the shaded
//   "worse than chance" zone. Beat 2: the base model's compliance drop, stamped NOT EVIDENCE.
// - grid: the procedure as a picture (model x condition, each cell checked by two stamps).
//   No values in it.
// Kappas exactly as the article's figure. No Remotion or React here.
import { clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { NO_SLAM, beatOr, slam, type Slam } from './stamp.ts';

export type TwoJudgesMode = 'agree' | 'grid';
export type TwoJudgesProps = { mode: TwoJudgesMode };

/** Inter-judge agreement (Cohen's kappa), as written in the article's figure. */
export const KAPPA = [
  { model: ['GPT-5'], plain: 1.0, cipher: 0.35, plainText: '1.00', cipherText: '0.35' },
  { model: ['Qwen-7B', 'Instruct'], plain: 0.66, cipher: -0.17, plainText: '0.66', cipherText: '−0.17' },
  { model: ['Qwen-7B', 'Base'], plain: 0.74, cipher: -0.05, plainText: '0.74', cipherText: '−0.05' },
] as const;

export type AgreeState = {
  mode: 'agree';
  phase: number;
  tools: { appear: number };
  /** Card content: plain (0) to cipher (1). */
  card: { cipher: number; opacity: number };
  stamps: Slam[];
  link: { draw: number; snap: number };
  bars: { plain: number; cipher: number }[];
  zone: { appear: number };
  verdict: { appear: number; arrow: number; stamp: Slam; focus: number };
};

export type GridState = {
  mode: 'grid';
  head: { appear: number; emphasis: number };
  axes: { appear: number };
  cells: { scan: number; a: Slam; b: Slam; lit: number }[];
};

export type TwoJudgesState = AgreeState | GridState;

export function frameState(props: TwoJudgesProps, t0: number, beats: number[], dur: number): TwoJudgesState {
  const t = sceneTime(t0, dur);
  const b0 = beatOr(beats, 0, 0);

  if (props.mode === 'grid') {
    const cells = Array.from({ length: 6 }, (_, i) => {
      const at = fit(b0 + 1.0 + i * 0.5, 0.9, dur);
      return {
        scan: easeOutCubic(progress(t, at - 0.1, 0.25)),
        a: t >= at ? slam(t, at, 0.15) : NO_SLAM,
        b: t >= at + 0.15 ? slam(t, at + 0.15, 0.15) : NO_SLAM,
        lit: easeOutCubic(progress(t, at + 0.35, 0.3)),
      };
    });
    return {
      mode: 'grid',
      head: { appear: easeOutCubic(progress(t, b0 - 0.1, 0.4)), emphasis: easeOutCubic(progress(t, b0 + 0.9, 0.5)) },
      axes: { appear: easeOutCubic(progress(t, b0 + 0.4, 0.4)) },
      cells,
    };
  }

  const b1 = fit(beatOr(beats, 1, b0 + 3.6), 2.2, dur);
  const b2 = fit(beatOr(beats, 2, b1 + 3.8), 1.8, dur);
  const phase = t >= b2 ? 2 : t >= b1 ? 1 : 0;
  // Stamps: one pair per phase (plain at b0, cipher at b1).
  const pairAt = phase === 0 ? b0 + 0.6 : b1 + 0.5;
  const stamps = [pairAt, pairAt + 0.18].map((at) => (t >= at && phase < 2 ? slam(t, at) : NO_SLAM));
  const bars = KAPPA.map((_, i) => ({
    plain: easeOutCubic(progress(t, b0 + 1.1 + i * 0.25, 0.6)),
    cipher: easeOutCubic(progress(t, b1 + 1.0 + i * 0.3, 0.6)),
  }));
  const vStamp = fit(b2 + 1.3, 0.6, dur);
  return {
    mode: 'agree',
    phase,
    tools: { appear: easeOutCubic(progress(t, b0 - 0.2, 0.4)) },
    card: { cipher: easeOutCubic(progress(t, b1, 0.35)), opacity: 1 - easeOutCubic(progress(t, b2 - 0.1, 0.3)) },
    stamps,
    link: {
      draw: phase === 0 ? easeOutCubic(progress(t, pairAt + 0.35, 0.35)) : 1,
      snap: phase >= 1 ? easeOutCubic(progress(t, b1 + 0.9, 0.35)) : 0,
    },
    bars,
    zone: { appear: easeOutCubic(progress(t, b1 + 1.4, 0.5)) },
    verdict: {
      appear: easeOutCubic(progress(t, b2 + 0.05, 0.4)),
      arrow: easeOutCubic(progress(t, b2 + 0.4, 0.6)),
      stamp: t >= vStamp ? slam(t, vStamp) : NO_SLAM,
      focus: clamp01(easeOutCubic(progress(t, b2, 0.4))),
    },
  };
}
