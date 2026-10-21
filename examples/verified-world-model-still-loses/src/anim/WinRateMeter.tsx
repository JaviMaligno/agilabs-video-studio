import React from 'react';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { AXIS, axisPos, frameState, type WinRateProps } from './WinRateMeter.state.ts';

export { frameState };
export type { WinRateProps };

/** Plot box in frame pixels. */
const X0 = 130;
const X1 = 950;
const xOf = (pos: number) => X0 + pos * (X1 - X0);
const ROW_Y = { fair: 540, model: 880 } as const;
const AXIS_Y = 1000;

/** The verdict number: the article's CI figure, the win-rate meter grown to full width. */
export const WinRateMeter: React.FC<AnimProps & WinRateProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const fair = s.rows.find((r) => r.id === 'fair')!;
  const model = s.rows.find((r) => r.id === 'model')!;
  const gapY = 650;
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily, color: C.text }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 268, textAlign: 'center', opacity: s.axis }}>
        <div style={{ fontSize: 50, fontWeight: 800 }}>win rate vs the true game</div>
        <div style={{ fontSize: 34, fontWeight: 600, color: C.muted, marginTop: 6 }}>at play · dot = win rate · bar = 95% interval</div>
      </div>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        {/* Axis. */}
        <g opacity={s.axis}>
          <line x1={X0} y1={AXIS_Y} x2={X0 + (X1 - X0) * s.axis} y2={AXIS_Y} stroke={alpha(C.text, 0.7)} strokeWidth={4} />
          {AXIS.ticks.map((v) => (
            <g key={v}>
              <line x1={xOf(axisPos(v))} y1={AXIS_Y} x2={xOf(axisPos(v))} y2={AXIS_Y + 16} stroke={alpha(C.text, 0.7)} strokeWidth={4} />
              <line x1={xOf(axisPos(v))} y1={430} x2={xOf(axisPos(v))} y2={AXIS_Y} stroke={alpha(C.muted, 0.12)} strokeWidth={2} />
              <text x={xOf(axisPos(v))} y={AXIS_Y + 58} textAnchor="middle" fontFamily={fontFamily} fontSize={36} fontWeight={600} fill={C.muted}>
                {v.toFixed(2)}
              </text>
            </g>
          ))}
        </g>
        {/* Rows: dot + whiskers. */}
        {[fair, model].map((r) => {
          const y = ROW_Y[r.id];
          const col = r.id === 'fair' ? C.accentText : C.roseText;
          const dot = r.id === 'fair' ? C.accent : C.rose;
          const mid = xOf(r.pos);
          const half = (xOf(r.hi) - xOf(r.lo)) / 2;
          return (
            <g key={r.id} opacity={r.appear}>
              <line x1={mid - half * r.whisker} y1={y} x2={mid + half * r.whisker} y2={y} stroke={col} strokeWidth={8} strokeLinecap="round" />
              <line x1={mid - half * r.whisker} y1={y - 24} x2={mid - half * r.whisker} y2={y + 24} stroke={col} strokeWidth={6} opacity={r.whisker} />
              <line x1={mid + half * r.whisker} y1={y - 24} x2={mid + half * r.whisker} y2={y + 24} stroke={col} strokeWidth={6} opacity={r.whisker} />
              <circle cx={mid} cy={y} r={24 * (0.4 + 0.6 * r.pop)} fill={dot} stroke={C.text} strokeWidth={5} />
              <line x1={mid} y1={y + 30} x2={mid} y2={AXIS_Y} stroke={alpha(col, 0.35)} strokeWidth={3} strokeDasharray="8 8" />
            </g>
          );
        })}
        {/* The gap: play cost. */}
        <g opacity={s.gap.draw}>
          <line x1={xOf(model.pos)} y1={gapY} x2={xOf(model.pos) + (xOf(fair.pos) - xOf(model.pos)) * s.gap.draw} y2={gapY} stroke={C.gold} strokeWidth={6} />
          <line x1={xOf(model.pos)} y1={gapY - 18} x2={xOf(model.pos)} y2={gapY + 18} stroke={C.gold} strokeWidth={6} />
          {s.gap.draw >= 1 && <line x1={xOf(fair.pos)} y1={gapY - 18} x2={xOf(fair.pos)} y2={gapY + 18} stroke={C.gold} strokeWidth={6} />}
        </g>
      </svg>
      {/* Row labels, above each dot. */}
      {[fair, model].map((r) => (
        <div
          key={r.id}
          style={{
            position: 'absolute',
            left: xOf(r.pos) - 300,
            width: 600,
            top: ROW_Y[r.id] - 128,
            textAlign: 'center',
            opacity: r.appear,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: 44, fontWeight: 700, color: C.text }}>{r.label} </span>
          <span style={{ fontSize: 72, fontWeight: 800, color: r.id === 'fair' ? C.accentText : C.roseText, fontVariantNumeric: 'tabular-nums' }}>{r.text}</span>
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          left: xOf(model.pos) - 40,
          width: xOf(fair.pos) - xOf(model.pos) + 80,
          top: gapY + 18,
          textAlign: 'center',
          opacity: s.gap.opacity,
          whiteSpace: 'nowrap',
          fontSize: 50,
          fontWeight: 800,
          color: C.gold,
          textShadow: `0 0 14px ${C.bg0}`,
        }}
      >
        play cost {s.gap.text}
      </div>
      {/* Footnote. */}
      <div style={{ position: 'absolute', left: 60, right: 60, top: 1110, textAlign: 'center', opacity: s.footnote, fontSize: 31, fontWeight: 500, color: C.muted, lineHeight: 1.4 }}>
        95% intervals don’t overlap · draws count as half a win
        <br />
        0.404: hand-written stand-in; the real synthesis
        <br />
        pipeline lost more (0.345)
      </div>
    </div>
  );
};
