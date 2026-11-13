// Restart vs iterate (rows 17-18): a robot sweeping its bench clean against one patching its
// half-built thing, and the share of tasks each solved. See RestartIterate.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { BARS, BARS_CAPTION, BROOM_FROM, PATCH_LABEL, SLOTS, SWEEP_LABEL, THING_AT, frameState, type RestartIterateProps } from './RestartIterate.state.ts';
import { Badge, Crack, Desk, Frame, Page, Robot, glow } from './office.tsx';
import { place } from './canvas.ts';

export { frameState };
export type { RestartIterateProps };

/**
 * Layout (frame pixels), per format. A lane is 300 px tall from its top: label, then the robot
 * and its bench on the lane's floor.
 * - landscape: the two lanes stacked at the left, the bars at the right.
 * - vertical: the two lanes stacked on top, the bars under them.
 */
const LAYOUT = {
  v: {
    lanes: [250, 575],
    x: 80,
    w: 920,
    robot: { x: 330, s: 0.5 },
    desk: { x: 450, w: 540 },
    bars: { x: 100, maxW: 700, captionY: 960, y0: 1050, gap: 160, h: 56, label: 36, value: 44 },
  },
  l: {
    lanes: [160, 495],
    x: 190,
    w: 920,
    robot: { x: 420, s: 0.5 },
    desk: { x: 540, w: 540 },
    bars: { x: 1190, maxW: 440, captionY: 330, y0: 440, gap: 170, h: 56, label: 34, value: 42 },
  },
};

const BLOCK = 52;
/** Slot i of the thing: the bottom row of three, then the top row of two. */
const slot = (i: number) => (i < 3 ? { dx: (i - 1) * (BLOCK + 4), row: 0 } : { dx: (i - 3.5) * (BLOCK + 4), row: 1 });

/** The half-built thing on the bench: `blocks` built (fraction = the next one landing), the rest dashed. */
const Thing: React.FC<{ x: number; y: number; blocks: number; crack: number; opacity?: number }> = ({ x, y, blocks, crack, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const whole = Math.floor(blocks);
  const part = blocks - whole;
  return (
    <g opacity={opacity}>
      {Array.from({ length: SLOTS }, (_, i) => {
        const { dx, row } = slot(i);
        const bx = x + dx - BLOCK / 2;
        const by = y - (row + 1) * (BLOCK + 4);
        const built = i < whole;
        const landing = i === whole && part > 0;
        if (!built && !landing)
          return <rect key={i} x={bx} y={by} width={BLOCK} height={BLOCK} rx={8} fill="none" stroke={alpha(C.muted, 0.6)} strokeWidth={3} strokeDasharray="8 6" />;
        const drop = landing ? (1 - part) * 70 : 0;
        return (
          <g key={i} opacity={landing ? part : 1}>
            <rect x={bx} y={by - drop} width={BLOCK} height={BLOCK} rx={8} fill={alpha(C.accent, 0.75)} stroke={C.accentText} strokeWidth={3} />
            <text x={bx + BLOCK / 2} y={by - drop + BLOCK / 2 + 9} textAnchor="middle" fontSize={24} fontWeight={800} fill={C.text}>
              {'{ }'}
            </text>
          </g>
        );
      })}
      <Crack x={x - 70} y={y - BLOCK - 10} w={150} h={BLOCK + 10} p={crack} />
    </g>
  );
};

export const RestartIterate: React.FC<AnimProps & RestartIterateProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);
  const B = L.bars;
  const lane = (k: 0 | 1) => {
    const top = L.lanes[k];
    const floor = top + 296;
    const deskY = floor - 174;
    const sweepLane = k === 0;
    const lit = sweepLane ? s.lit.sweep : s.lit.patch;
    const deskEnd = L.desk.x + L.desk.w;
    const along = (f: number) => L.desk.x + 30 + f * (L.desk.w - 60);
    const thingX = along(THING_AT);
    // Loose pages on the bench (the messy desk); in the top lane the broom pushes them off the edge.
    const pages = [0, 1].map((i) => {
      let x = along(BROOM_FROM) + 100 + i * 60;
      let y = deskY - 14 - i * 6;
      let rot = i ? 8 : -6;
      let op = 1;
      if (sweepLane && s.swept > 0) {
        x += s.swept * 360;
        if (x > deskEnd) {
          const over = x - deskEnd;
          y += over * 1.4;
          rot += over * 0.5;
          op = Math.max(0, 1 - over / 120);
        }
      }
      return { x, y, rot, op, i };
    });
    const bx = along(s.broom.pos);
    return (
      <g key={k} opacity={s.lanes}>
        <rect x={L.x} y={floor} width={L.w} height={4} rx={2} fill={alpha(C.muted, 0.25)} />
        <text x={L.x} y={top + 36} fontSize={36} fontWeight={800} fill={lit > 0.5 ? C.text : C.muted}>
          {sweepLane ? SWEEP_LABEL : PATCH_LABEL}
        </text>
        <rect x={L.x} y={top + 50} width={(sweepLane ? 180 : 190) * lit} height={6} rx={3} fill={sweepLane ? C.warm : C.ok} />
        <Robot x={L.robot.x} y={floor - L.robot.s * 452} s={L.robot.s} blink={s.blink} />
        <Desk x={L.desk.x} y={deskY} w={L.desk.w} />
        {pages.map((pg) => (
          <g key={pg.i} style={!sweepLane && s.messy > 0.01 ? glow(C.ok, s.messy) : undefined}>
            <Page x={pg.x} y={pg.y} w={96} rot={pg.rot} opacity={pg.op} />
          </g>
        ))}
        {sweepLane ? (
          <Thing x={thingX} y={deskY - 30 * s.gone} blocks={3} crack={s.crack.sweep} opacity={1 - s.gone} />
        ) : (
          <>
            <Thing x={thingX} y={deskY} blocks={s.blocks} crack={s.crack.patch} />
            <Badge x={thingX + 110} y={deskY - 130} r={26} kind="tick" pop={s.tick} />
          </>
        )}
        {/* the broom (top lane) */}
        {sweepLane && (
          <g opacity={s.broom.opacity}>
            <line x1={bx - 70} y1={deskY - 125} x2={bx} y2={deskY - 22} stroke={C.warm} strokeWidth={8} strokeLinecap="round" />
            <path d={`M ${bx - 24} ${deskY - 26} L ${bx + 22} ${deskY - 26} L ${bx + 34} ${deskY - 2} L ${bx - 32} ${deskY - 2} Z`} fill={alpha(C.warm, 0.5)} stroke={C.warm} strokeWidth={4} strokeLinejoin="round" />
          </g>
        )}
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        {lane(0)}
        {lane(1)}
        {s.bars.opacity > 0 && (
          <g opacity={s.bars.opacity}>
            <text x={B.x} y={B.captionY} fontSize={30} fontWeight={700} fill={C.muted} opacity={s.bars.caption}>
              {BARS_CAPTION}
            </text>
            {BARS.map((bar, i) => {
              const y = B.y0 + i * B.gap;
              const w = B.maxW * bar.value * s.bars.grow[i];
              const win = i === 0;
              return (
                <g key={bar.label}>
                  <text x={B.x} y={y - 18} fontSize={B.label} fontWeight={800} fill={win ? C.text : C.muted}>
                    {bar.label}
                  </text>
                  <rect x={B.x} y={y} width={B.maxW} height={B.h} rx={12} fill={alpha(C.muted, 0.12)} />
                  {w > 1 && <rect x={B.x} y={y} width={w} height={B.h} rx={12} fill={win ? C.ok : alpha(C.accentText, 0.6)} style={win ? glow(C.ok, 0.5) : undefined} />}
                  <text x={B.x + B.maxW + 16} y={y + B.h / 2 + B.value * 0.36} fontSize={B.value} fontWeight={800} fill={win ? C.ok : C.text} opacity={s.bars.grow[i] > 0.6 ? 1 : 0}>
                    {bar.display}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </Frame>
    </AbsoluteFill>
  );
};
