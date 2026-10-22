import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { gradientText } from './Stage.tsx';
import { Chip, clamp01 } from './pieces.tsx';
import { GRID_TXT, MODELS, ROWS, frameState, type PilotGridProps, type Verdict } from './PilotGrid.state.ts';

export { frameState };
export type { PilotGridProps };

const G = { labelX: 70, cellX: [460, 720], cellW: 245, cellH: 110, top: 500, step: 150, headY: 412 } as const;
/** Colours as in the article's figure: amber for the gaps, teal for covered. */
const tone = (v: Verdict) => (v === 'Covered' ? C.ok : C.warm);

export const PilotGrid: React.FC<AnimProps & PilotGridProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const fills = [s.c1, s.c2, s.c3, s.c4];
  const gridK = 1 - 0.55 * s.dimGrid;
  const tieTop = G.top + 2 * G.step - 18;
  const tieH = G.step + G.cellH + 36;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      {/* heading */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 252, textAlign: 'center', opacity: s.grid * gridK }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted }}>{GRID_TXT.kicker}</div>
        <div style={{ fontSize: 60, fontWeight: 800, marginTop: 6, opacity: s.five, ...gradientText }}>{GRID_TXT.five}</div>
      </div>

      <div style={{ position: 'absolute', inset: 0, opacity: s.grid * gridK }}>
        {MODELS.map((m, i) => (
          <div key={m} style={{ position: 'absolute', left: G.cellX[i], width: G.cellW, top: G.headY, display: 'flex', justifyContent: 'center' }}>
            <Chip text={m} size={32} />
          </div>
        ))}
        {ROWS.map((r, i) => {
          const o = clamp01(s.rows * 4 - i);
          const y = G.top + i * G.step;
          return (
            <React.Fragment key={r.code}>
              <div style={{ position: 'absolute', left: G.labelX, top: y + 4, opacity: o, transform: `translateX(${(1 - o) * -30}px)` }}>
                <div style={{ fontSize: 42, fontWeight: 800 }}>{r.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: C.muted, marginTop: 2 }}>{r.code}</div>
              </div>
              {r.cells.map((v, k) => {
                const f = fills[i];
                return (
                  <div
                    key={k}
                    style={{
                      position: 'absolute',
                      left: G.cellX[k],
                      top: y,
                      width: G.cellW,
                      height: G.cellH,
                      borderRadius: 14,
                      boxSizing: 'border-box',
                      border: f > 0 ? `3px solid ${alpha(tone(v), 0.85)}` : `3px dashed ${alpha(C.muted, 0.45)}`,
                      background: f > 0 ? alpha(tone(v), 0.12 * f) : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 29,
                      fontWeight: 800,
                      color: tone(v),
                      opacity: o,
                    }}
                  >
                    <span style={{ opacity: f, transform: `scale(${0.8 + 0.2 * f})` }}>{v}</span>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
        {/* the tie */}
        {s.tie > 0 && (
          <>
            <div style={{ position: 'absolute', left: 52, top: tieTop, width: 940, height: tieH, borderRadius: 22, border: `4px dashed ${C.ok}`, opacity: s.tie, boxSizing: 'border-box' }} />
            <div style={{ position: 'absolute', left: 992 - 130, top: tieTop - 30, opacity: s.tie, transform: `scale(${1.4 - 0.4 * s.tie})` }}>
              <Chip text={GRID_TXT.tie} size={34} color={C.ok} />
            </div>
          </>
        )}
        <div style={{ position: 'absolute', left: 70, right: 70, top: G.top + 4 * G.step + 4, textAlign: 'center', fontSize: 32, fontWeight: 700, color: C.muted, opacity: s.runs }}>{GRID_TXT.runs}</div>
        <div style={{ position: 'absolute', left: 90, right: 90, top: G.top + 4 * G.step + 66, textAlign: 'center', fontSize: 32, fontWeight: 600, lineHeight: 1.3, color: C.muted, opacity: s.foot }}>{GRID_TXT.foot}</div>
      </div>

      {s.probe > 0 && (
        <div style={{ position: 'absolute', left: 140, right: 140, top: G.top + G.step * 1.2, display: 'flex', justifyContent: 'center', opacity: s.probe, transform: `translateY(${(1 - s.probe) * 24}px)` }}>
          <div style={{ padding: '30px 56px', borderRadius: 26, background: C.card, border: `3px solid ${alpha(C.accentText, 0.8)}`, textAlign: 'center' }}>
            <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, ...gradientText }}>{GRID_TXT.probe}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: C.muted, marginTop: 14 }}>{GRID_TXT.probeSub}</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
