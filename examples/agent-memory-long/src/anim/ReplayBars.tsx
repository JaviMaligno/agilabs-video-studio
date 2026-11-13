// The replay experiment (rows 9-10): a terminal, a training stream into the robot's head, and the
// bars of what it learned and forgot. See ReplayBars.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import {
  GENERAL_BASE,
  GENERAL_LABEL,
  LABEL_MIX,
  LABEL_WON,
  OLD_EVERY,
  OLD_TAG,
  TERMINAL_LABEL,
  TERMINAL_LINES,
  frameState,
  type ReplayBarsProps,
} from './ReplayBars.state.ts';
import { Floor, Frame, Robot } from './office.tsx';
import { place } from './canvas.ts';

export { frameState };
export type { ReplayBarsProps };

/**
 * Layout (frame pixels), per format.
 * - landscape: the terminal top left, the stream running under it into the robot's head, the
 *   robot standing on the floor in the middle; the bars at the right with the label over them.
 * - vertical: the terminal and the robot on the top half, the bars under them.
 */
const LAYOUT = {
  v: {
    term: { x: 90, y: 270, w: 560, h: 290, size: 30 },
    robot: { x: 860, y: 764 - 0.55 * 452, s: 0.55 },
    floor: { y: 764, x: 60, w: 960 },
    stream: { x0: 100, x1: 790, y: 612, tagY: 664 },
    bars: { base: 1215, maxH: 330, term: { x: 120, w: 130 }, gen: { x: 330, w: 120, gap: 30 }, labelY: 1258, labelSize: 30 },
    head: { x: 540, y1: 830, y2: 874, s1: 40, s2: 34 },
  },
  l: {
    term: { x: 190, y: 170, w: 540, h: 290, size: 28 },
    robot: { x: 860, y: 806 - 0.62 * 452, s: 0.62 },
    floor: { y: 806, x: 180, w: 820 },
    stream: { x0: 200, x1: 780, y: 590, tagY: 642 },
    bars: { base: 730, maxH: 410, term: { x: 1060, w: 120 }, gen: { x: 1260, w: 100, gap: 26 }, labelY: 772, labelSize: 28 },
    head: { x: 1390, y1: 190, y2: 236, s1: 38, s2: 32 },
  },
};

/** Stream blocks: size, spacing and speed (px/s). */
const BLOCK = { w: 34, h: 22, gap: 50, speed: 90 };

export const ReplayBars: React.FC<AnimProps & ReplayBarsProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);
  const T = L.term;
  const lineH = T.size * 1.45;
  const shownLines = s.terminal.typed * TERMINAL_LINES.length;
  const B = L.bars;
  const barTop = (v: number) => B.base - B.maxH * v;
  // Blocks on the stream: block k sits at x0 + (k·gap + scroll·speed) mod length.
  const len = L.stream.x1 - L.stream.x0;
  const count = Math.ceil(len / BLOCK.gap);
  const shift = (s.stream.scroll * BLOCK.speed) % BLOCK.gap;
  const first = Math.floor((s.stream.scroll * BLOCK.speed) / BLOCK.gap);
  const genX = (i: number) => B.gen.x + i * (B.gen.w + B.gen.gap);
  const genMid = (genX(0) + genX(GENERAL_BASE.length - 1) + B.gen.w) / 2;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        <Floor y={L.floor.y} x={L.floor.x} w={L.floor.w} />
        {/* the terminal window */}
        <g opacity={s.terminal.opacity}>
          <rect x={T.x} y={T.y} width={T.w} height={T.h} rx={16} fill={C.bg0} stroke={C.accentText} strokeWidth={4} />
          <rect x={T.x} y={T.y} width={T.w} height={44} rx={16} fill={C.card} />
          <rect x={T.x} y={T.y + 28} width={T.w} height={16} fill={C.card} />
          {[C.marker, C.warm, C.ok].map((c, i) => (
            <circle key={c} cx={T.x + 28 + i * 26} cy={T.y + 22} r={8} fill={alpha(c, 0.8)} />
          ))}
          <text x={T.x + T.w / 2} y={T.y + 31} textAnchor="middle" fontSize={22} fontWeight={700} fill={C.muted}>
            terminal
          </text>
          {TERMINAL_LINES.map((line, i) => {
            const part = Math.min(1, Math.max(0, shownLines - i));
            if (part <= 0) return null;
            return (
              <text key={i} x={T.x + 26} y={T.y + 44 + 22 + (i + 0.7) * lineH} fontSize={T.size} fontWeight={600} fontFamily="monospace" fill={line.startsWith('$') ? C.ok : C.text}>
                {line.slice(0, Math.ceil(line.length * part))}
              </text>
            );
          })}
        </g>
        {/* the training stream into the robot's head */}
        {s.stream.opacity > 0 && (
          <g opacity={s.stream.opacity}>
            <rect x={L.stream.x0 - 10} y={L.stream.y - 4} width={len + 10} height={8} rx={4} fill={alpha(C.accentText, 0.25)} />
            {Array.from({ length: count + 1 }, (_, j) => {
              const k = first - j;
              const x = L.stream.x0 + j * BLOCK.gap + shift;
              if (x > L.stream.x1 - BLOCK.w / 2 || x < L.stream.x0) return null;
              const old = ((k % OLD_EVERY) + OLD_EVERY) % OLD_EVERY === 0;
              const fade = Math.min(1, (L.stream.x1 - x) / 60);
              return (
                <g key={k} opacity={fade}>
                  <rect x={x - BLOCK.w / 2} y={L.stream.y - BLOCK.h / 2} width={BLOCK.w} height={BLOCK.h} rx={5} fill={alpha(C.accent, 0.85)} />
                  {old && <rect x={x - BLOCK.w / 2} y={L.stream.y - BLOCK.h / 2} width={BLOCK.w} height={BLOCK.h} rx={5} fill={C.ok} opacity={s.stream.old} />}
                </g>
              );
            })}
            <text x={L.stream.x0} y={L.stream.tagY} fontSize={26} fontWeight={700} fill={C.accentText}>
              {TERMINAL_LABEL}
            </text>
            <g opacity={s.stream.old}>
              <rect x={L.stream.x0 + 230} y={L.stream.tagY - 20} width={22} height={22} rx={4} fill={C.ok} />
              <text x={L.stream.x0 + 262} y={L.stream.tagY} fontSize={26} fontWeight={700} fill={C.ok}>
                {`+ ${OLD_TAG}`}
              </text>
            </g>
          </g>
        )}
        <Robot x={L.robot.x} y={L.robot.y} s={L.robot.s} shelf={s.robot.shelf} shelfGlow={0.5 * s.stream.opacity} blink={s.robot.blink} />
        {/* the bars */}
        <g opacity={s.bars.opacity}>
          <rect x={B.term.x - 20} y={B.base} width={genX(GENERAL_BASE.length - 1) + B.gen.w + 20 - (B.term.x - 20)} height={4} rx={2} fill={alpha(C.muted, 0.6)} />
          <rect x={B.term.x} y={barTop(s.bars.terminal)} width={B.term.w} height={B.maxH * s.bars.terminal} rx={10} fill={C.accent} style={{ filter: `drop-shadow(0 0 14px ${alpha(C.accent, 0.6)})` }} />
          {s.bars.general.map((g, i) => (
            <g key={i}>
              <rect x={genX(i)} y={barTop(g)} width={B.gen.w} height={B.maxH * g} rx={10} fill={alpha(C.accentText, 0.55)} />
              {/* where the bar started */}
              <line x1={genX(i) - 8} x2={genX(i) + B.gen.w + 8} y1={barTop(GENERAL_BASE[i])} y2={barTop(GENERAL_BASE[i])} stroke={C.text} strokeWidth={3} strokeDasharray="8 6" opacity={0.75 * s.bars.ref} />
            </g>
          ))}
          <text x={B.term.x + B.term.w / 2} y={B.labelY} textAnchor="middle" fontSize={B.labelSize} fontWeight={700} fill={C.text}>
            {TERMINAL_LABEL}
          </text>
          <text x={genMid} y={B.labelY} textAnchor="middle" fontSize={B.labelSize} fontWeight={700} fill={C.muted}>
            {GENERAL_LABEL}
          </text>
        </g>
        <text x={L.head.x} y={L.head.y1} textAnchor="middle" fontSize={L.head.s1} fontWeight={800} fill={C.ok} opacity={s.labelMix}>
          {LABEL_MIX}
        </text>
        <text x={L.head.x} y={L.head.y2} textAnchor="middle" fontSize={L.head.s2} fontWeight={800} fill={C.text} opacity={s.labelWon}>
          {LABEL_WON}
        </text>
      </Frame>
    </AbsoluteFill>
  );
};
