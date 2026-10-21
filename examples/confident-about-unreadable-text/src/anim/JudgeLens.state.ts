// Pure state of the JudgeLens scene: the measurement bug the article describes, drawn as a
// mechanism. A refusal in plain English (redacted lines, its shape readable) drops into a funnel
// marked "cipher", comes out as glyph noise, the judge's window sees noise, and it is stamped
// GARBLED. Three passes, the second and third at double speed, so it reads "by construction".
// Illustrative of the bug, not a replay of real replies. No Remotion or React here.
import { clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { NO_SLAM, beatOr, slam, type Slam } from './stamp.ts';

export type LensProps = Record<string, never> | { [k: string]: unknown };

export type LensPass = {
  /** Reply bar entering at the top. */
  enter: number;
  /** Bar dropping into the funnel (0) and gone inside (1). */
  drop: number;
  /** Noise bar emerging below the funnel. */
  emerge: number;
  /** The judge's window lighting up as it reads. */
  read: number;
  stamp: Slam;
  opacity: number;
};

export type LensState = { passes: LensPass[]; funnel: { appear: number; glow: number }; judge: { appear: number }; tally: { pop: number }[]; tag: { pop: number } };

/** Pass lengths in seconds: one at normal speed, two at 2x. */
export const PASS_LEN = [2.0, 1.0, 1.0];
const GAP = 0.12;

export function frameState(_props: LensProps, t0: number, beats: number[], dur: number): LensState {
  const t = sceneTime(t0, dur);
  const total = PASS_LEN.reduce((a, b) => a + b, 0) + GAP * 2 + 0.6;
  const start = fit(beatOr(beats, 0, 0) + 0.1, total, dur);
  let at = start;
  const starts: number[] = [];
  for (const L of PASS_LEN) {
    starts.push(at);
    at += L + GAP;
  }
  const passes = PASS_LEN.map((L, i) => {
    const s = starts[i];
    const stampAt = s + 0.72 * L;
    const next = starts[i + 1];
    return {
      enter: easeOutCubic(progress(t, s, 0.18 * L)),
      drop: easeIn(progress(t, s + 0.2 * L, 0.22 * L)),
      emerge: easeOutCubic(progress(t, s + 0.42 * L, 0.16 * L)),
      read: clamp01(progress(t, s + 0.55 * L, 0.1 * L)),
      stamp: t >= stampAt ? slam(t, stampAt, 0.16) : NO_SLAM,
      // Each pass gives way to the next; the last one stays.
      opacity: t < s ? 0 : next === undefined ? 1 : clamp01(1 - progress(t, next - 0.05, 0.12)),
    };
  });
  const glow = Math.max(0, ...passes.map((p) => (p.drop > 0 && p.emerge < 1 ? 1 - Math.abs(p.drop - p.emerge) : 0)));
  return {
    passes,
    funnel: { appear: easeOutCubic(progress(t, start - 0.3, 0.35)), glow: clamp01(glow) },
    judge: { appear: easeOutCubic(progress(t, start - 0.2, 0.35)) },
    tally: passes.map((_, i) => ({ pop: easeOutCubic(progress(t, starts[i] + 0.72 * PASS_LEN[i] + 0.1, 0.25)) })),
    tag: { pop: easeOutCubic(progress(t, starts[2] + PASS_LEN[2] + 0.1, 0.4)) },
  };
}

function easeIn(p: number) {
  return clamp01(p) ** 2;
}
