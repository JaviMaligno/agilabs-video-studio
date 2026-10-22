import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, type SkillRulerProps } from './SkillRuler.state.ts';
import { gradientText } from './pieces.tsx';

export { frameState };
export type { SkillRulerProps };

/** Ruler geometry inside a 960 px block: 0 % and 100 % ticks. */
const X0 = 40;
const X1 = 800;
const SPAN = X1 - X0;
const TOPS = [450, 875];

type R = ReturnType<typeof frameState>['rulers'][number];

const Ruler: React.FC<{ r: R; top: number; sport: 'football' | 'basketball' }> = ({ r, top, sport }) => {
  if (r.appear <= 0) return null;
  const done = r.fill >= 1;
  const barW = SPAN * r.share * r.fill;
  return (
    <div style={{ position: 'absolute', left: 60, top, width: 960, height: 380, opacity: r.appear, transform: `translateY(${(1 - r.appear) * 30}px)` }}>
      {/* Sport and figure. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width={58} height={58} viewBox="-30 -30 60 60">
            {sport === 'football' ? (
              <>
                <circle r={26} fill="none" stroke={C.text} strokeWidth={4} />
                <polygon points="0,-10 9.5,-3 6,8 -6,8 -9.5,-3" fill={C.text} />
              </>
            ) : (
              <>
                <circle r={26} fill="none" stroke={C.text} strokeWidth={4} />
                <line x1={-26} y1={0} x2={26} y2={0} stroke={C.text} strokeWidth={3} />
                <line x1={0} y1={-26} x2={0} y2={26} stroke={C.text} strokeWidth={3} />
                <path d="M -18 -18 Q -6 0 -18 18 M 18 -18 Q 6 0 18 18" fill="none" stroke={C.text} strokeWidth={3} />
              </>
            )}
          </svg>
          <span style={{ fontSize: 50, fontWeight: 800 }}>{r.sport}</span>
        </div>
        <span style={{ fontSize: 104, fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', opacity: r.fill > 0 ? 1 : 0, ...gradientText }}>
          {done ? r.text : `${r.value}%`}
        </span>
      </div>
      {/* "what the net adds", over the shaded span. */}
      <div
        style={{
          position: 'absolute',
          left: X0,
          width: SPAN,
          top: 112,
          textAlign: 'center',
          fontSize: 38,
          fontWeight: 700,
          color: r.span > 0 ? C.text : C.accentText,
          textShadow: r.span > 0 ? `0 0 ${24 * r.span}px ${C.accent}` : 'none',
        }}
      >
        what the net adds
      </div>
      <div style={{ position: 'absolute', left: X0, width: SPAN, top: 166, height: 16, borderLeft: `3px solid ${alpha(C.accentText, 0.6)}`, borderRight: `3px solid ${alpha(C.accentText, 0.6)}`, borderTop: `3px solid ${alpha(C.accentText, 0.6)}`, borderRadius: '8px 8px 0 0' }} />
      {/* Track: the shaded gap and the bar. */}
      <div style={{ position: 'absolute', left: X0, width: SPAN, top: 192, height: 76, borderRadius: 12, background: alpha(C.accent, 0.12 + 0.12 * r.span), border: `2px dashed ${alpha(C.accentText, 0.4)}` }} />
      <div
        style={{
          position: 'absolute',
          left: X0,
          top: 198,
          width: barW,
          height: 64,
          borderRadius: 10,
          background: GRADIENT,
          boxShadow: `0 0 40px ${alpha(C.accent, 0.55)}`,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 22,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: 36,
          fontWeight: 800,
          color: C.text,
        }}
      >
        <span style={{ opacity: Math.min(1, r.label * 1.2) }}>10 numbers + a tree</span>
      </div>
      {/* Ticks. */}
      {[X0, X1].map((x, i) => (
        <div key={i} style={{ position: 'absolute', left: x - 3, top: 180, width: 6, height: 104, borderRadius: 3, background: i === 0 ? alpha(C.text, 0.85) : C.accentText }} />
      ))}
      <div style={{ position: 'absolute', left: X0 - 6, top: 296, fontSize: 38, fontWeight: 700, color: r.base > 0 ? C.text : C.muted, whiteSpace: 'nowrap' }}>plain average</div>
      <div style={{ position: 'absolute', left: X1 - 160, width: 320, top: 296, textAlign: 'center', fontSize: 38, fontWeight: 700, color: C.accentText, whiteSpace: 'nowrap' }}>
        the 60 kB net
        {r.small > 0 && <div style={{ fontSize: 32, fontWeight: 600, color: C.muted, opacity: r.small }}>this small net</div>}
      </div>
    </div>
  );
};

/** Share of the gap between a plain average and the 60 kB net (see SkillRuler.state.ts). */
export const SkillRuler: React.FC<AnimProps & SkillRulerProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <Ruler r={s.rulers[0]} top={TOPS[0]} sport="football" />
      <Ruler r={s.rulers[1]} top={TOPS[1]} sport="basketball" />
    </div>
  );
};
