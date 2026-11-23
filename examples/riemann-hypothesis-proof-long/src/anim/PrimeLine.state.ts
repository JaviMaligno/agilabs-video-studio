// PrimeLine — chapter 1 "What was claimed" on the blackboard (rows 6-9, scene `claimed`).
// Eight lines, eight beats:
//   0 "1859" chalk-written, "the most famous open problem"
//   1 "167 years", the prize medal and "$1,000,000"
//   2 a number line 1..100, the primes lighting up left to right
//   3 dive to "near 1,000,000": "about 1 in 14 is prime"
//   4 the window 1,000,000-1,001,000, the guess as evenly spaced marks, "expected: 72"
//   5 the real primes pop in, "actual: 75"
//   6 (on "the hypothesis is about how far off") count vs guess over 0..1,000,000, the gap a ribbon
//   7 the √x bound drawn under it, "drift: at most ≈ √x"
// Pure numbers (no Remotion or React), checked by test/PrimeLine.test.ts. Primes come from a sieve.
import { beatAt, clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type PrimeLineProps = { mode: 'claimed' | string };

// ---------------------------------------------------------------------------------------------
// Data, computed once and deterministic.

export const WINDOW_START = 1_000_000;
export const WINDOW_END = 1_001_000;
export const CHART_MAX = 1_000_000;
/** Samples of the drift curve across [0, CHART_MAX]. */
export const CHART_SAMPLES = 240;

const SIEVE_N = WINDOW_END;
const composite = new Uint8Array(SIEVE_N + 1);
composite[0] = 1;
composite[1] = 1;
for (let i = 2; i * i <= SIEVE_N; i++) {
  if (!composite[i]) for (let j = i * i; j <= SIEVE_N; j += i) composite[j] = 1;
}
export const isPrime = (n: number): boolean => Number.isInteger(n) && n >= 2 && n <= SIEVE_N && !composite[n];

/** Primes on the first number line, 1..100. */
export const SMALL_PRIMES: number[] = Array.from({ length: 100 }, (_, i) => i + 1).filter(isPrime);
/** The primes in the window after a million (the article: "there are 75"). */
export const WINDOW_PRIMES: number[] = [];
for (let n = WINDOW_START; n <= WINDOW_END; n++) if (isPrime(n)) WINDOW_PRIMES.push(n);
/** The guess: a thousand numbers, one in ln(1,000,000) prime (the article: "gives 72"). */
export const EXPECTED = Math.round((WINDOW_END - WINDOW_START) / Math.log(WINDOW_START));
export const ACTUAL = WINDOW_PRIMES.length;

/**
 * The drift li(x) - pi(x) at CHART_SAMPLES + 1 evenly spaced x in [0, CHART_MAX] (0 below 2),
 * with li by the trapezoid rule from li(2) = 1.0451637801.
 */
export const DRIFT: number[] = (() => {
  const out: number[] = [0];
  const step = CHART_MAX / CHART_SAMPLES;
  let li = 1.0451637801;
  let pi = 1; // pi(2)
  let next = step;
  for (let n = 2; n < CHART_MAX; n++) {
    li += (1 / Math.log(n) + 1 / Math.log(n + 1)) / 2;
    if (isPrime(n + 1)) pi++;
    if (n + 1 >= next) {
      out.push(li - pi);
      next += step;
    }
  }
  while (out.length < CHART_SAMPLES + 1) out.push(out[out.length - 1]);
  return out;
})();
export const DRIFT_MAX = Math.max(...DRIFT);
/** √x at the right end of the chart. */
export const SQRT_MAX = Math.sqrt(CHART_MAX);

// ---------------------------------------------------------------------------------------------

const fin = (x: number, d = 0): number => (Number.isFinite(x) ? x : d);

export function frameState(p: PrimeLineProps, time: number, beats: number[], dur: number) {
  void p;
  const t = sceneTime(time, dur);
  /** Ambient clock: keeps running, finite, never jumps. */
  const T = Number.isFinite(time) ? Math.max(0, Math.min(time, 1e5)) : 0;
  const d = Number.isFinite(dur) && dur > 0 ? dur : 0;
  // Beats, kept in order; a missing beat follows the previous one.
  const raw = [0.2, 4, 8, 13, 17, 21, 23, 28];
  const b: number[] = [];
  for (let i = 0; i < 8; i++) {
    const v = i < beats.length && Number.isFinite(beats[i]) ? beatAt(beats, i) : i === 0 ? raw[0] : b[i - 1] + (raw[i] - raw[i - 1]);
    b.push(Math.max(i ? b[i - 1] : 0, v));
  }
  // Every step starts early enough to finish by the scene end.
  const at = (s: number, len: number) => (d > 0 ? Math.min(s, Math.max(0, d - len)) : s);
  const pr = (s: number, len: number) => progress(t, at(s, len), len);

  // 0-1: the date, the problem, the prize. The chapter card covers the first ~1.8 s.
  const write = pr(Math.max(b[0], 1.7), 1.1);
  const famous = pr(Math.max(b[0] + 1.5, 2.4), 0.5);
  const shift = easeOutCubic(pr(b[1] + 0.2, 0.9));
  const years = pr(b[1] + 0.6, 0.6);
  const medal = easeOutCubic(pr(b[1] + 2.2, 0.6));
  const prize = pr(b[1] + 2.5, 0.5);
  const introOut = pr(b[2] - 0.1, 0.5);

  // 2: the number line and its primes.
  const lineDraw = easeOutCubic(pr(b[2] + 0.1, 1.1));
  const litStart = b[2] + 1.6;
  const litLen = Math.max(0.5, Math.min(3.6, b[3] - litStart - 0.6));
  const small = SMALL_PRIMES.map((n) => ({ n, pop: clamp01(pr(litStart + ((n - 2) / 98) * litLen, 0.35)) }));
  const spread = pr(litStart + litLen + 0.2, 0.5);
  // 3: the dive towards a million.
  const dive = easeOutCubic(pr(b[3], 0.9));
  const near = pr(b[3] + 0.5, 0.5);
  const oneIn14 = pr(b[3] + 1.2, 0.5);
  // 4: the window and the guess.
  const windowOn = easeOutCubic(pr(b[4] + 0.3, 0.8));
  const guessStart = b[4] + 2.2;
  const expectedOn = pr(guessStart, 0.4);
  const expCount = easeOutCubic(pr(guessStart, 1.3));
  const ticks = Array.from({ length: EXPECTED }, (_, k) => ({ x: (k + 0.5) / EXPECTED, pop: clamp01(pr(guessStart + (k / EXPECTED) * 1.2, 0.25)) }));
  // 5: the real primes, counted as they land.
  const realStart = b[5] + 0.05;
  const realLen = Math.max(0.4, Math.min(1.4, b[6] - realStart - 0.15));
  const real = WINDOW_PRIMES.map((n) => {
    const x = (n - WINDOW_START) / (WINDOW_END - WINDOW_START);
    return { x, pop: clamp01(pr(realStart + x * realLen, 0.2)) };
  });
  const landed = real.filter((r) => r.pop > 0.5).length;
  const actualOn = pr(realStart, 0.3);
  // 6: count vs guess. The window holds through "the guess is never exact".
  const chartStart = b[6] + 1.9;
  const windowOut = pr(chartStart - 0.4, 0.5);
  const chart = pr(chartStart, 0.5);
  const ribbon = easeOutCubic(pr(chartStart + 0.4, 2.0));
  // 7: the √x bound; the chart's depth eases out from the drift's scale to √x's.
  const bound = easeOutCubic(pr(b[7] + 0.4, 1.6));
  const sqrtLabel = pr(b[7] + 1.5, 0.5);
  const depth = DRIFT_MAX + (SQRT_MAX - DRIFT_MAX) * bound;

  return {
    T,
    write: clamp01(write),
    famous,
    shift,
    years,
    medal,
    prize,
    introOpacity: clamp01(1 - introOut),
    lineDraw,
    lineOpacity: clamp01(1 - dive),
    dive,
    small,
    spread: clamp01(spread * (1 - dive)),
    near: clamp01(near * (1 - windowOut)),
    oneIn14: clamp01(oneIn14 * (1 - windowOut)),
    windowOn: clamp01(windowOn * (1 - windowOut)),
    expectedOn: clamp01(expectedOn * (1 - windowOut)),
    expectedText: String(Math.round(EXPECTED * expCount)),
    ticks,
    real,
    actualOn: clamp01(actualOn * (1 - windowOut)),
    actualText: String(landed),
    chart,
    ribbon,
    bound,
    sqrtLabel,
    /** Drift units shown over the chart's full depth. */
    depth: fin(depth, DRIFT_MAX),
  };
}
