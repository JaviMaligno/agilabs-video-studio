// Shared drawing pieces of this video: the pitch frame (real or stylised), players, arrows, the
// ball, the weighted marker, the confidence cloud, tags, stamps and the 60 kB black box. Brand
// tokens only (brand.ts) and Inter. Pure drawing: every number comes from a frameState.
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { Box, Pt, View } from './pitch.ts';
import { gradientText } from './Stage.tsx';

export { gradientText };

/** Pixels per metre of a view drawn in a box (the box keeps the view's aspect). */
export const scaleOf = (view: View, box: Box): number => box.w / (view.x1 - view.x0);
/** Metres → pixels inside the box. */
export const toPx = (view: View, box: Box) => {
  const k = scaleOf(view, box);
  return (q: Pt) => ({ x: (q.x - view.x0) * k, y: (q.y - view.y0) * k });
};

/** Full-pitch markings (metres, 105 x 68). */
const Markings: React.FC<{ sw: number }> = ({ sw }) => {
  const line = { fill: 'none', stroke: alpha(C.muted, 0.42), strokeWidth: sw } as const;
  return (
    <g>
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={i} x={i * 7} y={0} width={7} height={68} fill={i % 2 ? alpha(C.card, 0.55) : 'transparent'} />
      ))}
      <rect x={0} y={0} width={105} height={68} {...line} />
      <line x1={52.5} y1={0} x2={52.5} y2={68} {...line} />
      <circle cx={52.5} cy={34} r={9.15} {...line} />
      {[0, 105].map((gx) => {
        const box = (depth: number, half: number) => <rect x={gx === 0 ? 0 : 105 - depth} y={34 - half} width={depth} height={2 * half} {...line} />;
        return (
          <g key={gx}>
            {box(16.5, 20.16)}
            {box(5.5, 9.16)}
            <rect x={gx === 0 ? -2 : 105} y={30.34} width={2} height={7.32} fill="none" stroke={alpha(C.text, 0.6)} strokeWidth={sw} />
          </g>
        );
      })}
    </g>
  );
};

/** Stylised markings for a mini-pitch: stripes, a border and an arc. */
const MiniMarkings: React.FC<{ view: View; sw: number }> = ({ view, sw }) => {
  const w = view.x1 - view.x0;
  const h = view.y1 - view.y0;
  const n = 6;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={view.x0} y={view.y0 + (i * h) / n} width={w} height={h / n} fill={i % 2 ? alpha(C.card, 0.55) : 'transparent'} />
      ))}
      <circle cx={view.x0 + w / 2} cy={view.y1} r={w * 0.28} fill="none" stroke={alpha(C.muted, 0.35)} strokeWidth={sw} />
    </g>
  );
};

/**
 * A pitch drawn in `box` (frame pixels) showing `view` (metres). `svg` children draw in metres;
 * `html` children draw in pixels inside the pitch box (use toPx).
 */
export const PitchFrame: React.FC<{
  box: Box;
  view: View;
  mini?: boolean;
  credit?: string;
  opacity?: number;
  svg?: React.ReactNode;
  html?: React.ReactNode;
  glow?: number;
}> = ({ box, view, mini, credit, opacity = 1, svg, html, glow = 0 }) => {
  const k = scaleOf(view, box);
  const vw = view.x1 - view.x0;
  const vh = view.y1 - view.y0;
  return (
    <div
      style={{
        position: 'absolute',
        left: box.left,
        top: box.top,
        width: box.w,
        height: box.h,
        borderRadius: 18,
        overflow: 'hidden',
        background: C.bg1,
        opacity,
        boxShadow: `0 0 0 ${2 + 3 * glow}px ${alpha(glow > 0 ? C.accentText : C.muted, 0.18 + 0.5 * glow)}, 0 30px 80px ${alpha(C.accent, 0.12)}`,
      }}
    >
      <svg width={box.w} height={box.h} viewBox={`${view.x0} ${view.y0} ${vw} ${vh}`} style={{ position: 'absolute', inset: 0 }}>
        <Defs />
        {mini ? <MiniMarkings view={view} sw={2 / k} /> : <Markings sw={0.32} />}
        {svg}
      </svg>
      {html}
      {credit && (
        <div style={{ position: 'absolute', right: 14, bottom: 10, fontFamily, fontSize: 22, fontWeight: 500, color: alpha(C.muted, 0.75) }}>{credit}</div>
      )}
    </div>
  );
};

/** Gradients shared by every pitch (identical in every SVG, so duplicate ids are harmless). */
const Defs: React.FC = () => (
  <defs>
    <radialGradient id="ballGlow">
      <stop offset="0%" stopColor={C.accent2} stopOpacity={0.9} />
      <stop offset="100%" stopColor={C.accent2} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="cGlow">
      <stop offset="0%" stopColor={C.accentText} stopOpacity={0.8} />
      <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="cloud">
      <stop offset="0%" stopColor={C.accentText} stopOpacity={0.55} />
      <stop offset="60%" stopColor={C.accent} stopOpacity={0.22} />
      <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
    </radialGradient>
  </defs>
);

export type PlayerDot = Pt & { team: number; bright?: number; opacity?: number };

/** Player dots: one team in the accent text colour, the other in white. */
export const Players: React.FC<{ players: PlayerDot[]; r?: number; dim?: number }> = ({ players, r = 1.55, dim = 0 }) => (
  <g>
    {players.map((q, i) => (
      <circle
        key={i}
        cx={q.x}
        cy={q.y}
        r={r}
        fill={q.team === 0 ? C.accentText : C.text}
        stroke={C.bg0}
        strokeWidth={r * 0.2}
        opacity={(q.opacity ?? 0.95) * (1 - dim)}
      />
    ))}
  </g>
);

/** A running arrow from (x0, y0) to (x1, y1), in metres. */
export const Arrow: React.FC<{ x0: number; y0: number; x1: number; y1: number; opacity: number; w?: number; color?: string }> = ({
  x0,
  y0,
  x1,
  y1,
  opacity,
  w = 0.55,
  color = C.accentText,
}) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 0.8 || opacity <= 0) return null;
  const ux = dx / len;
  const uy = dy / len;
  const hl = Math.min(w * 4, len * 0.5);
  const bx = x1 - ux * hl;
  const by = y1 - uy * hl;
  const hw = w * 2;
  return (
    <g opacity={opacity}>
      <line x1={x0} y1={y0} x2={bx} y2={by} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x1},${y1} ${bx - uy * hw},${by + ux * hw} ${bx + uy * hw},${by - ux * hw}`} fill={color} />
    </g>
  );
};

/** The real ball, with a glow when it is revealed. */
export const Ball: React.FC<{ x: number; y: number; opacity: number; glow?: number; r?: number }> = ({ x, y, opacity, glow = 0, r = 1 }) =>
  opacity > 0 ? (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={r * (2 + 9 * glow)} fill="url(#ballGlow)" opacity={0.4 + 0.6 * glow} />
      <circle cx={x} cy={y} r={r * 2.3} fill="none" stroke={alpha(C.accentText, 0.7)} strokeWidth={r * 0.25} />
      <circle cx={x} cy={y} r={r} fill="#ffffff" />
    </g>
  ) : null;

/** The box's single guess / the velocity-weighted average: an accent point with a glow. */
export const Marker: React.FC<{ x: number; y: number; opacity: number; r?: number }> = ({ x, y, opacity, r = 1.9 }) =>
  opacity > 0 ? (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={r * 2.6} fill="url(#cGlow)" opacity={0.9} />
      <circle cx={x} cy={y} r={r} fill={C.accent} stroke={C.text} strokeWidth={r * 0.18} />
    </g>
  ) : null;

/**
 * The confidence cloud: a soft disc whose radius is the declared uncertainty, with scattered
 * guesses inside it. `bright` 0..1 makes it denser and brighter (very sure).
 */
export const Cloud: React.FC<{ x: number; y: number; r: number; opacity: number; bright?: number; seed?: number }> = ({ x, y, r, opacity, bright = 0, seed = 1 }) => {
  if (opacity <= 0 || r <= 0) return null;
  // Deterministic scatter: a sunflower spiral, so the cloud looks like many guesses.
  const n = 26;
  const dots = Array.from({ length: n }, (_, i) => {
    const a = i * 2.39996 + seed;
    const d = Math.sqrt((i + 0.5) / n) * r * 0.85;
    return { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d };
  });
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={r * 1.25} fill="url(#cloud)" opacity={0.7 + 0.3 * bright} />
      <circle cx={x} cy={y} r={r} fill="none" stroke={alpha(C.accentText, 0.45 + 0.5 * bright)} strokeWidth={Math.max(0.18, r * 0.04)} strokeDasharray={`${r * 0.12} ${r * 0.08}`} />
      {dots.map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={Math.max(0.25, r * 0.045)} fill={C.accentText} opacity={0.55 + 0.45 * bright} />
      ))}
    </g>
  );
};

/** A dashed miss line from a guess to the real ball, drawn `draw` of the way. */
export const MissLine: React.FC<{ from: Pt; to: Pt; draw: number; w?: number }> = ({ from, to, draw, w = 0.42 }) =>
  draw > 0 ? (
    <line
      x1={from.x}
      y1={from.y}
      x2={from.x + (to.x - from.x) * draw}
      y2={from.y + (to.y - from.y) * draw}
      stroke={C.text}
      strokeWidth={w}
      strokeDasharray={`${w * 3} ${w * 2.2}`}
      strokeLinecap="round"
      opacity={0.85}
    />
  ) : null;

/** A small pill label. */
export const Tag: React.FC<{ text: string; opacity: number; accent?: boolean; size?: number; style?: React.CSSProperties }> = ({ text, opacity, accent, size = 40, style }) =>
  opacity > 0 ? (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: `${Math.round(size * 0.28)}px ${Math.round(size * 0.62)}px`,
        borderRadius: 999,
        background: alpha(C.card, 0.94),
        border: `2px solid ${alpha(accent ? C.accentText : C.muted, accent ? 0.7 : 0.45)}`,
        fontFamily,
        fontSize: size,
        fontWeight: 700,
        color: accent ? C.text : C.muted,
        whiteSpace: 'nowrap',
        opacity,
        ...style,
      }}
    >
      {accent && <span style={{ width: size * 0.42, height: size * 0.42, borderRadius: size, background: GRADIENT, display: 'inline-block' }} />}
      {text}
    </div>
  ) : null;

/** A rubber stamp: pops in large and settles, tilted. Brand tones only. */
export const Stamp: React.FC<{ text: string; pop: number; tone?: 'ok' | 'muted' | 'accent'; size?: number; rotate?: number; style?: React.CSSProperties }> = ({
  text,
  pop,
  tone = 'ok',
  size = 64,
  rotate = -6,
  style,
}) => {
  if (pop <= 0) return null;
  const border = tone === 'ok' ? C.accent2 : tone === 'muted' ? C.muted : C.accentText;
  return (
    <div
      style={{
        display: 'inline-block',
        padding: `${Math.round(size * 0.12)}px ${Math.round(size * 0.4)}px`,
        border: `${Math.max(4, Math.round(size / 11))}px solid ${border}`,
        borderRadius: 16,
        background: alpha(C.bg0, 0.92),
        fontFamily,
        fontSize: size,
        fontWeight: 800,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        lineHeight: 1.05,
        whiteSpace: 'nowrap',
        color: tone === 'muted' ? C.muted : tone === 'accent' ? C.accentText : undefined,
        boxShadow: tone === 'muted' ? 'none' : `0 0 40px ${alpha(C.accent, 0.5)}`,
        opacity: Math.min(1, pop * 1.4),
        transform: `rotate(${rotate}deg) scale(${1.8 - 0.8 * Math.min(1, pop)})`,
        ...style,
      }}
    >
      <span style={tone === 'ok' ? gradientText : undefined}>{text}</span>
    </div>
  );
};

/**
 * The 60 kB black box, `w` pixels wide (height 0.78 w). `drawers` 0..1 outlines its three drawers;
 * `open[i]` 0..1 pulls drawer i out; `face` shows the "?" on its front; `lid` 0..1 opens it flat.
 */
/** A drawer's picture: a set square (geometry), a ring of players round a hole (topology), a gauge (confidence). */
const DrawerIcon: React.FC<{ i: number; size: number; color: string }> = ({ i, size, color }) => (
  <svg width={size} height={size} viewBox="-30 -30 60 60" style={{ flex: 'none', overflow: 'visible' }}>
    {i === 0 && (
      <g fill="none" stroke={color} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round">
        <path d="M -24 24 L -24 -24 L 24 24 Z" />
        <path d="M -14 14 L -14 -2 L 2 14 Z" />
        {[-14, -4, 6].map((y) => (
          <line key={y} x1={-24} y1={y} x2={-18} y2={y} />
        ))}
      </g>
    )}
    {i === 1 && (
      <g fill={color}>
        {[0, 1, 2, 3, 4, 5, 6].map((k) => {
          const a = (k / 7) * Math.PI * 2 - Math.PI / 2;
          return <circle key={k} cx={22 * Math.cos(a)} cy={22 * Math.sin(a)} r={5.5} />;
        })}
        <circle r={8} fill="none" stroke={color} strokeWidth={3} strokeDasharray="3 3" />
      </g>
    )}
    {i === 2 && (
      <g fill="none" stroke={color} strokeWidth={4.5} strokeLinecap="round">
        <path d="M -25 12 A 25 25 0 0 1 25 12" />
        <line x1={0} y1={12} x2={14} y2={-10} />
        <circle cx={0} cy={12} r={4} fill={color} />
      </g>
    )}
  </svg>
);

export const BoxGlyph: React.FC<{
  w: number;
  face?: number;
  drawers?: number;
  labels?: string[];
  open?: number[];
  lit?: number[];
  glow?: number;
  lid?: number;
  inside?: React.ReactNode;
}> = ({ w, face = 0, drawers = 0, labels = [], open = [], lit = [], glow = 0.5, lid = 0, inside }) => {
  const h = Math.round(w * 0.78);
  const pad = w * 0.07;
  // Drawers sit under the "60 kB" plate, inside the body (which starts at 0.12 h).
  const top = h * 0.24;
  const dh = (h * 0.88 - top - pad * 0.8) / 3;
  return (
    <div style={{ position: 'relative', width: w, height: h, fontFamily }}>
      {/* The lid, opening flat to the left. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: -h * 0.02,
          width: w,
          height: h * 0.16,
          borderRadius: 14,
          background: C.card,
          border: `3px solid ${alpha(C.accentText, 0.5)}`,
          transformOrigin: '0% 100%',
          transform: `rotate(${-150 * lid}deg)`,
          opacity: 1 - 0.4 * lid,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: h * 0.12,
          width: w,
          height: h * 0.88,
          borderRadius: 22,
          background: `linear-gradient(180deg, ${C.card}, ${C.bg0})`,
          border: `3px solid ${alpha(C.accentText, 0.55)}`,
          boxShadow: `0 0 ${30 + 50 * glow}px ${alpha(C.accent, 0.25 + 0.4 * glow)}`,
          overflow: 'visible',
        }}
      >
        {/* "60 kB" plate. */}
        <div
          style={{
            position: 'absolute',
            right: pad,
            top: pad * 0.6,
            padding: `${w * 0.012}px ${w * 0.035}px`,
            borderRadius: 999,
            background: GRADIENT,
            fontSize: w * 0.075,
            fontWeight: 800,
            color: C.text,
            whiteSpace: 'nowrap',
          }}
        >
          60 kB
        </div>
        {/* The "?" face. */}
        {face > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: face,
              fontSize: w * 0.42,
              fontWeight: 800,
              lineHeight: 1,
              paddingTop: w * 0.08,
            }}
          >
            <span style={gradientText}>?</span>
          </div>
        )}
        {inside && lid > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: lid }}>{inside}</div>
        )}
        {/* Three drawers. */}
        {drawers > 0 &&
          [0, 1, 2].map((i) => {
            const o = open[i] ?? 0;
            const l = lit[i] ?? 0;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: pad,
                  width: w - 2 * pad,
                  top: top + i * dh + dh * 0.08,
                  height: dh * 0.84,
                  borderRadius: 12,
                  border: `3px solid ${alpha(l > 0 ? C.accentText : C.muted, 0.35 + 0.6 * Math.max(l, drawers * 0.4))}`,
                  background: alpha(l > 0 ? C.accent : C.card, 0.15 + 0.3 * l),
                  opacity: drawers,
                  transform: `translateX(${o * w * 0.12}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: w * 0.04,
                  paddingLeft: w * 0.05,
                  fontSize: w * 0.075,
                  fontWeight: 700,
                  color: l > 0 ? C.text : C.muted,
                  whiteSpace: 'nowrap',
                }}
              >
                {labels.length ? (
                  <DrawerIcon i={i} size={w * 0.085} color={l > 0 ? C.accentText : C.muted} />
                ) : (
                  <span style={{ width: w * 0.09, height: w * 0.022, borderRadius: 99, background: alpha(C.text, 0.55), flex: 'none' }} />
                )}
                {labels[i] ?? ''}
              </div>
            );
          })}
      </div>
    </div>
  );
};
