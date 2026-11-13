// The warehouse the robot runs (scenes 2-3). See WarehouseShelves.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { frameState, type WarehouseShelvesProps } from './WarehouseShelves.state.ts';
import { Clock, Crate, Desk, Floor, Frame, Rack, Robot, Slip } from './office.tsx';

export { frameState };
export type { WarehouseShelvesProps };

const W = {
  rack: { x: 110, y: 330, w: 600, h: 380 },
  floor: 1132,
  robot: { y: 1132 - 0.55 * 452, s: 0.55 },
  desk: { x: 770, y: 962, w: 230 },
  slip: { x: 885, from: 300, to: 922, w: 200 },
  clock: { x: 890, y: 420, r: 72 },
  belt: { x: 80, y: 1206, w: 460 },
} as const;

export const WarehouseShelves: React.FC<AnimProps & WarehouseShelvesProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const r = s.robot;
  const beltPallet = lerp(-60, W.belt.x + W.belt.w * 0.62, s.conveyor.arrive);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical}>
        <Floor y={W.floor} />
        <Rack x={W.rack.x} y={W.rack.y} w={W.rack.w} h={W.rack.h} pallets={s.pallets} ghost={s.ghost} glowA={s.glow} />
        <Clock x={W.clock.x} y={W.clock.y} r={W.clock.r} hour={s.clock.hour} minute={s.clock.minute} opacity={s.clock.opacity} />
        <Desk x={W.desk.x} y={W.desk.y} w={W.desk.w} />
        {/* the conveyor with the new pallet waiting */}
        {s.conveyor.opacity > 0 && (
          <g opacity={s.conveyor.opacity}>
            <rect x={W.belt.x} y={W.belt.y} width={W.belt.w} height={26} rx={13} fill={C.bg1} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} />
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} cx={W.belt.x + 30 + i * ((W.belt.w - 60) / 6)} cy={W.belt.y + 13} r={7} fill={alpha(C.muted, 0.7)} />
            ))}
            <Crate x={Math.max(W.belt.x + 70, beltPallet)} y={W.belt.y} w={130} h={92} opacity={Math.min(1, s.conveyor.arrive * 3)} />
          </g>
        )}
        <Robot x={r.x} y={W.robot.y + r.bob * 3} s={W.robot.s} carry={r.carry} face={r.face} blink={r.blink} />
        {s.question > 0 && (
          <text x={r.x} y={W.robot.y - 50 - 20 * s.question} textAnchor="middle" fontSize={110} fontWeight={800} fill={C.warm} opacity={s.question}>
            ?
          </text>
        )}
        <Slip x={W.slip.x} y={lerp(W.slip.from, W.slip.to, s.slip.drop)} w={W.slip.w} rot={lerp(18, -6, s.slip.drop)} opacity={s.slip.opacity} glowA={s.glow} />
      </Frame>
    </AbsoluteFill>
  );
};
