// Pure state of the HoleTest scenes: the topology test.
// - ring: players frozen on the pitch; the biggest empty hole shades in, lines join the players
//   around it into a ring, and a "ball?" marker drops into the hole (scene 10);
// - rule: the same picture, dimmed, with the rule card pinned over it: "Topology only counts if
//   it beats geometry.", set before the run (scene 11);
// - contrast: two mini-pitches. Left, the ring and its hole: no ball there. Right, the arrows and
//   the weighted marker sitting on the ball (scene 13).
// Illustrative: no persistence diagrams. No Remotion or React here.
import { beatAt, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { RING, tangled, weightedCentroid, type Pt } from './pitch.ts';
import { markAt } from './PitchPlayback.state.ts';

export type HoleMode = 'ring' | 'rule' | 'contrast';
export type HoleTestProps = { mode: HoleMode; marks?: number[]; layout?: string };

/** The ring picture on a mini-pitch (metres in VIEW_MINI). */
export const MINI_RING = (() => {
  const hole = { x: 15.5, y: 17, r: 5.2 };
  const ring: Pt[] = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - 0.4;
    const r = hole.r + 1.6 + (i % 2) * 1.1;
    return { x: hole.x + Math.cos(a) * r, y: hole.y + Math.sin(a) * r };
  });
  const others: Pt[] = [
    { x: 5, y: 5 },
    { x: 26, y: 6 },
    { x: 27, y: 30 },
    { x: 4, y: 29 },
  ];
  return { hole, ring, others };
})();

export function frameState(p: HoleTestProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const b0 = beatAt(beats, 0);
  const m0 = fit(markAt(p.marks, 0, b0 + 1), 0.6, d);
  const m1 = fit(markAt(p.marks, 1, m0 + 1), 0.6, d);
  const m2 = fit(markAt(p.marks, 2, m1 + 0.4), 0.6, d);
  const mode = p.mode;

  const players = [...RING.ring, ...RING.others].map((q, i) => ({ x: q.x, y: q.y, team: i % 2 }));
  const ring = mode === 'ring';
  const hole = ring ? easeOutCubic(progress(t, m0 - 0.1, 0.6)) : mode === 'rule' ? 1 : 0;
  const lines = ring ? easeOutCubic(progress(t, m1 - 0.1, 0.7)) : mode === 'rule' ? 1 : 0;
  const ballQ = ring ? easeOutCubic(progress(t, fit(m2 + 0.3, 0.5, d), 0.5)) : mode === 'rule' ? 1 : 0;
  const dim = mode === 'rule' ? 0.55 * progress(t, m0 - 0.2, 0.5) : 0;
  const card = mode === 'rule' ? easeOutCubic(progress(t, m0 - 0.1, 0.5)) : 0;
  const underline = mode === 'rule' ? easeOutCubic(progress(t, m1, 0.6)) : 0;

  // Contrast: left = shape (a hole, no ball); right = movement (marker on the ball).
  const T = tangled(1);
  const wc = weightedCentroid(T.players, T.players.map((q) => ({ vx: q.vx, vy: q.vy })));
  const contrast = mode === 'contrast';
  const left = {
    appear: contrast ? progress(t, 0.1, 0.4) : 0,
    focus: contrast ? progress(t, m0 - 0.3, 0.4) * (1 - 0.6 * progress(t, m1 - 0.3, 0.4)) : 0,
    no: contrast ? easeOutCubic(progress(t, m0 + 0.4, 0.4)) : 0,
    hole: MINI_RING.hole,
    players: [...MINI_RING.ring, ...MINI_RING.others].map((q, i) => ({ x: q.x, y: q.y, team: i % 2 })),
    ring: MINI_RING.ring,
  };
  const land = contrast ? easeOutCubic(progress(t, m1 - 0.2, 0.9)) : 0;
  const right = {
    appear: left.appear,
    focus: contrast ? progress(t, m1 - 0.3, 0.4) : 0,
    yes: contrast ? easeOutCubic(progress(t, m1 + 0.7, 0.4)) : 0,
    players: T.players,
    ball: T.ball,
    arrows: contrast ? easeOutCubic(progress(t, m1 - 0.4, 0.7)) : 0,
    marker: { x: wc.x + (T.ball.x - wc.x) * land, y: wc.y + (T.ball.y - wc.y) * land, opacity: contrast ? progress(t, m1 - 0.2, 0.4) : 0 },
  };

  return { mode, players, ringPts: RING.ring, holeC: RING.hole, hole, lines, ballQ, dim, card, underline, left, right };
}
