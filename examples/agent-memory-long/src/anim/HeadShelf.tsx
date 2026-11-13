// The bookshelf in the robot's head: training (rows 6-8). See HeadShelf.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { SLIP_PATH, STREAM_BOOKS, frameState, type HeadShelfProps } from './HeadShelf.state.ts';
import { BookShelf, Desk, Floor, Frame, Slip, glow } from './office.tsx';
import { place } from './canvas.ts';

export { frameState };
export type { HeadShelfProps };

/** The head and body, drawn in vertical frame pixels. */
const H = { x: 260, y: 320, w: 560, h: 470, shelf: { x: 320, y: 360, w: 440, h: 230 } } as const;

/**
 * Per format: `head` places the head assembly (drawn in vertical pixels) with x' = x + k·(x0 - 540),
 * y' = y + k·(y0 - 320); `body` is the body height in those pixels; the desk, the satchel and where
 * the slip lands are in frame pixels.
 * - vertical: as drawn, the desk under the robot.
 * - landscape: the head left of centre, a shorter body standing on the floor above the captions,
 *   the desk at the right on the same floor where the slip lands, the satchel beside the head.
 */
const LAYOUT = {
  v: {
    head: { x: 540, y: 320, k: 1 },
    body: 420,
    floor: null as null | { y: number; x: number; w: number },
    desk: { x: 270, y: 1150, w: 540 },
    land: SLIP_PATH.desk,
    satchel: { x: 880, y: 860, s: 1 },
    streamFrom: { x: 80, y0: 380, dy: 60 },
  },
  l: {
    head: { x: 760, y: 170, k: 0.82 },
    body: 327,
    floor: { y: 824, x: 300, w: 1440 } as null | { y: number; x: number; w: number },
    desk: { x: 1240, y: 650, w: 420 },
    land: { x: 1430, y: 612, rot: -5 },
    satchel: { x: 1180, y: 300, s: 0.9 },
    streamFrom: { x: -200, y0: 300, dy: 70 },
  },
};

/** A school satchel, centred on (x, y). */
const Satchel: React.FC<{ x: number; y: number; s: number; pop: number }> = ({ x, y, s, pop }) => {
  if (pop <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(-6) scale(${s * (1.4 - 0.4 * pop)})`} opacity={Math.min(1, pop * 1.5)}>
      <path d="M -50 -70 Q -50 -112 0 -112 Q 50 -112 50 -70" fill="none" stroke={C.accent2} strokeWidth={12} strokeLinecap="round" />
      <rect x={-95} y={-75} width={190} height={150} rx={26} fill={C.accent} stroke={C.bg0} strokeWidth={3} />
      <path d="M -95 -30 Q 0 15 95 -30 L 95 -50 Q 95 -75 70 -75 L -70 -75 Q -95 -75 -95 -50 Z" fill={C.accent2} stroke={C.bg0} strokeWidth={3} />
      <rect x={-16} y={-14} width={32} height={34} rx={6} fill={C.warm} stroke={C.bg0} strokeWidth={3} />
      <rect x={-70} y={36} width={140} height={10} rx={5} fill={alpha(C.bg0, 0.3)} />
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

const BOOK_COLOURS = [C.accent, C.ok, C.warm, C.accent2, C.accentText, C.muted, C.ok, C.accent];

export const HeadShelf: React.FC<AnimProps & HeadShelfProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);
  const { k } = L.head;
  const tf = (x: number, y: number) => ({ x: L.head.x + k * (x - 540), y: L.head.y + k * (y - 320) });
  // The slip: start, glass and bounce-out points ride with the head; it lands on this format's desk.
  const st = tf(SLIP_PATH.start.x, SLIP_PATH.start.y);
  const dr = tf(SLIP_PATH.door.x, SLIP_PATH.door.y);
  const ot = tf(SLIP_PATH.out.x, SLIP_PATH.out.y);
  const { fly, back, fall } = s.path;
  const slipX = st.x + (dr.x - st.x) * fly + (ot.x - dr.x) * back + (L.land.x - ot.x) * fall;
  const slipY = st.y + (dr.y - st.y) * fly + (ot.y - dr.y) * back + (L.land.y - ot.y) * fall;
  const slipW = lerp(250 * k, 250, fall);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        {L.floor && <Floor y={L.floor.y} x={L.floor.x} w={L.floor.w} />}
        <g transform={`translate(${L.head.x - 540 * k} ${L.head.y - 320 * k}) scale(${k})`}>
          {/* body and neck under the big head */}
          <rect x={400} y={790} width={280} height={L.body} rx={50} fill={C.card} stroke={C.accentText} strokeWidth={8} />
          <rect x={500} y={772} width={80} height={40} rx={10} fill={C.bg1} stroke={C.accentText} strokeWidth={6} />
          {/* the head: antenna, shell, the bookshelf behind glass doors, eyes */}
          <line x1={540} y1={H.y} x2={540} y2={H.y - 36} stroke={C.accentText} strokeWidth={9} />
          <circle cx={540} cy={H.y - 44} r={14} fill={C.accentText} />
          <rect x={H.x} y={H.y} width={H.w} height={H.h} rx={80} fill={C.card} stroke={C.accentText} strokeWidth={9} />
          <g style={glow(C.accentText, 0.6 * s.books)}>
            <BookShelf x={H.shelf.x} y={H.shelf.y} w={H.shelf.w} h={H.shelf.h} lit={0.25 + 0.75 * s.books} doors={s.doors} flash={s.bounce} />
          </g>
          {/* books streaming in from the left, one after another */}
          {Array.from({ length: STREAM_BOOKS }, (_, i) => {
            const q = Math.min(1, Math.max(0, s.stream * (1 + STREAM_BOOKS * 0.12) - i * 0.12));
            if (q <= 0 || q >= 1) return null;
            const from = { x: L.streamFrom.x, y: L.streamFrom.y0 + (i % 4) * L.streamFrom.dy };
            const to = { x: H.shelf.x + 30 + i * 50, y: H.shelf.y + 100 };
            return (
              <rect
                key={i}
                x={lerp(from.x, to.x, q) - 18}
                y={lerp(from.y, to.y, q) - 40 * Math.sin(Math.PI * q) - 50}
                width={36}
                height={100}
                rx={5}
                fill={alpha(BOOK_COLOURS[i], 0.9)}
                stroke={alpha(C.bg0, 0.6)}
                strokeWidth={2}
                transform={`rotate(${-30 + 30 * q} ${lerp(from.x, to.x, q)} ${lerp(from.y, to.y, q)})`}
                opacity={1 - Math.max(0, (q - 0.85) / 0.15)}
              />
            );
          })}
          {s.bounce > 0 && <circle cx={600} cy={520} r={40 + 70 * s.bounce} fill="none" stroke={alpha(C.marker, 0.8 * s.bounce)} strokeWidth={6} />}
          <Lock x={540} y={470} pop={s.lock} />
          <ellipse cx={450} cy={690} rx={34} ry={34} fill={C.accentText} />
          <ellipse cx={630} cy={690} rx={34} ry={34} fill={C.accentText} />
          <rect x={505} y={748} width={70} height={10} rx={5} fill={alpha(C.muted, 0.7)} />
        </g>
        <Satchel x={L.satchel.x} y={L.satchel.y} s={L.satchel.s} pop={s.cap} />
        {/* the desk the slip ends up on */}
        <Desk x={L.desk.x} y={L.desk.y} w={L.desk.w} glowA={0.5 * s.desk} />
        <Slip x={slipX} y={slipY} w={slipW} rot={s.slip.rot} opacity={s.slip.opacity} />
      </Frame>
    </AbsoluteFill>
  );
};
