// Pure state of the ConfidenceCloud scenes: the box's prediction drawn as a cloud of guesses whose
// radius is the uncertainty it declares.
// - hook: on the real play, a tight bright cloud ("very sure"); the real ball flashes in far
//   away, a miss line draws, stamp "most sure · most wrong" (scene 1);
// - cloud: one point spreads into a spread of guesses (scene 14);
// - calibration: five bars from most to least confident, error climbing; "corr +0.20" (15);
// - tangled / loose / blindspot: two mini-pitches. Tangled: players close in, the weighted
//   marker lands on the ball, the "hardest?" guess is crossed out (16). Loose: the ball runs
//   ahead, the marker lags, a miss line, "≈ 20% more error" (17). Blind spot: the loose cloud
//   shrinks and brightens while the miss grows; error ↑, confidence ↑ (18).
// Cloud sizes are illustrative; the direction (smaller cloud, bigger miss on loose balls) is the
// article's. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { VIEW_FULL, fin, lerp, loose, playersAt, tangled, weightedCentroid, type PlayData, type Pt } from './pitch.ts';
import { markAt } from './PitchPlayback.state.ts';

export type CloudMode = 'hook' | 'cloud' | 'calibration' | 'tangled' | 'loose' | 'blindspot';

export type CloudProps = {
  mode: CloudMode;
  play?: [number, number];
  marks?: number[];
  layout?: string;
};

/** Error per confidence bin, most confident first (repo quintiles: drawn as heights, never printed). */
export const BINS = [0.078, 0.085, 0.092, 0.1, 0.109];

/** How far the loose play runs on in the blind-spot scene (the ball keeps going). */
export const LOOSE_ON = 1.3;

const MINI_TANGLED_SECONDS = 3.6;
const MINI_LOOSE_SECONDS = 3.6;

const velOf = (ps: { vx: number; vy: number }[]) => ps.map((q) => ({ vx: q.vx, vy: q.vy }));

export function frameState(p: CloudProps, time: number, beats: number[], dur: number, data: PlayData) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 2;
  const m0 = fit(markAt(p.marks, 0, b0 + 1), 0.6, d);
  const m1 = fit(markAt(p.marks, 1, m0 + 1.2), 0.6, d);
  const m2 = fit(markAt(p.marks, 2, m1 + 1.2), 0.6, d);
  const mode = p.mode;

  // ── The real play (hook, cloud).
  const [from, to] = p.play ?? [0, 0];
  const playT = lerp(fin(from), fin(to), clamp01(t / d));
  const real = playersAt(data, playT, VIEW_FULL);
  const players = real.players.map((q) => ({ x: q.x, y: q.y, team: q.team }));
  const wc = weightedCentroid(real.players, velOf(real.players));

  let cloud = { x: 0, y: 0, r: 0, opacity: 0, bright: 0 };
  let point = { x: 0, y: 0, opacity: 0 };
  let ball = { x: real.ball.x, y: real.ball.y, opacity: 0, glow: 0 };
  let miss = 0;
  let sureTag = 0;
  let stamp = 0;
  let spreadTag = 0;
  if (mode === 'hook') {
    // A single guess, then it tightens into a small, bright, very sure cloud.
    // On from the first frame: the opening frame is the feed thumbnail.
    const appear = 1;
    const tighten = easeOutCubic(progress(t, m0 - 0.4, 0.9));
    point = { x: wc.x, y: wc.y, opacity: appear * (1 - tighten) };
    cloud = { x: wc.x, y: wc.y, r: lerp(6.5, 2.6, tighten), opacity: appear * tighten, bright: tighten };
    sureTag = tighten;
    ball.opacity = progress(t, m1 - 0.15, 0.25);
    ball.glow = ball.opacity * (1 - 0.6 * progress(t, m1 + 0.3, 1.2));
    miss = easeOutCubic(progress(t, m1 + 0.05, 0.5));
    stamp = easeOutCubic(progress(t, fit(m1 + 0.35, 0.35, d), 0.35));
  }
  if (mode === 'cloud') {
    const g = { x: real.ball.x - 3.5, y: real.ball.y + 2.5 };
    const spread = easeOutCubic(progress(t, fit(b0 + 0.9, 1.2, d), 1.2));
    point = { x: g.x, y: g.y, opacity: progress(t, 0.1, 0.3) * (1 - spread) };
    cloud = { x: g.x, y: g.y, r: lerp(0.5, 7, spread), opacity: progress(t, fit(b0 + 0.9, 0.3, d), 0.3), bright: 0.3 };
    ball = { ...ball, opacity: 0.9, glow: 0 };
    spreadTag = progress(t, fit(b0 + 0.9, 0.4, d), 0.4);
  }

  // ── Calibration staircase.
  const steps = BINS.map((v, i) => {
    const start = lerp(m0, m1, i / (BINS.length - 1));
    const grow = mode === 'calibration' ? easeOutCubic(progress(t, start, 0.55)) : 0;
    return { value: v, grow, share: v / Math.max(...BINS), cloud: 0.35 + 0.65 * (i / (BINS.length - 1)) };
  });
  const corr = mode === 'calibration' ? progress(t, fit(m1 + 0.5, 0.4, d), 0.4) : 0;
  const weak = mode === 'calibration' ? progress(t, m2, 0.4) : 0;
  const axes = mode === 'calibration' ? progress(t, 0.1, 0.4) : 0;

  // ── Mini-pitches.
  const minis = mode === 'tangled' || mode === 'loose' || mode === 'blindspot';
  const kT = mode === 'tangled' ? easeOutCubic(progress(t, b0, MINI_TANGLED_SECONDS)) : 1;
  const kL =
    mode === 'tangled'
      ? 0
      : mode === 'loose'
        ? progress(t, b0, MINI_LOOSE_SECONDS)
        : lerp(1, LOOSE_ON, easeOutCubic(progress(t, m0 - 0.3, 2.4)));
  const T = tangled(kT);
  const Lp = loose(kL);
  const tc = weightedCentroid(T.players, velOf(T.players));
  const land = mode === 'tangled' ? easeOutCubic(progress(t, m2 - 0.6, 1.0)) : 1;
  const tMarker: Pt & { opacity: number } = { x: lerp(tc.x, T.ball.x, land), y: lerp(tc.y, T.ball.y, land), opacity: mode === 'tangled' ? progress(t, b0 + 0.6, 0.5) : 1 };
  const lc = weightedCentroid(Lp.players, velOf(Lp.players));
  const lMarker = { x: lc.x, y: lc.y, opacity: mode === 'tangled' ? 0 : mode === 'loose' ? progress(t, b0 + 0.5, 0.5) : 1 };
  const shrink = mode === 'blindspot' ? easeOutCubic(progress(t, m0, 1.6)) : 0;
  const left = {
    active: mode === 'tangled' ? 1 : 0.55,
    players: T.players,
    ball: { ...T.ball, opacity: mode === 'tangled' ? progress(t, m2 - 0.1, 0.3) : 1 },
    marker: tMarker,
    arrows: mode === 'tangled' ? easeOutCubic(progress(t, b0 + 0.3, 0.8)) : 0.6,
    guess: mode === 'tangled' ? progress(t, m1 - 0.2, 0.35) * (1 - progress(t, fit(m2 + 1.0, 0.4, d), 0.4)) : 0,
    cross: mode === 'tangled' ? easeOutCubic(progress(t, m2, 0.35)) : 0,
    cloud: { x: T.ball.x, y: T.ball.y, r: 4.6, opacity: mode === 'blindspot' ? progress(t, 0.1, 0.5) : 0, bright: 0.2 },
  };
  const right = {
    active: mode === 'tangled' ? 0.45 : 1,
    players: Lp.players,
    ball: { ...Lp.ball, opacity: mode === 'tangled' ? 0.5 : 1 },
    marker: lMarker,
    arrows: mode === 'tangled' ? 0 : mode === 'loose' ? easeOutCubic(progress(t, b0 + 0.3, 0.8)) : 1,
    miss: mode === 'loose' ? easeOutCubic(progress(t, m1, 0.6)) : mode === 'blindspot' ? 1 : 0,
    more: mode === 'loose' ? progress(t, m2 - 0.1, 0.35) : mode === 'blindspot' ? 1 : 0,
    cloud: { x: lc.x, y: lc.y, r: lerp(5.2, 2.0, shrink), opacity: mode === 'blindspot' ? progress(t, 0.1, 0.5) : 0, bright: shrink },
    sure: mode === 'blindspot' ? progress(t, m0 + 0.9, 0.4) : 0,
  };
  // Error ↑ and confidence ↑ on loose balls: two gauges filling (blind spot).
  const gauges = mode === 'blindspot' ? [easeOutCubic(progress(t, b0 + 0.2, 1.0)), easeOutCubic(progress(t, m0 + 0.3, 1.2))] : [0, 0];
  const gaugeOn = mode === 'blindspot' ? progress(t, 0.1, 0.4) : 0;

  return {
    mode,
    playT,
    players,
    point,
    cloud,
    ball,
    miss,
    sureTag,
    stamp,
    spreadTag,
    steps,
    corr,
    weak,
    axes,
    minis,
    left,
    right,
    gauges,
    gaugeOn,
    b1,
  };
}
