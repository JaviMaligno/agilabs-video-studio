// The habit test (rows 11-12): the plan says B doesn't depend on A, the robot says so too, and the
// arrow A → B gets drawn anyway; then the slip floats down to the desk. See TwoJobs.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { HABIT_TAG, PLAN_LINE, frameState, type TwoJobsProps } from './TwoJobs.state.ts';
import { Desk, Floor, Frame, Robot, Slip, glow } from './office.tsx';
import { place } from './canvas.ts';

export { frameState };
export type { TwoJobsProps };

/**
 * Layout (frame pixels), per format. The robot, the desk, the floor and the slip's resting place are
 * the desk scene's (MemoryDesk 'work'), so the cut into chapter 2 does not jump.
 * - landscape: the plan card top left, the schedule board in the middle, the bubble over the robot.
 * - vertical: the plan card top left, the bubble top right over the robot, the board under the plan.
 */
const LAYOUT = {
  v: {
    floor: { y: 1176, x: 60, w: 960 },
    desk: { x: 140, y: 1000, w: 800 },
    robot: { x: 830, y: 560, s: 0.9 },
    slip: { x: 370, from: 260, to: 958, w: 220 },
    plan: { x: 90, y: 262, w: 520, h: 330, size: 34 },
    bubble: { x: 560, y: 262, w: 450, h: 150, tail: { x: 790, y: 500 }, size: 30 },
    board: { x: 90, y: 650, w: 600, h: 230 },
  },
  l: {
    floor: { y: 806, x: 300, w: 1440 },
    desk: { x: 480, y: 630, w: 800 },
    robot: { x: 1500, y: 806 - 0.8 * 454, s: 0.8 },
    slip: { x: 710, from: 150, to: 588, w: 220 },
    plan: { x: 200, y: 175, w: 470, h: 330, size: 32 },
    bubble: { x: 950, y: 175, w: 490, h: 130, tail: { x: 1420, y: 400 }, size: 34 },
    board: { x: 740, y: 400, w: 580, h: 220 },
  },
};

const Tile: React.FC<{ x: number; y: number; w: number; h: number; name: string; color?: string }> = ({ x, y, w, h, name, color = C.accentText }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={14} fill={C.card} stroke={color} strokeWidth={4} />
    <text x={x + w / 2} y={y + h / 2 + 22} textAnchor="middle" fontSize={60} fontWeight={800} fill={C.text}>
      {name}
    </text>
  </g>
);

export const TwoJobs: React.FC<AnimProps & TwoJobsProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);
  const P = L.plan;
  const Bu = L.bubble;
  const Bo = L.board;
  const tile = { w: 150, h: 120 };
  const ay = Bo.y + 70 + tile.h / 2;
  const aFrom = Bo.x + 40 + tile.w;
  const aTo = Bo.x + Bo.w - 40 - tile.w;
  const aEnd = lerp(aFrom + 10, aTo - 10, s.arrow.draw);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        <Floor y={L.floor.y} x={L.floor.x} w={L.floor.w} />
        {/* the plan card */}
        {s.plan.opacity > 0 && (
          <g opacity={s.plan.opacity}>
            <rect x={P.x} y={P.y} width={P.w} height={P.h} rx={18} fill={alpha(C.text, 0.92)} stroke={alpha(C.bg0, 0.5)} strokeWidth={2} />
            <rect x={P.x} y={P.y} width={P.w} height={56} rx={16} fill={C.accent} />
            <rect x={P.x} y={P.y + 36} width={P.w} height={20} fill={C.accent} />
            <text x={P.x + 28} y={P.y + 40} fontSize={30} fontWeight={800} fill={C.text} letterSpacing={2}>
              PLAN
            </text>
            {['job A', 'job B'].map((job, i) => (
              <g key={job}>
                <rect x={P.x + 28} y={P.y + 82 + i * 70} width={34} height={34} rx={6} fill="none" stroke={alpha(C.bg0, 0.6)} strokeWidth={4} />
                <text x={P.x + 80} y={P.y + 111 + i * 70} fontSize={P.size} fontWeight={700} fill={C.bg0}>
                  {job}
                </text>
              </g>
            ))}
            <g style={glow(C.ok, s.plan.lit)}>
              <rect x={P.x + 18} y={P.y + 232} width={P.w - 36} height={70} rx={12} fill={alpha(C.ok, 0.2 + 0.3 * s.plan.lit)} stroke={alpha(C.ok, 0.4 + 0.6 * s.plan.lit)} strokeWidth={4} />
              <text x={P.x + P.w / 2} y={P.y + 279} textAnchor="middle" fontSize={P.size} fontWeight={800} fill={C.bg0}>
                {PLAN_LINE}
              </text>
            </g>
          </g>
        )}
        {/* the schedule board: A and B side by side; the arrow A → B drawn anyway */}
        {s.board.opacity > 0 && (
          <g opacity={s.board.opacity}>
            <rect x={Bo.x} y={Bo.y} width={Bo.w} height={Bo.h} rx={18} fill={alpha(C.bg1, 0.9)} stroke={alpha(C.accentText, 0.5)} strokeWidth={3} />
            <text x={Bo.x + 24} y={Bo.y + 42} fontSize={26} fontWeight={700} fill={C.muted} letterSpacing={1}>
              ORDER OF WORK
            </text>
            <Tile x={Bo.x + 40} y={Bo.y + 70} w={tile.w} h={tile.h} name="A" />
            <Tile x={Bo.x + Bo.w - 40 - tile.w} y={Bo.y + 70} w={tile.w} h={tile.h} name="B" color={s.arrow.draw > 0.95 ? C.marker : C.accentText} />
            {s.arrow.draw > 0 && (
              <g style={glow(C.marker, 0.4 + 0.6 * s.arrow.flash)}>
                <line x1={aFrom + 10} y1={ay} x2={aEnd} y2={ay} stroke={C.marker} strokeWidth={10} strokeLinecap="round" />
                {s.arrow.draw > 0.9 && <path d={`M ${aTo - 34} ${ay - 22} L ${aTo - 6} ${ay} L ${aTo - 34} ${ay + 22}`} fill="none" stroke={C.marker} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
              </g>
            )}
            <text x={(aFrom + aTo) / 2} y={ay + 56} textAnchor="middle" fontSize={30} fontWeight={700} fontStyle="italic" fill={C.marker} opacity={s.arrow.tag}>
              {HABIT_TAG}
            </text>
          </g>
        )}
        {/* the desk of chapter 2, fading in */}
        {s.desk > 0 && (
          <g opacity={s.desk}>
            <Desk x={L.desk.x} y={L.desk.y} w={L.desk.w} />
          </g>
        )}
        <Robot x={L.robot.x} y={L.robot.y} s={L.robot.s} blink={s.robot.blink} />
        {/* the robot repeats the plan */}
        {s.bubble.opacity > 0 && (
          <g opacity={s.bubble.opacity}>
            <path
              d={`M ${Bu.x + 24} ${Bu.y} H ${Bu.x + Bu.w - 24} Q ${Bu.x + Bu.w} ${Bu.y} ${Bu.x + Bu.w} ${Bu.y + 24} V ${Bu.y + Bu.h - 24} Q ${Bu.x + Bu.w} ${Bu.y + Bu.h} ${Bu.x + Bu.w - 24} ${Bu.y + Bu.h} H ${Bu.tail.x - 10} L ${Bu.tail.x} ${Bu.tail.y} L ${Bu.tail.x - 60} ${Bu.y + Bu.h} H ${Bu.x + 24} Q ${Bu.x} ${Bu.y + Bu.h} ${Bu.x} ${Bu.y + Bu.h - 24} V ${Bu.y + 24} Q ${Bu.x} ${Bu.y} ${Bu.x + 24} ${Bu.y} Z`}
              fill={C.card}
              stroke={C.accentText}
              strokeWidth={4}
            />
            <text x={Bu.x + Bu.w / 2} y={Bu.y + Bu.h / 2 + Bu.size * 0.36} textAnchor="middle" fontSize={Bu.size} fontWeight={800} fill={C.ok}>
              {`“${PLAN_LINE.slice(0, Math.ceil(PLAN_LINE.length * s.bubble.write))}${s.bubble.write >= 1 ? '”' : ''}`}
            </text>
          </g>
        )}
        <Slip x={L.slip.x} y={lerp(L.slip.from, L.slip.to, s.slip.drop)} w={L.slip.w} rot={lerp(16, -4, s.slip.drop)} opacity={s.slip.opacity} glowA={0.4 * (1 - s.slip.drop)} />
      </Frame>
    </AbsoluteFill>
  );
};
