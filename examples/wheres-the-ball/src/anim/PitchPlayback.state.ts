// Pure state of the PitchPlayback scene: a real Metrica tracking sequence on a top-down pitch,
// with per-scene overlays (hidden ball, AI guesses, the 60 kB net, velocity arrows, the
// velocity-weighted centroid, the still ball). Visuals are illustrative, chosen for impact;
// the numbers on screen come from the articles. No Remotion or React here.
import type { Label } from '../types.ts';
import { frameState as counterState } from './Counter.state.ts';
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type PlayData = {
  hz: number;
  pitch: [number, number];
  /** Per frame: flat [x0, y0, x1, y1, ...] in metres, 11 players each. */
  home: number[][];
  away: number[][];
  /** Per frame: [x, y] in metres. */
  ball: number[][];
};

export type Mode = 'hidden' | 'guess' | 'reveal' | 'net' | 'arrows' | 'centroid' | 'still' | 'quote';

export type PitchCounter = {
  value: number;
  suffix?: string;
  label: Label;
  /** Beat the count starts on, plus `delay` seconds. */
  beat?: number;
  delay?: number;
  /** Flip a coin next to the number ("a coin flip"). */
  coin?: boolean;
  /** Accent gradient for the number (else plain text colour). */
  accent?: boolean;
};

export type PitchProps = {
  mode: Mode;
  /** Play seconds shown at the scene start and at its end (linear in between). */
  play: [number, number];
  counter?: PitchCounter;
  chip?: Label;
  quote?: { text: Label; emphasis?: string[] };
};

/** Fixed AI guess markers (metres): near the middle of the action, the camera-centre bias. */
export const GUESSES = [
  { label: 'GPT', x: 66, y: 41 },
  { label: 'Opus', x: 73, y: 31 },
  { label: 'Sonnet', x: 59, y: 34 },
] as const;

/** How far ahead an arrow points, in seconds of running. */
export const ARROW_SECONDS = 1.6;

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

/** Velocity of each player (home then away) at play second `p`, central difference over 0.5 s. */
export function velocities(data: PlayData, p: number) {
  const span = data.ball.length / data.hz;
  const a = Math.max(0, Math.min(span, p - 0.25));
  const b = Math.max(0, Math.min(span, p + 0.25));
  const dt = Math.max(1e-6, b - a);
  const s0 = sample(data, a);
  const s1 = sample(data, b);
  const p0 = [...s0.home, ...s0.away];
  const p1 = [...s1.home, ...s1.away];
  return p0.map((q, i) => ({ vx: (p1[i].x - q.x) / dt, vy: (p1[i].y - q.y) / dt }));
}

/** The velocity-weighted centroid: the average position, fast players counting more. */
export function weightedCentroid(pos: { x: number; y: number }[], vel: { vx: number; vy: number }[]) {
  let w = 0;
  let x = 0;
  let y = 0;
  pos.forEach((q, i) => {
    const s = Math.hypot(vel[i].vx, vel[i].vy) + 0.2;
    w += s;
    x += q.x * s;
    y += q.y * s;
  });
  return w > 0 ? { x: x / w, y: y / w } : { x: 52.5, y: 34 };
}

export function frameState(p: PitchProps, time: number, beats: number[], dur: number, data: PlayData) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const [from, to] = p.play;
  const playT = lerp(from, to, clamp01(t / d));
  const s = sample(data, playT);
  const vel = velocities(data, playT);
  const pos = [...s.home, ...s.away];
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 1.5;
  const mode = p.mode;

  // Arrows: how long they are drawn (0..1) and how visible.
  let grow = 0;
  if (mode === 'arrows') grow = easeOutCubic(progress(t, fit(b0 + 0.3, 1.2, d), 1.2));
  if (mode === 'centroid') grow = 1 - easeOutCubic(progress(t, fit(b0 + 0.4, 1.4, d), 1.4)) * 0.75;
  if (mode === 'still') grow = 1 - easeOutCubic(progress(t, fit(b0 + 0.2, 2.2, d), 2.2));

  const players = pos.map((q, i) => {
    const speed = Math.hypot(vel[i].vx, vel[i].vy);
    return {
      x: q.x,
      y: q.y,
      team: i < s.home.length ? 0 : 1,
      speed,
      /** 0..1: fast players brighter. */
      bright: clamp01((speed - 1) / 5),
      ax: q.x + vel[i].vx * ARROW_SECONDS * grow,
      ay: q.y + vel[i].vy * ARROW_SECONDS * grow,
    };
  });

  // The ball: hidden, revealed with a glow, or simply shown.
  let ballOpacity = 1;
  let glow = 0;
  if (mode === 'hidden' || mode === 'guess' || mode === 'arrows') ballOpacity = 0;
  if (mode === 'reveal') {
    ballOpacity = progress(t, fit(0.25, 0.2, d), 0.2);
    glow = 1 - progress(t, fit(0.25, 1.4, d), 1.4);
  }

  // "?" pulsing: over the middle of the action while the ball is hidden, over the still ball later.
  const pulse = 0.5 + 0.5 * Math.sin((fin(time) * 2 * Math.PI) / 1.1);
  let qOpacity = 0;
  let qx = 70;
  let qy = 22;
  if (mode === 'hidden') qOpacity = progress(t, fit(0.2, 0.4, d), 0.4);
  if (mode === 'guess') qOpacity = 1 - progress(t, fit(b1, 0.5, d), 0.5) * 0.6;
  if (mode === 'still') {
    qOpacity = progress(t, fit(b1, 0.5, d), 0.5);
    qx = s.ball.x;
    qy = s.ball.y - 8;
  }

  // AI guess markers: drop in on beat 2 of the guess scene; scatter once the ball is revealed.
  const guesses = GUESSES.map((g, i) => {
    let drop = 0;
    let scatter = 0;
    if (mode === 'guess') drop = easeOutCubic(progress(t, fit(b1 + 0.2 + i * 0.25, 0.5, d), 0.5));
    if (mode === 'reveal') {
      drop = 1;
      scatter = easeOutCubic(progress(t, fit(0.6 + i * 0.1, 0.7, d), 0.7));
    }
    const dx = g.x - s.ball.x;
    const dy = g.y - s.ball.y;
    const n = Math.hypot(dx, dy) || 1;
    return {
      label: g.label,
      x: g.x + (dx / n) * 7 * scatter + (i - 1) * 2 * scatter,
      y: g.y + (dy / n) * 7 * scatter,
      drop,
      opacity: drop * (1 - 0.6 * scatter),
      scatter,
    };
  });

  // The 60 kB net: appears off the ball and snaps onto it.
  let net = { x: 0, y: 0, opacity: 0, snap: 0, ring: 0 };
  if (mode === 'net') {
    const appear = progress(t, fit(b0 + 0.2, 0.3, d), 0.3);
    const snap = easeOutCubic(progress(t, fit(b0 + 0.8, 0.6, d), 0.6));
    net = {
      x: lerp(s.ball.x - 18, s.ball.x, snap),
      y: lerp(s.ball.y + 16, s.ball.y, snap),
      opacity: appear,
      snap,
      ring: snap >= 1 ? clamp01(0.5 + 0.5 * Math.sin((fin(time) * 2 * Math.PI) / 1.3)) : 0,
    };
  }

  // Velocity-weighted centroid: converges, glides onto the ball (centroid), wanders (still).
  let centroid = { x: 0, y: 0, opacity: 0, land: 0, converge: 0 };
  const c = weightedCentroid(pos, vel);
  if (mode === 'centroid') {
    const converge = easeOutCubic(progress(t, fit(b0 + 0.3, 1.0, d), 1.0));
    const land = easeOutCubic(progress(t, fit(b0 + 1.5, 1.6, d), 1.6));
    centroid = { x: lerp(c.x, s.ball.x, land), y: lerp(c.y, s.ball.y, land), opacity: converge, land, converge };
    ballOpacity = progress(t, fit(b0 + 2.9, 0.3, d), 0.3);
    glow = ballOpacity * (1 - progress(t, fit(b0 + 3.2, 1.2, d), 1.2));
  }
  if (mode === 'still') {
    const w = fin(time);
    centroid = {
      x: c.x + 6 * Math.sin(w * 1.3) + 3 * Math.sin(w * 2.9),
      y: c.y + 5 * Math.cos(w * 1.1),
      opacity: 0.85,
      land: 0,
      converge: 1,
    };
  }

  const counter = p.counter
    ? (() => {
        const start = fit(beatAt(beats, p.counter.beat ?? 0) + (p.counter.delay ?? 0), 1.2, d);
        const cs = counterState({ value: p.counter.value, suffix: p.counter.suffix, label: p.counter.label }, t, [start], dur);
        return {
          text: cs.text,
          finalText: cs.finalText,
          appear: cs.appear,
          progress: cs.progress,
          /** Coin angle in turns. */
          flip: p.counter.coin ? Math.max(0, fin(t) - start) * 1.6 : 0,
        };
      })()
    : null;

  return {
    playT,
    players,
    ball: { x: s.ball.x, y: s.ball.y, opacity: ballOpacity, glow },
    question: { x: qx, y: qy, opacity: qOpacity, pulse },
    guesses,
    net,
    centroid,
    arrows: { grow, opacity: mode === 'arrows' || mode === 'centroid' || mode === 'still' ? 1 : 0 },
    counter,
    /** Pitch dimming under an overlay (counter or quote), 0..1. */
    dim: mode === 'quote' ? 0.72 : counter ? 0.82 * counter.appear : 0,
    chip: { opacity: p.chip ? progress(t, fit(0.2, 0.4, d), 0.4) : 0 },
  };
}
