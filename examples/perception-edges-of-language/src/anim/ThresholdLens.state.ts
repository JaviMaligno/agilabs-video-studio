// Pure state of the ThresholdLens scene: a zoom from the blank 254-on-255 card into a grid of real
// pixel values (a crop of the study's 0.004 render), then a threshold sweep that flips every pixel
// darker than its neighbourhood (254) to pure black, and a zoom back out to a crisp string.
// Illustrative of adaptive binarisation, not Tesseract's exact algorithm. No Remotion or React.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { CANVAS, CARD } from './perception.ts';
import { LENS } from './lens.ts';

export type ThresholdLensProps = Record<string, never>;

export const CELLS: number[][] = LENS.cells;
export const ROWS_N = CELLS.length;
export const COLS_N = CELLS[0]?.length ?? 0;
/** The grid at full zoom (stage coordinates). */
export const GRID = { x: 32, y: 290, cell: 56 } as const;
/** Where the crop sits on the card (stage coordinates). */
export const CROP = {
  x: CARD.x + (LENS.x0 / CANVAS.w) * CARD.w,
  y: CARD.y + (LENS.y0 / CANVAS.h) * CARD.h,
  cell: CARD.w / CANVAS.w,
} as const;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeInOut = (p: number) => {
  const q = clamp01(p);
  return q < 0.5 ? 4 * q * q * q : 1 - (-2 * q + 2) ** 3 / 2;
};

export function frameState(_p: ThresholdLensProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const b0 = beatAt(beats, 0);
  const b1 = beats.length > 1 ? beatAt(beats, 1) : b0 + 2.4;
  const P = (start: number, len: number) => progress(t, fit(start, len, dur), len);

  const zoomIn = easeInOut(P(b0 + 0.2, 1.3));
  const sweep = P(b1 + 0.2, 1.7);
  const zoomOut = easeInOut(P(beats.length > 2 ? beatAt(beats, 2) - 0.1 : b1 + 2.2, 0.9));
  const zoom = clamp01(zoomIn - zoomOut);
  const cell = lerp(CROP.cell, GRID.cell, zoom);
  const x = lerp(CROP.x, GRID.x, zoom);
  const y = lerp(CROP.y, GRID.y, zoom);
  const labels = clamp01((zoom - 0.75) / 0.25);

  const cells = CELLS.flatMap((row, r) =>
    row.map((v, c) => {
      const cx = (c + 0.5) / COLS_N;
      // Each dark cell flips just after the sweep line passes its centre.
      const flip = v < 255 ? clamp01((sweep * 1.08 - cx) / 0.08) : 0;
      return { r, c, value: v, flip, shown: flip > 0.5 ? (v < 255 ? 0 : 255) : v };
    }),
  );
  return {
    zoom,
    /** The grid fades out early in the zoom-out, so it never hangs half-shrunk below the card. */
    gridOpacity: clamp01(1 - zoomOut * 2.5),
    /** The card comes back fully as the grid leaves. */
    cardOpacity: clamp01(1 - 0.95 * zoomIn + zoomOut * 1.6),
    cell,
    x,
    y,
    labels,
    sweep: sweep > 0 && sweep < 1 ? sweep : sweep >= 1 ? 1 : 0,
    sweepOn: sweep > 0 && sweep < 1 ? 1 : 0,
    rule: easeOutCubic(P(b1, 0.5)),
    header: easeOutCubic(P(b0, 0.5)),
    /** The card binarised (crisp black string) once the sweep is done. */
    binarised: easeOutCubic(P(b1 + 1.8, 0.5)),
    cells,
  };
}
