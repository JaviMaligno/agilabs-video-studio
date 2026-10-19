// Hook: one word repeated down the frame on an accelerating cadence; from about the tenth copy the
// letters lose their fill (solid → outline), the last ones blur into a smudge of sound. A counter
// ticks 1 → count. Illustrative of semantic satiation. No Remotion or React here.
import { clamp01, easeOutCubic, progress, sceneTime } from './steps.ts';

export type HollowWordProps = { word?: string; count?: number; /** Seconds the copies take to appear. */ span?: number };

export const ROW = 128;
export const BASE_SIZE = 116;
/** Where the first copy sits (stage y) and where the newest copy settles once the column scrolls. */
export const FIRST_Y = 470;
export const FOCUS_Y = 960;

export type Copy = { y: number; size: number; fill: number; blur: number; spacing: number; opacity: number };

export const appearAt = (i: number, count: number, span: number): number => (count <= 1 ? 0 : span * (i / (count - 1)) ** 0.62);

/** Fill of copy i (0-based): solid for the first ten, outline by the 22nd. */
export const fillOf = (i: number): number => 1 - clamp01((i - 9) / 12);
export const blurOf = (i: number): number => 8 * clamp01((i - 21) / 8);

export const frameState = (p: HollowWordProps, t0: number, _beats: number[], dur: number) => {
  const t = sceneTime(t0, dur);
  const count = Math.max(1, Math.round(p.count ?? 30));
  const span = Math.max(0.1, Math.min(p.span ?? 3.8, Math.max(0.1, dur - 0.6)));
  // The first copy is on screen from frame 0: the hook.
  const appeared = Array.from({ length: count }, (_, i) => (i === 0 ? 1 : progress(t, appearAt(i, count, span), 0.18)));
  // Continuous number of copies, for a smooth scroll.
  const shown = appeared.reduce((a, b) => a + b, 0);
  const scroll = Math.max(0, (shown - 1) * ROW - (FOCUS_Y - FIRST_Y));
  const firstPop = 1 + 0.55 * (1 - easeOutCubic(progress(t, 0.15, 0.45)));
  const copies: Copy[] = appeared.map((a, i) => {
    const y = FIRST_Y + i * ROW - scroll;
    const edge = clamp01((y - 70) / 170) * clamp01((1075 - y) / 110);
    return {
      y,
      size: BASE_SIZE * (i === 0 ? firstPop : 0.7 + 0.3 * easeOutCubic(a)),
      fill: fillOf(i),
      blur: blurOf(i),
      spacing: 0.3 * clamp01((i - 21) / 8),
      opacity: clamp01(a * edge),
    };
  });
  const counter = Math.max(1, appeared.filter((a) => a > 0).length);
  return { copies, counter };
};
