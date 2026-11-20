// The clipboard form with fixed boxes (scenes 10-12). See ClipboardForm.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { SHELF0, lerp } from './memory.ts';
import { FULL_TEXT, MARGIN_TEXT, RUNS, ZERO_TEXT, frameState, type ClipboardFormProps } from './ClipboardForm.state.ts';
import { Badge, Board, Frame, Page, Rack, Slip } from './office.tsx';

export { frameState };
export type { ClipboardFormProps };

const B = { x: 110, y: 330, w: 860, h: 860 } as const;
/** The paper's margin starts at this x (a rose rule), the boxes sit left of it. */
const MARGIN_X = 720;
const ROW = { y0: 450, h: 112, labelX: 160, boxX: 380, boxW: 300, boxH: 86 } as const;
const rowY = (i: number) => ROW.y0 + i * ROW.h;
const GRID = { x: 160, y: 930, cols: 8, cell: 54, gap: 12 } as const;
const textW = (text: string, size: number) => text.length * size * 0.56;

/** A hand-drawn scribble (an entry being written), drawn in with `p`. */
const Scribble: React.FC<{ x: number; y: number; w: number; p: number; color?: string }> = ({ x, y, w, p, color = C.muted }) =>
  p > 0 ? (
    <path
      d={`M ${x} ${y} q ${w * 0.08} -22 ${w * 0.16} 0 t ${w * 0.16} 0 t ${w * 0.16} 0 t ${w * 0.16} 0 t ${w * 0.16} 0`}
      fill="none"
      stroke={color}
      strokeWidth={6}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={`${Math.min(1, p)} 1`}
    />
  ) : null;

export const ClipboardForm: React.FC<AnimProps & ClipboardFormProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const v = s.value;
  const y0 = rowY(0);
  const valueSize = 44;
  const vx = ROW.boxX + 24;
  const vy = y0 + ROW.boxH / 2 + 16;
  const rewriting = v.next !== '' && v.strike > 0;
  const nextShown = v.next.slice(0, Math.ceil(v.next.length * v.write));
  const oldShown = v.next ? v.text : v.text.slice(0, Math.ceil(v.text.length * v.write));
  const penX = vx + textW(v.next || v.text, valueSize) * s.pen.prog;
  const slipFrom = { x: 880, y: 1240 };
  const slipTo = { x: ROW.boxX + ROW.boxW / 2, y: y0 + ROW.boxH / 2 };
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame>
        <Board x={B.x} y={B.y} w={B.w} h={B.h} lit={1} />
        {/* the margin rule */}
        <rect x={MARGIN_X} y={B.y + 100} width={4} height={B.h - 130} fill={alpha(C.marker, 0.55)} />
        {/* rows: label and fixed box; row 0 is the SHELF 0 box */}
        {[0, 1, 2, 3].map((i) => {
          const y = rowY(i);
          const isShelf = i === 0;
          const op = isShelf ? s.shelfRow : 1;
          const lit = isShelf ? s.rowLit : 0;
          return (
            <g key={i} opacity={op}>
              {isShelf ? (
                <text x={ROW.labelX} y={y + ROW.boxH / 2 + 12} fontSize={36} fontWeight={800} fill={C.text} letterSpacing={1}>
                  {SHELF0}
                </text>
              ) : (
                <rect x={ROW.labelX} y={y + ROW.boxH / 2 - 8} width={150 - 18 * (i % 2)} height={16} rx={8} fill={alpha(C.muted, 0.6)} />
              )}
              <rect
                x={ROW.boxX}
                y={y}
                width={ROW.boxW}
                height={ROW.boxH}
                rx={12}
                fill={C.bg1}
                stroke={lit > 0.05 ? alpha(C.ok, 0.5 + 0.5 * lit) : alpha(C.accentText, 0.35 + 0.65 * s.boxes)}
                strokeWidth={lit > 0.05 ? 6 : 4}
                style={lit > 0.05 ? { filter: `drop-shadow(0 0 ${18 * lit}px ${alpha(C.ok, 0.6 * lit)})` } : undefined}
              />
              {!isShelf && <Scribble x={ROW.boxX + 26} y={y + ROW.boxH / 2 + 6} w={(ROW.boxW - 60) * (i === 1 ? 0.9 : 0.7)} p={i === 1 && s.scribble < 1 && p.mode === 'margin' ? s.scribble : 1} />}
            </g>
          );
        })}
        {/* the SHELF 0 value: old value struck, new value written in the same box */}
        <g opacity={s.shelfRow}>
          <text x={vx} y={vy} fontSize={valueSize} fontWeight={800} fill={C.text} opacity={rewriting ? 1 - v.write : 1}>
            {oldShown}
          </text>
          {rewriting && <rect x={vx - 6} y={vy - 16} width={(textW(v.text, valueSize) + 12) * v.strike} height={6} rx={3} fill={C.marker} opacity={1 - v.write} />}
          {rewriting && (
            <text x={vx} y={vy} fontSize={valueSize} fontWeight={800} fill={C.text}>
              {nextShown}
            </text>
          )}
        </g>
        {/* the pen */}
        {s.pen.opacity > 0 && (
          <g transform={`translate(${penX - 6} ${vy - 74})`} opacity={s.pen.opacity}>
            <path d="M 4 70 L 10 50 L 50 10 L 64 24 L 24 64 Z" fill={alpha(C.text, 0.92)} stroke={C.bg0} strokeWidth={3} strokeLinejoin="round" />
            <path d="M 4 70 L 10 50 L 24 64 Z" fill={C.warm} />
          </g>
        )}
        <Badge x={ROW.boxX + ROW.boxW + 2} y={y0 + 6} r={34} kind="tick" pop={s.tick} />
        {/* the margin note, erased by the next entry */}
        {s.margin.write > 0 && (
          <g transform={`rotate(-7 ${MARGIN_X + 120} ${y0 + 60})`} opacity={1 - s.margin.erase}>
            <text x={MARGIN_X + 22} y={y0 + 40} fontSize={36} fontWeight={700} fontStyle="italic" fill={C.marker}>
              {MARGIN_TEXT.slice(0, Math.ceil(9 * Math.min(1, s.margin.write * 2)))}
            </text>
            <text x={MARGIN_X + 40} y={y0 + 92} fontSize={36} fontWeight={700} fontStyle="italic" fill={C.marker}>
              {MARGIN_TEXT.slice(9, 9 + Math.ceil(5 * Math.max(0, s.margin.write * 2 - 1)))}
            </text>
          </g>
        )}
        {s.eraser > 0 && (
          <g transform={`translate(${lerp(MARGIN_X + 10, MARGIN_X + 190, s.margin.erase)} ${y0 + 10}) rotate(-20)`} opacity={s.eraser}>
            <rect x={0} y={0} width={70} height={110} rx={12} fill={alpha(C.marker, 0.85)} stroke={C.bg0} strokeWidth={3} />
            <rect x={0} y={70} width={70} height={40} rx={10} fill={C.text} />
          </g>
        )}
        {s.zero > 0 && (
          <g opacity={s.zero} transform={`translate(${MARGIN_X + 120} ${y0 + 190}) scale(${1.3 - 0.3 * s.zero})`}>
            <rect x={-100} y={-50} width={200} height={92} rx={18} fill={C.bg0} stroke={C.marker} strokeWidth={5} />
            <text x={0} y={18} textAnchor="middle" fontSize={56} fontWeight={800} fill={C.marker}>
              {ZERO_TEXT}
            </text>
          </g>
        )}
        {/* the grid of runs, filling with ticks */}
        {s.grid.opacity > 0 && (
          <g opacity={s.grid.opacity}>
            {Array.from({ length: RUNS }, (_, i) => {
              const cx = GRID.x + (i % GRID.cols) * (GRID.cell + GRID.gap);
              const cy = GRID.y + Math.floor(i / GRID.cols) * (GRID.cell + GRID.gap);
              const on = i < s.ticks;
              return (
                <g key={i}>
                  <rect x={cx} y={cy} width={GRID.cell} height={GRID.cell} rx={10} fill={on ? alpha(C.ok, 0.22) : C.bg1} stroke={on ? C.ok : alpha(C.muted, 0.5)} strokeWidth={3} />
                  {on && <path d={`M ${cx + 14} ${cy + 28} L ${cx + 24} ${cy + 38} L ${cx + 41} ${cy + 17}`} fill="none" stroke={C.ok} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
                </g>
              );
            })}
          </g>
        )}
        {s.full > 0 && (
          <g opacity={s.full} transform={`translate(${MARGIN_X + 120} ${GRID.y + 92}) scale(${1.3 - 0.3 * s.full})`}>
            <rect x={-110} y={-56} width={220} height={100} rx={18} fill={C.bg0} stroke={C.ok} strokeWidth={5} />
            <text x={0} y={20} textAnchor="middle" fontSize={60} fontWeight={800} fill={C.ok}>
              {FULL_TEXT}
            </text>
          </g>
        )}
        {/* the pages it could have checked against (the transcript), fading away */}
        {s.pages > 0 && [0, 1, 2].map((k) => <Page key={k} x={830 + 14 * k} y={1010 - 26 * k} w={210} rot={-8 + 6 * k} opacity={s.pages} />)}
        {/* the real shelf 0, empty, beside the confident box */}
        {s.inset > 0 && (
          <g opacity={s.inset}>
            <Rack x={MARGIN_X + 50} y={y0 + 170} w={170} h={140} bays={1} pallets={[0]} upper={false} s={0.8} />
          </g>
        )}
        <Slip x={lerp(slipFrom.x, slipTo.x, s.slip.fly)} y={lerp(slipFrom.y, slipTo.y, s.slip.fly)} w={lerp(230, 150, s.slip.fly)} rot={lerp(10, -3, s.slip.fly)} opacity={s.slip.opacity} />
      </Frame>
    </AbsoluteFill>
  );
};
