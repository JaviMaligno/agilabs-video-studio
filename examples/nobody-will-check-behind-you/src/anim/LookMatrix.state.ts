// Pure state of the LookMatrix scenes: the mechanism. Thirty runs fall into a 2x2 grid, "opened
// the registry?" x "caught it?". The owner-named arm (15) all land in opened/caught; of the 15
// without an owner, 8 opened and caught it, 7 never opened it and missed it. No counts on the
// diagonal cells (the article never writes 23 or 7): only the two off-diagonal 0 stamps and the
// banner "30 of 30". Mode `adjacent`: the missed runs checked the git tag instead.
// No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Mode = 'look' | 'adjacent';
export type LookMatrixProps = { mode: Mode; blend?: boolean };

export const N = 30;
export const PER_ARM = 15;
export const CAUGHT_WITHOUT = 8;
/** How many of the missed runs are drawn with a link to the tag check ("most", not all). */
export const TAG_LINKS = 5;

/** Cell of run i: column 0 opened / 1 didn't, row 0 caught / 1 missed. Runs 0-14: owner named. */
export const cellOf = (i: number): { col: 0 | 1; row: 0 | 1 } => (i < PER_ARM || i - PER_ARM < CAUGHT_WITHOUT ? { col: 0, row: 0 } : { col: 1, row: 1 });

const pulse = (t: number, start: number, len: number) => {
  const p = progress(t, start, len);
  return p <= 0 || p >= 1 ? 0 : Math.sin(Math.PI * p);
};
const beat = (beats: number[], i: number, fallback: number) => (beats.length > i && Number.isFinite(beats[i]) ? beats[i] : fallback);

export function frameState(p: LookMatrixProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  const E = (start: number, len: number) => easeOutCubic(P(start, len));
  const Pu = (start: number, len: number) => pulse(t, fit(start, len, dur), len);
  const b0 = beatAt(beats, 0);

  if (p.mode === 'adjacent') {
    return {
      view: 'matrix' as const,
      grid: 1,
      dots: Array.from({ length: N }, (_, i) => ({ ...cellOf(i), owner: i < PER_ARM, appear: 1, fall: 1 })),
      zeros: [1, 1],
      zeroFlash: [0, 0],
      banner: 1 - E(b0, 0.4),
      /** The banner fades out in place here (no zoom), so the blend from `look` shows one banner. */
      bannerZoom: 0,
      bannerFlash: 0,
      chip: E(b0 + 1.4, 0.35),
      links: P(b0 + 1.75, 0.6),
      cut: P(b0 + 2.9, 0.35),
      artifact: E(b0 + 2.6, 0.3),
      nothing: E(b0 + 3.1, 0.35),
    };
  }

  const b1 = beat(beats, 1, b0 + 3);
  const b2 = beat(beats, 2, b1 + 1.9);
  const b3 = beat(beats, 3, b2 + 2.1);
  return {
    view: 'matrix' as const,
    grid: E(0, 0.4),
    // Line 1: thirty runs line up; line 2: they fall, owner-named arm first.
    dots: Array.from({ length: N }, (_, i) => ({ ...cellOf(i), owner: i < PER_ARM, appear: E(b0 + 0.15 + i * 0.035, 0.25), fall: P(b1 + 0.1 + i * 0.05, 0.5) })),
    // Lines 3-4: the two off-diagonal cells stamp 0, one per sentence; then the banner.
    zeros: [E(b2 + 0.9, 0.3), E(b3 + 1.1, 0.3)],
    zeroFlash: [Pu(b2 + 1.1, 0.6), Pu(b3 + 1.3, 0.6)],
    banner: E(b3 + 1.7, 0.35),
    bannerZoom: 1,
    bannerFlash: Pu(b3 + 1.95, 0.7),
    chip: 0,
    links: 0,
    cut: 0,
    artifact: 0,
    nothing: 0,
  };
}

export type LookMatrixState = ReturnType<typeof frameState>;
