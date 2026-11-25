import React from 'react';
import { staticFile } from 'remotion';
import { alpha } from '../brand.ts';
import type { AnimProps } from './types.ts';
import { Canvas } from './Canvas.tsx';
import { fitInto, stageBox } from './canvas.ts';
import { NOTES, NOT_YET, ROWS, STAMP, frameState, type ChecklistProps } from './Checklist.state.ts';

export { frameState };
export type { ChecklistProps };

// Landscape frame pixels (1920x1080), drawn in chalk on the slate.
const CHALK = '#eef1f8';
const CHALK_SOFT = '#cfd6e6';
const GREEN = '#5ee69a';
const AMBER = '#fbbf24';
const STAMP_INK = '#b49cff';

const ROW = { y0: 200, step: 82, box: 52, boxX: 612, labelX: 692, noteX: 1206 };
const rowY = (i: number): number => ROW.y0 + i * ROW.step;

const STACK = { cols: 7, rows: 8, w: 42, h: 26, gap: 6, x: 196, y: 196 };
const TILES = STACK.cols * STACK.rows;

const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const TICK = 'M -15 1 L -4 13 L 17 -14';
const TICK_LEN = 50;

export const Checklist: React.FC<AnimProps & ChecklistProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const T = s.T;
  const vfit = p.vertical ? fitInto(stageBox(false), stageBox(true)).transform : undefined;
  const bob = (ph: number) => 4 * Math.sin(T * 2 + ph);
  return (
    <Canvas vertical={p.vertical}>
      <defs>
        <filter id="ck-chalk" x="-5%" y="-20%" width="110%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feComponentTransfer in="n" result="grain">
            <feFuncA type="linear" slope="1.6" intercept="-0.25" />
          </feComponentTransfer>
          <feComposite in="d" in2="grain" operator="in" result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="g" />
          </feMerge>
        </filter>
        <filter id="ck-hue">
          <feColorMatrix type="hueRotate" values="95" />
        </filter>
      </defs>
      {!p.vertical && <image href={staticFile('bg/bg-board.jpg')} x={0} y={0} width={1920} height={1080} preserveAspectRatio="xMidYMid slice" />}
      <g transform={vfit}>
        {/* The stack of Lean files, tinting green as the machine rows tick. */}
        <g transform={`translate(0 ${2 * Math.sin(T * 0.9)})`}>
          {Array.from({ length: TILES }, (_, k) => {
            const c = k % STACK.cols;
            const r = Math.floor(k / STACK.cols);
            const order = hash(k * 7 + 1);
            const green = order < s.checked;
            const shimmer = 0.5 + 0.5 * Math.sin(T * 1.6 - c * 0.5 - r * 0.35);
            const x = STACK.x + c * (STACK.w + STACK.gap);
            const y = STACK.y + r * (STACK.h + STACK.gap);
            return (
              <g key={k} transform={`translate(${x} ${y})`} opacity={s.board}>
                <rect width={STACK.w} height={STACK.h} rx={5} fill={green ? alpha(GREEN, 0.32 + 0.1 * shimmer) : alpha('#818cf8', 0.22 + 0.08 * shimmer)} stroke={green ? alpha(GREEN, 0.85) : alpha('#a5b4fc', 0.6)} strokeWidth={1.6} />
                <rect x={6} y={8} width={10 + hash(k) * 20} height={3} rx={1.5} fill={alpha(CHALK, 0.7)} />
                <rect x={6} y={15} width={6 + hash(k + 50) * 16} height={3} rx={1.5} fill={alpha(CHALK, 0.45)} />
              </g>
            );
          })}
        </g>

        {/* The checker robot (hops on every tick) and, later, the independent second checker. */}
        <g transform={`translate(0 ${bob(0) - 22 * s.hop})`} opacity={s.board}>
          <ellipse cx={318} cy={808} rx={110} ry={12} fill={alpha('#000000', 0.35)} />
          <image href={staticFile('cast/checker.png')} x={180} y={520} width={277} height={286} />
        </g>
        {s.second > 0 && (
          <g transform={`translate(${472} ${806 + bob(1.7)}) scale(${-s.second} ${s.second})`}>
            <ellipse cx={0} cy={2} rx={86} ry={10} fill={alpha('#000000', 0.35)} />
            <image href={staticFile('cast/checker.png')} x={-108} y={-224} width={217} height={224} filter="url(#ck-hue)" />
          </g>
        )}

        {/* Focus band on the row being discussed. */}
        <rect
          x={590}
          y={rowY(s.focusRow) - 38}
          width={1172}
          height={76}
          rx={14}
          fill={alpha(CHALK, 0.07 * s.focusOn)}
          stroke={alpha(CHALK, 0.22 * s.focusOn)}
          strokeWidth={2}
          strokeDasharray="10 8"
        />

        {/* The seven rows. */}
        <g filter="url(#ck-chalk)">
          {ROWS.map((label, i) => {
            const d = s.draw[i];
            if (d <= 0) return null;
            const y = rowY(i);
            const tk = i < 5 ? s.tick[i] : 0;
            const am = i >= 5 ? s.amber[i - 5] : 0;
            const boxColour = tk > 0 ? GREEN : am > 0 ? AMBER : CHALK;
            return (
              <g key={label}>
                <rect
                  x={ROW.boxX}
                  y={y - ROW.box / 2}
                  width={ROW.box}
                  height={ROW.box}
                  rx={6}
                  fill={tk > 0 ? alpha(GREEN, 0.16 * tk) : am > 0 ? alpha(AMBER, 0.14 * am) : 'none'}
                  stroke={boxColour}
                  strokeWidth={4}
                  strokeDasharray={4 * ROW.box}
                  strokeDashoffset={(1 - d) * 4 * ROW.box}
                />
                {tk > 0 && (
                  <path
                    d={TICK}
                    transform={`translate(${ROW.boxX + ROW.box / 2} ${y}) scale(1.05)`}
                    fill="none"
                    stroke={GREEN}
                    strokeWidth={8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={TICK_LEN}
                    strokeDashoffset={(1 - tk) * TICK_LEN}
                  />
                )}
                {am > 0 && (
                  <text x={ROW.boxX + ROW.box / 2} y={y + 15} textAnchor="middle" fontSize={44} fontWeight={800} fill={AMBER} opacity={am}>
                    ?
                  </text>
                )}
                <text x={ROW.labelX + (1 - d) * -16} y={y + 15} fontSize={42} fontWeight={600} fill={am > 0 ? '#fde7b0' : CHALK} opacity={d}>
                  {label}
                </text>
              </g>
            );
          })}

          {/* Notes beside the green rows. */}
          {NOTES.map((lines, i) => {
            const a = s.note[i];
            if (a <= 0) return null;
            const y = rowY(i);
            const top = lines.length === 1 ? y + 14 : y - 6;
            return (
              <text key={i} x={ROW.noteX} fontSize={40} fontWeight={500} fill={CHALK_SOFT} opacity={a} transform={`translate(${(1 - a) * 14} 0)`}>
                {lines.map((ln, j) => (
                  <tspan key={j} x={ROW.noteX} y={top + j * 38}>
                    {ln}
                  </tspan>
                ))}
              </text>
            );
          })}

          {/* Chalk ring round "before the proof" on "something easier". */}
          {s.circle > 0 && s.ring > 0 && (
            <ellipse
              cx={ROW.noteX + 168}
              cy={rowY(1) + 6}
              rx={204}
              ry={52}
              transform={`rotate(-3 ${ROW.noteX + 168} ${rowY(1) + 6})`}
              fill="none"
              stroke={AMBER}
              strokeWidth={4.5}
              strokeDasharray={1020}
              strokeDashoffset={(1 - s.circle) * 1020}
              strokeLinecap="round"
              opacity={s.ring}
            />
          )}

          {/* "not yet" beside the two open rows. */}
          {[5, 6].map((i) => {
            const a = s.amber[i - 5];
            if (a <= 0) return null;
            return (
              <text key={i} x={ROW.noteX + (1 - a) * 14} y={rowY(i) + 15} fontSize={44} fontWeight={700} fill={AMBER} opacity={a}>
                {NOT_YET}
              </text>
            );
          })}

          {/* The two-word contrast under the board. */}
          {s.follows > 0 && (
            <g>
              <text x={1000} y={806 - (1 - s.follows) * 14} textAnchor="middle" fontSize={68} fontWeight={800} fill={GREEN} opacity={s.follows}>
                follows ✓
              </text>
              <line x1={1222} x2={1222} y1={752} y2={812} stroke={alpha(CHALK, 0.5)} strokeWidth={4} strokeLinecap="round" opacity={s.follows} />
              <text
                x={1440}
                y={806}
                textAnchor="middle"
                fontSize={68}
                fontWeight={800}
                fill={AMBER}
                opacity={0.22 * s.whyDim + 0.78 * s.why}
                transform={`translate(1440 784) scale(${1 + 0.18 * s.why * (1 - s.why) * 4 + 0.04 * s.why * Math.sin(T * 3)}) translate(-1440 -784)`}
              >
                why ?
              </text>
            </g>
          )}
        </g>

        {/* "about a day" stamped across the five green rows. */}
        {s.stamp > 0 && (
          <g transform={`translate(890 372) rotate(-8) scale(${1.6 - 0.6 * s.stamp})`} opacity={s.stamp}>
            <rect x={-300} y={-70} width={600} height={140} rx={18} fill={alpha('#1b2142', 0.86)} stroke={STAMP_INK} strokeWidth={8} />
            <rect x={-284} y={-54} width={568} height={108} rx={12} fill="none" stroke={alpha(STAMP_INK, 0.6)} strokeWidth={3} />
            <text x={0} y={26} textAnchor="middle" fontSize={76} fontWeight={800} fill={STAMP_INK} letterSpacing="0.02em">
              {STAMP}
            </text>
          </g>
        )}
      </g>
    </Canvas>
  );
};
