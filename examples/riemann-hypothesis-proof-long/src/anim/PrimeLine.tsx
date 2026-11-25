import React from 'react';
import { staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { designOf, fitInto, stageBox } from './canvas.ts';
import { CHART_SAMPLES, DRIFT, frameState, SQRT_MAX, type PrimeLineProps } from './PrimeLine.state.ts';

export { frameState };
export type { PrimeLineProps };

// Landscape frame pixels (1920x1080); the stage is x 160..1760, y 140..830.
const CHALK = '#eef2ff';
const NL = { x0: 210, x1: 1710, y: 520 };
const WIN = { x0: 210, x1: 1710, y: 515 };
const CH = { x0: 260, x1: 1600, y: 300, depth: 470 };

/** Chalk on slate: rough edges and a dry, grainy fill. Shared by the board scenes. */
export const ChalkDefs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <filter id={`${id}-chalk`} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="2" result="g" />
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.2 2.1" result="grain" />
      <feComposite in="d" in2="grain" operator="in" />
    </filter>
    <filter id={`${id}-glow`} x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="7" />
    </filter>
    <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor={C.accentText} />
      <stop offset="1" stopColor={C.accent2} />
    </linearGradient>
  </defs>
);

/** The empty slate, full-bleed, and a few motes of chalk dust drifting through the light. */
export const Board: React.FC<{ vertical: boolean; T: number }> = ({ vertical, T }) => {
  const { w, h } = designOf(vertical);
  return (
    <g>
      <image href={staticFile('bg/bg-board.jpg')} x={0} y={0} width={w} height={h} preserveAspectRatio="none" />
      {Array.from({ length: 16 }, (_, i) => {
        const sx = ((i * 0.6180339) % 1) * w;
        const sy = ((i * 0.4142135 + 0.13) % 1) * h * 0.8;
        const x = sx + 40 * Math.sin(T * 0.21 + i * 1.7);
        const y = ((sy - T * (6 + (i % 5) * 2.5)) % (h * 0.8) + h * 0.8) % (h * 0.8);
        return <circle key={i} cx={x} cy={y} r={1.6 + (i % 3) * 0.8} fill={CHALK} opacity={0.08 + 0.07 * (0.5 + 0.5 * Math.sin(T * 0.8 + i))} />;
      })}
    </g>
  );
};

/** Lays the landscape drawing out in the vertical stage too (only landscape is rendered). */
export const Fit: React.FC<{ vertical: boolean; children: React.ReactNode }> = ({ vertical, children }) =>
  vertical ? <g transform={fitInto(stageBox(false), stageBox(true)).transform}>{children}</g> : <>{children}</>;

const T_ = (props: React.SVGProps<SVGTextElement>) => <text fontWeight={700} fill={CHALK} textAnchor="middle" {...props} />;

const nx = (n: number) => NL.x0 + ((n - 1) / 99) * (NL.x1 - NL.x0);

export const PrimeLine: React.FC<AnimProps & PrimeLineProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const breathe = 0.5 + 0.5 * Math.sin(s.T * 1.6);
  const id = 'pl';
  const chalk = `url(#${id}-chalk)`;

  // Count vs guess: the count drawn below the guess line; depth eases from the drift to √x.
  const yOf = (v: number) => CH.y + (v / s.depth) * CH.depth;
  const xOf = (i: number) => CH.x0 + (i / CHART_SAMPLES) * (CH.x1 - CH.x0);
  const shown = Math.max(1, Math.round(s.ribbon * CHART_SAMPLES));
  const curve = DRIFT.slice(0, shown + 1).map((v, i) => `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`);
  const ribbonPath = `M${CH.x0},${CH.y} L${curve.join(' L')} L${xOf(shown).toFixed(1)},${CH.y} Z`;
  const boundPts = Array.from({ length: 121 }, (_, k) => {
    const x = (k / 120) * 1e6;
    return `${(CH.x0 + (k / 120) * (CH.x1 - CH.x0)).toFixed(1)},${yOf(Math.sqrt(x)).toFixed(1)}`;
  });
  const endY = yOf(DRIFT[CHART_SAMPLES]);
  const midI = Math.round(CHART_SAMPLES * 0.62);

  return (
    <Canvas vertical={p.vertical}>
      <ChalkDefs id={id} />
      <Board vertical={p.vertical} T={s.T} />
      <Fit vertical={p.vertical}>
        {/* 0-1 · 1859, the problem, 167 years, the prize */}
        {s.introOpacity > 0 && (
          <g opacity={s.introOpacity}>
            <g transform={`translate(${400 * (1 - s.shift)} 0)`}>
            <clipPath id="pl-write">
              <rect x={300} y={240} width={520 * s.write} height={220} />
            </clipPath>
            <g filter={chalk}>
              <T_ x={560} y={420} fontSize={190} fontWeight={800} clipPath="url(#pl-write)" letterSpacing={4}>
                1859
              </T_>
              <path d={`M350 455 q 210 ${10 + 4 * breathe} 420 -6`} stroke={CHALK} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="440" strokeDashoffset={440 * (1 - s.famous)} />
              <g opacity={s.famous} transform={`translate(0 ${(1 - s.famous) * 12})`}>
                <T_ x={560} y={535} fontSize={54} fontWeight={600}>the most famous</T_>
                <T_ x={560} y={600} fontSize={54} fontWeight={600}>open problem</T_>
              </g>
              <g opacity={s.years} transform={`translate(0 ${(1 - s.years) * 14})`}>
                <T_ x={560} y={735} fontSize={80} fontWeight={800} fill={`url(#${id}-grad)`}>167 years</T_>
              </g>
            </g>
            </g>
            <g opacity={Math.min(1, s.medal * 1.5)} transform={`translate(1290 ${210 + 6 * Math.sin(s.T * 1.1)}) rotate(${2.5 * Math.sin(s.T * 0.9)}) scale(${0.6 + 0.4 * s.medal})`}>
              <ellipse cx={0} cy={430} rx={110} ry={14} fill={alpha('#000000', 0.25)} />
              <image href={staticFile('cast/prize-medal.png')} x={-120} y={0} width={240} height={420} />
            </g>
            <g opacity={s.prize} transform={`translate(0 ${(1 - s.prize) * 14})`} filter={chalk}>
              <T_ x={1290} y={735} fontSize={92} fontWeight={800}>$1,000,000</T_>
            </g>
          </g>
        )}

        {/* 2 · the number line 1..100 and its primes; 3 · the dive towards a million */}
        {s.lineDraw > 0 && s.lineOpacity > 0 && (
          <g opacity={s.lineOpacity} transform={`translate(${NL.x1} ${NL.y}) scale(${1 + 7 * s.dive}) translate(${-NL.x1} ${-NL.y})`}>
            <g filter={chalk}>
              <T_ x={960} y={330} fontSize={60} opacity={Math.min(1, s.lineDraw * 2)}>the primes</T_>
              <line x1={NL.x0 - 20} y1={NL.y} x2={NL.x0 - 20 + (NL.x1 - NL.x0 + 40) * s.lineDraw} y2={NL.y} stroke={CHALK} strokeWidth={5} strokeLinecap="round" />
              {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
                const x = nx(n);
                const on = (x - NL.x0) / (NL.x1 - NL.x0) <= s.lineDraw;
                if (!on) return null;
                const major = n === 1 || n % 10 === 0;
                return (
                  <g key={n}>
                    <line x1={x} y1={NL.y - (major ? 18 : 9)} x2={x} y2={NL.y + (major ? 18 : 9)} stroke={CHALK} strokeWidth={major ? 4 : 2.5} opacity={major ? 0.95 : 0.55} />
                    {major && (
                      <T_ x={x} y={NL.y + 70} fontSize={40} fontWeight={600} opacity={0.85}>
                        {n}
                      </T_>
                    )}
                  </g>
                );
              })}
            </g>
            {s.small.map(({ n, pop }) =>
              pop > 0 ? (
                <g key={n} transform={`translate(${nx(n)} ${NL.y}) scale(${pop})`}>
                  <circle r={22} fill={C.accentText} opacity={0.35 + 0.2 * Math.sin(s.T * 2 + n)} filter={`url(#${id}-glow)`} />
                  <circle r={11} fill={C.accentText} />
                  <circle r={5} fill={CHALK} />
                </g>
              ) : null,
            )}
            <g opacity={s.spread} filter={chalk}>
              <T_ x={960 + 8 * Math.sin(s.T)} y={690} fontSize={48} fontWeight={600} fill={CHALK} opacity={0.85}>
                fewer and fewer as you go →
              </T_>
            </g>
          </g>
        )}

        {/* 3-5 · near a million: the window, the guess, the real primes */}
        {s.near > 0 && (
          <g>
            <g filter={chalk}>
              <T_ x={960} y={235} fontSize={56} fontWeight={600} opacity={s.near}>
                near 1,000,000
              </T_>
              <g opacity={s.oneIn14} transform={`translate(0 ${(1 - s.oneIn14) * 12})`}>
                <T_ x={960} y={330} fontSize={72} fontWeight={800} fill={C.accentText}>
                  about 1 in 14 is prime
                </T_>
              </g>
              <g opacity={s.near}>
                <line x1={WIN.x0 - 40} y1={WIN.y} x2={WIN.x1 + 40} y2={WIN.y} stroke={CHALK} strokeWidth={5} strokeLinecap="round" />
              </g>
            </g>
            {s.windowOn > 0 && (
              <g opacity={s.windowOn}>
                <rect
                  x={960 - (WIN.x1 - WIN.x0) / 2 * s.windowOn}
                  y={WIN.y - 70}
                  width={(WIN.x1 - WIN.x0) * s.windowOn}
                  height={140}
                  rx={14}
                  fill={alpha(C.accent, 0.13 + 0.03 * breathe)}
                  stroke={alpha(C.accentText, 0.6)}
                  strokeWidth={3}
                />
                <g filter={chalk}>
                  <line x1={WIN.x0} y1={WIN.y - 30} x2={WIN.x0} y2={WIN.y + 30} stroke={CHALK} strokeWidth={5} />
                  <line x1={WIN.x1} y1={WIN.y - 30} x2={WIN.x1} y2={WIN.y + 30} stroke={CHALK} strokeWidth={5} />
                  <T_ x={WIN.x0 - 10} y={WIN.y + 115} fontSize={42} fontWeight={600} textAnchor="start">1,000,000</T_>
                  <T_ x={WIN.x1 + 10} y={WIN.y + 115} fontSize={42} fontWeight={600} textAnchor="end">1,001,000</T_>
                </g>
              </g>
            )}
            {s.ticks.map((k, i) =>
              k.pop > 0 && s.expectedOn > 0 ? (
                <line
                  key={i}
                  x1={WIN.x0 + k.x * (WIN.x1 - WIN.x0)}
                  x2={WIN.x0 + k.x * (WIN.x1 - WIN.x0)}
                  y1={WIN.y - 58}
                  y2={WIN.y - 58 + 26 * k.pop}
                  stroke={C.accentText}
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={s.expectedOn * 0.9}
                />
              ) : null,
            )}
            {s.real.map((r, i) =>
              r.pop > 0 && s.actualOn > 0 ? (
                <g key={i} transform={`translate(${WIN.x0 + r.x * (WIN.x1 - WIN.x0)} ${WIN.y}) scale(${r.pop})`} opacity={s.actualOn}>
                  <circle r={14} fill={CHALK} opacity={0.3 + 0.15 * Math.sin(s.T * 2.2 + i)} filter={`url(#${id}-glow)`} />
                  <circle r={7} fill={CHALK} />
                </g>
              ) : null,
            )}
            <g opacity={s.expectedOn} transform={`translate(0 ${(1 - s.expectedOn) * 16})`}>
              <T_ x={700} y={705} fontSize={46} fontWeight={600} fill={C.accentText}>expected</T_>
              <T_ x={700} y={812} fontSize={116} fontWeight={800} fill={C.accentText} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.expectedText}
              </T_>
            </g>
            <g opacity={s.actualOn} transform={`translate(0 ${(1 - s.actualOn) * 16})`}>
              <T_ x={1220} y={705} fontSize={46} fontWeight={600}>actual</T_>
              <T_ x={1220} y={812} fontSize={116} fontWeight={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.actualText}
              </T_>
            </g>
          </g>
        )}

        {/* 6-7 · count vs guess over 0..1,000,000; the √x bound */}
        {s.chart > 0 && (
          <g opacity={s.chart}>
            <g filter={chalk}>
              <T_ x={960} y={200} fontSize={56} fontWeight={700} opacity={1 - s.sqrtLabel}>
                the guess vs. the real count
              </T_>
              <g opacity={s.sqrtLabel} transform={`translate(0 ${(1 - s.sqrtLabel) * 10})`}>
                <T_ x={960} y={205} fontSize={72} fontWeight={800} fill={`url(#${id}-grad)`}>
                  drift: at most ≈ √x
                </T_>
              </g>
              <T_ x={CH.x0} y={CH.y - 26} fontSize={40} fontWeight={600} textAnchor="start" opacity={0.85}>0</T_>
              <T_ x={930} y={CH.y - 26} fontSize={40} fontWeight={600} fill={C.muted}>x = how far you've counted →</T_>
              <T_ x={CH.x1} y={CH.y - 26} fontSize={40} fontWeight={600} textAnchor="end" opacity={0.85}>1,000,000</T_>
            </g>
            {s.bound > 0 && (
              <path
                d={`M${CH.x0},${CH.y} L${boundPts.join(' L')} L${CH.x1},${CH.y} Z`}
                fill={alpha(C.accentText, 0.08 * s.bound + 0.02 * breathe * s.bound)}
              />
            )}
            <path d={ribbonPath} fill={alpha(C.accent2, 0.32 + 0.06 * breathe)} />
            <g filter={chalk}>
              <line x1={CH.x0} y1={CH.y} x2={CH.x1} y2={CH.y} stroke={C.accentText} strokeWidth={6} strokeDasharray="22 14" strokeLinecap="round" />
              <T_ x={CH.x1 + 20} y={CH.y + 15} fontSize={44} fill={C.accentText} textAnchor="start">guess</T_>
              <polyline points={curve.join(' ')} fill="none" stroke={CHALK} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
              <g opacity={clamp(s.ribbon * 3 - 2)}>
                <T_ x={CH.x1 + 20} y={endY + 15} fontSize={44} textAnchor="start">count</T_>
              </g>
              <g opacity={clamp(s.ribbon * 3 - 2) * (1 - s.bound)}>
                <T_ x={xOf(midI)} y={(CH.y + yOf(DRIFT[midI])) / 2 + 16} fontSize={46}>drift</T_>
              </g>
              {s.bound > 0 && (
                <>
                  <clipPath id="pl-bound">
                    <rect x={CH.x0 - 10} y={CH.y - 20} width={(CH.x1 - CH.x0 + 20) * s.bound} height={CH.depth + 60} />
                  </clipPath>
                  <polyline
                    points={boundPts.join(' ')}
                    fill="none"
                    stroke={CHALK}
                    strokeWidth={5}
                    strokeDasharray="16 12"
                    opacity={0.8}
                    clipPath="url(#pl-bound)"
                  />
                  <g opacity={s.sqrtLabel}>
                    <T_ x={CH.x1 + 20} y={yOf(SQRT_MAX) + 18} fontSize={56} fontWeight={800} textAnchor="start">√x</T_>
                  </g>
                </>
              )}
            </g>
          </g>
        )}
      </Fit>
    </Canvas>
  );
};

const clamp = (x: number) => (Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 0);
