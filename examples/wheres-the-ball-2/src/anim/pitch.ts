// The series' pitch, shared by StoryPitch (part 1's real Metrica sequence) and CameraFlip:
// sampling the tracking data and placing the "?" clear of every player. Pure: no Remotion, no React.
// Taken from part 1's PitchPlayback.state.ts.

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

/** Visible part of the pitch for the story scenes, in metres: the attacking half and a bit. */
export const VIEW = { x0: 34, x1: 107, y0: 0, y1: 68 };

/** The "?" marker: diameter in metres (drawn at pitch scale). */
export const Q_SIZE = 12;
/** Player dot radius (metres) plus a little air. */
const DOT_CLEAR = 2.2;

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const fin = (x: number, d = 0) => (Number.isFinite(x) ? x : d);

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

/**
 * The spot nearest `prefer` where the "?" (pulsing up to 10 % larger) covers no player dot and no
 * obstacle and stays inside the visible pitch, at every play second of `span`. When no spot is
 * clear the whole time, the one with the most room. Candidates on a 1 m grid.
 */
export function clearSpot(data: PlayData, span: [number, number], prefer: Pt, obstacles: { x: number; y: number; r: number }[] = []): Pt {
  const R = (Q_SIZE / 2) * 1.1;
  const times: number[] = [];
  for (let t = span[0]; t <= span[1] + 1e-9; t += 0.1) times.push(t);
  if (!times.length) times.push(span[0]);
  const frames = times.map((t) => {
    const s = sample(data, t);
    return [...s.home, ...s.away].filter((q) => Number.isFinite(q.x) && Number.isFinite(q.y));
  });
  let best: { q: Pt; room: number; dist: number } | null = null;
  for (let x = Math.ceil(VIEW.x0 + R); x <= VIEW.x1 - R; x += 1) {
    for (let y = Math.ceil(VIEW.y0 + R); y <= VIEW.y1 - R; y += 1) {
      let room = Infinity;
      for (const ps of frames) for (const o of ps) room = Math.min(room, Math.hypot(o.x - x, o.y - y) - R - DOT_CLEAR);
      for (const o of obstacles) room = Math.min(room, Math.hypot(o.x - x, o.y - y) - R - o.r);
      const dist = Math.hypot(x - prefer.x, y - prefer.y);
      const clear = room >= 0;
      const better =
        !best || (clear && best.room < 0) || (clear && best.room >= 0 && dist < best.dist) || (!clear && best.room < 0 && room > best.room);
      if (better) best = { q: { x, y }, room, dist };
    }
  }
  return best ? best.q : prefer;
}

const spots = new Map<string, Pt>();
/** clearSpot, memoised per span and preference (it scans the whole grid). */
export const cachedSpot = (data: PlayData, span: [number, number], prefer: Pt, obstacles: { x: number; y: number; r: number }[] = []): Pt => {
  const key = `${span}|${prefer.x},${prefer.y}|${obstacles.map((o) => `${o.x},${o.y},${o.r}`).join(';')}`;
  const hit = spots.get(key);
  if (hit) return hit;
  const q = clearSpot(data, span, prefer, obstacles);
  spots.set(key, q);
  return q;
};
