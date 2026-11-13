// The ask-a-reader notebook (rows 33-35): the agent asks, a second robot reads the whole day,
// finds the slip and passes it on; then the day outgrows the reader. See AskReader.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { CAPACITY, PIECES, QUESTION, SLIP_INDEX, TABLE_HEAD, TABLE_ROWS, UNASKED, frameState, type AskReaderProps } from './AskReader.state.ts';
import { Badge, Desk, Floor, Frame, Notecard, Robot, Slip, glow } from './office.tsx';
import { place } from './canvas.ts';

export { frameState };
export type { AskReaderProps };

/**
 * Layout (frame pixels), per format.
 * - landscape: the figures table top left; the agent and its clean desk bottom left with its
 *   question over its head; the reader behind at the right holding the stack; the split piles and
 *   the card in the reader's place.
 * - vertical: the table on top, the agent and the desk at the bottom left, the reader at the right.
 */
const LAYOUT = {
  v: {
    floor: { y: 1176, x: 60, w: 960 },
    agent: { x: 190, s: 0.5 },
    desk: { x: 300, y: 1002, w: 420 },
    slipTo: { x: 470, y: 982 },
    tick: { x: 640, y: 940 },
    bubble: { x: 70, y: 770, w: 460, h: 96, tail: { x: 200, y: 900 }, size: 32 },
    unasked: { x: 560, y: 790, w: 230, h: 64 },
    reader: { x: 790, s: 0.6 },
    stack: { x: 945, w: 140, bottom: 1130, thick: 9 },
    table: { x: 90, y: 300, cols: [600, 860], rowY: [380, 456], head: 30, size: 48, label: 34 },
    pieces: { xs: [600, 770, 940], s: 0.26, pileW: 60, pileDx: 48, thick: 7 },
    card: { x: 760, y: 610, w: 230 },
    or: { x: 760, y: 740 },
    question: { x: 950, y: 640 },
  },
  l: {
    floor: { y: 806, x: 180, w: 1560 },
    agent: { x: 330, s: 0.6 },
    desk: { x: 460, y: 632, w: 480 },
    slipTo: { x: 640, y: 612 },
    tick: { x: 830, y: 572 },
    bubble: { x: 190, y: 398, w: 450, h: 96, tail: { x: 340, y: 512 }, size: 32 },
    unasked: { x: 670, y: 414, w: 230, h: 64 },
    reader: { x: 1250, s: 0.72 },
    stack: { x: 1490, w: 210, bottom: 760, thick: 9 },
    table: { x: 190, y: 200, cols: [520, 750], rowY: [268, 338], head: 30, size: 46, label: 34 },
    pieces: { xs: [1150, 1380, 1610], s: 0.32, pileW: 90, pileDx: 70, thick: 8 },
    card: { x: 1410, y: 320, w: 260 },
    or: { x: 1410, y: 460 },
    question: { x: 1620, y: 350 },
  },
};

export const AskReader: React.FC<AnimProps & AskReaderProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);
  const St = L.stack;
  const pageY = (i: number) => St.bottom - (i + 1) * St.thick;
  const capY = St.bottom - CAPACITY * St.thick;
  const nPages = Math.floor(s.stack.pages);
  const slipFrom = { x: St.x, y: pageY(SLIP_INDEX) + St.thick / 2 };
  const fx = lerp(slipFrom.x, L.slipTo.x, s.slip.fly);
  const fy = lerp(slipFrom.y, L.slipTo.y, s.slip.fly) - 200 * Math.sin(Math.PI * s.slip.fly);
  const Bu = L.bubble;
  const U = L.unasked;
  const Tb = L.table;
  const Pc = L.pieces;
  const agentY = L.floor.y - L.agent.s * 452;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        <Floor y={L.floor.y} x={L.floor.x} w={L.floor.w} />
        {/* the reader behind the agent, with the whole day's stack */}
        {s.reader.opacity > 0 && <Robot x={L.reader.x} y={L.floor.y - L.reader.s * 452} s={L.reader.s} shelf={0.8} blink={s.reader.blink} opacity={s.reader.opacity} />}
        {s.stack.opacity > 0 && (
          <g opacity={s.stack.opacity}>
            {Array.from({ length: nPages }, (_, i) => {
              const isSlip = i === SLIP_INDEX;
              const over = i >= CAPACITY;
              const y = pageY(i);
              const jx = ((i * 37) % 9) - 4;
              return (
                <rect
                  key={i}
                  x={St.x - St.w / 2 + jx}
                  y={y}
                  width={St.w}
                  height={St.thick - 1.5}
                  rx={2}
                  fill={isSlip ? C.marker : over ? alpha(C.warm, 0.35 + 0.5 * s.stack.over) : alpha(C.text, i % 2 ? 0.85 : 0.72)}
                  style={isSlip && s.stack.found > 0.01 ? glow(C.marker, s.stack.found) : undefined}
                />
              );
            })}
            {/* the scan bar, reading from the top */}
            {s.scan.opacity > 0 && (
              <g opacity={s.scan.opacity}>
                <rect x={St.x - St.w / 2 - 16} y={pageY(s.scan.index) - 4} width={St.w + 32} height={St.thick + 8} rx={4} fill="none" stroke={C.ok} strokeWidth={4} style={glow(C.ok, 0.6)} />
              </g>
            )}
            {/* what one reader can hold */}
            {s.limit > 0 && (
              <g opacity={s.limit}>
                <line x1={St.x - St.w / 2 - 30} x2={St.x + St.w / 2 + 30} y1={capY} y2={capY} stroke={C.warm} strokeWidth={4} strokeDasharray="12 8" />
              </g>
            )}
          </g>
        )}
        {/* the long day split between small readers, or squeezed into a card */}
        {s.split > 0 && (
          <g opacity={s.split}>
            {Pc.xs.slice(0, PIECES).map((x, k) => (
              <g key={k}>
                <Robot x={x} y={L.floor.y - Pc.s * 452} s={Pc.s} shelf={0.8} />
                {Array.from({ length: 14 + 2 * k }, (_, i) => (
                  <rect key={i} x={x + Pc.pileDx - Pc.pileW / 2 + (((i * 37) % 7) - 3)} y={L.floor.y - 12 - (i + 1) * Pc.thick} width={Pc.pileW} height={Pc.thick - 1.5} rx={2} fill={alpha(C.text, i % 2 ? 0.85 : 0.72)} />
                ))}
              </g>
            ))}
          </g>
        )}
        {s.card > 0 && (
          <g opacity={s.card}>
            <text x={L.or.x} y={L.or.y} textAnchor="middle" fontSize={36} fontWeight={800} fill={C.muted}>
              or
            </text>
            <Notecard x={L.card.x} y={L.card.y} w={L.card.w} text="" blur={1} />
          </g>
        )}
        {s.question > 0 && (
          <text x={L.question.x} y={L.question.y} textAnchor="middle" fontSize={120} fontWeight={800} fill={C.warm} opacity={s.question}>
            ?
          </text>
        )}
        {/* the agent at its clean desk */}
        <Desk x={L.desk.x} y={L.desk.y} w={L.desk.w} />
        <Robot x={L.agent.x} y={agentY} s={L.agent.s} blink={s.agent.blink} />
        {s.bubble.opacity > 0 && (
          <g opacity={s.bubble.opacity}>
            <path
              d={`M ${Bu.x + 24} ${Bu.y} H ${Bu.x + Bu.w - 24} Q ${Bu.x + Bu.w} ${Bu.y} ${Bu.x + Bu.w} ${Bu.y + 24} V ${Bu.y + Bu.h - 24} Q ${Bu.x + Bu.w} ${Bu.y + Bu.h} ${Bu.x + Bu.w - 24} ${Bu.y + Bu.h} H ${Bu.tail.x + 40} L ${Bu.tail.x} ${Bu.tail.y} L ${Bu.tail.x - 10} ${Bu.y + Bu.h} H ${Bu.x + 24} Q ${Bu.x} ${Bu.y + Bu.h} ${Bu.x} ${Bu.y + Bu.h - 24} V ${Bu.y + 24} Q ${Bu.x} ${Bu.y} ${Bu.x + 24} ${Bu.y} Z`}
              fill={C.card}
              stroke={C.accentText}
              strokeWidth={4}
            />
            <text x={Bu.x + Bu.w / 2} y={Bu.y + Bu.h / 2 + Bu.size * 0.36} textAnchor="middle" fontSize={Bu.size} fontWeight={800} fill={C.text}>
              {QUESTION.slice(0, Math.ceil(QUESTION.length * s.bubble.write))}
            </text>
          </g>
        )}
        {/* the question it never asks */}
        {s.bubble.unasked > 0 && (
          <g opacity={s.bubble.unasked * 0.9}>
            <rect x={U.x} y={U.y} width={U.w} height={U.h} rx={18} fill="none" stroke={alpha(C.muted, 0.6)} strokeWidth={3} strokeDasharray="10 8" />
            <text x={U.x + U.w / 2} y={U.y + U.h / 2 + 10} textAnchor="middle" fontSize={28} fontWeight={700} fill={C.muted}>
              {UNASKED}
            </text>
            <line x1={U.x + 20} x2={U.x + 20 + (U.w - 40) * s.bubble.strike} y1={U.y + U.h / 2} y2={U.y + U.h / 2} stroke={C.marker} strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {/* the slip, copied into the answer, onto the desk */}
        <Slip x={fx} y={fy} w={lerp(120, 200, s.slip.fly)} rot={lerp(0, -4, s.slip.fly)} opacity={s.slip.opacity} glowA={0.5 * (1 - s.slip.fly)} />
        <Badge x={L.tick.x} y={L.tick.y} r={28} kind="tick" pop={s.slip.tick} />
        {/* the figures */}
        {s.table.opacity > 0 && (
          <g opacity={s.table.opacity}>
            {TABLE_HEAD.slice(1).map((h, i) => (
              <text key={h} x={Tb.cols[i]} y={Tb.y} textAnchor="middle" fontSize={Tb.head} fontWeight={700} fill={i === 0 ? C.ok : C.muted}>
                {h}
              </text>
            ))}
            {TABLE_ROWS.map((row, r) => (
              <g key={row[0]} opacity={s.table.rows[r]}>
                <text x={Tb.x} y={Tb.rowY[r]} fontSize={Tb.label} fontWeight={700} fill={C.text}>
                  {row[0]}
                </text>
                <text x={Tb.cols[0]} y={Tb.rowY[r]} textAnchor="middle" fontSize={Tb.size} fontWeight={800} fill={C.ok}>
                  {row[1]}
                </text>
                <text x={Tb.cols[1]} y={Tb.rowY[r]} textAnchor="middle" fontSize={Tb.size} fontWeight={800} fill={C.muted}>
                  {row[2]}
                </text>
              </g>
            ))}
          </g>
        )}
      </Frame>
    </AbsoluteFill>
  );
};
