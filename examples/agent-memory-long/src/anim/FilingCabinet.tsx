// The filing cabinet: a notebook it can search by keyword (rows 21-25). See FilingCabinet.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { CAB, DRAWER_TAGS, LINE_TEXT, SLIP_DRAWER, STAT_TEXT, UNASKED, frameState, type FilingCabinetProps } from './FilingCabinet.state.ts';
import { Badge, Cabinet, Desk, Floor, Frame, Lens, Page, Robot, Slip } from './office.tsx';
import { Bubble, bubbleSize } from './chat.tsx';
import { BOOKING } from './ChatTrip.state.ts';
import { place } from './canvas.ts';

export { frameState };
export type { FilingCabinetProps };

/**
 * Layout (frame pixels), per format. `cab` places the cabinet group (the cabinet, its magnifier
 * and drawer tags, laid out around CAB in vertical pixels) at (x, y) scaled by k.
 * - vertical: the cabinet at the left, the robot behind its desk at the right, the callback above.
 * - landscape: one floor; the cabinet at the left, the desk in the middle, the robot beside it on
 *   the right, the callback to the cold open at the top right, the closing line across the top.
 */
const LAYOUT = {
  v: {
    cab: { x: CAB.x, y: CAB.y, k: 1 },
    floor: { y: 1134, x: 60, w: 960 },
    desk: { x: 620, y: 960, w: 380 },
    robot: { x: 840, y: 580, s: 0.82 },
    pile: { x: 800, base: 895 },
    slip: { x: 740, y: 920 },
    callback: { x: 470, y: 270, w: 520, size: 30 },
    unasked: { x: 560, y: 470, w: 330, h: 70 },
    inbox: { x: 700, y: 400 },
    stat: { x: 300, y: 330, size: 48, anchor: 'middle' as 'middle' | 'start' },
    line: { x: 540, y: [1225, 1285], size: 46 },
  },
  l: {
    cab: { x: 300, y: 340, k: 0.85 },
    floor: { y: 800, x: 220, w: 1520 },
    desk: { x: 820, y: 626, w: 400 },
    robot: { x: 1400, y: 800 - 0.75 * 454, s: 0.75 },
    pile: { x: 1000, base: 560 },
    slip: { x: 940, y: 586 },
    callback: { x: 990, y: 190, w: 760, size: 30 },
    unasked: { x: 700, y: 250, w: 340, h: 74 },
    inbox: { x: 900, y: 330 },
    stat: { x: 1500, y: 300, size: 56, anchor: 'middle' as 'middle' | 'start' },
    line: { x: 960, y: [186], size: 48 },
  },
};

/** Mouth of the slip's drawer (cabinet pixels): where swept pages go in. */
const MOUTH = { x: CAB.x + CAB.w + 60, y: CAB.y + (SLIP_DRAWER + 0.5) * (CAB.h / CAB.drawers) - 40 };
const PAGES = 7;
/** The swept pages: the conversation, with its hotel cards, price tags and map. */
const PAGE_KINDS = ['text', 'hotel', 'text', 'price', 'map', 'text', 'hotel'] as const;

/** An envelope (the inbox), centred on (x, y). */
const Envelope: React.FC<{ x: number; y: number; s: number; opacity: number }> = ({ x, y, s, opacity }) =>
  opacity > 0 ? (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <rect x={-80} y={-55} width={160} height={110} rx={12} fill={C.card} stroke={C.accentText} strokeWidth={6} />
      <path d="M -72 -45 L 0 12 L 72 -45" fill="none" stroke={C.accentText} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={70} cy={-52} r={20} fill={C.marker} />
    </g>
  ) : null;

export const FilingCabinet: React.FC<AnimProps & FilingCabinetProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const F = place(p.vertical, LAYOUT);
  const { k } = F.cab;
  const cabT = (x: number, y: number) => ({ x: F.cab.x + k * (x - CAB.x), y: F.cab.y + k * (y - CAB.y) });
  const mouth = cabT(MOUTH.x, MOUTH.y);
  /** A swept item: from its place on the desk along an arc into the drawer, staggered by k. */
  const swept = (x0: number, y0: number, i: number) => {
    const q = Math.min(1, Math.max(0, s.sweep * 1.5 - i * 0.06));
    return {
      x: lerp(x0, mouth.x, q),
      y: lerp(y0, mouth.y, q) - 160 * Math.sin(Math.PI * q),
      scale: lerp(1, 0.55 * k, q),
      op: q >= 1 ? 0 : 1 - Math.max(0, (q - 0.8) / 0.2),
    };
  };
  const slip = swept(F.slip.x, F.slip.y, PAGES);
  // The callback panel: the cold open's wrong booking, pulsing red.
  const cb = F.callback;
  const cbBubble = bubbleSize(BOOKING, cb.size, cb.w - 60, true);
  const cbH = cbBubble.h + 60;
  const U = F.unasked;
  // The inbox folds into the cabinet's top drawer.
  const intoCab = cabT(CAB.x + CAB.w / 2, CAB.y + 60);
  const inbox = { x: lerp(F.inbox.x, intoCab.x, s.inbox.into), y: lerp(F.inbox.y, intoCab.y, s.inbox.into), s: lerp(1, 0.3, s.inbox.into) };
  const dh = CAB.h / CAB.drawers;
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        <Floor y={F.floor.y} x={F.floor.x} w={F.floor.w} />
        <Robot x={F.robot.x} y={F.robot.y} s={F.robot.s} />
        <Desk x={F.desk.x} y={F.desk.y} w={F.desk.w} glowA={0.7 * s.clean} />
        <g transform={`translate(${F.cab.x - k * CAB.x} ${F.cab.y - k * CAB.y}) scale(${k})`}>
          <Cabinet x={CAB.x} y={CAB.y} w={CAB.w} h={CAB.h} drawers={s.drawers} open={CAB.open} glowA={0.6 * s.glow} peek={s.peek} peekDrawer={SLIP_DRAWER} found={s.found} />
          {s.tags > 0 &&
            DRAWER_TAGS.map((tag, i) =>
              tag ? (
                <g key={i} opacity={s.tags}>
                  <rect x={CAB.x + 12 + (s.drawers[i] ?? 0) * CAB.open + 40} y={CAB.y + i * dh + dh - 62} width={CAB.w - 104} height={38} rx={8} fill={C.bg0} stroke={alpha(C.accentText, 0.7)} strokeWidth={3} />
                  <text x={CAB.x + 12 + (s.drawers[i] ?? 0) * CAB.open + CAB.w / 2 - 12} y={CAB.y + i * dh + dh - 34} textAnchor="middle" fontSize={26} fontWeight={800} fill={C.text}>
                    {tag}
                  </text>
                </g>
              ) : null,
            )}
          <Lens x={s.lens.x} y={s.lens.y} r={56} opacity={s.lens.opacity} question={s.lens.question} />
        </g>
        {/* what was on the desk: pages and the slip, swept into the drawer */}
        {Array.from({ length: PAGES }, (_, i) => {
          const q = swept(F.pile.x + ((i * 53) % 17) - 8, F.pile.base - i * 17, i);
          return <Page key={i} x={q.x} y={q.y} w={220} rot={((i * 29) % 13) - 6} opacity={q.op} scale={q.scale} kind={PAGE_KINDS[i % PAGE_KINDS.length]} />;
        })}
        <Slip x={slip.x} y={slip.y} w={210 * slip.scale} rot={-4} opacity={slip.op * s.slip.opacity} />
        <Envelope x={inbox.x} y={inbox.y} s={inbox.s} opacity={s.inbox.opacity * (1 - Math.max(0, (s.inbox.into - 0.8) / 0.2))} />
        {s.callback.opacity > 0 && (
          <g opacity={s.callback.opacity}>
            <rect x={cb.x} y={cb.y} width={cb.w} height={cbH} rx={22} fill={alpha(C.bg0, 0.9)} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} />
            <Bubble x={cb.x + 30} y={cb.y + 30} side="ai" text={BOOKING} size={cb.size} maxW={cb.w - 60} alert={s.callback.pulse} hot="Thursday" tick />
            <Badge x={cb.x + cb.w - 4} y={cb.y + 4} r={30} kind="cross" pop={s.callback.cross} />
          </g>
        )}
        {/* the question it never asks */}
        {s.unasked.opacity > 0 && (
          <g opacity={s.unasked.opacity}>
            <rect x={U.x} y={U.y} width={U.w} height={U.h} rx={20} fill="none" stroke={alpha(C.muted, 0.7)} strokeWidth={3} strokeDasharray="10 8" />
            <text x={U.x + U.w / 2} y={U.y + U.h / 2 + 11} textAnchor="middle" fontSize={32} fontWeight={700} fontStyle="italic" fill={C.muted}>
              {UNASKED}
            </text>
            <line x1={U.x + 18} x2={U.x + 18 + (U.w - 36) * s.unasked.strike} y1={U.y + U.h / 2} y2={U.y + U.h / 2} stroke={C.marker} strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {s.stat > 0 && (
          <text x={F.stat.x} y={F.stat.y} textAnchor={F.stat.anchor} fontSize={F.stat.size} fontWeight={800} fill={C.marker} opacity={s.stat}>
            {STAT_TEXT}
          </text>
        )}
        {s.line > 0 &&
          (F.line.y.length === 1
            ? [LINE_TEXT]
            : [LINE_TEXT.slice(0, LINE_TEXT.indexOf(' if ')), LINE_TEXT.slice(LINE_TEXT.indexOf(' if ') + 1)]
          ).map((text, i) => (
            <text key={i} x={F.line.x} y={F.line.y[i]} textAnchor="middle" fontSize={F.line.size} fontWeight={800} fill={C.text} opacity={s.line}>
              {text}
            </text>
          ))}
      </Frame>
    </AbsoluteFill>
  );
};
