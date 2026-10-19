// The ring instances drawn in the video. Units are the article's pan units (pan radius R),
// centres relative to the pan centre, y pointing down. Every layout is checked by
// test/geometry.test.ts: rings inside the pan, and every pair either disjoint or one sitting in
// the other's hole. No Remotion or React here.

/** A ring of outer radius r and width w (a disc when w >= r), centred at (x, y). */
export type Ring = { r: number; w: number; x: number; y: number };
export type Layout = { R: number; rings: Ring[] };

/** Contact area of one ring: the annulus, or the disc when the width reaches the centre. */
export const areaOf = (r: number, w: number): number => Math.PI * (r * r - Math.max(0, r - w) ** 2);
export const holeOf = (r: number, w: number): number => Math.max(0, r - w);
export const sumArea = (rings: readonly Pick<Ring, 'r' | 'w'>[]): number => rings.reduce((a, g) => a + areaOf(g.r, g.w), 0);

const ring = (r: number, w: number, x = 0, y = 0): Ring => ({ r, w, x, y });

/**
 * Scene 3, the nest (illustrative): a big ring in the pan, a small enough ring dropping into its
 * hole and sitting flat on the metal.
 */
export const NEST = {
  R: 10,
  big: ring(7, 1.3, 0, 0),
  small: ring(3, 1.3, -1.3, 0.9),
} as const;

/**
 * Scenes 4-6, the minimal divergence (article): pan radius 10, width 1, radii {9.0, 4.2, 4.2, 4.2}.
 * Count: the three 4.2s side by side (N = 3, about 69.7). Area: the 9.0 with one 4.2 in its hole
 * (N = 2, about 76.7).
 */
const D = 5.4; // distance of each 4.2 from the pan centre in the side-by-side triangle
export const DIVERGENCE = {
  R: 10,
  w: 1,
  counter: [9.0, 4.2, 4.2, 4.2],
  count: [ring(4.2, 1, 0, -D), ring(4.2, 1, D * Math.cos(Math.PI / 6), D / 2), ring(4.2, 1, -D * Math.cos(Math.PI / 6), D / 2)],
  area: [ring(9.0, 1, 0, 0), ring(4.2, 1, 1.6, 1.4)],
  /** The article's rounded figures. */
  countSeared: '≈ 69.7',
  areaSeared: '≈ 76.7',
} as const;

/**
 * Scenes 7-8, count is not rescued (article): pan 10, width 4.8, superincreasing radii
 * {9.95, 5.0, 4.3, 0.6}. Greedy: 9.95 with the 5.0 in its hole. Count: 5.0, 4.3, 0.6 in a row.
 */
export const SUPER = {
  R: 10,
  w: 4.8,
  radii: [9.95, 5.0, 4.3, 0.6],
  greedy: [ring(9.95, 4.8, 0, 0), ring(5.0, 4.8, 0, 0)],
  row: [ring(5.0, 4.8, -4.9, 0), ring(4.3, 4.8, 4.4, 0), ring(0.6, 4.8, 9.3, 0)],
} as const;

/**
 * Scene 9, placement does not matter (illustrative superincreasing set, not from the article):
 * R = 10, w = 1, radii {6, 2.8, 1.3, 0.6, 0.25}; 6 > 4.95, 2.8 > 2.15, 1.3 > 0.85, 0.6 > 0.25.
 * Three rules place the same set with different layouts.
 */
export const OBLIVIOUS = {
  R: 10,
  w: 1,
  radii: [6, 2.8, 1.3, 0.6, 0.25],
  tightest: [ring(6, 1, -4, 0), ring(2.8, 1, -2.5, 0.5), ring(1.3, 1, -2.1, 0.6), ring(0.6, 1, -7.5, 0), ring(0.25, 1, -4.0, 0.5)],
  roomiest: [ring(6, 1, -4, 0), ring(2.8, 1, 5.4, 3.0), ring(1.3, 1, 5.6, -3.6), ring(0.6, 1, 8.6, 0.2), ring(0.25, 1, 2.6, -7.6)],
  random: [ring(6, 1, -4, 0), ring(2.8, 1, 5.4, 3.0), ring(1.3, 1, -5.5, -1.5), ring(0.6, 1, 5.9, 2.6), ring(0.25, 1, 2.6, -7.6)],
} as const;

/**
 * Scene 10, the four-ring edge (article): pan 15, width 0.3, radii {10, 5, 4.9, 4.8}; the hole of
 * the 10 is 9.7. Best fit nests the 5 and leaves the 4.8 out (three rings); worst fit puts 10 and 5
 * tangent in the pan and fills the hole with 4.9 + 4.8 (four rings).
 */
export const EDGE = {
  R: 15,
  w: 0.3,
  radii: [10, 5, 4.9, 4.8],
  tightest: [ring(10, 0.3, -5, 0), ring(5, 0.3, -9.7, 0), ring(4.9, 0.3, 10.1, 0)],
  /** Where the refused 4.8 tries to go in the best-fit pan: the rest of the hole, then open metal. */
  refusedTries: [
    [-0.4, 0],
    [4.2, -9.6],
  ] as [number, number][],
  roomiest: [ring(10, 0.3, -5, 0), ring(5, 0.3, 10, 0), ring(4.9, 0.3, -9.8, 0), ring(4.8, 0.3, -0.1, 0)],
} as const;

/** Every final layout, for the geometry test. */
export const LAYOUTS: Record<string, Layout> = {
  nest: { R: NEST.R, rings: [NEST.big, NEST.small] },
  count: { R: DIVERGENCE.R, rings: [...DIVERGENCE.count] },
  area: { R: DIVERGENCE.R, rings: [...DIVERGENCE.area] },
  greedy: { R: SUPER.R, rings: [...SUPER.greedy] },
  row: { R: SUPER.R, rings: [...SUPER.row] },
  tightest: { R: OBLIVIOUS.R, rings: [...OBLIVIOUS.tightest] },
  roomiest: { R: OBLIVIOUS.R, rings: [...OBLIVIOUS.roomiest] },
  random: { R: OBLIVIOUS.R, rings: [...OBLIVIOUS.random] },
  edgeBest: { R: EDGE.R, rings: [...EDGE.tightest] },
  edgeWorst: { R: EDGE.R, rings: [...EDGE.roomiest] },
};

const EPS = 1e-6;

/** Problems with a layout: a ring outside the pan, or two rings overlapping outside a hole. */
export function layoutProblems(l: Layout): string[] {
  const out: string[] = [];
  l.rings.forEach((g, i) => {
    if (Math.hypot(g.x, g.y) + g.r > l.R + EPS) out.push(`ring ${i} (r ${g.r}) leaves the pan`);
  });
  for (let i = 0; i < l.rings.length; i++) {
    for (let j = i + 1; j < l.rings.length; j++) {
      const a = l.rings[i];
      const b = l.rings[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const disjoint = d >= a.r + b.r - EPS;
      const [big, small] = a.r >= b.r ? [a, b] : [b, a];
      const nested = d + small.r <= holeOf(big.r, big.w) + EPS;
      if (!disjoint && !nested) out.push(`rings ${i} (r ${a.r}) and ${j} (r ${b.r}) overlap`);
    }
  }
  return out;
}
