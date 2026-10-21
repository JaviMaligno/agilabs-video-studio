// A small report card for the wall and the no-docs tallies: named it (✓ or ?), checked, doubt,
// a cracked grey "published", a blank report (filed nothing) or an empty slot (no report at all).
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import { MONO, Tick, clamp01 } from './pieces.tsx';

export type MiniKind = 'named' | 'check' | 'doubt' | 'false' | 'blank' | 'empty' | 'none';

export const MiniCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  kind: MiniKind;
  appear: number;
  crack?: number;
  cached?: boolean;
  glow?: number;
}> = ({ x, y, w, h, kind, appear, crack = 1, cached, glow = 0 }) => {
  const a = clamp01(appear);
  if (a <= 0 || kind === 'none') return null;
  const filled = kind === 'named' || kind === 'check';
  const base: React.CSSProperties = {
    position: 'absolute',
    left: x - w / 2,
    top: y - h / 2,
    width: w,
    height: h,
    borderRadius: 10,
    boxSizing: 'border-box',
    opacity: a,
    transform: `scale(${1.25 - 0.25 * a})`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily,
    boxShadow: glow > 0 ? `0 0 ${34 * glow}px ${alpha(C.text, 0.85 * glow)}` : undefined,
  };
  if (kind === 'empty') return <div style={{ ...base, border: `3px dashed ${alpha(C.muted, 0.45)}` }} />;
  if (kind === 'blank') {
    return (
      <div style={{ ...base, background: C.card, border: `2px solid ${C.line}`, padding: '0 12px', alignItems: 'stretch' }}>
        {[0.8, 0.55, 0.7].map((wd, i) => (
          <div key={i} style={{ height: 6, width: `${wd * 100}%`, borderRadius: 3, background: alpha(C.muted, 0.22), margin: '4px 0' }} />
        ))}
      </div>
    );
  }
  if (filled) {
    return (
      <div style={{ ...base, background: GRADIENT }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tick size={h * 0.5} color={C.text} stroke={4} />
          {kind === 'named' && <span style={{ fontSize: h * 0.42, fontWeight: 800, color: C.text, lineHeight: 1 }}>?</span>}
        </div>
        {cached && <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: C.text, marginTop: -2 }}>(cached)</div>}
      </div>
    );
  }
  if (kind === 'doubt') {
    return (
      <div style={{ ...base, background: alpha(C.bg0, 0.9), border: `3px solid ${C.accentText}` }}>
        <span style={{ fontSize: h * 0.55, fontWeight: 800, color: C.accentText, lineHeight: 1 }}>?</span>
      </div>
    );
  }
  // false: grey, a "published" tick, and a crack across it.
  return (
    <div style={{ ...base, background: alpha(C.muted, 0.16), border: `3px solid ${alpha(C.muted, 0.8)}` }}>
      <Tick size={h * 0.46} color={C.muted} stroke={3.6} />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d="M -4 38 L 28 52 L 46 34 L 70 62 L 104 48" fill="none" stroke={C.bg0} strokeWidth={9} pathLength={1} strokeDasharray={`${clamp01(crack)} 1`} />
        <path d="M -4 38 L 28 52 L 46 34 L 70 62 L 104 48" fill="none" stroke={C.text} strokeWidth={3} pathLength={1} strokeDasharray={`${clamp01(crack)} 1`} />
      </svg>
    </div>
  );
};
