import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { Stage, stageOf } from './Stage.tsx';
import type { AnimProps } from './types.ts';
import { frameState, type LabelId, type VortexProps, type VortexState } from './VortexCore.state.ts';
import { heightScale, radiusScale, type Camera } from './vortex.ts';
import { Pulses, VortexThreads } from './vortexDraw.tsx';
import { Formula } from './labels.tsx';

/** Pixels per unit radius at zoom 1. */
export const RADIUS_PX = 360;

export const cameraOf = (s: VortexState, w: number, h: number): Camera => ({
  cx: w / 2 + s.params.dx,
  cy: h / 2 + s.params.dy,
  scale: RADIUS_PX * s.params.zoom,
  elev: s.params.elev,
  angle: s.angle,
  tau: s.params.tau,
});

export const VortexCore: React.FC<AnimProps & VortexProps> = ({ t, beats, dur, vertical, mode, clock, knots }) => {
  const s = frameState({ mode, clock, knots }, t, beats, dur);
  const { w, h } = stageOf(vertical);
  const cam = cameraOf(s, w, h);
  const p = s.params;
  return (
    <Stage vertical={vertical} fill>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <Pulses cam={cam} opacity={s.pulses.opacity} phase={s.pulses.phase} id="vc" />
        <Ghosts s={s} cam={cam} />
        <VortexThreads cam={cam} coil={p.coil} glow={p.glow} axial={p.axial} dashed={s.dashed} flow={p.spin > 0.05 ? s.flow : null} idPrefix="vc" />
        <Flares s={s} cam={cam} />
      </svg>
      {s.question.opacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: cam.cx - 100,
            top: cam.cy - 120,
            width: 200,
            textAlign: 'center',
            fontSize: 190,
            fontWeight: 800,
            color: C.text,
            opacity: s.question.opacity * (0.7 + 0.3 * s.question.pulse),
            transform: `scale(${0.94 + 0.08 * s.question.pulse})`,
            textShadow: `0 0 40px ${alpha(C.accent2, 0.9)}`,
          }}
        >
          ?
        </div>
      )}
      <Title s={s} w={w} />
      <Clock s={s} />
      <Gauge s={s} w={w} />
      <Skater s={s} w={w} h={h} />
      <Labels s={s} w={w} h={h} />
    </Stage>
  );
};

const Title: React.FC<{ s: VortexState; w: number }> = ({ s, w }) => {
  if (s.title.opacity <= 0) return null;
  const k = s.title.shrink;
  const size = 118 - 64 * k;
  // A light band sweeps across the title, so it brightens and dims as it passes.
  const sweep = ((s.T * 0.42) % 1.6) * 100 - 30;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: w,
        top: 70 - 70 * k,
        textAlign: 'center',
        fontSize: size,
        fontWeight: 800,
        lineHeight: 1.04,
        letterSpacing: '-0.025em',
        opacity: s.title.opacity,
      }}
    >
      <span
        style={{
          backgroundImage: `linear-gradient(100deg, ${C.text} ${sweep - 30}%, ${C.accentText} ${sweep}%, ${C.accent2} ${sweep + 8}%, ${C.text} ${sweep + 34}%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(0 4px 24px ${alpha(C.bg0, 0.9)})`,
        }}
      >
        Navier–Stokes{k < 0.5 ? <br /> : ' '}blows up
      </span>
    </div>
  );
};

/** Corner clock: the time left, τ, running down toward the singular time t = 1. */
const Clock: React.FC<{ s: VortexState }> = ({ s }) => {
  if (s.clock.opacity <= 0) return null;
  const R = 62;
  const left = s.clock.left;
  const a = 2 * Math.PI * left;
  const x = 80 + R * Math.sin(a);
  const y = 80 - R * Math.cos(a);
  const large = left > 0.5 ? 1 : 0;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, opacity: s.clock.opacity }}>
      <svg width={260} height={250} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="clk" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.accent} />
            <stop offset="1" stopColor={C.accent2} />
          </linearGradient>
        </defs>
        <circle cx={80} cy={80} r={R} stroke={alpha(C.muted, 0.3)} strokeWidth={12} fill={alpha(C.bg0, 0.6)} />
        {left > 0.002 && (
          <path d={left >= 0.999 ? `M80 ${80 - R} A${R} ${R} 0 1 1 79.9 ${80 - R}` : `M80 ${80 - R} A${R} ${R} 0 ${large} 1 ${x} ${y}`} stroke="url(#clk)" strokeWidth={12} fill="none" strokeLinecap="round" />
        )}
        <text x={80} y={98} textAnchor="middle" fontSize={50} fontWeight={700} fill={C.text} fontStyle="italic">
          τ
        </text>
        <text x={156} y={34} fontSize={30} fontWeight={600} fill={C.muted}>
          t = 1
        </text>
        <line x1={80} y1={80 - R - 14} x2={80} y2={80 - R + 14} stroke={C.text} strokeWidth={4} />
        <text x={2} y={196} fontSize={34} fontWeight={600} fill={C.text}>
          τ = time left
        </text>
      </svg>
    </div>
  );
};

/** Speed gauge without numbers: only the needle reaching ∞ / leaving the dial means anything. */
const Gauge: React.FC<{ s: VortexState; w: number }> = ({ s, w }) => {
  const g = s.gauge;
  if (g.opacity <= 0) return null;
  const R = 92;
  const cx = w - 120;
  // In the hook the shrunk title sits on the top line: drop the dial below it so the arc never
  // touches "blows up" (they used to graze at ~1 px).
  const cy = 150 + 46 * s.title.opacity * s.title.shrink;
  const turn = -90 + 180 * g.needle + 70 * g.leave;
  const out = 1 + 1.8 * g.leave;
  const rad = (turn * Math.PI) / 180;
  const nx = cx + R * 0.92 * out * Math.sin(rad);
  const ny = cy - R * 0.92 * out * Math.cos(rad);
  const fromX = cx + R * 0.95 * g.leave * Math.sin(rad);
  const fromY = cy - R * 0.95 * g.leave * Math.cos(rad);
  return (
    <svg width={w} height={330} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: g.opacity }}>
      <defs>
        <linearGradient id="gg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.accent} />
          <stop offset="1" stopColor={C.accent2} />
        </linearGradient>
      </defs>
      <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`} stroke={alpha(C.muted, 0.35)} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path
        d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R * Math.sin(Math.min(Math.PI / 2, (turn * Math.PI) / 180))} ${cy - R * Math.cos(Math.min(Math.PI / 2, (turn * Math.PI) / 180))}`}
        stroke="url(#gg)"
        strokeWidth={14}
        fill="none"
        strokeLinecap="round"
      />
      <line x1={fromX} y1={fromY} x2={nx} y2={ny} stroke={C.text} strokeWidth={7} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 ${8 + 20 * g.leave}px ${alpha(C.accent2, 0.9)})` }} />
      <circle cx={cx} cy={cy} r={11} fill={C.text} opacity={1 - g.leave * 0.6} />
      <text x={cx} y={cy + 52} textAnchor="middle" fontSize={32} fontWeight={600} fill={C.muted}>
        speed
      </text>
      <text x={cx + R + 8} y={cy - 18} fontSize={64} fontWeight={800} fill={C.accentText} opacity={g.inf}>
        ∞
      </text>
    </svg>
  );
};

/** Ghosted snapshots of the core at t₁, t₂, t₃: thinner much faster than shorter. */
const Ghosts: React.FC<{ s: VortexState; cam: Camera }> = ({ s, cam }) => (
  <g>
    {s.ghosts.map((g, i) => {
      if (g.opacity <= 0) return null;
      const rw = 0.5 * radiusScale(g.tau) * cam.scale;
      const rh = 1.15 * heightScale(g.tau) * cam.scale;
      return (
        <g key={g.label} opacity={g.opacity}>
          <rect x={cam.cx - rw} y={cam.cy - rh} width={2 * rw} height={2 * rh} rx={rw} stroke={C.muted} strokeWidth={2.5} strokeDasharray="10 9" fill="none" />
          <text x={cam.cx + rw + 12} y={cam.cy - rh + 40 + i * 4} fontSize={44} fontWeight={700} fill={C.text} fontStyle="italic">
            t
            <tspan fontSize={30} dy={10} fontStyle="normal">
              {i + 1}
            </tspan>
          </text>
        </g>
      );
    })}
  </g>
);

/** Balance: every arrow flares out (everything diverges), then the flares cancel to a calm glow. */
const Flares: React.FC<{ s: VortexState; cam: Camera }> = ({ s, cam }) => {
  const f = s.flares;
  if (f.opacity <= 0) return null;
  const n = 12;
  const len = (1 - f.cancel) * (150 + 40 * Math.sin(s.T * 9));
  return (
    <g opacity={f.opacity}>
      <defs>
        <radialGradient id="calm">
          <stop offset="0" stopColor={C.accent2} stopOpacity={0.7} />
          <stop offset="1" stopColor={C.accent} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cam.cx} cy={cam.cy} r={70 + 90 * f.cancel} fill="url(#calm)" opacity={0.25 + 0.75 * f.cancel} />
      {len > 2 &&
        Array.from({ length: n }, (_, i) => {
          const a = (i / n) * 2 * Math.PI + 0.2;
          const r0 = 70;
          const x0 = cam.cx + r0 * Math.cos(a);
          const y0 = cam.cy + r0 * Math.sin(a);
          const x1 = cam.cx + (r0 + len) * Math.cos(a);
          const y1 = cam.cy + (r0 + len) * Math.sin(a);
          const hx = (k: number) => x1 - 22 * Math.cos(a + k);
          const hy = (k: number) => y1 - 22 * Math.sin(a + k);
          return (
            <g key={i} stroke={i % 2 ? C.accent2 : C.accentText} strokeWidth={6} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${alpha(C.accent2, 0.8)})` }}>
              <line x1={x0} y1={y0} x2={x1} y2={y1} />
              <polyline points={`${hx(0.5)},${hy(0.5)} ${x1},${y1} ${hx(-0.5)},${hy(-0.5)}`} fill="none" />
            </g>
          );
        })}
    </g>
  );
};

/** Line skater pulling in their arms; the arm span follows the core radius. */
const Skater: React.FC<{ s: VortexState; w: number; h: number }> = ({ s, w, h }) => {
  const k = s.skater;
  if (k.opacity <= 0) return null;
  const cx = w - 170;
  const top = h / 2 - 210;
  const half = 26 + 120 * k.span;
  const shoulderY = top + 92;
  const armY = shoulderY + 10 + (1 - k.span) * 28;
  const stroke = { stroke: C.text, strokeWidth: 9, strokeLinecap: 'round' as const, fill: 'none' };
  // Spin marks speed up as the arms come in.
  const spin = s.T * (2.2 / Math.max(0.2, k.span));
  return (
    <svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: k.opacity }}>
      <ellipse cx={cx} cy={top + 400} rx={120} ry={20} stroke={alpha(C.muted, 0.4)} strokeWidth={3} fill="none" />
      {[0, 1, 2].map((i) => {
        const a = spin + (i * 2 * Math.PI) / 3;
        return (
          <path
            key={i}
            d={`M${cx + 140 * Math.cos(a)} ${top + 400 + 22 * Math.sin(a)} A140 22 0 0 1 ${cx + 140 * Math.cos(a + 0.9)} ${top + 400 + 22 * Math.sin(a + 0.9)}`}
            stroke={C.accentText}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={top + 40} r={30} {...stroke} />
      <line x1={cx} y1={top + 72} x2={cx} y2={top + 230} {...stroke} />
      <polyline points={`${cx - half},${armY} ${cx - 18},${shoulderY} ${cx + 18},${shoulderY} ${cx + half},${armY}`} {...stroke} stroke={C.accentText} />
      <polyline points={`${cx - 46},${top + 395} ${cx},${top + 230} ${cx + 10},${top + 395}`} {...stroke} />
      <line x1={cx - 76} y1={top + 398} x2={cx - 16} y2={top + 398} {...stroke} strokeWidth={6} />
    </svg>
  );
};

const LABEL_ROWS: Record<LabelId, number> = { radius: 0, peak: 1, energy: 2, h: 1, pushed: 1, alone: 1 };

const Labels: React.FC<{ s: VortexState; w: number; h: number }> = ({ s, w, h }) => (
  <>
    {s.labels.map((l) => {
      if (l.opacity <= 0) return null;
      const row = LABEL_ROWS[l.id];
      const top = h - 290 + row * 92;
      return (
        <div key={l.id} style={{ position: 'absolute', left: 0, width: w, top, display: 'flex', justifyContent: 'center', opacity: l.opacity, transform: `translateY(${(1 - l.opacity) * 16}px)` }}>
          <div
            style={{
              padding: '10px 26px',
              borderRadius: 18,
              background: alpha(C.bg0, 0.78),
              border: `2px solid ${alpha(l.id === 'alone' ? C.muted : C.accent, 0.5)}`,
              fontSize: l.id === 'energy' ? 40 : l.id === 'pushed' || l.id === 'alone' ? 42 : 52,
              fontWeight: 700,
              color: l.id === 'energy' || l.id === 'alone' ? C.muted : C.text,
            }}
          >
            <Formula id={l.id} />
          </div>
        </div>
      );
    })}
  </>
);

export { GRADIENT };
