// PrimeBox: "a whole number divisible by many primes cannot be small", drawn on the blackboard.
// A pile of pages shrinks to one chalk line, the sentence is written, then a number becomes a box
// whose lid sits at its size and prime blocks (height ∝ log p) pack in until the lid stops them.
// Chebyshev's factorial box follows, with its slack, and a far more divisible box glows last.
// Pure numbers and strings (no Remotion or React), checked by test/PrimeBox.test.ts.
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type PrimeBoxProps = {
  mode: 'idea' | string;
  /**
   * Scene seconds of the words the steps land on (from the TTS word timings, resolved by the
   * component): sentence, size, only, chebyshev, factorial, first, divisible, exactly. Missing
   * cues fall back to fixed offsets from the line's beat.
   */
  cues?: Partial<Record<string, number>>;
};

/** Primes that fit in the first box, in the order they drop. */
export const BOX_PRIMES = [2, 3, 5, 7, 11];
/** The prime that does not fit and bounces off the lid. */
export const BOUNCER = 13;
/** Factorial box (9! = 2^7 · 3^4 · 5 · 7), in a shuffled drop order. */
export const FACTORIAL_PRIMES = [2, 3, 2, 5, 2, 3, 7, 2, 2, 3, 2, 3, 2];
/** The much more divisible number: many small prime blocks. */
export const DIVISIBLE_PRIMES = [2, 3, 2, 5, 2, 3, 2, 7, 2, 3, 5, 2, 2, 3, 2, 11, 2, 3, 2, 5, 2, 3, 2, 7, 2, 2, 3, 2, 5, 2, 3, 2];

const DROP = 0.45;
const F_GAP = 0.14;
const D_GAP = 0.065;

/** The sentence, as the article writes it, split into three lines for the board. */
export const SENTENCE = ['A whole number', 'divisible by many primes', 'cannot be small.'];
const SENTENCE_WORDS = SENTENCE.join(' ').split(' ').length;

const fin = (x: number, d = 0): number => (Number.isFinite(x) ? x : d);

export function frameState(p: PrimeBoxProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  // Beats, made monotonic, with a fallback for missing ones (0 = scene start).
  const B: number[] = [];
  for (let i = 0; i < 10; i++) {
    const b = beats[i];
    B.push(Math.max(i > 0 ? B[i - 1] : 0, b !== undefined && Number.isFinite(b) ? b : i > 0 ? B[i - 1] : 0));
  }
  const cue = (name: string, fallback: number): number => {
    const c = p.cues?.[name];
    return c !== undefined && Number.isFinite(c) ? c : fallback;
  };
  const ambient = Number.isFinite(time) ? Math.min(Math.max(0, time), 1e6) : 0;

  const shrink = easeOutCubic(progress(t, B[1] + 0.3, 2.2));
  const write = progress(t, B[2], 3.2);
  const toTitle = easeOutCubic(progress(t, B[3], 0.8));
  const tFact = cue('factorial', B[6] + 3.6);
  const factorial = easeOutCubic(progress(t, tFact - 0.2, 0.35));
  const boxB = easeOutCubic(progress(t, B[9] + 0.2, 0.7));

  const tBounce = Math.max(B[4] + 1.0, cue('only', B[4] + 2.2) - 0.5);
  const drops = BOX_PRIMES.map((_, i) => easeOutCubic(progress(t, i < 4 ? B[3] + 0.6 + i * 0.7 : B[4] + 0.4, DROP)));

  return {
    ambient,
    /** The pile of pages: shown, then squashed into one chalk line. */
    pile: clamp01(1 - shrink),
    shrink,
    pileLabel: clamp01(1 - progress(t, B[1] + 1.4, 0.8)),
    /** "one sentence" under the chalk line, until the sentence itself is written. */
    oneSentence: clamp01(progress(t, cue('sentence', B[1] + 2.9) - 0.2, 0.4) * (1 - progress(t, B[2] + 0.6, 0.4))),
    /** The chalk line the pile became; it fades once the sentence goes up as a title. */
    line: clamp01(shrink * (1 - toTitle)),
    /** Words of the sentence written so far (fractional: the last one fades in). */
    words: write * SENTENCE_WORDS,
    big: clamp01(1 - toTitle),
    toTitle,
    title: progress(t, B[3] + 0.3, 0.5),
    box: clamp01(easeOutCubic(progress(t, B[3] + 0.1, 0.6))),
    /** The size mark beside the box ("takes up some of its size"). */
    size: progress(t, cue('size', B[3] + 2.8) - 0.15, 0.5),
    drops,
    /** 0..1 over the bouncer's whole move: fall onto the stack, lid slams, ejected to the floor. */
    bounce: progress(t, tBounce, 1.7),
    bouncerOpacity: clamp01(progress(t, tBounce, 0.15) * (1 - factorial)),
    ceiling: progress(t, B[5] + 0.3, 0.5),
    chebyshev: progress(t, cue('chebyshev', B[6] + 1.3) - 0.1, 0.5),
    /** The first box's blocks give way to the factorial's. */
    factorial,
    fdrops: FACTORIAL_PRIMES.map((_, i) => easeOutCubic(progress(t, tFact + 0.2 + i * F_GAP, 0.35))),
    firstProof: progress(t, cue('first', B[7] + 0.4) - 0.1, 0.5),
    /** The right-hand notes clear for "not divisible enough". */
    notes: clamp01(1 - progress(t, B[8], 0.4)),
    slack: progress(t, B[8] + 0.6, 0.6),
    slackLabel: progress(t, B[8] + 0.8, 0.5),
    boxB,
    ddrops: DIVISIBLE_PRIMES.map((_, i) => easeOutCubic(progress(t, B[9] + 0.6 + i * D_GAP, 0.3))),
    divisible: progress(t, cue('divisible', B[9] + 1.8) - 0.3, 0.5),
    exact: progress(t, cue('exactly', B[9] + 4.2) - 0.9, 0.5),
    glow: progress(t, cue('exactly', B[9] + 4.2) - 1.0, 0.6),
    /** Lid pulse when the bouncer hits it (0 most of the time). */
    lidFlash: fin(Math.sin(Math.PI * progress(t, tBounce + 1.7 * 0.28, 0.45))),
  };
}
