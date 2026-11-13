// The filing cabinet: a notebook it can search by keyword (rows 27-32). See FilingCabinet.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { CAB, DRAWER_TAGS, LINE_TEXT, SLIP_DRAWER, STAT_TEXT, frameState, type FilingCabinetProps } from './FilingCabinet.state.ts';
import { Badge, Cabinet, Crate, Desk, Floor, Frame, Lens, Page, Rack, Robot, Slip } from './office.tsx';
import { place } from './canvas.ts';

export { frameState };
export type { FilingCabinetProps };

/**
 * Layout (frame pixels), per format. `cab` places the cabinet group (the cabinet, its magnifier
 * and drawer tags, laid out around CAB in vertical pixels) at (x, y) scaled by k.
 * - vertical: the cabinet at the left, the robot behind its desk at the right, the inset above.
 * - landscape: one floor; the cabinet at the left, the desk in the middle, the robot beside it on
 *   the right, the warehouse panels at the top right, the closing line across the top.
 */
const LAYOUT = {
  v: {
    cab: { x: CAB.x, y: CAB.y, k: 1 },
    floor: { y: 1134, x: 60, w: 960 },
    desk: { x: 620, y: 960, w: 380 },
    robot: { x: 840, y: 580, s: 0.82 },
    pile: { x: 800, base: 895 },
    slip: { x: 740, y: 920 },
    inset: { x: 640, y: 290, w: 330, h: 140 },
    callback: { x: 560, y: 250, w: 420, h: 170 },
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
    inset: { x: 1470, y: 175, w: 270, h: 120 },
    callback: { x: 1150, y: 170, w: 560, h: 210 },
    inbox: { x: 900, y: 330 },
    stat: { x: 1605, y: 412, size: 40, anchor: 'middle' as 'middle' | 'start' },
    line: { x: 960, y: [200], size: 48 },
  },
};

/** Mouth of the slip's drawer (cabinet pixels): where swept pages go in. */
const MOUTH = { x: CAB.x + CAB.w + 60, y: CAB.y + (SLIP_DRAWER + 0.5) * (CAB.h / CAB.drawers) - 40 };
const PAGES = 7;

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
  // The inset: the pallet goes onto the wrong shelf (shelf 0 was the empty one).
  const bw = F.inset.w / 3;
  const target = { x: F.inset.x + 2.5 * bw, y: F.inset.y + F.inset.h };
  const from = { x: F.inset.x - 40, y: F.inset.y + F.inset.h - 90 };
  const palX = lerp(from.x, target.x, s.inset.move);
  const palY = lerp(from.y, target.y, s.inset.move) - 70 * Math.sin(Math.PI * s.inset.move);
  // The callback panel: the cold open's rack, the pallet gliding past shelf 0 to the last bay.
  const cb = F.callback;
  const rack = { x: cb.x + 40, y: cb.y + 26, w: cb.w - 80, h: cb.h - 90 };
  const cbw = rack.w / 4;
  const cbX = lerp(rack.x - cbw * 0.2, rack.x + 3.5 * cbw, s.callback.move);
  const cbLanded = s.callback.move >= 1;
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
          return <Page key={i} x={q.x} y={q.y} w={220} rot={((i * 29) % 13) - 6} opacity={q.op} scale={q.scale} />;
        })}
        <Slip x={slip.x} y={slip.y} w={210 * slip.scale} rot={-4} opacity={slip.op * s.slip.opacity} />
        <Envelope x={inbox.x} y={inbox.y} s={inbox.s} opacity={s.inbox.opacity * (1 - Math.max(0, (s.inbox.into - 0.8) / 0.2))} />
        {s.inset.opacity > 0 && (
          <g opacity={s.inset.opacity}>
            <Rack x={F.inset.x} y={F.inset.y} w={F.inset.w} h={F.inset.h} pallets={[0, 1, 0]} upper={false} s={0.75} />
            <Crate x={palX} y={palY} w={bw * 0.62} h={F.inset.h * 0.45} />
            <Badge x={target.x} y={F.inset.y + 10} r={30} kind="cross" pop={s.inset.cross} />
          </g>
        )}
        {s.callback.opacity > 0 && (
          <g opacity={s.callback.opacity}>
            <rect x={cb.x} y={cb.y - 10} width={cb.w} height={cb.h + 10} rx={18} fill={alpha(C.bg0, 0.85)} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} />
            <Rack x={rack.x} y={rack.y} w={rack.w} h={rack.h} bays={4} pallets={[0, 1, 1, cbLanded ? 1 : 0]} ghost={1} glowA={1} glowColor={C.ok} upper={false} s={0.7} />
            {!cbLanded && <Crate x={cbX} y={rack.y + rack.h} w={cbw * 0.66} h={rack.h * 0.4} />}
            <Badge x={rack.x + 3.5 * cbw} y={rack.y + rack.h * 0.45} r={26} kind="cross" pop={s.callback.cross} />
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
