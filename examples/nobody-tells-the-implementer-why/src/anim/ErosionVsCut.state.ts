// Pure state of the ErosionVsCut scene: the telephone game (a reason blurring a little at every
// desk) beside what the runs showed (the reason sharp at every desk, then cut once at the last).
// An illustration of the contrast the article draws; no numbers. No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type ErosionProps = Record<string, never>;

/** The reason on every row, and how much of it the telephone column loses per desk. */
export const REASON = 'because the mobile app stopped updating last_login';
export const ROWS = 4;

/** Deterministic letter dropout: at level k, which characters of REASON are lost (as '·'). */
export const eroded = (level: number): string => {
  const rate = [0, 0.14, 0.3, 0.5][Math.max(0, Math.min(3, level))];
  return REASON.split('')
    .map((ch, i) => {
      if (ch === ' ') return ch;
      const h = Math.abs(Math.sin((i + 1) * 12.9898 + 78.233) * 43758.5453) % 1;
      return h < rate ? '·' : ch;
    })
    .join('');
};

export function frameState(_p: ErosionProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 2.4;
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);
  return {
    headers: easeOutCubic(P(Math.max(0, b0 - 0.2), 0.4)),
    rows: Array.from({ length: ROWS }, (_, k) => ({ appear: easeOutCubic(P(b0 + 0.2 + k * 0.45, 0.35)), blur: k * 1.6 })),
    scissors: easeOutCubic(P(b1 - 0.3, 0.3)) * (1 - P(b1 + 0.7, 0.3)),
    open: 1 - P(b1 + 0.05, 0.12),
    fall: P(b1 + 0.17, 0.9),
    cutLine: P(b1 + 0.17, 0.25),
  };
}
