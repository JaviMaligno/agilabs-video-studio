// CriticalLine — the zeta function's zeros on the blackboard (row 10, scene `zeros`). Five lines:
//   0 "ζ" chalk-written large, "zeta function"
//   1 "points where it equals zero": the critical strip (real part 0 to 1) drawn
//   2 the middle line lights up, "the line (real part ½)"
//   3 the first ten zeros drop onto it one by one, "every zero ever computed"
//   4 a dashed pair off the line flickers and fades, "computing can never prove it", "…∞" up the line
// Pure numbers (no Remotion or React), checked by test/CriticalLine.test.ts.
import { beatAt, clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type CriticalLineProps = { mode: 'zeros' | string };

/** Imaginary parts of the first ten nontrivial zeros of ζ. */
export const ZEROS = [14.13, 21.02, 25.01, 30.42, 32.94, 37.59, 40.92, 43.33, 48.01, 49.77];
/** Height of the imaginary axis drawn (top of the strip). */
export const IM_MAX = 54;
/** Where the imagined off-line pair sits: real parts ½ ± OFF_RE, at this height. */
export const OFF_IM = 35.2;
export const OFF_RE = 0.27;

export function frameState(p: CriticalLineProps, time: number, beats: number[], dur: number) {
  void p;
  const t = sceneTime(time, dur);
  const T = Number.isFinite(time) ? Math.max(0, Math.min(time, 1e5)) : 0;
  const d = Number.isFinite(dur) && dur > 0 ? dur : 0;
  const raw = [0.2, 4.1, 6.6, 10.4, 13.3];
  const b: number[] = [];
  for (let i = 0; i < 5; i++) {
    const v = i < beats.length && Number.isFinite(beats[i]) ? beatAt(beats, i) : i === 0 ? raw[0] : b[i - 1] + (raw[i] - raw[i - 1]);
    b.push(Math.max(i ? b[i - 1] : 0, v));
  }
  const at = (s: number, len: number) => (d > 0 ? Math.min(s, Math.max(0, d - len)) : s);
  const pr = (s: number, len: number) => progress(t, at(s, len), len);

  const zeta = easeOutCubic(pr(b[0], 1.3));
  const zetaLabel = pr(b[0] + 2.5, 0.5);
  // ζ steps aside to the left when the strip arrives.
  const aside = easeOutCubic(pr(b[1], 0.8));
  const strip = easeOutCubic(pr(b[1] + 0.3, 1.0));
  const stripLabel = pr(b[1] + 0.9, 0.5);
  const line = easeOutCubic(pr(b[2] + 0.2, 0.9));
  const lineLabel = pr(b[2] + 0.8, 0.5);
  const dropLen = Math.max(0.15, Math.min(0.26, (b[4] - b[3] - 0.9) / ZEROS.length));
  const zeros = ZEROS.map((im, i) => {
    const s = b[3] + 0.15 + i * dropLen;
    const fall = pr(s, 0.45);
    return { im, drop: easeOutCubic(fall), pop: clamp01(pr(s + 0.38, 0.25)) };
  });
  const everyLabel = pr(b[3] + 0.2, 0.5);
  // The off-line pair: flickers in, then fades for good.
  const offIn = pr(b[4] + 0.15, 0.25);
  const offOut = pr(b[4] + 1.5, 0.7);
  const flicker = 0.7 + 0.3 * Math.sin(T * 17) * Math.sin(T * 5.3);
  const off = clamp01(offIn * (1 - offOut) * flicker);
  const neverLabel = pr(b[4] + 0.4, 0.5);
  const infinity = pr(b[4] + 0.9, 0.7);

  return {
    T,
    zeta,
    zetaLabel,
    aside,
    strip,
    stripLabel: clamp01(stripLabel * (1 - lineLabel)),
    line,
    lineLabel: clamp01(lineLabel * (1 - everyLabel)),
    zeros,
    everyLabel,
    offOpacity: off,
    offShown: offIn > 0 && offOut < 1 ? 1 : 0,
    neverLabel,
    infinity,
  };
}
