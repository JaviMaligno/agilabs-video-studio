// Drawing pieces shared by the CodeTower, ScalpelVsWreckingBall and VerdictCard scenes: the code
// tower and its test strip, the restart button with its scope dial, the scalpel, the wrecking
// ball and the stamp. Full-frame coordinates (1080x1920); brand colours only.
import React from 'react';
import { C, alpha } from '../brand.ts';
import type { BlockState, LightState } from './tower.state.ts';

const LINES = [
  [0.62, 0.34, 0.5],
  [0.42, 0.7, 0.28],
  [0.3, 0.55, 0.44],
  [0.7, 0.4, 0.58],
  [0.5, 0.26, 0.66],
];

/** A tower of code blocks standing on `base`, centred on `x`. */
export const Tower: React.FC<{
  x: number;
  base: number;
  w: number;
  h: number;
  gap: number;
  blocks: BlockState[];
  opacity?: number;
  scale?: number;
  wobble?: number;
  floor?: boolean;
}> = ({ x, base, w, h, gap, blocks, opacity = 1, scale = 1, wobble = 0, floor = true }) => {
  const n = blocks.length;
  const H = n * (h + gap);
  const lines = h >= 50 ? 3 : 2;
  const lh = Math.max(4, Math.round(h * 0.11));
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: base - H, width: w, height: H, opacity, transform: `scale(${scale}) rotate(${wobble}deg)`, transformOrigin: '50% 100%' }}>
      {blocks.map((b, i) => {
        const top = H - (i + 1) * (h + gap);
        const pat = LINES[i % LINES.length];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top,
              width: w,
              height: h,
              borderRadius: Math.min(12, h * 0.22),
              background: C.card,
              boxShadow: `inset 0 0 0 3px ${alpha(C.accentText, 0.42)}`,
              opacity: b.opacity,
              transform: `translate(${b.dx}px, ${b.dy}px) rotate(${b.rot}deg)`,
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: alpha(C.flat, 0.9), opacity: b.rose }} />
            <div style={{ position: 'absolute', inset: 0, background: alpha(C.ok, 0.9), opacity: b.teal }} />
            {Array.from({ length: lines }, (_, k) => (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  left: w * 0.1 + (k === 1 ? w * 0.06 : 0),
                  top: (h - lines * lh - (lines - 1) * lh) / 2 + k * 2 * lh,
                  width: w * 0.8 * pat[k],
                  height: lh,
                  borderRadius: lh / 2,
                  background: b.rose > 0.5 || b.teal > 0.5 ? alpha(C.bg0, 0.45) : alpha(C.text, 0.26),
                }}
              />
            ))}
          </div>
        );
      })}
      {floor && <div style={{ position: 'absolute', left: -w * 0.18, width: w * 1.36, top: H + 2, height: 5, borderRadius: 3, background: alpha(C.muted, 0.35) }} />}
    </div>
  );
};

/** The test strip: one light per test, teal passing, rose failing, grey not run. */
export const Strip: React.FC<{ x: number; y: number; lights: LightState[]; lw: number; lh?: number; gap?: number; opacity?: number }> = ({
  x,
  y,
  lights,
  lw,
  lh = 16,
  gap = 8,
  opacity = 1,
}) => {
  const W = lights.length * lw + (lights.length - 1) * gap;
  return (
    <div style={{ position: 'absolute', left: x - W / 2, top: y, width: W, height: lh, display: 'flex', gap, opacity }}>
      {lights.map((l, j) => (
        <div key={j} style={{ position: 'relative', width: lw, height: lh, borderRadius: lh / 2, background: alpha(C.muted, 0.28), overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: C.ok, opacity: l.teal, boxShadow: `0 0 12px ${C.ok}` }} />
          <div style={{ position: 'absolute', inset: 0, background: C.flat, opacity: l.rose }} />
        </div>
      ))}
    </div>
  );
};

/** Circular arrow glyph (restart), drawn in SVG so it never depends on a font. */
export const RestartGlyph: React.FC<{ size: number; colour: string }> = ({ size, colour }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
    <path d="M 78 50 A 28 28 0 1 1 66 27" fill="none" stroke={colour} strokeWidth={11} strokeLinecap="round" />
    <path d="M 56 12 L 80 22 L 64 42 Z" fill={colour} />
  </svg>
);

/** The restart button: a round button with an accent ring. */
export const RestartButton: React.FC<{ x: number; y: number; r: number; pop: number; press?: number; pulse?: number }> = ({ x, y, r, pop, press = 0, pulse = 0 }) => {
  if (pop <= 0) return null;
  const s = (0.4 + 0.6 * pop) * (1 - 0.12 * press);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: 2 * r,
        height: 2 * r,
        borderRadius: r,
        background: press > 0 ? `linear-gradient(135deg, ${alpha(C.accent, 0.4 + 0.6 * press)}, ${alpha(C.accent2, 0.4 + 0.6 * press)})` : C.card,
        boxShadow: `0 0 0 ${Math.max(4, r * 0.09)}px ${C.accentText}, 0 0 ${20 + 30 * pulse}px ${alpha(C.accent, 0.35 + 0.35 * pulse)}`,
        opacity: Math.min(1, pop * 1.5),
        transform: `scale(${s})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <RestartGlyph size={r * 1.15} colour={press > 0.5 ? C.text : C.accentText} />
    </div>
  );
};

export const DIAL = ['one file', 'a folder', 'everything'] as const;

/** The scope dial: three stacked labels under the button, the chosen one lit. */
export const Dial: React.FC<{ x: number; y: number; active: number; opacity: number; size?: number; step?: number; colours?: string[] }> = ({
  x,
  y,
  active,
  opacity,
  size = 30,
  step = 40,
  colours,
}) => (
  <div style={{ position: 'absolute', left: x - 140, top: y, width: 280, opacity }}>
    {DIAL.map((label, k) => {
      const on = k === active;
      const colour = on ? (colours?.[k] ?? C.accentText) : alpha(C.muted, 0.75);
      return (
        <div key={k} style={{ height: step, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: size, fontWeight: on ? 800 : 600, color: colour, whiteSpace: 'nowrap' }}>
          <div style={{ width: size * 0.42, height: size * 0.42, borderRadius: size, background: on ? colour : 'transparent', boxShadow: `inset 0 0 0 3px ${colour}` }} />
          {label}
        </div>
      );
    })}
  </div>
);

/** A scalpel, blade pointing right. */
export const Scalpel: React.FC<{ size: number; colour?: string; style?: React.CSSProperties }> = ({ size, colour = C.accentText, style }) => (
  <svg width={size} height={size * 0.4} viewBox="0 0 100 40" style={{ display: 'block', ...style }}>
    <rect x={2} y={16} width={46} height={10} rx={5} fill={alpha(C.muted, 0.9)} />
    <path d="M 46 14 L 74 10 Q 98 18 96 24 L 46 28 Z" fill={colour} />
  </svg>
);

/** The wrecking ball on its chain, hanging from (0,0) of its box down `len` px at `angle` deg. */
export const WreckingBall: React.FC<{ px: number; py: number; len: number; angle: number; r: number; opacity: number }> = ({ px, py, len, angle, r, opacity }) => {
  const a = (angle * Math.PI) / 180;
  const bx = px + len * Math.sin(a);
  const by = py + len * Math.cos(a);
  return (
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, opacity, overflow: 'visible' }}>
      <line x1={px} y1={py} x2={bx} y2={by} stroke={alpha(C.muted, 0.8)} strokeWidth={5} strokeDasharray="10 6" />
      <circle cx={px} cy={py} r={8} fill={C.muted} />
      <circle cx={bx} cy={by} r={r} fill={C.flat} />
      <circle cx={bx - r * 0.3} cy={by - r * 0.3} r={r * 0.28} fill={alpha(C.text, 0.35)} />
    </svg>
  );
};

/** A rubber stamp: bordered, rotated, landing from a larger scale. */
export const Stamp: React.FC<{ text: string; colour: string; pop: number; size?: number; angle?: number; dashed?: boolean; style?: React.CSSProperties }> = ({
  text,
  colour,
  pop,
  size = 40,
  angle = -5,
  dashed = false,
  style,
}) => (
  <div
    style={{
      display: 'inline-block',
      padding: `${size * 0.16}px ${size * 0.5}px`,
      border: `${Math.max(3, size * 0.11)}px ${dashed ? 'dashed' : 'solid'} ${colour}`,
      borderRadius: size * 0.3,
      color: colour,
      background: alpha(C.bg0, 0.85),
      fontSize: size,
      fontWeight: 800,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
      opacity: Math.min(1, pop * 1.4),
      transform: `rotate(${angle}deg) scale(${1 + 0.7 * (1 - pop)})`,
      ...style,
    }}
  >
    {text}
  </div>
);

/** A filled disc with a mark (✓ / ✗). */
export const Disc: React.FC<{ mark: string; colour: string; size: number }> = ({ mark, colour, size }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: colour, color: C.bg0, fontSize: size * 0.62, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
    {mark}
  </div>
);
