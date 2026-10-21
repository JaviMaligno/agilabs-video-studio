// Drawing pieces shared by the rigged-gauge scenes: the analog gauge (face, needle, readout,
// "what I expected" arc, the magnet behind the face), the magnifier, stamps and the case tag.
// Everything is SVG in stage pixels (960 x 1090 in the vertical cut). Brand tokens only.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { stageOf } from './Stage.tsx';
import { angleOf, arcPath, polar } from './gauge.ts';

/** Full-stage SVG canvas in stage pixels. */
export const Canvas: React.FC<{ vertical: boolean; children: React.ReactNode }> = ({ vertical, children }) => {
  const s = stageOf(vertical);
  return (
    <svg
      width={s.w}
      height={s.h}
      viewBox={`0 0 ${s.w} ${s.h}`}
      style={{ position: 'absolute', top: s.top, left: s.side, overflow: 'visible', fontFamily }}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <radialGradient id="face" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#22222e" />
          <stop offset="100%" stopColor={C.card} />
        </radialGradient>
      </defs>
      {children}
    </svg>
  );
};

/** A horseshoe magnet in local coordinates, opening towards -y, size s. */
export const MagnetGlyph: React.FC<{ s: number; opacity?: number; glow?: number }> = ({ s, opacity = 1, glow = 0 }) => {
  const w = s * 0.32;
  const h = s / 2;
  return (
    <g opacity={opacity}>
      {glow > 0 && (
        <circle cx={0} cy={0} r={s * 0.75} fill={alpha(C.rose, 0.35 * glow)} filter="url(#soft)" />
      )}
      <path
        d={`M ${-h} ${-h * 0.9} L ${-h} 0 A ${h} ${h} 0 0 0 ${h} 0 L ${h} ${-h * 0.9}`}
        fill="none"
        stroke={C.rose}
        strokeWidth={w}
        strokeLinecap="butt"
      />
      <rect x={-h - w / 2} y={-h * 0.9 - w * 0.75} width={w} height={w * 0.75} fill={C.text} />
      <rect x={h - w / 2} y={-h * 0.9 - w * 0.75} width={w} height={w * 0.75} fill={C.text} />
    </g>
  );
};

export type MagnetSpec = {
  /** Reading the magnet sits behind (it pulls the needle there). */
  v: number;
  opacity: number;
  /** 0..1: plucked out and away. */
  out?: number;
  /** 0..1: highlighted (glow). */
  glow?: number;
  /** 0..1: a "−" badge next to it. */
  minus?: number;
};

export type GaugeSpec = {
  cx: number;
  cy: number;
  r: number;
  /** Needle reading 0..1. */
  value: number;
  opacity?: number;
  /** Faint needles (e.g. "random bugs would point both ways"). */
  ghosts?: number[];
  ghostOpacity?: number;
  expected?: { from: number; to: number; opacity: number; label?: string; labelSize?: number; labelAt?: { x: number; y: number; anchor: 'start' | 'middle' | 'end' } };
  /** A shaded band of true readings, in green. */
  band?: { from: number; to: number; opacity: number };
  readout?: string;
  readoutOpacity?: number;
  readoutColor?: string;
  readoutSize?: number;
  /** 0..1: a crack drawn across the glass. */
  crack?: number;
  /** 0..1: the face lifted like a lid, exposing what is behind it. */
  lift?: number;
  /** 0..1: magnets seen faintly through the face. */
  xray?: number;
  magnets?: MagnetSpec[];
  /** 0..1: green tint on the rim (a DONE gauge). */
  okRim?: number;
};

const Magnets: React.FC<{ g: GaugeSpec; through?: boolean }> = ({ g, through }) => (
  <>
    {(g.magnets ?? []).map((m, i) => {
      const at = polar(g.cx, g.cy, g.r * 0.6, m.v);
      const dir = polar(0, 0, 1, m.v);
      const out = m.out ?? 0;
      const x = at.x + dir.x * out * g.r * 1.1;
      const y = at.y + dir.y * out * g.r * 1.1;
      const op = through ? m.opacity * (g.xray ?? 0) * 0.55 : m.opacity * Math.max(0, 1 - 1.4 * out);
      if (op <= 0.001) return null;
      return (
        <g key={i} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angleOf(m.v).toFixed(2)})`}>
          <MagnetGlyph s={g.r * 0.22} opacity={op} glow={through ? 0.6 : (m.glow ?? 0)} />
          {!through && (m.minus ?? 0) > 0 && (
            <g transform={`rotate(${-angleOf(m.v)}) translate(${-g.r * 0.2} ${-g.r * 0.02})`} opacity={m.minus}>
              <circle r={g.r * 0.085} fill={C.rose} />
              <text x={0} y={g.r * 0.035} fontSize={g.r * 0.13} fontWeight={800} textAnchor="middle" fill={C.text}>
                −
              </text>
            </g>
          )}
        </g>
      );
    })}
  </>
);

export const Gauge: React.FC<{ g: GaugeSpec }> = ({ g }) => {
  const { cx, cy, r } = g;
  const lift = g.lift ?? 0;
  const tip = polar(cx, cy, r * 0.8, g.value);
  const tail = polar(cx, cy, -r * 0.14, g.value);
  // Tapered needle: wide at the hub, sharp at the tip.
  const na = (angleOf(g.value) * Math.PI) / 180;
  const w = Math.max(3, r * 0.035);
  const perp = { x: w * Math.cos(na), y: w * Math.sin(na) };
  const side1 = { x: cx + perp.x, y: cy + perp.y };
  const side2 = { x: cx - perp.x, y: cy - perp.y };
  const ticks = Array.from({ length: 21 }, (_, i) => i / 20);
  // Rim to rim, with two short branches, so it reads as cracked glass rather than a plotted line.
  const pts = (list: number[][]) => list.map(([x, y]) => `${(cx + x * r).toFixed(1)},${(cy + y * r).toFixed(1)}`).join(' ');
  const crackPts = pts([
    [-0.88, -0.47],
    [-0.72, -0.42],
    [-0.4, -0.3],
    [-0.28, -0.05],
    [0.02, -0.12],
    [0.18, 0.12],
    [0.5, 0.06],
    [0.7, 0.32],
    [0.86, 0.48],
  ]);
  const branchPts = [
    pts([[-0.4, -0.3], [-0.46, -0.58], [-0.38, -0.74]]),
    pts([[0.5, 0.06], [0.66, -0.12], [0.8, -0.18]]),
  ];
  const crackP = g.crack ?? 0;
  const ex = g.expected;
  const auto = ex ? polar(cx, cy, r * 1.16, (ex.from + ex.to) / 2) : null;
  const labelAt = ex?.labelAt ?? (auto ? { x: auto.x, y: auto.y, anchor: auto.x < cx - 4 ? 'end' : auto.x > cx + 4 ? 'start' : 'middle' } : null);
  return (
    <g opacity={g.opacity ?? 1}>
      {/* back plate: what sits behind the face */}
      <circle cx={cx} cy={cy} r={r * 1.02} fill={C.plate} stroke={alpha(C.muted, 0.25)} strokeWidth={2} />
      <Magnets g={g} />
      {/* the face (lifts like a lid) */}
      <g transform={`translate(0 ${(-lift * r * 0.75).toFixed(2)})`} opacity={1 - 0.72 * lift}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="url(#face)"
          stroke={(g.okRim ?? 0) > 0 ? alpha(C.ok, 0.4 + 0.5 * (g.okRim ?? 0)) : alpha(C.accentText, 0.45)}
          strokeWidth={Math.max(2, r * 0.025)}
        />
        {g.band && g.band.opacity > 0 && (
          <path
            d={arcPath(cx, cy, r * 0.88, g.band.from, g.band.to)}
            stroke={alpha(C.ok, 0.85 * g.band.opacity)}
            strokeWidth={r * 0.13}
            fill="none"
          />
        )}
        {ex && ex.opacity > 0 && (
          <path
            d={arcPath(cx, cy, r * 0.88, ex.from, ex.to)}
            stroke={alpha(C.accent2, 0.75 * ex.opacity)}
            strokeWidth={r * 0.13}
            fill="none"
            filter="url(#glow)"
          />
        )}
        <path d={arcPath(cx, cy, r * 0.8, 0, 1)} stroke={alpha(C.muted, 0.55)} strokeWidth={Math.max(2, r * 0.014)} fill="none" />
        {ticks.map((v, i) => {
          const major = i % 5 === 0;
          const a = polar(cx, cy, r * 0.8, v);
          const b = polar(cx, cy, r * (major ? 0.67 : 0.73), v);
          return <line key={v} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={alpha(C.muted, major ? 0.95 : 0.6)} strokeWidth={Math.max(2, r * (major ? 0.022 : 0.012))} />;
        })}
        {crackP > 0 && (
          <g>
            {crackP < 1 && <circle cx={cx} cy={cy} r={r * 0.97} fill={alpha(C.text, 0.16 * Math.sin(Math.PI * crackP))} />}
            <polyline
              points={crackPts}
              fill="none"
              stroke={alpha(C.text, 0.85)}
              strokeWidth={Math.max(2, r * 0.014)}
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - crackP}
              strokeLinejoin="bevel"
            />
            {branchPts.map((bp) => (
              <polyline
                key={bp}
                points={bp}
                fill="none"
                stroke={alpha(C.text, 0.6)}
                strokeWidth={Math.max(1.5, r * 0.009)}
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - Math.max(0, Math.min(1, (crackP - 0.5) * 2))}
                strokeLinejoin="bevel"
              />
            ))}
          </g>
        )}
      </g>
      {ex && ex.opacity > 0 && ex.label && labelAt && (
        <text
          x={labelAt.x}
          y={labelAt.y}
          fontSize={ex.labelSize ?? r * 0.13}
          fontWeight={700}
          fill={C.accentText}
          opacity={ex.opacity}
          textAnchor={labelAt.anchor}
        >
          {ex.label}
        </text>
      )}
      <Magnets g={g} through />
      {(g.ghosts ?? []).map((v, i) => {
        const p = polar(cx, cy, r * 0.78, v);
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={alpha(C.muted, 0.9)} strokeWidth={r * 0.025} strokeLinecap="round" opacity={g.ghostOpacity ?? 0} />
        );
      })}
      <polygon points={`${tip.x},${tip.y} ${side1.x},${side1.y} ${tail.x},${tail.y} ${side2.x},${side2.y}`} fill={C.text} />
      <circle cx={cx} cy={cy} r={Math.max(6, r * 0.07)} fill={C.accent} stroke={C.text} strokeWidth={Math.max(2, r * 0.015)} />
      {g.readout && (
        <text
          x={cx}
          y={cy + r * 0.55}
          fontSize={g.readoutSize ?? r * 0.2}
          fontWeight={800}
          textAnchor="middle"
          fill={g.readoutColor ?? C.text}
          opacity={g.readoutOpacity ?? 1}
        >
          {g.readout}
        </text>
      )}
    </g>
  );
};

/** Magnifying glass: lens centred on (x, y), radius m. */
export const Magnifier: React.FC<{ x: number; y: number; m: number; opacity: number }> = ({ x, y, m, opacity }) =>
  opacity <= 0 ? null : (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={m} fill={alpha(C.accentText, 0.1)} stroke={C.text} strokeWidth={m * 0.1} />
      <line x1={x + m * 0.72} y1={y + m * 0.72} x2={x + m * 1.55} y2={y + m * 1.55} stroke={C.text} strokeWidth={m * 0.22} strokeLinecap="round" />
    </g>
  );

/** A rubber stamp: bold uppercase text in a box, rotated, slammed in by `scale`. */
export const Stamp: React.FC<{
  x: number;
  y: number;
  text: string;
  size: number;
  color: string;
  scale: number;
  opacity?: number;
  rotate?: number;
  lines?: string[];
}> = ({ x, y, text, size, color, scale, opacity = 1, rotate = -8, lines }) => {
  if (scale <= 0 || opacity <= 0) return null;
  const rows = lines ?? [text];
  const longest = Math.max(...rows.map((l) => l.length));
  const w = longest * size * 0.68 + size * 1.2;
  const h = rows.length * size * 1.15 + size * 0.7;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={size * 0.25} fill={alpha(C.bg0, 0.88)} stroke={color} strokeWidth={size * 0.13} />
      {rows.map((l, i) => (
        <text
          key={i}
          x={0}
          y={-h / 2 + size * 0.35 + (i + 0.85) * size * 1.15}
          fontSize={size}
          fontWeight={900}
          letterSpacing={size * 0.04}
          textAnchor="middle"
          fill={color}
        >
          {l}
        </text>
      ))}
    </g>
  );
};

/** The corner tag of a case: "1 · a word detector". */
export const CaseTag: React.FC<{ n: string; text: string; opacity: number }> = ({ n, text, opacity }) => (
  <g opacity={opacity}>
    <rect x={0} y={0} width={64} height={64} rx={16} fill={C.accent} />
    <text x={32} y={45} fontSize={40} fontWeight={800} textAnchor="middle" fill={C.text}>
      {n}
    </text>
    <text x={84} y={45} fontSize={38} fontWeight={700} fill={C.text}>
      {text}
    </text>
  </g>
);
