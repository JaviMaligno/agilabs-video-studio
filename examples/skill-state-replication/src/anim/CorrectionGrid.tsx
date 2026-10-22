import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { ARMS, MODELS, PER, frameState, type CorrectionGridProps } from './CorrectionGrid.state.ts';

export { frameState };
export type { CorrectionGridProps };

const G = { top: [445, 815], label: 75, cells: 300, cell: 22, gap: 3, row0: 116, rowH: 60 } as const;

export const CorrectionGrid: React.FC<AnimProps & CorrectionGridProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      {ARMS.map((arm, a) => {
        const b = s.blocks[a];
        const color = arm.id === 'note' ? C.ok : C.warm;
        const top = G.top[a];
        return (
          <div key={arm.id} style={{ position: 'absolute', left: 0, top, width: 1080, height: 300, opacity: b.opacity }}>
            <div style={{ position: 'absolute', left: G.label, top: 18, fontSize: 48, fontWeight: 800, color }}>{arm.label}</div>
            <div
              style={{
                position: 'absolute',
                right: 75,
                top: -6,
                fontSize: 92,
                fontWeight: 800,
                color,
                lineHeight: 1.05,
                fontVariantNumeric: 'tabular-nums',
                opacity: b.total,
                transform: `scale(${1.3 - 0.3 * b.total})`,
                transformOrigin: 'right center',
              }}
            >
              {arm.total}
            </div>
            {MODELS.map((model, r) => {
              const row = b.rows[r];
              const y = G.row0 + r * G.rowH;
              return (
                <div key={model} style={{ position: 'absolute', left: 0, top: y, width: 1080, height: G.rowH }}>
                  <div style={{ position: 'absolute', left: G.label, top: 8, fontSize: 28, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>{model}</div>
                  {Array.from({ length: PER }, (_, k) => {
                    const on = k < row.cells;
                    return (
                      <div
                        key={k}
                        style={{
                          position: 'absolute',
                          left: G.cells + k * (G.cell + G.gap),
                          top: 8,
                          width: G.cell,
                          height: 34,
                          borderRadius: 5,
                          background: on ? color : 'transparent',
                          border: on ? 'none' : `2px solid ${alpha(C.muted, 0.35)}`,
                          boxSizing: 'border-box',
                        }}
                      />
                    );
                  })}
                  <div style={{ position: 'absolute', left: G.cells + PER * (G.cell + G.gap) + 14, top: 6, fontSize: 30, fontWeight: 800, color: C.text, opacity: row.label, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {`${arm.counts[r]}/${PER}`}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1150, textAlign: 'center', fontSize: 34, fontWeight: 700, color: C.text, opacity: s.tag }}>
        the paper's own claim, counted per episode
      </div>
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 1205, textAlign: 'center', fontSize: 28, fontWeight: 600, color: C.muted, opacity: s.tag }}>
        correction applied · one cell = one episode
      </div>
    </AbsoluteFill>
  );
};
