// Seed bars (see SeedBars.state.ts). Vertical layout under the question card.
import React from 'react';
import { C, GRADIENT, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, type SeedBarsProps } from './SeedBars.state.ts';

export { frameState };

const X0 = 80;
const TRACK = 620;
const TOP = 520;

export const SeedBars: React.FC<AnimProps & SeedBarsProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const n = s.bars.length;
  const row = n > 2 ? 178 : 230;
  const top = n > 2 ? TOP + 20 : TOP + 70;
  const bottom = top + n * row;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, fontFamily, color: C.text }}>
      <div style={{ position: 'absolute', left: X0, top: 404, opacity: s.chip, padding: '8px 24px', borderRadius: 40, border: `3px solid ${alpha(C.muted, 0.6)}`, fontSize: 38, fontWeight: 700, color: C.text }}>
        {p.model}
      </div>
      <div style={{ position: 'absolute', right: 60, top: 418, opacity: s.chip, fontSize: 32, fontWeight: 500, color: C.muted, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 24, height: 24, borderRadius: 12, background: C.text, border: `3px solid ${C.bg0}`, display: 'inline-block' }} />
        one run each (3 runs)
      </div>
      {s.reference && (
        <>
          <div style={{ position: 'absolute', left: X0 + s.reference.x * TRACK - 2, top: top - 10, height: bottom - top, borderLeft: `4px dashed ${C.warm}`, opacity: s.reference.opacity }} />
          <div style={{ position: 'absolute', left: X0 + s.reference.x * TRACK, top: top - 62, transform: 'translateX(-50%)', fontSize: 32, fontWeight: 700, color: C.warm, opacity: s.reference.opacity, whiteSpace: 'nowrap' }}>
            {s.reference.label}
          </div>
        </>
      )}
      {s.bars.map((b, i) => {
        const y = top + i * row;
        const fill = b.tone === 'accent' ? GRADIENT : b.tone === 'flag' ? C.flag : alpha(C.muted, 0.75);
        return (
          <div key={i} style={{ position: 'absolute', left: X0, top: y, width: 920, opacity: b.appear }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, width: TRACK }}>
              <span style={{ fontSize: 46, fontWeight: 700, color: b.tone === 'accent' ? C.accentText : C.text }}>{b.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 32, fontWeight: 500, color: C.muted }}>{b.range}</span>
            </div>
            <div style={{ position: 'relative', marginTop: 12, width: TRACK, height: 76, borderRadius: 14, background: alpha(C.card, 0.9), border: `2px solid ${C.line}` }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${b.width * 100}%`, borderRadius: 12, background: fill }} />
              {b.dots.map((d, j) => (
                <div
                  key={j}
                  style={{ position: 'absolute', left: `${d.x * 100}%`, top: 38 - 15, width: 30, height: 30, marginLeft: -15, borderRadius: 15, background: C.text, border: `4px solid ${C.bg0}`, opacity: d.opacity }}
                />
              ))}
              <div style={{ position: 'absolute', left: TRACK + 26, top: '50%', transform: 'translateY(-50%)', fontSize: 66, fontWeight: 800, color: b.tone === 'accent' ? C.accentText : b.tone === 'flag' ? C.flag : C.text, opacity: b.grow, whiteSpace: 'nowrap' }}>
                {b.display}
              </div>
            </div>
          </div>
        );
      })}
      {s.note && (
        <div style={{ position: 'absolute', left: X0, top: bottom + 30, fontSize: 36, fontWeight: 600, color: C.muted, opacity: s.note.opacity }}>{s.note.text}</div>
      )}
      {s.tag && s.tag.pop > 0 && (
        <div
          style={{
            position: 'absolute',
            left: X0,
            top: bottom + 30,
            padding: '10px 26px',
            borderRadius: 16,
            border: `4px solid ${C.ok}`,
            color: C.ok,
            fontSize: 44,
            fontWeight: 800,
            opacity: Math.min(1, s.tag.pop * 1.4),
            transform: `scale(${1.5 - 0.5 * s.tag.pop})`,
            transformOrigin: 'left center',
          }}
        >
          {s.tag.text}
        </div>
      )}
    </div>
  );
};
