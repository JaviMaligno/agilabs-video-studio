import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { frameState, type LensProps } from './JudgeLens.state.ts';
import { Stage, stageOf } from './Stage.tsx';
import { Pill } from './pieces.tsx';
import { NoiseBar, NoiseWindow, RedactedBar, Stamp, StampTool } from './stampPieces.tsx';

export { frameState };
export type { LensProps };

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const CX = 360;
const BW = 540;
const Y = { bar: 20, funnel: 250, funnelH: 210, noise: 500, win: 700, tool: 850 };

export const JudgeLens: React.FC<AnimProps & LensProps> = ({ t, beats, dur, vertical, ...props }) => {
  const s = frameState(props, t, beats, dur);
  const { w: W } = stageOf(vertical);
  const reading = Math.max(0, ...s.passes.map((p) => (p.opacity > 0 ? p.read * (1 - p.stamp.pop) : 0)));
  const press = Math.max(0, ...s.passes.map((p) => (p.opacity > 0 && p.stamp.pop > 0 && p.stamp.pop < 1 ? 1 : 0)));
  return (
    <Stage vertical={vertical} fill>
      {/* the funnel */}
      <svg width={W} height={Y.funnel + Y.funnelH + 20} style={{ position: 'absolute', left: 0, top: 0, opacity: s.funnel.appear, overflow: 'visible' }}>
        <defs>
          <linearGradient id="funnel-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={alpha(C.accent, 0.35 + 0.4 * s.funnel.glow)} />
            <stop offset="1" stopColor={alpha(C.accent2, 0.6 + 0.3 * s.funnel.glow)} />
          </linearGradient>
        </defs>
        <path
          d={`M ${CX - 300} ${Y.funnel} L ${CX + 300} ${Y.funnel} L ${CX + 80} ${Y.funnel + Y.funnelH} L ${CX - 80} ${Y.funnel + Y.funnelH} Z`}
          fill="url(#funnel-g)"
          stroke={C.text}
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <text x={CX} y={Y.funnel + 92} textAnchor="middle" fontSize={56} fontWeight={800} fill={C.text} fontFamily="Inter">
          cipher
        </text>
        <text x={CX} y={Y.funnel + 140} textAnchor="middle" fontSize={28} fontWeight={600} fill={alpha(C.text, 0.8)} fontFamily="Inter">
          run back through
        </text>
      </svg>
      {s.passes.map((p, i) =>
        p.opacity > 0 ? (
          <React.Fragment key={i}>
            {/* the plain-English refusal, dropping into the funnel */}
            {p.drop < 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: CX - BW / 2,
                  top: lerp(Y.bar, Y.funnel + 40, p.drop),
                  opacity: p.opacity * p.enter * (1 - p.drop * 0.9),
                  transform: `translateY(${(1 - p.enter) * -30}px) scale(${lerp(1, 0.4, p.drop)}, ${lerp(1, 0.3, p.drop)})`,
                  transformOrigin: 'center top',
                }}
              >
                <RedactedBar w={BW} h={200} lines={3} label="refusal, in plain English" />
              </div>
            )}
            {/* what comes out: noise */}
            {p.emerge > 0 && (
              <div style={{ position: 'absolute', left: CX - BW / 2, top: lerp(Y.funnel + Y.funnelH - 60, Y.noise, p.emerge), opacity: p.opacity * p.emerge, transform: `translateX(${p.stamp.shake * 12}px)` }}>
                <NoiseBar w={BW} h={160} t={t} seed={50 + i} cols={14} rows={2} size={44} />
                <div style={{ position: 'absolute', left: 0, top: 30, width: BW, display: 'flex', justifyContent: 'center' }}>
                  <Stamp label="garbled" size={58} rot={-8} s={p.stamp} />
                </div>
              </div>
            )}
          </React.Fragment>
        ) : null,
      )}
      {/* the judge */}
      <div style={{ position: 'absolute', left: CX - BW / 2, top: Y.win, opacity: s.judge.appear }}>
        <NoiseWindow w={BW} h={120} t={t} label="what the judge sees" rows={1} cols={14} seed={9} size={40} glow={reading} />
      </div>
      <div style={{ position: 'absolute', left: CX - 150, top: Y.tool, width: 300, display: 'flex', alignItems: 'center', gap: 22, opacity: s.judge.appear }}>
        <StampTool size={110} press={press} lit={press} />
        <div style={{ fontSize: 40, fontWeight: 800, whiteSpace: 'nowrap' }}>LLM judge</div>
      </div>
      {/* tally: every pass ends the same way */}
      <div style={{ position: 'absolute', left: 690, top: 250, width: 270, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        {s.tally.map((x, i) => (
          <div key={i} style={{ opacity: x.pop, transform: `scale(${1.4 - 0.4 * x.pop})` }}>
            <Stamp label="garbled" size={34} rot={-8 + i * 3} />
          </div>
        ))}
        <div style={{ fontSize: 60, fontWeight: 800, color: C.muted, opacity: s.tally[2].pop }}>×3</div>
      </div>
      <div style={{ position: 'absolute', left: 0, width: W, top: 1010, display: 'flex', justifyContent: 'center', opacity: s.tag.pop, transform: `scale(${0.8 + 0.2 * s.tag.pop})` }}>
        <Pill size={40}>garbled by construction</Pill>
      </div>
    </Stage>
  );
};
