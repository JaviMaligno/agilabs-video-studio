// Pure state of the RefusalGate scene: five model chips; a glass wall drawn ON the two Claude
// chips (the model's own refusal) and, later, a separate gate IN FRONT OF the GPT-5 chip (Azure's
// content filter). One phase per narration beat:
//   0 wall        masked cards bounce off the Claude wall, "stop_reason: refusal", ~87%
//   1 plain       the mask comes off; the plain card passes through and Claude answers "Paris"
//   2 legibility  the card slides from words to noise; the wall rises from ~⅓ to close to 100%
//   3 filter      GPT-5: the card is stopped at the filter gate, "400 · jailbreak"
// Wall heights between the two labelled values are illustrative. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { morph, type CipherData, type Glyph } from './glyphs.ts';

export type GateProps = Record<string, never> | { [k: string]: unknown };

export const MODELS = [
  { id: 'opus', label: ['Claude', 'Opus'] },
  { id: 'sonnet', label: ['Claude', 'Sonnet'] },
  { id: 'gpt', label: ['GPT-5'] },
  { id: 'qi', label: ['Qwen-7B', 'Instruct'] },
  { id: 'qb', label: ['Qwen-7B', 'Base'] },
] as const;

/** Legibility strip: the card's cipher as the noise level rises (ends named by the article). */
export const NOISE_STEPS = ['cyrillic_homoglyph', 'morse', 'base64', 'binary'] as const;
/** Wall level at the homoglyph end (~⅓) and at the noise end (close to 100%). */
export const WALL_LOW = 1 / 3;
export const WALL_HIGH = 0.97;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export type GateState = {
  phase: number;
  /** Beat starts used (fallbacks filled in), for drawing. */
  b: number[];
  head: { wall: number; plain: number; legibility: number; filter: number };
  card: {
    /** Glyph slots when the shown text morphs glyph by glyph, else null and `text` is used. */
    glyphs: Glyph[] | null;
    text: string;
    /** 0..1: how much of the text is faded into noise from the right (legibility gradient). */
    fade: number;
    opacity: number;
  };
  /** Small masked cards streaming at the Claude wall (phase 0). */
  stream: { fly: number; bounce: number; opacity: number; target: number }[];
  /** The plain card flying through the wall (phase 1). */
  pass: { fly: number; opacity: number };
  /** Wall over the Claude chips: level 0..1 of its full height; glow on a hit. */
  wall: { appear: number; level: number; flash: number; opacity: number };
  refusal: { pop: number; opacity: number };
  answer: { pop: number; opacity: number };
  figure: { pop: number; opacity: number };
  noise: { slider: number; low: number; high: number; opacity: number };
  filter: { focus: number; gate: number; fly: number; stamp: number };
  /** Per chip: lit (answering) 0..1 and dim 0..1. */
  chips: { lit: number; dim: number }[];
};

const beatsOf = (beats: number[], dur: number): number[] => {
  const out: number[] = [];
  const lens = [3.2, 2.2, 3.2, 3.6];
  for (let i = 0; i < 4; i++) {
    const raw = beats[i] !== undefined && Number.isFinite(beats[i]) ? beats[i] : i === 0 ? beatAt(beats, 0) : out[i - 1] + lens[i - 1];
    out.push(fit(raw, i === 3 ? 2.2 : 1.2, dur));
  }
  return out;
};

export function frameState(_props: GateProps, t0: number, beats: number[], dur: number, data: CipherData): GateState {
  const t = sceneTime(t0, dur);
  const b = beatsOf(beats, dur);
  const phase = t >= b[3] ? 3 : t >= b[2] ? 2 : t >= b[1] ? 1 : 0;
  const plain = data.plain;
  const keyed = data.ciphers.random_substitution ?? plain;

  // Phase windows: in from the beat, out just before the next one.
  const win = (i: number, inLen = 0.35) => {
    const into = easeOutCubic(progress(t, b[i] - (i === 0 ? 0.3 : 0.15), inLen));
    const out = i < 3 ? clamp01(1 - progress(t, b[i + 1] - 0.3, 0.3)) : 1;
    return Math.min(into, out);
  };

  // --- card text per phase ---
  let glyphs: Glyph[] | null = null;
  let text = keyed;
  let fade = 0;
  const slideLen = Math.max(0.6, b[3] - b[2] - 1.3);
  const slider = easeInOut(progress(t, b[2] + 0.7, slideLen));
  if (phase === 0) {
    glyphs = morph(keyed, keyed, 1, t);
  } else if (phase === 1) {
    glyphs = morph(keyed, plain, progress(t, b[1], 0.5), t, 0.5, 4);
  } else if (phase === 2) {
    const k = Math.min(NOISE_STEPS.length - 1, Math.floor(slider * NOISE_STEPS.length * 0.999));
    text = data.ciphers[NOISE_STEPS[k]] ?? keyed;
    fade = slider;
  } else {
    text = keyed;
    glyphs = morph(plain, keyed, progress(t, b[3], 0.4), t, 0.5, 9);
  }
  if (glyphs) text = glyphs.map((g) => g.ch).join('');

  // --- phase 0: three masked cards bounce off the wall ---
  const stream = [0, 1, 2].map((k) => {
    const at = b[0] + 0.15 + k * 0.62;
    const fly = easeIn(progress(t, at, 0.5));
    const bounce = easeOutCubic(progress(t, at + 0.5, 0.55));
    return { fly, bounce, opacity: phase === 0 && t >= at ? clamp01(1 - bounce) : 0, target: k % 2 };
  });
  const hits = stream.map((_, k) => b[0] + 0.65 + k * 0.62);
  const flash0 = Math.max(0, ...hits.map((h) => (t >= h ? clamp01(1 - (t - h) / 0.45) : 0)));

  // --- phase 1: the plain card goes straight through ---
  const passFly = easeIn(progress(t, b[1] + 0.45, 0.55));
  const answerPop = easeOutCubic(progress(t, b[1] + 0.95, 0.35));

  // --- wall level ---
  let level = 0.62;
  if (phase === 2) level = lerp(WALL_LOW, WALL_HIGH, slider);
  // Ease from the resting level into the low end at the start of the legibility phase.
  if (phase === 2) level = lerp(0.62, level, easeOutCubic(progress(t, b[2], 0.4)));
  if (phase === 3) level = lerp(WALL_HIGH, 0.62, easeOutCubic(progress(t, b[3], 0.5)));

  // --- phase 3: filter gate in front of GPT-5 ---
  const focus = easeOutCubic(progress(t, b[3], 0.5));
  const gate = easeOutCubic(progress(t, b[3] + 0.25, 0.45));
  const fly3 = easeIn(progress(t, b[3] + 0.75, 0.55));
  const stamp = easeOutCubic(progress(t, b[3] + 1.3, 0.3));

  const chips = MODELS.map((m, i) => {
    const claude = i < 2;
    const lit = claude && phase === 1 ? answerPop : 0;
    const dim = phase === 3 ? (m.id === 'gpt' ? 0 : focus) : 0;
    return { lit, dim };
  });

  return {
    phase,
    b,
    head: { wall: win(0), plain: win(1), legibility: win(2), filter: win(3) },
    card: { glyphs, text, fade, opacity: phase === 1 ? clamp01(1 - passFly * 1.5) : 1 },
    stream,
    pass: { fly: passFly, opacity: phase === 1 && passFly > 0 ? clamp01(1 - progress(t, b[1] + 0.95, 0.3)) : 0 },
    wall: {
      appear: easeOutCubic(progress(t, b[0] - 0.3, 0.4)),
      level,
      flash: phase === 0 ? flash0 : 0,
      opacity: phase === 1 ? 0.45 : phase === 3 ? lerp(1, 0.55, focus) : 1,
    },
    refusal: { pop: easeOutCubic(progress(t, hits[0] + 0.1, 0.35)), opacity: phase === 0 ? 1 : 0 },
    answer: { pop: answerPop, opacity: phase === 1 ? 1 : 0 },
    figure: { pop: easeOutCubic(progress(t, b[0] + 0.4, 0.5)), opacity: win(0) },
    noise: {
      slider,
      // The "~⅓" label holds while the card still reads as words, then gives way to "close to 100%".
      low: easeOutCubic(progress(t, b[2] + 0.1, 0.35)) * clamp01(1 - (slider - 0.15) * 5),
      high: easeOutCubic(progress(t, b[2] + 0.7 + slideLen * 0.85, 0.35)),
      opacity: win(2),
    },
    filter: { focus, gate, fly: fly3, stamp },
    chips,
  };
}

function easeIn(p: number) {
  return clamp01(p) ** 2;
}
function easeInOut(p: number) {
  const x = clamp01(p);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}
