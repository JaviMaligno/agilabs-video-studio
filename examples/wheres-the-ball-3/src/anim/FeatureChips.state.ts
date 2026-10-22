// Pure state of the FeatureChips scenes: the hand-written geometric features.
// - chips: on a frozen frame of the real play, about ten chips tumble in, each drawing its point
//   (centre, speed-weighted centre, fastest player, densest cluster, team spread, closest
//   opponents, convergence point...); "centre" and "fastest" light on their words (scene 6);
// - importance: the play runs; velocity arrows merge into one weighted marker that glides onto
//   the hidden ball; a panel of importance bars without values, the speed-weighted centre
//   towering, the convergence point dimmed: "the elegant one barely helped" (scene 9).
// Bar heights follow the repo's permutation importances (never printed). No Remotion or React.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { VIEW_HALF, features, fin, lerp, playersAt, type PlayData } from './pitch.ts';
import { markAt } from './PitchPlayback.state.ts';

export type ChipsMode = 'chips' | 'importance';
export type FeatureChipsProps = { mode: ChipsMode; play?: [number, number]; marks?: number[]; layout?: string };

export const CHIPS = [
  { id: 'centre', label: 'centre' },
  { id: 'weighted', label: 'speed-weighted centre' },
  { id: 'fastest', label: 'fastest player' },
  { id: 'dense', label: 'densest cluster' },
  { id: 'spread', label: 'team spread' },
  { id: 'closest', label: 'closest opponents' },
  { id: 'convergence', label: 'convergence point' },
  { id: 'more', label: '+ a few more' },
] as const;

/** Permutation importance (error rise when shuffled), repo values: drawn as lengths only. */
export const IMPORTANCE = [
  { label: 'speed-weighted centre', value: 0.203, top: true },
  { label: 'fastest player', value: 0.034, top: false },
  { label: 'convergence point', value: 0.006, top: false },
] as const;

/** Chip stagger, seconds. */
export const CHIP_STEP = 0.2;
/** Frozen play second of the chips scene. */
export const CHIPS_AT = 2.0;

export function frameState(p: FeatureChipsProps, time: number, beats: number[], dur: number, data: PlayData) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const b0 = beatAt(beats, 0);
  const m0 = fit(markAt(p.marks, 0, b0 + 0.8), 0.6, d);
  const m1 = fit(markAt(p.marks, 1, m0 + 1.5), 0.6, d);
  const m2 = fit(markAt(p.marks, 2, m1 + 1.0), 0.6, d);
  const mode = p.mode;
  const [from, to] = p.play ?? [CHIPS_AT, CHIPS_AT];
  const playT = lerp(fin(from), fin(to), clamp01(t / d));
  const { players, ball } = playersAt(data, playT, VIEW_HALF);
  const f = features(players);

  // Chips: tumble in from "ten"; "centre" and "fastest" light on their words.
  const chips = CHIPS.map((c, i) => {
    const appear = mode === 'chips' ? easeOutCubic(progress(t, fit(m0 + i * CHIP_STEP, 0.45, d), 0.45)) : 0;
    const lit = mode !== 'chips' ? 0 : c.id === 'centre' ? progress(t, m1 - 0.1, 0.3) : c.id === 'fastest' ? progress(t, m2 - 0.1, 0.3) : 0;
    return { id: c.id, label: c.label, appear, lit };
  });

  // Importance: arrows, rays converging, the marker landing on the ball.
  let grow = 0;
  let marker = { x: f.weighted.x, y: f.weighted.y, opacity: 0, converge: 0, land: 0 };
  let ballOpacity = 0;
  let glow = 0;
  if (mode === 'importance') {
    grow = easeOutCubic(progress(t, fit(b0 + 0.1, 0.9, d), 0.9)) * (1 - 0.6 * easeOutCubic(progress(t, m1 + 0.8, 1.2)));
    const converge = easeOutCubic(progress(t, m1 - 0.3, 0.8));
    const land = easeOutCubic(progress(t, m1 + 0.4, 1.3));
    marker = { x: lerp(f.weighted.x, ball.x, land), y: lerp(f.weighted.y, ball.y, land), opacity: converge, converge, land };
    ballOpacity = progress(t, fit(m1 + 1.6, 0.3, d), 0.3);
    glow = ballOpacity * (1 - progress(t, fit(m1 + 1.9, 1.2, d), 1.2));
  }
  const bars = IMPORTANCE.map((b, i) => ({
    label: b.label,
    top: b.top,
    share: b.value / IMPORTANCE[0].value,
    grow: mode === 'importance' ? easeOutCubic(progress(t, m0 + i * 0.25, 0.8)) : 0,
  }));
  const barely = mode === 'importance' ? progress(t, fit(m0 + 1.6, 0.4, d), 0.4) : 0;

  return {
    mode,
    playT,
    players: players.map((q) => ({ x: q.x, y: q.y, team: q.team, bright: clamp01((q.speed - 1) / 5), ax: q.x + q.vx * 1.6 * grow, ay: q.y + q.vy * 1.6 * grow })),
    features: f,
    chips,
    arrows: grow,
    marker,
    ball: { x: ball.x, y: ball.y, opacity: ballOpacity, glow },
    bars,
    barely,
    panel: mode === 'importance' ? progress(t, m0 - 0.2, 0.4) : 0,
  };
}
