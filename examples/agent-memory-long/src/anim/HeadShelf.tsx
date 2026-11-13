// The bookshelf in the robot's head: training (scene 5). See HeadShelf.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { frameState, type HeadShelfProps } from './HeadShelf.state.ts';
import { BookShelf, Desk, Frame, Slip, glow } from './office.tsx';

export { frameState };
export type { HeadShelfProps };

const H = { x: 260, y: 320, w: 560, h: 470, shelf: { x: 320, y: 360, w: 440, h: 230 } } as const;

/** A graduation cap ("like school"), centred on (x, y). */
const Cap: React.FC<{ x: number; y: number; pop: number }> = ({ x, y, pop }) => {
  if (pop <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(12) scale(${1.4 - 0.4 * pop})`} opacity={Math.min(1, pop * 1.5)}>
      <path d="M -40 10 L -40 40 Q 0 58 40 40 L 40 10 Z" fill={C.accent2} stroke={C.bg0} strokeWidth={3} />
      <path d="M -95 0 L 0 -38 L 95 0 L 0 38 Z" fill={C.accent} stroke={C.bg0} strokeWidth={3} />
      <path d="M 0 0 L 70 18 L 70 62" fill="none" stroke={C.warm} strokeWidth={5} />
      <circle cx={70} cy={66} r={9} fill={C.warm} />
    </g>
  );
};

/** A padlock on the glass doors, centred on (x, y). */
const Lock: React.FC<{ x: number; y: number; pop: number }> = ({ x, y, pop }) => {
  if (pop <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${1.4 - 0.4 * pop})`} opacity={Math.min(1, pop * 1.5)}>
      <path d="M -18 0 L -18 -18 A 18 18 0 0 1 18 -18 L 18 0" fill="none" stroke={C.text} strokeWidth={8} />
      <rect x={-28} y={-2} width={56} height={44} rx={8} fill={C.text} />
      <circle cx={0} cy={18} r={6} fill={C.bg0} />
    </g>
  );
};

export const HeadShelf: React.FC<AnimProps & HeadShelfProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical}>
        {/* body and neck under the big head */}
        <rect x={400} y={790} width={280} height={420} rx={50} fill={C.card} stroke={C.accentText} strokeWidth={8} />
        <rect x={500} y={772} width={80} height={40} rx={10} fill={C.bg1} stroke={C.accentText} strokeWidth={6} />
        {/* the head: antenna, shell, the bookshelf behind closed glass doors, eyes */}
        <line x1={540} y1={H.y} x2={540} y2={H.y - 36} stroke={C.accentText} strokeWidth={9} />
        <circle cx={540} cy={H.y - 44} r={14} fill={C.accentText} />
        <rect x={H.x} y={H.y} width={H.w} height={H.h} rx={80} fill={C.card} stroke={C.accentText} strokeWidth={9} />
        <g style={glow(C.accentText, 0.6 * s.books)}>
          <BookShelf x={H.shelf.x} y={H.shelf.y} w={H.shelf.w} h={H.shelf.h} lit={0.25 + 0.75 * s.books} doors={1} flash={s.bounce} />
        </g>
        {s.bounce > 0 && (
          <circle cx={600} cy={520} r={40 + 70 * s.bounce} fill="none" stroke={alpha(C.marker, 0.8 * s.bounce)} strokeWidth={6} />
        )}
        <Lock x={540} y={470} pop={s.lock} />
        <ellipse cx={450} cy={690} rx={34} ry={34} fill={C.accentText} />
        <ellipse cx={630} cy={690} rx={34} ry={34} fill={C.accentText} />
        <rect x={505} y={748} width={70} height={10} rx={5} fill={alpha(C.muted, 0.7)} />
        <Cap x={735} y={318} pop={s.cap} />
        {/* the desk the slip ends up on */}
        <Desk x={270} y={1150} w={540} glowA={0.5 * s.desk} />
        <Slip x={s.slip.x} y={s.slip.y} w={250} rot={s.slip.rot} opacity={s.slip.opacity} />
      </Frame>
    </AbsoluteFill>
  );
};
