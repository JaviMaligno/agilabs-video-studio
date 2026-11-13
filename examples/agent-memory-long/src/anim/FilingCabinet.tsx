// The filing cabinet: a notebook it can search (scenes 8-9). See FilingCabinet.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { CAB, SLIP_DRAWER, frameState, type FilingCabinetProps } from './FilingCabinet.state.ts';
import { Badge, Cabinet, Crate, Desk, Floor, Frame, Lens, Page, Rack, Robot, Slip } from './office.tsx';

export { frameState };
export type { FilingCabinetProps };

const F = {
  floor: 1134,
  desk: { x: 620, y: 960, w: 380 },
  robot: { x: 840, y: 580, s: 0.82 },
  pile: { x: 800, base: 895 },
  slip: { x: 740, y: 920 },
  inset: { x: 640, y: 290, w: 330, h: 140 },
} as const;

/** Mouth of the slip's drawer: where swept pages go in. */
const mouth = { x: CAB.x + CAB.w + 60, y: CAB.y + (SLIP_DRAWER + 0.5) * (CAB.h / CAB.drawers) - 40 };
const PAGES = 7;

export const FilingCabinet: React.FC<AnimProps & FilingCabinetProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  /** A swept item: from its place on the desk along an arc into the drawer, staggered by k. */
  const swept = (x0: number, y0: number, k: number) => {
    const q = Math.min(1, Math.max(0, s.sweep * 1.4 - k * 0.06));
    return {
      x: lerp(x0, mouth.x, q),
      y: lerp(y0, mouth.y, q) - 160 * Math.sin(Math.PI * q),
      scale: lerp(1, 0.55, q),
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
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical}>
        <Floor y={F.floor} />
        <Robot x={F.robot.x} y={F.robot.y} s={F.robot.s} />
        <Desk x={F.desk.x} y={F.desk.y} w={F.desk.w} glowA={0.7 * s.clean} />
        <Cabinet x={CAB.x} y={CAB.y} w={CAB.w} h={CAB.h} drawers={s.drawers} open={CAB.open} glowA={0.6 * s.glow} peek={s.peek} peekDrawer={SLIP_DRAWER} found={s.found} />
        {/* what was on the desk: pages and the slip, swept into the drawer */}
        {Array.from({ length: PAGES }, (_, k) => {
          const q = swept(F.pile.x + ((k * 53) % 17) - 8, F.pile.base - k * 17, k);
          return <Page key={k} x={q.x} y={q.y} w={220} rot={((k * 29) % 13) - 6} opacity={q.op} scale={q.scale} />;
        })}
        <Slip x={slip.x} y={slip.y} w={210 * slip.scale} rot={-4} opacity={slip.op * s.slip.opacity} />
        <Lens x={s.lens.x} y={s.lens.y} r={56} opacity={s.lens.opacity} question={s.lens.question} />
        {s.inset.opacity > 0 && (
          <g opacity={s.inset.opacity}>
            <Rack x={F.inset.x} y={F.inset.y} w={F.inset.w} h={F.inset.h} pallets={[0, 1, 0]} upper={false} s={0.75} />
            <Crate x={palX} y={palY} w={bw * 0.62} h={F.inset.h * 0.45} />
            <Badge x={target.x} y={F.inset.y + 10} r={30} kind="cross" pop={s.inset.cross} />
          </g>
        )}
      </Frame>
    </AbsoluteFill>
  );
};
