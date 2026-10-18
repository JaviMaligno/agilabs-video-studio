import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { ROWS, REASON, eroded, frameState, type ErosionProps } from './ErosionVsCut.state.ts';
import { stageOf } from './Stage.tsx';

export { frameState };

const ROW_Y = (k: number) => 190 + k * 215;
const COL_W = 430;

const MiniTab: React.FC<{ text: string; x: number; y: number; blur?: number; opacity?: number; rot?: number }> = ({ text, x, y, blur = 0, opacity = 1, rot = 0 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: COL_W - 70,
      height: 120,
      background: C.why,
      borderRadius: 10,
      color: C.ink,
      fontSize: 30,
      fontWeight: 650,
      lineHeight: 1.18,
      padding: '0 18px 0 30px',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      opacity,
      transform: `rotate(${rot}deg)`,
      boxShadow: `0 8px 20px ${alpha(C.bg0, 0.45)}`,
    }}
  >
    <div style={{ position: 'absolute', left: 10, top: 40, width: 8, height: 40, borderRadius: 3, background: alpha(C.ink, 0.5) }} />
    <span style={{ filter: `blur(${blur}px)` }}>{text}</span>
  </div>
);

/** Telephone (worn away a little at every desk) against what I saw (sharp, then one clean cut). */
export const ErosionVsCut: React.FC<AnimProps & ErosionProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const box = stageOf(p.vertical);
  const cols = [0, box.w - COL_W];
  const last = ROWS - 1;
  const fallY = 700 * s.fall * s.fall;
  return (
    <div style={{ position: 'absolute', left: box.side, top: box.top, width: box.w, height: box.h, overflow: 'hidden', fontFamily, color: C.text }}>
      {['telephone', 'what I saw'].map((h, c) => (
        <div key={h} style={{ position: 'absolute', left: cols[c], top: 30, width: COL_W, textAlign: 'center', fontSize: 50, fontWeight: 800, color: c ? C.whyText : C.muted, opacity: s.headers }}>
          {h}
        </div>
      ))}
      <div style={{ position: 'absolute', left: box.w / 2 - 2, top: 120, width: 4, height: 880, background: alpha(C.muted, 0.18), opacity: s.headers }} />
      {cols.map((x0, c) => (
        <React.Fragment key={c}>
          <div style={{ position: 'absolute', left: x0 + 22, top: ROW_Y(0) + 60, width: 5, height: ROW_Y(last) - ROW_Y(0), background: alpha(C.muted, 0.25) }} />
          {s.rows.map((r, k) => {
            const isCut = c === 1 && k === last;
            return (
              <React.Fragment key={k}>
                <div style={{ position: 'absolute', left: x0 + 6, top: ROW_Y(k) + 44, width: 36, height: 36, borderRadius: 18, border: `4px solid ${k === last ? C.why : C.ok}`, background: C.card, boxSizing: 'border-box', opacity: r.appear }} />
                {isCut ? (
                  <MiniTab text={REASON} x={x0 + 70} y={ROW_Y(k) + fallY} rot={22 * s.fall} opacity={r.appear * (1 - Math.max(0, s.fall - 0.5) * 2)} />
                ) : (
                  <MiniTab text={c === 0 ? eroded(k) : REASON} x={x0 + 70 + (1 - r.appear) * 30} y={ROW_Y(k)} blur={c === 0 ? r.blur : 0} opacity={r.appear * (c === 0 ? 1 - k * 0.12 : 1)} />
                )}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
      {/* The clean cut line left at the last desk */}
      <div style={{ position: 'absolute', left: cols[1] + 60, top: ROW_Y(last) - 6, width: (COL_W - 40) * s.cutLine, height: 0, borderTop: `5px dashed ${C.why}` }} />
      {/* Scissors closing on the last row */}
      <svg width={300} height={200} viewBox="-140 -100 300 200" style={{ position: 'absolute', left: cols[1] + 60 - 140, top: ROW_Y(last) - 6 - 100, opacity: s.scissors, overflow: 'visible' }}>
        {[-1, 1].map((sign) => (
          <g key={sign} transform={`rotate(${sign * (4 + 22 * s.open)} 46 0) scale(0.8)`}>
            <path d="M46 -9 L-118 -1.5 Q-124 0 -118 1.5 L46 9 Z" fill={sign > 0 ? '#e2e8f0' : '#cbd5e1'} />
            <path d={`M46 0 L112 ${sign * -30}`} stroke={C.accent} strokeWidth={14} strokeLinecap="round" />
            <ellipse cx={136} cy={sign * -40} rx={30} ry={22} fill="none" stroke={C.accent} strokeWidth={12} />
          </g>
        ))}
      </svg>
    </div>
  );
};
