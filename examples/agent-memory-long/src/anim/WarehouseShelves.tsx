// The warehouse the robot runs (the cold open, rows 1-2). See WarehouseShelves.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { BAYS, HERE_TEXT, LANDING_BAY, frameState, type WarehouseShelvesProps } from './WarehouseShelves.state.ts';
import { Badge, Clock, Crate, Desk, Floor, Frame, Rack, Robot, Slip } from './office.tsx';
import { place } from './canvas.ts';

export { frameState };
export type { WarehouseShelvesProps };

/**
 * Layout (frame pixels), per format. The robot's x comes from the state in vertical pixels;
 * `robotX` maps it onto the format's floor (x' = a + b·x).
 * - vertical: the rack at the top, the desk and the clock at the right, the floor under both.
 * - landscape: one wide floor; "next pallet → here" pointing into shelf 0 from the left, the rack,
 *   the robot's desk on the right with the clock on the wall above it; everything above the hook
 *   panel of the cold open. The new pallet glides along the floor in front of the rack, past
 *   shelf 0, and is lifted onto the landing bay.
 */
const LAYOUT = {
  v: {
    rack: { x: 110, y: 330, w: 600, h: 380 },
    floor: { y: 1132, x: 60, w: 960 },
    robot: { s: 0.55 },
    robotX: { a: 0, b: 1 },
    desk: { x: 770, y: 962, w: 230 },
    slip: { x: 885, from: 300, to: 922, w: 200 },
    clock: { x: 890, y: 420, r: 72 },
    here: { x: 100, y: 296, anchor: 'start' as 'start' | 'middle' | 'end', size: 36 },
  },
  l: {
    rack: { x: 480, y: 230, w: 760, h: 330 },
    floor: { y: 700, x: 180, w: 1560 },
    robot: { s: 0.5 },
    robotX: { a: 330, b: 1.5 },
    desk: { x: 1490, y: 700 - 174, w: 250 },
    slip: { x: 1615, from: 150, to: 488, w: 210 },
    clock: { x: 1615, y: 290, r: 78 },
    here: { x: 466, y: 478, anchor: 'end' as 'start' | 'middle' | 'end', size: 30 },
  },
};

export const WarehouseShelves: React.FC<AnimProps & WarehouseShelvesProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const W = place(p.vertical, LAYOUT);
  const r = s.robot;
  const robotY = W.floor.y - W.robot.s * 452;
  const rx = W.robotX.a + W.robotX.b * r.x;
  const bw = W.rack.w / BAYS;
  const plank = W.rack.y + W.rack.h;
  const glide = Math.min(1, s.pallet.move / 0.8);
  const lift = Math.max(0, (s.pallet.move - 0.8) / 0.2);
  const palX = lerp(W.rack.x - bw * 0.9, W.rack.x + (LANDING_BAY + 0.5) * bw, glide);
  const palY = lerp(W.floor.y, plank, lift);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        <Floor y={W.floor.y} x={W.floor.x} w={W.floor.w} />
        <Rack x={W.rack.x} y={W.rack.y} w={W.rack.w} h={W.rack.h} bays={BAYS} pallets={s.pallets} ghost={s.ghost} glowA={s.glow} glowColor={C.ok} />
        {/* the new pallet, gliding along the lower level, straight past shelf 0 */}
        {s.pallet.opacity > 0 && <Crate x={palX} y={palY} w={bw * 0.66} h={W.rack.h * 0.4} opacity={s.pallet.opacity} />}
        {s.here > 0 && (
          <text x={W.here.x} y={W.here.y} textAnchor={W.here.anchor} fontSize={W.here.size} fontWeight={800} fill={C.ok} opacity={s.here}>
            {HERE_TEXT}
          </text>
        )}
        <Badge x={W.rack.x + (LANDING_BAY + 0.5) * bw} y={W.rack.y + W.rack.h * 0.62} r={34} kind="cross" pop={s.cross} />
        <Clock x={W.clock.x} y={W.clock.y} r={W.clock.r} hour={s.clock.hour} minute={s.clock.minute} opacity={s.clock.opacity} />
        <Desk x={W.desk.x} y={W.desk.y} w={W.desk.w} />
        <Robot x={rx} y={robotY + r.bob * 3} s={W.robot.s} carry={r.carry} face={r.face} blink={r.blink} />
        {s.question > 0 && (
          <text x={rx} y={robotY - 50 - 20 * s.question} textAnchor="middle" fontSize={110} fontWeight={800} fill={C.warm} opacity={s.question}>
            ?
          </text>
        )}
        <Slip x={W.slip.x} y={lerp(W.slip.from, W.slip.to, s.slip.drop)} w={W.slip.w} rot={lerp(18, -6, s.slip.drop)} opacity={s.slip.opacity} glowA={s.here * 0.5} />
      </Frame>
    </AbsoluteFill>
  );
};
