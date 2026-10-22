// Pure state of the BlackBox scenes: the 60 kB box itself.
// - closed: a closed box with a "?" on its face; an arrow to "answer" (a pitch with the box's
//   marker on it) and a blank slot labelled "why?" (scene 4);
// - drawers: the box moves to the centre and three drawers outline on it, lighting in turn:
//   geometry · topology · confidence (scene 5);
// - stamps: the three drawers line up with their stamps (92% · nothing · blind spot); below, the
//   ball slides loose into open space while the tight cloud stays behind (scene 20).
// No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';
import { lerp, type Pt } from './pitch.ts';
import { markAt } from './PitchPlayback.state.ts';

export type BoxMode = 'closed' | 'drawers' | 'stamps';

export type BlackBoxProps = { mode: BoxMode; marks?: number[]; layout?: string };

export const DRAWERS = ['geometry', 'topology', 'confidence'] as const;
export const STAMPS = [
  { text: '92%', tone: 'ok' },
  { text: 'nothing', tone: 'muted' },
  { text: 'blind spot', tone: 'accent' },
] as const;

/** Box placement (frame pixels): where it sits in `closed`, and where `drawers` moves it to. */
export const BOX_AT = { closed: { x: 260, y: 450, w: 560 }, centre: { x: 200, y: 600, w: 680 } } as const;

/** The loose-ball strip of the stamps scene (metres): view, players, cloud and the ball's run. */
export const STRIP = {
  view: { x0: 0, x1: 60, y0: 0, y1: 21 },
  players: [
    { x: 14, y: 6, team: 0 },
    { x: 19, y: 13, team: 1 },
    { x: 23, y: 8, team: 0 },
    { x: 26, y: 15, team: 1 },
    { x: 17, y: 17, team: 0 },
    { x: 29, y: 10, team: 1 },
    { x: 10, y: 12, team: 1 },
  ],
  cloud: { x: 22, y: 11.2 },
  from: { x: 25, y: 11 } as Pt,
  to: { x: 52, y: 7 } as Pt,
};

export function frameState(p: BlackBoxProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const b0 = beatAt(beats, 0);
  const m0 = fit(markAt(p.marks, 0, b0 + 0.5), 0.6, d);
  const m1 = fit(markAt(p.marks, 1, m0 + 1.5), 0.6, d);
  const m2 = fit(markAt(p.marks, 2, m1 + 1.0), 0.6, d);
  const mode = p.mode;

  // Box placement and look.
  let move = 0;
  let face = 0;
  let drawers = 0;
  let lit = [0, 0, 0];
  let glow = 0.4;
  if (mode === 'closed') {
    face = 1;
    glow = 0.4 + 0.5 * (1 - progress(t, m0 + 0.3, 1.0)) * progress(t, m0 - 0.2, 0.3);
  }
  if (mode === 'drawers') {
    move = easeOutCubic(progress(t, fit(0.2, 0.9, d), 0.9));
    drawers = easeOutCubic(progress(t, m0 - 0.2, 0.6));
    face = 1 - drawers;
    lit = [0, 1, 2].map((i) => easeOutCubic(progress(t, m0 + 0.1 + i * 0.32, 0.35)));
    // "What is it really computing?": the three drawers pulse once together.
    glow = 0.4 + 0.6 * progress(t, m1, 0.4);
  }
  const a = BOX_AT.closed;
  const c = BOX_AT.centre;
  const box = mode === 'stamps' ? null : { x: lerp(a.x, c.x, move), y: lerp(a.y, c.y, move), w: lerp(a.w, c.w, move), face, drawers, lit, glow };

  // Closed: the answer card and the blank "why?" slot.
  const answer = mode === 'closed' ? easeOutCubic(progress(t, m1 - 0.2, 0.5)) : 0;
  const why = mode === 'closed' ? easeOutCubic(progress(t, m2 - 0.2, 0.5)) : 0;

  // Stamps: rows in, then each one's moment.
  const rows = DRAWERS.map((label, i) => {
    const appear = mode === 'stamps' ? easeOutCubic(progress(t, 0.05 + i * 0.12, 0.4)) : 0;
    const focus = mode !== 'stamps' ? 0 : i === 1 ? progress(t, m0 - 0.1, 0.3) * (1 - progress(t, m1 - 0.3, 0.4)) : i === 2 ? progress(t, m1 - 0.2, 0.3) : 0;
    return { label, stamp: STAMPS[i].text, tone: STAMPS[i].tone, appear, focus };
  });
  const run = mode === 'stamps' ? easeOutCubic(progress(t, m1, Math.max(0.6, m2 + 0.9 - m1))) : 0;
  const strip = {
    appear: mode === 'stamps' ? progress(t, 0.3, 0.5) : 0,
    ball: { x: lerp(STRIP.from.x, STRIP.to.x, run), y: lerp(STRIP.from.y, STRIP.to.y, run) },
    miss: clamp01(run * 1.2),
    sure: mode === 'stamps' ? progress(t, m1 + 0.4, 0.4) : 0,
  };

  return { mode, box, answer, why, rows, strip };
}
