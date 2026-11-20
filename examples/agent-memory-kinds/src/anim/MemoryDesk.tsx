// The desk: working memory, and the summary notecard (scenes 6-7). See MemoryDesk.state.ts.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, alpha } from '../brand.ts';
import { fontFamily } from '../theme.ts';
import type { AnimProps } from './types.ts';
import { lerp } from './memory.ts';
import { CARD_TEXT, MAX_PAGES, frameState, type MemoryDeskProps } from './MemoryDesk.state.ts';
import { Badge, Crate, Desk, Floor, Frame, Gauge, Notecard, Page, Rack, Robot, Slip } from './office.tsx';

export { frameState };
export type { MemoryDeskProps };

const D = {
  floor: 1176,
  desk: { x: 140, y: 1000, w: 800 },
  robot: { x: 830, y: 560, s: 0.9 },
  pile: { x: 400, base: 935 },
  slip: { x: 370, y: 958 },
  card: { x: 560, y: 905, w: 320 },
  gauge: { x: 230, y: 450, r: 84 },
  bubble: { x: 330, y: 520, w: 320, h: 170 },
  inset: { x: 660, y: 300, w: 300, h: 150 },
} as const;

/** Deterministic jitter per page. */
const jx = (k: number) => ((k * 53) % 17) - 8;
const jr = (k: number) => ((k * 29) % 13) - 6;
/** Pages from this index on slide off the left edge when the desk overflows. */
const SPILL_FROM = 7;

/** A speech bubble (a meeting); its words dissolve with `fade`, leaving the gist. */
const Bubble: React.FC<{ opacity: number; fade: number }> = ({ opacity, fade }) => {
  if (opacity <= 0) return null;
  const { x, y, w, h } = D.bubble;
  return (
    <g opacity={opacity}>
      <path
        d={`M ${x + 30} ${y} H ${x + w - 30} Q ${x + w} ${y} ${x + w} ${y + 30} V ${y + h - 30} Q ${x + w} ${y + h} ${x + w - 30} ${y + h} H ${x + 120} L ${x + 70} ${y + h + 50} L ${x + 80} ${y + h} H ${x + 30} Q ${x} ${y + h} ${x} ${y + h - 30} V ${y + 30} Q ${x} ${y} ${x + 30} ${y} Z`}
        fill={C.card}
        stroke={C.accentText}
        strokeWidth={5}
      />
      {[0, 1, 2].map((i) =>
        [0, 1, 2, 3].map((j) => (
          <rect
            key={`${i}${j}`}
            x={x + 30 + j * 68}
            y={y + 34 + i * 40}
            width={52 - ((i + j) % 3) * 8}
            height={14}
            rx={7}
            fill={alpha(C.muted, 0.85)}
            opacity={Math.max(0, 1 - fade * (1.6 - 0.15 * ((i * 4 + j) % 5)))}
            transform={`translate(0 ${-20 * fade})`}
          />
        )),
      )}
      {fade > 0 && (
        <path d={`M ${x + w * 0.7} ${y + h + 10} Q ${x + w * 0.85} ${y + h + 140} ${D.card.x - 60} ${D.card.y - 90}`} fill="none" stroke={C.ok} strokeWidth={6} strokeDasharray="12 10" opacity={fade} />
      )}
    </g>
  );
};

export const MemoryDesk: React.FC<AnimProps & MemoryDeskProps> = (p) => {
  const s = frameState(p, p.t, p.beats, p.dur);
  const whole = Math.floor(s.pages);
  const part = s.pages - whole;
  const n = Math.min(MAX_PAGES, whole + (part > 0 ? 1 : 0));
  const pages = Array.from({ length: n }, (_, k) => {
    const landing = k === whole ? part : 1;
    let x = D.pile.x + jx(k);
    let y = D.pile.base - k * 17 - 140 * (1 - landing);
    let rot = jr(k);
    let op = landing;
    let scale = 1;
    if (k >= SPILL_FROM && s.spill > 0) {
      const q = s.spill * (1 - s.squeeze);
      x -= q * (330 + 30 * (k - SPILL_FROM));
      y += q * q * (210 + 25 * (k - SPILL_FROM)) + q * 40 * (k - SPILL_FROM);
      rot -= 50 * q;
    }
    if (s.squeeze > 0) {
      x = lerp(x, D.card.x, s.squeeze);
      y = lerp(y, D.card.y, s.squeeze);
      scale = lerp(1, 0.45, s.squeeze);
      op *= 1 - s.squeeze;
    }
    return { x, y, rot, op, scale, k };
  });
  // The inset: the new pallet goes to shelf 0.
  const bw = D.inset.w / 3;
  const target = { x: D.inset.x + bw / 2, y: D.inset.y + D.inset.h };
  const from = { x: D.inset.x - 40, y: D.inset.y + D.inset.h - 90 };
  const palX = lerp(from.x, target.x, s.inset.move);
  const palY = lerp(from.y, target.y, s.inset.move) - 60 * Math.sin(Math.PI * s.inset.move);
  return (
    <AbsoluteFill style={{ fontFamily }}>
      <Frame>
        <Floor y={D.floor} />
        <Gauge x={D.gauge.x} y={D.gauge.y} r={D.gauge.r} level={s.gauge} amber={s.amber} />
        <Robot x={D.robot.x} y={D.robot.y} s={D.robot.s} blink={0} />
        <Desk x={D.desk.x} y={D.desk.y} w={D.desk.w} lit={0.6 + 0.4 * s.deskLit} glowA={0.45 * s.deskLit * (1 - s.amber)} />
        <Slip x={D.slip.x} y={D.slip.y} w={220} rot={-4} opacity={s.slip.opacity} />
        {pages.map((pg) => (
          <Page key={pg.k} x={pg.x} y={pg.y} w={230} rot={pg.rot} opacity={pg.op} scale={pg.scale} />
        ))}
        <Notecard x={D.card.x} y={D.card.y} w={D.card.w} opacity={s.card.opacity} text={CARD_TEXT} write={s.card.write} />
        <Bubble opacity={s.bubble.opacity} fade={s.bubble.fade} />
        {s.inset.opacity > 0 && (
          <g opacity={s.inset.opacity}>
            <Rack x={D.inset.x} y={D.inset.y} w={D.inset.w} h={D.inset.h} pallets={[0, 1, 0]} upper={false} s={0.7} />
            <Crate x={palX} y={palY} w={bw * 0.62} h={D.inset.h * 0.45} />
            <Badge x={target.x + 70} y={D.inset.y + 30} r={30} kind="tick" pop={s.inset.tick} />
          </g>
        )}
      </Frame>
    </AbsoluteFill>
  );
};
