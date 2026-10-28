import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { gradientText } from './Stage.tsx';
import { Chip, clamp01 } from './pieces.tsx';
import { COLS, GRID_TXT, ROWS, frameState, type PilotGridProps, type Tone } from './PilotGrid.state.ts';

export { frameState };
export type { PilotGridProps };

const G = { labelX: 60, cellX: [395, 557, 719, 881], cellW: 148, cellH: 76, top: 500, step: 98, headY: 372 } as const;
/** Colours as in the article's figure: amber for the gaps, teal for covered. */
const colour = (t: Tone) => (t === 'ok' ? C.ok : C.warm);

export const PilotGrid: React.FC<AnimProps & PilotGridProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const n = ROWS.length;
  const gridK = 1 - 0.55 * s.dimGrid;
  /** Fill of column k in row i: the worker column fills row by row. */
  const fill = (k: number, i: number) => (k === 0 ? s.d1 : k === 1 ? clamp01(s.d2 * n - i) : k === 2 ? s.d3 : s.d4);
  const bottom = G.top + (n - 1) * G.step + G.cellH;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      {/* heading */}
      <div style={{ position: 'absolute', left: 70, right: 70, top: 222, textAlign: 'center', opacity: s.grid * gridK }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted }}>{GRID_TXT.kicker}</div>
        <div style={{ fontSize: 58, fontWeight: 800, marginTop: 6, opacity: s.head, ...gradientText }}>{GRID_TXT.head}</div>
      </div>

      <div style={{ position: 'absolute', inset: 0, opacity: s.grid * gridK }}>
        {/* column heads */}
        {COLS.map((c, k) => (
          <div key={c.code} style={{ position: 'absolute', left: G.cellX[k] - 6, width: G.cellW + 12, top: G.headY, textAlign: 'center' }}>
            {c.lines.map((l, j) => (
              <div key={j} style={{ fontSize: 23, fontWeight: 800, lineHeight: 1.12, minHeight: 26 }}>
                {l}
              </div>
            ))}
            <div style={{ fontSize: 21, fontWeight: 700, color: C.muted, marginTop: 4 }}>{c.code}</div>
          </div>
        ))}
        {ROWS.map((r, i) => {
          const o = clamp01(s.rows * n - i);
          const y = G.top + i * G.step;
          const hi = r.group === 'top' ? s.hiTop : r.group === 'claude' ? s.hiClaude : 0;
          const hiColour = r.group === 'top' ? C.ok : C.warm;
          return (
            <React.Fragment key={r.model}>
              {/* the row lights when the narration names its group */}
              {hi > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 38,
                    width: 1004,
                    top: y - 8,
                    height: G.cellH + 16,
                    borderRadius: 18,
                    border: `3px solid ${alpha(hiColour, 0.9 * hi)}`,
                    background: alpha(hiColour, 0.1 * hi),
                    boxShadow: `0 0 30px ${alpha(hiColour, 0.35 * hi)}`,
                  }}
                />
              )}
              <div style={{ position: 'absolute', left: G.labelX, top: y + G.cellH / 2 - 21, opacity: o, transform: `translateX(${(1 - o) * -30}px)`, fontSize: 34, fontWeight: 800, whiteSpace: 'nowrap' }}>
                {r.model}
              </div>
              {r.cells.map((c, k) => {
                const f = fill(k, i);
                return (
                  <div
                    key={k}
                    style={{
                      position: 'absolute',
                      left: G.cellX[k],
                      top: y,
                      width: G.cellW,
                      height: G.cellH,
                      borderRadius: 12,
                      boxSizing: 'border-box',
                      border: f > 0 ? `3px solid ${alpha(colour(c.tone), 0.85)}` : `3px dashed ${alpha(C.muted, 0.45)}`,
                      background: f > 0 ? alpha(colour(c.tone), 0.12 * f) : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: c.text.length > 4 ? 28 : 36,
                      fontWeight: 800,
                      color: colour(c.tone),
                      opacity: o,
                    }}
                  >
                    <span style={{ opacity: f, transform: `scale(${0.8 + 0.2 * f})` }}>{c.text}</span>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
        {/* the near-tie: permissions and data analysis */}
        {s.tie > 0 && (
          <>
            <div
              style={{
                position: 'absolute',
                left: G.cellX[2] - 14,
                top: G.top - 16,
                width: G.cellX[3] + G.cellW - G.cellX[2] + 28,
                height: bottom - G.top + 32,
                borderRadius: 20,
                border: `4px dashed ${C.ok}`,
                opacity: s.tie,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ position: 'absolute', left: G.cellX[2], width: G.cellX[3] + G.cellW - G.cellX[2], top: bottom + 22, display: 'flex', justifyContent: 'center', opacity: s.tie, transform: `scale(${1.4 - 0.4 * s.tie})` }}>
              <Chip text={GRID_TXT.tie} size={32} color={C.ok} />
            </div>
          </>
        )}
        <div style={{ position: 'absolute', left: 60, right: 60, top: bottom + 92, textAlign: 'center', fontSize: 28, fontWeight: 700, color: C.muted, opacity: s.runs }}>{GRID_TXT.runs}</div>
      </div>

      {s.probe > 0 && (
        <div style={{ position: 'absolute', left: 140, right: 140, top: G.top + G.step * 2, display: 'flex', justifyContent: 'center', opacity: s.probe, transform: `translateY(${(1 - s.probe) * 24}px)` }}>
          <div style={{ padding: '30px 56px', borderRadius: 26, background: C.card, border: `3px solid ${alpha(C.accentText, 0.8)}`, textAlign: 'center' }}>
            <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, ...gradientText }}>{GRID_TXT.probe}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: C.muted, marginTop: 14 }}>{GRID_TXT.probeSub}</div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
