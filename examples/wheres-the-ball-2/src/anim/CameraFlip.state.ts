// Pure state of CameraFlip: why "the ball is near the players" is a trap on TV. A scripted long
// pass on the full pitch: the ball flies ahead, the players trail, and a broadcast frame eases
// after the ball, so on screen the ball sits at one edge and the players' centre at the other.
// A dial then reads the correlation between the players' centre and the ball: −0.58 on screen,
// +0.83 on the pitch (the article's figures). Motion is illustrative; only the two numbers are data.
// Modes, in order: trap, chase, flip, sign. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export const FLIP_MODES = ['trap', 'chase', 'flip', 'sign'] as const;
export type FlipMode = (typeof FLIP_MODES)[number];

export type FlipProps = {
  mode: FlipMode;
  cues?: Record<string, number>;
  blend?: boolean;
};

/** The two readings, as the article writes them. */
export const ON_SCREEN = { value: -0.58, text: '−0.58' };
export const ON_PITCH = { value: 0.83, text: '+0.83' };

/** The camera frame, in metres (16:9). */
export const CAM = { w: 40, h: 22.5 };
/** Play seconds each mode covers (the pass runs from 0.5 to 2.3). */
const PLAY: Record<FlipMode, [number, number]> = { trap: [0, 0.4], chase: [0.4, 4], flip: [4, 4], sign: [4, 4] };

// Ten players: start position (m) and velocity (m/s), all drifting after the pass, trailing it.
const PLAYERS: { x: number; y: number; vx: number; vy: number; team: 0 | 1 }[] = [
  { x: 40, y: 30, vx: 3.4, vy: -0.6, team: 0 },
  { x: 44, y: 38, vx: 3.0, vy: -0.4, team: 0 },
  { x: 37, y: 42, vx: 2.6, vy: -0.8, team: 0 },
  { x: 47, y: 31, vx: 3.8, vy: -0.9, team: 0 },
  { x: 42, y: 25, vx: 3.2, vy: -0.2, team: 0 },
  { x: 49, y: 36, vx: 2.8, vy: -0.5, team: 1 },
  { x: 51, y: 28, vx: 3.3, vy: -0.7, team: 1 },
  { x: 45, y: 44, vx: 2.4, vy: -1.0, team: 1 },
  { x: 53, y: 40, vx: 2.9, vy: -0.6, team: 1 },
  { x: 39, y: 35, vx: 3.1, vy: -0.4, team: 1 },
];

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeInOut = (p: number) => {
  const x = clamp01(p);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
};

/** The scripted play at play second `tau`: players, ball and the camera frame centre. */
export function playAt(tau: number) {
  const T = Number.isFinite(tau) ? Math.max(0, tau) : 0;
  const players = PLAYERS.map((p) => ({ x: p.x + p.vx * T, y: p.y + p.vy * T, team: p.team }));
  const kick = { x: 48.5, y: 32.5 };
  const land = { x: 86, y: 20 };
  const flight = easeOutCubic(progress(T, 0.5, 1.8));
  const roll = progress(T, 2.3, 1.7);
  const ball = {
    x: lerp(kick.x, land.x, flight) + 3 * roll,
    y: lerp(kick.y, land.y, flight) - 0.5 * roll,
  };
  const cx = players.reduce((s, q) => s + q.x, 0) / players.length;
  const cy = players.reduce((s, q) => s + q.y, 0) / players.length;
  // The camera starts on the action and eases after the ball, ending with the ball at its right edge.
  const camStart = { x: 46, y: 34 };
  const camEnd = { x: 89 - CAM.w / 2 + 1.5, y: 28 };
  const chase = easeInOut((T - 0.8) / 2.8);
  const cam = { x: lerp(camStart.x, camEnd.x, chase), y: lerp(camStart.y, camEnd.y, chase) };
  return { players, ball, centroid: { x: cx, y: cy }, cam };
}

const HANDOVER = 0.6;
const at = (m: FlipMode) => FLIP_MODES.indexOf(m);

export function frameState(p: FlipProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const m = at(p.mode);
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 3;
  const cue = (name: string, fallback: number) => {
    const c = p.cues?.[name];
    return c !== undefined && Number.isFinite(c) ? c : fallback;
  };
  const step = (mode: FlipMode, start: number, len: number) => {
    const k = at(mode);
    if (m > k) return 1;
    if (m < k) return 0;
    return progress(t, fit(start, len, d), len);
  };

  // Play clock: steady, easing to rest before the hand-over (the next scene starts where it stops).
  const [from, to] = PLAY[p.mode];
  const u = clamp01(t / Math.max(0.1, d - HANDOVER));
  // The chase starts and ends at rest, so the blends on either side never show the dots twice.
  const tau = lerp(from, to, p.mode === 'chase' ? (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2) : u);
  const s = playAt(tau);

  // The heuristic, as a tag; "a trap" stamps on its word.
  const tag = step('trap', 0.2, 0.4) * (1 - step('flip', b0 - 0.1, 0.4));
  const stamp = easeOutCubic(step('trap', cue('trap', b0 + 2.4), 0.35)) * (1 - step('flip', b0 - 0.1, 0.4));
  // "players' centre": a ring around the centroid, there from the start.
  const ring = step('trap', 0.3, 0.4);

  // The ball shows once it is kicked; the frame draws in as the camera starts to chase.
  const ballOn = m >= at('chase') ? 1 : 0;
  const frameIn = easeOutCubic(step('chase', 0.3, 0.6));
  const labels = step('chase', cue('camera', b0 + 3.4), 0.4);

  // The dial and its two readings.
  const dial = step('flip', b0 - 0.1, 0.5);
  const toScreen = easeOutCubic(step('flip', cue('screen', b0 + 3), 0.8));
  const screenLabel = step('flip', cue('screen', b0 + 3) + 0.2, 0.4);
  const toPitch = easeOutCubic(step('flip', cue('pitch', b1 + 1), 0.9));
  const pitchLabel = step('flip', cue('pitch', b1 + 1) + 0.4, 0.4);
  // The frame lifts away as the reading moves to the pitch.
  const lift = easeOutCubic(step('flip', cue('pitch', b1 + 1) - 0.3, 0.8));
  const needle = toPitch > 0 ? lerp(ON_SCREEN.value, ON_PITCH.value, toPitch) : lerp(0, ON_SCREEN.value, toScreen);

  // The closing line over the pitch.
  const line1 = step('sign', b0 - 0.05, 0.4);
  const line2 = easeOutCubic(step('sign', b0 + 0.35, 0.45));

  return {
    tau,
    players: s.players,
    ball: { x: s.ball.x, y: s.ball.y, opacity: ballOn },
    centroid: { x: s.centroid.x, y: s.centroid.y, opacity: ring },
    cam: { x: s.cam.x, y: s.cam.y, w: CAM.w, h: CAM.h, opacity: frameIn * (1 - lift), lift },
    tag: { opacity: tag },
    stamp: { opacity: stamp },
    labels: { opacity: labels * (1 - lift) },
    dial: { opacity: dial, needle, screen: screenLabel, pitch: pitchLabel, ghost: toPitch },
    sign: { line1, line2, dim: 0.72 * line1 },
  };
}
