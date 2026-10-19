// Pure state of the CookingShot scenes: the photoreal pan (three registered Codex frames, see
// src/data/cookingRings.ts) with a slow push-in. 'hook': the raw rings drop in one by one, the
// sizzle starts and browning begins, then a match cut into the drawn pan. 'finish': the drawn pan
// dissolves back into the photo and the browning finishes. The scene's own text is the caption
// (word-by-word gradient reveal). No Remotion or React here.
import { MATCH_ZOOM, PHOTO_RINGS, imgToVideo, COVER } from '../data/cookingRings.ts';
import { clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type CookingProps = {
  mode: 'hook' | 'finish';
  /** Words drawn in a colour of their own: 'accent' (brand) or 'warm' (the sear). */
  emphasis?: { word: string; tone: 'accent' | 'warm' }[];
};

/** Seconds between two rings landing. */
export const DROP_SPACING = 0.32;
/** A ring is seen falling for this long before it lands. */
export const FALL = 0.2;
/** Match cut into / out of the drawn pan, seconds. */
export const MATCH = 0.6;
/** Browning reached at the end of the opening shot (the closing shot picks up from here). */
export const HOOK_BROWN = 0.35;
export const FINISH_ZOOM = 1.12;

const easeInOut = (p: number) => {
  const q = clamp01(p);
  return q < 0.5 ? 2 * q * q : 1 - (-2 * q + 2) ** 2 / 2;
};
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export type CookRing = {
  id: string;
  /** Centre and radii in video px at zoom 1 (inside the push-in group). */
  x: number;
  y: number;
  ro: number;
  ri: number;
  /** Mask opacity: the ring is in the frame. */
  reveal: number;
  scale: number;
  /** Height while falling, 0..1 (shadow). */
  height: number;
  ripple: number;
  spark: number;
};

export type CookState = {
  zoom: number;
  /** Opacity of the full raw frame over the empty pan (unifies the oil once all rings are in). */
  rawFull: number;
  /** Opacity of the seared frame. */
  brown: number;
  /** Photo dimmed and desaturated for the match cut, 0..1. */
  dim: number;
  /** Opacity of the drawn pan over the photo. */
  match: number;
  rings: CookRing[];
  steam: number;
  sizzle: number;
  /** Per narration line: opacity of the line, and how far its sweep-out has gone. */
  text: { opacity: number; out: number }[];
  /** 'finish': the small RINGS ? SEARED chip at the top. */
  chip: number;
};

export function frameState(p: CookingProps, time: number, beats: number[], dur: number): CookState {
  const t = sceneTime(time, dur);
  const b0 = Number.isFinite(beats[0]) ? beats[0] : 0;
  const b1 = Number.isFinite(beats[1]) ? beats[1] : b0 + 2;
  const k = COVER.scale;
  const base = PHOTO_RINGS.map((g) => {
    const c = imgToVideo(g.x, g.y, 1);
    return { id: g.id, x: c.x, y: c.y, ro: g.ro * k, ri: g.ri * k };
  });

  if (p.mode === 'hook') {
    const matchStart = fit(dur - MATCH - 0.15, MATCH, dur);
    const match = easeInOut(progress(t, matchStart, MATCH));
    const zoom = lerp(1, MATCH_ZOOM, easeInOut(progress(t, 0, matchStart)));
    const first = fit(b0 + 0.15, FALL + DROP_SPACING * (base.length - 1) + 0.6, dur);
    let lastLand = first;
    const rings = base.map((g, i) => {
      const land = first + FALL + i * DROP_SPACING;
      lastLand = land;
      const fall = progress(t, land - FALL, FALL);
      const since = t - land;
      const bounce = since > 0 && since < 0.18 ? 0.03 * Math.sin((Math.PI * since) / 0.18) : 0;
      return {
        ...g,
        reveal: clamp01(progress(t, land - FALL, FALL * 0.6)),
        scale: since >= 0 ? 1 + bounce : lerp(1.18, 1, fall * fall),
        height: since >= 0 ? 0 : 1 - fall * fall,
        ripple: since >= 0 && since < 0.7 ? progress(t, land, 0.7) : 0,
        spark: since >= 0 && since < 0.55 ? progress(t, land, 0.55) : 0,
      };
    });
    const brown = HOOK_BROWN * easeInOut(progress(t, Math.max(b1, lastLand + 0.15), 2.2));
    return {
      zoom,
      rawFull: easeInOut(progress(t, lastLand + 0.25, 0.5)),
      brown,
      dim: match,
      match,
      rings,
      steam: clamp01(progress(t, first + 0.5, 2.5)) * (1 - 0.6 * match),
      sizzle: clamp01(progress(t, first + FALL, 1.2)) * (1 - match),
      text: [
        // Sequential hand-off: the first line sweeps out and is gone before the second fades in,
        // so the two lines never overlap (they share the same box).
        { opacity: 1 - progress(t, b1 - 0.24, 0.16), out: progress(t, b1 - 0.36, 0.26) },
        { opacity: progress(t, b1 - 0.06, 0.2) * (1 - progress(t, matchStart + 0.1, 0.4)), out: progress(t, matchStart - 0.2, 0.45) },
      ],
      chip: 0,
    };
  }

  // finish: the drawn pan dissolves into the photo, then the browning completes over the lines.
  const d = easeInOut(progress(t, 0.05, 0.85));
  const brownEnd = Math.max(b0 + 0.5, dur - 0.6);
  return {
    zoom: lerp(MATCH_ZOOM, FINISH_ZOOM, easeInOut(progress(t, 0, dur))),
    rawFull: 1,
    brown: lerp(HOOK_BROWN, 1, easeInOut(progress(t, 0.2, brownEnd - 0.2))),
    dim: 1 - d,
    match: 1 - d,
    rings: base.map((g) => ({ ...g, reveal: 1, scale: 1, height: 0, ripple: 0, spark: 0 })),
    steam: 0.6 + 0.4 * d,
    sizzle: d,
    text: [
      { opacity: progress(t, Math.max(0, b0 - 0.15), 0.25) * (1 - progress(t, b1 - 0.24, 0.16)), out: progress(t, b1 - 0.36, 0.26) },
      { opacity: progress(t, b1 - 0.06, 0.2), out: 0 },
    ],
    chip: easeOutCubic(progress(t, 0.6, 0.4)),
  };
}

/** Deterministic pseudo-random in [0, 1) from integer seeds (particles are pure per frame). */
export const rand = (a: number, b = 0): number => {
  let h = (Math.imul(a | 0, 0x9e3779b1) ^ Math.imul((b | 0) + 0x7f4a7c15, 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0;
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
};
