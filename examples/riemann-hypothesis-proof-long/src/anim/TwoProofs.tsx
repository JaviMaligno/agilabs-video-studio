import React from 'react';
import { staticFile } from 'remotion';
import { C, alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import { LEFT, NOT_YET, PRIZE, RIGHT, SHEET, frameState, type TwoProofsProps } from './TwoProofs.state.ts';

export { frameState };
export type { TwoProofsProps };

// Landscape frame pixels (1920x1080). Stage: x 160..1760, y 140..830.
const GREEN = '#5ee69a';
const ROSE = '#fb7185';
const AMBER = '#fbbf24';
const PAPER = '#f6eedc';

const XL = [560, 772];
const XR = [1360, 1150];
const BASE = 530; // both pictures stand on this line
const STACK = { cols: 11, rows: 11, w: 34, h: 22, gap: 5 };
const SW = STACK.cols * (STACK.w + STACK.gap) - STACK.gap;
const SH = STACK.rows * (STACK.h + STACK.gap) - STACK.gap;
const MAN = { w: 508 * 0.44, h: 885 * 0.44 };
const MEDAL = { w: 486 * 0.47, h: 851 * 0.47 };
const CASE = { x: 470, y: 176, w: 300, h: 520 };

const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

const Label: React.FC<{ x: number; y: number; mark: string; text: string; o: number }> = ({ x, y, mark, text, o }) =>
  o > 0 ? (
    <text x={x} y={y + (1 - o) * 12} textAnchor="middle" fontSize={48} fontWeight={700} fill={C.text} opacity={o}>
      <tspan fill={mark === '✓' ? GREEN : ROSE} fontWeight={800}>
        {mark}
      </tspan>
      {' ' + text}
    </text>
  ) : null;

export const TwoProofs: React.FC<AnimProps & TwoProofsProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const T = s.T;
  const vfit = p.vertical ? fitInto(stageBox(false), stageBox(true)).transform : undefined;
  const g = s.together;
  const xl = lerp(XL[0], XL[1], g) - (1 - s.split) * 520;
  const xr = lerp(XR[0], XR[1], g) + (1 - s.split) * 520;
  const sc = 1 - 0.12 * g;
  const solo = (1 - g) * (1 - s.fade);
  const glint = (T * 0.22) % 1;

  return (
    <Canvas vertical={p.vertical}>
      <defs>
        <linearGradient id="tp-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.accentText} />
          <stop offset="1" stopColor={C.accent2} />
        </linearGradient>
        <linearGradient id="tp-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.03" />
        </linearGradient>
        <clipPath id="tp-case">
          <rect x={CASE.x} y={CASE.y} width={CASE.w} height={CASE.h} rx={16} />
        </clipPath>
      </defs>
      <g transform={vfit}>
        {/* The split picture: fades back when the prize takes the stage. */}
        <g opacity={(1 - s.fade) * s.split}>
          {/* One sheet holding both, while they came together. */}
          {g > 0 && (
            <g opacity={g}>
              <rect x={960 - 470 * (0.7 + 0.3 * g)} y={150} width={940 * (0.7 + 0.3 * g)} height={624} rx={26} fill={alpha(C.card, 0.96)} stroke={alpha(PAPER, 0.55)} strokeWidth={3} />
              <g opacity={s.sheet}>
                <text x={960} y={626} textAnchor="middle" fontSize={46} fontWeight={600} fill={C.muted}>
                  {SHEET.top}
                </text>
                <text x={960} y={712} textAnchor="middle" fontSize={66} fontWeight={800} fill="url(#tp-grad)" letterSpacing="-0.01em">
                  checking{' '}
                  <tspan fill={C.text} fontSize={66 * (1 + 0.35 * s.equals)}>
                    =
                  </tspan>{' '}
                  understanding
                </text>
              </g>
            </g>
          )}
          <line x1={960} x2={960} y1={170} y2={170 + 590 * s.split} stroke={alpha(C.accentText, 0.45)} strokeWidth={3} strokeDasharray="14 12" opacity={1 - g} />

          {/* Left: the stack of Lean files, every tile checked. */}
          <g transform={`translate(${xl} ${BASE}) scale(${sc}) translate(${-xl} ${-BASE})`}>
            <ellipse cx={xl} cy={BASE + 8} rx={SW * 0.55} ry={14} fill={alpha('#000000', 0.4)} />
            {Array.from({ length: STACK.cols * STACK.rows }, (_, k) => {
              const c = k % STACK.cols;
              const r = Math.floor(k / STACK.cols);
              const x = xl - SW / 2 + c * (STACK.w + STACK.gap);
              const y = BASE - SH + r * (STACK.h + STACK.gap);
              const sh = 0.5 + 0.5 * Math.sin(T * 1.5 - c * 0.45 - r * 0.3);
              return (
                <g key={k} transform={`translate(${x} ${y})`}>
                  <rect width={STACK.w} height={STACK.h} rx={4} fill={alpha(GREEN, 0.18 + 0.12 * sh)} stroke={alpha(GREEN, 0.7)} strokeWidth={1.4} />
                  <rect x={5} y={7} width={8 + hash(k) * 16} height={3} rx={1.5} fill={alpha(C.text, 0.7)} />
                  <rect x={5} y={13} width={5 + hash(k + 40) * 13} height={3} rx={1.5} fill={alpha(C.text, 0.4)} />
                </g>
              );
            })}
          </g>

          {/* Right: the second mathematician hugging his manuscript. */}
          <g transform={`translate(${xr} ${BASE}) scale(${sc}) translate(${-xr} ${-BASE})`}>
            <ellipse cx={xr} cy={BASE + 6} rx={MAN.w * 0.5} ry={12} fill={alpha('#000000', 0.4)} />
            <g transform={`translate(0 ${-4 * Math.abs(Math.sin(T * 1.6))}) rotate(${1.2 * Math.sin(T * 1.6)} ${xr} ${BASE})`}>
              <image href={staticFile('cast/second-math.png')} x={xr - MAN.w / 2} y={BASE - MAN.h} width={MAN.w} height={MAN.h} />
            </g>
          </g>

          <g opacity={solo}>
            {LEFT.map((l, i) => (
              <Label key={l.text} x={XL[0]} y={636 + i * 82} mark={l.mark} text={l.text} o={s.left[i]} />
            ))}
            {RIGHT.map((l, i) => (
              <Label key={l.text} x={XR[0]} y={636 + i * 82} mark={l.mark} text={l.text} o={s.right[i]} />
            ))}
          </g>
        </g>

        {/* Coda: the prize medal behind glass, three empty boxes. */}
        {s.medal > 0 && (
          <g opacity={s.medal}>
            <g transform={`translate(0 ${(1 - s.medal) * 40})`}>
              <rect x={CASE.x - 34} y={CASE.y + CASE.h - 4} width={CASE.w + 68} height={44} rx={10} fill={alpha(C.accent, 0.35)} stroke={alpha(C.accentText, 0.6)} strokeWidth={2.5} />
              <rect x={CASE.x} y={CASE.y} width={CASE.w} height={CASE.h} rx={16} fill={alpha(C.card, 0.85)} />
              <image
                href={staticFile('cast/prize-medal.png')}
                x={CASE.x + (CASE.w - MEDAL.w) / 2}
                y={CASE.y + 46 + 6 * Math.sin(T * 1.3)}
                width={MEDAL.w}
                height={MEDAL.h}
              />
              <rect x={CASE.x} y={CASE.y} width={CASE.w} height={CASE.h} rx={16} fill="url(#tp-glass)" stroke={alpha('#ffffff', 0.5)} strokeWidth={3} />
              <g clipPath="url(#tp-case)">
                <polygon
                  points={`${CASE.x - 200 + glint * 700},${CASE.y} ${CASE.x - 140 + glint * 700},${CASE.y} ${CASE.x - 340 + glint * 700},${CASE.y + CASE.h} ${CASE.x - 400 + glint * 700},${CASE.y + CASE.h}`}
                  fill={alpha('#ffffff', 0.16)}
                />
              </g>
            </g>

            <text x={940} y={300 + (1 - s.notYet) * 14} fontSize={76} fontWeight={800} fill={AMBER} opacity={s.notYet}>
              {NOT_YET}
            </text>
            {PRIZE.map((label, i) => {
              const y = 420 + i * 112;
              const o = 0.3 * s.boxes + 0.7 * s.prize[i];
              if (o <= 0) return null;
              return (
                <g key={label} opacity={o} transform={`translate(${(1 - s.boxes) * 20} 0)`}>
                  <rect x={944} y={y - 32} width={64} height={64} rx={10} fill="none" stroke={C.text} strokeWidth={4.5} />
                  <text x={1040} y={y + 17} fontSize={50} fontWeight={600} fill={C.text}>
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </g>
    </Canvas>
  );
};
