// Pure state of the RingPan scenes: frying pans seen from above, squid rings placed into them by
// a visible move (lift off the counter, arc over the rim, drop, bounce, settle), the part touching
// the metal glowing as the sear, and two dials (RINGS, SEARED) per pan. Geometry comes from
// src/data/instances.ts (checked by test/geometry.test.ts); the move itself is illustrative.
// Everything is in stage px (960 x 1090, origin top-left of the stage). No Remotion or React here.
import { tx, type Label, type Lang } from '../types.ts';
import { FLOOR, MATCH_ZOOM, PHOTO_RINGS, COVER, imgToVideo } from '../data/cookingRings.ts';
import { holeOf, areaOf } from '../data/instances.ts';
import { STAGE } from '../layout.ts';
import { clamp01, easeOutCubic, fit, progress, sceneTime } from './steps.ts';

export type Enter = { beat?: number; at?: number; delay?: number };

export type PanRing = {
  r: number;
  w: number;
  x: number;
  y: number;
  /** 'pre': already in the pan. Otherwise the placement move starts on this beat / second. */
  enter?: Enter | 'pre';
  /** Counter index the ring lifts off (absent: it drops in from above). */
  from?: number;
  /** Slow nest move: hover over the hole, drop through it, wobble, slide to rest. */
  nest?: boolean;
  /** A big ring: slower, heavier drop. */
  heavy?: boolean;
  /** Refused placement: tries these spots (pan units), bumps off each, goes back with a red cross. */
  refuse?: [number, number][];
};

export type Pan = {
  label?: Label;
  rings: PanRing[];
  dials?: ('rings' | 'seared')[];
  /** The article's rounded figure, shown under SEARED once every ring has landed. */
  seared?: string;
  /** The dial that pulses as this pan's winner, from `pulseAt` (beat index) on. */
  pulse?: 'rings' | 'seared';
  pulseAt?: number;
  /** Dim the RINGS value (the dial this pan loses on), from beat `dimAt` on (default: always). */
  dimRings?: boolean;
  dimAt?: number;
  /** Keep room for a SEARED figure that this pan does not show (labels line up across scenes). */
  reserveSeared?: boolean;
  /** Morph target at `morph`: a rectangular griddle or a sphere outline. */
  shape?: 'rect' | 'sphere';
  /** Outline the containers (pan, holes) a ring could go to while it hovers. */
  candidates?: boolean;
};

export type RingPanProps = {
  mode: 'pans' | 'split' | 'superincreasing';
  /** Pan radius in pan units (the same for every pan of the scene). */
  R?: number;
  pans?: Pan[];
  /** The rings waiting on the counter strip, by size. `scale` shrinks them relative to the pans. */
  counter?: { radii: number[]; w: number; scale?: number; align?: 'center' | 'right' };
  /** SEARED meter full scale, in area units (default: the largest pan's final area). */
  meterMax?: number;
  /** Chips that light up one by one (beat / second). */
  tags?: ({ text: Label } & Enter)[];
  morph?: Enter & { tag: Label };
  /** split: the beat the pan splits in two on (default 1). */
  splitBeat?: number;
  /** superincreasing: the set laid out with its size checks. */
  set?: { radii: number[]; w: number; label: Label };
};

export const W = STAGE.vertical.w;
export const H = STAGE.vertical.h;

type Pt = { x: number; y: number };
type PanGeo = { cx: number; cy: number; R: number };

/** Pan positions (stage px) by pan count. */
export const panGeometry = (n: number): PanGeo[] => {
  if (n <= 1) return [{ cx: W / 2, cy: 520, R: 320 }];
  if (n === 2) return [{ cx: 240, cy: 450, R: 205 }, { cx: 720, cy: 450, R: 205 }];
  return [0, 1, 2].map((i) => ({ cx: 165 + i * 315, cy: 440, R: 145 }));
};

// ---------- the placement move ----------

const LIFT = 0.15;
const BOUNCE = 0.18;
const SETTLE = 0.22;
const PROBE = 0.4;

export type MoveTiming = { arc: number; hover: number; drop: number };
export const moveTiming = (g: Pick<PanRing, 'nest' | 'heavy'>, candidates = false): MoveTiming => ({
  arc: g.heavy ? 0.5 : 0.4,
  hover: g.nest ? 0.55 : candidates ? 0.35 : 0,
  drop: g.nest ? 0.5 : g.heavy ? 0.32 : 0.25,
});
export const moveLength = (g: PanRing, candidates = false): number => {
  if (g.refuse) return LIFT + 0.4 + g.refuse.length * (PROBE + 0.4) + 0.05;
  const m = moveTiming(g, candidates);
  return LIFT + m.arc + m.hover + m.drop + BOUNCE + SETTLE;
};
/** Seconds from the start of the move to the landing frame. */
export const landingOffset = (g: PanRing, candidates = false): number => {
  const m = moveTiming(g, candidates);
  return LIFT + m.arc + m.hover + m.drop;
};

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpPt = (a: Pt, b: Pt, p: number): Pt => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) });
const easeInOut = (p: number) => {
  const q = clamp01(p);
  return q < 0.5 ? 2 * q * q : 1 - (-2 * q + 2) ** 2 / 2;
};

export type MovePose = {
  x: number;
  y: number;
  /** Multiplier on the pan scale (the ring is drawn at radius r * s * scale). */
  scale: number;
  /** Height above the metal, 0..1: drives the shadow. */
  height: number;
  /** Seconds since landing (negative before; -Infinity-like for never). */
  sinceLand: number;
  /** Horizontal shake of a refused try, px. */
  shake: number;
};

/**
 * Pose of a ring along its placement move at time `t` (move starts at `start`): `from` is the
 * counter spot (scale `cs`), `to` the final centre, `hoverAt` the point it hovers over / drops at.
 */
export function movePose(t: number, start: number, from: Pt, to: Pt, hoverAt: Pt, cs: number, g: PanRing, candidates = false): MovePose {
  const m = moveTiming(g, candidates);
  const top = g.nest ? 1.3 : 1.16;
  let u = t - start;
  if (u < 0) return { ...from, scale: cs, height: 0, sinceLand: -1e6, shake: 0 };
  if (u < LIFT) {
    const p = u / LIFT;
    return { ...from, scale: cs * (1 + 0.1 * p), height: 0.35 * p, sinceLand: -1e6, shake: 0 };
  }
  u -= LIFT;
  if (u < m.arc) {
    const e = easeInOut(u / m.arc);
    const pos = lerpPt(from, hoverAt, e);
    return { ...pos, scale: lerp(cs * 1.1, top, e) + 0.06 * Math.sin(Math.PI * e), height: 0.35 + 0.65 * e, sinceLand: -1e6, shake: 0 };
  }
  u -= m.arc;
  if (u < m.hover) {
    const p = u / m.hover;
    return { x: hoverAt.x, y: hoverAt.y - 6 * Math.sin(Math.PI * p), scale: top, height: 1, sinceLand: -1e6, shake: 0 };
  }
  u -= m.hover;
  const land: Pt = g.nest ? lerpPt(hoverAt, to, 0.35) : lerpPt(hoverAt, to, 0.6);
  if (u < m.drop) {
    const p = (u / m.drop) ** 2;
    return { ...lerpPt(hoverAt, land, p), scale: lerp(top, 1, p), height: 1 - p, sinceLand: -1e6, shake: 0 };
  }
  const since = u - m.drop;
  if (since < BOUNCE) {
    return { ...land, scale: 1 + 0.035 * Math.sin((Math.PI * since) / BOUNCE), height: 0, sinceLand: since, shake: 0 };
  }
  const p = easeOutCubic((since - BOUNCE) / SETTLE);
  const wobble = g.nest ? 5 * Math.sin(since * 30) * Math.exp(-since * 5) : 0;
  const pos = lerpPt(land, to, p);
  return { x: pos.x + wobble, y: pos.y, scale: 1, height: 0, sinceLand: since, shake: 0 };
}

/** A refused ring: lift, try each spot (descend a little, shake, rise), then back to the counter. */
export function refusePose(t: number, start: number, from: Pt, tries: Pt[], cs: number): MovePose & { cross: number } {
  let u = t - start;
  const none = { cross: 0, sinceLand: -1e6 };
  if (u < 0) return { ...from, scale: cs, height: 0, shake: 0, ...none };
  if (u < LIFT) return { ...from, scale: cs * (1 + 0.1 * (u / LIFT)), height: 0.35 * (u / LIFT), shake: 0, ...none };
  u -= LIFT;
  let prev = from;
  let prevScale = cs * 1.1;
  for (const spot of tries) {
    if (u < 0.4) {
      const e = easeInOut(u / 0.4);
      return { ...lerpPt(prev, spot, e), scale: lerp(prevScale, 1.16, e), height: lerp(prev === from ? 0.35 : 1, 1, e), shake: 0, ...none };
    }
    u -= 0.4;
    if (u < PROBE) {
      const p = u / PROBE;
      const dip = Math.sin(Math.PI * Math.min(1, p * 1.6));
      return { ...spot, scale: 1.16 - 0.08 * dip, height: 1 - 0.3 * dip, shake: p > 0.35 ? 14 * Math.sin(p * 50) * (1 - p) : 0, ...none };
    }
    u -= PROBE;
    prev = spot;
    prevScale = 1.16;
  }
  if (u < 0.4) {
    const e = easeInOut(u / 0.4);
    return { ...lerpPt(prev, from, e), scale: lerp(1.16, cs, e), height: lerp(1, 0, e), shake: 0, ...none };
  }
  return { ...from, scale: cs, height: 0, shake: 0, cross: easeOutCubic(progress(u - 0.4, 0, 0.3)), sinceLand: -1e6 };
}

// ---------- frame state ----------

export type RingDraw = {
  x: number;
  y: number;
  ro: number;
  ri: number;
  height: number;
  /** 1 raw (pale squid) .. 0 seared (amber glow). */
  raw: number;
  glow: number;
  opacity: number;
  /** Sizzle puff progress after landing (0 = none / over). */
  puff: number;
  shake: number;
  seed: number;
  /** Red cross over a refused ring, 0..1. */
  cross: number;
};

export type DialDraw = {
  x: number;
  y: number;
  w: number;
  label?: string;
  rings?: { value: string; opacity: number; pulse: number; dim: number };
  seared?: { fill: number; display: string; displayOpacity: number; pulse: number; reserve: boolean };
  opacity: number;
};

export type PanDraw = PanGeo & {
  opacity: number;
  rect: number;
  sphere: number;
  candidates: { cx: number; cy: number; r: number; on: number; picked: number }[];
};

export type CounterDraw = { x: number; y: number; ro: number; ri: number; ghost: number; opacity: number };

export type CheckDraw = {
  ring: { x: number; y: number; ro: number; ri: number };
  ghosts: { x: number; y: number; r: number; appear: number }[];
  check: { x: number; y: number; pop: number } | null;
};

export type RingPanState = {
  pans: PanDraw[];
  rings: RingDraw[];
  counter: CounterDraw[];
  dials: DialDraw[];
  tags: { text: string; x: number; y: number; pop: number }[];
  morphTag: { text: string; x: number; y: number; pop: number } | null;
  checks: CheckDraw[];
  label: { text: string; y: number; appear: number } | null;
};

const startOf = (e: Enter | undefined, beats: number[], fallback: number): number => {
  if (!e) return fallback;
  if (e.at !== undefined && Number.isFinite(e.at)) return e.at + (e.delay ?? 0);
  const b = e.beat !== undefined ? beats[e.beat] : undefined;
  return (b !== undefined && Number.isFinite(b) ? b : fallback) + (e.delay ?? 0);
};

/** Counter strip: rings by size along the bottom of the stage at scale `s * cs`. */
export const counterLayout = (radii: number[], w: number, sc: number, align: 'center' | 'right' = 'center'): CounterDraw[] => {
  const gap = 26;
  const rs = radii.map((r) => r * sc);
  const total = rs.reduce((a, r) => a + 2 * r, 0) + gap * Math.max(0, rs.length - 1);
  const maxR = Math.max(0, ...rs);
  const cy = H - maxR - 14;
  let x = align === 'right' ? W - 24 - total : (W - total) / 2;
  return rs.map((ro, i) => {
    const out = { x: x + ro, y: cy, ro, ri: holeOf(radii[i], w) * sc, ghost: 0, opacity: 1 };
    x += 2 * ro + gap;
    return out;
  });
};

const pulseOf = (t: number, at: number | undefined, beats: number[]): number => {
  if (at === undefined) return 0;
  const b = beats[at];
  if (b === undefined || !Number.isFinite(b) || t < b) return 0;
  return 0.5 - 0.5 * Math.cos((2 * Math.PI * (t - b)) / 0.9);
};

/** The photo's pan and rings drawn in stage px at the match-cut zoom (scene 1 end = split start). */
export const matchGeometry = () => {
  const c = imgToVideo(FLOOR.x, FLOOR.y, MATCH_ZOOM);
  const k = COVER.scale * MATCH_ZOOM;
  const st = STAGE.vertical;
  return {
    pan: { cx: c.x - st.side, cy: c.y - st.top, R: FLOOR.r * k },
    rings: PHOTO_RINGS.map((g) => {
      const p = imgToVideo(g.x, g.y, MATCH_ZOOM);
      return { x: p.x - st.side, y: p.y - st.top, ro: g.ro * k, ri: g.ri * k };
    }),
  };
};

/** Dial blocks for a row of pans (or the split): positions and heights. */
const dialTop = (n: number) => (n >= 3 ? 150 : n === 2 ? 30 : 10);

function splitState(p: RingPanProps, t: number, beats: number[], dur: number): RingPanState {
  const m = matchGeometry();
  const shrinkAt = fit((beats[0] ?? 0) + 0.15, 0.9, dur);
  const splitAt = fit((beats[p.splitBeat ?? 1] ?? shrinkAt + 1.4) - 0.2, 0.6, dur);
  const a = easeInOut(progress(t, shrinkAt, 0.9));
  const b = easeInOut(progress(t, splitAt, 0.6));
  const mid = { cx: W / 2, cy: 520, R: 300 };
  const one = { cx: lerp(m.pan.cx, mid.cx, a), cy: lerp(m.pan.cy, mid.cy, a), R: lerp(m.pan.R, mid.R, a) };
  const [L, Rr] = panGeometry(2);
  const pans: PanDraw[] = [L, Rr].map((g) => ({
    cx: lerp(one.cx, g.cx, b),
    cy: lerp(one.cy, g.cy, b),
    R: lerp(one.R, g.R, b),
    opacity: 1,
    rect: 0,
    sphere: 0,
    candidates: [],
  }));
  // The same handful goes to both pans: the left copy cools to raw squid (read as a count, the
  // RINGS side), the right copy keeps its sear (the SEARED side). At b = 0 the copies coincide.
  const rings: RingDraw[] = pans.flatMap((pan, side) => {
    const kk = pan.R / m.pan.R;
    const cool = side === 0 ? b : 0;
    return m.rings.map((g, i) => ({
      x: pan.cx + (g.x - m.pan.cx) * kk,
      y: pan.cy + (g.y - m.pan.cy) * kk,
      ro: g.ro * kk,
      ri: g.ri * kk,
      height: 0,
      raw: lerp(0.35, 1, cool),
      glow: 1 - cool,
      opacity: 1,
      puff: 0,
      shake: 0,
      seed: side * 100 + i,
      cross: 0,
    }));
  });
  const dials: DialDraw[] = [
    { x: 240, y: 0, w: 400, rings: { value: String(PHOTO_RINGS.length), opacity: 1, pulse: pulseOf(t, p.splitBeat ?? 1, beats) * b, dim: 0 }, opacity: 1 },
    { x: 720, y: 0, w: 400, seared: { fill: 0.55 + 0.25 * b, display: '', displayOpacity: 0, pulse: pulseOf(t, p.splitBeat ?? 1, beats) * b, reserve: false }, opacity: 1 },
  ];
  return { pans, rings, counter: [], dials, tags: [], morphTag: null, checks: [], label: null };
}

function superState(p: RingPanProps, t: number, beats: number[], dur: number, lang: Lang): RingPanState {
  const set = p.set ?? { radii: [], w: 1, label: '' };
  const radii = [...set.radii].sort((x, y) => y - x);
  const s = 30;
  const big = radii[0] ?? 0;
  const rowR = radii.slice(1);
  const pos: Pt[] = [{ x: W / 2, y: 100 + big * s }];
  const rowW = rowR.reduce((a, r) => a + 2 * r * s, 0) + 60 * Math.max(0, rowR.length - 1);
  const rowY = Math.min(H - 40 - (rowR[0] ?? 0) * s, pos[0].y + big * s + 60 + (rowR[0] ?? 0) * s);
  let x = (W - rowW) / 2;
  for (const r of rowR) {
    pos.push({ x: x + r * s, y: rowY });
    x += 2 * r * s + 60;
  }
  const b0 = beats[0] ?? 0;
  const per = 1.25;
  const checks: CheckDraw[] = radii.map((r, i) => {
    const ring = { x: pos[i].x, y: pos[i].y, ro: r * s, ri: holeOf(r, set.w) * s };
    const smaller = radii.slice(i + 1);
    if (!smaller.length) return { ring, ghosts: [], check: null };
    const start = fit(b0 + 0.35 + i * per, smaller.length * 0.22 + 0.6, dur);
    let gx = ring.x - ring.ro;
    const ghosts = smaller.map((g, k) => {
      const out = { x: gx + g * s, y: ring.y, r: g * s, appear: easeOutCubic(progress(t, start + k * 0.22, 0.3)) };
      gx += 2 * g * s;
      return out;
    });
    const cpos = i === 0 ? { x: ring.x + ring.ro * 0.78, y: ring.y - ring.ro * 0.78 } : { x: ring.x, y: ring.y - ring.ro - 42 };
    return { ring, ghosts, check: { ...cpos, pop: easeOutCubic(progress(t, start + smaller.length * 0.22 + 0.15, 0.35)) } };
  });
  return {
    pans: [],
    rings: [],
    counter: [],
    dials: [],
    tags: [],
    morphTag: null,
    checks,
    label: { text: tx(set.label, lang), y: 34, appear: easeOutCubic(progress(t, Math.max(0, b0 - 0.1), 0.4)) },
  };
}

export function frameState(p: RingPanProps, time: number, beats: number[], dur: number, lang: Lang = 'en'): RingPanState {
  const t = sceneTime(time, dur);
  if (p.mode === 'split') return splitState(p, t, beats, dur);
  if (p.mode === 'superincreasing') return superState(p, t, beats, dur, lang);

  const pansIn = p.pans ?? [];
  const geo = panGeometry(pansIn.length);
  const R = p.R ?? 10;
  const s = geo[0].R / R;
  const cs = p.counter?.scale ?? 1;
  const counter = p.counter ? counterLayout(p.counter.radii, p.counter.w, s * cs, p.counter.align) : [];

  // Morph of the pan shapes.
  const morphStart = p.morph ? fit(startOf(p.morph, beats, 0), 0.9, dur) : Infinity;
  const morph = p.morph ? easeInOut(progress(t, morphStart, 0.9)) : 0;

  const rings: RingDraw[] = [];
  const dials: DialDraw[] = [];
  const pans: PanDraw[] = [];
  let seed = 0;

  const finalArea = pansIn.map((pan) => pan.rings.filter((g) => !g.refuse).reduce((a, g) => a + areaOf(g.r, g.w), 0));
  const meterMax = p.meterMax ?? Math.max(1e-9, ...finalArea);

  pansIn.forEach((pan, pi) => {
    const g0 = geo[pi];
    const toPx = (x: number, y: number): Pt => ({ x: g0.cx + x * s, y: g0.cy + y * s });
    // Moves in order: each ring's start, fitted so it lands by the scene end.
    const landed: { r: number; w: number; x: number; y: number; land: number }[] = [];
    let landedCount = 0;
    let area = 0;
    let lastLand = -Infinity;
    let active: { ring: PanRing; start: number; hoverEnd: number; arcStart: number } | null = null;
    let prevStart = -Infinity;
    pan.rings.forEach((g) => {
      const to = toPx(g.x, g.y);
      const ro = g.r * s;
      const ri = holeOf(g.r, g.w) * s;
      const from = g.from !== undefined && counter[g.from] ? { x: counter[g.from].x, y: counter[g.from].y } : { x: to.x, y: to.y - 80 };
      const fromScale = g.from !== undefined && counter[g.from] ? cs : 1.3;
      if (g.enter === 'pre' || g.enter === undefined) {
        rings.push({ x: to.x, y: to.y, ro, ri, height: 0, raw: 0, glow: 1, opacity: 1, puff: 0, shake: 0, seed: seed++, cross: 0 });
        landed.push({ ...g, land: -Infinity });
        landedCount++;
        area += areaOf(g.r, g.w);
        return;
      }
      const len = moveLength(g, pan.candidates);
      const start = fit(Math.max(startOf(g.enter, beats, prevStart + 0.9), 0), len, dur);
      prevStart = start;
      if (g.from !== undefined && counter[g.from] && t >= start) counter[g.from].ghost = Math.max(counter[g.from].ghost, clamp01((t - start) / 0.2));
      if (g.refuse) {
        const tries = g.refuse.map(([x, y]) => toPx(x, y));
        const pose = refusePose(t, start, from, tries, fromScale);
        const visible = g.from !== undefined || t >= start ? 1 : 0;
        rings.push({ x: pose.x, y: pose.y, ro: ro * pose.scale, ri: ri * pose.scale, height: pose.height, raw: 1, glow: 0, opacity: t >= start ? visible : 0, puff: 0, shake: pose.shake, seed: seed++, cross: pose.cross });
        return;
      }
      // Hover over the container the ring ends up in: the hole of a landed ring, else its spot.
      const host = [...landed].reverse().find((h) => Math.hypot(g.x - h.x, g.y - h.y) + g.r <= holeOf(h.r, h.w) + 1e-6);
      const hoverAt = g.nest && host ? toPx(host.x, host.y) : to;
      const pose = movePose(t, start, from, to, hoverAt, fromScale, g, pan.candidates);
      const landAt = start + landingOffset(g, pan.candidates);
      const glow = easeOutCubic(progress(t, landAt, 0.3));
      const appear = g.from !== undefined ? 1 : clamp01((t - start) / 0.15);
      rings.push({
        x: pose.x + pose.shake,
        y: pose.y,
        ro: ro * pose.scale,
        ri: ri * pose.scale,
        height: pose.height,
        raw: 1 - glow,
        glow,
        opacity: t >= start ? appear : 0,
        puff: t >= landAt && t < landAt + 0.7 ? progress(t, landAt, 0.7) : 0,
        shake: 0,
        seed: seed++,
        cross: 0,
      });
      if (t >= landAt) {
        landedCount++;
        landed.push({ ...g, land: landAt });
      }
      area += areaOf(g.r, g.w) * easeOutCubic(progress(t, landAt, 0.45));
      lastLand = Math.max(lastLand, landAt);
      if (t >= start && t < landAt + 0.25) {
        const m = moveTiming(g, pan.candidates);
        active = { ring: g, start, arcStart: start + LIFT, hoverEnd: start + LIFT + m.arc + m.hover };
      }
    });

    // Containers a hovering ring could go to: the pan and the holes of the rings already in it.
    const candidates: PanDraw['candidates'] = [];
    if (pan.candidates && active) {
      const a = active as { ring: PanRing; start: number; hoverEnd: number; arcStart: number };
      const on = clamp01(progress(t, a.arcStart + 0.15, 0.25)) * (1 - progress(t, a.hoverEnd + 0.45, 0.25));
      const holders = landed.filter((h) => holeOf(h.r, h.w) >= a.ring.r && h.land < a.start);
      const host = [...holders].reverse().find((h) => Math.hypot(a.ring.x - h.x, a.ring.y - h.y) + a.ring.r <= holeOf(h.r, h.w) + 1e-6);
      const picked = progress(t, a.hoverEnd - 0.2, 0.2);
      candidates.push({ cx: g0.cx, cy: g0.cy, r: g0.R, on, picked: host ? 0 : picked * on });
      for (const h of holders) {
        const c = toPx(h.x, h.y);
        candidates.push({ cx: c.x, cy: c.y, r: holeOf(h.r, h.w) * s, on, picked: h === host ? picked * on : 0 });
      }
    }

    pans.push({ ...g0, opacity: 1, rect: pan.shape === 'rect' ? morph : 0, sphere: pan.shape === 'sphere' ? morph : 0, candidates });

    const all = pan.rings.filter((g) => !g.refuse && g.enter !== 'pre' && g.enter !== undefined).length === 0;
    const done = all ? 1 : progress(t, lastLand + 0.1, 0.35);
    const show = pan.dials ?? [];
    const top = dialTop(pansIn.length);
    dials.push({
      x: g0.cx,
      y: top,
      w: pansIn.length >= 3 ? 290 : 420,
      label: pan.label !== undefined ? tx(pan.label, lang) : undefined,
      rings: show.includes('rings')
        ? { value: String(landedCount), opacity: 1, pulse: pan.pulse === 'rings' ? pulseOf(t, pan.pulseAt, beats) : 0, dim: !pan.dimRings ? 0 : pan.dimAt === undefined ? 1 : easeOutCubic(progress(t, beats[pan.dimAt] ?? 0, 0.4)) }
        : undefined,
      seared: show.includes('seared')
        ? { fill: clamp01(area / meterMax), display: pan.seared ?? '', displayOpacity: pan.seared ? done : 0, pulse: pan.pulse === 'seared' ? pulseOf(t, pan.pulseAt, beats) : 0, reserve: !!pan.reserveSeared }
        : undefined,
      opacity: 1,
    });
  });

  const tags = (p.tags ?? []).map((tag, i, arr) => {
    const start = fit(startOf(tag, beats, (beats[0] ?? 0) + 0.6 * i), 0.35, dur);
    const span = 300;
    return { text: tx(tag.text, lang), x: W / 2 - ((arr.length - 1) * span) / 2 + i * span, y: geo[0].cy + geo[0].R + 72, pop: easeOutCubic(progress(t, start, 0.35)) };
  });

  const morphTag = p.morph ? { text: tx(p.morph.tag, lang), x: W / 2, y: geo[0].cy + geo[0].R + 80, pop: easeOutCubic(progress(t, morphStart + 0.3, 0.4)) } : null;

  return { pans, rings, counter, dials, tags, morphTag, checks: [], label: null };
}
