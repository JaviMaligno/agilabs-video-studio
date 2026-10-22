// Tracks: a small keyframe engine for the bespoke components of this video. Pure (no Remotion or
// React), so states can be tested with plain `node --test`.
//
// A component is a set of numeric fields (opacities, progress, offsets). Each mode (one per scene)
// lists only the fields it changes, as steps "go to value v, starting at time a, over len s".
// A mode starts from where its previous mode ended (END of `prev`), so consecutive scenes that
// blend into each other never jump: the first frame of a scene is the last frame of the one before.
import { clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

/**
 * When a step starts, in scene seconds:
 * - a number: that second;
 * - ['m', i, d?]: mark i (a spoken word, resolved by the timeline) plus d;
 * - ['b', i, d?]: beat i (start of narration line i) plus d.
 * A missing mark falls back to beat 0 + 0.6 + 0.8 i, a missing beat to the scene start.
 */
export type At = number | ['m' | 'b', number, number?];
export type Step = { to: number; at?: At; len?: number; ease?: 'out' | 'linear' | 'inout' };
export type Spec = number | Step | Step[];
export type ModeDef<F extends string> = { prev?: string; set: Partial<Record<F, Spec>> };

/** Default step length, in seconds. */
export const STEP_LEN = 0.45;

const finite = (x: number | undefined): x is number => x !== undefined && Number.isFinite(x);

export function resolveAt(at: At | undefined, beats: number[], marks: number[] | undefined): number {
  const b0 = finite(beats[0]) ? beats[0] : 0;
  if (at === undefined) return 0;
  if (typeof at === 'number') return Number.isFinite(at) ? at : 0;
  const [kind, i, d = 0] = at;
  if (kind === 'm') {
    const m = marks?.[i];
    return (finite(m) ? m : b0 + 0.6 + 0.8 * i) + d;
  }
  const b = beats[i];
  return (finite(b) ? b : b0 + 1.2 * i) + d;
}

const steps = (spec: Spec): Step[] => (typeof spec === 'number' ? [{ to: spec, at: 0, len: 0 }] : Array.isArray(spec) ? spec : [spec]);

const ease = (p: number, kind: Step['ease']) => {
  const q = clamp01(p);
  if (kind === 'linear') return q;
  if (kind === 'inout') return q < 0.5 ? 4 * q ** 3 : 1 - (-2 * q + 2) ** 3 / 2;
  return easeOutCubic(q);
};

export type Machine<F extends string> = {
  fields: readonly F[];
  /** End state of each mode (the start state of the next). */
  end: Record<string, Record<F, number>>;
  /** Start state of each mode. */
  start: (mode: string) => Record<F, number>;
  /** Field values at scene second `t`. */
  at: (mode: string, t: number, beats: number[], dur: number, marks?: number[]) => Record<F, number>;
  modes: string[];
};

/**
 * Builds the machine from the initial values and the modes in timeline order. A mode without
 * `prev` follows the mode listed before it; the first starts from `init`.
 */
export function machine<F extends string>(init: Record<F, number>, defs: [string, ModeDef<F>][]): Machine<F> {
  const fields = Object.keys(init) as F[];
  const end: Record<string, Record<F, number>> = {};
  const prevOf: Record<string, string | undefined> = {};
  const byName: Record<string, ModeDef<F>> = {};
  defs.forEach(([name, def], i) => {
    const prev = def.prev ?? (i > 0 ? defs[i - 1][0] : undefined);
    if (prev !== undefined && !end[prev]) throw new Error(`mode ${name}: previous mode ${prev} is not defined before it`);
    prevOf[name] = prev;
    byName[name] = def;
    const from = prev ? end[prev] : init;
    const out = { ...from };
    for (const [f, spec] of Object.entries(def.set) as [F, Spec][]) {
      if (!(f in init)) throw new Error(`mode ${name}: unknown field ${f}`);
      const st = steps(spec);
      out[f] = st[st.length - 1].to;
    }
    end[name] = out;
  });
  const modes = defs.map(([n]) => n);
  const start = (mode: string) => {
    const p = prevOf[mode];
    return { ...(p ? end[p] : init) };
  };
  const at = (mode: string, time: number, beats: number[], dur: number, marks?: number[]) => {
    const name = byName[mode] ? mode : modes[0];
    const def = byName[name];
    const T = sceneTime(Number.isFinite(time) ? time : 0, dur);
    const v = start(name);
    for (const [f, spec] of Object.entries(def.set) as [F, Spec][]) {
      let x = v[f];
      for (const s of steps(spec)) {
        const len = s.len ?? STEP_LEN;
        const a = fit(resolveAt(s.at, beats, marks), len, dur);
        x = x + (s.to - x) * ease(progress(T, a, len), s.ease);
      }
      v[f] = x;
    }
    return v;
  };
  return { fields, end, start, at, modes };
}
