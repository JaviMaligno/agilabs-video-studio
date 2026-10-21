// Pure state of the ReplayCurve scene ("both"): the article's replay chart with both methods.
// The full fine-tuning line is already drawn; LoRA's points land flat on zero, 0 % first ("even
// with no mixing"), then the rest. Line 2: two terminal meters, both ≈0.90.
// No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type CurveProps = { mode?: 'both'; noMixAt?: number };

export type CurveState = {
  appear: number;
  full: number;
  /** Appearance of each LoRA point (0 %, 10 %, 25 %, 50 %). */
  lora: number[];
  loraLabel: number;
  meters: { appear: number; fill: number };
};

const E = (t: number, at: number, len: number) => easeOutCubic(progress(t, at, len));

export function frameState(props: CurveProps, t0: number, beats: number[], dur: number): CurveState {
  const t = sceneTime(t0, dur);
  const b0 = beatAt(beats, 0);
  const raw1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 2.6;
  const b1 = fit(raw1, 0.6, dur);
  const noMix = fit(props.noMixAt ?? b0 + (b1 - b0) * 0.5, 1.2, dur);
  return {
    appear: E(t, 0, 0.4),
    full: E(t, 0.05, 0.4),
    lora: [0, 1, 2, 3].map((i) => E(t, noMix + (i === 0 ? 0 : 0.35 + i * 0.18), 0.3)),
    loraLabel: E(t, noMix + 1.0, 0.3),
    meters: { appear: E(t, b1, 0.4), fill: E(t, b1 + 0.15, 0.7) },
  };
}
