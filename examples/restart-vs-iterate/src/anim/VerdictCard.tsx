import React from 'react';
import { interpolate } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, type VerdictProps } from './VerdictCard.state.ts';
import { Disc, Scalpel } from './pieces.tsx';

export { frameState };

/** A tiny tower icon: four stacked blocks. */
const MiniTower: React.FC<{ colour: string; dim?: boolean }> = ({ colour, dim }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, opacity: dim ? 0.35 : 1 }}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ width: 40, height: 15, borderRadius: 4, background: C.card, boxShadow: `inset 0 0 0 3px ${colour}` }} />
    ))}
  </div>
);

export const VerdictCard: React.FC<AnimProps & VerdictProps> = (p) => {
  const v = frameState(p, p.t, p.beats, p.dur);
  const row = (k: number, icon: React.ReactNode, body: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 30, minHeight: 190, opacity: v.rows[k], transform: `translateX(${(1 - v.rows[k]) * 40}px)` }}>
      <div style={{ flex: 'none', width: 110, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>{body}</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, fontFamily, color: C.text }}>
      <div
        style={{
          position: 'absolute',
          left: 60,
          width: 960,
          top: 380,
          height: 920,
          boxSizing: 'border-box',
          padding: '40px 46px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 26,
          borderRadius: 32,
          background: alpha(C.card, 0.97),
          border: `5px solid ${C.accentText}`,
          boxShadow: `0 0 70px ${alpha(C.accent, 0.35)}`,
          opacity: v.card,
          transform: `scale(${interpolate(v.card, [0, 1], [0.92, 1])})`,
        }}
      >
        <div style={{ textAlign: 'center', fontSize: 46, fontWeight: 800, letterSpacing: '0.2em', color: C.accentText }}>VERDICT</div>
        <div style={{ textAlign: 'center', fontSize: 34, fontWeight: 600, color: C.muted, marginBottom: 6, opacity: v.sub, transform: `translateY(${(1 - v.sub) * 12}px)` }}>
          on these tasks: existing codebases · 4 rounds · tests visible
        </div>
        {row(
          0,
          <div style={{ opacity: Math.min(1, v.stamp * 1.4), transform: `scale(${1 + 0.8 * (1 - v.stamp)}) rotate(${-8 * v.stamp}deg)` }}>
            <Disc mark="✓" colour={C.ok} size={96} />
          </div>,
          <>
            <div style={{ fontSize: 70, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', color: C.ok }}>Keep the code. Iterate.</div>
          </>,
        )}
        {row(
          1,
          <Scalpel size={124} colour={C.accentText} />,
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Restart only if you know what to throw away.</div>,
        )}
        {row(
          2,
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <MiniTower colour={C.ok} />
              <div style={{ position: 'absolute', top: -30, left: 4 }}>
                <Disc mark="✓" colour={C.ok} size={32} />
              </div>
            </div>
            <MiniTower colour={C.muted} dim />
          </div>,
          <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', color: C.text }}>
            Here, only the <span style={{ color: C.ok }}>stronger</span> model knew.
          </div>,
        )}
      </div>
    </div>
  );
};
