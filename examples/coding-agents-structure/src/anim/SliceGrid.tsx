// The slice grid (see SliceGrid.state.ts): 652 tiles, 19 lit. Vertical layout under the card.
import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, type SliceGridProps } from './SliceGrid.state.ts';

export { frameState };

export const SliceGrid: React.FC<AnimProps & SliceGridProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const tile = 22;
  const gap = 4;
  const w = s.cols * (tile + gap) - gap;
  const left = (1080 - w) / 2;
  const top = 560;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, fontFamily, color: C.text }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 404, textAlign: 'center', fontSize: 92, fontWeight: 800, letterSpacing: '-0.02em', opacity: s.headline, transform: `translateY(${(1 - s.headline) * 20}px)` }}>
        <span style={{ color: C.accentText }}>{p.lit}</span> of {p.total}
        <span style={{ fontSize: 40, fontWeight: 600, color: C.muted }}> task pairs</span>
      </div>
      <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
        {s.tiles.map((tl, i) => {
          const r = Math.floor(i / s.cols);
          const c = i % s.cols;
          const x = left + c * (tile + gap);
          const y = top + r * (tile + gap);
          if (tl.on && tl.pop > 0) {
            const g = 1 + 0.6 * (1 - tl.pop);
            return <rect key={i} x={x - (tile * (g - 1)) / 2} y={y - (tile * (g - 1)) / 2} width={tile * g} height={tile * g} rx={4} fill={C.accentText} opacity={tl.appear} />;
          }
          return <rect key={i} x={x} y={y} width={tile} height={tile} rx={4} fill={alpha(C.muted, 0.32 - 0.18 * tl.dim)} opacity={tl.appear} />;
        })}
      </svg>
      <div style={{ position: 'absolute', left: 60, right: 60, top: top + s.rows * (tile + gap) + 40, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {s.stats.map((st, i) => (
          <div key={i} style={{ opacity: st.appear, transform: `translateY(${(1 - st.appear) * 16}px)`, padding: '10px 26px', borderRadius: 18, border: `3px solid ${alpha(C.muted, 0.55)}`, background: alpha(C.card, 0.9), fontSize: 42, fontWeight: 700 }}>
            {st.text}
          </div>
        ))}
      </div>
    </div>
  );
};
