import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage } from './Stage.tsx';
import { Tally } from './pieces.tsx';
import { FOOTNOTE, V4_DETAIL, frameState, type LadderProps } from './VersionLadder.state.ts';

export { frameState };

export const VersionLadder: React.FC<AnimProps & LadderProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Tally value={s.tally.value} appear={s.tally.appear} pulse={s.tally.pulse} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 110, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {s.rows.map((r, i) => (
            <div
              key={i}
              style={{
                opacity: r.pop,
                transform: `translateX(${(1 - r.pop) * 60}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                padding: r.ok ? '26px 30px' : '18px 30px',
                borderRadius: 24,
                background: r.ok ? alpha(C.ok, 0.12) : alpha(C.bg1, 0.92),
                border: `${r.ok ? 4 : 2}px solid ${r.ok ? C.ok : alpha(C.rose, 0.55)}`,
                boxShadow: r.glow > 0 ? `0 0 ${50 * r.glow}px ${alpha(C.ok, 0.45)}` : undefined,
              }}
            >
              <div style={{ fontSize: r.ok ? 70 : 58, fontWeight: 900, width: 110, color: r.ok ? C.text : C.muted }}>{r.v}</div>
              <div style={{ fontSize: r.ok ? 70 : 56, fontWeight: 900, width: 64, color: r.ok ? C.ok : C.roseText }}>{r.ok ? '✓' : '✗'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: r.ok ? 46 : 40, fontWeight: 800, color: r.ok ? C.text : alpha(C.text, 0.85) }}>{r.text}</div>
                {r.ok && <div style={{ fontSize: 28, fontWeight: 600, color: C.muted, opacity: s.detail, lineHeight: 1.25 }}>{V4_DETAIL}</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 10, right: 10, top: 820, fontSize: 31, fontWeight: 500, color: C.muted, lineHeight: 1.3, opacity: s.footnote, textAlign: 'center' }}>
          {FOOTNOTE}
        </div>
      </div>
    </Stage>
  );
};
