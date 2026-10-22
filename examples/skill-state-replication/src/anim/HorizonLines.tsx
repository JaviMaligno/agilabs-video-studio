import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { Chip } from './pieces.tsx';
import { CLAUDE, GEMINI, HORIZONS, frameState, yOf, type HorizonLinesProps } from './HorizonLines.state.ts';

export { frameState };
export type { HorizonLinesProps };

const PLOT = { x: 180, y: 600, w: 770, h: 420 } as const;
const xAt = (i: number) => PLOT.x + (i / (HORIZONS.length - 1)) * PLOT.w;
const yAt = (v: number) => PLOT.y + yOf(v) * PLOT.h;

export const HorizonLines: React.FC<AnimProps & HorizonLinesProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const data = s.data === 'claude' ? CLAUDE : GEMINI;
  return (
    <AbsoluteFill style={{ fontFamily, color: C.text }}>
      {/* model chip: Claude Haiku 4.5 → Gemini 3 Flash */}
      <div style={{ position: 'absolute', left: 0, width: 1080, top: 458, display: 'flex', justifyContent: 'center', opacity: s.chart }}>
        <div style={{ position: 'relative' }}>
          <div style={{ opacity: 1 - s.chip.swap, transform: `translateY(${-20 * s.chip.swap}px)` }}>
            <Chip text="Claude Haiku 4.5" size={36} color={C.muted} />
          </div>
          <div style={{ position: 'absolute', left: '50%', top: 0, transform: `translate(-50%, ${20 * (1 - s.chip.swap)}px)`, opacity: s.chip.swap }}>
            <Chip text="Gemini 3 Flash · the paper's model" size={36} />
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', inset: 0, opacity: s.chart }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0 }}>
          {[1, 0.9, 0.8, 0.7].map((v) => (
            <g key={v}>
              <line x1={PLOT.x} x2={PLOT.x + PLOT.w} y1={yAt(v)} y2={yAt(v)} stroke={alpha(C.muted, v === 0.7 ? 0.7 : 0.18)} strokeWidth={v === 0.7 ? 3 : 2} />
              <text x={PLOT.x - 20} y={yAt(v) + 10} textAnchor="end" fontSize={28} fontWeight={700} fill={C.muted} fontFamily={fontFamily}>
                {v.toFixed(2)}
              </text>
            </g>
          ))}
          {HORIZONS.map((h, i) => (
            <text key={h} x={xAt(i)} y={PLOT.y + PLOT.h + 46} textAnchor="middle" fontSize={30} fontWeight={700} fill={C.muted} fontFamily={fontFamily}>
              {h}
            </text>
          ))}
          <text x={PLOT.x + PLOT.w / 2} y={PLOT.y + PLOT.h + 92} textAnchor="middle" fontSize={28} fontWeight={800} fill={C.muted} fontFamily={fontFamily} letterSpacing="0.12em">
            STEPS PER TASK
          </text>
          {data.map((d, i) => {
            const st = s.series[i];
            if (!st || st.draw <= 0) return null;
            const pts = d.values.map((v, k) => `${xAt(k)},${yAt(v)}`).join(' ');
            const color = d.tone === 'ok' ? C.ok : C.warm;
            const last = d.values.length - 1;
            return (
              <g key={d.id} opacity={st.opacity * (d.dashed ? 0.75 : 1)}>
                <polyline points={pts} fill="none" stroke={color} strokeWidth={d.dashed ? 5 : 8} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={d.dashed ? undefined : `${st.draw} 1`} opacity={d.dashed ? Math.min(1, st.draw * 2) : 1} style={d.dashed ? { strokeDasharray: '14 10' } : undefined} />
                {st.draw >= 0.98 && <circle cx={xAt(last)} cy={yAt(d.values[last])} r={12} fill={color} />}
              </g>
            );
          })}
        </svg>
        {data.map((d, i) => {
          const st = s.series[i];
          if (!st || st.label <= 0) return null;
          const v = d.values[d.values.length - 1];
          const above = d.id === 'note';
          const color = d.tone === 'ok' ? C.ok : C.warm;
          return (
            <div
              key={`l${d.id}`}
              style={{
                position: 'absolute',
                right: 1080 - (PLOT.x + PLOT.w) - 6,
                top: above ? yAt(v) - 62 : yAt(v) + 14,
                fontSize: 38,
                fontWeight: 800,
                color,
                opacity: st.label * st.opacity,
                whiteSpace: 'nowrap',
                fontStyle: d.dashed ? 'italic' : 'normal',
              }}
            >
              {d.label}
            </div>
          );
        })}
        {s.episodes > 0 && (
          <div style={{ position: 'absolute', left: PLOT.x + 10, top: yAt(1) - 58, fontSize: 30, fontWeight: 800, color: C.ok, opacity: s.episodes }}>75 episodes · never missed</div>
        )}
      </div>

      {s.setup > 0 && (
        <div style={{ position: 'absolute', left: 90, width: 900, top: 1135, textAlign: 'center', fontSize: 32, fontWeight: 700, lineHeight: 1.25, color: C.text, opacity: s.setup, textWrap: 'balance' } as React.CSSProperties}>
          environment matched to the paper's appendix · every cell repeated
        </div>
      )}
      {s.hedge > 0 && (
        <div style={{ position: 'absolute', left: 0, width: 1080, top: 1245, textAlign: 'center', fontSize: 28, fontWeight: 600, fontStyle: 'italic', color: C.muted, opacity: s.hedge }}>
          the Gemini version may not be the exact checkpoint
        </div>
      )}
    </AbsoluteFill>
  );
};
