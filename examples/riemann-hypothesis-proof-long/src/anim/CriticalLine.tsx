import React from 'react';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { Board, ChalkDefs, Fit } from './PrimeLine.tsx';
import { IM_MAX, OFF_IM, OFF_RE, frameState, type CriticalLineProps } from './CriticalLine.state.ts';

export { frameState };
export type { CriticalLineProps };

// Landscape frame pixels (1920x1080); the stage is x 160..1760, y 140..830.
const CHALK = '#eef2ff';
const ST = { re0: 880, re1: 1180, y0: 765, yTop: 205 };
const reX = (re: number) => ST.re0 + re * (ST.re1 - ST.re0);
const imY = (im: number) => ST.y0 - (im / IM_MAX) * (ST.y0 - ST.yTop);
const LINE_X = reX(0.5);
const LABEL_X = 1250;

const T_ = (props: React.SVGProps<SVGTextElement>) => <text fontWeight={700} fill={CHALK} textAnchor="middle" {...props} />;

const Label: React.FC<{ o: number; lines: string[]; fill?: string; y?: number }> = ({ o, lines, fill = CHALK, y = 420 }) =>
  o > 0 ? (
    <g opacity={o} transform={`translate(${(1 - o) * 14} 0)`}>
      {lines.map((l, i) => (
        <T_ key={i} x={LABEL_X} y={y + i * 64} fontSize={52} textAnchor="start" fill={fill}>
          {l}
        </T_>
      ))}
    </g>
  ) : null;

export const CriticalLine: React.FC<AnimProps & CriticalLineProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const id = 'cl';
  const chalk = `url(#${id}-chalk)`;
  const breathe = 0.5 + 0.5 * Math.sin(s.T * 1.5);
  // ζ: centred and large on its own, then aside on the left for the strip.
  const zx = 960 + (470 - 960) * s.aside;
  const zs = 1.3 - 0.3 * s.aside;
  const zy = 470 + 6 * Math.sin(s.T * 1.2);

  return (
    <Canvas vertical={p.vertical}>
      <ChalkDefs id={id} />
      <Board vertical={p.vertical} T={s.T} />
      <Fit vertical={p.vertical}>
        {/* 0 · ζ, written large */}
        <g transform={`translate(${zx} ${zy}) scale(${zs})`}>
          <clipPath id="cl-write">
            <rect x={-200} y={-260} width={400} height={360 * s.zeta} />
          </clipPath>
          <g filter={chalk}>
            <T_ x={0} y={60} fontSize={300} fontWeight={600} clipPath="url(#cl-write)">
              ζ
            </T_>
            <g opacity={s.zetaLabel}>
              <T_ x={0} y={175} fontSize={50 / zs} fontWeight={600} fill={C.accentText}>
                zeta function
              </T_>
            </g>
          </g>
        </g>

        {/* 1 · the critical strip, real part 0 to 1 */}
        {s.strip > 0 && (
          <g>
            <rect x={ST.re0} y={ST.y0 - (ST.y0 - ST.yTop) * s.strip} width={ST.re1 - ST.re0} height={(ST.y0 - ST.yTop) * s.strip} fill={alpha(C.accent, 0.14 + 0.03 * breathe)} />
            <g filter={chalk} opacity={Math.min(1, s.strip * 1.5)}>
              <line x1={ST.re0 - 130} y1={ST.y0} x2={ST.re1 + 130} y2={ST.y0} stroke={CHALK} strokeWidth={5} strokeLinecap="round" />
              {[ST.re0, ST.re1].map((x) => (
                <line key={x} x1={x} y1={ST.y0} x2={x} y2={ST.y0 - (ST.y0 - ST.yTop) * s.strip} stroke={CHALK} strokeWidth={4} strokeDasharray="14 12" />
              ))}
              <T_ x={ST.re0} y={ST.y0 + 52} fontSize={42} fontWeight={600}>0</T_>
              <T_ x={ST.re1} y={ST.y0 + 52} fontSize={42} fontWeight={600}>1</T_>
            </g>
          </g>
        )}

        {/* 2 · the middle line, real part ½ */}
        {s.line > 0 && (
          <g>
            <line x1={LINE_X} y1={ST.y0} x2={LINE_X} y2={ST.y0 - (ST.y0 - ST.yTop) * s.line} stroke={C.accentText} strokeWidth={22} opacity={0.35 + 0.2 * breathe} filter={`url(#${id}-glow)`} />
            <line x1={LINE_X} y1={ST.y0} x2={LINE_X} y2={ST.y0 - (ST.y0 - ST.yTop) * s.line} stroke={C.accentText} strokeWidth={7} strokeLinecap="round" />
            <g filter={chalk} opacity={s.line}>
              <T_ x={LINE_X} y={ST.y0 + 52} fontSize={42} fontWeight={700} fill={C.accentText}>½</T_>
            </g>
          </g>
        )}

        {/* 3 · the first ten zeros drop onto the line */}
        {s.zeros.map((z, i) => {
          if (z.drop <= 0) return null;
          const y = imY(z.im);
          const from = ST.yTop - 90;
          const cy = from + (y - from) * z.drop;
          const tw = 0.75 + 0.25 * Math.sin(s.T * 2.4 + i * 1.3);
          return (
            <g key={i} transform={`translate(${LINE_X} ${cy})`} opacity={Math.min(1, z.drop * 2.5)}>
              <circle r={18 + 10 * z.pop * (1 - z.pop) * 4} fill={CHALK} opacity={0.35 * tw} filter={`url(#${id}-glow)`} />
              <circle r={10} fill={CHALK} />
              <circle r={10} fill="none" stroke={C.accentText} strokeWidth={3} />
            </g>
          );
        })}

        {/* 4 · a pair off the line that would break it: flickers, fades */}
        {s.offShown > 0 &&
          [-1, 1].map((side) => (
            <g key={side} transform={`translate(${reX(0.5 + side * OFF_RE)} ${imY(OFF_IM)})`} opacity={s.offOpacity}>
              <circle r={26} fill={alpha(C.accent2, 0.25)} filter={`url(#${id}-glow)`} />
              <circle r={16} fill="none" stroke={CHALK} strokeWidth={4} strokeDasharray="7 6" />
              <T_ x={0} y={-30} fontSize={48} fontWeight={800} fill={CHALK}>?</T_>
            </g>
          ))}
        {s.infinity > 0 && (
          <g opacity={s.infinity}>
            <line x1={LINE_X} y1={ST.yTop} x2={LINE_X} y2={ST.yTop - 30 * s.infinity} stroke={C.accentText} strokeWidth={6} strokeDasharray="6 9" strokeLinecap="round" />
            <g filter={chalk}>
              <T_ x={LINE_X + 34} y={ST.yTop - 20 + 3 * Math.sin(s.T * 1.4)} fontSize={64} fontWeight={800} textAnchor="start" fill={C.accentText}>
                …∞
              </T_>
            </g>
          </g>
        )}

        {/* labels, one per line, on the right */}
        <g filter={chalk}>
          <Label o={s.stripLabel} lines={['points where', 'it equals zero']} />
          <Label o={s.lineLabel} lines={['the line', '(real part ½)']} fill={C.accentText} />
          <Label o={s.everyLabel} lines={['every zero', 'ever computed']} y={330} />
          <Label o={s.neverLabel} lines={['computing can', 'never prove it']} fill={C.accentText} y={590} />
        </g>
      </Fit>
    </Canvas>
  );
};
