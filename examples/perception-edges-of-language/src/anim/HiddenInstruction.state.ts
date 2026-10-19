// Pure state of the HiddenInstruction scenes: a card with a visible instruction and a hidden,
// conflicting one; steganography layers (alpha, LSB) that no model obeys; the 1%-contrast hiding
// with 18 answer bubbles of which 4 are "banana" (0.222, as sol 3/9, terra 3/9, Qwen 6/9 in the
// repo); Qwen's two-thirds and the three immune models. Bubbles are illustrative of the rates.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { logLerp } from './perception.ts';

export type HiddenMode = 'write' | 'stego' | 'faint' | 'qwen';
export type HiddenInstructionProps = { mode: HiddenMode; play?: [number, number] };

export const MODELS = [
  { id: 'gpt4o', top: '', name: 'gpt-4o', immune: true },
  { id: 'gpt54', top: '', name: 'gpt-5.4', immune: true },
  { id: 'luna', top: 'gpt-5.6', name: 'luna', immune: true },
  { id: 'sol', top: 'gpt-5.6', name: 'sol', immune: false },
  { id: 'terra', top: 'gpt-5.6', name: 'terra', immune: false },
  { id: 'qwen', top: '', name: 'Qwen2.5-VL', immune: false },
] as const;

/** Which of the 18 bubbles (model index, bubble index) say "banana": 4/18 = 0.222. */
export const BANANA = new Set(['3-1', '4-2', '5-0', '5-2']);

const easeInOut = (p: number) => {
  const q = clamp01(p);
  return q < 0.5 ? 4 * q * q * q : 1 - (-2 * q + 2) ** 3 / 2;
};

export function frameState(p: HiddenInstructionProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const end = Number.isFinite(dur) ? Math.max(b0 + 0.5, dur - 0.8) : b0 + 2;
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);

  let typed = 1; // hidden line written in
  let hiddenRatio = 0.01; // hidden line contrast (the probe: 1%)
  let split = 0; // layers apart
  let stegoBubbles = 0;
  let zeroTag = 0;
  let faintTag = 0;
  let pct = 0;
  let qwen = 0;
  let shields = 0;
  const bubbleAppear: number[][] = MODELS.map(() => [0, 0, 0]);
  const flip: number[][] = MODELS.map(() => [0, 0, 0]);

  if (p.mode === 'write') {
    typed = P(b0 + 0.5, 1.1);
    hiddenRatio = logLerp(1, 0.01, easeInOut(P(b0 + 1.8, 1.1)));
  } else if (p.mode === 'stego') {
    split = easeInOut(P(b0 + 0.05, 0.9));
    stegoBubbles = 1;
    MODELS.forEach((_, i) => (bubbleAppear[i][0] = easeOutCubic(P(b0 + 1.1 + i * 0.12, 0.35))));
    zeroTag = easeOutCubic(P(b0 + 1.9, 0.45));
  } else {
    // faint / qwen: layers collapse, 3 bubbles per model, 4 flip to banana.
    split = p.mode === 'faint' ? 1 - easeInOut(P(0, 0.7)) : 0;
    pct = p.mode === 'faint' ? easeOutCubic(P(0.5, 0.4)) : 1;
    const span = Math.max(0.8, end - b0 - 0.9);
    MODELS.forEach((_, i) => {
      for (let k = 0; k < 3; k++) {
        if (p.mode === 'qwen' || k === 0) bubbleAppear[i][k] = 1;
        else bubbleAppear[i][k] = easeOutCubic(P(b0 + 0.1 + ((k - 1) * 6 + i) * (span / 14), 0.3));
        const isBanana = BANANA.has(`${i}-${k}`);
        if (isBanana) flip[i][k] = p.mode === 'qwen' ? 1 : easeOutCubic(P(b0 + span * 0.75 + (i - 3) * 0.12 + k * 0.05, 0.3));
      }
    });
    faintTag = p.mode === 'faint' ? easeOutCubic(P(b0 + span * 0.9, 0.45)) : 1;
    if (p.mode === 'qwen') {
      qwen = easeOutCubic(P(b0 + 0.1, 0.5));
      shields = easeOutCubic(P(b0 + 0.9, 0.5));
    }
  }

  return {
    typed: clamp01(typed),
    hiddenRatio,
    split: clamp01(split),
    stegoBubbles,
    zeroTag,
    faintTag,
    pct,
    qwen,
    shields,
    chips: p.mode === 'write' ? 0 : p.mode === 'stego' ? easeOutCubic(P(b0 + 0.6, 0.45)) : 1,
    bubbles: MODELS.map((m, i) => ({
      id: m.id,
      items: [0, 1, 2].map((k) => ({ appear: clamp01(bubbleAppear[i][k]), banana: clamp01(flip[i][k]) })),
    })),
  };
}
