// Shared drawing pieces: the ring-in-a-pan style of the Count the Rings video (its squid
// colours, used only for the rings), the tick, the stamp and the refutation tally.
import React from 'react';
import { C, alpha } from '../brand.ts';

/** Ring colours from examples/count-the-rings (src/anim/warm.ts), so the two videos pair. */
export const RING = { squid: '#fbf6ef', shade: '#cfc3b3', metal: '#2a2a35', floor0: '#24242e', floor1: '#121218', glint: '#fbbf24' } as const;

export const SERIF = "Georgia, 'Times New Roman', Times, serif";

export const annulus = (cx: number, cy: number, ro: number, ri: number) => {
  const outer = `M ${cx - ro} ${cy} a ${ro} ${ro} 0 1 0 ${2 * ro} 0 a ${ro} ${ro} 0 1 0 ${-2 * ro} 0 Z`;
  if (ri <= 0.5) return outer;
  return `${outer} M ${cx - ri} ${cy} a ${ri} ${ri} 0 1 0 ${2 * ri} 0 a ${ri} ${ri} 0 1 0 ${-2 * ri} 0 Z`;
};

/** Five rings around the pan wall; `spread` 1 = exactly tangent (each touches both neighbours and the wall). */
export const quintet = (cx: number, cy: number, R: number, spread: number) => {
  const s = Math.sin(Math.PI / 5);
  const ro0 = (R * s) / (1 + s);
  const ro = ro0 * (0.8 + 0.2 * spread);
  const dist = R - ro;
  return Array.from({ length: 5 }, (_, k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
    return { x: cx + dist * Math.cos(a), y: cy + dist * Math.sin(a), ro, ri: ro * 0.52, a };
  });
};

/** SVG: a pan with five rings. `glint` lights the five ring-to-ring contacts. */
export const PanRings: React.FC<{ cx: number; cy: number; R: number; spread: number; glint?: number; id: string; opacity?: number }> = ({ cx, cy, R, spread, glint = 0, id, opacity = 1 }) => {
  const rings = quintet(cx, cy, R, spread);
  const wall = Math.max(8, R * 0.07);
  return (
    <g opacity={opacity}>
      <defs>
        <radialGradient id={`floor-${id}`} cx="0.42" cy="0.38" r="0.75">
          <stop offset="0" stopColor={RING.floor0} />
          <stop offset="1" stopColor={RING.floor1} />
        </radialGradient>
        <linearGradient id={`squid-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={RING.squid} />
          <stop offset="1" stopColor={RING.shade} />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={R + wall} fill={RING.metal} stroke={alpha('#ffffff', 0.14)} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={R} fill={`url(#floor-${id})`} stroke={alpha('#ffffff', 0.22)} strokeWidth={2.5} />
      {rings.map((g, k) => (
        <path key={k} d={annulus(g.x, g.y, g.ro, g.ri)} fillRule="evenodd" fill={`url(#squid-${id})`} stroke={alpha('#ffffff', 0.35)} strokeWidth={1.5} />
      ))}
      {glint > 0 &&
        rings.map((g, k) => {
          const n = rings[(k + 1) % 5];
          const mx = (g.x + n.x) / 2;
          const my = (g.y + n.y) / 2;
          return (
            <g key={`g${k}`} opacity={glint}>
              <circle cx={mx} cy={my} r={R * 0.09} fill={RING.glint} opacity={0.45} style={{ filter: `blur(${R * 0.04}px)` }} />
              <circle cx={mx} cy={my} r={R * 0.035} fill="#fff" />
            </g>
          );
        })}
    </g>
  );
};

/** A green tick in a disc (the same for every claim). */
export const Tick: React.FC<{ size: number; color?: string }> = ({ size, color = C.ok }) => (
  <svg width={size} height={size} viewBox="-40 -40 80 80" style={{ display: 'block' }}>
    <circle r={36} fill={color} />
    <path d="M -17 1 L -5 13 L 18 -12" fill="none" stroke={C.bg0} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const STAMP_TONES = [C.accentText, C.accent2, C.muted, alpha(C.muted, 0.75)];

/** A rubber stamp: bordered capitals, slightly rotated, popping in. */
export const Stamp: React.FC<{ text: string; color: string; pop: number; size: number; rotate?: number; style?: React.CSSProperties }> = ({ text, color, pop, size, rotate = -7, style }) =>
  pop <= 0 ? null : (
    <div
      style={{
        padding: `${size * 0.14}px ${size * 0.38}px`,
        border: `${Math.max(4, size * 0.09)}px solid ${color}`,
        borderRadius: size * 0.22,
        color,
        fontSize: size,
        fontWeight: 900,
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
        background: alpha(C.bg0, 0.82),
        opacity: Math.min(1, pop * 1.4),
        transform: `rotate(${rotate}deg) scale(${1.5 - 0.5 * pop})`,
        ...style,
      }}
    >
      {text}
    </div>
  );

/** "refuted: N" in the top-right corner of the stage. */
export const Tally: React.FC<{ value: number; appear: number; pulse: number; right?: number; top?: number }> = ({ value, appear, pulse, right = 0, top = 0 }) =>
  appear <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        right,
        top,
        padding: '10px 24px',
        borderRadius: 40,
        border: `2px solid ${alpha(value > 0 ? C.rose : C.muted, 0.7)}`,
        background: alpha(C.bg1, 0.9),
        fontSize: 36,
        fontWeight: 700,
        color: C.text,
        opacity: appear,
        transform: `scale(${1 + 0.18 * pulse})`,
        boxShadow: pulse > 0 ? `0 0 ${36 * pulse}px ${alpha(C.rose, 0.8)}` : undefined,
        display: 'flex',
        gap: 12,
        alignItems: 'baseline',
      }}
    >
      <span style={{ color: C.muted }}>refuted:</span>
      <span style={{ color: value > 0 ? C.roseText : C.text, fontWeight: 900, fontSize: 42 }}>{value}</span>
    </div>
  );
