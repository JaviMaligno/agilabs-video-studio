// The flaw in my own test (rows 45-47): form vs record on the same model and seeds, the replay of
// the pallet the old message named leaving earlier, and the bars redrawn with the fixed message.
// See CorrectionReplay.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { EPISODES, FIXED_TAG, FORM, HEADER, REPLAY_TAG, frameState, type CorrectionReplayProps } from './CorrectionReplay.state.ts';
import { Badge, Crate, Floor, Frame, Rack, Robot, Slip, glow } from './office.tsx';
import { place } from './canvas.ts';

export { frameState };
export type { CorrectionReplayProps };

/**
 * Layout (frame pixels), per format.
 * - landscape: the bars at the left; the replay panel top right, the robot under it and the slip
 *   beside the robot.
 * - vertical: the bars on top, the replay panel in the middle, the robot and the slip at the bottom.
 */
const LAYOUT = {
  v: {
    bars: { x: 100, maxW: 600, headerY: 300, rows: [400, 560], h: 64, label: 40, value: 52, valueX: 730, tagY: 700 },
    question: { x: 900, y: 600 },
    panel: { x: 80, y: 730, w: 920, h: 290 },
    rack: { x: 150, y: 800, w: 340, h: 170 },
    exitX: 880,
    door: { x: 900, y: 830, w: 70, h: 140 },
    floor: { y: 1310, x: 60, w: 960 },
    robot: { x: 250, s: 0.42 },
    slip: { x: 640, y: 1200, w: 300 },
    rq: { x: 380, y: 1120 },
  },
  l: {
    bars: { x: 200, maxW: 580, headerY: 300, rows: [400, 580], h: 70, label: 40, value: 56, valueX: 806, tagY: 730 },
    question: { x: 980, y: 640 },
    panel: { x: 1000, y: 160, w: 740, h: 340 },
    rack: { x: 1080, y: 235, w: 340, h: 190 },
    exitX: 1640,
    door: { x: 1640, y: 285, w: 80, h: 140 },
    floor: { y: 806, x: 1000, w: 740 },
    robot: { x: 1180, s: 0.55 },
    slip: { x: 1520, y: 690, w: 300 },
    rq: { x: 1330, y: 600 },
  },
};

export const CorrectionReplay: React.FC<AnimProps & CorrectionReplayProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const L = place(p.vertical, LAYOUT);
  const B = L.bars;
  const R = L.rack;
  const bw = R.w / 2;
  const crate = { w: bw * 0.66, h: R.h * 0.4 };
  const start = R.x + bw / 2;
  const cx = lerp(start, L.exitX, s.replay.leave);
  const cy = R.y + R.h;
  const crateOp = 1 - Math.max(0, (s.replay.leave - 0.85) / 0.15);
  const robotY = L.floor.y - L.robot.s * 452;
  const rs = L.robot.s;
  const slipH = L.slip.w * 0.36;
  const icon = { x: L.slip.x + L.slip.w / 2 - 20, y: L.slip.y - slipH / 2 + 6 };
  const row = (i: number, label: string, value: number, text: string, color: string, grow: number) => {
    const y = B.rows[i];
    const w = B.maxW * (value / EPISODES) * grow;
    return (
      <g>
        <text x={B.x} y={y - 18} fontSize={B.label} fontWeight={800} fill={C.text}>
          {label}
        </text>
        <rect x={B.x} y={y} width={B.maxW} height={B.h} rx={12} fill={alpha(C.muted, 0.12)} />
        {w > 1 && <rect x={B.x} y={y} width={w} height={B.h} rx={12} fill={color} />}
        <text x={B.valueX} y={y + B.h / 2 + B.value * 0.36} fontSize={B.value} fontWeight={800} fill={C.text} opacity={grow > 0.5 ? 1 : 0}>
          {text}
        </text>
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame vertical={p.vertical} design="both">
        {/* the bars, same model and seeds */}
        <g opacity={s.bars.opacity}>
          <text x={B.x} y={B.headerY} fontSize={32} fontWeight={700} fill={C.muted} opacity={s.header}>
            {HEADER}
          </text>
          {row(0, 'form', FORM, `${FORM}/${EPISODES}`, C.accent, s.bars.form)}
          {row(1, "day's record", s.bars.recordValue, s.bars.text, s.fixedTag > 0 ? C.ok : alpha(C.accentText, 0.6), s.bars.record)}
          {s.fixedTag > 0 && (
            <g opacity={s.fixedTag}>
              <rect x={B.x} y={B.tagY - 38} width={250} height={54} rx={27} fill={alpha(C.ok, 0.18)} stroke={C.ok} strokeWidth={3} />
              <text x={B.x + 125} y={B.tagY - 2} textAnchor="middle" fontSize={30} fontWeight={800} fill={C.ok}>
                {FIXED_TAG}
              </text>
            </g>
          )}
        </g>
        {s.question > 0 && (
          <text x={L.question.x} y={L.question.y} textAnchor="middle" fontSize={140} fontWeight={800} fill={C.warm} opacity={s.question}>
            ?
          </text>
        )}
        {/* the replay: the pallet the message names, leaving earlier */}
        {s.replay.opacity > 0 && (
          <g opacity={s.replay.opacity}>
            <rect x={L.panel.x} y={L.panel.y} width={L.panel.w} height={L.panel.h} rx={20} fill={alpha(C.bg1, 0.9)} stroke={alpha(C.accentText, 0.6)} strokeWidth={4} strokeDasharray="16 10" />
            <text x={L.panel.x + 24} y={L.panel.y + 44} fontSize={28} fontWeight={800} fill={C.muted}>
              {REPLAY_TAG}
            </text>
            <Rack x={R.x} y={R.y} w={R.w} h={R.h} bays={2} pallets={[0, 1]} upper={false} s={0.8} />
            <rect x={L.door.x} y={L.door.y} width={L.door.w} height={L.door.h} rx={6} fill={C.bg0} stroke={alpha(C.muted, 0.7)} strokeWidth={4} />
            <g opacity={crateOp}>
              <Crate x={cx} y={cy} w={crate.w} h={crate.h} />
              <rect x={cx - crate.w / 2 - 8} y={cy - crate.h - 8} width={crate.w + 16} height={crate.h + 16} rx={10} fill="none" stroke={C.marker} strokeWidth={4} />
            </g>
          </g>
        )}
        <Floor y={L.floor.y} x={L.floor.x} w={L.floor.w} />
        <Robot x={L.robot.x} y={robotY} s={rs} blink={s.robot.blink} />
        {/* the frown */}
        {s.robot.frown > 0 && (
          <g opacity={s.robot.frown} stroke={C.text} strokeWidth={6} strokeLinecap="round">
            <line x1={L.robot.x - 72 * rs} y1={robotY + 92 * rs} x2={L.robot.x - 22 * rs} y2={robotY + 106 * rs} />
            <line x1={L.robot.x + 72 * rs} y1={robotY + 92 * rs} x2={L.robot.x + 22 * rs} y2={robotY + 106 * rs} />
          </g>
        )}
        {s.robot.question > 0 && (
          <text x={L.rq.x} y={L.rq.y} textAnchor="middle" fontSize={100} fontWeight={800} fill={C.warm} opacity={s.robot.question}>
            ?
          </text>
        )}
        {/* the slip, with the pallet it names clipped to it */}
        <Slip x={L.slip.x} y={L.slip.y} w={L.slip.w} rot={-4} opacity={s.slip.opacity} />
        {s.slip.icon > 0 && (
          <g opacity={s.slip.icon * s.slip.opacity} style={glow(C.marker, 0.4)}>
            <rect x={icon.x - 46} y={icon.y - 74} width={92} height={80} rx={10} fill={C.bg0} stroke={C.marker} strokeWidth={4} />
            <Crate x={icon.x} y={icon.y - 6} w={66} h={54} />
          </g>
        )}
        {s.slip.link > 0 && s.replay.opacity > 0 && crateOp > 0 && (
          <line x1={icon.x} y1={icon.y - 74} x2={cx} y2={cy + 10} stroke={C.marker} strokeWidth={3} strokeDasharray="8 8" opacity={s.slip.link * crateOp * 0.8} />
        )}
        <Badge x={L.slip.x + L.slip.w / 2 + 10} y={L.slip.y - slipH / 2 - 10} r={30} kind="tick" pop={s.slip.tick} />
      </Frame>
    </AbsoluteFill>
  );
};
