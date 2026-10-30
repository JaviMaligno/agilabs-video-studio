// Halloween variant (SETTINGS.halloween): a ghost that peeks over the stimulus card and writes the
// faint sentence with a quill, bats over the hook, and a jack-o'-lantern that keeps the hidden
// instruction and lights up when a model obeys it. Drawn in SVG on the brand palette; nothing here
// touches the stimulus greys. Components return null-free markup; callers gate on the setting.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { clamp01, easeOutCubic, progress } from './steps.ts';

/** Pumpkin and candle tones, the amber of the cast's amber robot; teal for the stem. */
export const AMBER = '#f59e0b';
const AMBER_DARK = '#d97706';
const AMBER_RIB = '#b45309';
const CARVED_DARK = '#451a03';
const CANDLE = '#fde047';
const TEAL_DARK = '#0f766e';

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export type GhostPose = {
  /** 0 hidden behind the card, 1 fully peeking over it. */
  rise: number;
  /** 1 = hands over the eyes ("I can't see it"). */
  cover: number;
  /** Pupil direction, -1..1. */
  lookX: number;
  lookY: number;
  /** Quill in the right hand, 0..1. */
  quill: number;
};

/** The ghost's pose in a FadeCard scene. Hook: rises on "I can't see it" covering its eyes, uncovers on "Two machines read it". */
export const ghostPose = (mode: string, t: number, beats: number[]): GhostPose => {
  if (mode === 'hook') {
    const b1 = Number.isFinite(beats[1]) ? beats[1] : 2.2;
    const b2 = Number.isFinite(beats[2]) ? beats[2] : b1 + 1.4;
    const rise = easeOutCubic(progress(t, b1 - 0.35, 0.55));
    const cover = easeOutCubic(progress(t, b1 - 0.1, 0.35)) * (1 - easeOutCubic(progress(t, b2, 0.35)));
    const look = easeOutCubic(progress(t, b2, 0.4));
    return { rise, cover, lookX: -0.6 * look, lookY: look, quill: 0 };
  }
  if (mode === 'roster') return { rise: 1, cover: 0, lookX: -0.6, lookY: 1, quill: 0 };
  const quill = mode === 'ladder' ? easeOutCubic(progress(t, 0.35, 0.5)) : 1;
  return { rise: 1, cover: 0, lookX: -1, lookY: 0.7, quill };
};

/** Ghost coordinates: 120 x 150 box; the card's top edge sits at y = EDGE (the body is clipped there). */
const EDGE = 138;

/**
 * The ghost peeking over a card edge. (x, y) is the anchor on the card's top edge, in the parent's
 * coordinates; `scale` sizes it around that anchor.
 */
export const Ghost: React.FC<{ x: number; y: number; scale: number; t: number; pose: GhostPose; id: string }> = ({ x, y, scale, t, pose, id }) => {
  const bob = Math.sin(t * 2.4) * 3 + Math.sin(t * 40) * 1.4 * pose.cover;
  const sink = (1 - pose.rise) * 140;
  const handOp = clamp01((pose.rise - 0.45) * 2.5);
  const restL = { x: 28, y: EDGE + 2 };
  const restR = { x: 92, y: EDGE + 2 };
  const eyeY = 60 + sink + bob;
  const hl = { x: lerp(restL.x, 46, pose.cover), y: lerp(restL.y, eyeY, pose.cover) };
  const hr = { x: lerp(restR.x, 74, pose.cover), y: lerp(restR.y, eyeY, pose.cover) };
  const px = pose.lookX * 3;
  const py = pose.lookY * 3.5;
  const wiggle = pose.quill > 0 ? Math.sin(t * 9) * 5 : 0;
  const clip = `ghost-clip-${id}`;
  return (
    <svg
      width={120}
      height={150}
      viewBox="0 0 120 150"
      style={{
        position: 'absolute',
        left: x - 60,
        top: y - EDGE,
        overflow: 'visible',
        transform: `scale(${scale})`,
        transformOrigin: `60px ${EDGE}px`,
        filter: `drop-shadow(0 0 14px ${alpha(C.accent2, 0.65)})`,
      }}
    >
      <defs>
        <clipPath id={clip}>
          <rect x={-60} y={-80} width={240} height={EDGE + 80} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <g transform={`translate(0 ${sink + bob})`}>
          <path d="M12 160 V62 C12 28 34 6 60 6 C86 6 108 28 108 62 V160 Z" fill={C.text} stroke={C.accentText} strokeWidth={3} />
          <circle cx={32} cy={80} r={7} fill={alpha(C.accent2, 0.35)} />
          <circle cx={88} cy={80} r={7} fill={alpha(C.accent2, 0.35)} />
          {[45, 75].map((ex) => (
            <g key={ex}>
              <ellipse cx={ex} cy={60} rx={8.5} ry={11.5} fill={C.bg0} />
              <circle cx={ex + px + 2} cy={60 + py - 4} r={2.8} fill={C.text} />
            </g>
          ))}
          <ellipse cx={60} cy={90} rx={6} ry={8 - 2 * pose.quill} fill={C.bg0} />
        </g>
      </g>
      {/* The quill in the right hand: the nib touches the card, a little ink curls off it. */}
      {pose.quill > 0 && (
        <g opacity={pose.quill} transform={`translate(${hr.x} ${hr.y}) rotate(${20 + wiggle})`}>
          <path d="M0 12 L3 -2 C14 -26 30 -56 26 -78 C14 -64 4 -36 -3 -2 Z" fill={alpha(C.accent2, 0.95)} stroke={C.accentText} strokeWidth={1.5} />
          <path d="M0 8 C8 -20 18 -48 24 -72" fill="none" stroke={C.text} strokeWidth={1.6} strokeLinecap="round" />
          <path d="M-2 10 L2 10 L0 17 Z" fill={C.bg0} />
        </g>
      )}
      {pose.quill > 0 &&
        [0, 1].map((k) => {
          const ph = (t * 0.9 + k * 0.5) % 1;
          return (
            <path
              key={k}
              d={`M${hr.x + 6 + k * 8} ${hr.y + 10 - ph * 34} c 6 -4 -4 -8 2 -14`}
              fill="none"
              stroke={C.accentText}
              strokeWidth={2.2}
              strokeLinecap="round"
              opacity={pose.quill * Math.sin(Math.PI * ph) * 0.9}
            />
          );
        })}
      {[hl, hr].map((h, i) => {
        const side = i === 0 ? 1 : -1;
        return (
          <g key={i} opacity={handOp} transform={`translate(${h.x} ${h.y}) rotate(${side * -18 * pose.cover}) scale(${side} 1)`}>
            {/* Mitten: palm, thumb towards the middle, two finger grooves. */}
            <path
              d="M-15 4 C-17 -8 -10 -15 0 -15 C10 -15 16 -9 15 0 C19 -2 23 1 21 6 C19 11 13 12 9 12 C2 14 -12 13 -15 4 Z"
              fill={C.text}
              stroke={C.accentText}
              strokeWidth={2.6}
              strokeLinejoin="round"
            />
            <path d="M-6 -14 V-6 M3 -15 V-7" stroke={C.accentText} strokeWidth={2} strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
};

/** A bat, wings flapping with `phase` (radians). (x, y) is its centre. */
export const Bat: React.FC<{ x: number; y: number; size: number; phase: number; opacity?: number }> = ({ x, y, size, phase, opacity = 1 }) => {
  const flap = 0.35 + 0.65 * Math.abs(Math.cos(phase));
  const wing = 'M-5 -2 C-12 -16 -26 -15 -31 -5 C-26 -5 -24 -1 -22 3 C-19 -1 -15 0 -13 4 C-11 0 -8 0 -5 4 Z';
  return (
    <svg
      width={size}
      height={size / 2}
      viewBox="-32 -16 64 32"
      style={{ position: 'absolute', left: x - size / 2, top: y - size / 4, overflow: 'visible', opacity, filter: `drop-shadow(0 0 8px ${alpha(C.accent2, 0.6)})` }}
    >
      <g transform={`scale(1 ${flap})`}>
        <path d={wing} fill={C.accent2} stroke={C.accentText} strokeWidth={1.2} strokeLinejoin="round" />
        <path d={wing} transform="scale(-1 1)" fill={C.accent2} stroke={C.accentText} strokeWidth={1.2} strokeLinejoin="round" />
      </g>
      <path d="M-5 -6 L-4 -12 L-1 -7 L1 -7 L4 -12 L5 -6 C6 2 4 8 0 9 C-4 8 -6 2 -5 -6 Z" fill={C.accent} stroke={C.accentText} strokeWidth={1.2} />
      <circle cx={-2} cy={-3} r={1.3} fill={AMBER} />
      <circle cx={2} cy={-3} r={1.3} fill={AMBER} />
    </svg>
  );
};

export type BatFlight = { t0: number; y: number; size: number };
/** Three bats crossing the top of the hook, right to left, before the ghost comes up. */
export const HOOK_FLOCK: BatFlight[] = [
  { t0: -0.4, y: 80, size: 112 },
  { t0: 0.5, y: 150, size: 90 },
  { t0: 0.9, y: 44, size: 76 },
];
/** A flock crossing the stage right to left; each bat takes 2.6 s from its `t0`. */
export const HookBats: React.FC<{ t: number; flock?: BatFlight[] }> = ({ t, flock = HOOK_FLOCK }) => {
  return (
    <>
      {flock.map((b, i) => {
        const p = (t - b.t0) / 2.6;
        if (p <= 0 || p >= 1) return null;
        return <Bat key={i} x={1020 - p * 1140} y={b.y + Math.sin((t - b.t0) * 3.2 + i) * 14} size={b.size} phase={t * 13 + i * 1.7} />;
      })}
    </>
  );
};

/**
 * A carved jack-o'-lantern (120 x 110). `lit` lights the candle (0 = dark carving), `smoke` puffs a
 * wisp from a blown-out candle.
 */
export const JackOLantern: React.FC<{ lit: number; smoke?: number; t: number; size?: number; style?: React.CSSProperties }> = ({ lit, smoke = 0, t, size = 120, style }) => {
  const flicker = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1);
  const l = clamp01(lit) * flicker;
  const face =
    'M28 56 L48 56 L38 39 Z M72 56 L92 56 L82 39 Z M55 69 L65 69 L60 61 Z ' +
    'M24 76 Q60 104 96 76 L88 78 L82 86 L74 80 L67 90 L60 82 L53 90 L46 80 L38 86 L32 78 Z';
  return (
    <svg
      width={size}
      height={(size * 110) / 120}
      viewBox="0 0 120 110"
      style={{ overflow: 'visible', filter: l > 0.02 ? `drop-shadow(0 0 ${6 + 18 * l}px ${alpha(AMBER, 0.85 * l)})` : undefined, ...style }}
    >
      {smoke > 0 &&
        [0, 1].map((k) => {
          const ph = (t * 0.55 + k * 0.5) % 1;
          return (
            <path
              key={k}
              d={`M${60 + k * 4} ${14 - ph * 22} c 8 -5 -6 -10 2 -16 c 6 -4 -4 -8 1 -12`}
              fill="none"
              stroke="#64748b"
              strokeWidth={4}
              strokeLinecap="round"
              opacity={smoke * Math.sin(Math.PI * ph) * 0.85}
            />
          );
        })}
      <path d="M56 22 C55 14 57 8 63 4 L67 8 C63 11 62 16 63 22 Z" fill={TEAL_DARK} />
      <ellipse cx={36} cy={64} rx={30} ry={42} fill={AMBER_DARK} />
      <ellipse cx={84} cy={64} rx={30} ry={42} fill={AMBER_DARK} />
      <ellipse cx={60} cy={64} rx={30} ry={45} fill={AMBER} />
      <path d="M44 24 C34 50 34 82 44 106 M76 24 C86 50 86 82 76 106" fill="none" stroke={AMBER_RIB} strokeWidth={2.5} opacity={0.7} />
      <path d={face} fill={CARVED_DARK} stroke={CARVED_DARK} strokeWidth={5} strokeLinejoin="round" />
      <path d={face} fill={CANDLE} opacity={clamp01(lit * 1.25)} />
    </svg>
  );
};

/**
 * A small spider hanging on its thread from the top of the stage, swaying. (x, top) is where the
 * thread is tied; `drop` (0..1) lowers it to `len` px below; `size` is the body width.
 */
export const Spider: React.FC<{ x: number; top: number; len: number; drop: number; t: number; size?: number }> = ({ x, top, len, drop, t, size = 54 }) => {
  if (drop <= 0) return null;
  const d = clamp01(drop);
  const sway = Math.sin(t * 1.6) * 5 * d;
  const y = top + len * d + Math.sin(t * 2.3) * 4 * d;
  const legs = [-1, 1].flatMap((side) =>
    [0, 1, 2, 3].map((k) => {
      const wig = Math.sin(t * 6 + k * 1.3 + (side > 0 ? 0.7 : 0)) * 2.5;
      const a = -38 + k * 24;
      const r = (a * Math.PI) / 180;
      const kx = side * (10 + 12 * Math.cos(r));
      const ky = -2 + 12 * Math.sin(r) - 6;
      const fx = side * (17 + 15 * Math.cos(r));
      const fy = ky + 14 + wig;
      return `M${side * 6} ${-2 + k * 2.5} L${kx.toFixed(1)} ${ky.toFixed(1)} L${fx.toFixed(1)} ${fy.toFixed(1)}`;
    }),
  );
  return (
    <svg
      width={size}
      height={size}
      viewBox="-30 -30 60 60"
      style={{ position: 'absolute', left: x + sway - size / 2, top: y - size / 2, overflow: 'visible', opacity: d, filter: `drop-shadow(0 0 8px ${alpha(C.accent2, 0.55)})` }}
    >
      <line x1={-sway * (60 / size)} y1={-((y - top) * 60) / size} x2={0} y2={-10} stroke={alpha(C.text, 0.55)} strokeWidth={1.2} />
      {legs.map((dd, i) => (
        <path key={i} d={dd} fill="none" stroke={C.accentText} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <ellipse cx={0} cy={6} rx={10} ry={12} fill={C.accent} stroke={C.accentText} strokeWidth={1.5} />
      <circle cx={0} cy={-8} r={6.5} fill={C.accent2} stroke={C.accentText} strokeWidth={1.5} />
      <circle cx={-2.4} cy={-9} r={1.6} fill={AMBER} />
      <circle cx={2.4} cy={-9} r={1.6} fill={AMBER} />
    </svg>
  );
};
