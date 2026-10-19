// Shared pure helpers for the bespoke scenes: keyframed motion and the cost meter HUD.
// No Remotion or React here.
import { beatAt, clamp01, fit, progress, sceneTime } from './steps.ts';

export const lerp = (a: number, b: number, p: number): number => a + (b - a) * p;

export const easeInOut = (p: number): number => {
  const q = clamp01(p);
  return q < 0.5 ? 4 * q * q * q : 1 - (-2 * q + 2) ** 3 / 2;
};

/** A keyframe: position at scene second `t`; `hit` marks a contact (spark) on arrival. */
export type Key = { t: number; p: number[]; hit?: boolean };

/** Position along keyframes, eased per segment; clamped to the first / last key outside them. */
export function along(keys: Key[], t: number): number[] {
  if (!keys.length) return [0, 0];
  if (!(t > keys[0].t)) return [...keys[0].p];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t < b.t) {
      const e = easeInOut((t - a.t) / Math.max(1e-6, b.t - a.t));
      return a.p.map((v, j) => lerp(v, b.p[j] ?? v, e));
    }
  }
  return [...keys[keys.length - 1].p];
}

/** Contacts: each `hit` key as a spark whose `pop` runs 0 → 1 over 0.55 s from its arrival. */
export const sparksOf = (keys: Key[], t: number) =>
  keys.filter((k) => k.hit).map((k) => ({ at: k.p, pop: progress(t, k.t, 0.55) }));

/**
 * Charge, stop on contact, back off, charge again, until the scene ends: the blind planner
 * replanning the same doomed route. At most `max` contacts, so the list stays finite.
 */
export function charges(t0: number, dur: number, start: number[], contact: number[], back: number[], first = 0.75, max = 14): Key[] {
  const keys: Key[] = [
    { t: t0, p: start },
    { t: t0 + first, p: contact, hit: true },
  ];
  let t = t0 + first;
  const end = Number.isFinite(dur) ? dur + 1 : t0 + 30;
  let n = 1;
  while (t < end && n < max) {
    keys.push({ t: t + 0.15, p: contact });
    keys.push({ t: t + 0.45, p: back });
    keys.push({ t: t + 0.85, p: contact, hit: true });
    t += 0.85;
    n++;
  }
  return keys;
}

// ---------------------------------------------------------------------------------------------
// Cost meter: 0 = free, 1 = random, room past 1. Values shown exactly as the articles write them.

/** Top of the meter scale. */
export const METER_MAX = 1.25;

export type MeterStep = { to: string; beat?: number; delay?: number; roll?: boolean };
export type MeterSpec = {
  /** Value shown before the first step (default: the first step's value). */
  from?: string;
  steps?: MeterStep[];
  /** Beat index on which the meter drops in (default: on screen from the scene start). */
  show?: number;
};

const num = (s: string): number => {
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : 0;
};

const STEP_LEN = 1.1;
const ROLL_GAP = 0.2;

export type MeterState = {
  opacity: number;
  drop: number;
  needle: number;
  text: string;
  /** Digits rolling into place (only while a `roll` step plays or has played). */
  digits: { ch: string; appear: number }[];
  /** 1 while the last played step is a roll step (the text is drawn digit by digit). */
  rolling: number;
  /** Opacity of the previous value while a roll replaces it. */
  old: number;
  oldText: string;
};

export function meterState(spec: MeterSpec | undefined, t: number, beats: number[], dur: number): MeterState {
  if (!spec) return { opacity: 0, drop: 0, needle: 0, text: '', digits: [], rolling: 0, old: 0, oldText: '' };
  const T = sceneTime(t, dur);
  const steps = spec.steps ?? [];
  const showAt = spec.show === undefined ? null : fit(beatAt(beats, spec.show), 0.45, dur);
  const opacity = showAt === null ? 1 : progress(T, showAt, 0.35);
  const drop = showAt === null ? 1 : easeInOut(progress(T, showAt, 0.45));
  let cur = spec.from ?? steps[0]?.to ?? '0';
  let value = num(cur);
  let text = cur;
  let digits: MeterState['digits'] = [];
  let rolling = 0;
  let old = 0;
  let oldText = '';
  for (const step of steps) {
    const len = step.roll ? STEP_LEN + 0.3 + ROLL_GAP * step.to.length : STEP_LEN;
    const start = fit(beatAt(beats, step.beat ?? 0) + (step.delay ?? 0), len, dur);
    const p = progress(T, start, STEP_LEN);
    if (!(T > start)) break;
    value = lerp(num(cur), num(step.to), easeInOut(p));
    if (step.roll) {
      digits = step.to.split('').map((ch, i) => ({ ch, appear: progress(T, start + 0.3 + i * ROLL_GAP, 0.3) }));
      rolling = 1;
      oldText = cur;
      old = 1 - progress(T, start, 0.3);
      text = step.to;
    } else {
      digits = [];
      rolling = 0;
      old = 0;
      text = p >= 1 ? step.to : value.toFixed(3);
    }
    cur = step.to;
  }
  return { opacity, drop, needle: clamp01(value / METER_MAX), text, digits, rolling, old, oldText };
}
