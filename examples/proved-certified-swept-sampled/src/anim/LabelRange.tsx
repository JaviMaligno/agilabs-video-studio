import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Stage, gradientText } from './Stage.tsx';
import { STAMP_TONES, Stamp } from './pieces.tsx';
import { AXIS, H, ONE, W, frameState, type RangeProps } from './LabelRange.state.ts';

export { frameState };

const SERIF = "Georgia, 'Times New Roman', serif";

export const LabelRange: React.FC<AnimProps & RangeProps> = ({ t, beats, dur, vertical, ...p }) => {
  const s = frameState(p, t, beats, dur);
  const barY = AXIS.y - 190;
  return (
    <Stage vertical={vertical} fill>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `translateY(${s.shift}px) scale(${s.scale})`, transformOrigin: '50% 50%' }}>
          {s.reviewer > 0 && (
            <div style={{ position: 'absolute', left: ONE - 190, top: 150, width: 380, height: 120, borderRadius: 22, border: `3px solid ${C.text}`, background: alpha(C.bg1, 0.95), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: s.reviewer }}>
              <svg width={64} height={64} viewBox="0 0 86 86">
                <rect x={4} y={4} width={78} height={78} rx={18} fill="none" stroke={C.muted} strokeWidth={5} />
                <circle cx={43} cy={43} r={16} fill="none" stroke={C.muted} strokeWidth={5} />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 34, fontWeight: 800 }}>same reviewer</div>
                <div style={{ fontSize: 26, fontWeight: 600, color: C.muted }}>separate model</div>
              </div>
            </div>
          )}
          <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }} width={W} height={H}>
            <defs>
              <pattern id="hatch" width={22} height={22} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1={0} y1={0} x2={0} y2={22} stroke={alpha(C.rose, 0.7)} strokeWidth={8} />
              </pattern>
            </defs>
            {s.gap > 0 && <rect x={AXIS.x0} y={barY} width={(ONE - AXIS.x0) * s.gap} height={110} rx={14} fill="url(#hatch)" stroke={alpha(C.roseText, 0.8)} strokeWidth={3} strokeDasharray="10 8" />}
            <g opacity={s.axis}>
              <line x1={AXIS.x0} y1={AXIS.y} x2={AXIS.x1} y2={AXIS.y} stroke={C.text} strokeWidth={5} />
              <path d={`M ${AXIS.x1 - 4} ${AXIS.y - 14} L ${AXIS.x1 + 16} ${AXIS.y} L ${AXIS.x1 - 4} ${AXIS.y + 14}`} fill={C.text} />
              <line x1={ONE} y1={AXIS.y - 16} x2={ONE} y2={AXIS.y + 16} stroke={C.text} strokeWidth={5} />
            </g>
            {s.marker.drop > 0 && (
              <g transform={`translate(${ONE} ${AXIS.y - 290 + 270 * s.marker.drop})`} opacity={Math.min(1, s.marker.drop * 2)}>
                <path d="M 0 0 L -22 -40 A 26 26 0 1 1 22 -40 Z" fill={C.rose} />
                <circle cx={0} cy={-56} r={10} fill={C.bg0} />
              </g>
            )}
          </svg>
          <div style={{ position: 'absolute', left: AXIS.x1 - 10, top: AXIS.y + 18, fontFamily: SERIF, fontStyle: 'italic', fontSize: 52, color: C.text, opacity: s.axis }}>α</div>
          <div style={{ position: 'absolute', left: ONE - 100, width: 200, top: AXIS.y + 26, textAlign: 'center', fontSize: 38, fontWeight: 800, opacity: s.axis, color: s.marker.drop > 0.5 ? C.roseText : C.text }}>
            <span style={{ fontFamily: SERIF, fontStyle: 'italic' }}>α</span> = 1
          </div>
          {s.stamp.pop > 0 && (
            <div style={{ position: 'absolute', left: s.stamp.x0, width: s.stamp.x1 - s.stamp.x0, top: barY, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: 14, border: `5px solid ${C.accentText}`, background: alpha(C.accent, 0.22), opacity: s.stamp.pop }} />
              <div style={{ position: 'relative', fontSize: 50, fontWeight: 900, letterSpacing: '0.06em', color: C.accentText, opacity: s.stamp.pop, transform: `scale(${1.4 - 0.4 * s.stamp.pop})`, whiteSpace: 'nowrap' }}>
                PROVED
                {s.stamp.ge > 0.5 && (
                  <span style={{ marginLeft: 16, fontSize: 40, color: C.text, opacity: (s.stamp.ge - 0.5) * 2 }}>
                    <span style={{ fontFamily: SERIF, fontStyle: 'italic' }}>α</span> ≥ 1
                  </span>
                )}
              </div>
            </div>
          )}
          {s.gap > 0 && (
            <div style={{ position: 'absolute', left: AXIS.x0, width: ONE - AXIS.x0, top: AXIS.y + 100, textAlign: 'center', fontSize: 40, fontWeight: 800, color: C.roseText, opacity: s.gap }}>
              <span style={{ fontFamily: SERIF, fontStyle: 'italic' }}>α</span> &lt; 1: no argument
            </div>
          )}
        </div>
        {s.quote && (
          <>
            <div style={{ position: 'absolute', left: 10, right: 10, top: 480, display: 'flex', flexWrap: 'wrap', columnGap: 22, fontSize: 72, fontWeight: 800, lineHeight: 1.14, letterSpacing: '-0.02em' }}>
              {s.quote.words.map((w, i) => (
                <span key={i} style={{ opacity: w.opacity, transform: `translateY(${(1 - w.opacity) * 18}px)`, ...(w.emphasis ? gradientText : { color: C.text }) }}>
                  {w.text}
                </span>
              ))}
            </div>
            <div style={{ position: 'absolute', right: 30, top: 960, opacity: 0.55 }}>
              <Stamp text="SAMPLED" color={STAMP_TONES[3]} pop={s.quote.sampled} size={40} rotate={-6} />
            </div>
            {s.quote.sampled > 0 && (
              <div style={{ position: 'absolute', left: 30, top: 972, fontSize: 30, fontWeight: 700, color: C.muted, opacity: s.quote.sampled }}>
                a sampled label is not dangerous →
              </div>
            )}
          </>
        )}
      </div>
    </Stage>
  );
};
