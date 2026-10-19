// Pure state of the TorusStage scene: the flat map tilts into 3D, a solid torus floats between the
// robot and the star, a contact-free arc goes over it, and the route first threads the hole, then
// (torus slid sideways) runs into the tube. Everything is illustrative except the two costs on
// the meter (0.019 and 0.898), which come from the articles. No Remotion or React here.
import type { Label } from '../types.ts';
import { beatAt, fit, progress, sceneTime } from './steps.ts';
import { along, charges, easeInOut, lerp, meterState, sparksOf, type Key, type MeterSpec } from './motion.ts';
import type { V3 } from './torus3d.ts';

export type TorusProps = {
  chip?: Label;
  meter?: MeterSpec;
  /** Beat indices: the route threads the hole, the tube moves onto it, "on the path". */
  at?: { thread?: number; tube?: number; path?: number };
};

/** Height of the route above the floor, and the torus (major R, tube r: hole radius R - r). */
export const Z0 = 3.4;
export const TORUS = { R: 2.05, r: 0.85 } as const;
export const START3: V3 = [-7.2, 0, Z0];
export const STAR3: V3 = [6.2, 0, Z0];
export const ROBOT3_R = 0.3;
/** Robot centre on contact with the tube when the tube sits on the route. */
export const CONTACT3: V3 = [-TORUS.r - ROBOT3_R, 0, Z0];
/** Height of the contact-free arc over the torus. */
export const ARC_H = 4.4;

const deg = (d: number) => (d * Math.PI) / 180;

export function frameState(p: TorusProps, t: number, beats: number[], dur: number) {
  const T = sceneTime(t, dur);
  const d = Number.isFinite(dur) ? Math.max(0, dur) : 1e6;
  const b0 = beatAt(beats, 0);
  const b1 = beatAt(beats, p.at?.thread ?? 1);
  const b2 = beatAt(beats, p.at?.tube ?? 2);
  const b3 = beatAt(beats, p.at?.path ?? 3);

  // Camera: top-down (like the map) pitching up to a low three-quarter view, then a slow orbit.
  const tilt = easeInOut(progress(T, fit(0.05, 1.5, d), 1.5));
  const orbit = Math.min(1, Math.max(0, T / Math.max(1, d)));
  const el = lerp(deg(89), deg(24), tilt);
  const az = lerp(deg(-90), deg(-128), tilt) + deg(12) * orbit;

  const ringFade = 1 - progress(T, fit(0.2, 0.8, d), 0.8);
  const rise = easeInOut(progress(T, fit(0.45, 1.2, d), 1.2));
  const arcS = fit(Math.max(b0 + 0.7, 1.1), 1.0, d);
  const arc = easeInOut(progress(T, arcS, 1.0));
  const arcPulse = progress(T, fit(b3, 0.9, d), 0.9);

  // Torus pose: hole on the route (threaded), then slid sideways so the tube sits on it (clipped).
  const slideS = fit(b2, 0.6, d);
  const slide = easeInOut(progress(T, slideS, 0.6));

  // Robot: through the hole onto the star; then back at the start, into the tube, again and again.
  const t1 = fit(b1 + 0.15, 1.9, d);
  const run1: Key[] = [
    { t: t1, p: [...START3] },
    { t: t1 + 1.9, p: [...STAR3] },
  ];
  const t2 = fit(slideS + 0.65, 0.8, d);
  const run2 = charges(t2, d, [...START3], [...CONTACT3], [-3.3, 0, Z0], 0.8);
  let pos: number[];
  let robotOpacity = 1;
  if (T < slideS) {
    pos = along(run1, T);
  } else if (T < slideS + 0.3) {
    pos = [...STAR3];
    robotOpacity = 1 - progress(T, slideS, 0.3);
  } else {
    pos = along(run2, T);
    robotOpacity = progress(T, slideS + 0.3, 0.3);
  }
  const sparks = T < slideS ? [] : sparksOf(run2, T).map((s) => ({ x: s.at[0] + ROBOT3_R, y: s.at[1], z: s.at[2], pop: s.pop }));
  const firstHit = t2 + 0.8;
  const tint = progress(T, firstHit, 0.35);

  return {
    el,
    az,
    ringFade,
    rise,
    arc,
    arcPulse,
    slide,
    torus: { c: [0, TORUS.R * slide, lerp(0.2, Z0, rise)] as V3, scale: lerp(0.25, 1, rise), opacity: Math.min(1, rise * 1.6) },
    robot: { x: pos[0], y: pos[1], z: pos[2], opacity: robotOpacity, trail: T > t1 && T < slideS ? 1 : T > t2 ? 1 : 0, fromX: T < slideS ? START3[0] : START3[0] },
    sparks,
    tint,
    labels: {
      thread: progress(T, fit(b1, 0.4, d), 0.4) * (1 - progress(T, slideS, 0.3)),
      tube: progress(T, fit(b2 + 0.3, 0.4, d), 0.4),
    },
    meter: meterState(p.meter, t, beats, dur),
    chip: { opacity: p.chip ? 1 : 0 },
  };
}

export type TorusState = ReturnType<typeof frameState>;
