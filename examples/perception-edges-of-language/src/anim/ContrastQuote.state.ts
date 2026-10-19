// Pure state of the closing pair: "Don't worry about bit-plane steganography." (the layer stack
// greys out and slides away) and "Worry about contrast." (the 1%-contrast hidden line breathes
// from invisible to readable and back, peaking as "contrast" lands). The breath's peak (~0.3)
// is for the eye; the probe itself was 1%. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { logLerp } from './perception.ts';

export type ContrastQuoteProps = { mode: 'steg' | 'contrast'; play?: [number, number] };

export const BREATH_LOW = 0.01;
export const BREATH_HIGH = 0.3;

export function frameState(p: ContrastQuoteProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const words = p.mode === 'steg' ? ["Don't", 'worry', 'about', 'bit-plane', 'steganography.'] : ['Worry', 'about', 'contrast.'];
  const step = p.mode === 'steg' ? 0.32 : 0.3;
  const shown = words.map((_, i) => easeOutCubic(P(b0 + i * step, 0.3)));
  if (p.mode === 'steg') {
    // The words clear just before the blend into "Worry about contrast.", so the two never overlap.
    const out = Number.isFinite(dur) ? 1 - clamp01((t - (dur - 0.75)) / 0.3) : 1;
    return {
      words,
      shown: shown.map((v) => v * out),
      layers: 1 - easeOutCubic(P(b0 + 0.9, 1.0)),
      strike: easeOutCubic(P(b0 + 1.9, 0.5)),
      card: 0,
      breath: 0,
      ratio: BREATH_LOW,
      emphasis: 0,
    };
  }
  // One slow breath, ~1.6 s, centred on the emphasised word.
  const br = P(b0 + 0.05, 1.7);
  const breath = br <= 0 || br >= 1 ? 0 : (1 - Math.cos(2 * Math.PI * br)) / 2;
  return {
    words,
    shown,
    layers: 0,
    strike: 0,
    card: easeOutCubic(P(0, 0.5)),
    breath,
    ratio: logLerp(BREATH_LOW, BREATH_HIGH, breath),
    emphasis: easeOutCubic(P(b0 + 0.75, 0.4)),
  };
}
