// Pure state of the PitchPlayback scenes: the real Metrica play on a top-down pitch, ball erased.
// - erase: the ball fades out; short motion trails behind every player (scene 2);
// - net: the 60 kB box slides in; three frontier-AI guesses drop and get crossed out; the box's
//   marker snaps onto the ball's spot (scene 3);
// - verdict: velocity arrows on every player merge into one weighted marker that glides onto the
//   hidden ball; the box opens flat with just that marker inside (scene 19).
// Visuals are illustrative; no figure here reaches the screen. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { VIEW_FULL, VIEW_HALF, fin, lerp, playersAt, weightedCentroid, type PlayData, type Pt } from './pitch.ts';

export type PitchMode = 'erase' | 'net' | 'verdict';

export type PitchProps = {
  mode: PitchMode;
  /** Play seconds at the scene start and end (linear in between); set by timeline.ts for runs. */
  play?: [number, number];
  chip?: string;
  /** Scene seconds of spoken words (timeline.ts resolves them from the TTS timestamps). */
  marks?: number[];
  layout?: string;
};

/** Fixed frontier-AI guess spots (metres): the middle of the action, away from the ball. */
export const GUESSES: Pt[] = [
  { x: 66, y: 41 },
  { x: 74, y: 30 },
  { x: 58, y: 33 },
];

/** How far ahead an arrow points, in seconds of running. */
export const ARROW_SECONDS = 1.6;
/** Trail length, in play seconds. */
export const TRAIL_SECONDS = 0.9;

/** Mark `i`, or `fallback` when the timeline gave none. */
export const markAt = (marks: number[] | undefined, i: number, fallback: number): number => {
  const m = marks?.[i];
  return m !== undefined && Number.isFinite(m) ? m : fallback;
};

export const viewOf = (mode: PitchMode) => (mode === 'verdict' ? VIEW_HALF : VIEW_FULL);

export function frameState(p: PitchProps, time: number, beats: number[], dur: number, data: PlayData) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const [from, to] = p.play ?? [0, 0];
  const playT = lerp(fin(from), fin(to), clamp01(t / d));
  const view = viewOf(p.mode);
  const { players, ball } = playersAt(data, playT, view);
  const b0 = beatAt(beats, 0);
  const m0 = fit(markAt(p.marks, 0, b0 + 0.5), 0.6, d);
  const m1 = fit(markAt(p.marks, 1, m0 + 1.5), 0.6, d);
  const m2 = fit(markAt(p.marks, 2, m1 + 1.2), 0.6, d);
  const mode = p.mode;

  // Trails (erase): where each player was TRAIL_SECONDS ago.
  const past = playersAt(data, playT - TRAIL_SECONDS, view).all;
  const trail = mode === 'erase' ? easeOutCubic(progress(t, m1 - 0.2, 0.8)) : 0;

  // Arrows (verdict): drawn from the first beat; shrink as the marker lands.
  let grow = 0;
  if (mode === 'verdict') grow = easeOutCubic(progress(t, fit(b0 + 0.2, 1.0, d), 1.0)) * (1 - 0.7 * easeOutCubic(progress(t, m1 + 0.6, 1.2)));

  const dots = players.map((q) => {
    const was = past[q.i] ?? q;
    return {
      x: q.x,
      y: q.y,
      team: q.team,
      speed: q.speed,
      bright: clamp01((q.speed - 1) / 5),
      ax: q.x + q.vx * ARROW_SECONDS * grow,
      ay: q.y + q.vy * ARROW_SECONDS * grow,
      tx: lerp(q.x, Number.isFinite(was.x) ? was.x : q.x, trail),
      ty: lerp(q.y, Number.isFinite(was.y) ? was.y : q.y, trail),
    };
  });

  // The ball: visible then erased (erase); hidden (net, until the box finds it); hidden then
  // flashing in under the marker (verdict).
  let ballOpacity = 0;
  let glow = 0;
  if (mode === 'erase') ballOpacity = 1 - progress(t, m0 + 0.2, 0.9);
  if (mode === 'net') {
    ballOpacity = progress(t, fit(m2 + 0.9, 0.3, d), 0.3);
    glow = ballOpacity * (1 - progress(t, fit(m2 + 1.2, 1.2, d), 1.2));
  }

  // Frontier-AI guesses (net): drop on "frontier", crossed out on "couldn't".
  const guesses = GUESSES.map((g, i) => {
    const drop = mode === 'net' ? easeOutCubic(progress(t, m1 + i * 0.18, 0.45)) : 0;
    const cross = mode === 'net' ? easeOutCubic(progress(t, m2 + i * 0.12, 0.35)) : 0;
    return { x: g.x, y: g.y, drop, cross, opacity: drop * (1 - 0.35 * cross) };
  });

  // The box (net): slides in on "tiny"; its marker snaps from the box onto the ball after "couldn't".
  const boxIn = mode === 'net' ? easeOutCubic(progress(t, m0 - 0.1, 0.6)) : 0;
  const snap = mode === 'net' ? easeOutCubic(progress(t, fit(m2 + 0.35, 0.6, d), 0.6)) : 0;
  const net = { x: lerp(ball.x - 16, ball.x, snap), y: lerp(ball.y + 12, ball.y, snap), opacity: mode === 'net' ? progress(t, m2 + 0.3, 0.2) : 0, snap };

  // Weighted marker (verdict): rays converge, then the marker glides onto the ball.
  const c = weightedCentroid(players, players.map((q) => ({ vx: q.vx, vy: q.vy })));
  let marker = { x: c.x, y: c.y, opacity: 0, converge: 0, land: 0 };
  let lid = 0;
  if (mode === 'verdict') {
    const converge = easeOutCubic(progress(t, m0 - 0.2, 0.9));
    const land = easeOutCubic(progress(t, m0 + 0.6, 1.4));
    marker = { x: lerp(c.x, ball.x, land), y: lerp(c.y, ball.y, land), opacity: converge, converge, land };
    ballOpacity = progress(t, fit(m0 + 1.9, 0.3, d), 0.3);
    glow = ballOpacity * (1 - progress(t, fit(m0 + 2.2, 1.2, d), 1.2));
    lid = easeOutCubic(progress(t, m1 - 0.2, 0.9));
  }

  return {
    playT,
    view,
    players: dots,
    ball: { x: ball.x, y: ball.y, opacity: ballOpacity, glow },
    trail,
    arrows: { grow, opacity: mode === 'verdict' ? 1 : 0 },
    guesses,
    guessTag: mode === 'net' ? guesses[0].drop * (1 - progress(t, m2 + 1.6, 0.5)) : 0,
    box: { appear: boxIn, x: lerp(-260, 0, boxIn) },
    net,
    marker,
    lid,
    /** The "inside: one weighted average" label next to the open box. */
    inside: mode === 'verdict' ? progress(t, m1 + 0.4, 0.5) : 0,
    chip: { opacity: p.chip ? progress(t, fit(0.2, 0.4, d), 0.4) : 0 },
  };
}
