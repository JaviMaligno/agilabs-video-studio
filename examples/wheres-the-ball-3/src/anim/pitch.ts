// Shared, pure pitch helpers for every scene of this video: the real Metrica play (sampling,
// velocities, the velocity-weighted centroid and the other hand-written features), the stylised
// mini-pitch situations (a tangled ball, a loose ball, a ring of players around a hole) and the
// frame boxes the pitches are drawn in. Visuals are illustrative; no number here reaches the
// screen as a figure. No Remotion or React here.

export type PlayData = {
  hz: number;
  pitch: [number, number];
  /** Per frame: flat [x0, y0, x1, y1, ...] in metres, 11 players each. */
  home: number[][];
  away: number[][];
  /** Per frame: [x, y] in metres. */
  ball: number[][];
};

export type Pt = { x: number; y: number };
export type Vel = { vx: number; vy: number };
export type View = { x0: number; x1: number; y0: number; y1: number };
export type Box = { left: number; top: number; w: number; h: number };

export const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;
export const fin = (x: number, d = 0): number => (Number.isFinite(x) ? x : d);

/** The real play: the attacking half and a bit, where this sequence happens (metres). */
export const VIEW_FULL: View = { x0: 34, x1: 107, y0: 8, y1: 64 };
/** A shallower crop of the same play, for scenes that need room under the pitch. */
export const VIEW_HALF: View = { x0: 34, x1: 107, y0: 12, y1: 58 };

/** Frame boxes (vertical 1080x1920), all inside the stage and clear of the question band. */
export const BOX: Record<'full' | 'half' | 'miniL' | 'miniR', Box> = {
  /** The full pitch: scenes on the real play. */
  full: { left: 40, top: 450, w: 1000, h: Math.round((1000 * (VIEW_FULL.y1 - VIEW_FULL.y0)) / (VIEW_FULL.x1 - VIEW_FULL.x0)) },
  /** The shallow pitch, with a panel under it. */
  half: { left: 40, top: 430, w: 1000, h: Math.round((1000 * (VIEW_HALF.y1 - VIEW_HALF.y0)) / (VIEW_HALF.x1 - VIEW_HALF.x0)) },
  /** Two stylised mini-pitches side by side. */
  miniL: { left: 60, top: 470, w: 465, h: 520 },
  miniR: { left: 555, top: 470, w: 465, h: 520 },
};

/** Mini-pitch coordinates, in metres. */
export const VIEW_MINI: View = { x0: 0, x1: 31, y0: 0, y1: 34.7 };

/** Positions at play second `p`, interpolated between frames and clamped to the data. */
export function sample(data: PlayData, p: number) {
  const n = data.ball.length;
  const f = Math.min(n - 1, Math.max(0, fin(p) * data.hz));
  const i = Math.floor(f);
  const j = Math.min(n - 1, i + 1);
  const k = f - i;
  const mix = (a: number[], b: number[]) => a.map((v, q) => lerp(v, b[q], k));
  const toXY = (flat: number[]) => Array.from({ length: flat.length / 2 }, (_, q) => ({ x: flat[2 * q], y: flat[2 * q + 1] }));
  return {
    home: toXY(mix(data.home[i], data.home[j])),
    away: toXY(mix(data.away[i], data.away[j])),
    ball: { x: lerp(data.ball[i][0], data.ball[j][0], k), y: lerp(data.ball[i][1], data.ball[j][1], k) },
  };
}

/** Length of the play, in seconds. */
export const playSeconds = (data: PlayData): number => (data.ball.length - 1) / data.hz;

/** Velocity of each player (home then away) at play second `p`, central difference over 0.5 s. */
export function velocities(data: PlayData, p: number): Vel[] {
  const span = playSeconds(data);
  const a = Math.max(0, Math.min(span, fin(p) - 0.25));
  const b = Math.max(0, Math.min(span, fin(p) + 0.25));
  const dt = Math.max(1e-6, b - a);
  const s0 = sample(data, a);
  const s1 = sample(data, b);
  const p0 = [...s0.home, ...s0.away];
  const p1 = [...s1.home, ...s1.away];
  return p0.map((q, i) => ({ vx: (p1[i].x - q.x) / dt, vy: (p1[i].y - q.y) / dt }));
}

/** The velocity-weighted centroid: the average position, fast players counting more. */
export function weightedCentroid(pos: Pt[], vel: Vel[]): Pt {
  let w = 0;
  let x = 0;
  let y = 0;
  pos.forEach((q, i) => {
    const v = vel[i] ?? { vx: 0, vy: 0 };
    const s = Math.hypot(v.vx, v.vy) + 0.2;
    w += s;
    x += q.x * s;
    y += q.y * s;
  });
  return w > 0 ? { x: x / w, y: y / w } : { x: 52.5, y: 34 };
}

export const centroid = (pos: Pt[]): Pt => {
  if (!pos.length) return { x: 0, y: 0 };
  return { x: pos.reduce((a, q) => a + q.x, 0) / pos.length, y: pos.reduce((a, q) => a + q.y, 0) / pos.length };
};

/** Players of one frame of the play, with their speed, and only those inside `view` (the keeper far away drops out). */
export function playersAt(data: PlayData, p: number, view: View = VIEW_FULL) {
  const s = sample(data, p);
  const vel = velocities(data, p);
  const all = [...s.home, ...s.away].map((q, i) => ({ ...q, ...vel[i], i, team: i < s.home.length ? 0 : 1, speed: Math.hypot(vel[i].vx, vel[i].vy) }));
  const inView = all.filter((q) => Number.isFinite(q.x) && Number.isFinite(q.y) && q.x >= view.x0 - 2 && q.x <= view.x1 + 2 && q.y >= view.y0 - 2 && q.y <= view.y1 + 2);
  return { players: inView, all, ball: s.ball };
}

/**
 * The article's hand-written features, as points on the pitch (illustrative): the centroid, the
 * speed-weighted centroid, the fastest player, the densest cluster, each team's spread, the
 * closest pair of opponents and a "convergence point" where the running lines meet.
 */
export function features(pos: (Pt & Vel & { team: number })[]) {
  const vel = pos.map((q) => ({ vx: q.vx, vy: q.vy }));
  const centre = centroid(pos);
  const weighted = weightedCentroid(pos, vel);
  let fastest: Pt = centre;
  let top = -1;
  for (const q of pos) {
    const s = Math.hypot(q.vx, q.vy);
    if (s > top) {
      top = s;
      fastest = { x: q.x, y: q.y };
    }
  }
  // Densest cluster: the player with most neighbours within 9 m, and the mean of that group.
  let dense: Pt = centre;
  let best = -1;
  for (const q of pos) {
    const near = pos.filter((o) => Math.hypot(o.x - q.x, o.y - q.y) < 9);
    if (near.length > best) {
      best = near.length;
      dense = centroid(near);
    }
  }
  const spreadOf = (team: number) => {
    const ps = pos.filter((q) => q.team === team);
    const c = centroid(ps);
    const rx = ps.length ? Math.sqrt(ps.reduce((a, q) => a + (q.x - c.x) ** 2, 0) / ps.length) : 0;
    const ry = ps.length ? Math.sqrt(ps.reduce((a, q) => a + (q.y - c.y) ** 2, 0) / ps.length) : 0;
    return { x: c.x, y: c.y, rx: Math.max(2, rx), ry: Math.max(2, ry) };
  };
  // Closest pair of opponents and its midpoint.
  let pair: [Pt, Pt] = [centre, centre];
  let dmin = Infinity;
  for (const a of pos) for (const b of pos) {
    if (a.team !== 0 || b.team !== 1) continue;
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < dmin) {
      dmin = d;
      pair = [{ x: a.x, y: a.y }, { x: b.x, y: b.y }];
    }
  }
  // Convergence point: least-squares meeting point of the running lines of the faster players.
  const runners = pos.filter((q) => Math.hypot(q.vx, q.vy) > 1.5);
  let conv: Pt = weighted;
  if (runners.length >= 2) {
    let a11 = 0;
    let a12 = 0;
    let a22 = 0;
    let b1 = 0;
    let b2 = 0;
    for (const q of runners) {
      const n = Math.hypot(q.vx, q.vy);
      const ux = q.vx / n;
      const uy = q.vy / n;
      // Projector onto the normal of the running line.
      const m11 = 1 - ux * ux;
      const m12 = -ux * uy;
      const m22 = 1 - uy * uy;
      a11 += m11;
      a12 += m12;
      a22 += m22;
      b1 += m11 * q.x + m12 * q.y;
      b2 += m12 * q.x + m22 * q.y;
    }
    const det = a11 * a22 - a12 * a12;
    if (Math.abs(det) > 1e-6) {
      const x = (a22 * b1 - a12 * b2) / det;
      const y = (a11 * b2 - a12 * b1) / det;
      // Kept on the visible pitch: it is a stylised marker.
      conv = { x: Math.min(100, Math.max(40, x)), y: Math.min(60, Math.max(12, y)) };
    }
  }
  return {
    centre,
    weighted,
    fastest,
    dense,
    spread: [spreadOf(0), spreadOf(1)],
    pair,
    closest: { x: (pair[0].x + pair[1].x) / 2, y: (pair[0].y + pair[1].y) / 2 },
    convergence: conv,
  };
}

// ── Stylised situations (mini-pitches and the topology ring). Positions in metres.

export type Dot = Pt & Vel & { team: number };

/**
 * A tangled ball: players closing in on it from every side, their running lines pointing at it.
 * `k` in [0, 1] is how far the play has run.
 */
export function tangled(k: number): { players: Dot[]; ball: Pt } {
  const ball = { x: 15.5, y: 17.5 };
  const n = 9;
  const players: Dot[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + 0.35;
    const r0 = 11 + (i % 3) * 1.6;
    const r = lerp(r0, r0 * 0.55, Math.min(1, Math.max(0, fin(k))));
    const speed = 3 + (i % 4);
    return {
      x: ball.x + Math.cos(a) * r,
      y: ball.y + Math.sin(a) * r,
      vx: -Math.cos(a) * speed,
      vy: -Math.sin(a) * speed,
      team: i % 2,
    };
  });
  return { players, ball };
}

/**
 * A loose ball: the ball runs ahead into open space, the players trail behind it, running after
 * it. `k` in [0, 1] is how far the play has run.
 */
export function loose(k: number): { players: Dot[]; ball: Pt } {
  const kk = Math.min(1.5, Math.max(0, fin(k)));
  const ball = { x: lerp(11, 20, kk), y: lerp(25, 10, kk) };
  const base: [number, number, number][] = [
    [6, 29, 0],
    [11, 31, 1],
    [16, 30, 0],
    [21, 31.5, 1],
    [9, 23, 1],
    [14, 25, 0],
    [19, 25.5, 1],
    [24, 27, 0],
    [4, 33, 1],
  ];
  const players: Dot[] = base.map(([x, y, team], i) => {
    const vx = (ball.x - x) * 0.18;
    const vy = -4 - (i % 3);
    return { x: x + lerp(0, 5, kk) * (i % 2 ? 0.8 : 1), y: y - lerp(0, 7.5, kk), vx, vy, team };
  });
  return { players, ball };
}

/** The topology picture: a ring of players around an empty hole, and a few others around it. */
export const RING = (() => {
  const hole = { x: 73, y: 35, r: 9.5 };
  const ring: Pt[] = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - 0.3;
    const r = hole.r + 2.4 + (i % 2) * 1.6;
    return { x: hole.x + Math.cos(a) * r * 1.15, y: hole.y + Math.sin(a) * r };
  });
  const others: Pt[] = [
    { x: 46, y: 22 },
    { x: 50, y: 44 },
    { x: 57, y: 15 },
    { x: 92, y: 18 },
    { x: 96, y: 50 },
    { x: 88, y: 58 },
    { x: 55, y: 56 },
  ];
  return { hole, ring, others };
})();
