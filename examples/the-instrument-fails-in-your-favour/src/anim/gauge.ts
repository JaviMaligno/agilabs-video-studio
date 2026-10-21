// Pure geometry and timing shared by the rigged-gauge scenes. No Remotion or React here.
// A reading v in [0, 1] maps to a needle angle from -120 deg (left) to +120 deg (right), 0 = up.
import { beatAt, clamp01, easeOutCubic, fit } from './steps.ts';

export const SWEEP = 120;

export const lerp = (a: number, b: number, p: number): number => a + (b - a) * clamp01(p);

/** Needle angle in degrees for a reading (clamped to the dial). */
export const angleOf = (v: number): number => -SWEEP + 2 * SWEEP * clamp01(v);

export const polar = (cx: number, cy: number, r: number, v: number): { x: number; y: number } => {
  const a = (angleOf(v) * Math.PI) / 180;
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
};

/** SVG arc along the dial from reading v0 to v1 (clockwise). */
export const arcPath = (cx: number, cy: number, r: number, v0: number, v1: number): string => {
  const a = Math.min(v0, v1);
  const b = Math.max(v0, v1);
  const p0 = polar(cx, cy, r, a);
  const p1 = polar(cx, cy, r, b);
  const large = (b - a) * 2 * SWEEP > 180 ? 1 : 0;
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
};

/** Smooth 0 -> 1 between `start` and `start + len` (eased). */
export const ease = (t: number, start: number, len: number): number =>
  len <= 0 ? (t >= start ? 1 : 0) : easeOutCubic((t - start) / len);

/** In at `start`, out at `end` (both eased over `len`); 1 between. */
export const window01 = (t: number, start: number, end: number, len = 0.3): number =>
  Math.min(ease(t, start, len), 1 - ease(t, end, len));

/**
 * The n beats a scene uses: the real ones where present, else the previous beat plus a typical
 * line length; each fitted so its own animation (`lens[i]`) still ends inside the scene.
 */
export const fillBeats = (beats: number[], lens: number[], dur: number): number[] => {
  const out: number[] = [];
  for (let i = 0; i < lens.length; i++) {
    const b = beats[i];
    const raw = b !== undefined && Number.isFinite(b) ? b : i === 0 ? beatAt(beats, 0) : out[i - 1] + lens[i - 1];
    out.push(fit(raw, Math.min(lens[i], 1.2), dur));
  }
  return out;
};

/** Pop with a small overshoot, 0 -> ~1.08 -> 1, used for stamps; returns a scale, never negative. */
export const popScale = (t: number, start: number, len = 0.35): number => {
  const p = clamp01((t - start) / len);
  if (p <= 0) return 0;
  return p < 0.6 ? lerp(1.6, 0.95, p / 0.6) : lerp(0.95, 1, (p - 0.6) / 0.4);
};
