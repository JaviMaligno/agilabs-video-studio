// Pure state of SportScale: the same net trained on football and on basketball. A football pitch
// (105×68 m) and a basketball court (28×15 m) first at true relative size, the zero-shot transfer
// cards (basketball → football works, football → basketball fails), then both fields squeezed into
// the same normalized box: identical runners at identical real speeds get velocity arrows ~3.75×
// longer on the court (the article's "3–4×"). Last, positions only: the arrows go, and the softened
// wording of the article's correction (gap roughly halves; relative to each sport's error, it
// vanishes). Modes, in order: sports, transfer, speed, positions. No Remotion or React here.
import { beatAt, clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export const SPORT_MODES = ['sports', 'transfer', 'speed', 'positions'] as const;
export type SportMode = (typeof SPORT_MODES)[number];

export type SportProps = {
  mode: SportMode;
  cues?: Record<string, number>;
  blend?: boolean;
};

export const PITCH_M = { w: 105, h: 68 };
export const COURT_M = { w: 28, h: 15 };

/** Runners: position (0..1 of the field) and a real velocity in m/s, the same on both fields. */
export const RUNNERS = [
  { u: 0.2, v: 0.3, vx: 5.5, vy: 1.2 },
  { u: 0.34, v: 0.62, vx: 6.5, vy: -1.5 },
  { u: 0.46, v: 0.4, vx: 4.5, vy: 2.5 },
  { u: 0.58, v: 0.72, vx: 6.0, vy: -0.6 },
  { u: 0.66, v: 0.24, vx: 5.0, vy: 1.8 },
  { u: 0.3, v: 0.84, vx: 4.0, vy: -2.2 },
];
/** Seconds of running an arrow shows. */
export const ARROW_SECONDS = 1;

const at = (m: SportMode) => SPORT_MODES.indexOf(m);

export function frameState(p: SportProps, time: number, beats: number[], dur: number) {
  const t = sceneTime(time, dur);
  const d = Number.isFinite(dur) && dur > 0 ? dur : 1;
  const m = at(p.mode);
  const b0 = beatAt(beats, 0);
  const b1 = beats[1] !== undefined && Number.isFinite(beats[1]) ? beats[1] : b0 + 2.6;
  const cue = (name: string, fallback: number) => {
    const c = p.cues?.[name];
    return c !== undefined && Number.isFinite(c) ? c : fallback;
  };
  const step = (mode: SportMode, start: number, len: number) => {
    const k = at(mode);
    if (m > k) return 1;
    if (m < k) return 0;
    return progress(t, fit(start, len, d), len);
  };
  /** Shown from `inMode` (at `start`) until `outMode` begins (at `outStart`). */
  const span = (inMode: SportMode, start: number, outMode: SportMode, outStart: number) =>
    step(inMode, start, 0.45) * (1 - step(outMode, outStart, 0.4));

  const pitch = step('sports', 0.15, 0.45);
  const court = easeOutCubic(step('sports', b0 + 0.9, 0.5));
  const netChip = span('sports', b0 + 0.4, 'transfer', b0 - 0.2);

  // Cards slide in (enter) and leave with a plain fade, so a blended hand-over never doubles them.
  const worksIn = easeOutCubic(step('transfer', b0 + 0.45, 0.45));
  const failsIn = easeOutCubic(step('transfer', b1 + 0.1, 0.45));
  const cardsOut = step('speed', b0 - 0.1, 0.4);

  // Both fields into one normalized box.
  // After the 0.6 s blend from the transfer scene, so the fields never show twice.
  const morph = easeOutCubic(step('speed', Math.max(0.65, b0 + 0.15), 1.1));
  const sameBox = step('speed', Math.max(0.65, b0 + 0.15) + 1.0, 0.4);
  // Arrows grow as the court is named; the figure lands on "three to four times".
  const arrows = easeOutCubic(step('speed', Math.max(b0 + 1.3, b1 + 0.2), 0.8)) * (1 - easeOutCubic(step('positions', cue('out', b0 + 0.8), 0.7)));
  const times = span('speed', cue('times', b1 + 1.5), 'positions', cue('both', b0 + 1.4) - 0.3);
  const positions = easeOutCubic(step('positions', cue('both', b0 + 1.4), 0.45));
  const caveat = step('positions', cue('both', b0 + 1.4) + 0.5, 0.45);

  // Runners: a gentle drift so the fields feel alive; arrows show one second of running.
  const runners = RUNNERS.map((r) => ({
    u: r.u,
    v: r.v,
    /** Arrow in field fractions on each field: the same real speed, divided by each field's size. */
    pitch: { du: (r.vx * ARROW_SECONDS) / PITCH_M.w, dv: (r.vy * ARROW_SECONDS) / PITCH_M.h },
    court: { du: (r.vx * ARROW_SECONDS) / COURT_M.w, dv: (r.vy * ARROW_SECONDS) / COURT_M.h },
  }));

  return {
    pitch: { opacity: pitch },
    court: { opacity: court },
    netChip: { opacity: netChip },
    works: { opacity: worksIn * (1 - cardsOut), enter: worksIn },
    fails: { opacity: failsIn * (1 - cardsOut), enter: failsIn },
    morph,
    sameBox: { opacity: sameBox },
    arrows: { opacity: clamp01(arrows) },
    times: { opacity: times },
    positions: { opacity: positions },
    caveat: { opacity: caveat },
    runners,
  };
}
