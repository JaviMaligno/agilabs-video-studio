// Pure jigsaw geometry for the PuzzleChat scenes: piece outlines as SVG path strings.
// No Remotion or React here, so it can be tested with plain `node --test`.

/** Pieces per side of every puzzle in the video. */
export const N = 4;

/** Edge amplitudes of one piece, clockwise from the top: +1 tab out, -1 blank in, 0 flat border. */
export type Edges = [number, number, number, number];

/** Deterministic tab direction of the internal edge with index k (0/1 hash, never all the same). */
const sign = (k: number): number => ((Math.sin(k * 12.9898 + 4.1414) * 43758.5453) % 1 + 1) % 1 > 0.5 ? 1 : -1;

/** Edges of piece (r, c) of an N x N puzzle; neighbours always interlock. */
export function edgesOf(r: number, c: number, n = N): Edges {
  // Horizontal internal edge below row r at column c: index r*n + c. Vertical right of column c at row r: 100 + r*n + c.
  const below = (rr: number, cc: number) => sign(rr * n + cc);
  const right = (rr: number, cc: number) => sign(100 + rr * n + cc);
  const top = r === 0 ? 0 : -below(r - 1, c);
  const bottom = r === n - 1 ? 0 : below(r, c);
  const left = c === 0 ? 0 : -right(r, c - 1);
  const rgt = c === n - 1 ? 0 : right(r, c);
  return [top, rgt, bottom, left];
}

// One edge from (0,0) to (1,0); local y < 0 is outward when the amplitude is positive.
// Each entry is a cubic: [c1x, c1y, c2x, c2y, x, y] with y in units of the amplitude.
const KNOB: number[][] = [
  [0.2, 0, 0.36, 0, 0.4, 0],
  [0.43, 0, 0.44, -0.06, 0.41, -0.11],
  [0.36, -0.2, 0.42, -0.27, 0.5, -0.27],
  [0.58, -0.27, 0.64, -0.2, 0.59, -0.11],
  [0.56, -0.06, 0.57, 0, 0.6, 0],
  [0.64, 0, 0.8, 0, 1, 0],
];

const f = (n: number) => (Math.round(n * 100) / 100).toString();

/**
 * Outline of a piece whose cell is the rectangle (x, y, w, h), as an SVG path (absolute coords).
 * Amplitudes may be fractional (a carved piece morphs between shapes); 0 is a straight edge.
 */
export function piecePath(x: number, y: number, w: number, h: number, e: Edges): string {
  const corners = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  const outward = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  let d = `M${f(x)},${f(y)}`;
  for (let side = 0; side < 4; side++) {
    const [px, py] = corners[side];
    const [qx, qy] = corners[(side + 1) % 4];
    const [nx, ny] = outward[side];
    const a = Number.isFinite(e[side]) ? e[side] : 0;
    // Knob size follows the shorter cell side so knobs stay round.
    const k = Math.min(w, h);
    const map = (u: number, v: number) => [px + u * (qx - px) - v * a * k * nx, py + u * (qy - py) - v * a * k * ny];
    for (const [c1x, c1y, c2x, c2y, ex, ey] of KNOB) {
      const p1 = map(c1x, c1y);
      const p2 = map(c2x, c2y);
      const p3 = map(ex, ey);
      d += ` C${f(p1[0])},${f(p1[1])} ${f(p2[0])},${f(p2[1])} ${f(p3[0])},${f(p3[1])}`;
    }
  }
  return `${d} Z`;
}

/** Cell rectangle of piece (r, c) in a puzzle of side `size` at (x, y). */
export const cellOf = (x: number, y: number, size: number, r: number, c: number, n = N) => {
  const s = size / n;
  return { x: x + c * s, y: y + r * s, w: s, h: s };
};
