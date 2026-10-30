// Halloween variant (SETTINGS.halloween): small SVG drawings used by the components that branch on
// the flag. Brand palette only: off-white ghosts, violet bats, stone in the card greys, amber and
// teal accents. Nothing here is drawn when the flag is off.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { SETTINGS } from '../settings.ts';
import { SERIF } from './pieces.tsx';

export const HALLOWEEN = SETTINGS.halloween === true;

/** Accents for the variant: amber (candle light, eyes) and teal (grass). */
export const HW = { amber: '#f59e0b', amberSoft: '#fbbf24', teal: '#2dd4bf', stone0: '#3b3b4c', stone1: '#23232f' } as const;

/** Half-sine bump, exactly 0 outside 0..1. */
export const bump = (q: number) => (q <= 0 || q >= 1 ? 0 : Math.sin(Math.PI * q));

/** A small sheet ghost, centred on (0,0), `size` px tall. `blink` 1 = eyes closed. */
export const Ghost: React.FC<{ x: number; y: number; size: number; opacity?: number; t: number; tilt?: number; look?: number }> = ({ x, y, size, opacity = 1, t, tilt = 0, look = 0 }) => {
  if (opacity <= 0) return null;
  const k = size / 100;
  const w = Math.sin(t * 7) * 4;
  const hem = `Q 30 ${44 + w} 20 50 Q 10 ${58 - w} 0 50 Q -10 ${44 + w} -20 50 Q -30 ${58 - w} -40 50`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${k})`} opacity={opacity}>
      <ellipse cx={0} cy={4} rx={50} ry={58} fill={alpha(C.text, 0.12)} />
      <path d={`M -40 50 L -40 -8 A 40 40 0 0 1 40 -8 L 40 50 ${hem} Z`} fill={C.text} />
      <ellipse cx={-14 + look * 4} cy={-10} rx={7} ry={10} fill={C.bg0} />
      <ellipse cx={14 + look * 4} cy={-10} rx={7} ry={10} fill={C.bg0} />
      <ellipse cx={look * 3} cy={14} rx={6} ry={7.5} fill={C.bg0} />
    </g>
  );
};

/** A bat silhouette, centred on (0,0), `span` px wide; `flap` in -1..1 raises or lowers the wings. */
export const Bat: React.FC<{ x: number; y: number; span: number; flap: number; opacity?: number }> = ({ x, y, span, flap, opacity = 1 }) => {
  const k = span / 100;
  const wing = 'M 4 0 C 12 -10 26 -16 48 -12 C 42 -6 41 0 42 6 C 36 2 30 3 27 9 C 23 4 17 4 14 10 C 11 5 7 4 4 4 Z';
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} opacity={opacity}>
      <g transform={`scale(1 ${0.55 + 0.45 * Math.abs(flap)}) ${flap < 0 ? 'scale(1 -1)' : ''}`}>
        <path d={wing} fill={C.accent2} />
        <path d={wing} fill={C.accent2} transform="scale(-1 1)" />
      </g>
      <ellipse cx={0} cy={2} rx={6} ry={9} fill={C.accent2} />
      <path d="M -5 -5 L -3 -12 L -1 -6 Z M 5 -5 L 3 -12 L 1 -6 Z" fill={C.accent2} />
      <circle cx={-2.2} cy={-1} r={1.4} fill={HW.amberSoft} />
      <circle cx={2.2} cy={-1} r={1.4} fill={HW.amberSoft} />
    </g>
  );
};

/** A tuft of grass (teal), base centred on (x, y). */
export const Grass: React.FC<{ x: number; y: number; w: number; sway: number }> = ({ x, y, w, sway }) => {
  const n = 6;
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }, (_, i) => {
        const bx = (i / (n - 1) - 0.5) * w;
        const h = 18 + ((i * 7) % 5) * 4;
        const lean = (i - n / 2) * 2.2 + sway * 3;
        return <path key={i} d={`M ${bx - 3} 0 Q ${bx + lean * 0.4} ${-h * 0.6} ${bx + lean} ${-h} Q ${bx + lean * 0.3 + 2} ${-h * 0.5} ${bx + 4} 0 Z`} fill={alpha(HW.teal, 0.55 + 0.08 * (i % 2))} />;
      })}
    </g>
  );
};

/**
 * A rounded headstone (HTML box with an SVG body) for a refuted version: "RIP" and the version
 * carved in, the reason as its epitaph, a crack or two and grass at the foot.
 */
export const Tombstone: React.FC<{ w: number; h: number; version: string; epitaph: string; seed: number; t: number }> = ({ w, h, version, epitaph, seed, t }) => {
  const r = w / 2 - 14;
  const body = `M 14 ${h} L 14 ${r + 14} A ${r} ${r} 0 0 1 ${w - 14} ${r + 14} L ${w - 14} ${h} Z`;
  const cracks = [
    `M ${w - 40} ${r * 0.5} l -14 22 l 10 10 l -16 26`,
    `M 22 ${h * 0.62} l 18 8 l -6 14 l 16 10`,
    `M ${w * 0.55} 22 l -8 18 l 12 8`,
  ];
  const carved: React.CSSProperties = { textShadow: `0 2px 0 ${alpha('#000000', 0.55)}, 0 -1px 0 ${alpha('#ffffff', 0.12)}` };
  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={w} height={h}>
        <defs>
          <linearGradient id={`stone-${seed}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={HW.stone0} />
            <stop offset="1" stopColor={HW.stone1} />
          </linearGradient>
        </defs>
        <path d={body} fill={`url(#stone-${seed})`} stroke={alpha(C.muted, 0.5)} strokeWidth={3} />
        <path d={`M 30 ${h} L 30 ${r + 18} A ${r - 16} ${r - 16} 0 0 1 ${w - 30} ${r + 18} L ${w - 30} ${h}`} fill="none" stroke={alpha('#000000', 0.35)} strokeWidth={2} />
        {[cracks[seed % 3], cracks[(seed + 1) % 3]].map((d, i) => (
          <path key={i} d={d} fill="none" stroke={alpha(C.bg0, 0.85)} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <Grass x={34} y={h + 2} w={46} sway={Math.sin(t * 2 + seed)} />
        <Grass x={w - 30} y={h + 2} w={36} sway={Math.sin(t * 2.3 + seed * 2)} />
      </svg>
      <div style={{ position: 'absolute', left: 24, right: 24, top: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontFamily: SERIF, color: alpha(C.text, 0.9), ...carved }}>
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: '0.16em', lineHeight: 1 }}>RIP</div>
        <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.05, marginTop: 4 }}>{version}</div>
        <div style={{ width: '62%', height: 2, background: alpha(C.muted, 0.45), margin: '10px 0 12px' }} />
        <div style={{ fontSize: 29, fontStyle: 'italic', lineHeight: 1.18, color: alpha(C.text, 0.82) }}>{epitaph}</div>
      </div>
    </div>
  );
};
