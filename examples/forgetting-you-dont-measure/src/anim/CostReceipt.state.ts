// Pure state of the CostReceipt scenes: the bill. Two receipts, "Full fine-tuning" and "LoRA",
// "at 0% mixing". Mode "bill" (seven lines, one beat each):
//   0 Instruction-following, full fine-tuning: −37% (0.194 → 0.123)
//   1 Instruction-following, LoRA: +0.033
//   2 a terminal with an unseen command pops above; full fine-tuning's guess is wrong; 0.00
//   3 LoRA: 0.15 (a meter, not a claim this command was solved)
//   4 verdict: stamp "3 COSTS" on the full fine-tuning receipt
//   5 the "one benchmark" lens covers line 1 only; lines 2 and 3 dim
//   6 LoRA: stamp "mostly spared"
// Mode "dial": the trade-off slider between "learn more, forget more" and "learn less, forget less".
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type ReceiptProps = { mode: 'bill' | 'dial' };

export type ReceiptState = {
  mode: 'bill' | 'dial';
  receipts: { appear: number };
  /** Print progress of each line, [full, lora] per line. */
  lines: [number, number][];
  ood: { appear: number; typed: number; guess: number; cross: number; meter: number; exit: number };
  stamp: { full: number; lora: number };
  lens: { appear: number };
  dial: { appear: number; pos: number; tag: number };
};

const E = (t: number, at: number, len: number) => easeOutCubic(progress(t, at, len));

/** Beat i, or a fallback spaced after the previous one, fitted into the scene. */
const beatsOf = (beats: number[], n: number, dur: number, gap = 1.6): number[] => {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const b = beats[i];
    const raw = b !== undefined && Number.isFinite(b) ? b : i === 0 ? 0 : out[i - 1] + gap;
    out.push(fit(raw, 0.5, dur));
  }
  return out;
};

export function frameState(props: ReceiptProps, t0: number, beats: number[], dur: number): ReceiptState {
  const t = sceneTime(t0, dur);
  const mode = props.mode;
  const none = {
    mode,
    receipts: { appear: 0 },
    lines: [
      [0, 0],
      [0, 0],
      [0, 0],
    ] as [number, number][],
    ood: { appear: 0, typed: 0, guess: 0, cross: 0, meter: 0, exit: 0 },
    stamp: { full: 0, lora: 0 },
    lens: { appear: 0 },
    dial: { appear: 0, pos: 0, tag: 0 },
  };
  if (mode === 'dial') {
    const b0 = beatAt(beats, 0);
    // The knob glides from the full fine-tuning end to the LoRA end and settles in between.
    const sweep = clamp01(progress(t, b0 + 0.6, 2.4));
    const pos = 0.15 + 0.7 * Math.sin(Math.PI * 0.5 * sweep) ** 2 - 0.35 * E(t, b0 + 3.0, 0.8);
    return {
      ...none,
      dial: { appear: E(t, b0 - 0.2, 0.45), pos: clamp01(pos), tag: E(t, fit(dur - 2.2, 0.4, dur), 0.4) },
    };
  }
  const b = beatsOf(beats, 7, dur);
  const oodAt = b[2];
  return {
    ...none,
    receipts: { appear: E(t, 0, 0.45) },
    lines: [
      [1, 1],
      [E(t, b[0] + 0.25, 0.4), E(t, b[1] + 0.15, 0.4)],
      [E(t, oodAt + 1.3, 0.4), E(t, b[3] + 0.15, 0.4)],
    ],
    ood: {
      appear: E(t, oodAt - 0.1, 0.35),
      typed: clamp01(progress(t, oodAt + 0.1, 0.6)),
      guess: E(t, oodAt + 0.75, 0.3),
      cross: E(t, oodAt + 1.05, 0.25),
      meter: E(t, b[3] + 0.1, 0.5),
      exit: E(t, b[4] - 0.1, 0.4),
    },
    stamp: { full: E(t, b[4] + 0.2, 0.3), lora: E(t, b[6] + 0.15, 0.3) },
    lens: { appear: E(t, b[5] + 0.1, 0.45) },
  };
}
